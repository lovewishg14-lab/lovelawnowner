// Device & Performance Detection (Detects Mobile Phones even in Desktop Mode)
const isMobileOrTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 1024);

// Interactive Canvas Particles (Fireflies / Golden Dust)
const canvas = document.getElementById('particles-canvas');
let ctx = canvas ? canvas.getContext('2d') : null;

let particles = [];
let width = 0, height = 0;
let isCanvasRunning = false;
let animFrameId = null;

function resizeCanvas() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 150);
}, { passive: true });
resizeCanvas();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2.2 + 0.8;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5 - 0.15;
    this.alpha = Math.random() * 0.55 + 0.25;
    this.pulse = Math.random() * 0.02 + 0.008;
    
    // Royal Gold + Diamond Star + Plum shimmer particles
    const rand = Math.random();
    if (rand < 0.45) {
      this.color = '212, 175, 55'; // Royal Gold
    } else if (rand < 0.75) {
      this.color = '252, 246, 186'; // Starlight Gold
    } else {
      this.color = '255, 255, 255'; // Diamond Star White
    }
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    this.alpha += this.pulse;
    if (this.alpha > 0.85 || this.alpha < 0.15) {
      this.pulse = -this.pulse;
    }

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw() {
    // Ultra-fast dual-circle glow - Zero expensive shadowBlur
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha * 0.28})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.fill();
  }
}

if (canvas && ctx) {
  // 22 particles on mobile / desktop-mode-on-mobile, 45 on desktop
  const particleCount = isMobileOrTouch ? 22 : 45;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    if (!isCanvasRunning) return;
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    animFrameId = requestAnimationFrame(animateParticles);
  }

  // Pause canvas when user scrolls away from hero to save 100% GPU
  function updateAnimationLoop() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const inHero = scrollY < window.innerHeight * 1.25;
    const shouldRun = inHero && !document.hidden;

    if (shouldRun && !isCanvasRunning) {
      isCanvasRunning = true;
      animFrameId = requestAnimationFrame(animateParticles);
    } else if (!shouldRun && isCanvasRunning) {
      isCanvasRunning = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  window.addEventListener('scroll', updateAnimationLoop, { passive: true });
  document.addEventListener('visibilitychange', updateAnimationLoop);
  updateAnimationLoop();
}

// Interactive Word Hover Effect
document.querySelectorAll('.word').forEach(word => {
  word.addEventListener('mouseenter', () => {
    word.style.transform = 'translateY(-6px) scale(1.08)';
    word.style.transition = 'transform 0.25s ease';
  });

  word.addEventListener('mouseleave', () => {
    word.style.transform = 'translateY(0) scale(1)';
  });
});

// =====================================================
// VENUE PHOTO GALLERY & LIGHTBOX
// =====================================================
const DEFAULT_VENUE_PHOTOS = [
  {
    id: "photo-1",
    title: "Twilight Fairy Light Canopy",
    category: "Night Illumination",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "photo-2",
    title: "Royal Stage & Floral Mandap",
    category: "Floral Stage",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "photo-3",
    title: "Sprawling 5-Acre Velvet Meadows",
    category: "Green Grounds",
    url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "photo-4",
    title: "Open-Air Candlelight Banquet Dining",
    category: "Dining & Banquet",
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "photo-5",
    title: "Royal Wedding Gazebo & Walkway",
    category: "Floral Stage",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "photo-6",
    title: "Grand Evening Entrance & Chandeliers",
    category: "Night Illumination",
    url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80"
  }
];

// Seed localStorage if not present
if (!localStorage.getItem('loveLawn_gallery')) {
  localStorage.setItem('loveLawn_gallery', JSON.stringify(DEFAULT_VENUE_PHOTOS));
}

function getVenuePhotos() {
  const raw = localStorage.getItem('loveLawn_gallery');
  try {
    return JSON.parse(raw) || DEFAULT_VENUE_PHOTOS;
  } catch (e) {
    return DEFAULT_VENUE_PHOTOS;
  }
}

let activeFilter = 'all';

function renderVenueGallery() {
  const container = document.getElementById('venue-gallery-container');
  if (!container) return;

  const photos = getVenuePhotos();
  const filtered = activeFilter === 'all' 
    ? photos 
    : photos.filter(p => p.category.toLowerCase() === activeFilter.toLowerCase());

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">No photos found in this category.</div>`;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="gallery-item" onclick="openLightbox('${p.url}', '${escapeHtml(p.title)}')">
      <img src="${p.url}" alt="${escapeHtml(p.title)}" loading="lazy">
      <div class="gallery-zoom-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></div>
      <div class="gallery-overlay">
        <span class="gallery-category-tag">${escapeHtml(p.category)}</span>
        <h3 class="gallery-title">${escapeHtml(p.title)}</h3>
      </div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

// Filter Buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.getAttribute('data-filter');
    renderVenueGallery();
  });
});

// Lightbox functions
function openLightbox(url, title) {
  const modal = document.getElementById('photo-lightbox');
  const img = document.getElementById('lightbox-img');
  const cap = document.getElementById('lightbox-caption');
  
  img.src = url;
  cap.textContent = title;
  modal.classList.add('open');
}

function closeLightbox() {
  const modal = document.getElementById('photo-lightbox');
  if (modal) modal.classList.remove('open');
}

// Initial Call
renderVenueGallery();

// =========================================
// ANIMATED TWINKLING STARS GENERATOR - HIGH PERFORMANCE
// =========================================
function initStarField() {
  const container = document.getElementById('star-container');
  if (!container) return;
  container.innerHTML = '';
  
  // 35 stars on mobile/touch screens, 60 on desktop
  const starCount = isMobileOrTouch ? 35 : 60;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    const isGold = Math.random() > 0.75;
    star.className = isGold ? 'star star-gold' : 'star';

    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const size = (Math.random() * 1.6 + 1).toFixed(1);
    const duration = (Math.random() * 3.5 + 2.5).toFixed(1);
    const delay = (Math.random() * 3).toFixed(1);

    star.style.cssText = `top:${top}%;left:${left}%;width:${size}px;height:${size}px;--duration:${duration}s;animation-delay:${delay}s;`;
    fragment.appendChild(star);
  }

  // Single DOM insertion
  container.appendChild(fragment);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStarField);
} else {
  initStarField();
}

// =====================================================
// B-EGG.FARM INSPIRED INTERACTION SUITE
// =====================================================

// 1. NUMERICAL PRELOADER (0% TO 100% WITH PROGRESS BAR)
function initPreloader() {
  const preloader = document.getElementById('luxury-preloader');
  const numberEl = document.getElementById('preloader-number');
  const barEl = document.getElementById('preloader-bar');
  if (!preloader || !numberEl) return;

  let current = 0;
  const target = 100;
  const duration = 1200; // 1.2s smooth count
  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function updateCount(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    current = Math.round(eased * target);

    numberEl.textContent = current;
    if (barEl) barEl.style.width = current + '%';

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      setTimeout(() => {
        preloader.classList.add('preloader-hidden');
        triggerEntranceAnimations();
      }, 200);
    }
  }

  requestAnimationFrame(updateCount);
}

function triggerEntranceAnimations() {
  // GSAP or CSS entrance for hero elements
  if (window.gsap) {
    gsap.from('.editorial-line', {
      y: 50,
      opacity: 0,
      stagger: 0.14,
      duration: 1.1,
      ease: 'power3.out'
    });
    gsap.from('.hero-tag-row .editorial-pill', {
      scale: 0.8,
      opacity: 0,
      stagger: 0.08,
      duration: 0.8,
      ease: 'back.out(1.7)'
    });
    gsap.from('.rotating-stamp', {
      scale: 0,
      opacity: 0,
      rotation: -180,
      duration: 1.4,
      delay: 0.2,
      ease: 'power3.out'
    });
    gsap.from('.hero-subtitle', {
      y: 30,
      opacity: 0,
      duration: 1,
      delay: 0.35,
      ease: 'power3.out'
    });
    gsap.from('.cta-group', {
      y: 25,
      opacity: 0,
      duration: 0.9,
      delay: 0.45,
      ease: 'power3.out'
    });
    gsap.from('.highlight-item', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      delay: 0.55,
      ease: 'power2.out'
    });
  }
}

// 2. LENIS SMOOTH SCROLL (Fluid Silk Motion)
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  try {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Anchor smooth links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href) return;
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -40 });
        }
      });
    });
  } catch (e) {
    console.warn('Lenis scroll fallback:', e);
  }
}

// 3. CUSTOM FOLLOWER CURSOR (Desktop)
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const circle = document.getElementById('cursor-circle');
  if (!dot || !circle || isMobileOrTouch) return;

  let mouseX = -100, mouseY = -100;
  let circleX = -100, circleY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  function renderCursor() {
    circleX += (mouseX - circleX) * 0.15;
    circleY += (mouseY - circleY) * 0.15;
    circle.style.transform = `translate3d(${circleX}px, ${circleY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states
  const interactives = document.querySelectorAll('a, button, .feature-card, .highlight-item, .gallery-item, input, select');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => circle.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => circle.classList.remove('cursor-hover'));
  });
}

// 4. 3D TILT EFFECT ON CARDS
function initCardTilt() {
  if (isMobileOrTouch) return;
  const cards = document.querySelectorAll('.feature-card, .highlight-item, .gallery-item');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// 5. MAGNETIC BUTTON EFFECT
function initMagneticButtons() {
  if (isMobileOrTouch) return;
  const btns = document.querySelectorAll('.btn-nav, .gold-btn-gradient, .btn-luxury');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0) scale(1.04)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// 6. SCROLL REVEAL OBSERVER
function initScrollReveals() {
  const elements = document.querySelectorAll('.reveal-fade-up, .reveal-stagger, .cards-grid, .section-header, .gallery-section');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
}

// 7. BENTO MOUSE SPOTLIGHT (Radial gradient follows cursor on card)
function initBentoSpotlight() {
  const cards = document.querySelectorAll('.bento-card, .feature-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// 8. INTERACTIVE STARLIGHT AMBIENCE TOGGLE
let isStarlightBoosted = false;
function toggleStarlightAmbience() {
  isStarlightBoosted = !isStarlightBoosted;
  playLuxuryChime(580);
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  const btnText = document.getElementById('starlight-btn-text');

  if (isStarlightBoosted) {
    if (orb1) orb1.style.filter = 'brightness(1.6)';
    if (orb2) orb2.style.filter = 'brightness(1.7)';
    if (btnText) btnText.textContent = '✨ Starlight Active (Bright)';
    document.body.style.boxShadow = 'inset 0 0 100px rgba(245, 195, 78, 0.15)';
  } else {
    if (orb1) orb1.style.filter = '';
    if (orb2) orb2.style.filter = '';
    if (btnText) btnText.textContent = 'Boost Starlight Glow';
    document.body.style.boxShadow = '';
  }
}

// 9. SOFT LUXURY CHIME AUDIO (Synthesizer via Web Audio API)
function playLuxuryChime(freq = 520) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

// Connect chime to primary luxury buttons
document.querySelectorAll('.gold-btn-gradient, .btn-luxury, .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => playLuxuryChime(640));
});

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initLenis();
  initCustomCursor();
  initCardTilt();
  initMagneticButtons();
  initScrollReveals();
  initBentoSpotlight();
});
