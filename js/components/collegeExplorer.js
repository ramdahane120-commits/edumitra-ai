// EduMitra AI - College Explorer Component

import { RAJASTHAN_COLLEGES } from '../data/colleges.js';
import { TRANSLATIONS } from '../services/i18n.js';
import { AuthService } from '../services/auth.js';
import { openAuthModal } from './authModal.js';

export function initCollegeExplorerComponent(containerId, currentLang = 'en') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Global window handler for shortlisting colleges
  window.toggleShortlistCollege = function(collegeId) {
    const user = AuthService.getUser();
    if (!user) {
      openAuthModal();
      return;
    }

    const saved = user.savedColleges || [];
    const index = saved.indexOf(collegeId);
    if (index >= 0) {
      saved.splice(index, 1);
    } else {
      saved.push(collegeId);
    }
    user.savedColleges = saved;
    AuthService.setUser(user);

    // Re-render
    const categorySelect = document.getElementById('explorerCategory');
    if (categorySelect) {
      const event = new Event('change');
      categorySelect.dispatchEvent(event);
    }
  };

  container.innerHTML = `
    <div>
      <div style="margin-bottom:1.5rem;">
        <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:700; color:#fff;">🎓 ${t.navExplorer} — Rajasthan</h2>
        <p style="color:var(--text-muted);">Explore and filter verified Engineering & Polytechnic institutions in Rajasthan.</p>
      </div>

      <!-- Filters Bar -->
      <div class="filters-bar">
        <div class="filter-group">
          <label>Search College / खोजें</label>
          <input type="text" id="explorerSearch" class="filter-input" placeholder="Search by name, city, RTU..." />
        </div>
        <div class="filter-group">
          <label>Institution Type / प्रकार</label>
          <select id="explorerType" class="filter-select">
            <option value="all">All Types (Govt & Private)</option>
            <option value="government">${t.govtBadge} Only</option>
            <option value="private">${t.privateBadge} Only</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Category</label>
          <select id="explorerCategory" class="filter-select">
            <option value="all">All (Engineering & Polytechnic)</option>
            <option value="Engineering">Engineering (B.Tech / REAP)</option>
            <option value="Polytechnic Diploma">Polytechnic (Diploma / DTE)</option>
          </select>
        </div>
        <div class="filter-group">
          <label>District / जिला</label>
          <select id="explorerDistrict" class="filter-select">
            <option value="all">All Districts</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Jodhpur">Jodhpur</option>
            <option value="Kota">Kota</option>
            <option value="Udaipur">Udaipur</option>
            <option value="Ajmer">Ajmer</option>
            <option value="Bikaner">Bikaner</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Max Fee per Year / अधिकतम फीस</label>
          <select id="explorerFee" class="filter-select">
            <option value="all">Any Fee Range</option>
            <option value="20000">Under ₹20,000 / yr (Polytechnic Govt)</option>
            <option value="70000">Under ₹70,000 / yr (Govt REAP)</option>
            <option value="100000">Under ₹1,00,000 / yr</option>
            <option value="150000">Under ₹1,50,000 / yr</option>
          </select>
        </div>
      </div>

      <!-- Colleges Grid -->
      <div id="explorerGrid" class="colleges-grid"></div>
    </div>
  `;

  const searchInput = document.getElementById('explorerSearch');
  const typeSelect = document.getElementById('explorerType');
  const categorySelect = document.getElementById('explorerCategory');
  const districtSelect = document.getElementById('explorerDistrict');
  const feeSelect = document.getElementById('explorerFee');
  const explorerGrid = document.getElementById('explorerGrid');

  function renderColleges() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedType = typeSelect.value;
    const selectedCat = categorySelect.value;
    const selectedDistrict = districtSelect.value;
    const maxFee = feeSelect.value !== 'all' ? parseInt(feeSelect.value, 10) : null;

    const user = AuthService.getUser();
    const savedList = user ? (user.savedColleges || []) : [];

    const filtered = RAJASTHAN_COLLEGES.filter(col => {
      if (query && !col.name.toLowerCase().includes(query) && !col.shortName.toLowerCase().includes(query) && !col.city.toLowerCase().includes(query)) {
        return false;
      }
      if (selectedType === 'government' && !col.type.toLowerCase().includes('government')) return false;
      if (selectedType === 'private' && col.type.toLowerCase().includes('government')) return false;
      if (selectedCat !== 'all' && col.category !== selectedCat) return false;
      if (selectedDistrict !== 'all' && col.district !== selectedDistrict) return false;
      if (maxFee && col.feesPerYear > maxFee) return false;
      return true;
    });

    if (filtered.length === 0) {
      explorerGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-muted);" class="glass-card">
          🚫 No colleges match your selected filters.
        </div>
      `;
      return;
    }

    explorerGrid.innerHTML = filtered.map(col => {
      const isSaved = savedList.includes(col.id);
      return `
        <div class="glass-card">
          <div class="college-card-header">
            <div>
              <div class="college-title">${col.shortName}</div>
              <div style="font-size:0.8rem; color:var(--text-muted);">${col.name}</div>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <button onclick="window.toggleShortlistCollege('${col.id}')" title="${isSaved ? 'Remove from shortlist' : 'Add to shortlist'}" style="background:transparent; border:none; cursor:pointer; font-size:1.2rem; transition:transform 0.2s ease;">
                ${isSaved ? '⭐' : '☆'}
              </button>
              <span class="badge-tag ${col.type.toLowerCase().includes('government') ? 'badge-govt' : 'badge-private'}">
                ${col.type.toLowerCase().includes('government') ? t.govtBadge : t.privateBadge}
              </span>
            </div>
          </div>

          <div style="font-size:0.82rem; color:var(--accent-cyan); margin-bottom:0.5rem;">
            📍 ${col.city}, ${col.district} District | Est. ${col.established}
          </div>

          <div class="college-specs">
            <div class="spec-item">
              <span>${t.tuitionFee}</span>
              <strong>₹${col.feesPerYear.toLocaleString()} / yr</strong>
            </div>
            <div class="spec-item">
              <span>${t.hostelFee}</span>
              <strong>${col.hostelAvailable ? `₹${col.hostelFeesPerYear.toLocaleString()} / yr` : 'N/A'}</strong>
            </div>
            <div class="spec-item">
              <span>${t.avgPackage}</span>
              <strong>${col.placements.avgPackage}</strong>
            </div>
            <div class="spec-item">
              <span>${t.highestPackage}</span>
              <strong>${col.placements.highestPackage}</strong>
            </div>
          </div>

          <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">
            🎯 <strong>Branches:</strong> ${col.courses.slice(0, 3).map(c => c.branch).join(', ')}
          </div>

          <div class="card-actions">
            <button class="btn-secondary" onclick="window.compareWithCollege('${col.id}')">${t.addToCompare}</button>
            <a href="${col.website}" target="_blank" class="btn-secondary" style="text-decoration:none;">${t.officialWebsite}</a>
          </div>
        </div>
      `;
    }).join('');
  }

  [searchInput, typeSelect, categorySelect, districtSelect, feeSelect].forEach(el => {
    el.addEventListener('input', renderColleges);
    el.addEventListener('change', renderColleges);
  });

  renderColleges();
}
