// EduMitra AI - College Comparison Matrix Component

import { RAJASTHAN_COLLEGES } from '../data/colleges.js';

export function initComparisonComponent(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Selected default colleges: UCE RTU Kota vs SKIT Jaipur vs MBM Jodhpur vs GEC Ajmer
  let selectedCollegeIds = ['uce-rtu-kota', 'skit-jaipur', 'mbm-jodhpur', 'gec-ajmer'];

  window.compareWithCollege = (collegeId) => {
    if (!selectedCollegeIds.includes(collegeId)) {
      if (selectedCollegeIds.length >= 4) selectedCollegeIds.shift();
      selectedCollegeIds.push(collegeId);
    }
    // Switch to comparison tab
    const navBtn = document.querySelector('[data-view="comparison"]');
    if (navBtn) navBtn.click();
    renderComparison();
  };

  function renderComparison() {
    const selectedColleges = RAJASTHAN_COLLEGES.filter(c => selectedCollegeIds.includes(c.id));

    container.innerHTML = `
      <div>
        <div style="margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:700; color:#fff;">📊 Side-by-Side College Comparison</h2>
            <p style="color:var(--text-muted);">Compare key metrics between up to 4 Rajasthan engineering & polytechnic colleges.</p>
          </div>
        </div>

        <div style="margin-bottom:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
          <span style="font-size:0.85rem; color:var(--text-muted); align-self:center;">Select Colleges:</span>
          ${RAJASTHAN_COLLEGES.map(col => `
            <button class="chip-btn ${selectedCollegeIds.includes(col.id) ? 'active' : ''}" 
                    style="${selectedCollegeIds.includes(col.id) ? 'background:var(--primary); color:#fff; border-color:var(--primary);' : ''}"
                    onclick="window.toggleCollegeSelection('${col.id}')">
              ${col.shortName}
            </button>
          `).join('')}
        </div>

        <div class="comparison-table-wrapper">
          <table class="comparison-table">
            <thead>
              <tr>
                <th style="min-width:180px;">Feature Metric</th>
                ${selectedColleges.map(c => `
                  <th style="min-width:220px; text-align:center;">
                    <div style="font-size:1.1rem; color:#fff;">${c.shortName}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">${c.type}</div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Established Year</strong></td>
                ${selectedColleges.map(c => `<td style="text-align:center;">${c.established}</td>`).join('')}
              </tr>
              <tr>
                <td><strong>District / Location</strong></td>
                ${selectedColleges.map(c => `<td style="text-align:center;">📍 ${c.city} (${c.district})</td>`).join('')}
              </tr>
              <tr>
                <td><strong>Annual Tuition Fee</strong></td>
                ${selectedColleges.map(c => `<td style="text-align:center; color:#60a5fa; font-weight:bold;">₹${c.feesPerYear.toLocaleString()} / yr</td>`).join('')}
              </tr>
              <tr>
                <td><strong>Hostel Facilities & Fee</strong></td>
                ${selectedColleges.map(c => `<td style="text-align:center;">${c.hostelAvailable ? `Yes (₹${c.hostelFeesPerYear.toLocaleString()}/yr)` : 'No'}</td>`).join('')}
              </tr>
              <tr>
                <td><strong>Average Package</strong></td>
                ${selectedColleges.map(c => `<td style="text-align:center; color:#34d399; font-weight:bold;">${c.placements.avgPackage}</td>`).join('')}
              </tr>
              <tr>
                <td><strong>Highest Package</strong></td>
                ${selectedColleges.map(c => `<td style="text-align:center; color:#f59e0b; font-weight:bold;">${c.placements.highestPackage}</td>`).join('')}
              </tr>
              <tr>
                <td><strong>Placement Rate</strong></td>
                ${selectedColleges.map(c => `<td style="text-align:center;">${c.placements.placementPercentage}%</td>`).join('')}
              </tr>
              <tr>
                <td><strong>Accreditation / Affiliation</strong></td>
                ${selectedColleges.map(c => `<td style="text-align:center;">${c.accreditation}</td>`).join('')}
              </tr>
              <tr>
                <td><strong>Admission Mode</strong></td>
                ${selectedColleges.map(c => `<td style="text-align:center;">${c.courses[0] ? c.courses[0].mode : 'REAP / JEE Main'}</td>`).join('')}
              </tr>
              <tr>
                <td><strong>Top Recruiters</strong></td>
                ${selectedColleges.map(c => `<td style="text-align:center; font-size:0.8rem; color:var(--text-muted);">${c.placements.topRecruiters.slice(0, 4).join(', ')}</td>`).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  window.toggleCollegeSelection = (collegeId) => {
    if (selectedCollegeIds.includes(collegeId)) {
      if (selectedCollegeIds.length > 1) {
        selectedCollegeIds = selectedCollegeIds.filter(id => id !== collegeId);
      }
    } else {
      if (selectedCollegeIds.length >= 4) selectedCollegeIds.shift();
      selectedCollegeIds.push(collegeId);
    }
    renderComparison();
  };

  renderComparison();
}
