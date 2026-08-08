/* ──────────────────────────────────────
   Portfolio — EmailJS Integration
   ────────────────────────────────────── */

// ---- EmailJS Configuration ----
const EMAILJS_PUBLIC_KEY = 'b2tPPog2X_QrzpiCI';
const EMAILJS_SERVICE_ID = 'service_f5wqyjv';
const EMAILJS_TEMPLATE_ID = 'template_18qmdru';

const TO_EMAIL = 'coetzer69@gmail.com';

function getContactFields() {
  return {
    fullname: document.getElementById('fullname'),
    email:    document.getElementById('email'),
    phone:    document.getElementById('phone'),
    category: document.getElementById('category'),
    message:  document.getElementById('message'),
  };
}

// Updates the button's visible label without wiping out child
// markup (e.g. the icon span) the way button.textContent = '...' would.
function setButtonLabel(button, text) {
  const label = button.querySelector('.btn-text');
  if (label) {
    label.textContent = text;
  } else {
    button.textContent = text;
  }
}

function validateForm() {
  const fields = getContactFields();
  let allValid = true;

  Object.values(fields).forEach((el) => {
    const group = el?.closest('.form-group');
    if (!el || !group) return;
    if (el.value.trim() === '') {
      group.classList.add('error');
      allValid = false;
    } else {
      group.classList.remove('error');
    }
  });

  return allValid;
}

async function sendEmail(e, btn) {
  if (e) e.preventDefault();

  const button = btn || e?.target?.closest('button');
  if (!button) return;

  const originalLabel = button.querySelector('.btn-text')?.textContent
    || button.textContent.trim()
    || 'Submit';

  if (!validateForm()) return;

  const { fullname, email, phone, category, message } = getContactFields();

  const templateParams = {
    from_name: fullname?.value.trim() || 'Anonymous',
    reply_to:  email?.value.trim() || '',
    phone:     phone?.value.trim() || 'Not provided',
    category:  category?.value || 'Not specified',
    message:   message?.value.trim() || 'No message provided.',
    to_email:  TO_EMAIL,
  };

  button.disabled = true;
  setButtonLabel(button, 'Sending…');

  try {
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS not loaded — check that the EmailJS <script> tag is in index.html, before main.js.');
      setButtonLabel(button, 'EmailJS not available');
      button.style.background = '#DC2626';
      setTimeout(() => {
        button.disabled = false;
        setButtonLabel(button, originalLabel);
        button.style.background = '';
      }, 3000);
      return;
    }

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

    setButtonLabel(button, 'Sent ✓');
    button.style.background = '#16A34A';

    Object.values(getContactFields()).forEach((f) => {
      if (f) f.value = '';
    });
  } catch (err) {
    console.error('EmailJS error:', err);
    setButtonLabel(button, 'Failed — try again');
    button.style.background = '#DC2626';
  }

  setTimeout(() => {
    button.disabled = false;
    setButtonLabel(button, originalLabel);
    button.style.background = '';
  }, 3000);
}

/* ── Mobile Navigation ── */
function initMobileNav() {
  const hamburger = document.getElementById('nav-hamburger');
  const overlay   = document.getElementById('mobile-nav-overlay');
  const closeBtn  = document.getElementById('mobile-nav-close');
  const links     = overlay ? overlay.querySelectorAll('.mobile-nav-links a') : [];

  if (!hamburger || !overlay) return;

  function open() {
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function close() {
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  hamburger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  links.forEach(link => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      close();
    }
  });
}

/* ── Scroll detection for nav ── */
function initScrollNav() {
  const nav = document.getElementById('hero-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

/* ── Initialise ── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } else {
    console.warn('EmailJS SDK not found — check the CDN <script> tag is in index.html before main.js.');
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const button = contactForm.querySelector('button[type="submit"]');
      sendEmail(e, button);
    });
  }

  initMobileNav();
  initScrollNav();
});