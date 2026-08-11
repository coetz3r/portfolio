(function() {
  const NAMESPACE = 'waoumii-portfolio'; 
  
  let pageKey = window.location.pathname.split('/').pop().replace('.html', '').trim();
  if (!pageKey || pageKey === 'index') {
    pageKey = 'home';
  }

  // Bumps count by 1 in background
  fetch(`https://counterapi.com/api/v1/${NAMESPACE}/${pageKey}/up`)
    .catch(err => console.error('Tracker error:', err));
})();