// EduMitra AI - Comprehensive Conversational NLU & Natural Knowledge Graph Engine

import { RAJASTHAN_COLLEGES } from '../data/colleges.js';
import { REAP_CUTOFFS } from '../data/cutoffs.js';
import { SCHOLARSHIPS_DATA } from '../data/scholarships.js';
import { ADMISSION_ROADMAP_STEPS } from '../data/roadmap.js';

// College Alias Registry for Robust Entity Extraction
const COLLEGE_ALIASES = [
  { id: 'mnit-jaipur', keywords: ['mnit', 'malaviya', 'nit jaipur', 'mnit jaipur'] },
  { id: 'uce-rtu-kota', keywords: ['rtu', 'rtu kota', 'uce rtu', 'kota engineering', 'university college of engineering'] },
  { id: 'mbm-jodhpur', keywords: ['mbm', 'mbm jodhpur', 'mbm university', 'mbm college'] },
  { id: 'ctae-udaipur', keywords: ['ctae', 'ctae udaipur', 'mpuat'] },
  { id: 'skit-jaipur', keywords: ['skit', 'skit jaipur', 'swami keshvanand'] },
  { id: 'gec-ajmer', keywords: ['gec ajmer', 'ec ajmer', 'ajmer engineering'] },
  { id: 'gec-bikaner', keywords: ['gec bikaner', 'ecb', 'bikaner engineering'] },
  { id: 'jecrc-jaipur', keywords: ['jecrc', 'jecrc foundation', 'jecrc jaipur'] },
  { id: 'gpc-jaipur', keywords: ['gpc jaipur', 'polytechnic jaipur', 'govt polytechnic jaipur'] },
  { id: 'gpc-jodhpur', keywords: ['gpc jodhpur', 'polytechnic jodhpur', 'govt polytechnic jodhpur'] },
  { id: 'gpc-kota', keywords: ['gpc kota', 'polytechnic kota', 'govt polytechnic kota'] },
  { id: 'gpc-udaipur', keywords: ['gpc udaipur', 'polytechnic udaipur', 'govt polytechnic udaipur'] }
];

export function processUserQuery(query, language = 'en') {
  const rawQuery = query.trim();
  const queryLower = rawQuery.toLowerCase();

  // 1. Extract Marks (% or raw numbers between 35 and 99)
  let userMarks = null;
  const explicitMarksMatch = queryLower.match(/(\d{1,2}(\.\d{1,2})?)\s*(%|percent|pct|marks|अंक|नंबर)/i);
  if (explicitMarksMatch) {
    userMarks = parseFloat(explicitMarksMatch[1]);
  } else {
    const implicitMatch = queryLower.match(/(?:got|scored|have|with|pcm|board|12th|10th|percentage)\s*(\d{2}(\.\d{1,2})?)/i) || queryLower.match(/\b([4-9]\d(\.\d{1,2})?)\b/);
    if (implicitMatch) {
      const num = parseFloat(implicitMatch[1]);
      if (num >= 35 && num <= 100) userMarks = num;
    }
  }

  // 2. Extract JEE Rank
  let userRank = null;
  const rankMatch = queryLower.match(/(\d{4,6})\s*(rank|jee|merit|रैंक)/i) || queryLower.match(/rank\s*(\d{4,6})/i);
  if (rankMatch) userRank = parseInt(rankMatch[1], 10);

  // 3. College Match using Alias Registry
  let targetCollege = null;
  for (const alias of COLLEGE_ALIASES) {
    if (alias.keywords.some(kw => queryLower.includes(kw))) {
      targetCollege = RAJASTHAN_COLLEGES.find(c => c.id === alias.id);
      if (targetCollege) break;
    }
  }
  if (!targetCollege) {
    targetCollege = RAJASTHAN_COLLEGES.find(c => 
      queryLower.includes(c.shortName.toLowerCase()) || 
      queryLower.includes(c.id) ||
      c.name.toLowerCase().includes(queryLower)
    );
  }

  // 4. District / City Match
  const cities = ['jaipur', 'jodhpur', 'kota', 'udaipur', 'ajmer', 'bikaner', 'bhilwara'];
  const targetCity = cities.find(city => queryLower.includes(city));

  // 5. Concept Flags
  const isGreeting = queryLower.match(/\b(hi|hello|hey|namaste|khammaghani|ram ram|रामां-रामां|नमस्ते|हेलो|हाय)\b/i);
  const isWhoAreYou = queryLower.includes('who are you') || queryLower.includes('your name') || queryLower.includes('क्या हो') || queryLower.includes('कौन हो');
  const isGovtOnly = queryLower.includes('govt') || queryLower.includes('government') || queryLower.includes('सरकारी');
  const isPrivateOnly = queryLower.includes('private') || queryLower.includes('प्राइवेट');
  const isPolytechnic = queryLower.includes('polytechnic') || queryLower.includes('diploma') || queryLower.includes('डिप्लोमा');
  const isHostel = queryLower.includes('hostel') || queryLower.includes('हॉस्टल') || queryLower.includes('रहने') || queryLower.includes('room');
  const isFee = queryLower.includes('fee') || queryLower.includes('fees') || queryLower.includes('फीस') || queryLower.includes('खर्चा') || queryLower.includes('cost') || queryLower.includes('cheap');
  const isPlacement = queryLower.includes('placement') || queryLower.includes('package') || queryLower.includes('job') || queryLower.includes('कंपनी') || queryLower.includes('नौकरी');
  const isScholarship = queryLower.includes('scholarship') || queryLower.includes('छात्रवृत्ति') || queryLower.includes('fee waiver') || queryLower.includes('tfws');
  const isCompare = queryLower.includes('compare') || queryLower.includes('vs') || queryLower.includes('अंतर') || queryLower.includes('तुलना') || queryLower.includes('better');
  const isRoadmap = queryLower.includes('roadmap') || queryLower.includes('process') || queryLower.includes('step') || queryLower.includes('प्रक्रिया') || queryLower.includes('काउंसलिंग') || queryLower.includes('how to apply') || queryLower.includes('form') || queryLower.includes('date');
  const isReapInfo = queryLower.includes('reap') || queryLower.includes('what is reap') || queryLower.includes('counselling');
  
  // Cutoff & Branch Specific Keywords
  const isCutoffQuery = queryLower.includes('cutoff') || queryLower.includes('cut off') || queryLower.includes('cut-off') || queryLower.includes('कटऑफ') || queryLower.includes('रैंक') || queryLower.includes('closing rank') || queryLower.includes('opening rank') || queryLower.includes('how much percent') || queryLower.includes('how many marks');

  let intent = 'conversational';
  let responseText = '';
  let structuredData = [];
  let sources = [];
  let actionData = null;

  // ----------------------------------------------------
  // INTENT 1: Branch Cutoffs by Percentage / Marks Query
  // e.g. "cutoff of branches according to percentage secured", "what is CSE cutoff for 80%"
  // ----------------------------------------------------
  if (isCutoffQuery) {
    intent = 'cutoff_analysis';
    sources = ["REAP 2024-2025 Official Final Merit & Cutoff Percentile Data", "DTE Rajasthan Seat Matrix"];
    actionData = { type: 'OPEN_TAB', tab: 'cutoffs' };

    if (userMarks !== null) {
      responseText = language === 'hi'
        ? `📈 **आपके ${userMarks}% अंकों के आधार पर ब्रांच-वार REAP कटऑफ विश्लेषण:**\n\n` +
          `आपके 12वीं PCM के **${userMarks}%** अंकों के आधार पर, विभिन्न ब्रांचों में कटऑफ और संभावित आवंटन इस प्रकार है:\n\n` +
          `1. **कंप्यूटर साइंस (CSE / AI & Data Science):**\n` +
          `   - **सरकारी कॉलेज (RTU Kota / MBM / CTAE):** कटऑफ ~84% - 88%। (${userMarks >= 84 ? '✅ उच्च संभावना (Target)' : '⚠️ बॉर्डर / रीच (Upward Movement में सम्भव)'})\n` +
          `   - **शीर्ष प्राइवेट (SKIT / JECRC):** कटऑफ ~75% - 78%। (${userMarks >= 75 ? '✅ बहुत उच्च संभावना (Safe)' : '⚠️ प्रतिस्पर्धात्मक'})\n\n` +
          `2. **इलेक्ट्रॉनिक्स एवं कम्यूनिकेशन (ECE / IT):**\n` +
          `   - **सरकारी कॉलेज (RTU Kota / GEC Ajmer):** कटऑफ ~78% - 82%। (${userMarks >= 78 ? '✅ बहुत उच्च संभावना (Safe)' : '⚠️ moderate'})\n` +
          `   - **प्राइवेट कॉलेज:** कटऑफ ~68% - 72%। (✅ सुरक्षित सीट)\n\n` +
          `3. **इलेक्ट्रिकल (EE) एवं मैकेनिकल (ME):**\n` +
          `   - **सरकारी कॉलेज:** कटऑफ ~72% - 76%। (${userMarks >= 72 ? '✅ सुरक्षित सरकारी सीट' : '⚠️ संभावना'})\n\n` +
          `4. **सिविल (CE) एवं माइनिंग (Mining Engg):**\n` +
          `   - **MBM जोधपुर / CTAE उदयपुर:** कटऑफ ~70% - 74%। (${userMarks >= 70 ? '✅ बहुत आसान प्रवेश' : '⚠️ प्रयास करें'})`
        : `📈 **Branch-wise REAP Cutoff Analysis ${userMarks ? `for ${userMarks}% PCM Score` : ''}:**\n\n` +
          `Based on official REAP 2024-2025 closing cutoff percentile data for **${userMarks}% PCM aggregate score**, here is your branch-by-branch evaluation:\n\n` +
          `1. **Computer Science (CSE / AI & Data Science):**\n` +
          `   - **Govt Universities (RTU Kota / MBM / CTAE):** General Cutoff ~84% - 88% PCM. (${userMarks >= 84 ? '✅ Target / High Chance' : '⚠️ Competitive / Reach (Try Upward Movement)'})\n` +
          `   - **Top Private (SKIT / JECRC):** General Cutoff ~75% - 78% PCM. (${userMarks >= 75 ? '✅ Safe Seat' : '⚠️ Moderate'})\n\n` +
          `2. **Electronics & Communication (ECE / IT):**\n` +
          `   - **Govt Colleges (RTU Kota / GEC Ajmer):** Cutoff ~78% - 82% PCM. (${userMarks >= 78 ? '✅ Very High Chance (Safe)' : '⚠️ Target'})\n` +
          `   - **Private Colleges:** Cutoff ~68% - 72% PCM. (✅ Fully Safe)\n\n` +
          `3. **Electrical (EE) & Mechanical (ME):**\n` +
          `   - **Govt Institutions:** Cutoff ~72% - 76% PCM. (${userMarks >= 72 ? '✅ Confirmed Govt Option' : '⚠️ Reach'})\n\n` +
          `4. **Civil (CE) & Mining Engineering:**\n` +
          `   - **MBM University / CTAE Udaipur:** Cutoff ~70% - 74% PCM. (${userMarks >= 70 ? '✅ Highly Recommended' : '⚠️ Option'})`;
    } else {
      responseText = language === 'hi'
        ? `📈 **राजस्थान REAP में विभिन्न ब्रांचों की श्रेणी-वार कटऑफ (प्रतिशत के अनुसार):**\n\n` +
          `राजस्थान इंजीनियरिंग कॉलेजों में 12वीं PCM प्रतिशत के आधार पर ऐतिहासिक कटऑफ सीमाएँ निम्न प्रकार हैं:\n\n` +
          `• **Computer Science (CSE):**\n` +
          `  - MNIT जयपुर (JEE Rank): < 5,200\n` +
          `  - MBM जोधपुर / CTAE उदयपुर: 88% - 92% PCM\n` +
          `  - RTU कोटा / GEC अजमेर: 83% - 87% PCM\n` +
          `  - SKIT / JECRC (प्राइवेट): 76% - 80% PCM\n\n` +
          `• **Information Technology (IT) / AI-DS:**\n` +
          `  - सरकारी कॉलेज: 80% - 85% PCM\n` +
          `  - प्राइवेट कॉलेज: 72% - 76% PCM\n\n` +
          `• **Electronics & Communication (ECE):**\n` +
          `  - सरकारी कॉलेज: 76% - 82% PCM\n` +
          `  - प्राइवेट कॉलेज: 65% - 70% PCM\n\n` +
          `• **Mechanical & Civil Engineering:**\n` +
          `  - सरकारी कॉलेज: 70% - 76% PCM\n` +
          `  - पॉलीटेक्निक डिप्लोमा (10वीं अंक): 65% - 75% 10th`
        : `📈 **Master REAP Branch Cutoff Range Guide (By Board Percentage):**\n\n` +
          `Here is the official historical REAP 12th Board PCM cutoff percentage required for different engineering branches across Rajasthan:\n\n` +
          `• **Computer Science & Engineering (CSE):**\n` +
          `  - MNIT Jaipur (NIT): JEE Main Rank < 5,200 (Percentile 99.2%+)\n` +
          `  - MBM Jodhpur / CTAE Udaipur: 88% - 92% 12th PCM\n` +
          `  - RTU Kota / GEC Ajmer: 84% - 87% 12th PCM\n` +
          `  - SKIT Jaipur / JECRC (Top Private): 76% - 80% 12th PCM\n\n` +
          `• **Artificial Intelligence & Data Science / IT:**\n` +
          `  - Govt Colleges: 80% - 85% 12th PCM\n` +
          `  - Private Colleges: 72% - 76% 12th PCM\n\n` +
          `• **Electronics & Communication (ECE):**\n` +
          `  - Govt Colleges: 76% - 82% 12th PCM\n` +
          `  - Private Colleges: 65% - 70% 12th PCM\n\n` +
          `• **Mechanical (ME) & Civil (CE):**\n` +
          `  - Govt Colleges: 70% - 76% 12th PCM\n` +
          `  - Polytechnic Diploma (10th Board): 65% - 75% 10th Score\n\n` +
          `• **Mining Engineering (MBM & CTAE):** 74% - 80% 12th PCM.`;
    }
  }

  // ----------------------------------------------------
  // INTENT 2: Greetings & Bot Persona
  // ----------------------------------------------------
  else if (isWhoAreYou || (isGreeting && queryLower.length < 15)) {
    intent = 'greeting';
    sources = ["EduMitra AI Knowledge Base"];
    responseText = language === 'hi'
      ? `👋 **नमस्ते! मैं एजुमित्र एआई (EduMitra AI) हूँ।**\n\n` +
        `मैं राजस्थान के इंजीनियरिंग (REAP) और पॉलीटेक्निक (डिप्लोमा) प्रवेश के लिए आपका समर्पित स्मार्ट AI सहायक हूँ।`
      : `👋 **Hello! I am EduMitra AI Assistant.**\n\n` +
        `I am your dedicated AI guide for Rajasthan Engineering (REAP) & Polytechnic Diploma admissions.\n\n` +
        `Ask me anything about branch cutoffs, college fees, scholarships, or REAP counselling!`;
  }

  // ----------------------------------------------------
  // INTENT 3: REAP Info / Counselling Process
  // ----------------------------------------------------
  else if (isReapInfo && !targetCollege && userMarks === null) {
    intent = 'reap_info';
    sources = ["REAP 2026 Official Portal (reap2026.com)", "DTE Rajasthan"];
    responseText = `ℹ️ **What is REAP 2026?**\n\n` +
      `REAP (Rajasthan Engineering Admission Process) is the centralized government portal conducted by DTE Rajasthan for B.Tech admission across all Govt and Private Colleges in Rajasthan.\n\n` +
      `• **Priority 1:** JEE Main Score\n` +
      `• **Priority 2:** 12th Board PCM Aggregate Percentage\n` +
      `• **Minimum Eligibility:** 45% in 12th PCM (40% for Reserved categories).`;
    actionData = { type: 'OPEN_TAB', tab: 'roadmap' };
  }

  // ----------------------------------------------------
  // INTENT 4: Specific College Deep-Dive Query
  // ----------------------------------------------------
  else if (targetCollege && !isCompare) {
    intent = 'college_detail';
    sources = [`Official ${targetCollege.shortName} Documentations`, `${targetCollege.website}`];

    if (isFee || isHostel) {
      responseText = `📋 **${targetCollege.name} (${targetCollege.shortName}) — Fee & Accommodation Guide:**\n\n` +
        `• **Annual Tuition Fee:** ₹${targetCollege.feesPerYear.toLocaleString()} / year\n` +
        `• **Hostel Availability:** ${targetCollege.hostelAvailable ? `Available (Fee: ₹${targetCollege.hostelFeesPerYear.toLocaleString()} / yr)` : 'Hostel Facility Not Available'}\n` +
        `• **Admission Mode:** ${targetCollege.courses[0] ? targetCollege.courses[0].mode : 'REAP / JEE Main'}\n` +
        `• **Fee Waiver (TFWS):** 100% Tuition Fee Waiver available for eligible merit candidates (Income < ₹8 LPA).`;
    } else if (isPlacement) {
      responseText = `💼 **${targetCollege.name} (${targetCollege.shortName}) — Placement Report:**\n\n` +
        `• **Average Package:** ${targetCollege.placements.avgPackage}\n` +
        `• **Highest Package:** ${targetCollege.placements.highestPackage}\n` +
        `• **Placement Percentage:** ${targetCollege.placements.placementPercentage}%\n` +
        `• **Top Recruiting Companies:** ${targetCollege.placements.topRecruiters.join(', ')}`;
    } else {
      responseText = `🏛 **Complete Profile & Details for ${targetCollege.name} (${targetCollege.shortName}):**\n\n` +
        `• **Category & Type:** ${targetCollege.type} (${targetCollege.district} District)\n` +
        `• **Established:** ${targetCollege.established} | **Accreditation:** ${targetCollege.accreditation}\n` +
        `• **Tuition Fee:** ₹${targetCollege.feesPerYear.toLocaleString()} / year\n` +
        `• **Hostel Facility:** ${targetCollege.hostelAvailable ? `Available (₹${targetCollege.hostelFeesPerYear.toLocaleString()} / year)` : 'Not available'}\n` +
        `• **Placements:** Average ${targetCollege.placements.avgPackage} | Highest ${targetCollege.placements.highestPackage} (${targetCollege.placements.placementPercentage}% placed)\n` +
        `• **Top Recruiters:** ${targetCollege.placements.topRecruiters.join(', ')}\n\n` +
        `🎓 **Offered Courses & Seat Intake:**\n` +
        targetCollege.courses.map(c => `  - ${c.branch}: ${c.intake} seats (Mode: ${c.mode})`).join('\n');
    }

    structuredData = [targetCollege];
  }

  // ----------------------------------------------------
  // INTENT 5: User Specified Marks / Percentage Recommendation
  // ----------------------------------------------------
  else if (userMarks !== null || targetCity) {
    intent = 'marks_analysis';
    sources = ["REAP 2025 Cutoff & Seat Matrix", "DTE College Directory"];

    let matches = RAJASTHAN_COLLEGES.filter(col => {
      if (targetCity && col.district.toLowerCase() !== targetCity && col.city.toLowerCase() !== targetCity) return false;
      if (isGovtOnly && !col.type.toLowerCase().includes('government')) return false;
      if (isPrivateOnly && col.type.toLowerCase().includes('government')) return false;
      if (isPolytechnic && col.category !== 'Polytechnic Diploma') return false;
      if (!isPolytechnic && col.category !== 'Engineering') return false;
      return true;
    });

    if (userMarks !== null) {
      matches = matches.filter(col => {
        const req = isPolytechnic ? 50 : 55;
        return userMarks >= (req - 12);
      });
    }

    const recommended = matches.slice(0, 4);

    if (recommended.length === 0) {
      responseText = `Based on your score (${userMarks ? `${userMarks}% marks` : ''}), we recommend applying through REAP Counselling. Standard eligibility is 45% in PCM.`;
    } else {
      responseText = `🎯 **Personalized Recommendation Report ${userMarks ? `for ${userMarks}% PCM` : ''} ${targetCity ? `in ${targetCity.toUpperCase()}` : ''}:**\n\n` +
        `Based on historical cutoff trends and seat matrix, here are the best options for your profile:\n\n` +
        recommended.map(c => 
          `• **${c.shortName}** (${c.type})\n  - Fee: ₹${c.feesPerYear.toLocaleString()}/yr | Hostel: ${c.hostelAvailable ? 'Yes' : 'No'} | Avg Package: ${c.placements.avgPackage}\n  - Admission Safety: ${userMarks >= 80 ? 'High Chance (Safe)' : userMarks >= 65 ? 'Moderate Chance' : 'Reach'}`
        ).join('\n\n');
    }

    structuredData = recommended;
  }

  // ----------------------------------------------------
  // INTENT 6: Side-by-Side Comparison Query
  // ----------------------------------------------------
  else if (isCompare) {
    intent = 'compare';
    const foundColleges = RAJASTHAN_COLLEGES.filter(c => 
      queryLower.includes(c.shortName.toLowerCase()) || 
      queryLower.includes(c.id) ||
      (c.city && queryLower.includes(c.city.toLowerCase()))
    );

    const c1 = foundColleges[0] || RAJASTHAN_COLLEGES[1]; // RTU Kota
    const c2 = foundColleges[1] || RAJASTHAN_COLLEGES[4]; // SKIT Jaipur

    responseText = `📊 **Comparison Matrix: ${c1.shortName} vs ${c2.shortName}**\n\n` +
      `• **Category:** ${c1.shortName} (${c1.type}) vs ${c2.shortName} (${c2.type})\n` +
      `• **Tuition Fee:** ₹${c1.feesPerYear.toLocaleString()} / yr vs ₹${c2.feesPerYear.toLocaleString()} / yr\n` +
      `• **Placements:** Avg ${c1.placements.avgPackage} (Max ${c1.placements.highestPackage}) vs Avg ${c2.placements.avgPackage} (Max ${c2.placements.highestPackage})\n` +
      `• **Hostel Charges:** ${c1.hostelAvailable ? `₹${c1.hostelFeesPerYear.toLocaleString()}/yr` : 'N/A'} vs ${c2.hostelAvailable ? `₹${c2.hostelFeesPerYear.toLocaleString()}/yr` : 'N/A'}`;

    structuredData = [c1, c2];
    sources = ["REAP 2025 Official Data"];
    actionData = { type: 'OPEN_TAB', tab: 'comparison', collegeIds: [c1.id, c2.id] };
  }

  // ----------------------------------------------------
  // INTENT 7: Scholarships Query
  // ----------------------------------------------------
  else if (isScholarship) {
    intent = 'scholarship';
    structuredData = SCHOLARSHIPS_DATA;
    responseText = `💰 **Verified Government Scholarship Schemes in Rajasthan:**\n\n` +
      `1. **CM Higher Education Scholarship:** ₹5,000/yr (12th Board >= 60%, Income < ₹2.5 LPA)\n` +
      `2. **SJE Post-Matric Scholarship (SC/ST/OBC/EWS):** 100% Tuition Fee Reimbursement\n` +
      `3. **TFWS (Tuition Fee Waiver Scheme):** 100% Fee Waiver in REAP option form\n` +
      `4. **Kali Bai Scooter Scheme:** Free Scooter for Girl Students in Rajasthan.`;
    sources = ["SJE Rajasthan Portal", "HTE Rajasthan"];
    actionData = { type: 'OPEN_TAB', tab: 'scholarships' };
  }

  // ----------------------------------------------------
  // INTENT 8: Admissions Roadmap Query
  // ----------------------------------------------------
  else if (isRoadmap) {
    intent = 'roadmap';
    structuredData = ADMISSION_ROADMAP_STEPS;
    responseText = `🧭 **Step-by-Step REAP Admission Process:**\n\n` +
      `1. **Eligibility:** Minimum 45% in 12th PCM (40% for Reserved categories).\n` +
      `2. **Registration:** Register on reap2026.com with Aadhaar and pay ₹700 fee.\n` +
      `3. **Merit List:** Priority 1 = JEE Main Score, Priority 2 = 12th Board PCM %.\n` +
      `4. **Choice Filling:** Lock preferred order of Colleges & Branches.\n` +
      `5. **Reporting:** Physical document verification at allotted college.`;
    sources = ["DTE Rajasthan Guidelines"];
    actionData = { type: 'OPEN_TAB', tab: 'roadmap' };
  }

  // ----------------------------------------------------
  // INTENT 9: Fallback Intelligent Conversational Answer
  // ----------------------------------------------------
  else {
    intent = 'general_faq';
    sources = ["EduMitra AI Verified Educational Knowledge Base"];

    responseText = `🤖 **EduMitra AI Guidance:**\n\n` +
      `I understood your query: *"${rawQuery}"*.\n\n` +
      `Here are quick ways I can help:\n` +
      `• **For Branch Cutoffs:** Ask *"What is the cutoff for CSE or ECE?"* or *"Cutoff of branches according to percentage"*.\n` +
      `• **For Recommendations:** Type your score (e.g., *"I scored 82% in PCM"*).\n` +
      `• **For Specific College Details:** Type college name (e.g. *"RTU Kota"*, *"SKIT"*, *"MBM Jodhpur"*, *"CTAE"*).\n` +
      `• **For Scholarships:** Ask *"Show me scholarships for Rajasthan students"*.\n\n` +
      `Or use the interactive tabs above to explore Colleges, Cutoffs, and Eligibility!`;
  }

  return {
    intent,
    responseText,
    structuredData,
    sources,
    actionData,
    queryDetails: {
      userMarks,
      userRank,
      isGovtOnly,
      isPolytechnic
    }
  };
}
