const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');
const {
  generateHinglishAudioBrief,
  answerStudentInterruption
} = require('../services/aiVoiceTutorService');

/**
 * POST /api/voice-tutor/explain
 * Request body: { questionId, questionText, solutionText, chapterName, topic }
 * Returns spoken question and Hinglish audio brief
 */
router.post('/explain', async (req, res) => {
  try {
    const {
      questionId = 'q_active',
      questionText = '',
      solutionText = '',
      chapterName = '',
      topic = ''
    } = req.body;

    // Look up question in memory store if questionText not directly supplied
    let qText = questionText;
    let sText = solutionText;
    let ch = chapterName;
    let top = topic;

    if (!qText && questionId) {
      const allBanks = Object.values(inMemoryStore.subjectBanks || {});
      for (const bank of allBanks) {
        if (Array.isArray(bank)) {
          const match = bank.find(item => item.id === questionId);
          if (match) {
            qText = match.question_latex || match.questionText || '';
            sText = match.solution_latex || '';
            ch = match.chapter_name || match.chapter || '';
            top = match.topic || match.subtopic || '';
            break;
          }
        }
      }
    }

    const brief = await generateHinglishAudioBrief({
      questionId,
      questionText: qText,
      solutionText: sText,
      chapterName: ch,
      topic: top
    });

    res.json({
      success: true,
      ...brief,
      data: brief
    });
  } catch (err) {
    console.error('[VOICE TUTOR ROUTE ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/voice-tutor/interrupt
 * Handles student voice doubt / interruption while question is playing
 * Request body: { questionText, solutionText, studentDoubt, conversationHistory }
 */
router.post('/interrupt', async (req, res) => {
  try {
    const {
      questionText = '',
      solutionText = '',
      studentDoubt = '',
      conversationHistory = []
    } = req.body;

    const answer = await answerStudentInterruption({
      questionText,
      solutionText,
      studentDoubt,
      conversationHistory
    });

    res.json({
      success: true,
      ...answer,
      data: answer
    });
  } catch (err) {
    console.error('[VOICE TUTOR INTERRUPT ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
