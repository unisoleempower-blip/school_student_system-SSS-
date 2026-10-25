const express = require('express');
const router = express.Router();
const { processHandwrittenImage } = require('../services/geminiVisionService');
const { inMemoryStore } = require('../config/database');
const { emitEvent } = require('../kafka/producer');

// POST upload and analyze handwritten answer sheet
router.post('/handwritten-sheet', async (req, res) => {
  try {
    const {
      imageData, // Base64 data URL
      studentId = 'b0000000-0000-0000-0000-000000000001',
      questionId = 'c0000000-0000-0000-0000-000000000002',
      subject = 'Physics'
    } = req.body;

    if (!imageData) {
      return res.status(400).json({ success: false, error: 'No image data provided for handwritten evaluation.' });
    }

    // Process with Vision AI service
    const evaluation = await processHandwrittenImage({
      imageData,
      studentId,
      questionId,
      subject
    });

    // Save to in-memory store
    inMemoryStore.handwrittenSubmissions.unshift(evaluation);

    // Stream telemetry event to Kafka
    await emitEvent('telemetry.handwritten-scan', studentId, {
      action: 'HandwrittenScanCompleted',
      evaluationId: evaluation.evaluationId,
      totalMarks: evaluation.totalMarksAwarded,
      errorType: evaluation.errorClassification
    });

    res.status(200).json({
      success: true,
      message: 'Handwritten sheet analyzed successfully by Gemini Vision AI.',
      evaluation
    });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
