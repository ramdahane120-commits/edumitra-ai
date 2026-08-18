// EduMitra AI - Main Dashboard Controller & Router

import { initChatbotComponent } from './components/chatbot.js';
import { initCollegeExplorerComponent } from './components/collegeExplorer.js';
import { initComparisonComponent } from './components/comparison.js';
import { initCutoffExplorerComponent } from './components/cutoffExplorer.js';
import { initEligibilityCheckerComponent } from './components/eligibilityChecker.js';
import { initScholarshipFinderComponent } from './components/scholarshipFinder.js';
import { initAdmissionRoadmapComponent } from './components/admissionRoadmap.js';
import { initAuthSystem } from './components/authModal.js';
import { TRANSLATIONS } from './services/i18n.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Auth System (Login modal, Google OAuth, Mobile OTP, Header Profile Widget)
  initAuthSystem();

  // Global State
  window.currentLanguage = 'en';

  function updatePageLanguage(lang) {
    window.currentLanguage = lang;
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // 1. Update Navbar tabs
    const navChatbot = document.getElementById('navChatbot');
    const navExplorer = document.getElementById('navExplorer');
    const navComparison = document.getElementById('navComparison');
    const navCutoffs = document.getElementById('navCutoffs');
    const navEligibility = document.getElementById('navEligibility');
    const navScholarships = document.getElementById('navScholarships');
    const navRoadmap = document.getElementById('navRoadmap');

    if (navChatbot) navChatbot.innerHTML = `<span>🤖</span> ${t.navChatbot}`;
    if (navExplorer) navExplorer.innerHTML = `<span>🎓</span> ${t.navExplorer}`;
    if (navComparison) navComparison.innerHTML = `<span>📊</span> ${t.navComparison}`;
    if (navCutoffs) navCutoffs.innerHTML = `<span>📈</span> ${t.navCutoffs}`;
    if (navEligibility) navEligibility.innerHTML = `<span>✅</span> ${t.navEligibility}`;
    if (navScholarships) navScholarships.innerHTML = `<span>💰</span> ${t.navScholarships}`;
    if (navRoadmap) navRoadmap.innerHTML = `<span>🧭</span> ${t.navRoadmap}`;

    // 2. Update Hero Banner
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const stat1 = document.getElementById('stat1');
    const stat2 = document.getElementById('stat2');
    const stat3 = document.getElementById('stat3');
    const stat4 = document.getElementById('stat4');

    if (heroTitle) heroTitle.textContent = t.heroTitle;
    if (heroSubtitle) heroSubtitle.textContent = t.heroSubtitle;
    if (stat1) stat1.textContent = t.verifiedInstitutions;
    if (stat2) stat2.textContent = t.reapCutoffRange;
    if (stat3) stat3.textContent = t.verifiedScholarships;
    if (stat4) stat4.textContent = t.ragAntiHallucination;

    // 3. Re-initialize ALL components with selected language
    initChatbotComponent('chatbotViewContainer', lang);
    initCollegeExplorerComponent('explorerViewContainer', lang);
    initComparisonComponent('comparisonViewContainer');
    initCutoffExplorerComponent('cutoffsViewContainer');
    initEligibilityCheckerComponent('eligibilityViewContainer');
    initScholarshipFinderComponent('scholarshipsViewContainer');
    initAdmissionRoadmapComponent('roadmapViewContainer');
  }

  // Language Selector Switcher
  const langSelector = document.getElementById('langSelector');
  if (langSelector) {
    langSelector.addEventListener('change', (e) => {
      updatePageLanguage(e.target.value);
    });
  }

  // Navigation Tabs Handler
  const navButtons = document.querySelectorAll('.nav-btn');
  const viewSections = document.querySelectorAll('.view-section');

  function switchView(targetView) {
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-view') === targetView) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    viewSections.forEach(section => {
      if (section.id === `${targetView}View`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });

  // Initialize page
  updatePageLanguage('en');
});
