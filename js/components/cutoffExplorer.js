// EduMitra AI - REAP & Polytechnic Cutoff Explorer Component

import { REAP_CUTOFFS } from '../data/cutoffs.js';
import { RAJASTHAN_COLLEGES } from '../data/colleges.js';
import { AuthService } from '../services/auth.js';
import { openAuthModal } from './authModal.js';

export function initCutoffExplorerComponent(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentUser = AuthService.getUser();
  const defaultCategory = currentUser?.category || 'General';

  container.innerHTML = `
    <div>
      <div style="margin-bottom:1.5rem;">
        <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:700; color:#fff;">📈 REAP & Polytechnic Cutoff Explorer</h2>
        <p style="color:var(--text-muted);">Inspect verified historical opening and closing cutoffs (2023-2025) categorized by Category & Rank.</p>
        <div style="font-size:0.8rem; color:var(--accent-amber); margin-top:0.3rem;">⚠️ <em>Note: Historical cutoffs are provided for reference & trend analysis only. Admissions are subject to annual seat matrix.</em></div>
      </div>

      <!-- Controls -->
      <div class="filters-bar">
        <div class="filter-group">
          <label>Select Institution</label>
          <select id="cutoffCollegeSelect" class="filter-select">
            ${RAJASTHAN_COLLEGES.map(c => `<option value="${c.id}">${c.shortName} (${c.type})</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label>Category</label>
          <select id="cutoffCategorySelect" class="filter-select">
            <option value="General" ${defaultCategory === 'General' ? 'selected' : ''}>General / Open</option>
            <option value="OBC-NCL" ${defaultCategory === 'OBC-NCL' ? 'selected' : ''}>OBC-NCL</option>
            <option value="EWS" ${defaultCategory === 'EWS' ? 'selected' : ''}>EWS</option>
            <option value="SC" ${defaultCategory === 'SC' ? 'selected' : ''}>SC</option>
            <option value="ST" ${defaultCategory === 'ST' ? 'selected' : ''}>ST</option>
            <option value="TFWS" ${defaultCategory === 'TFWS' ? 'selected' : ''}>TFWS (Tuition Fee Waiver)</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Your 12th PCM / 10th %</label>
          <input type="number" id="userScoreInput" class="filter-input" placeholder="e.g. 82.5" step="0.1" value="82.0" />
        </div>
      </div>

      <!-- Result Card & Table -->
      <div id="cutoffResultContainer"></div>
    </div>
  `;

  const collegeSelect = document.getElementById('cutoffCollegeSelect');
  const catSelect = document.getElementById('cutoffCategorySelect');
  const scoreInput = document.getElementById('userScoreInput');
  const resultContainer = document.getElementById('cutoffResultContainer');

  function renderCutoffs() {
    const selectedCollegeId = collegeSelect.value;
    const selectedCat = catSelect.value;
    const userPct = parseFloat(scoreInput.value) || 82.0;

    const college = RAJASTHAN_COLLEGES.find(c => c.id === selectedCollegeId);
    const cutoffsObj = REAP_CUTOFFS.find(c => c.collegeId === selectedCollegeId);
    const user = AuthService.getUser();
    const isSaved = user && (user.savedColleges || []).includes(selectedCollegeId);

    let cutoffRows = [];
    if (cutoffsObj) {
      cutoffRows = cutoffsObj.cutoffs.filter(c => c.category === selectedCat);
      if (cutoffRows.length === 0) cutoffRows = cutoffsObj.cutoffs.slice(0, 3);
    }

    // Safety probability calculation
    let safetyLabel = 'Moderate Admission Chance';
    let safetyColor = 'var(--accent-amber)';
    if (userPct >= 88) {
      safetyLabel = 'High Admission Probability (Safe)';
      safetyColor = 'var(--accent-green)';
    } else if (userPct < 70) {
      safetyLabel = 'Reach / Competitive (Consider Upward Movement)';
      safetyColor = 'var(--accent-rose)';
    }

    resultContainer.innerHTML = `
      <div class="glass-card" style="margin-bottom:1.5rem; border-left:4px solid ${safetyColor};">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div>
            <h3 style="font-family:var(--font-heading); font-size:1.3rem; color:#fff;">${college.name}</h3>
            <p style="font-size:0.85rem; color:var(--text-muted);">Branch: ${cutoffsObj ? cutoffsObj.branch : 'Computer Science & Engineering'}</p>
          </div>
          <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
            <button id="toggleSaveCollegeBtn" class="auth-btn" style="background:${isSaved ? 'var(--accent-amber)' : 'rgba(255,255,255,0.08)'}; color:${isSaved ? '#000' : '#fff'}; border:1px solid var(--border-glass);">
              ${isSaved ? '★ Shortlisted' : '☆ Save to Shortlist'}
            </button>
            <div style="text-align:right;">
              <div style="font-size:0.8rem; color:var(--text-muted);">Safety Estimation for ${userPct}%:</div>
              <strong style="color:${safetyColor}; font-size:1.05rem;">${safetyLabel}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Category</th>
              <th>Min 12th PCM / 10th % Cutoff</th>
              <th>JEE Main Closing Rank</th>
              <th>Admission Status</th>
            </tr>
          </thead>
          <tbody>
            ${cutoffRows.length > 0 ? cutoffRows.map(row => `
              <tr>
                <td><strong>${row.year}</strong></td>
                <td><span class="badge-tag badge-govt">${row.category}</span></td>
                <td><strong style="color:#60a5fa;">${row.min12thPct ? row.min12thPct + '%' : (row.min10thPct ? row.min10thPct + '%' : '90.0%+')}</strong></td>
                <td>${row.jeeRank ? row.jeeRank.toLocaleString() : 'N/A'}</td>
                <td>
                  <span style="color:${userPct >= (row.min12thPct || row.min10thPct || 80) ? '#34d399' : '#f43f5e'}; font-weight:600;">
                    ${userPct >= (row.min12thPct || row.min10thPct || 80) ? '✓ Meets Historical Cutoff' : '⚠️ Below Cutoff'}
                  </span>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="5" style="text-align:center; color:var(--text-muted);">
                  Standard REAP Merit Rules Apply. Minimum 60% PCM required for REAP Registration.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `;

    const saveBtn = document.getElementById('toggleSaveCollegeBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const u = AuthService.getUser();
        if (!u) {
          openAuthModal();
          return;
        }
        const saved = u.savedColleges || [];
        const index = saved.indexOf(selectedCollegeId);
        if (index >= 0) {
          saved.splice(index, 1);
        } else {
          saved.push(selectedCollegeId);
        }
        u.savedColleges = saved;
        AuthService.setUser(u);
        renderCutoffs();
      });
    }
  }

  [collegeSelect, catSelect, scoreInput].forEach(el => el.addEventListener('change', renderCutoffs));
  [scoreInput].forEach(el => el.addEventListener('input', renderCutoffs));

  renderCutoffs();
}
