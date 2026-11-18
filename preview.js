/* Live preview: a project opens right on this page, in a macOS-style browser window with the live site, and an
 * iPhone beside it showing the same site in its phone layout. It grows out of the card that was clicked and closes
 * with the red light, the round button, a click outside, or Escape.
 *
 * Scrolling together: a page from another site, shown in an iframe, cannot be read or scrolled from here. So the two
 * screens follow each other only when the project's site carries the small preview bridge (preview-bridge.js in this
 * repo). The bridge reports where its page is and scrolls to the place it is sent: by section first, so the phone
 * shows the same part of the page as the desktop, and by share of the page when the sections differ. A site without
 * the bridge is still live on both screens; each screen then scrolls on its own, and the label under them says so.
 * Sites that forbid being shown inside other pages (Clonix sends such a header) show their picture and a button. */

const NS = 'sj-preview';
const DESKTOP_W = 1280; // the width a project lays out at inside the desktop window
const SOLO_DESKTOP_H = 800; // on a phone, the desktop layout is shown as a 1280 × 800 screen
const DEVICE_W = 429; // the iPhone drawing in its own pixels: a 393 × 852 screen in an 18 px frame
const DEVICE_H = 888;
const SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads';
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

const ICON = {
    close: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.2 2.2l5.6 5.6M7.8 2.2L2.2 7.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    min: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 5h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    max: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.4 7.6V3.2l4.4 4.4zM7.6 2.4v4.4L3.2 2.4z" fill="currentColor"/></svg>',
    reload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
    phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.6"/><path d="M11 18.6h2"/></svg>',
    desktop: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4" width="19" height="12.5" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/></svg>',
    lock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6z"/></svg>',
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    signal: '<svg width="19" height="12" viewBox="0 0 19 12" aria-hidden="true"><rect x="0" y="7.6" width="3.3" height="4.4" rx="1" fill="currentColor"/><rect x="5.1" y="5.2" width="3.3" height="6.8" rx="1" fill="currentColor"/><rect x="10.2" y="2.6" width="3.3" height="9.4" rx="1" fill="currentColor"/><rect x="15.3" y="0" width="3.3" height="12" rx="1" fill="currentColor"/></svg>',
    wifi: '<svg width="17" height="12" viewBox="0 0 17 12" aria-hidden="true"><path d="M8.5.6C5.6.6 2.9 1.7.9 3.6l1.5 1.6C4 3.6 6.2 2.7 8.5 2.7s4.5.9 6.1 2.5l1.5-1.6C14.1 1.7 11.4.6 8.5.6z" fill="currentColor"/><path d="M8.5 4.4c-1.9 0-3.6.7-4.9 1.9l1.5 1.6c.9-.9 2.1-1.4 3.4-1.4s2.5.5 3.4 1.4l1.5-1.6c-1.3-1.2-3-1.9-4.9-1.9z" fill="currentColor"/><path d="M8.5 8.2c-.8 0-1.5.3-2 .8l2 2.2 2-2.2c-.5-.5-1.2-.8-2-.8z" fill="currentColor"/></svg>',
    battery: '<svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true"><rect x="0.5" y="0.5" width="22.5" height="12" rx="3.8" fill="none" stroke="currentColor" stroke-opacity="0.4"/><rect x="2" y="2" width="19.5" height="9" rx="2.3" fill="currentColor"/><path d="M24.4 4.6v3.8c.8-.3 1.3-1 1.3-1.9s-.5-1.6-1.3-1.9z" fill="currentColor" fill-opacity="0.45"/></svg>',
};

function make(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
}

function clockText() {
    const now = new Date();
    return `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function createLivePreview({ onOpen, onClose } = {}) {
    let root = null;
    const ui = {};
    let project = null;
    let origin = '';
    let originEl = null;
    let lastFocus = null;
    let closing = false;
    let rects = null;
    let fit = null;
    let timers = [];
    let clock = null;
    const state = { mode: 'side', max: false, phoneHidden: false, solo: 'phone' };
    const loaded = { win: false, phone: false };
    const bridged = { win: false, phone: false };
    const asked = { win: false, phone: false }; // the hello round is over (bridge answered or not)
    const paths = { win: '', phone: '' };

    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };

    function build() {
        root = make('div', 'lp');
        root.hidden = true;
        root.setAttribute('data-lenis-prevent', '');
        root.innerHTML = `
            <div class="lp-backdrop"></div>
            <span class="lp-sentinel" tabindex="0"></span>
            <div class="lp-stage" role="dialog" aria-modal="true" aria-labelledby="lpTitle">
                <h2 class="lp-sr" id="lpTitle"></h2>
                <div class="lp-win">
                    <div class="lp-bar">
                        <div class="lp-lights">
                            <button type="button" class="lp-light lp-light--close" data-act="close" aria-label="Close the preview">${ICON.close}</button>
                            <button type="button" class="lp-light lp-light--min" data-act="close" aria-label="Minimise">${ICON.min}</button>
                            <button type="button" class="lp-light lp-light--max" data-act="max" aria-label="Full size">${ICON.max}</button>
                        </div>
                        <button type="button" class="lp-x" data-act="close" aria-label="Close the preview">${ICON.x}</button>
                        <div class="lp-nav">
                            <button type="button" data-act="reload" aria-label="Reload the site">${ICON.reload}</button>
                            <button type="button" class="lp-phone-toggle" data-act="phone" aria-label="Show the phone" aria-pressed="true">${ICON.phone}</button>
                        </div>
                        <div class="lp-url">${ICON.lock}<span class="lp-host"></span><span class="lp-path"></span></div>
                        <a class="lp-out" target="_blank" rel="noopener noreferrer"><span class="lp-out-text">Open in new tab</span><span aria-hidden="true">↗</span></a>
                    </div>
                    <div class="lp-view">
                        <div class="lp-canvas"></div>
                        <div class="lp-loading"><img alt="" decoding="async"><span class="lp-progress"></span></div>
                        <div class="lp-blocked" hidden>
                            <img alt="" decoding="async">
                            <div class="lp-note">
                                <p class="lp-note-kicker"></p>
                                <p>This site only opens in its own tab. It asks browsers not to show it inside other pages.</p>
                                <a class="lp-btn" target="_blank" rel="noopener noreferrer">Open the live site <span aria-hidden="true">↗</span></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="lp-phone">
                    <div class="lp-device">
                        <span class="lp-key lp-key--action"></span>
                        <span class="lp-key lp-key--up"></span>
                        <span class="lp-key lp-key--down"></span>
                        <span class="lp-key lp-key--side"></span>
                        <div class="lp-screen">
                            <div class="lp-status" aria-hidden="true"><span class="lp-time">9:41</span><span class="lp-icons">${ICON.signal}${ICON.wifi}${ICON.battery}</span></div>
                            <div class="lp-island"></div>
                            <div class="lp-pview">
                                <div class="lp-ploading"><img alt="" decoding="async"><span class="lp-progress"></span></div>
                            </div>
                            <div class="lp-home"></div>
                        </div>
                    </div>
                </div>
                <div class="lp-dock">
                    <span class="lp-chip" data-state="loading" role="status"><span class="lp-dot"></span><span class="lp-chip-text">Loading the live site…</span></span>
                    <div class="lp-seg" role="group" aria-label="Layout">
                        <button type="button" data-solo="phone" aria-pressed="true">${ICON.phone}Phone</button>
                        <button type="button" data-solo="desktop" aria-pressed="false">${ICON.desktop}Desktop</button>
                    </div>
                </div>
                <button type="button" class="lp-close" data-act="close" aria-label="Close the preview">${ICON.x}</button>
            </div>
            <span class="lp-sentinel" tabindex="0"></span>`;
        document.body.appendChild(root);

        const $ = (sel) => root.querySelector(sel);
        Object.assign(ui, {
            backdrop: $('.lp-backdrop'), stage: $('.lp-stage'), title: $('#lpTitle'),
            win: $('.lp-win'), bar: $('.lp-bar'), host: $('.lp-host'), path: $('.lp-path'), out: $('.lp-out'),
            phoneToggle: $('.lp-phone-toggle'), view: $('.lp-view'), canvas: $('.lp-canvas'),
            loading: $('.lp-loading'), loadingImg: $('.lp-loading img'),
            blocked: $('.lp-blocked'), blockedImg: $('.lp-blocked img'), kicker: $('.lp-note-kicker'), blockedBtn: $('.lp-blocked .lp-btn'),
            phone: $('.lp-phone'), device: $('.lp-device'), screen: $('.lp-screen'), time: $('.lp-time'),
            pview: $('.lp-pview'), ploading: $('.lp-ploading'), ploadingImg: $('.lp-ploading img'),
            dock: $('.lp-dock'), chip: $('.lp-chip'), chipText: $('.lp-chip-text'), close: $('.lp-close'),
            seg: Array.from(root.querySelectorAll('.lp-seg button')),
            sentinels: Array.from(root.querySelectorAll('.lp-sentinel')),
            frame: null, pframe: null,
        });

        root.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-act], [data-solo]');
            if (btn) {
                const act = btn.dataset.act;
                if (act === 'close') close();
                else if (act === 'max') toggleMax();
                else if (act === 'reload') reload();
                else if (act === 'phone') togglePhone();
                else if (btn.dataset.solo) setSolo(btn.dataset.solo);
                return;
            }
            if (e.target === ui.stage || e.target === ui.backdrop) close();
        });
        ui.bar.addEventListener('dblclick', (e) => {
            if (!e.target.closest('button, a') && state.mode !== 'solo') toggleMax();
        });
        ui.sentinels[0].addEventListener('focus', () => { const f = focusables(); if (f.length) f[f.length - 1].focus(); });
        ui.sentinels[1].addEventListener('focus', () => { const f = focusables(); if (f.length) f[0].focus(); });

        if ('ResizeObserver' in window) {
            new ResizeObserver((entries) => {
                const box = entries[entries.length - 1].contentRect;
                fitCanvas(box.width, box.height, !root.classList.contains('is-animating'));
            }).observe(ui.view);
        }
        window.addEventListener('resize', () => { if (project) requestAnimationFrame(layout); });
        window.addEventListener('message', onMessage);
    }

    function focusables() {
        return Array.from(root.querySelectorAll('.lp-stage button, .lp-stage a[href], .lp-stage iframe'))
            .filter((node) => node.offsetParent !== null && !node.closest('[hidden]'));
    }

    function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
    }

    /* ---------- the live frames ---------- */

    function makeFrame(url, label, which) {
        const frame = document.createElement('iframe');
        frame.title = label;
        frame.src = url;
        frame.setAttribute('sandbox', SANDBOX);
        frame.setAttribute('allow', 'fullscreen; clipboard-write; autoplay');
        frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        frame.addEventListener('load', () => onFrameLoad(which, frame));
        return frame;
    }

    function createFrames() {
        ui.frame = makeFrame(project.url, `${project.title}, live site, desktop layout`, 'win');
        ui.canvas.appendChild(ui.frame);
        if (state.mode !== 'solo') ensurePhoneFrame();
        const slowFor = project;
        later(() => {
            if (project !== slowFor || loaded.win) return;
            const slow = make('a', 'lp-slow', 'Taking a while? Open it in a new tab <span aria-hidden="true">↗</span>');
            slow.href = project.url;
            slow.target = '_blank';
            slow.rel = 'noopener noreferrer';
            ui.loading.appendChild(slow);
        }, 9000);
    }

    function ensurePhoneFrame() {
        if (ui.pframe || !project || project.embed === false) return;
        ui.pframe = makeFrame(project.url, `${project.title}, live site, phone layout`, 'phone');
        ui.pview.appendChild(ui.pframe);
    }

    function removeFrames() {
        timers.forEach(clearTimeout);
        timers = [];
        [ui.frame, ui.pframe].forEach((frame) => { if (frame) frame.remove(); });
        ui.frame = null;
        ui.pframe = null;
        ['win', 'phone'].forEach((k) => { loaded[k] = false; bridged[k] = false; asked[k] = false; paths[k] = ''; });
        ui.loading.classList.remove('is-done');
        ui.ploading.classList.remove('is-done');
        const slow = ui.loading.querySelector('.lp-slow');
        if (slow) slow.remove();
    }

    function onFrameLoad(which, frame) {
        if (!project || (frame !== ui.frame && frame !== ui.pframe)) return;
        loaded[which] = true;
        bridged[which] = false; // a new page in that frame: ask it again
        asked[which] = false;
        (which === 'win' ? ui.loading : ui.ploading).classList.add('is-done');
        hello(which, frame);
        updateChip();
    }

    function hello(which, frame) {
        let tries = 0;
        const tick = () => {
            if (!project || !frame.isConnected || bridged[which]) return;
            if (tries++ >= 14) { asked[which] = true; updateChip(); return; }
            try { frame.contentWindow.postMessage({ ns: NS, type: 'hello', v: 1 }, origin); } catch (_) { /* the frame left */ }
            later(tick, 400);
        };
        tick();
    }

    function onMessage(e) {
        if (!project || e.origin !== origin) return;
        const d = e.data;
        if (!d || typeof d !== 'object' || d.ns !== NS) return;
        const which = ui.frame && e.source === ui.frame.contentWindow ? 'win'
            : ui.pframe && e.source === ui.pframe.contentWindow ? 'phone' : '';
        if (!which) return;
        if (typeof d.path === 'string') {
            paths[which] = d.path;
            if (which === 'win') ui.path.textContent = d.path === '/' ? '' : d.path;
        }
        if (d.type === 'ready') {
            bridged[which] = true;
            asked[which] = true;
            updateChip();
            return;
        }
        if (d.type === 'scroll' && d.user) {
            const other = which === 'win' ? 'phone' : 'win';
            const target = other === 'win' ? ui.frame : ui.pframe;
            if (!target || !bridged[other] || paths[other] !== paths[which]) return;
            target.contentWindow.postMessage({ ns: NS, type: 'scrollTo', s: d.s, f: d.f, p: d.p, n: d.n }, origin);
        }
    }

    function updateChip() {
        if (!project) return;
        let s;
        let text;
        if (project.embed === false) {
            s = 'blocked';
            text = `${project.title} opens in its own tab`;
        } else if (bridged.win && bridged.phone) {
            s = 'synced';
            text = 'Live · desktop and phone scroll together';
        } else if (loaded.win && (loaded.phone || state.mode === 'solo') && asked.win && (asked.phone || state.mode === 'solo')) {
            s = 'live';
            text = 'Live site · scroll each screen';
        } else if (loaded.win) {
            s = 'live';
            text = 'Live site';
        } else {
            s = 'loading';
            text = 'Loading the live site…';
        }
        if (ui.chip.dataset.state !== s || ui.chipText.textContent !== text) {
            ui.chip.dataset.state = s;
            ui.chipText.textContent = text;
        }
    }

    /* ---------- layout ---------- */

    function place(node, r) {
        node.style.left = `${Math.round(r.x)}px`;
        node.style.top = `${Math.round(r.y)}px`;
        node.style.width = `${Math.round(r.w)}px`;
        node.style.height = `${Math.round(r.h)}px`;
    }

    function layout() {
        if (!project) return;
        const vw = document.documentElement.clientWidth;
        const vh = window.innerHeight;
        const mode = (vw < 700 || vh < 500) ? 'solo' : vw >= 1060 ? 'side' : 'overlap';
        state.mode = mode;
        root.classList.toggle('is-side', mode === 'side');
        root.classList.toggle('is-overlap', mode === 'overlap');
        root.classList.toggle('is-solo', mode === 'solo');
        root.classList.toggle('is-solo-desktop', mode === 'solo' && state.solo === 'desktop');
        root.classList.toggle('is-max', state.max && mode !== 'solo');
        root.classList.toggle('is-phone-hidden', state.phoneHidden && mode !== 'solo');
        ui.phoneToggle.setAttribute('aria-pressed', String(!state.phoneHidden));
        ui.phoneToggle.setAttribute('aria-label', state.phoneHidden ? 'Show the phone' : 'Hide the phone');

        const ratio = DEVICE_W / DEVICE_H;
        const dock = 64;
        let win;
        let ph = null;
        if (mode === 'solo') {
            win = { x: 0, y: 0, w: vw, h: vh };
        } else if (mode === 'side') {
            const availW = Math.min(1640, vw - 56);
            const gap = Math.round(Math.min(48, Math.max(24, vw * 0.025)));
            let h = Math.min(900, vh - dock - 48);
            let pH = h * 0.9;
            let wW = Math.min(1280, availW - pH * ratio - gap);
            if (wW < h * 1.35) { // keep the desktop window wider than it is tall
                h = (availW - gap) / (1.35 + 0.9 * ratio);
                pH = h * 0.9;
                wW = availW - pH * ratio - gap;
            }
            const pW = pH * ratio;
            const total = wW + gap + pW;
            const x0 = (vw - total) / 2;
            const y0 = Math.max(16, (vh - dock - h) / 2);
            ph = { x: x0 + wW + gap, y: y0 + h - pH, w: pW, h: pH };
            win = { x: x0, y: y0, w: wW, h };
            if (state.phoneHidden) {
                const w = Math.min(availW, h * 1.75);
                win = { x: (vw - w) / 2, y: y0, w, h };
                ph = { ...ph, x: Math.min(vw - pW - 16, win.x + w + gap) };
            }
        } else {
            let wW = vw - 32;
            let h = Math.min(vh - dock - 96, wW * 0.68);
            let pH = h * 0.82;
            wW = vw - 32 - (state.phoneHidden ? 0 : pH * ratio * 0.35);
            h = Math.min(vh - dock - 96, wW * 0.68);
            pH = h * 0.82;
            const pW = pH * ratio;
            const total = h + (state.phoneHidden ? 0 : pH * 0.15);
            const y0 = Math.max(16, (vh - dock - total) / 2);
            win = { x: 16, y: y0, w: wW, h };
            ph = { x: 16 + wW - pW * 0.65, y: y0 + h - pH * 0.85, w: pW, h: pH };
        }
        if (state.max && mode !== 'solo') win = { x: 0, y: 0, w: vw, h: vh };
        if (project.embed === false) { // a phone gets the phone picture
            const pic = (mode === 'solo' && project.phone) || project.image || '';
            if (ui.blockedImg.getAttribute('src') !== pic) ui.blockedImg.src = pic;
        }
        place(ui.win, win);
        if (ph) {
            place(ui.phone, ph);
            ui.device.style.transform = `scale(${ph.w / DEVICE_W})`;
        }
        rects = { win, ph };
        if (mode !== 'solo') ensurePhoneFrame();
        if (!('ResizeObserver' in window)) fitCanvas(ui.view.clientWidth, ui.view.clientHeight, true);
        updateChip();
    }

    // The desktop window shows the site at 1280 px wide, scaled down to fit; at 1280 px or wider it shows it 1:1.
    function fitCanvas(boxW, boxH, full) {
        if (!project || !boxW || !boxH) return;
        let lw;
        let lh;
        let s;
        let left = 0;
        let top = 0;
        if (full || !fit) {
            if (state.mode === 'solo' && state.solo === 'desktop') {
                lw = DESKTOP_W;
                lh = SOLO_DESKTOP_H;
                left = 14;
                s = (boxW - left * 2) / lw;
                top = Math.max(0, (boxH - lh * s) / 2);
            } else if (state.mode === 'solo' || boxW >= DESKTOP_W) {
                lw = boxW;
                lh = boxH;
                s = 1;
            } else {
                lw = DESKTOP_W;
                s = boxW / lw;
                lh = boxH / s;
            }
            fit = { lw, lh, left, top };
        } else {
            ({ lw, lh, left, top } = fit);
            s = (boxW - left * 2) / lw;
        }
        const c = ui.canvas.style;
        c.width = `${Math.round(lw)}px`;
        c.height = `${Math.round(lh)}px`;
        c.transform = Math.abs(s - 1) < 0.0005 && top < 0.5 && left < 0.5
            ? 'none'
            : `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px) scale(${s.toFixed(4)})`;
    }

    function animateRects() {
        root.classList.add('is-animating');
        later(() => {
            root.classList.remove('is-animating');
            fitCanvas(ui.view.clientWidth, ui.view.clientHeight, true);
        }, 540);
    }

    function toggleMax() {
        if (state.mode === 'solo') return;
        state.max = !state.max;
        ui.win.querySelector('.lp-light--max').setAttribute('aria-label', state.max ? 'Exit full size' : 'Full size');
        animateRects();
        layout();
    }

    function togglePhone() {
        state.phoneHidden = !state.phoneHidden;
        animateRects();
        layout();
    }

    function setSolo(which) {
        state.solo = which;
        ui.seg.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.solo === which)));
        root.classList.toggle('is-solo-desktop', state.mode === 'solo' && which === 'desktop');
        fitCanvas(ui.view.clientWidth, ui.view.clientHeight, true);
    }

    function reload() {
        if (!project || project.embed === false) return;
        removeFrames();
        createFrames();
        updateChip();
    }

    /* ---------- open and close ---------- */

    function originRect() {
        if (!originEl || !originEl.isConnected) return null;
        const r = originEl.getBoundingClientRect();
        if (r.width < 8 || r.bottom < 0 || r.top > window.innerHeight) return null;
        return r;
    }

    function open(p, fromEl) {
        if (!p || !p.url) return;
        if (!root) build();
        if (project) removeFrames();
        project = p;
        originEl = fromEl || null;
        closing = false;
        lastFocus = document.activeElement;
        const url = new URL(p.url, window.location.href);
        origin = url.origin;
        state.max = false;
        state.solo = 'phone';
        fit = null;
        ui.seg.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.solo === 'phone')));

        ui.title.textContent = `${p.title}, live preview`;
        ui.host.textContent = url.host.replace(/^www\./, '');
        ui.path.textContent = url.pathname === '/' ? '' : url.pathname;
        ui.out.href = p.url;
        ui.out.setAttribute('aria-label', `Open ${p.title} in a new tab`);
        ui.screen.style.setProperty('--lp-bar', p.bar || '#000000');
        ui.screen.style.setProperty('--lp-ink', p.ink === 'dark' ? '#0b0b0d' : '#ffffff');
        ui.loadingImg.src = p.image || '';
        ui.ploadingImg.src = p.phone || p.image || '';

        const blocked = p.embed === false;
        root.classList.toggle('is-blocked', blocked);
        ui.blocked.hidden = !blocked;
        ui.loading.hidden = blocked;
        if (blocked) {
            ui.blockedImg.alt = `${p.title}, the first screen of the live site`;
            ui.kicker.textContent = p.title;
            ui.blockedBtn.href = p.url;
        }

        root.hidden = false;
        document.documentElement.classList.add('lp-open');
        document.addEventListener('keydown', onKey);
        if (onOpen) onOpen();
        layout();
        if (!blocked) createFrames();
        ui.time.textContent = clockText();
        clearInterval(clock);
        clock = setInterval(() => { ui.time.textContent = clockText(); }, 15000);
        updateChip();
        animateIn();
        const first = focusables()[0];
        if (first) first.focus({ preventScroll: true });
    }

    function animateIn() {
        if (!ui.win.animate) return;
        const reduce = reduceMotion();
        ui.backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 150 : 420, easing: 'ease-out' });
        const from = originRect();
        const t = rects && rects.win;
        if (!reduce && from && t && state.mode !== 'solo') {
            const s = Math.max(0.12, from.width / t.w);
            const dx = from.left + from.width / 2 - (t.x + t.w / 2);
            const dy = from.top + from.height / 2 - (t.y + t.h / 2);
            ui.win.animate([
                { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0.4 },
                { transform: 'none', opacity: 1 },
            ], { duration: 700, easing: EASE_OUT });
        } else {
            ui.win.animate([
                { transform: reduce ? 'none' : 'translateY(28px) scale(0.97)', opacity: 0 },
                { transform: 'none', opacity: 1 },
            ], { duration: reduce ? 150 : 480, easing: EASE_OUT });
        }
        if (state.mode !== 'solo' && !state.phoneHidden) {
            ui.phone.animate([
                { transform: reduce ? 'none' : 'translate(70px, 60px) rotate(6deg) scale(0.86)', opacity: 0 },
                { transform: 'none', opacity: 1 },
            ], { duration: reduce ? 150 : 900, delay: reduce ? 0 : 170, easing: EASE_OUT, fill: 'backwards' });
        }
        ui.dock.animate([
            { transform: 'translate(-50%, 14px)', opacity: 0 },
            { transform: 'translate(-50%, 0)', opacity: 1 },
        ], { duration: 500, delay: reduce ? 0 : 380, easing: EASE_OUT, fill: 'backwards' });
        ui.close.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: reduce ? 0 : 300, fill: 'backwards' });
    }

    function close() {
        if (!project || closing) return;
        closing = true;
        if (!ui.win.animate) { finish(); return; }
        const reduce = reduceMotion();
        const from = originRect();
        const t = rects && rects.win;
        let anim;
        if (!reduce && from && t && state.mode !== 'solo' && !state.max) {
            const s = Math.max(0.12, from.width / t.w);
            const dx = from.left + from.width / 2 - (t.x + t.w / 2);
            const dy = from.top + from.height / 2 - (t.y + t.h / 2);
            anim = ui.win.animate([
                { transform: 'none', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0 },
            ], { duration: 440, easing: 'cubic-bezier(0.55, 0, 0.3, 1)', fill: 'forwards' });
        } else {
            anim = ui.win.animate([
                { transform: 'none', opacity: 1 },
                { transform: reduce ? 'none' : 'translateY(18px) scale(0.98)', opacity: 0 },
            ], { duration: reduce ? 120 : 260, easing: 'ease-in', fill: 'forwards' });
        }
        ui.phone.animate([
            { transform: 'none', opacity: 1 },
            { transform: reduce ? 'none' : 'translate(50px, 40px) scale(0.92)', opacity: 0 },
        ], { duration: reduce ? 120 : 320, easing: 'ease-in', fill: 'forwards' });
        [ui.dock, ui.close].forEach((node) => node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }));
        ui.backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduce ? 120 : 440, easing: 'ease-in', fill: 'forwards' });
        anim.finished.then(finish, finish);
    }

    function finish() {
        if (!project) return;
        removeFrames();
        clearInterval(clock);
        root.hidden = true;
        if (root.getAnimations) root.getAnimations({ subtree: true }).forEach((a) => a.cancel());
        root.classList.remove('is-animating');
        document.documentElement.classList.remove('lp-open');
        document.removeEventListener('keydown', onKey);
        project = null;
        closing = false;
        if (onClose) onClose();
        const back = originEl && originEl.isConnected ? originEl : lastFocus;
        if (back && back.focus) back.focus({ preventScroll: true });
    }

    return { open, close };
}
