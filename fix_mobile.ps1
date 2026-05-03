$cssFile = "c:\My portfolio\style.css"
$enc = [System.Text.UTF8Encoding]::new($false)
$content = [System.IO.File]::ReadAllText($cssFile, $enc)

$marker = "  /* Responsive */"
$idx = $content.IndexOf($marker)

if ($idx -lt 0) {
    Write-Host "Marker not found. Trying alternate..."
    # Fallback: just cut at line 1675 (approx)
    $lines = $content.Split("`n")
    $baseLines = $lines[0..1674]
    $base = $baseLines -join "`n"
} else {
    $base = $content.Substring(0, $idx)
}

$responsive = @"
  /* =============================================
     RESPONSIVE STYLES
     ============================================= */

  @media (max-width: 1024px) {
      .navbar-wrapper { padding: 1.5rem 2rem; }
      .ex-line { display: none; }
      .ex-nodes-container {
          position: relative !important;
          width: 100% !important;
          height: auto !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding-top: 3rem;
      }
      .ex-node {
          position: relative !important;
          top: auto !important; left: auto !important;
          right: auto !important; bottom: auto !important;
          width: 100% !important; height: auto !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
      }
      .node-icon { margin-bottom: 1rem; }
      .node-text {
          position: relative !important; width: 100% !important;
          top: auto !important; left: auto !important;
          right: auto !important; bottom: auto !important;
          text-align: center !important;
      }
      .node-text h4 { text-align: center !important; }
      .expertise-center-focus { position: relative !important; z-index: 10; margin: 3rem auto; }
  }

  @media (max-width: 768px) {

      /* Navbar */
      .navbar-wrapper { flex-direction: row; justify-content: space-between; padding: 1rem 1.5rem; gap: 0; }
      .nav-logo { display: block; text-align: left; font-size: 1.1rem !important; max-width: 60%; }
      .hamburger-menu { display: flex; margin-left: auto; }
      .nav-minimal-menu {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100vh;
          background: rgba(10,10,10,0.95);
          backdrop-filter: blur(15px);
          flex-direction: column; justify-content: center; align-items: center;
          gap: 2rem; font-size: 1.5rem;
          opacity: 0; pointer-events: none;
          transition: opacity 0.4s ease; z-index: -1;
      }
      .nav-minimal-menu.active { opacity: 1; pointer-events: auto; }

      /* Hero */
      .hero { padding: 0 1rem; justify-content: flex-end; padding-bottom: 2rem; }
      .hd-content {
          padding: 2rem 1rem 3rem 1rem !important;
          top: auto !important; bottom: 0 !important; transform: none !important;
          flex-direction: column !important; justify-content: flex-end !important;
          gap: 1rem !important; text-align: left; align-items: flex-start;
      }
      .hd-headline { font-size: clamp(1.5rem, 6vw, 2.2rem) !important; text-align: left; margin-bottom: 0.5rem; }
      .hd-left, .hd-right { max-width: 100%; align-items: flex-start; text-align: left; }
      .hd-status-pill { align-self: flex-start; }
      .hd-bg-text { display: none; }
      .hero-3d-model { top: 15%; right: 0; width: 100%; height: 60%; opacity: 0.3; pointer-events: none; }

      /* Tech Specs */
      .puzzle-specs { padding: 4rem 1rem !important; }
      .puzzle-header h2 { font-size: 1.6rem; }
      .puzzle-grid { grid-template-columns: 1fr; gap: 1rem; }
      .puzzle-rings { display: none; }
      .puzzle-card { padding: 1.5rem 1rem !important; }

      /* About */
      .about { padding: 6rem 1.5rem; }
      .about-text { font-size: 1.3rem; text-align: center; }

      /* Core Competencies: Complete Mobile Redesign */
      .expertise {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: flex-start !important;
          height: auto !important;
          min-height: auto !important;
          padding: 4rem 1.5rem 3rem !important;
          position: relative;
          overflow: hidden;
      }
      .expertise-bg-video {
          position: absolute !important;
          top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
          opacity: 0.12 !important;
          pointer-events: none;
      }
      .expertise-center-focus {
          position: relative !important;
          z-index: 2;
          margin: 0 0 2.5rem 0 !important;
          text-align: center; width: 100%;
      }
      .ex-headline { font-size: clamp(1.8rem, 7vw, 2.4rem) !important; letter-spacing: -1px; }
      .ex-sub { font-size: 0.9rem; }
      .ex-nodes-container {
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 1rem !important;
          width: 100% !important; height: auto !important;
          z-index: 2; padding: 0 !important;
          pointer-events: auto !important;
      }
      .ex-node {
          position: relative !important;
          top: auto !important; left: auto !important;
          right: auto !important; bottom: auto !important;
          width: 100% !important; height: auto !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          gap: 1rem !important;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 1.2rem !important;
      }
      .node-icon {
          flex-shrink: 0;
          width: 38px !important; height: 38px !important;
          margin-bottom: 0 !important; font-size: 0.9rem !important;
      }
      .node-text {
          position: relative !important;
          top: auto !important; left: auto !important;
          right: auto !important; bottom: auto !important;
          width: auto !important; flex: 1;
          text-align: left !important;
      }
      .node-tl .node-text, .node-bl .node-text,
      .node-tr .node-text, .node-br .node-text { text-align: left !important; }
      .node-text h4 { font-size: 0.95rem !important; text-align: left !important; margin-bottom: 4px; }
      .node-text p { font-size: 0.82rem !important; line-height: 1.4; }
      .ex-line { display: none !important; }

      /* Project Highlights */
      .work { padding: 3rem 1.5rem; overflow-x: hidden; }
      .work-header h2 { font-size: 2rem; }
      .premium-carousel-wrapper {
          flex-direction: column;
          height: auto !important; align-items: stretch;
          width: calc(100% + 3rem) !important;
          margin-left: -1.5rem !important; margin-right: -1.5rem !important;
          padding: 0; margin-top: 1rem; overflow: hidden;
          left: auto !important; right: auto !important;
      }
      .premium-track {
          flex-direction: column !important;
          width: 100% !important; gap: 1.5rem !important;
          display: flex !important; transform: none !important;
          padding: 0 1.5rem !important;
      }
      .premium-card {
          width: 100% !important; height: auto !important;
          min-height: 180px !important; padding: 0 !important;
          margin-left: 0 !important; transform: none !important;
      }
      .tilt-wrapper { transform: none !important; }
      .card-glass { padding: 1.5rem !important; border-radius: 16px; }
      .card-metric { font-size: 1.8rem !important; }

      /* Contact Section */
      .ai-contact {
          min-height: 100vh; padding: 0;
          display: flex; align-items: center;
          justify-content: center; overflow: hidden;
      }
      .ai-bg-text {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 100%; z-index: 1;
      }
      .ai-bg-text span { font-size: 16vw !important; line-height: 0.82; }
      .ai-center-char {
          position: absolute !important;
          top: 0; left: 0;
          width: 100vw !important; height: 100% !important;
          z-index: 2; pointer-events: none;
      }
      .ai-center-char video {
          width: 100vw !important; height: 100% !important;
          object-fit: cover; opacity: 0.5;
      }
      .ai-contact-content {
          position: relative; width: 100%; height: 100vh;
          pointer-events: none; padding: 0;
          display: flex; flex-direction: column;
          justify-content: flex-end; align-items: center;
      }
      .ai-contact-content > * { pointer-events: auto; z-index: 5; }
      .ai-top-left { display: none; }
      .ai-right-rot { display: none; }
      .ai-bottom-left {
          position: relative !important;
          bottom: auto !important; left: auto !important;
          width: 100%; text-align: center;
          padding: 0.8rem 1rem; font-size: 0.75rem;
      }
      .ai-bottom-center {
          position: relative !important;
          bottom: auto !important; left: auto !important;
          transform: none !important;
          width: 100%; text-align: center;
          padding: 0.5rem 1rem;
      }
      .ai-bottom-right {
          position: relative !important;
          bottom: auto !important; right: auto !important;
          width: 100%; text-align: center;
          padding: 0.8rem 1rem; margin-bottom: 2.5rem;
      }
      .ai-bottom-right p { text-align: center; margin-bottom: 0.5rem; font-size: 0.78rem; }
      .ai-socials { justify-content: center; gap: 1.5rem; }
  }
"@

$final = $base + $responsive
[System.IO.File]::WriteAllText($cssFile, $final, $enc)
Write-Host "SUCCESS: Responsive CSS rewritten."
