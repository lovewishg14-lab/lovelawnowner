// Interactive Canvas Particles (Fireflies / Golden Dust)
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let width, height;

function resize() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 2.8 + 0.8;
    this.speedX = (Math.random() - 0.5) * 0.7;
    this.speedY = (Math.random() - 0.5) * 0.7 - 0.2;
    this.alpha = Math.random() * 0.6 + 0.2;
    this.pulse = Math.random() * 0.03 + 0.01;
    this.color = Math.random() > 0.4 ? '246, 211, 101' : '52, 211, 153';
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
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${this.color}, 0.8)`;
    ctx.fill();
    ctx.restore();
  }
}

if (canvas) {
  const particleCount = Math.min(window.innerWidth < 768 ? 35 : 75, 80);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animateParticles);
  }

  animateParticles();
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
