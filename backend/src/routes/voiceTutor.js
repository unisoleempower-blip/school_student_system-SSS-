const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');
const {
  generateHinglishAudioBrief,
  answerStudentInterruption,
  synthesizeNeuralAudio,
  NEURAL_VOICES
} = require('../services/aiVoiceTutorService');

/**
 * GET /api/voice-tutor/audio
 * Streams ultra-realistic human neural MP3 audio
 * Query params: ?text=...&voice=swara
 */
router.get('/audio', async (req, res) => {
  try {
    const text = (req.query.text || '').trim();
    const voice = req.query.voice || 'swara';

    if (!text) {
      return res.status(400).json({ success: false, error: 'text query parameter is required' });
    }

    const { buffer, voice: voiceUsed, fromCache } = await synthesizeNeuralAudio({
      text,
      voiceKey: voice
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('X-Voice-Used', voiceUsed);
    res.setHeader('X-From-Cache', fromCache ? 'true' : 'false');
    res.send(buffer);
  } catch (err) {
    console.error('[VOICE TUTOR AUDIO ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/voice-tutor/synthesize
 * Body: { text, voice }
 * Returns base64 data-uri for direct browser playback
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text = '', voice = 'swara' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'text is required' });
    }

    const { buffer, voice: voiceUsed, fromCache } = await synthesizeNeuralAudio({
      text: text.trim(),
      voiceKey: voice
    });

    res.json({
      success: true,
      voice: voiceUsed,
      fromCache,
      mimeType: 'audio/mpeg',
      audioDataUri: `data:audio/mpeg;base64,${buffer.toString('base64')}`
    });
  } catch (err) {
    console.error('[VOICE TUTOR SYNTHESIZE ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/voice-tutor/explain
 * Request body: { questionId, questionText, solutionText, chapterName, topic, voice }
 * Returns spoken question, Hinglish audio brief, and human neural audio URL
 */
router.post('/explain', async (req, res) => {
  try {
    const {
      questionId = 'q_active',
      questionText = '',
      solutionText = '',
      chapterName = '',
      topic = '',
      voice = 'swara'
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

    const audioUrl = `/api/voice-tutor/audio?text=${encodeURIComponent(brief.hinglishBrief)}&voice=${encodeURIComponent(voice)}`;
    const questionAudioUrl = `/api/voice-tutor/audio?text=${encodeURIComponent(brief.cleanSpokenQuestion)}&voice=neerja`;

    const payload = {
      ...brief,
      audioUrl,
      questionAudioUrl,
      availableVoices: Object.keys(NEURAL_VOICES)
    };

    res.json({
      success: true,
      ...payload,
      data: payload
    });
  } catch (err) {
    console.error('[VOICE TUTOR ROUTE ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/voice-tutor/interrupt
 * Handles student voice doubt / interruption while question is playing
 * Request body: { questionText, solutionText, studentDoubt, conversationHistory, voice }
 */
router.post('/interrupt', async (req, res) => {
  try {
    const {
      questionText = '',
      solutionText = '',
      studentDoubt = '',
      conversationHistory = [],
      voice = 'swara'
    } = req.body;

    const answer = await answerStudentInterruption({
      questionText,
      solutionText,
      studentDoubt,
      conversationHistory
    });

    const audioUrl = `/api/voice-tutor/audio?text=${encodeURIComponent(answer.answerHinglish)}&voice=${encodeURIComponent(voice)}`;

    const payload = {
      ...answer,
      audioUrl
    };

    res.json({
      success: true,
      ...payload,
      data: payload
    });
  } catch (err) {
    console.error('[VOICE TUTOR INTERRUPT ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

