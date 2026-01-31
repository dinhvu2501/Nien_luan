// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// ==================== AUTH FUNCTIONS ====================
function openLoginModal(event) {
  if (event) event.preventDefault();
  document.getElementById('loginModal').style.display = 'block';
  document.getElementById('registerModal').style.display = 'none';
}

function openRegisterModal(event) {
  if (event) event.preventDefault();
  document.getElementById('registerModal').style.display = 'block';
  document.getElementById('loginModal').style.display = 'none';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking X
document.addEventListener('DOMContentLoaded', function() {
  const closeButtons = document.querySelectorAll('.close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      this.parentElement.parentElement.style.display = 'none';
    });
  });

  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    
    if (event.target === loginModal) {
      loginModal.style.display = 'none';
    }
    if (event.target === registerModal) {
      registerModal.style.display = 'none';
    }
  });

  // Setup auth button listeners
  setupAuthButtons();
  
  // Check if user is already logged in
  checkAuthStatus();

  // Load featured rooms on homepage
  if (document.getElementById('featuredRooms')) {
    loadFeaturedRooms();
  }
});

// Setup auth button event listeners
function setupAuthButtons() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  if (loginBtn) {
    loginBtn.addEventListener('click', openLoginModal);
  }
  if (registerBtn) {
    registerBtn.addEventListener('click', openRegisterModal);
  }

  // Setup form submission
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
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

// Handle login
async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const messageDiv = document.getElementById('loginMessage');

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      messageDiv.innerHTML = `<div class="error">${data.message}</div>`;
      return;
    }

    // Save token to localStorage
    localStorage.setItem('token', data.token);
    
    messageDiv.innerHTML = `<div class="success">${data.message}</div>`;
    
    // Close modal and update UI
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginForm').reset();
    
    // Refresh page after 1 second
    setTimeout(() => {
      location.reload();
    }, 1000);

  } catch (error) {
    messageDiv.innerHTML = `<div class="error">Lỗi: ${error.message}</div>`;
  }
}

// Handle register
async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('registerName').value;
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const messageDiv = document.getElementById('registerMessage');

  // Validation
  if (!name || !username || !email || !password || !confirmPassword) {
    messageDiv.innerHTML = `<div class="error">Vui lòng điền tất cả các trường</div>`;
    return;
  }

  if (password !== confirmPassword) {
    messageDiv.innerHTML = `<div class="error">Mật khẩu không khớp</div>`;
    return;
  }

  if (password.length < 6) {
    messageDiv.innerHTML = `<div class="error">Mật khẩu phải tối thiểu 6 ký tự</div>`;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, username, email, password, confirmPassword })
    });

    const data = await response.json();

    if (!response.ok) {
      messageDiv.innerHTML = `<div class="error">${data.message}</div>`;
      return;
    }

    messageDiv.innerHTML = `<div class="success">${data.message}. Đang chuyển hướng đến đăng nhập...</div>`;
    document.getElementById('registerForm').reset();
    
    // Close register modal and open login modal after 1.5 seconds
    setTimeout(() => {
      document.getElementById('registerModal').style.display = 'none';
      messageDiv.innerHTML = '';
      openLoginModal();
    }, 1500);

  } catch (error) {
    messageDiv.innerHTML = `<div class="error">Lỗi: ${error.message}</div>`;
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

    // Clear token
    localStorage.removeItem('token');
    
    // Reload page
    location.reload();
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

// Load featured rooms on homepage
async function loadFeaturedRooms() {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    const data = await response.json();

    if (!data.success || !data.data) {
      return;
    }

    const container = document.getElementById('featuredRooms');
    container.innerHTML = '';

    // Show only first 3 rooms
    data.data.slice(0, 3).forEach(room => {
      const roomCard = createRoomCard(room);
      container.appendChild(roomCard);
    });

  } catch (error) {
    console.error('Error loading rooms:', error);
  }
}

// Create room card element
function createRoomCard(room) {
  const card = document.createElement('div');
  card.className = 'room-card';
  card.innerHTML = `
    <div class="room-image">
      <img src="${room.image || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(room.name)}" alt="${room.name}">
    </div>
    <div class="room-info">
      <h3>${room.name}</h3>
      <p class="room-type">Loại: ${room.type}</p>
      <p class="room-capacity"><i class="fas fa-users"></i> Sức chứa: ${room.capacity} người</p>
      <p class="room-description">${room.description}</p>
      <p class="room-price"><strong>${room.price.toLocaleString('vi-VN')} VND</strong> / đêm</p>
      <a href="rooms.html" class="btn btn-primary">Xem Chi Tiết</a>
    </div>
  `;
  return card;
}
