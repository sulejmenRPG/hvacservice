/* ===========================
   MAIN.JS — KD SCALA LTD
   =========================== */

// --- Smooth Image Loading (Fade-In) ---
function initImageFadeIn() {
  const images = document.querySelectorAll('.hero-img, .service-card-img img, .about-hero-img');
  images.forEach((img) => {
    if (img.complete && img.naturalWidth !== 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
    }
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImageFadeIn);
} else {
  initImageFadeIn();
}

// --- Navigation & Scroll Handler ---
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
let lastScrollY = window.scrollY;
let scrollTicking = false;
let isFormFocused = false;

function updateNavigation() {
  const currentScrollY = window.scrollY;

  // 1. Scrolled styling & smart hide/reveal for navbar
  if (navbar) {
    if (currentScrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    const isMenuOpen = navbar.classList.contains('menu-open');
    if (!isFormFocused && !isMenuOpen && currentScrollY > 80) {
      if (currentScrollY > lastScrollY && (currentScrollY - lastScrollY > 6)) {
        // Scrolling DOWN -> hide header
        navbar.classList.add('nav-hidden');
      } else if (lastScrollY - currentScrollY > 6) {
        // Scrolling UP -> reveal header
        navbar.classList.remove('nav-hidden');
      }
    } else {
      navbar.classList.remove('nav-hidden');
    }
  }

  // 2. Active nav link based on scroll position
  if (sections.length && navAnchors.length) {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      if (currentScrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navAnchors.forEach(a => {
      const href = a.getAttribute('href');
      if (href === `#${current}`) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  lastScrollY = Math.max(0, currentScrollY);
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateNavigation);
    scrollTicking = true;
  }
}, { passive: true });

// Run initial pass on page load
updateNavigation();

// --- Mobile burger menu ---
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    if (navbar) {
      navbar.classList.remove('menu-open');
      navbar.classList.remove('nav-hidden');
    }
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    navLinks.classList.add('open');
    burger.classList.add('open');
    if (navbar) navbar.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  burger.addEventListener('click', () => {
    if (navLinks.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking any navigation link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
    }
  });
}

// --- Scroll reveal animation ---
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay for grouped elements
      const delay = (i % 4) * 80;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId) return;

    // Handle scroll-to-top links like logo or href="#"
    if (targetId === '#' || targetId === '') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } catch {
      // Graceful fallback for non-selector hashes
    }
  });
});

// --- Contact form handling ---
const form = document.getElementById('contactForm');
if (form) {
  // Prevent fixed navbar rendering collision and layout jitter when virtual keyboard opens
  form.addEventListener('focusin', () => {
    isFormFocused = true;
    if (navbar) navbar.classList.add('form-active');
  });

  form.addEventListener('focusout', (e) => {
    if (!form.contains(e.relatedTarget)) {
      isFormFocused = false;
      if (navbar) navbar.classList.remove('form-active');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('formSubmit');
    const originalContent = btn.innerHTML;
    btn.innerHTML = 'Sending <i class="fa-solid fa-circle-notch fa-spin" style="margin-left: 8px;"></i>';
    btn.disabled = true;

    try {
      const formData = new FormData(form);
      const payload = {
        name: (formData.get('name') || '').trim(),
        email: (formData.get('email') || '').trim(),
        phone: (formData.get('phone') || '').trim(),
        service: formData.get('service') || '',
        message: (formData.get('message') || '').trim(),
        'bot-field': formData.get('bot-field') || '',
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      btn.innerHTML = 'Request Received <i class="fa-solid fa-check" style="margin-left: 8px;"></i>';
      btn.style.background = '#0d9488';
      form.reset();
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    } catch (err) {
      console.error('Contact form submission error:', err);
      btn.innerHTML = 'Failed to send <i class="fa-solid fa-triangle-exclamation" style="margin-left: 8px;"></i>';
      btn.style.background = '#dc2626';
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }
  });
}


// --- Desktop Click-to-Copy Handlers (with clean icon feedback, no emojis) ---
function initDesktopClipboard() {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) return; // On mobile, tel: and mailto: work natively with installed apps

  function copyTextSafe(text, callback) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(callback).catch(() => {
        execFallbackCopy(text, callback);
      });
    } else {
      execFallbackCopy(text, callback);
    }
  }

  function execFallbackCopy(text, callback) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (callback) callback();
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  }

  // 1. Emergency Banner Phone
  const emergencyPhone = document.getElementById('emergencyPhone');
  const copyTooltip = document.getElementById('copyTooltip');
  if (emergencyPhone && copyTooltip) {
    emergencyPhone.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = emergencyPhone.textContent.trim();
      copyTextSafe(phone, () => {
        copyTooltip.classList.add('show');
        setTimeout(() => copyTooltip.classList.remove('show'), 2000);
      });
    });
  }

  // Helper for contact cards (#contactPhone, #contactEmail)
  function attachCardCopy(cardId, defaultText) {
    const card = document.getElementById(cardId);
    if (!card) return;

    card.addEventListener('click', (e) => {
      e.preventDefault();
      const valEl = card.querySelector('.contact-detail-value');
      const labelEl = card.querySelector('.contact-detail-label');
      const iconEl = card.querySelector('.contact-detail-icon i');
      const textToCopy = valEl ? valEl.textContent.trim() : defaultText;

      copyTextSafe(textToCopy, () => {
        if (labelEl && iconEl) {
          const originalLabel = labelEl.innerHTML;
          const originalIconClass = iconEl.className;

          labelEl.innerHTML = `<span style="color: #2dd4bf;"><i class="fa-solid fa-check" style="margin-right: 5px;"></i>Copied to clipboard</span>`;
          iconEl.className = 'fa-solid fa-check';
          card.style.borderColor = 'rgba(45, 212, 191, 0.45)';

          setTimeout(() => {
            labelEl.innerHTML = originalLabel;
            iconEl.className = originalIconClass;
            card.style.borderColor = '';
          }, 2200);
        }
      });
    });
  }

  attachCardCopy('contactPhone', '+44 7931 130886');
  attachCardCopy('contactEmail', 'info@kdscala.co.uk');

  // 2. Footer Email Links
  document.querySelectorAll('footer a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'info@kdscala.co.uk';
      copyTextSafe(email, () => {
        const originalHtml = link.innerHTML;
        link.innerHTML = `${email} <span style="color: #2dd4bf; margin-left: 6px; font-size: 0.85em;"><i class="fa-solid fa-check"></i> Copied</span>`;
        setTimeout(() => {
          link.innerHTML = originalHtml;
        }, 2200);
      });
    });
  });
}

initDesktopClipboard();

// --- Dynamic settings hydration (from Decap CMS content/settings.json) ---
fetch('content/settings.json')
  .then(res => res.ok ? res.json() : null)
  .then(data => {
    if (!data) return;
    if (data.phone) {
      const cleanPhone = data.phone_raw || data.phone.replace(/[\s\(\)\-]/g, '');
      document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.setAttribute('href', `tel:${cleanPhone}`);
      });
      const em = document.getElementById('emergencyPhone');
      if (em) em.textContent = data.phone;
      const cp = document.querySelector('#contactPhone .contact-detail-value');
      if (cp) cp.textContent = data.phone;
    }
    if (data.hero_badge) {
      const badge = document.querySelector('.hero-badge');
      if (badge) badge.textContent = data.hero_badge;
    }
    if (data.hero_sub) {
      const sub = document.querySelector('.hero-sub');
      if (sub) sub.textContent = data.hero_sub;
    }
  })
  .catch(() => {});
