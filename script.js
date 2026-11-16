// --- Terminal Preloader Logic ---
// The page opens at the top, unless the link points at a section (#work, #contact…).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

const hashTarget = () => {
    if (!location.hash) return null;
    try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { return null; }
};

// Hero text waits behind the preloader and comes in when it lifts.
const heroElements = document.querySelectorAll(".hd-status-pill, .hd-headline, .hd-desc, .hd-btn");
let heroHidden = false;
let lenis = null;

const clearPreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('fade-out')) {
        preloader.classList.add('fade-out');
        if (heroHidden) {
            gsap.to(heroElements, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.15, clearProps: "transform" });
        }
        const target = hashTarget();
        if (target) {
            if (lenis) lenis.scrollTo(target, { immediate: true });
            else target.scrollIntoView();
        }
    }
};

window.addEventListener('load', () => {
    setTimeout(clearPreloader, 600);
});

// Fallback in case window.load is slow (big videos, slow network). Registered before anything
// that needs the CDN libraries, so the preloader always lifts.
setTimeout(clearPreloader, 3500);

gsap.set(heroElements, { opacity: 0, y: 40 });
heroHidden = true;

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Initialize Smooth Scroll (Lenis). Touch screens keep their own native scrolling.
lenis = new Lenis({
    lerp: 0.1,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 1,
    infinite: false,
});

// Anchor link smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href').slice(1);
        const target = id && document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.6, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    });
});

// Integrate Lenis with GSAP ScrollTrigger for optimal performance
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// --- Navbar: hides while you scroll down, comes back as soon as you scroll up ---
const navbar = document.querySelector('.navbar-wrapper');
const navMenuEl = document.getElementById('nav-menu');
if (navbar) {
    let lastY = window.scrollY;
    let ticking = false;
    const updateNav = () => {
        const y = window.scrollY;
        const menuOpen = navMenuEl && navMenuEl.classList.contains('active');
        navbar.classList.toggle('is-scrolled', y > 80);
        if (!menuOpen && Math.abs(y - lastY) > 4) {
            navbar.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * 0.5);
            lastY = y;
        }
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(updateNav); }
    }, { passive: true });
}

// --- Global Scroll Progress Indicator ---
gsap.to('.scroll-progress', {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3
    }
});

// --- Custom cursor: only with a real mouse; touch screens keep their normal behaviour ---
const cursor = document.querySelector('.cursor');

if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.documentElement.classList.add('has-custom-cursor');
    // Use GSAP's quickTo for high-frequency mousemove events
    let xTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3"});
    let yTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3"});

    document.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
        cursor.classList.add('is-visible');
    });
    document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));

    // One listener covers links, buttons and the project cards that are added later
    document.addEventListener('mouseover', (e) => {
        cursor.classList.toggle('active', !!e.target.closest('a, button, .magnetic, .work-card, .hero-subject-hover'));
    });
}

// --- Hero Background Reveal: the 3D you ---
// Hovering the portrait wakes the 3D character. On desktop it is the live one from sqaron.dev
// (assets/shivam-3d): it follows the cursor anywhere in the hero and smiles when you reach for
// "See my work". Phones, data-saver and browsers without WebGL2 keep the still 3D picture.
const heroEl = document.querySelector('.hero');
const heroBgOverlay = document.querySelector('.hero-bg-overlay');
const heroSubjectTrigger = document.querySelector('.hero-subject-hover');
const hero3d = document.querySelector('.hero-3d');
const heroCta = document.querySelector('.hd-btn');
let liveHead = null;
let threeD = false;

const show3D = (on) => {
    if (on === threeD) return;
    threeD = on;
    if (heroEl) heroEl.classList.toggle('is-3d', on);
    if (on) {
        if (liveHead) {
            liveHead.run(true);
            gsap.to(hero3d, { opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        } else {
            gsap.to(heroBgOverlay, { opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
        }
    } else {
        gsap.to([hero3d, heroBgOverlay].filter(Boolean), {
            opacity: 0, duration: 0.6, ease: 'power2.out', overwrite: 'auto',
            onComplete: () => { if (!threeD && liveHead) liveHead.run(false); }
        });
    }
};

if (heroSubjectTrigger && heroBgOverlay) {
    heroSubjectTrigger.addEventListener('mouseenter', () => show3D(true));
    // the still picture leaves with the cursor; the live character stays while you are anywhere in the hero
    heroSubjectTrigger.addEventListener('mouseleave', () => { if (!liveHead) show3D(false); });
    if (heroEl) heroEl.addEventListener('mouseleave', () => show3D(false));
}

// he smiles when you reach for the work
if (heroCta) {
    heroCta.addEventListener('pointerenter', () => { if (liveHead) { show3D(true); liveHead.smile(true); } });
    heroCta.addEventListener('pointerleave', () => { if (liveHead) liveHead.smile(false); });
}

// scrolled away: back to the photo, and the GPU rests
if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) show3D(false); }, { threshold: 0.35 }).observe(heroEl);
}

const canLiveHead = hero3d && heroEl
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && !(navigator.connection && navigator.connection.saveData);
if (canLiveHead) {
    const loadHead = () => import('./assets/shivam-3d/head.js')
        .then(({ mountHead }) => mountHead(hero3d.querySelector('.ht'), hero3d.querySelector('.ht-canvas'), {
            base: 'assets/shivam-3d/rig',
            scale: navigator.deviceMemory && navigator.deviceMemory < 6 ? 0.6 : 1,
        }))
        .then((head) => {
            liveHead = head;
            heroEl.classList.add('has-live-3d');
            if (threeD) { // the still picture is up: hand over to the live one
                liveHead.run(true);
                gsap.to(hero3d, { opacity: 1, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
                gsap.to(heroBgOverlay, { opacity: 0, duration: 0.5, delay: 0.25, overwrite: 'auto' });
            }
        })
        .catch((err) => console.warn('[portfolio] live 3D character unavailable, keeping the still picture', err));
    // after the page has settled, so it never competes with the first paint
    if (document.readyState === 'complete') setTimeout(loadHead, 1200);
    else window.addEventListener('load', () => setTimeout(loadHead, 1200), { once: true });
}

// --- Hamburger Menu ---
const hamburgerMenu = document.getElementById('hamburger-menu');
const navMenu = document.getElementById('nav-menu');

if (hamburgerMenu && navMenu) {
    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// --- Magnetic Elements ---
const magnetics = document.querySelectorAll('.magnetic');

magnetics.forEach((elem) => {
    // Generate isolated quickTo handlers for optimal performance
    let xTo = gsap.quickTo(elem, "x", {duration: 0.4, ease: "power3"});
    let yTo = gsap.quickTo(elem, "y", {duration: 0.4, ease: "power3"});

    elem.addEventListener('mousemove', (e) => {
        const strength = elem.getAttribute('data-strength') || 20;
        const boundingRect = elem.getBoundingClientRect();

        const relX = e.clientX - boundingRect.left;
        const relY = e.clientY - boundingRect.top;

        const x = ((relX - boundingRect.width / 2) / boundingRect.width) * strength;
        const y = ((relY - boundingRect.height / 2) / boundingRect.height) * strength;

        xTo(x);
        yTo(y);
    });

    elem.addEventListener('mouseleave', () => {
        gsap.to(elem, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)", overwrite: "auto" });
    });
});

// --- Cinematic Hero to Content Transition ---
const heroSection = document.querySelector('.hero');
const targetSection = document.querySelector('.about');

if (heroSection && targetSection) {
    gsap.to(['.hero-domi-layout', '.hero-parallax-wrapper'], {
        yPercent: 25,
        opacity: 0,
        scale: 0.95,
        ease: "none",
        scrollTrigger: {
            trigger: targetSection,
            start: "top bottom",
            end: "top top",
            scrub: true
        }
    });
}

// --- Framer Motion Typography Reveals ---
// Dynamically split text nodes into individual words mapped to a complex blur stagger
const splitTextNodes = (el) => {
    const wrapWords = (text) => text.split(' ').map(word => {
        if (!word.trim()) return ' ';
        return `<span class="fm-word" style="display:inline-block; margin-right:0.25em; opacity:0; filter:blur(10px); transform:translateY(20px);">${word}</span>`;
    }).join('');

    Array.from(el.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (text.trim()) {
                const wrapper = document.createElement('span');
                wrapper.innerHTML = wrapWords(text);
                el.insertBefore(wrapper, node);
                el.removeChild(node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
            splitTextNodes(node);
        }
    });
};

const aboutText = document.querySelector('.about-text');
if (aboutText) {
    splitTextNodes(aboutText);
    gsap.to('.fm-word', {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.02,
        scrollTrigger: {
            trigger: aboutText,
            start: "top 80%",
            toggleActions: "play none none reverse"
        }
    });
}

// --- Framer Motion Style Scroll Reveals ---
// One reveal per element (a second, competing tween used to leave some of them blurred)
gsap.utils.toArray('.expert-card, .puzzle-card, .puzzle-header h2, .ex-node, .expertise-center-focus, .studio-title, .studio-lede, .studio-card, .studio-services li, .studio-numbers > div, .studio-cta').forEach((elem) => {
    gsap.fromTo(elem,
        {
            opacity: 0,
            y: 80,
            filter: "blur(12px)",
            scale: 0.98
        },
        {
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            scale: 1,
            duration: 1.2,
            ease: "power4.out",
            clearProps: "filter"
        }
    );
});

// --- Orbital Node Vector Drawings ---
gsap.utils.toArray('.ex-line').forEach(line => {
    const isLeft = line.closest('.node-tl') || line.closest('.node-bl');
    gsap.fromTo(line,
        { scaleX: 0, transformOrigin: isLeft ? 'left center' : 'right center' },
        {
            scaleX: 1, duration: 1.5, ease: "power4.out",
            scrollTrigger: {
                trigger: ".expertise-center-focus",
                start: "top 75%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// About Multi-Layer Parallax Scrubbing
gsap.to('.about-bg-layer', {
    yPercent: 20,
    ease: "none",
    scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true }
});

gsap.to('.parallax-fast', {
    y: -60,
    ease: "none",
    scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true }
});

// --- Studio wordmark: the gradient follows your cursor through the outlined SQARON ---
const studio = document.querySelector('.studio');
const studioWord = document.querySelector('.studio-word');
const studioSpot = document.getElementById('studioSpot');
if (studio && studioWord && studioSpot) {
    const spot = { x: 600, y: 120, tx: 600, ty: 120 };
    const t0 = performance.now();
    let auto = !window.matchMedia('(hover: hover) and (pointer: fine)').matches; // touch: it sweeps on its own
    let studioVisible = false;
    let spotRaf = 0;
    const tickSpot = (now) => {
        spotRaf = 0;
        if (auto) {
            spot.tx = 600 + 430 * Math.sin((now - t0) / 1600);
            spot.ty = 120 + 30 * Math.sin((now - t0) / 900);
        }
        spot.x += (spot.tx - spot.x) * 0.12;
        spot.y += (spot.ty - spot.y) * 0.12;
        studioSpot.setAttribute('cx', spot.x.toFixed(1));
        studioSpot.setAttribute('cy', spot.y.toFixed(1));
        const moving = auto || Math.abs(spot.tx - spot.x) > 0.5 || Math.abs(spot.ty - spot.y) > 0.5;
        if (studioVisible && moving) spotRaf = requestAnimationFrame(tickSpot);
    };
    const kickSpot = () => { if (!spotRaf && studioVisible) spotRaf = requestAnimationFrame(tickSpot); };
    studio.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const m = studioWord.getScreenCTM();
        if (!m) return;
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        spot.tx = p.x;
        spot.ty = p.y;
        kickSpot();
    });
    studio.addEventListener('pointerleave', () => { spot.tx = 600; spot.ty = 120; kickSpot(); });
    new IntersectionObserver(([entry]) => { studioVisible = entry.isIntersecting; kickSpot(); }).observe(studio);
}

// --- Studio numbers count up as they come into view ---
gsap.utils.toArray('.studio-numbers dt[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const counter = { v: 0 };
    gsap.to(counter, {
        v: end,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top bottom-=40', once: true },
        onStart: () => { el.textContent = '0'; },
        onUpdate: () => { el.textContent = String(Math.round(counter.v)); },
    });
});

// --- Background videos play only while they are on screen (saves battery, keeps scrolling smooth) ---
if ('IntersectionObserver' in window) {
    const videoWatcher = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) target.play().catch(() => {});
            else target.pause();
        });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('video[autoplay]').forEach((video) => videoWatcher.observe(video));
}

// --- Work Section: each panel independently looks at the mouse (per-card), over a video bg ---
// ▸ EDIT YOUR PROJECTS HERE: title, description, live-demo url (opens new tab), optional image.
//   url "" => "Coming soon" (non-clickable). image => full-bleed screenshot panel.
//   Per-card depth is in style.css (.work-card:nth-child(n) translateZ) and DEPTH[] below.
const PROJECTS = [
    { title: "NexeraAI", description: "An AI-powered job platform — résumé compatibility scoring, top-company referrals, and smart search to fast-track your career.", url: "https://nexera-ai-xi.vercel.app/", image: "assets/nexera.jpg" },
    { title: "Clonix", description: "Turns any website into design intelligence: design tokens, components and ready packs for Cursor, Claude Code and Windsurf — or a runnable clone in one click. Co-founded with Saksham Srivastava, who runs the backend.", url: "https://clonix-tau.vercel.app/", image: "assets/clonix.jpg" },
    { title: "Orbit OS", description: "An open-source (GPL-3.0) app that sets up Google TV and Android TV from your phone — a calmer home screen, a phone remote and one-tap undo. Free on Google Play.", url: "https://orbit-os-tv.vercel.app/", image: "assets/orbit-os.jpg" },
    { title: "Cab Concept A · Obsidian", description: "Website concept for a corporate cab & tours company: dark corporate luxe, a cinematic pinned hero and a live-tracking phone story. Sample brand: Safarline.", url: "https://heyshivm-cab-demo.vercel.app/dark-luxe/", image: "assets/cab-obsidian.jpg" },
    { title: "Cab Concept B · Golden Hour", description: "Travel-first concept for the same cab company: an 11-layer illustrated Himalaya parallax where the cab drives as you scroll.", url: "https://heyshivm-cab-demo.vercel.app/golden-travel/", image: "assets/cab-golden-hour.jpg" },
    { title: "Cab Concept C · Kinetic", description: "Taxi-yellow kinetic type with separate lanes for companies and travellers, and a WhatsApp booking story. Comes with a booking dashboard.", url: "https://heyshivm-cab-demo.vercel.app/bold-kinetic/", image: "assets/cab-kinetic.jpg" }
];

(() => {
    const section = document.querySelector('.works-showcase');
    const deck = document.getElementById('worksDeck');
    const titleEl = document.getElementById('worksTitle');
    const descEl = document.getElementById('worksDesc');
    const ctaEl = document.getElementById('worksCta');
    if (!section || !deck || !titleEl || !descEl || !ctaEl) return;

    const GRADIENTS = [
        'linear-gradient(135deg, #455ce9, #23299e)',
        'linear-gradient(135deg, #00f0ff, #0077ff)',
        'linear-gradient(135deg, #a855f7, #6d28d9)',
        'linear-gradient(135deg, #f97316, #b91c1c)',
        'linear-gradient(135deg, #10b981, #047857)'
    ];
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    const setActive = (p) => {
        titleEl.textContent = p.title;
        descEl.textContent = p.description;
        if (p.url) { ctaEl.href = p.url; ctaEl.classList.remove('is-disabled'); }
        else { ctaEl.removeAttribute('href'); ctaEl.classList.add('is-disabled'); }
        [titleEl, descEl].forEach((el) => {
            if (el.animate) el.animate(
                [{ opacity: 0.25, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
                { duration: 320, easing: 'cubic-bezier(0.22,1,0.36,1)' }
            );
        });
    };

    const cardHtml = PROJECTS.map((p, i) => {
        const isLive = !!p.url;
        const tag = isLive ? 'a' : 'div';
        const attrs = isLive
            ? 'href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer"'
            : 'role="button" tabindex="0" aria-disabled="true"';
        let inner;
        if (isLive && p.image) {
            inner = '<img class="work-card-img" src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy">';
        } else if (isLive) {
            inner = '<span class="work-card-fallback" style="background:' + (p.gradient || GRADIENTS[i % GRADIENTS.length]) + ';">' + esc(p.title) + '</span>';
        } else {
            inner = '<span class="work-card-soon-badge">Coming soon</span>';
        }
        return '<' + tag + ' class="work-card' + (isLive ? '' : ' is-soon') + '" data-index="' + i + '" ' + attrs + '>'
            + '<span class="work-card-screen">' + inner + '</span>'
            + '</' + tag + '>';
    }).join('');
    deck.innerHTML = '<div class="works-orbit">' + cardHtml + '</div>';

    const cards = Array.from(deck.querySelectorAll('.work-card'));
    cards.forEach((card) => {
        const p = PROJECTS[Number(card.dataset.index)];
        const activate = () => { cards.forEach((c) => c.classList.remove('is-active')); card.classList.add('is-active'); setActive(p); };
        card.addEventListener('mouseenter', activate);
        card.addEventListener('focus', activate);
    });
    if (PROJECTS.length) setActive(PROJECTS[0]);

    // Per-card look-at-mouse: each panel rotates toward the cursor based on ITS OWN centre,
    // so every card turns a different amount/direction. Floats at its own translateZ depth.
    const DEPTH = [52, -18, 30, -34, 40, -48];
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isTouch && !reduceMotion) {
        const MAX_RY = 26, MAX_RX = 18;
        const clamp = (v) => Math.max(-1.2, Math.min(1.2, v));
        const st = cards.map(() => ({ rx: 0, ry: 0, tRx: 0, tRy: 0 }));
        let centers = [];
        const measure = () => {
            const sr = section.getBoundingClientRect();
            centers = cards.map((card) => {
                const r = card.getBoundingClientRect();
                return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top, w: sr.width, h: sr.height };
            });
        };
        const applyRest = () => { cards.forEach((card, i) => { card.style.transform = 'translateZ(' + DEPTH[i % DEPTH.length] + 'px)'; }); };
        measure();
        applyRest();
        window.addEventListener('resize', measure);
        let raf = null;
        const tick = () => {
            let moving = false;
            cards.forEach((card, i) => {
                const s = st[i];
                s.ry += (s.tRy - s.ry) * 0.12;
                s.rx += (s.tRx - s.rx) * 0.12;
                if (Math.abs(s.tRy - s.ry) > 0.01 || Math.abs(s.tRx - s.rx) > 0.01) moving = true;
                card.style.transform = 'translateZ(' + DEPTH[i % DEPTH.length] + 'px) rotateY(' + s.ry.toFixed(2) + 'deg) rotateX(' + s.rx.toFixed(2) + 'deg)';
            });
            raf = moving ? requestAnimationFrame(tick) : null;
        };
        const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
        section.addEventListener('mousemove', (e) => {
            const sr = section.getBoundingClientRect();
            const mx = e.clientX - sr.left, my = e.clientY - sr.top;
            cards.forEach((card, i) => {
                const c = centers[i] || { x: sr.width / 2, y: sr.height / 2, w: sr.width, h: sr.height };
                const dx = clamp((mx - c.x) / (c.w / 2));
                const dy = clamp((my - c.y) / (c.h / 2));
                st[i].tRy = dx * MAX_RY;
                st[i].tRx = -dy * MAX_RX;
            });
            kick();
        });
        section.addEventListener('mouseleave', () => {
            st.forEach((s) => { s.tRy = 0; s.tRx = 0; });
            kick();
        });
    }
})();

