// EduMitra AI - College-ChatGPT Interactive UI Component

import { processUserQuery, resetConversationSession } from '../services/aiEngine.js';
import { TRANSLATIONS } from '../services/i18n.js';

export function initChatbotComponent(containerId, currentLang = 'en') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  container.innerHTML = `
    <div class="chat-layout" style="grid-template-columns: 280px 1fr;">
      
      <!-- Left ChatGPT Sidebar (Chat Threads & Quick Tools) -->
      <div class="glass-card" style="display:flex; flex-direction:column; justify-content:space-between; height: 620px;">
        <div>
          <button id="newChatBtn" class="send-btn" style="width:100%; justify-content:center; margin-bottom:1.25rem; background:linear-gradient(135deg,#3b82f6,#8b5cf6);">
            <span>+ New Conversation</span>
          </button>

          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.6rem;">
            💬 Recent Conversations
          </div>
          <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.85rem;" id="recentThreads">
            <button class="chip-btn" style="text-align:left; border-radius:var(--radius-sm);" data-query="Tell me everything about MBM University Jodhpur">🏛 MBM University Details</button>
            <button class="chip-btn" style="text-align:left; border-radius:var(--radius-sm);" data-query="I scored 78% in PCM. What branches can I get at RTU Kota or SKIT?">📈 Branch Cutoffs for 78%</button>
            <button class="chip-btn" style="text-align:left; border-radius:var(--radius-sm);" data-query="Compare RTU Kota vs SKIT Jaipur">⚖️ Compare RTU & SKIT</button>
            <button class="chip-btn" style="text-align:left; border-radius:var(--radius-sm);" data-query="What scholarships can I get in Rajasthan?">💰 Rajasthan Scholarships</button>
          </div>
        </div>

        <div>
          <div style="border-top:1px solid var(--border-glass); padding-top:1rem; margin-top:1rem;">
            <div style="font-size:0.75rem; color:var(--accent-cyan); font-weight:600;">⚡ Model: EduMitra-RAG 4.0</div>
            <div style="font-size:0.72rem; color:var(--text-dim); margin-top:0.2rem;">Grounded on REAP 2025 Seat Matrix & DTE Documents</div>
          </div>
        </div>
      </div>

      <!-- Center ChatGPT Workspace -->
      <div class="chat-box">
        <div class="chat-header">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:36px; height:36px; background:linear-gradient(135deg,#3b82f6,#8b5cf6); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.1rem; font-weight:bold;">🤖</div>
            <div>
              <h3 style="font-family:var(--font-heading); font-size:1.05rem; font-weight:700; color:#fff;">College-ChatGPT Assistant</h3>
              <p style="font-size:0.75rem; color:var(--accent-green);">● Conversational Rajasthan Admission AI • Multilingual</p>
            </div>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button id="speechInputBtn" class="btn-secondary" title="Click to speak" style="padding:0.4rem 0.8rem; font-size:0.85rem;">🎤 Voice Input</button>
            <button id="clearChatBtn" class="btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem;">${t.clearChat}</button>
          </div>
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
            <button class="chip-btn" data-query="Tell me everything about MBM University Jodhpur">🏛 MBM Details</button>
            <button class="chip-btn" data-query="I scored 78% in PCM. What branches can I get at RTU Kota or SKIT?">📈 Cutoffs for 78%</button>
            <button class="chip-btn" data-query="Compare RTU Kota vs SKIT Jaipur">⚖️ Compare RTU vs SKIT</button>
            <button class="chip-btn" data-query="What is the tuition fee and hostel fee at CTAE Udaipur?">💰 CTAE Fees</button>
          </div>
          <form class="chat-form" id="chatForm" style="margin-top:0.75rem;">
            <input type="text" id="chatInput" class="chat-input" placeholder="${t.inputPlaceholder}" autocomplete="off" required />
            <button type="submit" class="send-btn">
              <span>${t.sendBtn}</span>
            </button>
          </form>
        </div>
      </div>

    </div>
  `;

  // Attach Event Handlers
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const newChatBtn = document.getElementById('newChatBtn');
  const speechInputBtn = document.getElementById('speechInputBtn');

  // New Chat Handler
  const resetChat = () => {
    resetConversationSession();
    chatMessages.innerHTML = `
      <div class="message-bubble assistant">
        <strong>${t.welcomeTitle}</strong><br/>
        New conversation session started! Ask me anything about Rajasthan colleges, branch cutoffs, fees, or scholarships.
      </div>
    `;
  };

  clearChatBtn.addEventListener('click', resetChat);
  newChatBtn.addEventListener('click', resetChat);

  // Web Speech Recognition Handler (Voice Input)
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = false;

    speechInputBtn.addEventListener('click', () => {
      speechInputBtn.textContent = '🎙 Listening...';
      speechInputBtn.style.borderColor = 'var(--accent-rose)';
      recognition.start();
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
      speechInputBtn.textContent = '🎤 Voice Input';
      speechInputBtn.style.borderColor = 'var(--border-glass)';
      sendQuery(transcript);
    };

    recognition.onerror = () => {
      speechInputBtn.textContent = '🎤 Voice Input';
      speechInputBtn.style.borderColor = 'var(--border-glass)';
    };
  } else {
    speechInputBtn.style.display = 'none';
  }

  // Text-to-Speech (TTS Audio Reader)
  window.speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[*#•-]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy Text Handler
  window.copyChatText = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      navigator.clipboard.writeText(el.innerText);
      alert('Copied answer to clipboard!');
    }
  };

  // Streaming Response Typing Animation
  const typeStreamingResponse = (bubbleElement, htmlContent, plainText, result) => {
    let index = 0;
    bubbleElement.innerHTML = '';

    // Convert Markdown linebreaks and bold formatting
    let formattedHTML = htmlContent
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    bubbleElement.innerHTML = formattedHTML;

    // Append Copy & Speech Controls
    const bubbleId = 'bubble_' + Date.now();
    bubbleElement.id = bubbleId;

    const actionControls = document.createElement('div');
    actionControls.style.cssText = 'margin-top:0.8rem; padding-top:0.5rem; border-top:1px solid var(--border-glass); display:flex; gap:0.5rem; justify-content:flex-end; align-items:center;';
    actionControls.innerHTML = `
      <button onclick="window.speakText(document.getElementById('${bubbleId}').innerText)" class="chip-btn" style="font-size:0.75rem; padding:0.2rem 0.5rem;">🔊 Listen</button>
      <button onclick="window.copyChatText('${bubbleId}')" class="chip-btn" style="font-size:0.75rem; padding:0.2rem 0.5rem;">📋 Copy</button>
    `;
    bubbleElement.appendChild(actionControls);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

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
      
      let htmlContent = `<div>${result.responseText}</div>`;

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

      chatMessages.appendChild(assistantBubble);
      typeStreamingResponse(assistantBubble, htmlContent, result.responseText, result);
    }, 350);
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
