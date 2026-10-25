const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');
const { evaluateHandwrittenSheet } = require('../services/handwrittenEvaluator');
const { emitEvent } = require('../kafka/producer');

// GET all handwritten submissions
router.get('/submissions', (req, res) => {
  res.json({
    success: true,
    count: inMemoryStore.handwrittenSubmissions.length,
    submissions: inMemoryStore.handwrittenSubmissions
  });
});

// POST evaluate scanned handwritten answer sheet
router.post('/evaluate', async (req, res) => {
  try {
    const { studentId, questionId, sheetImageUrl, customRubric } = req.body;
    
    // Run evaluation pipeline
    const evaluation = await evaluateHandwrittenSheet({
      studentId,
      questionId,
      sheetImageUrl,
      customRubric
    });

    // Store in submission records
    inMemoryStore.handwrittenSubmissions.unshift(evaluation);

    // Emit event to Kafka
    await emitEvent('telemetry.handwritten-scan', studentId || 'b0000000-0000-0000-0000-000000000001', {
      action: 'HandwrittenSheetEvaluated',
      submissionId: evaluation.submissionId,
      totalMarks: evaluation.totalMarksAwarded,
      errorType: evaluation.errorType
    });

    res.status(201).json({
      success: true,
      message: 'Handwritten sheet evaluated successfully with step-by-step rubric grading.',
      evaluation
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST teacher audit override
router.post('/:id/override', (req, res) => {
  const { id } = req.params;
  const { teacherAdjustedMarks, teacherComments } = req.body;

  const submission = inMemoryStore.handwrittenSubmissions.find(s => s.id === id || s.submissionId === id);
  if (!submission) {
    return res.status(404).json({ success: false, error: 'Submission not found' });
  }

  submission.teacher_verified = true;
  submission.teacherVerified = true;
  if (teacherAdjustedMarks !== undefined) {
    submission.totalMarksAwarded = Number(teacherAdjustedMarks);
  }
  if (teacherComments) {
    submission.teacher_comments = teacherComments;
    submission.teacherComments = teacherComments;
  }

  res.json({
    success: true,
    message: 'Teacher verification and marks override saved.',
    submission
  });
});

module.exports = router;
