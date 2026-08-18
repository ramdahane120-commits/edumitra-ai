// EduMitra AI - Scholarship Finder Catalog & Matcher Component

import { SCHOLARSHIPS_DATA } from '../data/scholarships.js';

export function initScholarshipFinderComponent(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div>
      <div style="margin-bottom:1.5rem;">
        <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:800; color:#0f172a;">💰 Rajasthan & National Scholarship Finder</h2>
        <p style="color:#334155; font-size:1rem;">Discover verified government scholarships, financial assistance schemes, and tuition fee waivers for Rajasthan students.</p>
      </div>

      <!-- Scholarship List -->
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:1.5rem;">
        ${SCHOLARSHIPS_DATA.map(sch => `
          <div class="glass-card" style="display:flex; flex-direction:column; justify-content:space-between; background:#ffffff; border:1px solid #cbd5e1; box-shadow:var(--shadow-card);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                <h3 style="font-family:var(--font-heading); font-size:1.25rem; color:#0f52ba; font-weight:800;">${sch.name}</h3>
                <span class="badge-tag badge-govt" style="font-size:0.7rem; font-weight:700;">Verified Scheme</span>
              </div>
              
              <div style="font-size:0.85rem; color:#0284c7; font-weight:700; margin-bottom:0.75rem;">
                🏢 Provider: ${sch.provider}
              </div>

              <div style="background:#f8fafc; padding:0.8rem; border-radius:var(--radius-md); border:1px solid #e2e8f0; margin-bottom:1rem;">
                <div style="font-size:0.78rem; color:#475569; font-weight:600;">Benefit Amount</div>
                <div style="font-size:1.1rem; font-weight:800; color:#047857;">${sch.amount}</div>
              </div>

              <div style="font-size:0.88rem; color:#0f172a; margin-bottom:0.75rem;">
                <strong style="color:#0f172a;">Eligibility Criteria:</strong>
                <ul style="margin-left:1.2rem; margin-top:0.3rem; font-size:0.82rem; color:#334155; display:flex; flex-direction:column; gap:0.25rem;">
                  ${sch.eligibility.slice(0, 3).map(e => `<li style="font-weight:500;">${e}</li>`).join('')}
                </ul>
              </div>

              <div style="font-size:0.82rem; color:#334155; margin-bottom:0.75rem; font-weight:500;">
                📄 <strong style="color:#0f172a;">Required Docs:</strong> ${sch.requiredDocuments.slice(0, 3).join(', ')}...
              </div>
            </div>

            <div style="border-top:1px solid #e2e8f0; padding-top:0.8rem; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.78rem; color:#047857; font-weight:700;">📅 Deadline: ${sch.deadline}</span>
              <a href="${sch.officialPortal}" target="_blank" class="auth-btn" style="padding:0.5rem 1rem; font-size:0.82rem; text-decoration:none; box-shadow:none;">Apply on Portal ➔</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
