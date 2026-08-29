(function() {
  // ===================================================
  // CONFIG SEGMENT (Swap or toggle here)
  // ===================================================
  const IS_LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  
  // Use a separate dev namespace so local tests don't skew production hits
  const NAMESPACE = IS_LOCAL ? 'waoumii-portfolio-dev' : 'waoumii-portfolio';
  
  // Set to 'true' if you want to disable tracking entirely while coding locally
  const MUTE_LOCAL_TRACKING = false;

  if (IS_LOCAL && MUTE_LOCAL_TRACKING) {
    console.log(`[Dev Mode] Tracking muted on ${location.hostname}`);
    return;
  }

  // ===================================================
  // TRACKER LOGIC
  // ===================================================
  let pageKey = window.location.pathname.split('/').pop().replace('.html', '').trim();
  if (!pageKey || pageKey === 'index') {
    pageKey = 'home';
  }

  fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${pageKey}`)
    .then(res => res.json())
    .then(data => console.log(`[${NAMESPACE}] Hit recorded for ${pageKey}:`, data))
    .catch(err => console.error('Tracker error:', err));
})();

// === load into browser to start counter ======= 
/*
{
  const ns = 'waoumii-portfolio';
  const pages = ['home', 'portfolio', 'creative', 'case-study', 'project'];

  pages.forEach(async (page) => {
    try {
      const res = await fetch(`https://api.countapi.xyz/hit/${ns}/${page}`);
      const data = await res.json();
      console.log(`Initialized ${page}:`, data);
    } catch (err) {
      console.error(`Error with ${page}:`, err);
    }
  });
}
*/




