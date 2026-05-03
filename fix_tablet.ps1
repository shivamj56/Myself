$cssFile = "c:\My portfolio\style.css"
$enc = [System.Text.UTF8Encoding]::new($false)
$content = [System.IO.File]::ReadAllText($cssFile, $enc)

# Replace the existing 1024px block (it's small) with a comprehensive one
$oldBlock = @"
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
"@

$newBlock = @"
  /* =============================================
     TABLET (769px - 1024px)
     ============================================= */
  @media (min-width: 769px) and (max-width: 1024px) {

      /* --- Navbar --- */
      .navbar-wrapper { padding: 1.2rem 2rem; }
      .hamburger-menu { display: flex; }
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

      /* --- Hero --- */
      .hero { padding: 0 2rem; }
      .hd-content {
          padding: 2rem 2rem 4rem 2rem !important;
          top: auto !important; bottom: 0 !important; transform: none !important;
          flex-direction: column !important; justify-content: flex-end !important;
          gap: 1.5rem !important; align-items: flex-start;
      }
      .hd-headline { font-size: clamp(2rem, 5vw, 3.2rem) !important; }
      .hd-left, .hd-right { max-width: 100%; }
      .hd-bg-text { font-size: clamp(6rem, 18vw, 12rem); bottom: 2vh; }
      .hero-3d-model { top: 10%; right: 0; width: 60%; height: 80%; opacity: 0.4; pointer-events: none; }

      /* --- Tech Specs --- */
      .puzzle-specs { padding: 5rem 2rem !important; }
      .puzzle-header h2 { font-size: 2.2rem; }
      .puzzle-grid { grid-template-columns: 1fr 1fr; gap: 1.5rem; }
      .puzzle-rings { display: none; }
      .puzzle-card { padding: 2rem 1.5rem !important; }

      /* --- About --- */
      .about { padding: 8rem 3rem; }
      .about-text { font-size: clamp(1.2rem, 2.5vw, 1.6rem); }

      /* --- Core Competencies --- */
      .expertise {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          height: auto !important;
          min-height: auto !important;
          padding: 5rem 3rem 4rem !important;
          position: relative; overflow: hidden;
      }
      .expertise-bg-video {
          position: absolute !important; top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
          opacity: 0.2 !important; pointer-events: none;
      }
      .expertise-center-focus {
          position: relative !important; z-index: 2;
          order: -1;
          margin: 0 0 3rem 0 !important;
          text-align: center; width: 100%;
      }
      .ex-headline { font-size: clamp(2.5rem, 5vw, 3.5rem) !important; }
      .ex-sub { font-size: 1rem; max-width: 500px; margin: 0 auto; }
      .ex-nodes-container {
          position: relative !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 1.5rem !important;
          width: 100% !important; height: auto !important;
          z-index: 2; padding: 0 !important;
          order: 0;
      }
      .ex-node {
          position: relative !important;
          top: auto !important; left: auto !important;
          right: auto !important; bottom: auto !important;
          width: 100% !important; height: auto !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 0.8rem !important;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 1.5rem !important;
      }
      .node-icon { margin-bottom: 0.5rem !important; width: 42px !important; height: 42px !important; }
      .node-text {
          position: relative !important;
          top: auto !important; left: auto !important;
          right: auto !important; bottom: auto !important;
          width: 100% !important; text-align: left !important;
      }
      .node-tl .node-text, .node-bl .node-text,
      .node-tr .node-text, .node-br .node-text { text-align: left !important; }
      .node-text h4 { font-size: 1rem !important; text-align: left !important; }
      .node-text p { font-size: 0.85rem !important; }
      .ex-line { display: none !important; }

      /* --- Project Highlights --- */
      .work { padding: 5rem 2rem; overflow-x: hidden; }
      .work-header h2 { font-size: 2.5rem; }
      .premium-carousel-wrapper {
          flex-direction: column !important;
          height: auto !important; align-items: stretch !important;
          width: calc(100% + 4rem) !important;
          margin-left: -2rem !important; margin-right: -2rem !important;
          padding: 0 !important; margin-top: 2rem !important;
          overflow: hidden !important;
          left: auto !important; right: auto !important;
      }
      .premium-track {
          flex-direction: column !important;
          width: 100% !important; gap: 2rem !important;
          display: flex !important; transform: none !important;
          padding: 0 2rem !important;
      }
      .premium-card {
          width: 100% !important; height: auto !important;
          min-height: 220px !important; padding: 0 !important;
          margin-left: 0 !important; transform: none !important;
      }
      .tilt-wrapper { transform: none !important; }
      .card-glass { padding: 2rem !important; border-radius: 20px; }
      .card-metric { font-size: 2.2rem !important; }
      .heading { font-size: 1.3rem !important; }

      /* --- Contact Section --- */
      .ai-contact {
          min-height: 100vh; padding: 0;
          display: flex; align-items: center;
          justify-content: center; overflow: hidden;
      }
      .ai-bg-text {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 100%; z-index: 1;
      }
      .ai-bg-text span { font-size: 12vw !important; line-height: 0.85; }
      .ai-center-char {
          position: absolute !important;
          top: 0; left: 50% !important;
          transform: translateX(-50%) !important;
          width: 100vw !important; height: 100% !important;
          z-index: 2; pointer-events: none;
      }
      .ai-center-char video {
          width: 100vw !important; height: 100% !important;
          object-fit: cover; opacity: 0.55;
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
          padding: 1rem 2rem; font-size: 0.85rem;
      }
      .ai-bottom-center {
          position: relative !important;
          bottom: auto !important; left: auto !important;
          transform: none !important;
          width: 100%; text-align: center;
          padding: 0.8rem 2rem;
      }
      .ai-bottom-right {
          position: relative !important;
          bottom: auto !important; right: auto !important;
          width: 100%; text-align: center;
          padding: 1rem 2rem; margin-bottom: 3rem;
      }
      .ai-bottom-right p { text-align: center; margin-bottom: 0.8rem; }
      .ai-socials { justify-content: center; gap: 1.5rem; }
  }
"@

$content = $content.Replace($oldBlock, $newBlock)
[System.IO.File]::WriteAllText($cssFile, $content, $enc)
Write-Host "SUCCESS: Tablet CSS written."
