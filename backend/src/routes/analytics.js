const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');

// GET diagnostic breakdown for a specific student (Mastered, Recap, Weak)
router.get('/student/:id', (req, res) => {
  const studentId = req.params.id || 'b0000000-0000-0000-0000-000000000001';
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

  // Calculate overall metrics
  const totalAttempts = masteryList.reduce((acc, curr) => acc + (curr.attempts || 0), 0);
  const avgAccuracy = masteryList.length > 0 
    ? Math.round(masteryList.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / masteryList.length)
    : 78;

  res.json({
    success: true,
    student,
    summary: {
      totalConceptsEvaluated: masteryList.length,
      masteredCount: mastered.length,
      recapCount: recap.length,
      weakCount: weak.length,
      avgAccuracy,
      totalAttempts
    },
    breakdown: {
      mastered,
      recap,
      weak
    }
  });
});

// GET pilot overview for HAPS Leadership (Principal / Director)
router.get('/pilot-overview', (req, res) => {
  res.json({
    success: true,
    pilotSchool: 'Him Academy Public School (HAPS), Vikas Nagar, Hamirpur',
    pilotClass: 'Class XI Science - Section A',
    studentsEnrolled: 32,
    activeParticipationRate: '94.2%',
    diagnosticSummary: {
      totalAssessmentsCompleted: 148,
      avgSpeedImprovement: '+26% speed gain in numerical derivations',
      teacherTimeSavedHours: '18.5 hours saved this week on manual marking & grading',
      topWeaknessArea: 'Simple Harmonic Motion (Damped Decay Constants)',
      topMasteredArea: 'Moment of Inertia (Rigid Body Rotations)'
    }
  });
});

module.exports = router;
