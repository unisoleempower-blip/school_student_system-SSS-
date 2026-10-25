// ============================================================================
// HAPS-AI SCHOLAR ASSISTANT: WEEKLY SMART REPORT CARD GENERATOR
// Produces tailored dual-action recommendations for Teachers (Hostel/School) and Parents
// ============================================================================

const { inMemoryStore } = require('../config/database');

/**
 * Generate a comprehensive weekly report card with dual-action directives
 * @param {string} studentId
 */
async function generateWeeklyReport(studentId = 'b0000000-0000-0000-0000-000000000001') {
  const student = inMemoryStore.users.find(u => u.id === studentId) || {
    full_name: 'Aryan Sharma',
    roll_number: '11-S-24',
    grade: '11',
    section: 'Science-A',
    board: 'CBSE',
    target_exam: 'JEE_ADVANCED'
  };

  const masteryList = inMemoryStore.conceptMastery.filter(m => m.student_id === studentId);

  const mastered = masteryList.filter(m => m.mastery_status === 'MASTERED');
  const recap = masteryList.filter(m => m.mastery_status === 'NEEDS_RECAP');
  const weak = masteryList.filter(m => m.mastery_status === 'CRITICAL_WEAKNESS');

  // Intelligent Action Generation for School / Hostel Faculty
  const schoolActions = [];
  if (weak.length > 0) {
    const primaryWeakness = weak[0];
    schoolActions.push({
      directive: `Conduct a focused 15-minute 1-on-1 pedagogical review during 7:30 PM residential evening prep on ${primaryWeakness.subtopic}.`,
      responsible_faculty: 'Subject Teacher (Physics Dept)',
      priority: 'HIGH',
      expected_outcome: 'Eliminate confusion between energy decay and amplitude decay formulas.'
    });
    schoolActions.push({
      directive: `Assign Targeted Diagnostic Drill #${primaryWeakness.subtopic.slice(0, 3).toUpperCase()}-04 (5 curated problems with step-by-step hints).`,
      responsible_faculty: 'Hostel Academic Proctor',
      priority: 'MEDIUM',
      expected_outcome: 'Verify independent problem-solving without hints.'
    });
  } else {
    schoolActions.push({
      directive: 'Student is demonstrating strong conceptual velocity. Introduce non-routine Olympiad level extension problems.',
      responsible_faculty: 'Competitive Cell Lead',
      priority: 'NORMAL'
    });
  }

  // Intelligent Action Generation for Parents at Home
  const parentActions = [];
  if (weak.length > 0) {
    const primaryWeakness = weak[0];
    parentActions.push({
      directive: `Ask ${student.full_name.split(' ')[0]} to explain the intuitive difference between simple and damped oscillations for 5 minutes during your weekend call (Feynman Technique).`,
      purpose: 'Explaining a concept to someone else forces mental clarification without creating exam anxiety.',
      frequency: 'Once this weekend'
    });
  }
  if (recap.length > 0) {
    const primaryRecap = recap[0];
    parentActions.push({
      directive: `Ensure ${student.full_name.split(' ')[0]} has 45 minutes of quiet, distraction-free morning study on Sunday to complete the 5-question speed recap test.`,
      purpose: `Reinforces velocity and algebraic confidence in ${primaryRecap.subtopic}.`,
      frequency: 'Sunday morning'
    });
  } else {
    parentActions.push({
      directive: `Applaud ${student.full_name.split(' ')[0]}'s consistent study rhythm and encourage balanced rest and hydration over the weekend.`,
      purpose: 'Sustains high morale and prevents academic burnout.',
      frequency: 'Weekend'
    });
  }

  const report = {
    id: `rep_${Date.now()}`,
    studentId,
    studentName: student.full_name,
    rollNumber: student.roll_number,
    grade: student.grade,
    section: student.section,
    board: student.board,
    targetExam: student.target_exam,
    weekPeriod: 'Current Week (Pilot Phase)',
    generatedAt: new Date().toISOString(),
    overallScorePercentage: 78.4,
    totalStudyHours: 15.2,
    questionsAttempted: 68,
    averageVelocitySeconds: 112,
    masteredConcepts: mastered.map(m => ({ topic: m.topic, subtopic: m.subtopic, accuracy: m.accuracy, score: m.mastery_score })),
    recapConcepts: recap.map(m => ({ topic: m.topic, subtopic: m.subtopic, accuracy: m.accuracy, reason: 'Speed lag or minor calculation slip' })),
    weakConcepts: weak.map(m => ({ topic: m.topic, subtopic: m.subtopic, accuracy: m.accuracy, reason: 'Conceptual gap requiring teacher intervention' })),
    schoolHostelActions: schoolActions,
    parentActions: parentActions
  };

  return report;
}

module.exports = {
  generateWeeklyReport
};
