// ============================================================================
// HAPS-AI SCHOLAR ASSISTANT: ASSESSMENTS & TEST SUBMISSION API ROUTER
// Manages teacher assignment creation, student test delivery, sub-second telemetry
// evaluation, dynamic concept mastery breakdown, and automated weekly report updates.
// ============================================================================

const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');
const { emitEvent } = require('../kafka/producer');
const { processTelemetryEvent } = require('../kafka/consumer');
const { generateWeeklyReport } = require('../services/smartReportService');

// 1. GET /api/assessments - List all test assignments
router.get('/', (req, res) => {
  try {
    const list = inMemoryStore.assessments || [];
    res.json({
      success: true,
      count: list.length,
      assessments: list.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        teacherName: a.teacherName,
        grade: a.grade,
        section: a.section,
        board: a.board,
        subject: a.subject,
        durationMinutes: a.durationMinutes,
        totalMarks: a.totalMarks,
        questionCount: a.questions ? a.questions.length : 0,
        createdAt: a.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /api/assessments/:id - Fetch full assessment with questions
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const assessment = (inMemoryStore.assessments || []).find(a => a.id === id);

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/assessments - Teacher publishes a new test assignment
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description = '',
      teacherName = 'Er. Rajesh Kumar',
      grade = '10',
      section = 'Science-A',
      board = 'CBSE',
      subject = 'Science',
      durationMinutes = 30,
      totalMarks = 20,
      questions = []
    } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Assessment title and at least one question are required.'
      });
    }

    const newAssessment = {
      id: `asgn_${Date.now()}`,
      title,
      description,
      teacherName,
      grade,
      section,
      board,
      subject,
      durationMinutes: Number(durationMinutes) || 30,
      totalMarks: Number(totalMarks) || (questions.length * 4),
      questions: questions.map((q, idx) => ({
        id: q.id || `q_asgn_${Date.now()}_${idx + 1}`,
        topic: q.topic || q.chapter || 'Science Core',
        subtopic: q.subtopic || (q.ncert_mapping ? q.ncert_mapping.ncert_section : 'General'),
        grade: q.grade || grade,
        board: q.curriculum_board || board,
        question_type: q.question_type || 'MCQ_SINGLE',
        difficulty: q.difficulty || 'MEDIUM',
        benchmark_time_seconds: Number(q.benchmark_time_seconds) || 90,
        question_latex: q.question_latex,
        options_latex: q.options_latex || [],
        correct_answer: q.correct_answer || q.correct_answer_latex || 'B',
        solution_latex: q.solution_latex || '',
        socratic_hints: q.socratic_hints || [],
        ncert_mapping: q.ncert_mapping || null,
        step_rubric: q.step_rubric || []
      })),
      createdAt: new Date().toISOString()
    };

    if (!inMemoryStore.assessments) inMemoryStore.assessments = [];
    inMemoryStore.assessments.unshift(newAssessment);

    // Emit event to Kafka stream
    await emitEvent('assessment.published', newAssessment.id, {
      title: newAssessment.title,
      grade: newAssessment.grade,
      teacher: newAssessment.teacherName,
      questionCount: newAssessment.questions.length
    });

    res.status(201).json({
      success: true,
      message: 'Assessment published successfully to class roster.',
      assessment: newAssessment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/assessments/:id/submit - Student submits test, generates telemetry & diagnostics
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentId = 'b0000000-0000-0000-0000-000000000001',
      studentName = 'Aryan Sharma',
      answers = []
    } = req.body;

    const assessment = (inMemoryStore.assessments || []).find(a => a.id === id);
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    let totalScore = 0;
    const totalMarks = assessment.totalMarks || (assessment.questions.length * 4);
    const questionBreakdown = [];
    let totalTimeSpent = 0;

    // Evaluate each question
    for (let i = 0; i < assessment.questions.length; i++) {
      const q = assessment.questions[i];
      const studentAns = answers.find(a => a.questionId === q.id) || answers[i] || {};
      const selected = studentAns.selectedOption || null;
      const timeSpent = Number(studentAns.timeSpentSeconds) || 45;
      const hesitation = Number(studentAns.hesitationSeconds) || 8;
      const hintsUsed = Number(studentAns.hintsUsed) || 0;
      totalTimeSpent += timeSpent;

      const expectedAnswer = (q.correct_answer || q.correct_answer_latex || 'B').trim();
      const isCorrect = selected && selected.trim() === expectedAnswer;

      const marksForQ = isCorrect ? 4.0 : (selected ? -1.0 : 0.0);
      totalScore = Math.max(0, totalScore + marksForQ);

      const benchmark = q.benchmark_time_seconds || 90;
      let category = 'FAST_ACCURATE';
      if (isCorrect) {
        category = timeSpent > (benchmark * 1.3) ? 'SLOW_ACCURATE' : 'FAST_ACCURATE';
      } else {
        category = timeSpent > (benchmark * 1.3) ? 'SLOW_MISCONCEPTION' : 'FAST_CARELESS_SLIP';
      }

      // Record Telemetry Event
      const telemetryPayload = {
        action: 'QuestionTelemetryRecorded',
        studentId,
        questionId: q.id,
        assessmentId: id,
        timeSpentSeconds: timeSpent,
        hesitationSeconds: hesitation,
        attemptStatus: isCorrect ? 'CORRECT' : 'INCORRECT',
        selectedOption: selected,
        topic: q.topic || 'Science',
        subtopic: q.subtopic || 'General',
        benchmarkSeconds: benchmark,
        hintsUsed,
        category
      };

      // Emit to Kafka & update local concept mastery
      const event = await emitEvent('telemetry.question-timer', studentId, telemetryPayload);
      processTelemetryEvent(event);

      inMemoryStore.telemetry.push({
        id: `tel_${Date.now()}_${i}`,
        ...telemetryPayload,
        recordedAt: new Date().toISOString()
      });

      questionBreakdown.push({
        questionIndex: i + 1,
        questionId: q.id,
        subtopic: q.subtopic,
        selectedOption: selected,
        correctAnswer: expectedAnswer,
        isCorrect,
        timeSpentSeconds: timeSpent,
        benchmarkSeconds: benchmark,
        category,
        marksAwarded: marksForQ
      });
    }

    const percentage = Math.round((totalScore / totalMarks) * 100);

    // Dynamic Concept Classification for this student
    const studentMastery = inMemoryStore.conceptMastery.filter(m => m.student_id === studentId);
    const mastered = studentMastery.filter(m => m.mastery_status === 'MASTERED');
    const recap = studentMastery.filter(m => m.mastery_status === 'NEEDS_RECAP');
    const weak = studentMastery.filter(m => m.mastery_status === 'CRITICAL_WEAKNESS');

    // Automatically regenerate Weekly Smart Report with fresh diagnostic data
    const updatedReport = await generateWeeklyReport(studentId);
    inMemoryStore.weeklyReports.unshift(updatedReport);

    res.json({
      success: true,
      message: 'Test submitted and evaluated with sub-second diagnostic classification.',
      results: {
        assessmentId: id,
        assessmentTitle: assessment.title,
        studentId,
        studentName,
        totalQuestions: assessment.questions.length,
        totalScore,
        totalMarks,
        percentage,
        totalTimeSpentSeconds: totalTimeSpent,
        questionBreakdown,
        diagnosticMatrix: {
          masteredCount: mastered.length,
          recapCount: recap.length,
          weakCount: weak.length,
          mastered: mastered.map(m => m.subtopic),
          recap: recap.map(m => m.subtopic),
          weak: weak.map(m => m.subtopic)
        },
        weeklyReportId: updatedReport.id
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
