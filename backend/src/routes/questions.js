const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');
const { generateAiQuestion } = require('../services/aiPromptEngine');
const { generateLlmQuestion } = require('../services/llmQuestionEngine');
const { getAllClass10Questions, getCuratedClass10Question } = require('../services/class10PyqBank');

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

// GET LLM Providers configuration status
router.get('/providers', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  const hasGroq = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 5);

  res.json({
    success: true,
    providers: {
      groq: {
        configured: hasGroq,
        model: 'llama-3.3-70b-versatile',
        engine: 'Groq LPU Inference Engine',
        speed: '~350ms'
      },
      gemini: {
        configured: hasGemini,
        model: 'gemini-1.5-flash',
        engine: 'Google Gemini 1.5 Flash',
        speed: '~1200ms'
      },
      ncert_pyq: {
        configured: true,
        model: 'NCERT & Board PYQ Database (2020-2024)',
        engine: 'Class 10 CBSE & HPBOSE Curated Bank',
        speed: '<10ms'
      }
    }
  });
});

// GET Class 10 NCERT Mapped Previous Year Question Bank
router.get('/class10-pyq', (req, res) => {
  const { subject, chapter, board, search } = req.query;
  let results = getAllClass10Questions();

  if (subject && subject !== 'ALL') {
    results = results.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
  }
  if (chapter && chapter !== 'ALL') {
    results = results.filter(q => q.chapter.toLowerCase().includes(chapter.toLowerCase()));
  }
  if (board && board !== 'ALL') {
    results = results.filter(q => q.ncert_mapping && q.ncert_mapping.pyq_tag.toLowerCase().includes(board.toLowerCase()));
  }
  if (search) {
    const term = search.toLowerCase();
    results = results.filter(q => 
      q.chapter.toLowerCase().includes(term) ||
      q.question_latex.toLowerCase().includes(term) ||
      (q.ncert_mapping && q.ncert_mapping.ncert_section.toLowerCase().includes(term)) ||
      (q.ncert_mapping && q.ncert_mapping.pyq_tag.toLowerCase().includes(term))
    );
  }

  res.json({
    success: true,
    count: results.length,
    grade: "10",
    curriculum: "NCERT & State Boards (CBSE & HPBOSE)",
    questions: results
  });
});

// POST generate new AI question in clean LaTeX (Legacy Engine)
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

// POST generate new question using Multi-LLM Engine (Gemini 1.5 / Groq Llama-3.3 / Auto NCERT)
router.post('/generate-llm', async (req, res) => {
  try {
    const {
      grade = '10',
      subject = 'Science',
      chapter = 'Light – Reflection and Refraction',
      ncertSection = '9.2 Spherical Mirrors and Mirror Formula',
      board = 'CBSE',
      difficulty = 'MEDIUM',
      questionType = 'NUMERICAL',
      provider = 'auto'
    } = req.body;

    const newQuestion = await generateLlmQuestion({
      grade,
      subject,
      chapter,
      ncertSection,
      board,
      difficulty,
      questionType,
      provider
    });

    // Store generated question in the question bank for classroom tests
    inMemoryStore.questions.push({
      id: newQuestion.id,
      topic: `${newQuestion.subject || subject} - ${newQuestion.chapter || chapter}`,
      difficulty: newQuestion.difficulty || difficulty || 'MEDIUM',
      curriculum_board: newQuestion.curriculum_board || board || 'CBSE',
      question_latex: newQuestion.question_latex,
      options_latex: newQuestion.options_latex,
      correct_answer_latex: newQuestion.correct_answer_latex,
      solution_latex: newQuestion.solution_latex,
      socratic_hints: newQuestion.socratic_hints,
      step_rubric: newQuestion.step_rubric,
      ncert_mapping: newQuestion.ncert_mapping,
      llm_provider: newQuestion.llm_provider,
      inference_time_ms: newQuestion.inference_time_ms,
      benchmark_time_seconds: newQuestion.benchmark_time_seconds || 120
    });

    res.status(201).json({
      success: true,
      message: `Generated question successfully using ${newQuestion.llm_provider}`,
      question: newQuestion
    });
  } catch (err) {
    console.error('[API QUESTIONS GENERATE-LLM ERROR]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

