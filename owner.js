// Owner Portal Logic & Authentication System

// Clean Defaults (No automatic or dummy dates - starts completely clean)
const DEFAULT_BOOKED_DATES = [];

const DEFAULT_PRICING = {
  evening: 120000,
  fullday: 185000,
  daytime: 80000,
  lights: 20000,
  stage: 35000,
  dj: 15000,
  token: 25000
};

// Legacy dummy dates to purge from any prior sessions
const legacyDummyDates = new Set([
  "2026-10-7", "2026-10-8", "2026-10-14", "2026-10-15",
  "2026-10-21", "2026-10-22", "2026-10-27", "2026-10-28",
  "2026-11-5", "2026-11-6", "2026-11-12", "2026-11-19",
  "2026-11-20", "2026-11-25", "2026-11-31"
]);

// Clean legacy dummy dates from storage if present
try {
  const existingRaw = localStorage.getItem('loveLawn_bookedDates');
  if (existingRaw) {
    const existing = JSON.parse(existingRaw);
    if (Array.isArray(existing)) {
      const cleaned = existing.filter(d => !legacyDummyDates.has(d));
      localStorage.setItem('loveLawn_bookedDates', JSON.stringify(cleaned));
    }
  }
} catch (e) {}

if (!localStorage.getItem('loveLawn_pricing')) {
  try {
    localStorage.setItem('loveLawn_pricing', JSON.stringify(DEFAULT_PRICING));
  } catch (e) {}
}

// Master Device Configuration (Single Device Operation)
const MASTER_DEVICE_PASSKEY = "LAWN-OWNER-7788";

function isDeviceAuthorized() {
  const token = localStorage.getItem('loveLawn_masterDeviceToken');
  return !!token && token.startsWith('LL-MASTER-DEV-');
}

// Dynamic Credentials Check (Owner can customize password from dashboard)
function getOwnerCredentials() {
  return {
    user: localStorage.getItem('loveLawn_ownerUser') || "owner",
    pass: localStorage.getItem('loveLawn_ownerPass') || "lawn123"
  };
}

// State
let ownerCurrentDate = new Date();
ownerCurrentDate.setDate(1);
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Initialize View on Load with Strict Single-Device Verification
document.addEventListener('DOMContentLoaded', () => {
  const isAuth = sessionStorage.getItem('loveLawn_ownerSession') === 'true';
  const isAuthorizedDevice = isDeviceAuthorized();

  // Check URL query parameters for fast master activation (e.g. ?key=LAWN-OWNER-7788)
  const urlParams = new URLSearchParams(window.location.search);
  const fastKey = urlParams.get('key') || urlParams.get('setup');
  if (fastKey === MASTER_DEVICE_PASSKEY) {
    bindCurrentDevice();
    showLogin();
    return;
  }

  if (isAuthorizedDevice) {
    if (isAuth) {
      showDashboard();
    } else {
      showLogin();
    }
  } else {
    // If not authorized device, display strict lockout screen
    showDeviceLockout();
  }
});

function showDeviceLockout() {
  document.getElementById('device-lockout-view').style.display = 'flex';
  document.getElementById('device-setup-view').style.display = 'none';
  document.getElementById('owner-login-view').style.display = 'none';
  document.getElementById('owner-dashboard-view').style.display = 'none';
}

function showDevicePairingScreen() {
  document.getElementById('device-lockout-view').style.display = 'none';
  document.getElementById('device-setup-view').style.display = 'flex';
  document.getElementById('owner-login-view').style.display = 'none';
  document.getElementById('owner-dashboard-view').style.display = 'none';
}

function showLogin() {
  document.getElementById('device-lockout-view').style.display = 'none';
  document.getElementById('device-setup-view').style.display = 'none';
  document.getElementById('owner-login-view').style.display = 'flex';
  document.getElementById('owner-dashboard-view').style.display = 'none';
}

function showDashboard() {
  document.getElementById('device-lockout-view').style.display = 'none';
  document.getElementById('device-setup-view').style.display = 'none';
  document.getElementById('owner-login-view').style.display = 'none';
  document.getElementById('owner-dashboard-view').style.display = 'block';
  
  renderOwnerCalendar();
  loadPricingIntoForm();
  renderBookingsTable();
  renderOwnerGalleryCards();
  updateQuickStats();
}

// Device Binding Handlers
function bindCurrentDevice() {
  const token = 'LL-MASTER-DEV-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
  localStorage.setItem('loveLawn_masterDeviceToken', token);
  localStorage.setItem('loveLawn_deviceBound', 'true');
}

function handleDeviceBinding(event) {
  event.preventDefault();
  const inputKey = document.getElementById('master-device-key-input').value.trim();
  const errorMsg = document.getElementById('device-bind-error');

  if (inputKey === MASTER_DEVICE_PASSKEY) {
    bindCurrentDevice();
    errorMsg.style.display = 'none';
    alert("✓ Device Verified! This phone/computer is now registered as the Sole Authorized Owner Device.");
    showLogin();
  } else {
    errorMsg.style.display = 'flex';
  }
}

function handleUnpairDevice() {
  const confirmUnpair = confirm("Are you sure you want to unpair this device?\n\nYou will need your Master Passkey (LAWN-OWNER-7788) to authorize any device in the future.");
  if (confirmUnpair) {
    localStorage.removeItem('loveLawn_masterDeviceToken');
    sessionStorage.removeItem('loveLawn_ownerSession');
    alert("Device has been unpaired. This browser is now locked out.");
    showDeviceLockout();
  }
}

// Login Handler with Brute-Force Rate Limiting & Protection
let failedAttempts = parseInt(sessionStorage.getItem('loveLawn_failedAttempts') || '0', 10);

function handleOwnerLogin(event) {
  event.preventDefault();
  const user = document.getElementById('owner-username').value.trim();
  const pass = document.getElementById('owner-password').value;
  const errorMsg = document.getElementById('login-error-msg');
  const creds = getOwnerCredentials();

  if (user === creds.user && pass === creds.pass) {
    sessionStorage.setItem('loveLawn_ownerSession', 'true');
    sessionStorage.removeItem('loveLawn_failedAttempts');
    errorMsg.style.display = 'none';
    showDashboard();
  } else {
    failedAttempts++;
    sessionStorage.setItem('loveLawn_failedAttempts', failedAttempts.toString());
    const remaining = 3 - failedAttempts;
    
    if (remaining <= 0) {
      errorMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Too many failed attempts. Returning to public website...`;
      errorMsg.style.display = 'flex';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      return;
    }

    errorMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Invalid Owner ID or Password. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`;
    errorMsg.style.display = 'flex';
  }
}

// Logout Handler
function handleOwnerLogout() {
  if (confirm("Are you sure you want to log out of the Owner Portal?")) {
    sessionStorage.removeItem('loveLawn_ownerSession');
    showLogin();
  }
}

function togglePasswordVisibility() {
  const passInput = document.getElementById('owner-password');
  const eyeIcon = document.getElementById('eye-icon');
  if (passInput.type === 'password') {
    passInput.type = 'text';
    eyeIcon.className = 'fa-regular fa-eye-slash';
  } else {
    passInput.type = 'password';
    eyeIcon.className = 'fa-regular fa-eye';
  }
}

// -------------------------------------------------------------
// AVAILABILITY CALENDAR & TOGGLE
// -------------------------------------------------------------
function getBookedDatesSet() {
  const raw = localStorage.getItem('loveLawn_bookedDates');
  if (!raw) {
    return new Set();
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter(d => !legacyDummyDates.has(d));
      return new Set(valid);
    }
    return new Set();
  } catch (e) {
    return new Set();
  }
}

function saveBookedDatesSet(set) {
  localStorage.setItem('loveLawn_bookedDates', JSON.stringify(Array.from(set)));
  updateQuickStats();
}

function changeOwnerMonth(delta) {
  ownerCurrentDate.setMonth(ownerCurrentDate.getMonth() + delta);
  renderOwnerCalendar();
}

function renderOwnerCalendar() {
  const year = ownerCurrentDate.getFullYear();
  const month = ownerCurrentDate.getMonth();

  document.getElementById('owner-month-display').textContent = `${monthNames[month]} ${year}`;

  const container = document.getElementById('owner-calendar-days');
  container.innerHTML = '';

  const bookedSet = getBookedDatesSet();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Empty leading days
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'owner-day empty';
    container.appendChild(emptyDiv);
  }

  // Days
  for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'owner-day';
    dayDiv.textContent = day;

    const dateKey = `${year}-${month}-${day}`;
    const isBooked = bookedSet.has(dateKey);

    if (isBooked) {
      dayDiv.classList.add('booked');
      dayDiv.title = `Currently BOOKED. Click to make AVAILABLE.`;
    } else {
      dayDiv.classList.add('available');
      dayDiv.title = `Currently AVAILABLE. Click to mark as BOOKED.`;
    }

    // Toggle on Owner Click
    dayDiv.addEventListener('click', () => {
      toggleDateAvailability(dateKey, day, month, year);
    });

    container.appendChild(dayDiv);
  }
}

function toggleDateAvailability(dateKey, day, month, year) {
  const bookedSet = getBookedDatesSet();
  const isCurrentlyBooked = bookedSet.has(dateKey);
  const formatted = `${day} ${monthNames[month]} ${year}`;

  if (isCurrentlyBooked) {
    if (confirm(`Open date: Do you want to mark ${formatted} as AVAILABLE for booking?`)) {
      bookedSet.delete(dateKey);
      saveBookedDatesSet(bookedSet);
      renderOwnerCalendar();
    }
  } else {
    if (confirm(`Close date: Do you want to mark ${formatted} as BOOKED / SOLD OUT?`)) {
      bookedSet.add(dateKey);
      saveBookedDatesSet(bookedSet);
      renderOwnerCalendar();
    }
  }
}

// Manual Date Picker Toggle
function toggleManualDate(action) {
  const input = document.getElementById('manual-date-input').value;
  if (!input) {
    alert("Please select a date first.");
    return;
  }

  const parts = input.split('-'); // [YYYY, MM, DD]
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  const dateKey = `${year}-${month}-${day}`;
  const formatted = `${day} ${monthNames[month]} ${year}`;

  const bookedSet = getBookedDatesSet();

  if (action === 'book') {
    bookedSet.add(dateKey);
    saveBookedDatesSet(bookedSet);
    alert(`✓ ${formatted} has been marked as BOOKED / UNAVAILABLE.`);
  } else {
    bookedSet.delete(dateKey);
    saveBookedDatesSet(bookedSet);
    alert(`✓ ${formatted} has been marked as OPEN / AVAILABLE.`);
  }

  renderOwnerCalendar();
}

// -------------------------------------------------------------
// PRICING CONTROLLER
// -------------------------------------------------------------
function getPricing() {
  const raw = localStorage.getItem('loveLawn_pricing');
  if (!raw) {
    try {
      localStorage.setItem('loveLawn_pricing', JSON.stringify(DEFAULT_PRICING));
    } catch (e) {}
    return DEFAULT_PRICING;
  }
  try {
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : DEFAULT_PRICING;
  } catch (e) {
    return DEFAULT_PRICING;
  }
}

function loadPricingIntoForm() {
  const pricing = getPricing();
  document.getElementById('price-evening').value = pricing.evening || 120000;
  document.getElementById('price-fullday').value = pricing.fullday || 185000;
  document.getElementById('price-daytime').value = pricing.daytime || 80000;
  document.getElementById('price-lights').value = pricing.lights || 20000;
  document.getElementById('price-stage').value = pricing.stage || 35000;
  document.getElementById('price-dj').value = pricing.dj || 15000;
  document.getElementById('price-token').value = pricing.token || 25000;
}

function savePricingChanges(event) {
  event.preventDefault();

  const newPricing = {
    evening: parseInt(document.getElementById('price-evening').value) || 120000,
    fullday: parseInt(document.getElementById('price-fullday').value) || 185000,
    daytime: parseInt(document.getElementById('price-daytime').value) || 80000,
    lights: parseInt(document.getElementById('price-lights').value) || 20000,
    stage: parseInt(document.getElementById('price-stage').value) || 35000,
    dj: parseInt(document.getElementById('price-dj').value) || 15000,
    token: parseInt(document.getElementById('price-token').value) || 25000
  };

  localStorage.setItem('loveLawn_pricing', JSON.stringify(newPricing));

  const alertBox = document.getElementById('price-saved-alert');
  alertBox.style.display = 'inline-flex';
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 3500);
}

// -------------------------------------------------------------
// BOOKINGS TABLE & STATS
// -------------------------------------------------------------
function getBookings() {
  const raw = localStorage.getItem('loveLawn_bookings');
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(b => b.id !== "LL-2026-8492" && b.id !== "LL-2026-3190");
    }
    return [];
  } catch (e) {
    return [];
  }
}

function renderBookingsTable() {
  const tbody = document.getElementById('bookings-table-body');
  const bookings = getBookings();

  if (!bookings || bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-table-msg"><i class="fa-regular fa-folder-open"></i> No online customer reservations recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const waText = encodeURIComponent(`Namaste ${b.name}, this is regarding your Love Lawn booking (${b.id}) on ${b.dateStr}.`);
    return `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td><strong style="color: #f6d365;">${b.dateStr}</strong></td>
        <td>${b.name}</td>
        <td><a href="tel:${b.phone}" style="color: #b5c7bc; text-decoration: none;">${b.phone}</a></td>
        <td>${b.eventType || 'Event'}</td>
        <td>${b.slot}</td>
        <td><strong style="color: #34d399;">₹${(b.tokenPaid || 25000).toLocaleString('en-IN')}</strong></td>
        <td><span class="badge-confirmed">CONFIRMED</span></td>
        <td>
          <a href="https://wa.me/91${b.phone}?text=${waText}" target="_blank" class="contact-btn-wa">
            <i class="fa-brands fa-whatsapp"></i> Chat
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function updateQuickStats() {
  const bookedSet = getBookedDatesSet();
  document.getElementById('stat-booked-count').textContent = bookedSet.size;

  const bookings = getBookings();
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.tokenPaid || 25000), 0);
  document.getElementById('stat-revenue-est').textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
}

// -------------------------------------------------------------
// VENUE PHOTO GALLERY MANAGER (OWNER)
// -------------------------------------------------------------
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

function getOwnerPhotos() {
  const raw = localStorage.getItem('loveLawn_gallery');
  try {
    return JSON.parse(raw) || DEFAULT_VENUE_PHOTOS;
  } catch (e) {
    return DEFAULT_VENUE_PHOTOS;
  }
}

function saveOwnerPhotos(photos) {
  localStorage.setItem('loveLawn_gallery', JSON.stringify(photos));
  renderOwnerGalleryCards();
}

function renderOwnerGalleryCards() {
  const container = document.getElementById('owner-gallery-cards');
  const countBadge = document.getElementById('owner-photo-count');
  if (!container) return;

  const photos = getOwnerPhotos();
  if (countBadge) countBadge.textContent = photos.length;

  if (photos.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px;">No photos in venue gallery yet. Use the form above to add some!</div>`;
    return;
  }

  container.innerHTML = photos.map(p => `
    <div class="owner-photo-card">
      <div class="owner-thumb-wrap">
        <img src="${p.url}" alt="${p.title}" loading="lazy">
        <span class="owner-photo-tag">${p.category}</span>
      </div>
      <div class="owner-photo-meta">
        <h4>${p.title}</h4>
        <button class="delete-photo-btn" onclick="deleteVenuePhoto('${p.id}', '${p.title.replace(/'/g, "\\'")}')">
          <i class="fa-solid fa-trash-can"></i> Delete Photo
        </button>
      </div>
    </div>
  `).join('');
}

function setPresetPhoto(title, category, url) {
  document.getElementById('new-photo-title').value = title;
  document.getElementById('new-photo-category').value = category;
  document.getElementById('new-photo-url').value = url;
}

function handleAddNewPhoto(event) {
  event.preventDefault();
  const title = document.getElementById('new-photo-title').value.trim();
  const category = document.getElementById('new-photo-category').value;
  const url = document.getElementById('new-photo-url').value.trim();

  if (!title || !url) return;

  const photos = getOwnerPhotos();
  const newPhoto = {
    id: "photo-" + Date.now(),
    title: title,
    category: category,
    url: url
  };

  photos.unshift(newPhoto);
  saveOwnerPhotos(photos);

  // Reset form
  document.getElementById('new-photo-title').value = '';
  document.getElementById('new-photo-url').value = '';

  const alertBox = document.getElementById('photo-added-alert');
  if (alertBox) {
    alertBox.style.display = 'inline-flex';
    setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
  }
}

function deleteVenuePhoto(photoId, photoTitle) {
  if (confirm(`Are you sure you want to delete "${photoTitle}" from the public gallery?`)) {
    let photos = getOwnerPhotos();
    photos = photos.filter(p => p.id !== photoId);
    saveOwnerPhotos(photos);
  }
}

// -------------------------------------------------------------
// OWNER SECURITY & PASSWORD CUSTOMIZATION
// -------------------------------------------------------------
function handleUpdateOwnerPassword(event) {
  event.preventDefault();
  const currentPass = document.getElementById('curr-owner-pass').value;
  const newPass = document.getElementById('new-owner-pass').value;
  const confirmPass = document.getElementById('confirm-owner-pass').value;
  const alertBox = document.getElementById('pass-updated-alert');
  const creds = getOwnerCredentials();

  if (currentPass !== creds.pass) {
    alert("❌ Current password is incorrect. Please re-enter your existing password.");
    return;
  }

  if (newPass.length < 6) {
    alert("❌ New password must be at least 6 characters long.");
    return;
  }

  if (newPass !== confirmPass) {
    alert("❌ New passwords do not match. Please verify.");
    return;
  }

  localStorage.setItem('loveLawn_ownerPass', newPass);
  document.getElementById('curr-owner-pass').value = '';
  document.getElementById('new-owner-pass').value = '';
  document.getElementById('confirm-owner-pass').value = '';

  alertBox.style.display = 'inline-flex';
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 4000);
}

// -------------------------------------------------------------
// EXPORT & SYNC DATES HELPER
// -------------------------------------------------------------
function copyLiveDatesConfig() {
  const bookedSet = getBookedDatesSet();
  const arr = Array.from(bookedSet);
  const jsonStr = JSON.stringify(arr, null, 2);
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(jsonStr).then(() => {
      const notif = document.getElementById('export-copy-alert');
      if (notif) {
        notif.style.display = 'inline-flex';
        setTimeout(() => { notif.style.display = 'none'; }, 3500);
      } else {
        alert(`✓ All ${arr.length} booked dates copied to clipboard!`);
      }
    }).catch(() => {
      alert(`Current Booked Dates:\n` + JSON.stringify(arr));
    });
  } else {
    alert(`Current Booked Dates (${arr.length} total):\n` + JSON.stringify(arr));
  }
}
