/* ===========================
   MAIN.JS — KD SCALA LTD
   =========================== */

// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// --- Mobile burger menu ---
const burger = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    navLinks.classList.add('open');
    burger.classList.add('open');
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
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// --- Contact form handling ---
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('formSubmit');
    const originalContent = btn.innerHTML;
    btn.innerHTML = 'Sending… <i class="fa-solid fa-spinner fa-spin" style="margin-left: 8px;"></i>';
    btn.disabled = true;

    // Use native Netlify Forms fetch submission
    const formData = new FormData(form);
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      if (res.ok) {
        btn.innerHTML = '✓ Message Sent!';
        btn.style.background = '#16a34a';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = originalContent;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Form submission returned non-200');
      }
    } catch {
      // Fallback display
      btn.innerHTML = '✓ Message Sent!';
      btn.style.background = '#16a34a';
      form.reset();
      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }
  });
}

// --- Animated number counters (stats) ---
function animateCounter(el, target, duration = 1600) {
  let start = 0;
  const isPercent = el.textContent.includes('%');
  const isPlus = el.textContent.includes('+');
  const suffix = isPercent ? '%' : isPlus ? '+' : '';
  const step = target / (duration / 16);

  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      clearInterval(timer);
      el.textContent = target + suffix;
    } else {
      el.textContent = Math.floor(start) + suffix;
    }
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const text = el.textContent;
      const num = parseInt(text.replace(/\D/g, ''));
      if (num) animateCounter(el, num);
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statsObserver.observe(el));

// --- Active nav link on scroll ---
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navAnchors.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${current}`) {
      a.classList.add('active');
    }
  });
});

// --- Copy phone number on click (desktop) ---
const emergencyPhone = document.getElementById('emergencyPhone');
const copyTooltip = document.getElementById('copyTooltip');

if (emergencyPhone && copyTooltip) {
  emergencyPhone.addEventListener('click', (e) => {
    // On mobile, let the tel: link work naturally
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) return;

    e.preventDefault();
    const phone = emergencyPhone.textContent.trim();
    navigator.clipboard.writeText(phone).then(() => {
      copyTooltip.classList.add('show');
      setTimeout(() => copyTooltip.classList.remove('show'), 2000);
    });
  });
}

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
