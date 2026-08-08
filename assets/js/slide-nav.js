const layout = document.getElementById('layout');
  const screenInner = document.getElementById('screenInner');
  const screenDim = document.getElementById('screenDim');
  const stickyNav = document.getElementById('stickyNav');
  const firstMenuLink = document.getElementById('firstMenuLink');
  const burgers = document.querySelectorAll('.burger');
  const menuClose = document.querySelector('.menu-close');
  const sentinel = document.getElementById('navSentinel');

  const desktopQuery = window.matchMedia('(min-width: 860px)');

  function setBurgersExpanded(state) {
    burgers.forEach(b => b.setAttribute('aria-expanded', state));
  }

  // sticky-nav is inert whenever it's not visually reachable: either it
  // hasn't dropped down yet, or the drawer is open and has priority.
  function syncStickyNavInert() {
    const drawerOpen = layout.classList.contains('menu-open');
    const scrolledPast = stickyNav.classList.contains('visible');
    if (scrolledPast && !drawerOpen) {
      stickyNav.removeAttribute('inert');
    } else {
      stickyNav.setAttribute('inert', '');
    }
  }

  function resetMenuState() {
    layout.classList.remove('menu-open');
    setBurgersExpanded('false');
    screenInner.removeAttribute('inert');
    screenInner.removeAttribute('aria-hidden');
    if (!desktopQuery.matches) document.body.style.overflow = '';
    syncStickyNavInert();
  }

  function openMenu() {
    layout.classList.add('menu-open');
    setBurgersExpanded('true');
    screenInner.setAttribute('inert', '');
    screenInner.setAttribute('aria-hidden', 'true');
    firstMenuLink.focus();
    if (!desktopQuery.matches) document.body.style.overflow = 'hidden';
    syncStickyNavInert();
  }

  function closeMenu() {
    resetMenuState();
    burgers[0].focus();
  }

  function toggleMenu() {
    layout.classList.contains('menu-open') ? closeMenu() : openMenu();
  }

  burgers.forEach(b => b.addEventListener('click', toggleMenu));
  screenDim.addEventListener('click', closeMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && layout.classList.contains('menu-open')) closeMenu();
  });

  desktopQuery.addEventListener('change', (e) => {
    if (e.matches) resetMenuState();
  });

 // IntersectionObserver on #navSentinel
  const navObserver = new IntersectionObserver(([entry]) => {
    const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    stickyNav.classList.toggle('visible', scrolledPast);
    syncStickyNavInert();
  }, { threshold: 0 });

  navObserver.observe(sentinel);
  
// Fallback specifically for Chrome anchor jumps / reload scroll restoration
  const handleScrollOrHash = () => {
    if (!sentinel) return;
    const rect = sentinel.getBoundingClientRect();
    if (rect.top < 0) {
      stickyNav.classList.add('visible');
      syncStickyNavInert();
    }
  };

  // Listen to immediate scroll & hash events on load
  window.addEventListener('scroll', handleScrollOrHash, { passive: true, once: true });
  window.addEventListener('hashchange', handleScrollOrHash);
  
  if (window.location.hash) {
    setTimeout(handleScrollOrHash, 100);
  }

