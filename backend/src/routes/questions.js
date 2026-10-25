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

// POST /api/questions/import-batch - Bulk import PYQs, NCERT exercise questions, and competitive mock banks
router.post('/import-batch', (req, res) => {
  try {
    const { questions = [], source = 'Teacher Import' } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Expected an array of question objects under "questions".'
      });
    }

    const imported = [];
    const skipped = [];

    questions.forEach((q, idx) => {
      if (!q.question_latex) {
        skipped.push({ index: idx, reason: 'Missing question_latex' });
        return;
      }

      const cleanQ = {
        id: q.id || `pyq_imp_${Date.now()}_${idx + 1}`,
        grade: String(q.grade || '10'),
        subject: q.subject || 'Science',
        chapter: q.chapter || q.topic || 'General Science',
        topic: q.topic || q.chapter || 'Core',
        subtopic: q.subtopic || (q.ncert_mapping ? q.ncert_mapping.ncert_section : 'General'),
        curriculum_board: q.curriculum_board || q.board || 'CBSE',
        difficulty: q.difficulty || 'MEDIUM',
        question_type: q.question_type || 'MCQ_SINGLE',
        bloom_level: q.bloom_level || 'APPLICATION',
        question_latex: q.question_latex,
        options_latex: q.options_latex || [],
        correct_answer_latex: q.correct_answer_latex || q.correct_answer || 'B',
        solution_latex: q.solution_latex || '',
        socratic_hints: q.socratic_hints || [],
        step_rubric: q.step_rubric || [],
        ncert_mapping: q.ncert_mapping || {
          chapter_name: q.chapter || 'Chapter',
          ncert_section: q.subtopic || 'General',
          pyq_tag: q.pyq_tag || source,
          marks: q.marks || 3
        },
        benchmark_time_seconds: Number(q.benchmark_time_seconds) || 90,
        imported_at: new Date().toISOString()
      };

      inMemoryStore.questions.push(cleanQ);
      imported.push(cleanQ);
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${imported.length} questions into the HAPS-AI Question Bank.`,
      importedCount: imported.length,
      skippedCount: skipped.length,
      skipped,
      sampleQuestionId: imported[0]?.id
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

