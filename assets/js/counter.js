(function() {
  const NAMESPACE = 'waoumii-portfolio'; 
  
  let pageKey = window.location.pathname.split('/').pop().replace('.html', '').trim();
  if (!pageKey || pageKey === 'index') {
    pageKey = 'home';
  }

  fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${pageKey}`)
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




