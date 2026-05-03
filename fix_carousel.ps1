$cssFile = "c:\My portfolio\style.css"
$enc = [System.Text.UTF8Encoding]::new($false)
$content = [System.IO.File]::ReadAllText($cssFile, $enc)

# Fix 1: Tablet work section - replace column stack with horizontal swipe carousel
$oldTablet = @"
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
"@

$newTablet = @"
      /* --- Project Highlights (Tablet: horizontal swipe) --- */
      .work { padding: 5rem 0 5rem; overflow: hidden; }
      .work-header { padding: 0 2rem; }
      .work-header h2 { font-size: 2.5rem; }
      .premium-carousel-wrapper {
          width: 100vw !important;
          height: auto !important;
          left: auto !important; right: auto !important;
          margin-left: 0 !important; margin-right: 0 !important;
          padding: 0 !important;
          margin-top: 2rem !important;
          overflow-x: scroll !important;
          overflow-y: visible !important;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          display: flex !important;
          align-items: center !important;
          flex-direction: row !important;
      }
      .premium-carousel-wrapper::-webkit-scrollbar { display: none; }
      .premium-track {
          display: flex !important;
          flex-direction: row !important;
          gap: 1.5rem !important;
          padding: 1rem 2rem 3rem 2rem !important;
          width: max-content !important;
          height: auto !important;
          transform: none !important;
          align-items: stretch;
      }
      .premium-card {
          width: 72vw !important;
          max-width: 420px !important;
          height: auto !important;
          min-height: 320px !important;
          flex-shrink: 0 !important;
          scroll-snap-align: start;
          transform: none !important;
          padding: 0 !important;
          margin-left: 0 !important;
      }
      .tilt-wrapper { width: 100% !important; height: 100% !important; transform: none !important; }
      .card-glass { padding: 2rem !important; border-radius: 20px; height: 100%; box-sizing: border-box; }
      .card-metric { font-size: 2.2rem !important; }
      .heading { font-size: 1.3rem !important; }
"@

$content = $content.Replace($oldTablet, $newTablet)

# Fix 2: Mobile work section - same approach at phone scale
$oldMobile = @"
       /* --- Project Highlights (Mobile: swipe carousel) --- */
       .work { padding: 3rem 0 3rem; overflow: hidden; }
       .work-header { padding: 0 1.5rem; }
       .work-header h2 { font-size: 2rem; }
       .premium-carousel-wrapper {
           width: 100vw !important;
           height: auto !important;
           left: auto !important; right: auto !important;
           margin-left: 0 !important; margin-right: 0 !important;
           padding: 0 !important;
           margin-top: 1.5rem !important;
           overflow-x: scroll !important;
           overflow-y: visible !important;
           -webkit-overflow-scrolling: touch;
           scroll-snap-type: x mandatory;
           scrollbar-width: none;
           display: flex !important;
           align-items: center !important;
           position: relative;
       }
       .premium-carousel-wrapper::-webkit-scrollbar { display: none; }
       .premium-track {
           display: flex !important;
           flex-direction: row !important;
           gap: 1rem !important;
           padding: 1rem 1.5rem 2.5rem 1.5rem !important;
           width: max-content !important;
           height: auto !important;
           transform: none !important;
           align-items: stretch;
       }
       .premium-card {
           width: 82vw !important;
           max-width: 340px !important;
           height: auto !important;
           min-height: 260px !important;
           flex-shrink: 0 !important;
           scroll-snap-align: start;
           transform: none !important;
           padding: 0 !important;
           margin-left: 0 !important;
       }
       .tilt-wrapper { width: 100% !important; height: 100% !important; transform: none !important; }
       .card-glass { padding: 1.5rem !important; border-radius: 16px; height: 100%; }
       .card-metric { font-size: 1.8rem !important; }
"@

$oldMobileFallback = @"
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
"@

$newMobile = @"
       /* --- Project Highlights (Mobile: horizontal swipe) --- */
       .work { padding: 3rem 0 3rem; overflow: hidden; }
       .work-header { padding: 0 1.5rem; }
       .work-header h2 { font-size: 2rem; }
       .premium-carousel-wrapper {
           width: 100vw !important;
           height: auto !important;
           left: auto !important; right: auto !important;
           margin-left: 0 !important; margin-right: 0 !important;
           padding: 0 !important;
           margin-top: 1.5rem !important;
           overflow-x: scroll !important;
           overflow-y: visible !important;
           -webkit-overflow-scrolling: touch;
           scroll-snap-type: x mandatory;
           scrollbar-width: none;
           display: flex !important;
           align-items: center !important;
           flex-direction: row !important;
       }
       .premium-carousel-wrapper::-webkit-scrollbar { display: none; }
       .premium-track {
           display: flex !important;
           flex-direction: row !important;
           gap: 1rem !important;
           padding: 1rem 1.5rem 2.5rem 1.5rem !important;
           width: max-content !important;
           height: auto !important;
           transform: none !important;
           align-items: stretch;
       }
       .premium-card {
           width: 82vw !important;
           max-width: 340px !important;
           height: auto !important;
           min-height: 260px !important;
           flex-shrink: 0 !important;
           scroll-snap-align: start;
           transform: none !important;
           padding: 0 !important;
           margin-left: 0 !important;
       }
       .tilt-wrapper { width: 100% !important; height: 100% !important; transform: none !important; }
       .card-glass { padding: 1.5rem !important; border-radius: 16px; height: 100%; box-sizing: border-box; }
       .card-metric { font-size: 1.8rem !important; }
"@

# Try replacing the already-updated mobile block first, then fallback to old
if ($content.Contains($oldMobile)) {
    $content = $content.Replace($oldMobile, $newMobile)
    Write-Host "Mobile: replaced updated block"
} elseif ($content.Contains($oldMobileFallback)) {
    $content = $content.Replace($oldMobileFallback, $newMobile)
    Write-Host "Mobile: replaced fallback block"
} else {
    Write-Host "Mobile: block not found - check manually"
}

[System.IO.File]::WriteAllText($cssFile, $content, $enc)
Write-Host "SUCCESS: Swipe carousel CSS written."
