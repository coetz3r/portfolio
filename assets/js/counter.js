  (function() {
    // Unique namespace for your domain
    const NAMESPACE = 'waoumii-site'; 
    
    // Automatically extract page name (e.g., 'index', 'portfolio', 'moringa')
    let pageKey = window.location.pathname.split('/').pop().replace('.html', '') || 'home';

    // Log the hit (increments count by 1 in the background)
    fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${pageKey}/up`)
      .catch(err => console.error('Counter error:', err));
  })();
