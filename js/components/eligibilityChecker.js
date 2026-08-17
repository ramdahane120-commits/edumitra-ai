// EduMitra AI - Instant Eligibility Checker Component

import { RAJASTHAN_COLLEGES } from '../data/colleges.js';

export function initEligibilityCheckerComponent(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div>
      <div style="margin-bottom:1.5rem; text-align:center;">
        <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:700; color:#fff;">✅ Instant REAP & Polytechnic Eligibility Checker</h2>
        <p style="color:var(--text-muted); max-width:600px; margin:0 auto;">Enter your academic qualifications to evaluate your official eligibility and eligible college seats in Rajasthan.</p>
      </div>

      <div class="form-wizard">
        <form id="eligibilityForm">
          <div class="form-group">
            <label>Target Education Stream</label>
            <select id="elStream" class="form-control">
              <option value="btech">B.Tech Engineering (REAP 2026)</option>
              <option value="diploma">Polytechnic Diploma (DTE Rajasthan)</option>
            </select>
          </div>

          <div class="form-group">
            <label>12th PCM Aggregate / 10th Aggregate Percentage (%)</label>
            <input type="number" id="elPercentage" class="form-control" placeholder="e.g. 78.5" step="0.1" required min="35" max="100" value="78.5" />
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="form-group">
              <label>Social Category</label>
              <select id="elCategory" class="form-control">
                <option value="General">General / Open</option>
                <option value="OBC-NCL">OBC-NCL</option>
                <option value="EWS">EWS</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
            <div class="form-group">
              <label>Rajasthan Domicile Status</label>
              <select id="elDomicile" class="form-control">
                <option value="yes">Yes (Rajasthan State Resident)</option>
                <option value="no">No (Out of State / OS Seats)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Annual Family Income (For Fee Waiver & Scholarships)</label>
            <select id="elIncome" class="form-control">
              <option value="low">Under ₹2.5 Lakhs / yr (Eligible for SJE Post-Matric & CM Scholarship)</option>
              <option value="mid">₹2.5 Lakhs - ₹8 Lakhs / yr (Eligible for TFWS 100% Tuition Waiver)</option>
              <option value="high">Above ₹8 Lakhs / yr</option>
            </select>
          </div>

          <button type="submit" class="send-btn" style="width:100%; justify-content:center; padding:1rem; margin-top:1rem;">
            ⚡ Check My Eligibility & Recommendations
          </button>
        </form>

        <div id="eligibilityReport" style="margin-top:1.5rem;"></div>
      </div>
    </div>
  `;

  const form = document.getElementById('eligibilityForm');
  const reportContainer = document.getElementById('eligibilityReport');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const stream = document.getElementById('elStream').value;
    const pct = parseFloat(document.getElementById('elPercentage').value) || 0;
    const category = document.getElementById('elCategory').value;
    const domicile = document.getElementById('elDomicile').value;
    const income = document.getElementById('elIncome').value;

    const minRequired = (category === 'General') ? (stream === 'btech' ? 45 : 40) : (stream === 'btech' ? 40 : 35);
    const isEligible = pct >= minRequired;

    let matchingColleges = RAJASTHAN_COLLEGES.filter(c => {
      if (stream === 'btech' && c.category !== 'Engineering') return false;
      if (stream === 'diploma' && c.category !== 'Polytechnic Diploma') return false;
      return true;
    }).slice(0, 3);

    reportContainer.innerHTML = `
      <div style="background:${isEligible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; border:1px solid ${isEligible ? 'var(--accent-green)' : 'var(--accent-rose)'}; border-radius:var(--radius-md); padding:1.25rem;">
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
          <div style="font-size:1.5rem;">${isEligible ? '✅' : '❌'}</div>
          <div>
            <h3 style="font-family:var(--font-heading); font-size:1.2rem; color:${isEligible ? '#34d399' : '#f43f5e'}; font-weight:700;">
              ${isEligible ? 'Fully Eligible for REAP / DTE Admissions!' : 'Not Eligible for Minimum REAP Criteria'}
            </h3>
            <p style="font-size:0.85rem; color:var(--text-muted);">
              Minimum requirement for ${category} category is ${minRequired}%. Your score: ${pct}%.
            </p>
          </div>
        </div>

        ${isEligible ? `
          <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-glass);">
            <div style="font-weight:600; color:var(--accent-cyan); font-size:0.9rem; margin-bottom:0.5rem;">🎯 Key Eligibility Benefits:</div>
            <ul style="font-size:0.85rem; color:var(--text-main); margin-left:1.2rem; display:flex; flex-direction:column; gap:0.3rem;">
              <li><strong>REAP Seat Allotment:</strong> Eligible for both Priority 1 (JEE score) and Priority 2 (12th PCM Score).</li>
              <li><strong>Domicile Quota:</strong> ${domicile === 'yes' ? '85% Rajasthan Home State quota seats unlocked.' : '15% Out-of-State quota seats unlocked.'}</li>
              <li><strong>Fee Waiver Status:</strong> ${income !== 'high' ? 'Eligible for TFWS (100% Tuition Fee Waiver) and Govt Scholarships.' : 'General Fee Structure Applies.'}</li>
            </ul>

            <div style="font-weight:600; color:#fff; font-size:0.95rem; margin-top:1rem; margin-bottom:0.5rem;">Recommended Institutions for You:</div>
            <div style="display:grid; grid-template-columns:1fr; gap:0.5rem;">
              ${matchingColleges.map(c => `
                <div style="background:rgba(15,23,42,0.8); padding:0.6rem 0.8rem; border-radius:var(--radius-sm); font-size:0.85rem; display:flex; justify-content:space-between; align-items:center;">
                  <span>📍 <strong>${c.shortName}</strong> (${c.district})</span>
                  <span style="color:var(--primary); font-weight:bold;">₹${c.feesPerYear.toLocaleString()}/yr</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  });
}
