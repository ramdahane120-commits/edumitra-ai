// EduMitra AI - Recommendation & Eligibility Algorithm Service

import { RAJASTHAN_COLLEGES } from '../data/colleges.js';
import { REAP_CUTOFFS } from '../data/cutoffs.js';

export function calculateMatchScore(studentProfile, college) {
  let score = 70; // Base score

  // 1. Marks / Rank Match
  if (studentProfile.pcmMarks) {
    if (studentProfile.pcmMarks >= 85 && college.type.includes('Government')) {
      score += 15;
    } else if (studentProfile.pcmMarks >= 75) {
      score += 10;
    } else if (studentProfile.pcmMarks < 60 && college.type.includes('Government')) {
      score -= 20;
    }
  }

  // 2. Budget match
  if (studentProfile.maxFeePerYear) {
    if (college.feesPerYear <= studentProfile.maxFeePerYear) {
      score += 10;
    } else {
      score -= 15;
    }
  }

  // 3. District Match
  if (studentProfile.preferredDistrict && studentProfile.preferredDistrict !== 'all') {
    if (college.district.toLowerCase() === studentProfile.preferredDistrict.toLowerCase()) {
      score += 10;
    }
  }

  // 4. Branch Match
  if (studentProfile.preferredBranch) {
    const hasBranch = college.courses.some(c => 
      c.branch.toLowerCase().includes(studentProfile.preferredBranch.toLowerCase())
    );
    if (hasBranch) score += 10;
  }

  return Math.min(Math.max(score, 45), 98);
}

export function evaluateCutoffProbability(pcmPct, jeeRank, collegeId, category = 'General') {
  const collegeCutoffs = REAP_CUTOFFS.find(c => c.collegeId === collegeId);
  if (!collegeCutoffs) return { status: 'High', probability: 85, badgeColor: 'green' };

  const latestGen = collegeCutoffs.cutoffs.find(c => c.category === category) || collegeCutoffs.cutoffs[0];
  
  if (pcmPct) {
    if (latestGen.min12thPct) {
      const diff = pcmPct - latestGen.min12thPct;
      if (diff >= 3) return { status: 'High Chance', probability: 92, badgeColor: 'green' };
      if (diff >= -2) return { status: 'Moderate Chance', probability: 68, badgeColor: 'amber' };
      return { status: 'Reach / Low Chance', probability: 35, badgeColor: 'rose' };
    }
  }

  if (jeeRank && latestGen.jeeRank) {
    if (jeeRank <= latestGen.jeeRank) return { status: 'High Chance', probability: 95, badgeColor: 'green' };
    if (jeeRank <= latestGen.jeeRank * 1.25) return { status: 'Moderate Chance', probability: 65, badgeColor: 'amber' };
    return { status: 'Low Chance', probability: 30, badgeColor: 'rose' };
  }

  return { status: 'Eligible for REAP Counselling', probability: 75, badgeColor: 'blue' };
}
