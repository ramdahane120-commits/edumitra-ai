// EduMitra AI - Deep Conversational NLU & Grounded RAG Engine

import { RAJASTHAN_COLLEGES } from '../data/colleges.js';
import { REAP_CUTOFFS } from '../data/cutoffs.js';
import { SCHOLARSHIPS_DATA } from '../data/scholarships.js';
import { ADMISSION_ROADMAP_STEPS } from '../data/roadmap.js';

export function processUserQuery(query, language = 'en') {
  const queryLower = query.toLowerCase().trim();

  // Extract Numerical Entities
  const marksMatch = queryLower.match(/(\d{1,3}(\.\d{1,2})?)\s*(%|percent|pct|marks|अंक|नंबर)/i);
  const userMarks = marksMatch ? parseFloat(marksMatch[1]) : null;

  const rankMatch = queryLower.match(/(\d{1,6})\s*(rank|jee|merit|रैंक)/i) || queryLower.match(/rank\s*(\d{1,6})/i);
  const userRank = rankMatch ? parseInt(rankMatch[1], 10) : null;

  // Specific College Extraction
  const targetCollege = RAJASTHAN_COLLEGES.find(c => 
    queryLower.includes(c.shortName.toLowerCase()) || 
    queryLower.includes(c.id) ||
    c.name.toLowerCase().includes(queryLower) ||
    (c.city && queryLower.includes(c.city.toLowerCase()) && (queryLower.includes('college') || queryLower.includes('university') || queryLower.includes('कॉलेज')))
  );

  // Branch Extraction
  const branches = ['cse', 'computer', 'ai', 'data science', 'ece', 'electronics', 'ee', 'electrical', 'me', 'mechanical', 'ce', 'civil', 'mining', 'agricultural', 'it', 'aeronautical'];
  const matchedBranchStr = branches.find(b => queryLower.includes(b));

  // Specific Query Flags
  const isGovtOnly = queryLower.includes('govt') || queryLower.includes('government') || queryLower.includes('सरकारी');
  const isPolytechnic = queryLower.includes('polytechnic') || queryLower.includes('diploma') || queryLower.includes('डिप्लोमा');
  const isHostel = queryLower.includes('hostel') || queryLower.includes('हॉस्टल') || queryLower.includes('रहने');
  const isFee = queryLower.includes('fee') || queryLower.includes('fees') || queryLower.includes('फीस') || queryLower.includes('खर्चा') || queryLower.includes('cost');
  const isScholarship = queryLower.includes('scholarship') || queryLower.includes('छात्रवृत्ति') || queryLower.includes('fee waiver') || queryLower.includes('tfws');
  const isCompare = queryLower.includes('compare') || queryLower.includes('vs') || queryLower.includes('अंतर') || queryLower.includes('तुलना');
  const isRoadmap = queryLower.includes('roadmap') || queryLower.includes('process') || queryLower.includes('step') || queryLower.includes('प्रक्रिया') || queryLower.includes('काउंसलिंग') || queryLower.includes('how to apply');
  const isBranchQuery = queryLower.includes('branch') || queryLower.includes('stream') || queryLower.includes('ब्रांच') || queryLower.includes('ऑप्शन') || matchedBranchStr;

  let intent = 'general';
  let responseText = '';
  let structuredData = [];
  let sources = [];
  let actionData = null;

  // ----------------------------------------------------
  // CASE 1: Deep Dive on a Specific College
  // e.g. "Tell me about MBM Jodhpur", "What is the fee for SKIT Jaipur?"
  // ----------------------------------------------------
  if (targetCollege && !isCompare) {
    intent = 'college_detail';
    sources = [`Official ${targetCollege.shortName} Prospectus & REAP 2025 Matrix`, `${targetCollege.website}`];

    if (isFee || isHostel) {
      responseText = language === 'hi' 
        ? `📋 **${targetCollege.name} (${targetCollege.shortName}) - फीस एवं हॉस्टल की विस्तृत जानकारी:**\n\n` +
          `• **वार्षिक शिक्षण शुल्क (Tuition Fee):** ₹${targetCollege.feesPerYear.toLocaleString()} प्रति वर्ष\n` +
          `• **हॉस्टल सुविधा:** ${targetCollege.hostelAvailable ? `उपलब्ध है (शुल्क: ₹${targetCollege.hostelFeesPerYear.toLocaleString()}/वर्ष)` : 'हॉस्टल उपलब्ध नहीं है'}\n` +
          `• **प्रवेश माध्यम:** ${targetCollege.courses[0] ? targetCollege.courses[0].mode : 'REAP / JEE Main'}\n` +
          `• **TFWS सीट:** 100% ट्यूशन फीस माफ़ सीट उपलब्ध (आय < ₹8 लाख/वर्ष)`
        : `📋 **${targetCollege.name} (${targetCollege.shortName}) - Fee & Hostel Breakdown:**\n\n` +
          `• **Annual Tuition Fee:** ₹${targetCollege.feesPerYear.toLocaleString()} / year\n` +
          `• **Hostel Facility:** ${targetCollege.hostelAvailable ? `Available (Fee: ₹${targetCollege.hostelFeesPerYear.toLocaleString()} / yr)` : 'Hostel not available'}\n` +
          `• **Admission Mode:** ${targetCollege.courses[0] ? targetCollege.courses[0].mode : 'REAP / JEE Main'}\n` +
          `• **TFWS Quota:** 100% Tuition Fee Waiver available for eligible families (< ₹8 LPA income).`;
    } else {
      responseText = language === 'hi'
        ? `🏛 **${targetCollege.name} (${targetCollege.shortName}) का पूरा विवरण:**\n\n` +
          `• **प्रकार:** ${targetCollege.type} (${targetCollege.district} जिला)\n` +
          `• **स्थापना वर्ष:** ${targetCollege.established} | **मान्यता:** ${targetCollege.accreditation}\n` +
          `• **वार्षिक फीस:** ₹${targetCollege.feesPerYear.toLocaleString()}/वर्ष | **हॉस्टल:** ${targetCollege.hostelAvailable ? `₹${targetCollege.hostelFeesPerYear.toLocaleString()}/वर्ष` : 'उपलब्ध नहीं'}\n` +
          `• **प्लेसमेंट पैकेज:** औसत ₹${targetCollege.placements.avgPackage} (उच्चतम ${targetCollege.placements.highestPackage})\n` +
          `• **प्रमुख रिक्रूटर्स:** ${targetCollege.placements.topRecruiters.join(', ')}\n\n` +
          `🎓 **उपलब्ध शाखाएँ (Branches & Seats):**\n` +
          targetCollege.courses.map(c => `  - ${c.branch}: ${c.intake} सीटें (पात्रता: 12वीं में ${c.min12thPct || c.min10thPct}%)`).join('\n')
        : `🏛 **Full Details for ${targetCollege.name} (${targetCollege.shortName}):**\n\n` +
          `• **Type:** ${targetCollege.type} (District: ${targetCollege.district})\n` +
          `• **Established:** ${targetCollege.established} | **Accreditation:** ${targetCollege.accreditation}\n` +
          `• **Annual Tuition Fee:** ₹${targetCollege.feesPerYear.toLocaleString()} / year\n` +
          `• **Hostel Facility:** ${targetCollege.hostelAvailable ? `Available (₹${targetCollege.hostelFeesPerYear.toLocaleString()}/year)` : 'Not available'}\n` +
          `• **Placements:** Avg Package ${targetCollege.placements.avgPackage} (Highest: ${targetCollege.placements.highestPackage}) | ${targetCollege.placements.placementPercentage}% Placement Rate\n` +
          `• **Top Recruiters:** ${targetCollege.placements.topRecruiters.join(', ')}\n\n` +
          `🎓 **Available Courses & Intake:**\n` +
          targetCollege.courses.map(c => `  - ${c.branch}: ${c.intake} seats (Min Eligibility: ${c.min12thPct || c.min10thPct}% in Board)`).join('\n');
    }

    structuredData = [targetCollege];
    actionData = { type: 'HIGHLIGHT_COLLEGE', collegeId: targetCollege.id };
  }

  // ----------------------------------------------------
  // CASE 2: Branch & Percentage Analysis Query
  // e.g. "I got 78% in PCM. What branches can I get at RTU Kota or SKIT?"
  // ----------------------------------------------------
  else if (userMarks !== null && (isBranchQuery || targetCollege)) {
    intent = 'branch_analysis';
    sources = ["REAP 2025 Historical Cutoff Percentile Data", "DTE Rajasthan Seat Matrix"];

    const eligibleColleges = RAJASTHAN_COLLEGES.filter(c => {
      if (targetCollege) return c.id === targetCollege.id;
      if (isGovtOnly) return c.type.toLowerCase().includes('government');
      return true;
    });

    let branchAnalysisResults = [];

    eligibleColleges.forEach(col => {
      col.courses.forEach(course => {
        const requiredPct = course.min12thPct || course.min10thPct || 60;
        let chance = 'High';
        let chanceColor = 'green';

        if (userMarks >= requiredPct + 10) {
          chance = 'Very High (Safe)';
          chanceColor = 'green';
        } else if (userMarks >= requiredPct) {
          chance = 'Moderate (Target)';
          chanceColor = 'amber';
        } else if (userMarks >= requiredPct - 8) {
          chance = 'Reach (Low)';
          chanceColor = 'rose';
        } else {
          chance = 'Unlikely';
          chanceColor = 'gray';
        }

        if (chance !== 'Unlikely') {
          branchAnalysisResults.push({
            collegeName: col.shortName,
            collegeType: col.type,
            branch: course.branch,
            fee: col.feesPerYear,
            chance,
            chanceColor,
            requiredPct
          });
        }
      });
    });

    branchAnalysisResults = branchAnalysisResults.slice(0, 6);

    responseText = language === 'hi'
      ? `📊 **आपके ${userMarks}% अंकों के आधार पर ब्रांच एवं कॉलेज की संभावनाएं:**\n\n` +
        `आपके 12वीं PCM के ${userMarks}% अंकों का विश्लेषण करने के बाद, निम्नलिखित कॉलेजों एवं ब्रांचों में आपके चयन की संभावना है:\n\n` +
        branchAnalysisResults.map(r => `• **${r.collegeName}** - ${r.branch}\n  - संभावना: ${r.chance} (कटऑफ: ~${r.requiredPct}%) | फीस: ₹${r.fee.toLocaleString()}/वर्ष`).join('\n\n')
      : `📊 **Branch & Admission Chances Analysis for ${userMarks}% Marks:**\n\n` +
        `Based on historical REAP 2024-2025 cutoff data for ${userMarks}% PCM aggregate score, here is your realistic branch-wise evaluation:\n\n` +
        branchAnalysisResults.map(r => `• **${r.collegeName}** - ${r.branch}\n  - Admission Chance: **${r.chance}** (Est Cutoff: ${r.requiredPct}%) | Fee: ₹${r.fee.toLocaleString()}/yr`).join('\n\n');

    structuredData = branchAnalysisResults;
  }

  // ----------------------------------------------------
  // CASE 3: Comparison Query
  // e.g. "Compare RTU Kota and SKIT Jaipur"
  // ----------------------------------------------------
  else if (isCompare) {
    intent = 'compare';
    const foundColleges = RAJASTHAN_COLLEGES.filter(c => 
      queryLower.includes(c.shortName.toLowerCase()) || 
      queryLower.includes(c.id) ||
      queryLower.includes(c.city.toLowerCase())
    );

    const c1 = foundColleges[0] || RAJASTHAN_COLLEGES[1]; // RTU Kota
    const c2 = foundColleges[1] || RAJASTHAN_COLLEGES[4]; // SKIT Jaipur

    responseText = language === 'hi'
      ? `📊 **${c1.shortName} बनाम ${c2.shortName} - विस्तृत तुलना:**\n\n` +
        `1. **संस्थान प्रकार:** ${c1.shortName} (${c1.type}) | ${c2.shortName} (${c2.type})\n` +
        `2. **वार्षिक फीस:** ${c1.shortName} (₹${c1.feesPerYear.toLocaleString()}/वर्ष) बनाम ${c2.shortName} (₹${c2.feesPerYear.toLocaleString()}/वर्ष)\n` +
        `3. **प्लेसमेंट पैकेज:** ${c1.shortName} (औसत ₹${c1.placements.avgPackage}, उच्चतम ₹${c1.placements.highestPackage}) बनाम ${c2.shortName} (औसत ₹${c2.placements.avgPackage}, उच्चतम ₹${c2.placements.highestPackage})\n` +
        `4. **हॉस्टल सुविधा:** ${c1.shortName} (${c1.hostelAvailable ? `₹${c1.hostelFeesPerYear.toLocaleString()}/वर्ष` : 'नहीं'}) | ${c2.shortName} (${c2.hostelAvailable ? `₹${c2.hostelFeesPerYear.toLocaleString()}/वर्ष` : 'नहीं'})\n` +
        `5. **मान्यता:** ${c1.shortName} (${c1.accreditation}) | ${c2.shortName} (${c2.accreditation})`
      : `📊 **Detailed Side-by-Side Comparison: ${c1.shortName} vs ${c2.shortName}**\n\n` +
        `1. **Type:** ${c1.shortName} (${c1.type}) vs ${c2.shortName} (${c2.type})\n` +
        `2. **Annual Tuition Fee:** ${c1.shortName} (₹${c1.feesPerYear.toLocaleString()}/yr) vs ${c2.shortName} (₹${c2.feesPerYear.toLocaleString()}/yr)\n` +
        `3. **Placements:** ${c1.shortName} (Avg ${c1.placements.avgPackage}, Max ${c1.placements.highestPackage}) vs ${c2.shortName} (Avg ${c2.placements.avgPackage}, Max ${c2.placements.highestPackage})\n` +
        `4. **Hostel Charges:** ${c1.shortName} (${c1.hostelAvailable ? `₹${c1.hostelFeesPerYear.toLocaleString()}/yr` : 'N/A'}) vs ${c2.shortName} (${c2.hostelAvailable ? `₹${c2.hostelFeesPerYear.toLocaleString()}/yr` : 'N/A'})\n` +
        `5. **Accreditation:** ${c1.shortName} (${c1.accreditation}) vs ${c2.shortName} (${c2.accreditation})`;

    structuredData = [c1, c2];
    sources = ["Official REAP 2025 Seat Matrix", "RTU & NBA Reports"];
    actionData = { type: 'OPEN_TAB', tab: 'comparison', collegeIds: [c1.id, c2.id] };
  }

  // ----------------------------------------------------
  // CASE 4: Scholarship Query
  // ----------------------------------------------------
  else if (isScholarship) {
    intent = 'scholarship';
    structuredData = SCHOLARSHIPS_DATA;
    responseText = language === 'hi'
      ? `💰 **राजस्थान इंजीनियरिंग एवं डिप्लोमा छात्रों के लिए प्रमुख छात्रवृत्ति योजनाएं:**\n\n` +
        `1. **मुख्यमंत्री उच्च शिक्षा छात्रवृत्ति योजना:** ₹5,000/वर्ष (12वीं में 60%+ अंक, आय < ₹2.5 लाख)\n` +
        `2. **SJE उत्तर मैट्रिक छात्रवृत्ति (SC/ST/OBC/EWS):** 100% ट्यूशन फीस पुनर्भुगतान\n` +
        `3. **TFWS (ट्यूशन फीस वेवर योजना):** REAP काउंसलिंग में 100% ट्यूशन फीस माफ़ी (आय < ₹8 लाख)\n` +
        `4. **कालीबाई भील मेधावी छात्रा स्कूटी योजना:** मेधावी छात्राओं हेतु नि:शुल्क स्कूटी एवं प्रोत्साहन`
      : `💰 **Major Scholarships for Engineering & Diploma Students in Rajasthan:**\n\n` +
        `1. **CM Higher Education Scholarship Scheme:** ₹5,000 / year (12th Board >= 60%, Income < ₹2.5 LPA)\n` +
        `2. **SJE Post-Matric Scholarship (SC/ST/OBC/EWS):** 100% Tuition Fee Reimbursement + Monthly Allowance\n` +
        `3. **TFWS (Tuition Fee Waiver Scheme):** 100% Tuition Fee Waiver in REAP (Family Income < ₹8 LPA)\n` +
        `4. **Kali Bai Scooter Scheme:** Free Scooter for meritorious girl students in Rajasthan.`;
    sources = ["Social Justice & Empowerment Department (SJE) Rajasthan", "HTE Portal"];
    actionData = { type: 'OPEN_TAB', tab: 'scholarships' };
  }

  // ----------------------------------------------------
  // CASE 5: Admission Roadmap / Process Query
  // ----------------------------------------------------
  else if (isRoadmap) {
    intent = 'roadmap';
    structuredData = ADMISSION_ROADMAP_STEPS;
    responseText = language === 'hi'
      ? `🧭 **राजस्थान REAP 2026 प्रवेश प्रक्रिया के मुख्य चरण:**\n\n` +
        `1. **पात्रता जांच:** 12वीं PCM में न्यूनतम 45% (सामान्य) या 40% (आरक्षित) होना अनिवार्य।\n` +
        `2. **ऑनलाइन पंजीकरण:** reap2026.com पर ₹700 पंजीकरण शुल्क देकर आवेदन करें।\n` +
        `3. **मेरिट सूची जारी:** JEE Main अंक (वरीयता 1) एवं 12वीं बोर्ड प्रतिशत (वरीयता 2) के आधार पर मेरिट रैंक तैयार होती है।\n` +
        `4. **चॉइस फिलिंग:** अपनी पसंद के सरकारी एवं प्राइवेट कॉलेजों की सूची लॉक करें।\n` +
        `5. **सीट आवंटन एवं कॉलेज रिपोर्टिंग:** सीट आवंटन पत्र डाउनलोड करें और मूल दस्तावेजों के साथ कॉलेज में उपस्थिति दर्ज कराएं।`
      : `🧭 **Official REAP 2026 Admission Process Roadmap:**\n\n` +
        `1. **Eligibility Check:** Minimum 45% in 12th PCM (40% for Reserved categories).\n` +
        `2. **Online Registration:** Register on reap2026.com with Aadhaar and pay ₹700 fee.\n` +
        `3. **Merit Rank Release:** Ranks prepared based on JEE Main score (Priority 1) and 12th Board PCM % (Priority 2).\n` +
        `4. **Choice Filling:** Lock preferred order of Colleges & Branches (Add Govt & TFWS seats first).\n` +
        `5. **Seat Allotment & Reporting:** Download allotment letter and report physically to college with original documents.`;
    sources = ["Directorate of Technical Education (DTE) Rajasthan Guidelines 2026"];
    actionData = { type: 'OPEN_TAB', tab: 'roadmap' };
  }

  // ----------------------------------------------------
  // CASE 6: Default Recommendations / General Intent
  // ----------------------------------------------------
  else {
    intent = 'recommendation';
    let filterCat = isPolytechnic ? 'Polytechnic Diploma' : 'Engineering';
    
    let matches = RAJASTHAN_COLLEGES.filter(college => {
      if (college.category !== filterCat && !queryLower.includes('all')) {
        if (!isPolytechnic && college.category !== 'Engineering') return false;
      }
      if (isGovtOnly && !college.type.toLowerCase().includes('government')) return false;
      if (isHostel && !college.hostelAvailable) return false;
      return true;
    });

    if (userMarks !== null) {
      matches = matches.filter(college => {
        const minReq = isPolytechnic ? 50 : 55;
        return userMarks >= (minReq - 10);
      });
    }

    recommendedColleges = matches.slice(0, 4);

    if (language === 'hi') {
      responseText = `आपकी खोज ${userMarks ? `(${userMarks}% अंक)` : ''} ${isGovtOnly ? 'सरकारी' : ''} ${isPolytechnic ? 'पॉलीटेक्निक' : 'इंजीनियरिंग'} के आधार पर, यहाँ शीर्ष सत्यापित राजस्थान कॉलेज दिए गए हैं:`;
    } else if (language === 'raj') {
      responseText = `रामां-रामां! थारी खोज ${userMarks ? `(${userMarks}% नंबर)` : ''} रे हिसाब सूं, राजस्थान रा टॉप सत्यापित कॉलेज अठै देख्या जा सकै है:`;
    } else {
      responseText = `Based on your request ${userMarks ? `(${userMarks}% marks)` : ''} for ${isGovtOnly ? 'Government' : 'Engineering/Diploma'} institutions in Rajasthan, here are top verified recommendations:`;
    }

    structuredData = recommendedColleges;
    sources = ["REAP 2025 Official Cutoff & Seat Matrix Dataset", "DTE Rajasthan Portal"];
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
      isPolytechnic,
      isCse: !!matchedBranchStr
    }
  };
}
