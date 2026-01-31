// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Store all rooms for filtering
let allRooms = [];

document.addEventListener('DOMContentLoaded', function() {
  loadRooms();
  setupFilters();
  setupBookingForm();
  checkAuthStatus();
});

// Load all rooms from API
async function loadRooms() {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    const data = await response.json();

    if (!data.success || !data.data) {
      document.getElementById('roomsList').innerHTML = '<p>Không thể tải danh sách phòng</p>';
      return;
    }

    allRooms = data.data;
    displayRooms(allRooms);
    populateRoomSelect(allRooms);

  } catch (error) {
    console.error('Error loading rooms:', error);
    document.getElementById('roomsList').innerHTML = '<p>Lỗi khi tải danh sách phòng</p>';
  }
}

// Display rooms in grid
function displayRooms(rooms) {
  const container = document.getElementById('roomsList');
  container.innerHTML = '';

  if (rooms.length === 0) {
    container.innerHTML = '<p>Không có phòng phù hợp với tiêu chí tìm kiếm</p>';
    return;
  }

  rooms.forEach(room => {
    const roomCard = document.createElement('div');
    roomCard.className = 'room-card';
    roomCard.innerHTML = `
      <div class="room-image">
        <img src="${room.image || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(room.name)}" alt="${room.name}">
        ${room.available ? '<span class="badge badge-success">Còn trống</span>' : '<span class="badge badge-danger">Hết phòng</span>'}
      </div>
      <div class="room-info">
        <h3>${room.name}</h3>
        <p class="room-type"><strong>Loại:</strong> ${room.type}</p>
        <p class="room-capacity"><i class="fas fa-users"></i> Sức chứa: ${room.capacity} người</p>
        <p class="room-description">${room.description}</p>
        <div class="room-amenities">
          <span><i class="fas fa-wifi"></i> WiFi</span>
          <span><i class="fas fa-tv"></i> Tivi</span>
          <span><i class="fas fa-bath"></i> Phòng tắm</span>
        </div>
        <p class="room-price"><strong>${room.price.toLocaleString('vi-VN')} VND</strong> / đêm</p>
        <button onclick="scrollToBooking(${room.id})" class="btn btn-primary" ${!room.available ? 'disabled' : ''}>
          ${room.available ? 'Đặt Ngay' : 'Không Còn Trống'}
        </button>
      </div>
    `;
    container.appendChild(roomCard);
  });
}

// Scroll to booking section and select room
function scrollToBooking(roomId) {
  document.getElementById('bookingRoomId').value = roomId;
  document.querySelector('.booking-section').scrollIntoView({ behavior: 'smooth' });
}

// Populate room select dropdown
function populateRoomSelect(rooms) {
  const select = document.getElementById('bookingRoomId');
  rooms.forEach(room => {
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = `${room.name} - ${room.price.toLocaleString('vi-VN')} VND`;
    select.appendChild(option);
  });
}

// Setup filters
function setupFilters() {
  document.getElementById('roomTypeFilter').addEventListener('change', applyFilters);
  document.getElementById('capacityFilter').addEventListener('change', applyFilters);
  document.getElementById('priceFilter').addEventListener('change', applyFilters);
}

// Apply filters
function applyFilters() {
  const typeFilter = document.getElementById('roomTypeFilter').value;
  const capacityFilter = parseInt(document.getElementById('capacityFilter').value) || 0;
  const priceFilter = parseInt(document.getElementById('priceFilter').value) || 0;

  let filtered = allRooms.filter(room => {
    let match = true;

    if (typeFilter && room.type !== typeFilter) {
      match = false;
    }

    if (capacityFilter > 0) {
      if (capacityFilter === 2 && room.capacity < 2) match = false;
      if (capacityFilter === 4 && room.capacity < 4) match = false;
      if (capacityFilter === 6 && room.capacity < 6) match = false;
    }

    if (priceFilter > 0 && room.price > priceFilter) {
      match = false;
    }

    return match;
  });

  displayRooms(filtered);
}

// Reset filters
function resetFilters() {
  document.getElementById('roomTypeFilter').value = '';
  document.getElementById('capacityFilter').value = '';
  document.getElementById('priceFilter').value = '';
  displayRooms(allRooms);
}

// Setup booking form
function setupBookingForm() {
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBooking);
  }
}

// Handle booking submission
async function handleBooking(e) {
  e.preventDefault();

  const name = document.getElementById('bookingName').value;
  const email = document.getElementById('bookingEmail').value;
  const phone = document.getElementById('bookingPhone').value;
  const checkin = document.getElementById('bookingCheckin').value;
  const checkout = document.getElementById('bookingCheckout').value;
  const roomId = document.getElementById('bookingRoomId').value;
  const guests = document.getElementById('bookingGuests').value;
  const messageDiv = document.getElementById('bookingMessage');

  if (!name || !phone || !checkin || !checkout || !roomId) {
    messageDiv.innerHTML = '<div class="error">Vui lòng điền tất cả các trường bắt buộc</div>';
    return;
  }

  // Validate dates
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  if (checkoutDate <= checkinDate) {
    messageDiv.innerHTML = '<div class="error">Ngày trả phòng phải sau ngày nhận phòng</div>';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        checkin,
        checkout,
        roomId: parseInt(roomId),
        guests: parseInt(guests)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      messageDiv.innerHTML = `<div class="error">${data.message}</div>`;
      return;
    }

    messageDiv.innerHTML = `<div class="success">${data.message}</div>`;
    document.getElementById('bookingForm').reset();

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth' });

  } catch (error) {
    messageDiv.innerHTML = `<div class="error">Lỗi: ${error.message}</div>`;
  }
}

// Check authentication status
async function checkAuthStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth-check`, {
      credentials: 'include'
    });
    const data = await response.json();

    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');

    if (data.isLoggedIn && data.user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (registerBtn) registerBtn.style.display = 'none';
      if (userMenu) {
        userMenu.style.display = 'block';
        document.getElementById('userName').textContent = `Welcome, ${data.user.name}!`;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', handleLogout);
        }
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'block';
      if (registerBtn) registerBtn.style.display = 'block';
      if (userMenu) userMenu.style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

// Handle logout
async function handleLogout(e) {
  e.preventDefault();

  try {
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    localStorage.removeItem('token');
    location.reload();
  } catch (error) {
    console.error('Error logging out:', error);
  }
}
