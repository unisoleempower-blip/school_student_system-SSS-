const express = require('express');
const router = express.Router();
const { emitEvent, getRecentEvents } = require('../kafka/producer');
const { processTelemetryEvent } = require('../kafka/consumer');
const { inMemoryStore } = require('../config/database');

// Ingest sub-second telemetry (timer ticks, option selection, attempt submission)
router.post('/record', async (req, res) => {
  try {
    const {
      studentId = 'b0000000-0000-0000-0000-000000000001',
      questionId,
      timeSpentSeconds,
      attemptStatus, // 'CORRECT', 'INCORRECT', 'PARTIAL', 'UNATTEMPTED'
      selectedOption,
      topic,
      subtopic,
      benchmarkSeconds = 120,
      hintsUsed = 0,
      hesitationSeconds = 0
    } = req.body;

    const payload = {
      action: 'QuestionTelemetryRecorded',
      studentId,
      questionId,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      attemptStatus: attemptStatus || 'CORRECT',
      selectedOption,
      topic: topic || 'Rotational Motion',
      subtopic: subtopic || 'Moment of Inertia',
      benchmarkSeconds: Number(benchmarkSeconds) || 120,
      hintsUsed: Number(hintsUsed) || 0,
      hesitationSeconds: Number(hesitationSeconds) || 0
    };

    // 1. Publish event to Kafka stream topic
    const event = await emitEvent('telemetry.question-timer', studentId, payload);

    // 2. Process telemetry locally to update concept mastery
    processTelemetryEvent(event);

    // 3. Record in store
    inMemoryStore.telemetry.push({
      id: `tel_${Date.now()}`,
      ...payload,
      recordedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Sub-second telemetry captured and streamed to Kafka.',
      event
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// View recent Kafka event bus logs
router.get('/events', (req, res) => {
  res.json({
    success: true,
    events: getRecentEvents()
  });
});

module.exports = router;
