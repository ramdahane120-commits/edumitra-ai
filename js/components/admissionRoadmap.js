// EduMitra AI - Admission Roadmap Component

import { ADMISSION_ROADMAP_STEPS } from '../data/roadmap.js';

export function initAdmissionRoadmapComponent(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div>
      <div style="margin-bottom:1.5rem;">
        <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:700; color:#fff;">🧭 Rajasthan REAP & DTE Personalized Admission Roadmap</h2>
        <p style="color:var(--text-muted);">Navigate every phase of your college selection, choice filling, document upload, and counselling smoothly.</p>
      </div>

      <div class="timeline-container">
        ${ADMISSION_ROADMAP_STEPS.map(step => `
          <div class="timeline-item">
            <div class="timeline-dot">${step.step}</div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap;">
              <h3 class="timeline-title">${step.title}</h3>
              <span class="badge-tag badge-govt" style="font-size:0.75rem;">${step.timeline}</span>
            </div>

            <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">${step.description}</p>

            <div style="background:rgba(15,23,42,0.6); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-glass);">
              <div style="font-size:0.85rem; font-weight:600; color:var(--accent-cyan); margin-bottom:0.5rem;">Action Checklist:</div>
              <ul style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.4rem; list-style:none;">
                ${step.checklist.map(item => `
                  <li style="font-size:0.83rem; color:var(--text-main); display:flex; align-items:center; gap:0.4rem;">
                    <span style="color:var(--accent-green);">☑</span> ${item}
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
