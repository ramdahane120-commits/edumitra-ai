// EduMitra AI - Student Authentication Service

const STORAGE_KEY = 'edumitra_user_session';
const LISTENERS = [];

// Default demo user profile for quick Google login
const DEMO_GOOGLE_USER = {
  id: 'g_109283741',
  name: 'Rahul Sharma',
  email: 'rahul.sharma.reap2026@gmail.com',
  phone: '+91 98290 12345',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
  provider: 'Google',
  targetExam: 'REAP Engineering (B.Tech)',
  jeeRank: 38450,
  category: 'OBC-NCL',
  savedColleges: ['rtu_kota', 'mbm_jodhpur']
};

export const AuthService = {
  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading user session:', e);
      return null;
    }
  },

  setUser(user) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      this._notify();
    } catch (e) {
      console.error('Error saving user session:', e);
    }
  },

  onAuthChange(callback) {
    LISTENERS.push(callback);
  },

  _notify() {
    const current = this.getUser();
    LISTENERS.forEach(fn => fn(current));
  },

  loginWithEmail(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both Email Address and Password.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const nameFromEmail = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
    const formattedName = nameFromEmail ? (nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)) : 'Aspirant Student';

    const user = {
      id: 'usr_' + Date.now(),
      name: formattedName,
      email: email,
      phone: '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      provider: 'Email & Password',
      targetExam: 'REAP Engineering (B.Tech)',
      jeeRank: 42000,
      category: 'General',
      savedColleges: []
    };

    this.setUser(user);
    return user;
  },

  registerWithEmail(name, email, password, targetExam, phone) {
    if (!name || !email || !password) {
      throw new Error('Please fill in all required registration fields.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const user = {
      id: 'usr_' + Date.now(),
      name: name,
      email: email,
      phone: phone || '',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      provider: 'Email & Password',
      targetExam: targetExam || 'REAP Engineering (B.Tech)',
      jeeRank: 35000,
      category: 'General',
      savedColleges: []
    };

    this.setUser(user);
    return user;
  },

  sendMobileOTP(mobileNumber) {
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      throw new Error('Please enter a valid 10-digit Indian mobile number.');
    }
    return {
      success: true,
      mobile: '+91 ' + cleanMobile.slice(-10),
      demoOTP: '123456',
      message: 'OTP sent! Demo OTP code is: 123456'
    };
  },

  verifyMobileOTP(mobileNumber, otp) {
    if (otp !== '123456' && otp !== '654321') {
      throw new Error('Invalid OTP code. Please enter 123456 for demo verification.');
    }
    const cleanMobile = mobileNumber.replace(/\D/g, '');

    const user = {
      id: 'mob_' + Date.now(),
      name: 'Student (+91 ' + cleanMobile.slice(-4) + ')',
      email: `student_${cleanMobile.slice(-4)}@edumitra.ai`,
      phone: '+91 ' + cleanMobile.slice(-10),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanMobile}`,
      provider: 'Mobile OTP',
      targetExam: 'REAP Engineering (B.Tech)',
      jeeRank: 45000,
      category: 'OBC-NCL',
      savedColleges: []
    };

    this.setUser(user);
    return user;
  },

  loginWithGoogle() {
    const user = { ...DEMO_GOOGLE_USER, id: 'g_' + Date.now() };
    this.setUser(user);
    return user;
  },

  logout() {
    this.setUser(null);
  }
};
