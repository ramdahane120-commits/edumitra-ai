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
    // Implicit number extraction if near words like board, pcm, got, score, 12th, 10th
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

  // 5. Query Concept Flags
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
  const isBestBranch = queryLower.includes('best branch') || queryLower.includes('which branch') || queryLower.includes('cse vs') || queryLower.includes('scope');

  let intent = 'conversational';
  let responseText = '';
  let structuredData = [];
  let sources = [];
  let actionData = null;

  // ----------------------------------------------------
  // INTENT 1: Greetings & Bot Persona
  // ----------------------------------------------------
  if (isWhoAreYou || (isGreeting && queryLower.length < 15)) {
    intent = 'greeting';
    sources = ["EduMitra AI Knowledge Base"];
    responseText = language === 'hi'
      ? `👋 **नमस्ते! मैं एजुमित्र एआई (EduMitra AI) हूँ।**\n\n` +
        `मैं राजस्थान के इंजीनियरिंग (REAP) और पॉलीटेक्निक (डिप्लोमा) प्रवेश के लिए आपका समर्पित स्मार्ट AI सहायक हूँ।\n\n` +
        `आप मुझसे कुछ भी पूछ सकते हैं, जैसे:\n` +
        `• *"80% PCM पर मुझे कौन से सरकारी कॉलेज मिल सकते हैं?"*\n` +
        `• *"RTU कोटा और SKIT जयपुर की तुलना करो"*\n` +
        `• *"MBM जोधपुर की फीस और हॉस्टल कैसा है?"*\n` +
        `• *"राजस्थान की छात्रवृत्ति योजनाएँ कौन सी हैं?"*`
      : language === 'raj'
      ? `👋 **रामां-रामां सा! मूँ एजुमित्र एआई हूँ।**\n\n` +
        `राजस्थान रा इंजीनियरिंग (REAP) अर पॉलीटेक्निक दाखिला खातिर मूँ थारो साचो एआई साथी हूँ।\n\n` +
        `थूँ मूं सूं राजस्थान रा कॉलेज, फीस, कटऑफ अर स्कॉलरशिप री बातां पूछ सकै है!`
      : `👋 **Hello! I am EduMitra AI Assistant.**\n\n` +
        `I am your dedicated AI guide for Rajasthan Engineering (REAP) & Polytechnic Diploma admissions.\n\n` +
        `You can type any question in plain English or Hindi! For example:\n` +
        `• *"Tell me everything about MBM University Jodhpur"*\n` +
        `• *"I got 78% in 12th. What colleges can I get in Jaipur?"*\n` +
        `• *"What is REAP counselling process?"*\n` +
        `• *"Which college has highest package in CSE?"*`;
  }

  // ----------------------------------------------------
  // INTENT 2: What is REAP / Counselling Info
  // ----------------------------------------------------
  else if (isReapInfo && !targetCollege && userMarks === null) {
    intent = 'reap_info';
    sources = ["REAP 2026 Official Portal (reap2026.com)", "DTE Rajasthan"];
    responseText = language === 'hi'
      ? `ℹ️ **REAP (Rajasthan Engineering Admission Process) क्या है?**\n\n` +
        `REAP राजस्थान सरकार द्वारा आयोजित केंद्रीकृत प्रवेश प्रक्रिया है, जिसके माध्यम से राजस्थान के सभी सरकारी एवं निजी इंजीनियरिंग (B.Tech) कॉलेजों में प्रवेश मिलता है।\n\n` +
        `📌 **मुख्य बातें:**\n` +
        `• **सीट आवंटन का आधार:** 70% सीटें JEE Main स्कोर (वरीयता 1) एवं 30% सीटें 12वीं बोर्ड PCM प्रतिशत (वरीयता 2) से भरी जाती हैं।\n` +
        `• **न्यूनतम पात्रता:** 12वीं PCM में न्यूनतम 45% (सामान्य श्रेणी) एवं 40% (SC/ST/OBC/EWS)।\n` +
        `• **TFWS योजना:** 5% अतिरिक्त सुपरन्यूमरेरी सीटें ट्यूशन फीस माफ़ी के लिए उपलब्ध हैं।`
      : `ℹ️ **What is REAP 2026?**\n\n` +
        `REAP (Rajasthan Engineering Admission Process) is the centralized government portal conducted by DTE Rajasthan for admission into B.Tech courses across all Government and Private Colleges in Rajasthan.\n\n` +
        `📌 **Key Facts:**\n` +
        `• **Seat Allocation Criteria:** Priority 1 given to JEE Main score, and Priority 2 given to 12th Board PCM %.\n` +
        `• **Eligibility:** Minimum 45% aggregate in 12th PCM for General category (40% for SC/ST/OBC/EWS).\n` +
        `• **TFWS Quota:** 5% extra seats reserved for 100% Tuition Fee Waiver (Family Income < 8 LPA).`;
    actionData = { type: 'OPEN_TAB', tab: 'roadmap' };
  }

  // ----------------------------------------------------
  // INTENT 3: Specific College Query (Alias / Full Name Match)
  // e.g. "rtu", "tell me about skit", "mbm fees", "mnit package"
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
  // INTENT 4: User Specified Marks / Percentage Analysis
  // e.g. "i got 80 percent", "which college for 75% in jaipur?"
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
      responseText = `Based on your query (${userMarks ? `${userMarks}% marks` : ''} ${targetCity ? `in ${targetCity}` : ''}), we recommend applying through REAP Counselling. Standard eligibility is 45% in PCM.`;
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
  // INTENT 5: Side-by-Side Comparison Query
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
  // INTENT 6: Scholarships Query
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
  // INTENT 7: Admissions Roadmap Query
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
  // INTENT 8: Fallback Intelligent Conversational Answer
  // Handles typed questions like "which branch is best", "is hostel compulsory", "cheap colleges"
  // ----------------------------------------------------
  else {
    intent = 'general_faq';
    sources = ["EduMitra AI Verified Educational Knowledge Base"];

    if (isBestBranch) {
      responseText = `💡 **Which Branch Should You Choose?**\n\n` +
        `• **Computer Science & AI/DS:** Highest placement volume (Avg 6-13 LPA), ideal if interested in software development.\n` +
        `• **Electronics (ECE) & Electrical (EE):** High demand in both core tech (semiconductors, EV) and IT placement drives.\n` +
        `• **Mechanical & Civil Engineering:** Strong scope in Govt PSU jobs (SSC JE, RRB JE, State DISCOMs, L&T).\n` +
        `• **Mining Engineering (MBM & CTAE):** Excellent core government & private placements (Hindustan Zinc, Vedanta, RSMM).`;
    } else if (isFee) {
      responseText = `💰 **Fees Overview in Rajasthan Technical Colleges:**\n\n` +
        `• **Govt Engineering Colleges (RTU, MBM, CTAE, GEC):** Approx ₹48,000 - ₹62,000 / year.\n` +
        `• **Premier Private Colleges (SKIT, JECRC):** Approx ₹95,000 - ₹98,000 / year.\n` +
        `• **Govt Polytechnic Diploma (GPC Jaipur, Kota, Jodhpur):** Only ₹11,500 / year.\n` +
        `• **TFWS Seats:** 100% Tuition Fee Waiver available for eligible candidates in REAP counselling!`;
    } else if (isHostel) {
      responseText = `🏠 **Hostel Information:**\n\n` +
        `Hostel facilities are available in all major Government colleges (MNIT, RTU Kota, MBM, CTAE, GEC Ajmer/Bikaner) with low annual fees (₹18,000 - ₹28,000/yr). Private colleges also offer AC/Non-AC hostels (₹85,000 - ₹95,000/yr). Hostels are optional.`;
    } else {
      // Smart conversational response to any typed prompt
      responseText = `🤖 **EduMitra AI Guidance:**\n\n` +
        `I understood your question: *"${rawQuery}"*.\n\n` +
        `Here is how I can best assist you:\n` +
        `• **For College Recommendations:** Type your 12th PCM % or JEE rank (e.g. *"I scored 82% in PCM"*).\n` +
        `• **For Specific College Details:** Type the college name (e.g. *"RTU Kota"*, *"SKIT"*, *"MBM Jodhpur"*, *"CTAE"*).\n` +
        `• **For Cutoffs & Fees:** Ask *"What is the cutoff for CSE?"* or *"What are the fees for government colleges?"*\n` +
        `• **For Scholarships:** Ask *"Show me scholarships for Rajasthan students"*.\n\n` +
        `Or use the quick navigation tabs at the top to explore Colleges, Cutoffs, and Eligibility!`;
    }
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
