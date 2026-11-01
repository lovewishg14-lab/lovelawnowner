// Love Lawn Availability & Online Booking System (Connected with Owner Portal)

// Month Names
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Fallback Defaults
const DEFAULT_BOOKED_DATES = [
  "2026-10-7", "2026-10-8", "2026-10-14", "2026-10-15",
  "2026-10-21", "2026-10-22", "2026-10-27", "2026-10-28",
  "2026-11-5", "2026-11-6", "2026-11-12", "2026-11-19",
  "2026-11-20", "2026-11-25", "2026-11-31"
];

const DEFAULT_PRICING = {
  evening: 120000,
  fullday: 185000,
  daytime: 80000,
  lights: 20000,
  stage: 35000,
  dj: 15000,
  token: 25000
};

// Retrieve Shared Data from LocalStorage
function getLiveBookedDates() {
  const raw = localStorage.getItem('loveLawn_bookedDates');
  try {
    return new Set(JSON.parse(raw));
  } catch (e) {
    return new Set(DEFAULT_BOOKED_DATES);
  }
}

function getLivePricing() {
  const raw = localStorage.getItem('loveLawn_pricing');
  try {
    return JSON.parse(raw) || DEFAULT_PRICING;
  } catch (e) {
    return DEFAULT_PRICING;
  }
}

// State Management
let currentDate = new Date(2026, 10, 1); // November 2026
let selectedDay = null;
let currentPricing = getLivePricing();
let basePrice = currentPricing.evening;
let addonPrice = currentPricing.lights;

// Apply Live Prices to UI Elements
function updatePricingLabels() {
  currentPricing = getLivePricing();
  
  // Update Slot Prices in DOM
  const slotRadios = document.querySelectorAll('input[name="event-slot"]');
  if (slotRadios.length >= 3) {
    const parent1 = slotRadios[0].closest('.slot-card');
    const parent2 = slotRadios[1].closest('.slot-card');
    const parent3 = slotRadios[2].closest('.slot-card');

    if (parent1) parent1.querySelector('.slot-price').textContent = `₹${currentPricing.evening.toLocaleString('en-IN')}`;
    if (parent2) parent2.querySelector('.slot-price').textContent = `₹${currentPricing.fullday.toLocaleString('en-IN')}`;
    if (parent3) parent3.querySelector('.slot-price').textContent = `₹${currentPricing.daytime.toLocaleString('en-IN')}`;
  }

  // Update Addon Chips in DOM
  const lightsSpan = document.getElementById('addon-lights')?.nextElementSibling;
  const stageSpan = document.getElementById('addon-stage')?.nextElementSibling;
  const djSpan = document.getElementById('addon-dj')?.nextElementSibling;

  if (lightsSpan) lightsSpan.textContent = `🌟 Starlight Fairy Light Canopy (+₹${currentPricing.lights.toLocaleString('en-IN')})`;
  if (stageSpan) stageSpan.textContent = `👑 Royal Stage Floral Decor (+₹${currentPricing.stage.toLocaleString('en-IN')})`;
  if (djSpan) djSpan.textContent = `🎵 Concert DJ & Sound System (+₹${currentPricing.dj.toLocaleString('en-IN')})`;

  // Update token label
  const tokenAlert = document.querySelector('.token-alert span');
  if (tokenAlert) {
    tokenAlert.innerHTML = `Book now with just <strong>₹${currentPricing.token.toLocaleString('en-IN')} token advance</strong>. Remaining balance payable at venue.`;
  }
}

// Render Calendar
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthDisplay = document.getElementById('current-month-display');
  monthDisplay.textContent = `${monthNames[month]} ${year}`;

  const container = document.getElementById('calendar-days-container');
  container.innerHTML = '';

  const bookedDates = getLiveBookedDates();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Render empty slots for prev month alignment
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'cal-day empty';
    container.appendChild(emptyDiv);
  }

  // Render days
  for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'cal-day';
    dayDiv.textContent = day;

    const dateKey = `${year}-${month}-${day}`;
    const isBooked = bookedDates.has(dateKey);

    if (isBooked) {
      dayDiv.classList.add('booked');
      dayDiv.title = `Sold Out: ${day} ${monthNames[month]} is already booked by Lawn Owner/Customer!`;
      dayDiv.addEventListener('click', () => {
        alert(`❌ Note: ${day} ${monthNames[month]} ${year} is already BOOKED / NOT AVAILABLE for Love Lawn. Please pick any available green date.`);
      });
    } else {
      dayDiv.classList.add('available');
      dayDiv.title = `Available: Click to book ${day} ${monthNames[month]} ${year}`;
      
      // Check if this day is currently selected
      if (selectedDay && selectedDay.day === day && selectedDay.month === month && selectedDay.year === year) {
        dayDiv.classList.add('selected');
      }

      dayDiv.addEventListener('click', () => {
        selectDate(day, month, year, dayDiv);
      });
    }

    container.appendChild(dayDiv);
  }
}

// Select Date Handler
function selectDate(day, month, year, element) {
  document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));

  element.classList.add('selected');
  selectedDay = { day, month, year };

  const formattedDate = `${day} ${monthNames[month]} ${year}`;
  
  // Update banner
  document.getElementById('selected-date-text').textContent = formattedDate;
  const tag = document.getElementById('availability-tag');
  tag.textContent = 'Available ✓';
  tag.className = 'status-pill status-available';

  // Enable book button
  const bookBtn = document.getElementById('book-now-btn');
  bookBtn.removeAttribute('disabled');
  bookBtn.querySelector('span').textContent = `Lock ${formattedDate} & Pay ₹${currentPricing.token.toLocaleString('en-IN')} Advance`;
}

// Month Navigation
document.getElementById('prev-month-btn').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('next-month-btn').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Slot Selection & Price recalculation
document.querySelectorAll('input[name="event-slot"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    document.querySelectorAll('.slot-card').forEach(c => c.classList.remove('active'));
    e.target.closest('.slot-card').classList.add('active');

    currentPricing = getLivePricing();
    if (e.target.value.includes('Evening Gala')) basePrice = currentPricing.evening;
    else if (e.target.value.includes('Full Day')) basePrice = currentPricing.fullday;
    else if (e.target.value.includes('Daytime')) basePrice = currentPricing.daytime;

    calculateTotal();
  });
});

// Calculate Total
function calculateTotal() {
  currentPricing = getLivePricing();
  addonPrice = 0;
  if (document.getElementById('addon-lights').checked) addonPrice += currentPricing.lights;
  if (document.getElementById('addon-stage').checked) addonPrice += currentPricing.stage;
  if (document.getElementById('addon-dj').checked) addonPrice += currentPricing.dj;

  const total = basePrice + addonPrice;

  document.getElementById('base-price-display').textContent = `₹${basePrice.toLocaleString('en-IN')}`;
  document.getElementById('addon-price-display').textContent = `₹${addonPrice.toLocaleString('en-IN')}`;
  document.getElementById('total-price-display').textContent = `₹${total.toLocaleString('en-IN')}`;
}

// Form Submission & Payment Modal Trigger
function handleBookingSubmit(event) {
  event.preventDefault();

  if (!selectedDay) {
    alert("Please select an available green date from the calendar first!");
    return;
  }

  currentPricing = getLivePricing();
  const modal = document.getElementById('payment-modal');
  modal.classList.add('open');
  
  // Update token in modal
  modal.querySelector('.modal-title').textContent = `Complete ₹${currentPricing.token.toLocaleString('en-IN')} Advance Token`;
  document.getElementById('modal-step-payment').style.display = 'block';
  document.getElementById('modal-step-success').style.display = 'none';
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.remove('open');
}

// Simulate Payment Completion & Update Shared Storage
function simulatePaymentSuccess() {
  currentPricing = getLivePricing();
  document.getElementById('modal-step-payment').style.display = 'none';
  const successStep = document.getElementById('modal-step-success');
  successStep.style.display = 'block';

  const name = document.getElementById('cust-name').value;
  const phone = document.getElementById('cust-phone').value;
  const email = document.getElementById('cust-email')?.value || '';
  const eventType = document.getElementById('event-type').value;
  const slot = document.querySelector('input[name="event-slot"]:checked').value;
  const dateStr = `${selectedDay.day} ${monthNames[selectedDay.month]} ${selectedDay.year}`;
  const bookingId = `LL-${selectedDay.year}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateKey = `${selectedDay.year}-${selectedDay.month}-${selectedDay.day}`;

  // 1. Mark this date as Booked in localStorage
  const bookedSet = getLiveBookedDates();
  bookedSet.add(dateKey);
  localStorage.setItem('loveLawn_bookedDates', JSON.stringify(Array.from(bookedSet)));

  // 2. Add Booking Record to localStorage
  let bookings = [];
  try {
    bookings = JSON.parse(localStorage.getItem('loveLawn_bookings')) || [];
  } catch (e) {
    bookings = [];
  }

  bookings.unshift({
    id: bookingId,
    name: name,
    phone: phone,
    email: email,
    eventType: eventType,
    slot: slot,
    dateStr: dateStr,
    tokenPaid: currentPricing.token,
    timestamp: new Date().toISOString().split('T')[0]
  });

  localStorage.setItem('loveLawn_bookings', JSON.stringify(bookings));

  // 3. Re-render calendar so this date becomes locked immediately
  renderCalendar();

  // Populate receipt details
  const receiptContainer = document.getElementById('booking-receipt-details');
  receiptContainer.innerHTML = `
    <div class="receipt-row"><span>Booking ID:</span><strong>${bookingId}</strong></div>
    <div class="receipt-row"><span>Reserved Venue:</span><strong>Love Lawn (Nagpur)</strong></div>
    <div class="receipt-row"><span>Event Date:</span><strong style="color: #f6d365;">${dateStr}</strong></div>
    <div class="receipt-row"><span>Timing Slot:</span><strong>${slot}</strong></div>
    <div class="receipt-row"><span>Booked By:</span><strong>${name} (${phone})</strong></div>
    <div class="receipt-row"><span>Occasion:</span><strong>${eventType}</strong></div>
    <div class="receipt-row"><span>Advance Paid:</span><strong style="color: #34d399;">₹${currentPricing.token.toLocaleString('en-IN')} (Confirmed)</strong></div>
    <div class="receipt-row"><span>Status:</span><strong style="color: #34d399;">LOCKED IN SYSTEM ✓</strong></div>
  `;

  // WhatsApp Link
  const waMsg = encodeURIComponent(
    `Hello Love Lawn Owner! My Booking ID is ${bookingId} for ${name} on ${dateStr} (${eventType}). I have paid ₹${currentPricing.token.toLocaleString('en-IN')} token advance online. Please confirm my reservation.`
  );
  document.getElementById('receipt-whatsapp-link').href = `https://wa.me/919876543210?text=${waMsg}`;
}

// Initial Render
updatePricingLabels();
renderCalendar();
calculateTotal();
