// EduMitra AI - Interactive RAG Chatbot UI Component

import { processUserQuery } from '../services/aiEngine.js';
import { TRANSLATIONS } from '../services/i18n.js';

export function initChatbotComponent(containerId, currentLang = 'en') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  container.innerHTML = `
    <div class="chat-layout">
      <div class="chat-box">
        <div class="chat-header">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:36px; height:36px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.1rem; font-weight:bold;">🤖</div>
            <div>
              <h3 style="font-family:var(--font-heading); font-size:1.05rem; font-weight:700; color:#fff;">EduMitra AI Conversational Assistant</h3>
              <p style="font-size:0.75rem; color:var(--accent-green);">● Verified NLU & Grounded REAP Admissions Engine</p>
            </div>
          </div>
          <button id="clearChatBtn" class="btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem;">${t.clearChat}</button>
        </div>

        <div class="chat-messages" id="chatMessages">
          <div class="message-bubble assistant">
            <strong>${t.welcomeTitle}</strong><br/>
            ${t.welcomeDesc}<br/><br/>
            <strong>Examples of what you can ask me:</strong>
            <ul style="margin-left:1.2rem; margin-top:0.4rem; font-size:0.85rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.3rem;">
              <li>• "Tell me everything about MBM University Jodhpur"</li>
              <li>• "I got 78% in PCM. What branches can I get at RTU Kota or SKIT?"</li>
              <li>• "Compare RTU Kota vs SKIT Jaipur"</li>
              <li>• "What is the fee and hostel facility at CTAE Udaipur?"</li>
              <li>• "What scholarships can I get for 85% marks?"</li>
            </ul>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="prompt-chips">
            <button class="chip-btn" data-query="Tell me everything about MBM University Jodhpur">🏛 Details of MBM Jodhpur</button>
            <button class="chip-btn" data-query="I scored 78% in PCM. What branches can I get at RTU Kota or SKIT?">📊 Branches for 78% Marks</button>
            <button class="chip-btn" data-query="Compare RTU Kota vs SKIT Jaipur">⚖️ Compare RTU vs SKIT</button>
            <button class="chip-btn" data-query="What is the tuition fee and hostel fee at CTAE Udaipur?">💰 Fees for CTAE Udaipur</button>
          </div>
          <form class="chat-form" id="chatForm" style="margin-top:0.75rem;">
            <input type="text" id="chatInput" class="chat-input" placeholder="${t.inputPlaceholder}" autocomplete="off" required />
            <button type="submit" class="send-btn">
              <span>${t.sendBtn}</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Right Sidebar: Quick Profile & Context -->
      <div class="glass-card" style="height: fit-content;">
        <h4 style="font-family:var(--font-heading); font-size:1.1rem; color:#fff; margin-bottom:1rem;">⚡ Interactive Assistant Features</h4>
        <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.88rem;">
          <div style="background:rgba(15,23,42,0.6); padding:0.8rem; border-radius:var(--radius-md); border:1px solid var(--border-glass);">
            <div style="color:var(--accent-cyan); font-weight:600; margin-bottom:0.2rem;">🏛 Deep Institution Details</div>
            <div style="color:var(--text-muted); font-size:0.8rem;">Ask about any specific college in Rajasthan for fees, intake, hostels, and recruiters.</div>
          </div>
          <div style="background:rgba(15,23,42,0.6); padding:0.8rem; border-radius:var(--radius-md); border:1px solid var(--border-glass);">
            <div style="color:var(--accent-amber); font-weight:600; margin-bottom:0.2rem;">🎯 Branch-wise Cutoff Prediction</div>
            <div style="color:var(--text-muted); font-size:0.8rem;">Enter your 12th PCM % or JEE rank to see realistic branch allotment chances (CSE, ECE, EE, ME, Mining).</div>
          </div>
          <div style="background:rgba(15,23,42,0.6); padding:0.8rem; border-radius:var(--radius-md); border:1px solid var(--border-glass);">
            <div style="color:var(--accent-green); font-weight:600; margin-bottom:0.2rem;">⚡ Platform Action Execution</div>
            <div style="color:var(--text-muted); font-size:0.8rem;">The AI can trigger side-by-side comparison tables, scholarship lists, and roadmaps directly on screen.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Event Handlers
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const clearChatBtn = document.getElementById('clearChatBtn');

  clearChatBtn.addEventListener('click', () => {
    chatMessages.innerHTML = `
      <div class="message-bubble assistant">
        Chat cleared. Ask me anything about Rajasthan colleges, branch cutoffs, fees, or scholarships!
      </div>
    `;
  });

  const sendQuery = (text) => {
    if (!text.trim()) return;

    // Append User Message
    const userBubble = document.createElement('div');
    userBubble.className = 'message-bubble user';
    userBubble.textContent = text;
    chatMessages.appendChild(userBubble);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Process via AI Engine
    setTimeout(() => {
      const result = processUserQuery(text, window.currentLanguage || currentLang);
      
      const assistantBubble = document.createElement('div');
      assistantBubble.className = 'message-bubble assistant';
      
      // Convert Markdown linebreaks and bold tags into clean HTML formatting
      let formattedText = result.responseText
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      let htmlContent = `<div style="line-height:1.6;">${formattedText}</div>`;

      // Interactive Action Buttons if applicable
      if (result.actionData) {
        if (result.actionData.type === 'OPEN_TAB') {
          htmlContent += `
            <div style="margin-top:1rem; padding-top:0.8rem; border-top:1px solid var(--border-glass);">
              <button class="send-btn" style="padding:0.5rem 1rem; font-size:0.85rem;" onclick="document.querySelector('[data-view=\\'${result.actionData.tab}\\']').click()">
                ⚡ View Live ${result.actionData.tab.toUpperCase()} Tool ➔
              </button>
            </div>
          `;
        }
      }

      // Render structured cards if applicable
      if (result.structuredData && result.structuredData.length > 0) {
        if (result.intent === 'recommendation') {
          htmlContent += `<div style="display:grid; grid-template-columns:1fr; gap:0.75rem; margin-top:0.8rem;">`;
          result.structuredData.forEach(col => {
            htmlContent += `
              <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:0.8rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="color:#60a5fa; font-size:0.95rem;">${col.name} (${col.shortName})</strong>
                  <span class="badge-tag ${col.type.includes('Government') ? 'badge-govt' : 'badge-private'}">${col.type.includes('Government') ? t.govtBadge : t.privateBadge}</span>
                </div>
                <div style="font-size:0.82rem; color:var(--text-muted); margin-top:0.3rem;">
                  📍 ${col.district} | 💰 ${t.tuitionFee}: ₹${col.feesPerYear.toLocaleString()}/yr | 🏠 ${t.hostelFee}: ${col.hostelAvailable ? '₹' + col.hostelFeesPerYear.toLocaleString() : 'N/A'}
                </div>
                <div style="font-size:0.82rem; color:var(--accent-green); margin-top:0.3rem;">
                  💼 ${t.avgPackage}: ${col.placements.avgPackage} (${t.highestPackage}: ${col.placements.highestPackage})
                </div>
              </div>
            `;
          });
          htmlContent += `</div>`;
        }
      }

      // Render Verified Source Badges
      if (result.sources && result.sources.length > 0) {
        htmlContent += `<div style="margin-top:0.8rem;">`;
        result.sources.forEach(src => {
          htmlContent += `<span class="source-badge">📄 Source: ${src}</span>`;
        });
        htmlContent += `</div>`;
      }

      assistantBubble.innerHTML = htmlContent;
      chatMessages.appendChild(assistantBubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 400);
  };

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendQuery(chatInput.value);
  });

  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sendQuery(btn.getAttribute('data-query'));
    });
  });
}
