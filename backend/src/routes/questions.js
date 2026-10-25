const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');
const { generateAiQuestion } = require('../services/aiPromptEngine');

// GET all questions from bank
router.get('/', (req, res) => {
  const { subject, topic, board } = req.query;
  let results = inMemoryStore.questions;

  if (subject) results = results.filter(q => q.topic && q.topic.toLowerCase().includes(subject.toLowerCase()));
  if (board) results = results.filter(q => q.curriculum_board === board);

  res.json({
    success: true,
    count: results.length,
    questions: results
  });
});

// POST generate new AI question in clean LaTeX
router.post('/generate-ai', async (req, res) => {
  try {
    const { grade, subject, topic, subtopic, board, difficulty, questionType } = req.body;
    const newQuestion = await generateAiQuestion({
      grade,
      subject,
      topic,
      subtopic,
      board,
      difficulty,
      questionType
    });

    // Add to in-memory question bank
    inMemoryStore.questions.push(newQuestion);

    res.status(201).json({
      success: true,
      message: 'AI question generated in clean LaTeX format.',
      question: newQuestion
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
