// EduMitra AI - Main Dashboard Controller & Router

import { initChatbotComponent } from './components/chatbot.js';
import { initCollegeExplorerComponent } from './components/collegeExplorer.js';
import { initComparisonComponent } from './components/comparison.js';
import { initCutoffExplorerComponent } from './components/cutoffExplorer.js';
import { initEligibilityCheckerComponent } from './components/eligibilityChecker.js';
import { initScholarshipFinderComponent } from './components/scholarshipFinder.js';
import { initAdmissionRoadmapComponent } from './components/admissionRoadmap.js';

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  window.currentLanguage = 'en';

  // Language Selector Switcher
  const langSelector = document.getElementById('langSelector');
  if (langSelector) {
    langSelector.addEventListener('change', (e) => {
      window.currentLanguage = e.target.value;
      initChatbotComponent('chatbotViewContainer', window.currentLanguage);
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

  // Initialize all components
  initChatbotComponent('chatbotViewContainer', window.currentLanguage);
  initCollegeExplorerComponent('explorerViewContainer');
  initComparisonComponent('comparisonViewContainer');
  initCutoffExplorerComponent('cutoffsViewContainer');
  initEligibilityCheckerComponent('eligibilityViewContainer');
  initScholarshipFinderComponent('scholarshipsViewContainer');
  initAdmissionRoadmapComponent('roadmapViewContainer');
});
