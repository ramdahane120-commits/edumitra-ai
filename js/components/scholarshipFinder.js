// EduMitra AI - Scholarship Finder Catalog & Matcher Component

import { SCHOLARSHIPS_DATA } from '../data/scholarships.js';

export function initScholarshipFinderComponent(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div>
      <div style="margin-bottom:1.5rem;">
        <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:700; color:#fff;">💰 Rajasthan & National Scholarship Finder</h2>
        <p style="color:var(--text-muted);">Discover verified government scholarships, financial assistance schemes, and tuition fee waivers for Rajasthan students.</p>
      </div>

      <!-- Scholarship List -->
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:1.5rem;">
        ${SCHOLARSHIPS_DATA.map(sch => `
          <div class="glass-card" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                <h3 style="font-family:var(--font-heading); font-size:1.15rem; color:#f59e0b; font-weight:700;">${sch.name}</h3>
                <span class="badge-tag badge-govt" style="font-size:0.7rem;">Verified Scheme</span>
              </div>
              
              <div style="font-size:0.8rem; color:var(--accent-cyan); margin-bottom:0.75rem;">
                🏢 Provider: ${sch.provider}
              </div>

              <div style="background:rgba(15,23,42,0.6); padding:0.8rem; border-radius:var(--radius-md); border:1px solid var(--border-glass); margin-bottom:1rem;">
                <div style="font-size:0.78rem; color:var(--text-muted);">Benefit Amount</div>
                <div style="font-size:1rem; font-weight:700; color:#34d399;">${sch.amount}</div>
              </div>

              <div style="font-size:0.85rem; color:var(--text-main); margin-bottom:0.75rem;">
                <strong>Eligibility Criteria:</strong>
                <ul style="margin-left:1.2rem; margin-top:0.3rem; font-size:0.8rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.2rem;">
                  ${sch.eligibility.slice(0, 3).map(e => `<li>${e}</li>`).join('')}
                </ul>
              </div>

              <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.75rem;">
                📄 <strong>Required Docs:</strong> ${sch.requiredDocuments.slice(0, 3).join(', ')}...
              </div>
            </div>

            <div style="border-top:1px solid var(--border-glass); padding-top:0.8rem; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.75rem; color:var(--accent-green);">📅 Deadline: ${sch.deadline}</span>
              <a href="${sch.officialPortal}" target="_blank" class="btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem; text-decoration:none;">Apply on Portal ➔</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
