// EduMitra AI - Admission Roadmap Component

import { ADMISSION_ROADMAP_STEPS } from '../data/roadmap.js';

export function initAdmissionRoadmapComponent(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div>
      <div style="margin-bottom:1.5rem;">
        <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:800; color:#0f172a;">🧭 Rajasthan REAP & DTE Personalized Admission Roadmap</h2>
        <p style="color:#334155; font-size:1rem;">Navigate every phase of your college selection, choice filling, document upload, and counselling smoothly.</p>
      </div>

      <div class="timeline-container">
        ${ADMISSION_ROADMAP_STEPS.map(step => `
          <div class="timeline-item" style="background:#ffffff; border:1px solid #cbd5e1; box-shadow:var(--shadow-card);">
            <div class="timeline-dot" style="background:#0f52ba; color:#ffffff; font-weight:800; border:3px solid #ffffff; box-shadow:0 4px 10px rgba(15,82,186,0.25);">${step.step}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
              <h3 class="timeline-title" style="color:#0f172a; font-weight:800; font-size:1.25rem;">${step.title}</h3>
              <span class="badge-tag badge-govt" style="font-size:0.75rem; font-weight:700;">${step.timeline}</span>
            </div>

            <p style="font-size:0.92rem; color:#334155; margin-bottom:1rem; font-weight:500; line-height:1.5;">${step.description}</p>

            <div style="background:#f8fafc; padding:1rem; border-radius:var(--radius-md); border:1px solid #e2e8f0;">
              <div style="font-size:0.85rem; font-weight:800; color:#0f52ba; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.5px;">Action Checklist:</div>
              <ul style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.4rem; list-style:none;">
                ${step.checklist.map(item => `
                  <li style="font-size:0.85rem; color:#0f172a; font-weight:600; display:flex; align-items:center; gap:0.4rem;">
                    <span style="color:#047857; font-weight:800;">☑</span> ${item}
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
