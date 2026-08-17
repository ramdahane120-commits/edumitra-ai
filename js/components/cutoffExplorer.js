// EduMitra AI - REAP & Polytechnic Cutoff Explorer Component

import { REAP_CUTOFFS } from '../data/cutoffs.js';
import { RAJASTHAN_COLLEGES } from '../data/colleges.js';

export function initCutoffExplorerComponent(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

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
            <option value="General">General / Open</option>
            <option value="OBC-NCL">OBC-NCL</option>
            <option value="EWS">EWS</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="TFWS">TFWS (Tuition Fee Waiver)</option>
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
          <div style="text-align:right;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Safety Estimation for ${userPct}%:</div>
            <strong style="color:${safetyColor}; font-size:1.05rem;">${safetyLabel}</strong>
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
  }

  [collegeSelect, catSelect, scoreInput].forEach(el => el.addEventListener('change', renderCutoffs));
  [scoreInput].forEach(el => el.addEventListener('input', renderCutoffs));

  renderCutoffs();
}
