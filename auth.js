// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
  setupAuthForms();
  checkAuthStatus();
});

// Setup auth forms for standalone pages
function setupAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginPage);
  }
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterPage);
  }
}

// Handle login on login page
async function handleLoginPage(e) {
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

    localStorage.setItem('token', data.token);
    messageDiv.innerHTML = `<div class="success">${data.message}</div>`;
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);

  } catch (error) {
    messageDiv.innerHTML = `<div class="error">Lỗi: ${error.message}</div>`;
  }
}

// Handle register on register page
async function handleRegisterPage(e) {
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
    
    setTimeout(() => {
      window.location.href = 'dangnhap.html';
    }, 1500);

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
