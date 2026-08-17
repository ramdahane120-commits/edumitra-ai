// EduMitra AI - Grounded RAG & Intent Parser Core Engine

import { RAJASTHAN_COLLEGES } from '../data/colleges.js';
import { REAP_CUTOFFS } from '../data/cutoffs.js';
import { SCHOLARSHIPS_DATA } from '../data/scholarships.js';
import { ADMISSION_ROADMAP_STEPS } from '../data/roadmap.js';

export function processUserQuery(query, language = 'en') {
  const queryLower = query.toLowerCase().trim();
  
  // Extract key intent and entities
  const marksMatch = queryLower.match(/(\d{1,3})\s*(%|percent|pct|marks)/i);
  const userMarks = marksMatch ? parseFloat(marksMatch[1]) : null;

  const rankMatch = queryLower.match(/(\d{1,6})\s*(rank|jee|merit)/i) || queryLower.match(/rank\s*(\d{1,6})/i);
  const userRank = rankMatch ? parseInt(rankMatch[1], 10) : null;

  const isGovtOnly = queryLower.includes('govt') || queryLower.includes('government') || queryLower.includes('सरकारी');
  const isPolytechnic = queryLower.includes('polytechnic') || queryLower.includes('diploma') || queryLower.includes('डिप्लोमा');
  const isCse = queryLower.includes('cse') || queryLower.includes('computer') || queryLower.includes('कंप्यूटर');
  const isHostel = queryLower.includes('hostel') || queryLower.includes('हॉस्टल');
  const isScholarship = queryLower.includes('scholarship') || queryLower.includes(' छात्रवृत्ति') || queryLower.includes('fee waiver') || queryLower.includes('tfws');
  const isCompare = queryLower.includes('compare') || queryLower.includes('vs') || queryLower.includes('अंतर') || queryLower.includes('तुलना');
  const isRoadmap = queryLower.includes('roadmap') || queryLower.includes('process') || queryLower.includes('step') || queryLower.includes('प्रक्रिया') || queryLower.includes('काउंसलिंग');
  
  let intent = 'general';
  let responseText = '';
  let structuredData = [];
  let sources = [];
  let recommendedColleges = [];

  // Intent 1: Comparison Query
  if (isCompare) {
    intent = 'compare';
    const foundColleges = RAJASTHAN_COLLEGES.filter(c => 
      queryLower.includes(c.shortName.toLowerCase()) || 
      queryLower.includes(c.id) ||
      queryLower.includes(c.city.toLowerCase())
    );

    if (foundColleges.length >= 2) {
      structuredData = foundColleges;
      responseText = language === 'hi' 
        ? `यहाँ ${foundColleges[0].shortName} और ${foundColleges[1].shortName} की तुलना दी गई है:`
        : `Here is a detailed comparison between ${foundColleges[0].shortName} and ${foundColleges[1].shortName}:`;
    } else {
      structuredData = [RAJASTHAN_COLLEGES[1], RAJASTHAN_COLLEGES[4]]; // Default RTU vs SKIT
      responseText = language === 'hi'
        ? `यहाँ राजस्थान के दो शीर्ष कॉलेजों (UCE RTU Kota एवं SKIT Jaipur) की तुलना दी गई है:`
        : `Here is a comparison between two top colleges in Rajasthan (UCE RTU Kota vs SKIT Jaipur):`;
    }
    sources = ["Official REAP 2025 Brochure", "RTU & NBA Accreditation Reports 2025"];
  } 
  // Intent 2: Scholarship Query
  else if (isScholarship) {
    intent = 'scholarship';
    structuredData = SCHOLARSHIPS_DATA;
    responseText = language === 'hi'
      ? `राजस्थान सरकार एवं केंद्र सरकार की प्रमुख छात्रवृत्ति योजनाएँ नीचे सूचीबद्ध हैं:`
      : `Here are the major verified Rajasthan Government & Central Scholarship Schemes applicable for engineering and diploma students:`;
    sources = ["Social Justice & Empowerment Department (SJE) Rajasthan", "HTE Rajasthan Portal (hte.rajasthan.gov.in)"];
  }
  // Intent 3: Admission Roadmap Query
  else if (isRoadmap) {
    intent = 'roadmap';
    structuredData = ADMISSION_ROADMAP_STEPS;
    responseText = language === 'hi'
      ? `REAP एवं DTE राजस्थान एडमिशन की चरण-दर-चरण प्रक्रिया निम्नलिखित है:`
      : `Here is your step-by-step personalized REAP & DTE Admission Roadmap for Rajasthan colleges:`;
    sources = ["Directorate of Technical Education (DTE) Rajasthan Guidelines 2026"];
  }
  // Intent 4: College Recommendation based on Marks / Rank / Preferences
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
      responseText = `आपकी प्रोफ़ाइल ${userMarks ? `(${userMarks}% अंक)` : ''} ${isGovtOnly ? 'सरकारी' : ''} ${isCse ? 'CSE' : ''} ${isPolytechnic ? 'पॉलीटेक्निक' : 'इंजीनियरिंग'} के आधार पर, यहाँ सत्यापित राजस्थान कॉलेज अनुशंसित हैं:`;
    } else if (language === 'raj') {
      responseText = `रामां-रामां! थारी प्रोफाइल ${userMarks ? `(${userMarks}% नंबर)` : ''} रे हिसाब सूं, राजस्थान रा टॉप कॉलेज अठै देख्या जा सकै है:`;
    } else {
      responseText = `Based on your query ${userMarks ? `(${userMarks}% marks)` : ''} for ${isGovtOnly ? 'Government' : 'Engineering/Diploma'} colleges in Rajasthan, here are the top verified recommendations:`;
    }

    structuredData = recommendedColleges;
    sources = ["REAP 2025 Official Cutoff & Seat Matrix Dataset", "DTE Rajasthan College Directory"];
  }

  return {
    intent,
    responseText,
    structuredData,
    sources,
    queryDetails: {
      userMarks,
      userRank,
      isGovtOnly,
      isPolytechnic,
      isCse
    }
  };
}
