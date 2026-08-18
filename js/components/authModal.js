// EduMitra AI - Student Authentication Modal & Header Controller

import { AuthService } from '../services/auth.js';

export function initAuthSystem() {
  renderAuthHeaderControls();
  renderAuthModal();
  setupEventListeners();

  // Listen to auth changes and update header automatically
  AuthService.onAuthChange(() => {
    renderAuthHeaderControls();
  });
}

function renderAuthHeaderControls() {
  const container = document.getElementById('authHeaderContainer');
  if (!container) return;

  const user = AuthService.getUser();

  if (!user) {
    container.innerHTML = `
      <button id="openAuthModalBtn" class="auth-btn login-btn">
        <span class="auth-btn-icon">🔑</span> Student Login
      </button>
    `;
    const openBtn = document.getElementById('openAuthModalBtn');
    if (openBtn) {
      openBtn.addEventListener('click', () => openAuthModal());
    }
  } else {
    container.innerHTML = `
      <div class="user-profile-menu" id="userProfileMenu">
        <button class="user-chip-btn" id="userChipBtn">
          <img src="${user.avatar}" alt="${user.name}" class="user-avatar" />
          <div class="user-chip-info">
            <span class="user-chip-name">${user.name}</span>
            <span class="user-chip-provider">${user.provider}</span>
          </div>
          <span class="dropdown-caret">▼</span>
        </button>

        <div class="user-dropdown-card" id="userDropdownCard" style="display:none;">
          <div class="dropdown-header">
            <div class="dropdown-avatar-wrapper">
              <img src="${user.avatar}" alt="${user.name}" class="dropdown-avatar" />
              <span class="provider-badge">${user.provider}</span>
            </div>
            <div class="dropdown-user-details">
              <strong>${user.name}</strong>
              <small>${user.email || user.phone}</small>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-stats">
            <div class="stat-box">
              <span class="stat-label">Target Exam</span>
              <span class="stat-val">${user.targetExam || 'REAP 2026'}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Category</span>
              <span class="stat-val">${user.category || 'General'}</span>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-action-btn" id="dropdownSavedCollegesBtn">
            <span>⭐</span> Saved Colleges (${(user.savedColleges || []).length})
          </button>
          <button class="dropdown-action-btn logout-action" id="dropdownLogoutBtn">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>
    `;

    const userChipBtn = document.getElementById('userChipBtn');
    const dropdownCard = document.getElementById('userDropdownCard');
    const logoutBtn = document.getElementById('dropdownLogoutBtn');
    const savedCollegesBtn = document.getElementById('dropdownSavedCollegesBtn');

    if (userChipBtn && dropdownCard) {
      userChipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdownCard.style.display === 'block';
        dropdownCard.style.display = isOpen ? 'none' : 'block';
      });

      document.addEventListener('click', () => {
        if (dropdownCard) dropdownCard.style.display = 'none';
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        AuthService.logout();
        showAuthNotification('Logged out successfully', 'info');
      });
    }

    if (savedCollegesBtn) {
      savedCollegesBtn.addEventListener('click', () => {
        const navExplorer = document.getElementById('navExplorer');
        if (navExplorer) navExplorer.click();
      });
    }
  }
}

function renderAuthModal() {
  if (document.getElementById('authModalOverlay')) return;

  const modalEl = document.createElement('div');
  modalEl.id = 'authModalOverlay';
  modalEl.className = 'auth-modal-overlay';
  modalEl.style.display = 'none';

  modalEl.innerHTML = `
    <div class="auth-modal-card">
      <button class="auth-modal-close" id="closeAuthModalBtn" aria-label="Close Modal">&times;</button>
      
      <div class="auth-modal-header">
        <div class="auth-logo-badge">E</div>
        <h2>EduMitra Student Sign In</h2>
        <p>Access personalized REAP cutoffs, scholarship matching & college saving</p>
      </div>

      <!-- Quick Social Google Login -->
      <div class="google-auth-container">
        <button id="googleDirectLoginBtn" class="google-btn">
          <svg class="google-icon" viewBox="0 0 48 48" width="20" height="20">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      <div class="auth-divider">
        <span>OR USE</span>
      </div>

      <!-- Auth Method Navigation Tabs -->
      <div class="auth-tabs">
        <button class="auth-tab-btn active" data-tab="emailTab" id="tabEmailBtn">
          ✉️ Email & Password
        </button>
        <button class="auth-tab-btn" data-tab="mobileTab" id="tabMobileBtn">
          📱 Mobile Number OTP
        </button>
      </div>

      <!-- Error / Success Alert Box -->
      <div id="authAlertBox" class="auth-alert-box" style="display:none;"></div>

      <!-- TAB 1: EMAIL & PASSWORD -->
      <div id="emailTab" class="auth-tab-content active">
        <form id="emailLoginForm" onsubmit="return false;">
          <div class="form-group">
            <label for="emailInput">Student Email Address</label>
            <input type="email" id="emailInput" class="auth-input" placeholder="e.g. student@gmail.com" required />
          </div>

          <div class="form-group">
            <label for="passwordInput">Password</label>
            <div class="password-input-wrapper">
              <input type="password" id="passwordInput" class="auth-input" placeholder="••••••••" required />
              <button type="button" id="togglePasswordBtn" class="toggle-pwd-btn">👁️</button>
            </div>
          </div>

          <div id="registerFields" style="display:none;">
            <div class="form-group">
              <label for="fullNameInput">Full Name</label>
              <input type="text" id="fullNameInput" class="auth-input" placeholder="e.g. Rahul Sharma" />
            </div>
            <div class="form-group">
              <label for="targetExamSelect">Target Course / Exam</label>
              <select id="targetExamSelect" class="auth-input">
                <option value="REAP Engineering (B.Tech)">REAP Engineering (B.Tech / BE)</option>
                <option value="Polytechnic Diploma">Rajasthan Polytechnic Diploma</option>
                <option value="Both REAP & Diploma">Both REAP & Polytechnic</option>
              </select>
            </div>
          </div>

          <div class="auth-form-actions">
            <button type="submit" id="submitEmailAuthBtn" class="auth-submit-btn">
              Sign In to EduMitra
            </button>
          </div>

          <div class="auth-mode-toggle">
            <span id="authToggleText">Don't have an account?</span>
            <button type="button" id="toggleAuthModeBtn" class="link-btn">Create Account</button>
          </div>
        </form>
      </div>

      <!-- TAB 2: MOBILE OTP LOGIN -->
      <div id="mobileTab" class="auth-tab-content">
        <form id="mobileLoginForm" onsubmit="return false;">
          <div id="mobileStep1">
            <div class="form-group">
              <label for="mobileInput">Mobile Number</label>
              <div class="mobile-input-wrapper">
                <span class="country-prefix">🇮🇳 +91</span>
                <input type="tel" id="mobileInput" class="auth-input mobile-input" placeholder="98290 12345" maxlength="10" />
              </div>
            </div>
            <button type="button" id="sendOtpBtn" class="auth-submit-btn">
              Send SMS OTP Verification
            </button>
          </div>

          <div id="mobileStep2" style="display:none; margin-top:1rem;">
            <div class="form-group">
              <label for="otpInput">Enter 6-Digit OTP Code</label>
              <input type="text" id="otpInput" class="auth-input otp-input" placeholder="123456" maxlength="6" />
              <small class="otp-hint">🔑 Demo OTP Code: <strong>123456</strong></small>
            </div>
            <button type="button" id="verifyOtpBtn" class="auth-submit-btn">
              Verify OTP & Sign In
            </button>
            <button type="button" id="resendOtpBtn" class="link-btn" style="margin-top:0.5rem;">
              Resend OTP
            </button>
          </div>
        </form>
      </div>

    </div>
  `;

  document.body.appendChild(modalEl);
}

let isRegisterMode = false;

function setupEventListeners() {
  // Modal toggle handlers
  const overlay = document.getElementById('authModalOverlay');
  const closeBtn = document.getElementById('closeAuthModalBtn');

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => closeAuthModal());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAuthModal();
    });
  }

  // Google Direct Login
  const googleBtn = document.getElementById('googleDirectLoginBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      try {
        const user = AuthService.loginWithGoogle();
        showAuthNotification(`Welcome, ${user.name}! Signed in with Google.`, 'success');
        closeAuthModal();
      } catch (err) {
        showAuthAlert(err.message, 'error');
      }
    });
  }

  // Auth Tab Switcher
  const tabBtns = document.querySelectorAll('.auth-tab-btn');
  const tabContents = document.querySelectorAll('.auth-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');

      hideAuthAlert();
    });
  });

  // Password visibility toggle
  const pwdInput = document.getElementById('passwordInput');
  const togglePwdBtn = document.getElementById('togglePasswordBtn');
  if (pwdInput && togglePwdBtn) {
    togglePwdBtn.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      togglePwdBtn.textContent = isPwd ? '🙈' : '👁️';
    });
  }

  // Register mode toggle
  const toggleModeBtn = document.getElementById('toggleAuthModeBtn');
  const registerFields = document.getElementById('registerFields');
  const submitEmailBtn = document.getElementById('submitEmailAuthBtn');
  const toggleText = document.getElementById('authToggleText');

  if (toggleModeBtn) {
    toggleModeBtn.addEventListener('click', () => {
      isRegisterMode = !isRegisterMode;
      if (isRegisterMode) {
        registerFields.style.display = 'block';
        submitEmailBtn.textContent = 'Create Student Account';
        toggleText.textContent = 'Already have an account?';
        toggleModeBtn.textContent = 'Sign In';
      } else {
        registerFields.style.display = 'none';
        submitEmailBtn.textContent = 'Sign In to EduMitra';
        toggleText.textContent = "Don't have an account?";
        toggleModeBtn.textContent = 'Create Account';
      }
      hideAuthAlert();
    });
  }

  // Email Submit Handler
  const emailForm = document.getElementById('emailLoginForm');
  if (emailForm) {
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('emailInput').value.trim();
      const password = document.getElementById('passwordInput').value;

      try {
        let user;
        if (isRegisterMode) {
          const name = document.getElementById('fullNameInput').value.trim();
          const targetExam = document.getElementById('targetExamSelect').value;
          user = AuthService.registerWithEmail(name, email, password, targetExam);
          showAuthNotification(`Account created! Welcome, ${user.name}.`, 'success');
        } else {
          user = AuthService.loginWithEmail(email, password);
          showAuthNotification(`Welcome back, ${user.name}!`, 'success');
        }
        closeAuthModal();
      } catch (err) {
        showAuthAlert(err.message, 'error');
      }
    });
  }

  // Mobile OTP Handlers
  const sendOtpBtn = document.getElementById('sendOtpBtn');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const mobileStep1 = document.getElementById('mobileStep1');
  const mobileStep2 = document.getElementById('mobileStep2');

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', () => {
      const mobileVal = document.getElementById('mobileInput').value.trim();
      try {
        const res = AuthService.sendMobileOTP(mobileVal);
        mobileStep1.style.display = 'none';
        mobileStep2.style.display = 'block';
        showAuthAlert(`OTP Sent to ${res.mobile}. Enter 123456 to verify.`, 'info');
      } catch (err) {
        showAuthAlert(err.message, 'error');
      }
    });
  }

  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', () => {
      const mobileVal = document.getElementById('mobileInput').value.trim();
      const otpVal = document.getElementById('otpInput').value.trim();

      try {
        const user = AuthService.verifyMobileOTP(mobileVal, otpVal);
        showAuthNotification(`Mobile Verified! Welcome, ${user.name}.`, 'success');
        closeAuthModal();
      } catch (err) {
        showAuthAlert(err.message, 'error');
      }
    });
  }
}

export function openAuthModal() {
  const overlay = document.getElementById('authModalOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    hideAuthAlert();
  }
}

export function closeAuthModal() {
  const overlay = document.getElementById('authModalOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function showAuthAlert(msg, type = 'error') {
  const alertBox = document.getElementById('authAlertBox');
  if (!alertBox) return;
  alertBox.className = `auth-alert-box ${type}`;
  alertBox.innerHTML = msg;
  alertBox.style.display = 'block';
}

function hideAuthAlert() {
  const alertBox = document.getElementById('authAlertBox');
  if (alertBox) alertBox.style.display = 'none';
}

function showAuthNotification(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `auth-toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : 'ℹ️'}</span> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
