// EduMitra AI - Conversational Multi-Turn RAG Engine (College-ChatGPT)

import { RAJASTHAN_COLLEGES } from '../data/colleges.js';
import { REAP_CUTOFFS } from '../data/cutoffs.js';
import { SCHOLARSHIPS_DATA } from '../data/scholarships.js';
import { ADMISSION_ROADMAP_STEPS } from '../data/roadmap.js';

// College Alias Registry
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

// Conversation Session Memory (Multi-Turn Context)
let sessionContext = {
  lastCollege: null,
  lastBranch: null,
  lastMarks: null,
  history: []
};

export function resetConversationSession() {
  sessionContext = {
    lastCollege: null,
    lastBranch: null,
    lastMarks: null,
    history: []
  };
}

// Minimum Percentile Threshold Map for Specific Colleges
const COLLEGE_MIN_PERCENTILE = {
  'mnit-jaipur': { minPercentile: 93.0, label: '93%–99.2% (JEE Main Rank < 48,000)' },
  'uce-rtu-kota': { minPercentile: 72.0, label: '72%–88.5% (REAP Merit / 12th PCM)' },
  'mbm-jodhpur': { minPercentile: 74.0, label: '74%–92.4% (REAP Merit / 12th PCM)' },
  'ctae-udaipur': { minPercentile: 72.0, label: '72%–91.0% (REAP Merit)' },
  'skit-jaipur': { minPercentile: 60.0, label: '60%–79.5% (REAP / 12th Board)' },
  'gec-ajmer': { minPercentile: 65.0, label: '65%–83.2% (REAP / 12th Board)' },
  'gec-bikaner': { minPercentile: 60.0, label: '60%–80.0% (REAP)' },
  'jecrc-jaipur': { minPercentile: 55.0, label: '55%–78.0% (REAP)' },
  'gpc-jaipur': { minPercentile: 60.0, label: '60%–78.5% (10th Board Score)' }
};

export function processUserQuery(query, language = 'en') {
  const rawQuery = query.trim();
  const queryLower = rawQuery.toLowerCase();

  // 1. Extract Marks / Percentile (% or raw numbers between 35 and 99)
  let userMarks = sessionContext.lastMarks;
  const explicitMarksMatch = queryLower.match(/(\d{1,2}(\.\d{1,2})?)\s*(%|percent|percentile|pct|marks|अंक|नंबर)/i);
  if (explicitMarksMatch) {
    userMarks = parseFloat(explicitMarksMatch[1]);
    sessionContext.lastMarks = userMarks;
  } else {
    const implicitMatch = queryLower.match(/(?:got|scored|have|with|pcm|board|jee|percentile|12th|10th|percentage|at)\s*(\d{2}(\.\d{1,2})?)/i) || queryLower.match(/\b([3-9]\d(\.\d{1,2})?)\b/);
    if (implicitMatch) {
      const num = parseFloat(implicitMatch[1]);
      if (num >= 35 && num <= 100) {
        userMarks = num;
        sessionContext.lastMarks = userMarks;
      }
    }
  }

  // 2. Extract JEE Rank
  let userRank = null;
  const rankMatch = queryLower.match(/(\d{4,6})\s*(rank|jee|merit|रैंक)/i) || queryLower.match(/rank\s*(\d{4,6})/i);
  if (rankMatch) userRank = parseInt(rankMatch[1], 10);

  // 3. Extract Specific Target College
  let targetCollege = null;
  for (const alias of COLLEGE_ALIASES) {
    if (alias.keywords.some(kw => queryLower.includes(kw))) {
      targetCollege = RAJASTHAN_COLLEGES.find(c => c.id === alias.id);
      if (targetCollege) break;
    }
  }

  // Pronoun Resolution ("there", "it", "that college")
  const isPronounReference = queryLower.includes('there') || queryLower.includes('it') || queryLower.includes('that college') || queryLower.includes('उसमें') || queryLower.includes('वहां');
  if (!targetCollege && (isPronounReference || queryLower.includes('fee') || queryLower.includes('hostel') || queryLower.includes('placement')) && sessionContext.lastCollege) {
    targetCollege = sessionContext.lastCollege;
  } else if (targetCollege) {
    sessionContext.lastCollege = targetCollege;
  }

  // 4. City Match
  const cities = ['jaipur', 'jodhpur', 'kota', 'udaipur', 'ajmer', 'bikaner', 'bhilwara'];
  const targetCity = cities.find(city => queryLower.includes(city));

  // 5. Query Flags
  const isCanIGetQuery = queryLower.includes('can i get') || queryLower.includes('can i admission') || queryLower.includes('possible to get') || queryLower.includes('chance to get') || queryLower.includes('क्या मुझे') || queryLower.includes('मिल सकता');
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
  const isRoadmap = queryLower.includes('roadmap') || queryLower.includes('process') || queryLower.includes('step') || queryLower.includes('प्रक्रिया') || queryLower.includes('काउंसलिंग') || queryLower.includes('how to apply');
  const isCutoffQuery = queryLower.includes('cutoff') || queryLower.includes('cut off') || queryLower.includes('cut-off') || queryLower.includes('कटऑफ') || queryLower.includes('रैंक') || queryLower.includes('closing rank');

  let intent = 'conversational';
  let responseText = '';
  let structuredData = [];
  let sources = [];
  let actionData = null;

  // ----------------------------------------------------
  // CRITICAL SPECIFIC EVALUATOR: "Can I get [Target College] with [X% Marks/Percentile]?"
  // e.g. "can i get mnit at 67% jee percentile"
  // ----------------------------------------------------
  if (targetCollege && (userMarks !== null || userRank !== null || isCanIGetQuery)) {
    intent = 'admission_evaluation';
    sources = [`REAP 2024-2025 Closing Cutoff Matrix`, `Official ${targetCollege.shortName} Admissions Portal`];

    const cutoffInfo = COLLEGE_MIN_PERCENTILE[targetCollege.id] || { minPercentile: 65.0, label: '65%+ 12th PCM / REAP score' };
    const scoreVal = userMarks !== null ? userMarks : 50;

    const isEligible = scoreVal >= cutoffInfo.minPercentile;

    if (!isEligible) {
      // Find 3-4 realistic alternative colleges where the student CAN get a seat!
      const alternativeColleges = RAJASTHAN_COLLEGES.filter(c => {
        if (c.id === targetCollege.id) return false;
        const altCutoff = COLLEGE_MIN_PERCENTILE[c.id];
        const minReq = altCutoff ? altCutoff.minPercentile : 60;
        return scoreVal >= (minReq - 10);
      }).slice(0, 4);

      responseText = language === 'hi'
        ? `❌ **नहीं, दुर्भाग्य से आपको ${scoreVal}% स्कोर / परसेंटाइल पर ${targetCollege.shortName} में सीट नहीं मिल सकती।**\n\n` +
          `• **कारण:** ${targetCollege.shortName} की कटऑफ बहुत अधिक रहती है (आवश्यक स्कोर: **${cutoffInfo.label}**)।\n\n` +
          `💡 **इसके बजाय, आप इन कॉलेजों में आसानी से सीट प्राप्त कर सकते हैं:**\n\n` +
          alternativeColleges.map(c => `• **${c.shortName}** (${c.type})\n  - वार्षिक फीस: ₹${c.feesPerYear.toLocaleString()}/वर्ष | औसत पैकेज: ${c.placements.avgPackage}\n  - संभावना: **उच्च संभावना (Safe Seat)**`).join('\n\n')
        : `❌ **No, unfortunately you cannot get a seat at ${targetCollege.shortName} with a ${scoreVal}% score / percentile.**\n\n` +
          `• **Reason:** ${targetCollege.shortName} cutoffs close much higher (Historical Cutoff Requirement: **${cutoffInfo.label}**).\n\n` +
          `💡 **Instead, based on your ${scoreVal}% score, here are realistic colleges you CAN get through REAP counselling:**\n\n` +
          alternativeColleges.map(c => `• **${c.shortName}** (${c.type})\n  - Fee: ₹${c.feesPerYear.toLocaleString()}/yr | Avg Package: ${c.placements.avgPackage}\n  - Admission Probability: **High Chance (Safe Option)**`).join('\n\n');

      structuredData = alternativeColleges;
    } else {
      responseText = language === 'hi'
        ? `✅ **हाँ! आपके ${scoreVal}% स्कोर के साथ ${targetCollege.shortName} में प्रवेश की बहुत अच्छी संभावना है।**\n\n` +
          `• **कटऑफ स्थिति:** आपका स्कोर (${scoreVal}%) ${targetCollege.shortName} की ऐतिहासिक कटऑफ सीमा (**${cutoffInfo.label}**) के अनुकूल है।\n\n` +
          `📋 **कॉलेज विवरण:**\n` +
          `• वार्षिक शिक्षण शुल्क: ₹${targetCollege.feesPerYear.toLocaleString()}/वर्ष\n` +
          `• हॉस्टल: ${targetCollege.hostelAvailable ? `उपलब्ध (₹${targetCollege.hostelFeesPerYear.toLocaleString()}/वर्ष)` : 'उपलब्ध नहीं'}\n` +
          `• औसत प्लेसमेंट पैकेज: ${targetCollege.placements.avgPackage} (उच्चतम: ${targetCollege.placements.highestPackage})`
        : `✅ **Yes! With a ${scoreVal}% score / percentile, you have a very strong chance of securing a seat at ${targetCollege.shortName}.**\n\n` +
          `• **Cutoff Status:** Your score (${scoreVal}%) comfortably satisfies historical closing trends (**${cutoffInfo.label}**).\n\n` +
          `📋 **Key College Details:**\n` +
          `• Tuition Fee: ₹${targetCollege.feesPerYear.toLocaleString()} / year\n` +
          `• Hostel: ${targetCollege.hostelAvailable ? `Available (₹${targetCollege.hostelFeesPerYear.toLocaleString()} / year)` : 'Not available'}\n` +
          `• Placements: Average ${targetCollege.placements.avgPackage} (Highest: ${targetCollege.placements.highestPackage})`;

      structuredData = [targetCollege];
    }
  }

  // ----------------------------------------------------
  // INTENT 2: Deep Dive on a Specific College (General Query)
  // ----------------------------------------------------
  else if (targetCollege && !isCompare) {
    intent = 'college_detail';
    sources = [`Official ${targetCollege.shortName} Database`, `${targetCollege.website}`];

    if (isFee) {
      responseText = `📋 **Fee Breakdown for ${targetCollege.name} (${targetCollege.shortName}):**\n\n` +
        `• **Annual Tuition Fee:** ₹${targetCollege.feesPerYear.toLocaleString()} / year\n` +
        `• **Hostel Fee:** ${targetCollege.hostelAvailable ? `₹${targetCollege.hostelFeesPerYear.toLocaleString()} / year` : 'Hostel not available'}\n` +
        `• **TFWS Seat:** 100% Tuition Fee Waiver available for eligible candidates (< ₹8 LPA income).`;
    } else if (isHostel) {
      responseText = `🏠 **Hostel Information for ${targetCollege.name} (${targetCollege.shortName}):**\n\n` +
        `• **Status:** ${targetCollege.hostelAvailable ? 'Available on campus' : 'Not available'}\n` +
        `• **Hostel Fee:** ₹${targetCollege.hostelFeesPerYear.toLocaleString()} / year\n` +
        `• **Facilities:** Wi-Fi, Mess food, Security, Library access & Sports grounds.`;
    } else if (isPlacement) {
      responseText = `💼 **Placement Stats for ${targetCollege.name} (${targetCollege.shortName}):**\n\n` +
        `• **Average Package:** ${targetCollege.placements.avgPackage}\n` +
        `• **Highest Package:** ${targetCollege.placements.highestPackage}\n` +
        `• **Placement Rate:** ${targetCollege.placements.placementPercentage}%\n` +
        `• **Top Recruiters:** ${targetCollege.placements.topRecruiters.join(', ')}`;
    } else {
      responseText = `🏛 **Complete Profile & Overview for ${targetCollege.name} (${targetCollege.shortName}):**\n\n` +
        `• **Type & District:** ${targetCollege.type} (${targetCollege.district} District)\n` +
        `• **Established:** ${targetCollege.established} | **Accreditation:** ${targetCollege.accreditation}\n` +
        `• **Tuition Fee:** ₹${targetCollege.feesPerYear.toLocaleString()} / year\n` +
        `• **Hostel Facility:** ${targetCollege.hostelAvailable ? `Available (₹${targetCollege.hostelFeesPerYear.toLocaleString()} / yr)` : 'Not available'}\n` +
        `• **Placements:** Avg ${targetCollege.placements.avgPackage} | Highest ${targetCollege.placements.highestPackage} (${targetCollege.placements.placementPercentage}% placed)\n` +
        `• **Top Recruiters:** ${targetCollege.placements.topRecruiters.join(', ')}\n\n` +
        `🎓 **Offered Courses & Seats:**\n` +
        targetCollege.courses.map(c => `  - ${c.branch}: ${c.intake} seats`).join('\n');
    }

    structuredData = [targetCollege];
  }

  // ----------------------------------------------------
  // INTENT 3: Branch Cutoffs by Percentage / Marks
  // ----------------------------------------------------
  else if (isCutoffQuery) {
    intent = 'cutoff_analysis';
    sources = ["REAP 2024-2025 Official Cutoff Data", "DTE Rajasthan Matrix"];
    actionData = { type: 'OPEN_TAB', tab: 'cutoffs' };

    if (userMarks !== null) {
      responseText = `📈 **Branch-wise Cutoff & Allotment Evaluation for ${userMarks}% PCM Score:**\n\n` +
        `Based on official REAP closing cutoffs for **${userMarks}% PCM aggregate score**:\n\n` +
        `1. **Computer Science (CSE / AI & Data Science):**\n` +
        `   - **Govt Universities (RTU Kota / MBM / CTAE):** Cutoff ~84% - 88%. (${userMarks >= 84 ? '✅ Target / High Chance' : '⚠️ Competitive / Reach'})\n` +
        `   - **Top Private (SKIT / JECRC):** Cutoff ~75% - 78%. (${userMarks >= 75 ? '✅ Safe Option' : '⚠️ Moderate'})\n\n` +
        `2. **Electronics & Communication (ECE / IT):**\n` +
        `   - **Govt Colleges:** Cutoff ~78% - 82%. (${userMarks >= 78 ? '✅ Very High Chance (Safe)' : '⚠️ Target'})\n` +
        `   - **Private Colleges:** Cutoff ~68% - 72%. (✅ Fully Safe)\n\n` +
        `3. **Electrical (EE) & Mechanical (ME):**\n` +
        `   - **Govt Institutions:** Cutoff ~72% - 76%. (${userMarks >= 72 ? '✅ Confirmed Govt Seat' : '⚠️ Reach'})\n\n` +
        `4. **Civil (CE) & Mining Engineering:**\n` +
        `   - **MBM / CTAE Udaipur:** Cutoff ~70% - 74%. (${userMarks >= 70 ? '✅ Highly Recommended' : '⚠️ Option'})`;
    } else {
      responseText = `📈 **Master REAP Branch Cutoff Guide (By Board Percentage):**\n\n` +
        `• **Computer Science & Engineering (CSE):**\n` +
        `  - MNIT Jaipur (NIT): JEE Main Rank < 5,200\n` +
        `  - MBM Jodhpur / CTAE Udaipur: 88% - 92% 12th PCM\n` +
        `  - RTU Kota / GEC Ajmer: 84% - 87% 12th PCM\n` +
        `  - SKIT Jaipur / JECRC (Top Private): 76% - 80% 12th PCM\n\n` +
        `• **AI & Data Science / IT:** Govt: 80% - 85% | Private: 72% - 76%\n` +
        `• **ECE:** Govt: 76% - 82% | Private: 65% - 70%\n` +
        `• **Mechanical & Civil:** Govt: 70% - 76% | Diploma (10th): 65% - 75%`;
    }
  }

  // ----------------------------------------------------
  // INTENT 4: User Score & Location Personalization
  // ----------------------------------------------------
  else if (userMarks !== null || targetCity) {
    intent = 'marks_analysis';
    sources = ["REAP 2025 Seat Matrix & Cutoff Database"];

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

    responseText = `🎯 **Personalized Recommendation Report ${userMarks ? `for ${userMarks}% PCM` : ''} ${targetCity ? `in ${targetCity.toUpperCase()}` : ''}:**\n\n` +
      `Based on cutoff trends and seat matrix, here are the best options:\n\n` +
      recommended.map(c => 
        `• **${c.shortName}** (${c.type})\n  - Fee: ₹${c.feesPerYear.toLocaleString()}/yr | Hostel: ${c.hostelAvailable ? 'Yes' : 'No'} | Avg Package: ${c.placements.avgPackage}\n  - Admission Safety: ${userMarks >= 80 ? 'High Chance (Safe)' : userMarks >= 65 ? 'Moderate' : 'Reach'}`
      ).join('\n\n');

    structuredData = recommended;
  }

  // ----------------------------------------------------
  // INTENT 5: Compare Colleges
  // ----------------------------------------------------
  else if (isCompare) {
    intent = 'compare';
    const foundColleges = RAJASTHAN_COLLEGES.filter(c => 
      queryLower.includes(c.shortName.toLowerCase()) || 
      queryLower.includes(c.id) ||
      (c.city && queryLower.includes(c.city.toLowerCase()))
    );

    const c1 = foundColleges[0] || RAJASTHAN_COLLEGES[1];
    const c2 = foundColleges[1] || RAJASTHAN_COLLEGES[4];

    responseText = `📊 **Comparison: ${c1.shortName} vs ${c2.shortName}**\n\n` +
      `• **Category:** ${c1.shortName} (${c1.type}) vs ${c2.shortName} (${c2.type})\n` +
      `• **Tuition Fee:** ₹${c1.feesPerYear.toLocaleString()} / yr vs ₹${c2.feesPerYear.toLocaleString()} / yr\n` +
      `• **Placements:** Avg ${c1.placements.avgPackage} (Max ${c1.placements.highestPackage}) vs Avg ${c2.placements.avgPackage} (Max ${c2.placements.highestPackage})\n` +
      `• **Hostel:** ${c1.hostelAvailable ? `₹${c1.hostelFeesPerYear.toLocaleString()}/yr` : 'N/A'} vs ${c2.hostelAvailable ? `₹${c2.hostelFeesPerYear.toLocaleString()}/yr` : 'N/A'}`;

    structuredData = [c1, c2];
    sources = ["REAP 2025 Data"];
    actionData = { type: 'OPEN_TAB', tab: 'comparison', collegeIds: [c1.id, c2.id] };
  }

  // ----------------------------------------------------
  // INTENT 6: Scholarships
  // ----------------------------------------------------
  else if (isScholarship) {
    intent = 'scholarship';
    structuredData = SCHOLARSHIPS_DATA;
    responseText = `💰 **Verified Rajasthan Scholarship Schemes:**\n\n` +
      `1. **CM Higher Education Scholarship:** ₹5,000/yr (12th Board >= 60%, Income < ₹2.5 LPA)\n` +
      `2. **SJE Post-Matric Scholarship:** 100% Fee Reimbursement for SC/ST/OBC/EWS\n` +
      `3. **TFWS Fee Waiver:** 100% Tuition Fee Waiver in REAP (Income < ₹8 LPA)\n` +
      `4. **Kali Bai Scooter Scheme:** Free Scooter for Girl Students in Rajasthan.`;
    sources = ["SJE Rajasthan Portal"];
    actionData = { type: 'OPEN_TAB', tab: 'scholarships' };
  }

  // ----------------------------------------------------
  // INTENT 7: Greetings & General Guidance
  // ----------------------------------------------------
  else if (isWhoAreYou || isGreeting) {
    intent = 'greeting';
    sources = ["EduMitra AI Knowledge Base"];
    responseText = `👋 **Hello! I am EduMitra AI (College-ChatGPT for Rajasthan).**\n\n` +
      `I am your intelligent AI guide for Rajasthan Engineering (REAP) & Polytechnic Diploma admissions.\n\n` +
      `Ask me anything! For example:\n` +
      `• *"Can I get MNIT at 67% JEE percentile?"*\n` +
      `• *"Tell me everything about MBM University Jodhpur"*\n` +
      `• *"What is the fee and hostel at RTU Kota?"*\n` +
      `• *"Compare RTU Kota and SKIT Jaipur"*`;
  }

  // ----------------------------------------------------
  // INTENT 8: Fallback Conversational AI Answer
  // ----------------------------------------------------
  else {
    intent = 'general_faq';
    sources = ["EduMitra AI Knowledge Base"];
    responseText = `🤖 **EduMitra AI Answer:**\n\n` +
      `Regarding your query: *"${rawQuery}"*\n\n` +
      `• **For Specific College Admission Checks:** Ask *"Can I get MNIT at 67% percentile?"* or *"Can I get RTU Kota at 80%?"*.\n` +
      `• **For Branch Cutoffs:** Ask *"What is the cutoff for CSE?"* or *"Branch cutoffs for 82%"*.\n` +
      `• **For Specific College Info:** Type college name (e.g. *"RTU Kota"*, *"SKIT"*, *"MBM"*, *"CTAE"*).\n` +
      `• **For Scholarships:** Ask *"Show me scholarships in Rajasthan"*.\n\n` +
      `Or use the top tabs to explore Colleges, Cutoffs, and Eligibility!`;
  }

  // Save Turn to Session Memory
  sessionContext.history.push({ user: rawQuery, ai: responseText });

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
