// Shivam's 3D character, looking wherever your cursor is.
// Ported from sqaron.dev (components/shivam/HeadTracker.jsx) to plain JavaScript for this page.
// headRig.js does the drawing: real head-turn footage, warped on the GPU along measured optical flow, so the
// head moves continuously at the screen's refresh rate. This file decides where he looks: springs turn the
// head toward the cursor the way a person turns, he blinks at any angle, glances back at you now and then
// while the cursor rests, looks around on his own when nobody points, and smiles when asked to.
import { createRig } from './headRig.js';

const FACE = [0.484375, 0.35185185185185186]; // his face, as a share of the 16:9 frame
const OUT = [1096, 1080];                      // the rig's picture size
const OMEGA = 11;                              // stiffness of the turn: settles in about 0.4 s
const PITCH_GAIN = 0.55;                       // the head takes about half of a vertical look; the eyes do the rest

const rand = (a, b) => a + Math.random() * (b - a);
const deg = (r) => (r * 180) / Math.PI;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const easeIn = (t) => t * t;
const easeOut = (t) => 1 - (1 - t) * (1 - t);

/**
 * mountHead(root, canvas, { base, depth, scale, signal }) -> Promise<{ run(on), smile(on), destroy() }>
 * root: the 16:9 box the footage fills. canvas: sits in the rig's crop of that box.
 * Rejects when WebGL2 or the rig is unavailable, so the caller keeps its still picture.
 */
export async function mountHead(root, canvas, { base, depth = 0.5, scale = 1, signal } = {}) {
    const rig = await createRig(canvas, { base, scale, signal });
    const [yawLo, yawHi] = rig.yawRange;

    // ---- the canvas follows its size on screen (sharp on any display) ----
    let lastDrawn = '';
    const size = () => {
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(2, Math.min(OUT[0] * 1.5, Math.round(r.width * dpr)));
        canvas.height = Math.max(2, Math.round((canvas.width * OUT[1]) / OUT[0]));
        lastDrawn = '';
    };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    size();

    // ---- where he should look ----
    const head = { yaw: 0, vel: 0, pitch: 0, pvel: 0 };
    let pointer = null, present = false, quietSince = performance.now();
    let nextCheckIn = rand(9000, 14000), checkIn = false, settleUntil = 0;
    let glanceUntil = 0, glanceYaw = 0, glancePitch = 0, nextGlance = performance.now() + rand(2500, 5000);
    let nextBlink = performance.now() + rand(2600, 5200), blinkAt = -1, blinkAgain = false;
    let smileOn = false, smile = 0;
    let rect = null, rectAt = -Infinity;
    let running = false, raf = 0, last = 0;

    const targets = (now) => {
        if (now < settleUntil || checkIn) return [0, 0];
        if (pointer && present) {
            // a cursor that rests: every so often he looks back at you and blinks, then returns to it
            if (now - quietSince > nextCheckIn && !smileOn) {
                checkIn = true;
                quietSince = now;
                nextCheckIn = rand(9000, 14000);
                return [0, 0];
            }
            // where his face is on screen; read at most every 100 ms so a frame never waits on layout
            if (now - rectAt > 100) { rect = root.getBoundingClientRect(); rectAt = now; }
            const fx = rect.left + FACE[0] * rect.width;
            const fy = rect.top + FACE[1] * rect.height;
            const D = Math.max(220, root.offsetWidth * depth);
            return [deg(Math.atan2(pointer.x - fx, D)), deg(Math.atan2(pointer.y - fy, D)) * PITCH_GAIN];
        }
        // nobody pointing: he looks around now and then
        if (now > nextGlance) {
            glanceUntil = now + rand(900, 1900);
            glanceYaw = (Math.random() < 0.5 ? -1 : 1) * rand(10, 34);
            glancePitch = rand(-7, 6);
            nextGlance = glanceUntil + rand(2600, 6200);
        }
        return now < glanceUntil ? [glanceYaw, glancePitch] : [0, 0];
    };

    const endBlink = (now) => {
        nextBlink = now + (Math.random() < 0.15 ? rand(350, 600) : rand(2400, 5600));
        if (checkIn) { checkIn = false; settleUntil = now + rand(180, 480); }
    };

    // how closed the eyes are: quick down, a beat closed, a softer way up
    const blinkAmount = (now) => {
        if (blinkAt < 0) return 0;
        const e = now - blinkAt;
        if (e < 0) return 0;
        if (e < 75) return easeIn(e / 75);
        if (e < 125) return 1;
        if (e < 255) return 1 - easeOut((e - 125) / 130);
        if (blinkAgain) { blinkAgain = false; blinkAt = now + 110; return 0; }
        blinkAt = -1;
        endBlink(now);
        return 0;
    };

    const frame = (now) => {
        raf = 0;
        if (!running) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
        last = now;
        let [ty, tp] = targets(now);
        ty = clamp(ty, yawLo, yawHi);
        tp = clamp(tp, -12, 12);
        head.vel += (OMEGA * OMEGA * (ty - head.yaw) - 2 * OMEGA * head.vel) * dt;
        head.yaw = clamp(head.yaw + head.vel * dt, yawLo, yawHi);
        head.pvel += (OMEGA * OMEGA * (tp - head.pitch) - 2 * OMEGA * head.pvel) * dt;
        head.pitch += head.pvel * dt;

        if (blinkAt < 0 && (checkIn || now > nextBlink)) {
            const steady = Math.abs(head.vel) < 60 && Math.abs(head.pvel) < 60;
            const faced = !checkIn || (Math.abs(head.yaw) < 2 && Math.abs(head.pitch) < 1.5);
            if (steady && faced) { blinkAt = now; blinkAgain = Math.random() < 0.2; }
        }
        const blink = blinkAmount(now);

        // smile: eases in when asked, out when not (about half a second to bloom)
        smile += ((smileOn ? 2 : 0) - smile) * (1 - Math.exp(-dt / (smileOn ? 0.16 : 0.2)));
        if (Math.abs(smile - (smileOn ? 2 : 0)) < 0.003) smile = smileOn ? 2 : 0;

        const key = `${head.yaw.toFixed(3)} ${head.pitch.toFixed(3)} ${blink.toFixed(3)} ${smile.toFixed(3)} ${canvas.width}`;
        if (key !== lastDrawn && rig.render({ yaw: head.yaw, pitch: head.pitch, blink, smile })) lastDrawn = key;
        if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => {
        if (!raf && running && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };

    const onMove = (e) => {
        // moving the cursor while he turns to glance at you calls the glance off
        if (checkIn && blinkAt < 0 && pointer && Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) > 24) checkIn = false;
        pointer = { x: e.clientX, y: e.clientY };
        present = true;
        quietSince = performance.now();
    };
    const onLeave = () => { present = false; };
    const onScroll = () => { rectAt = -Infinity; };
    const onVis = () => { if (!document.hidden) start(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('blur', onLeave);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVis);

    // the first picture (facing you) is ready before he is ever shown
    rig.render({ yaw: 0, pitch: 0, blink: 0, smile: 0 });

    return {
        run(on) {
            running = !!on;
            if (running) start();
            else { cancelAnimationFrame(raf); raf = 0; }
        },
        smile(on) { smileOn = !!on; start(); },
        destroy() {
            running = false;
            cancelAnimationFrame(raf);
            ro.disconnect();
            rig.destroy();
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('blur', onLeave);
            document.documentElement.removeEventListener('mouseleave', onLeave);
            document.removeEventListener('visibilitychange', onVis);
        },
    };
}
