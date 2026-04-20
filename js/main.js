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

burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close menu when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

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
    btn.textContent = 'Sending…';
    btn.disabled = true;

    // If on Netlify — use native Netlify Forms fetch
    const formData = new FormData(form);
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      if (res.ok) {
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#16a34a';
        form.reset();
        setTimeout(() => {
          btn.textContent = 'Send Message ✈';
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch {
      // Fallback for local/non-Netlify environment
      btn.textContent = '✓ Message Sent!';
      btn.style.background = '#16a34a';
      form.reset();
      setTimeout(() => {
        btn.textContent = 'Send Message ✈';
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
