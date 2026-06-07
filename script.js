import { animate, spring, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm";

// --- Terminal Preloader Logic ---
const clearPreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('fade-out')) {
        preloader.classList.add('fade-out');
        window.scrollTo(0, 0);
    }
};

window.addEventListener('load', () => {
    setTimeout(clearPreloader, 1000);
});

// Fallback timeout in case window.load hangs due to 403 errors (e.g. Spline)
setTimeout(clearPreloader, 3500);

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Normalize scroll for mobile touch devices to ensure smooth pinning
if (ScrollTrigger.isTouch) {
    ScrollTrigger.normalizeScroll({ 
        allowNestedScroll: true,
        momentum: true
    });
}

// Initialize Smooth Scroll (Lenis)
const lenis = new Lenis({
    lerp: 0.1,
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 1,
    infinite: false,
});

// Anchor link smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        lenis.scrollTo(target, { duration: 2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    });
});

// Integrate Lenis with GSAP ScrollTrigger for optimal performance
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// --- Hide Navbar on Scroll ---
gsap.to('.navbar-wrapper', {
    yPercent: -100,
    opacity: 0,
    ease: "power2.out",
    scrollTrigger: {
        trigger: ".hero-container",
        start: "bottom top",
        end: "+=150",
        scrub: true
    }
});

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


// --- Staggered Fade-in-up Animations on Load ---
document.addEventListener("DOMContentLoaded", () => {
    // Select specific badges, headline, subtitle, and buttons as requested
    const heroElements = document.querySelectorAll(".hd-status-pill, .hd-headline, .hd-desc, .hd-btn");
    
    // Set initial opacity to 0
    heroElements.forEach(el => el.style.opacity = '0');

    // Run staggered motion load animation
    if (heroElements.length > 0) {
        animate(
            heroElements,
            { y: [40, 0], opacity: [0, 1] },
            { delay: stagger(0.15), duration: 0.8, easing: "ease-out" }
        );
    }
});

// --- HLS.js Background Video Component ---
// Implementation using memoized component mounting/unmounting structure pattern in vanilla JS
document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("about-video");
    const videoSrc = "https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8";

    if (video) {
        let hls;
        
        // Component Mount equivalent
        const mount = () => {
            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(videoSrc);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(err => console.log("Autoplay prevented:", err));
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                // Native Safari support fallback
                video.src = videoSrc;
                video.addEventListener("loadedmetadata", () => {
                    video.play().catch(err => console.log("Autoplay prevented:", err));
                });
            }
        };

        // Component Unmount cleanup equivalent 
        const unmount = () => {
            if (hls) {
                hls.destroy();
            }
        };

        // Initialize component lifecycle
        mount();
        
        // Setup global reference for manual cleanup if necessary
        window.aboutVideoCleanup = unmount;
    }
});

// --- custom cursor (High-Performance GSAP quickTo) ---
const cursor = document.querySelector('.cursor');
const editables = document.querySelectorAll('a, .magnetic, .work-item');

if (cursor) {
    // Use GSAP's quickTo for high-frequency mousemove events
    let xTo = gsap.quickTo(cursor, "x", {duration: 0.1, ease: "power3"});
    let yTo = gsap.quickTo(cursor, "y", {duration: 0.1, ease: "power3"});

    document.addEventListener('mousemove', (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
    });

    editables.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
}

// --- Hero Background Reveal ---
const heroBgOverlay = document.querySelector('.hero-bg-overlay');
const heroSubjectTrigger = document.querySelector('.hero-subject-hover');

if (heroSubjectTrigger && heroBgOverlay) {
    heroSubjectTrigger.addEventListener('mouseenter', () => {
        gsap.to(heroBgOverlay, { opacity: 1, duration: 0.6, ease: 'power2.out', overwrite: "auto" });
        if (cursor) cursor.classList.add('active'); // Enlarge cursor
    });

    heroSubjectTrigger.addEventListener('mouseleave', () => {
        gsap.to(heroBgOverlay, { opacity: 0, duration: 0.6, ease: 'power2.out', overwrite: "auto" });
        if (cursor) cursor.classList.remove('active');
    });
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

// --- Hero Animations (Scroll Triggered) ---
gsap.fromTo('.fade-up',
    { y: 60, opacity: 0 },
    {
        y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: 'power2.out',
        scrollTrigger: {
            trigger: ".hero-container",
            start: "top 80%",
            toggleActions: "play none none none"
        }
    }
);



// --- Cinematic Hero to Content Transition ---
const heroSection = document.querySelector('.hero');
const targetSection = document.querySelector('.about');

if (heroSection && targetSection) {
    gsap.to(['.hero-domi-layout', '.hero-parallax-wrapper', '.hero-3d-model'], {
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
// Apply ultra-smooth Framer-style blur-fade sequences to all core cards and nodes
gsap.utils.toArray('.expert-card, .puzzle-card, .puzzle-header h2, .ex-node').forEach((elem, index) => {
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
            stagger: 0.1
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

gsap.to('.about-fg-layer', {
    yPercent: -50,
    ease: "none",
    scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true }
});

gsap.to('.parallax-fast', {
    y: -60,
    ease: "none",
    scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true }
});

// --- Work Section: each panel independently looks at the mouse (per-card), over a video bg ---
// ▸ EDIT YOUR PROJECTS HERE: title, description, live-demo url (opens new tab), optional image.
//   url "" => "Coming soon" (non-clickable). image => full-bleed screenshot panel.
//   Per-card depth is in style.css (.work-card:nth-child(n) translateZ) and DEPTH[] below.
const PROJECTS = [
    { title: "NexeraAI", description: "An AI-powered job platform — résumé compatibility scoring, top-company referrals, and smart search to fast-track your career.", url: "https://nexera-ai-xi.vercel.app/", image: "assets/nexera.jpg" },
    { title: "Coming Soon", description: "A new project is in the works — check back soon.", url: "" },
    { title: "Coming Soon", description: "A new project is in the works — check back soon.", url: "" },
    { title: "Coming Soon", description: "A new project is in the works — check back soon.", url: "" },
    { title: "Coming Soon", description: "A new project is in the works — check back soon.", url: "" },
    { title: "Coming Soon", description: "A new project is in the works — check back soon.", url: "" }
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

