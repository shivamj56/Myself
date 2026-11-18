/* Preview bridge for the live preview on shivamjha.dev (preview.js).
 *
 * Add this script to a project site (inline before </body>, or as a file) so that its desktop window and its
 * iPhone on shivamjha.dev scroll together. It does nothing unless the page is shown inside a frame by
 * shivamjha.dev, or by a copy of it on this computer for testing. It then shares only where the page is
 * scrolled and the page's path, and it scrolls to the place it is sent. It reads nothing else and sends nothing else.
 *
 * Messages (all carry ns: 'sj-preview'):
 *   from shivamjha.dev  { type: 'hello' }                     -> { type: 'ready', path }
 *   from shivamjha.dev  { type: 'scrollTo', s, f, p, n }      -> scrolls: section s at fraction f, or share p of the page
 *   to shivamjha.dev    { type: 'scroll', s, f, p, n, user, path } on every scroll (user is false while it follows) */
(function () {
    if (window.parent === window) return;
    var NS = 'sj-preview';
    var ALLOWED = /^https:\/\/(www\.)?shivamjha\.dev$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    var LINE = 0.3; // the reading line, 30% down the screen
    var host = '';
    var quietUntil = 0;
    var queued = false;

    function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
    function scroller() { return document.scrollingElement || document.documentElement; }
    function maxScroll() { return Math.max(0, scroller().scrollHeight - window.innerHeight); }

    // The page's top-level sections (a section pinned by GSAP is measured by its pin-spacer).
    function marks() {
        var found = document.querySelectorAll('section, footer');
        var out = [];
        for (var i = 0; i < found.length; i++) {
            var el = found[i];
            var up = el.parentElement;
            if (up && up.closest && up.closest('section, footer')) continue;
            out.push(up && up.classList && up.classList.contains('pin-spacer') ? up : el);
        }
        return out;
    }

    function where() {
        var line = window.innerHeight * LINE;
        var max = maxScroll();
        var y = window.pageYOffset || scroller().scrollTop || 0;
        var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
        var list = marks();
        for (var i = 0; i < list.length; i++) {
            var r = list[i].getBoundingClientRect();
            if (r.height > 0 && r.top <= line && r.bottom > line) return { s: i, f: (line - r.top) / r.height, p: p, n: list.length };
        }
        return { s: -1, f: 0, p: p, n: list.length };
    }

    function report() {
        queued = false;
        if (!host) return;
        var w = where();
        w.ns = NS;
        w.type = 'scroll';
        w.user = now() > quietUntil;
        w.path = location.pathname;
        window.parent.postMessage(w, host);
    }

    function go(d) {
        var max = maxScroll();
        var y;
        if (d.p <= 0.002) y = 0;
        else if (d.p >= 0.998) y = max;
        else {
            var list = marks();
            if (d.s >= 0 && d.n === list.length && list[d.s]) {
                var r = list[d.s].getBoundingClientRect();
                y = (window.pageYOffset || 0) + r.top + d.f * r.height - window.innerHeight * LINE;
            } else {
                y = d.p * max;
            }
        }
        y = Math.round(Math.max(0, Math.min(max, y)));
        quietUntil = now() + 300;
        var html = document.documentElement;
        var before = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);
        html.style.scrollBehavior = before;
    }

    window.addEventListener('scroll', function () {
        if (queued) return;
        queued = true;
        (window.requestAnimationFrame || setTimeout)(report);
    }, { passive: true });

    window.addEventListener('message', function (e) {
        var d = e.data;
        if (e.source !== window.parent || !ALLOWED.test(e.origin) || !d || d.ns !== NS) return;
        host = e.origin;
        if (d.type === 'hello') window.parent.postMessage({ ns: NS, type: 'ready', v: 1, path: location.pathname }, host);
        else if (d.type === 'scrollTo' && typeof d.p === 'number') go(d);
    });
})();
