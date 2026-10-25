// ============================================================================
// HAPS-AI SCHOLAR ASSISTANT: CURRICULUM TAXONOMY & TOPIC EXPLORER ROUTER
// Hierarchical Navigation: Subject -> Chapter -> Topic / Subtopic
// ============================================================================

const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');
const { CURRICULUM_TAXONOMY, getSubjectTaxonomy, listAvailableSubjects } = require('../services/curriculumTaxonomy');
const { generateLlmQuestion } = require('../services/llmQuestionEngine');

// 1. GET /api/curriculum/subjects - List all available subject syllabi
router.get('/subjects', (req, res) => {
  try {
    const list = listAvailableSubjects();
    res.json({
      success: true,
      count: list.length,
      subjects: list
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /api/curriculum/taxonomy/:subjectKey - Full Chapter & Topic breakdown with question counts
router.get('/taxonomy/:subjectKey', (req, res) => {
  try {
    const { subjectKey } = req.params;
    const { grade } = req.query;

    const taxonomy = getSubjectTaxonomy(subjectKey);
    if (!taxonomy) {
      return res.status(404).json({
        success: false,
        error: `Subject "${subjectKey}" not found. Valid subjects: BIOLOGY, PHYSICS, CHEMISTRY, MATHEMATICS, CLASS10_SCIENCE, CLASS10_MATHEMATICS.`
      });
    }

    // Filter chapters by grade if specified
    let chapters = taxonomy.chapters;
    if (grade && grade !== 'ALL') {
      chapters = chapters.filter(ch => String(ch.grade) === String(grade));
    }

    // Gather all questions for this subject from inMemoryStore
    const banks = inMemoryStore.subjectBanks || {};
    const allQuestions = [...(inMemoryStore.questions || [])];
    Object.values(banks).forEach(arr => {
      if (Array.isArray(arr)) allQuestions.push(...arr);
    });

    // Enrich each chapter and topic with live question count
    const enrichedChapters = chapters.map(ch => {
      const chapterQuestions = allQuestions.filter(q => {
        const qChap = (q.chapter || q.chapter_name || '').toLowerCase();
        const tChap = ch.chapterName.toLowerCase();
        return qChap.includes(tChap) || tChap.includes(qChap);
      });

      const enrichedTopics = ch.topics.map(t => {
        const tLower = t.topicName.toLowerCase();
        const topicQuestions = chapterQuestions.filter(q => {
          const qTopic = (q.topic || '').toLowerCase();
          const qSubtopic = (q.subtopic || '').toLowerCase();
          const qText = `${qTopic} ${qSubtopic}`.toLowerCase();
          
          if (qText.includes(tLower) || tLower.includes(qTopic)) return true;
          if (qSubtopic && tLower.includes(qSubtopic)) return true;
          if (t.ncertSection && q.ncert_mapping?.ncert_section?.includes(t.ncertSection)) return true;

          // Keyword matches for specific high-yield syllabus topics
          if (tLower.includes('lac operon') && qText.includes('lac operon')) return true;
          if (tLower.includes('replication') && qText.includes('replication')) return true;
          if (tLower.includes('dihybrid cross') && qText.includes('dihybrid cross')) return true;
          if (tLower.includes('counter-current') && qText.includes('counter-current')) return true;
          if (tLower.includes('pbr322') && qText.includes('pbr322')) return true;
          if (tLower.includes('fluid mosaic') && qText.includes('fluid mosaic')) return true;
          if (tLower.includes('mirror') && qText.includes('mirror')) return true;
          if (tLower.includes('nernst') && qText.includes('nernst')) return true;
          if (tLower.includes('rotational') && qText.includes('rotational')) return true;

          // Check subtopics list
          if (t.subtopics && Array.isArray(t.subtopics)) {
            const matchesSubtopic = t.subtopics.some(st => {
              const stLower = st.toLowerCase();
              return qText.includes(stLower) || stLower.includes(qTopic) || (qSubtopic && stLower.includes(qSubtopic));
            });
            if (matchesSubtopic) return true;
          }

          return false;
        });

        return {
          ...t,
          questionCount: topicQuestions.length,
          sampleQuestions: topicQuestions.slice(0, 3).map(sq => ({
            id: sq.id,
            question_latex: sq.question_latex,
            difficulty: sq.difficulty,
            benchmark_time_seconds: sq.benchmark_time_seconds,
            pyq_tag: sq.pyq_appearance || (sq.ncert_mapping ? sq.ncert_mapping.pyq_tag : 'Practice Question')
          }))
        };
      });

      const totalQInChapter = enrichedTopics.reduce((acc, t) => acc + t.questionCount, 0);

      return {
        ...ch,
        totalTopics: ch.topics.length,
        totalQuestionsInChapter: totalQInChapter,
        topics: enrichedTopics
      };
    });

    res.json({
      success: true,
      subjectKey: subjectKey.toUpperCase(),
      subjectName: taxonomy.subjectName,
      stream: taxonomy.stream,
      targetExams: taxonomy.targetExams,
      units: taxonomy.units || [],
      boardHighYieldSummary: taxonomy.boardHighYieldSummary || null,
      totalChapters: enrichedChapters.length,
      chapters: enrichedChapters
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. GET /api/curriculum/questions - Fetch questions under a specific chapter or topic
router.get('/questions', (req, res) => {
  try {
    const { subject, chapter, topic, grade } = req.query;

    const banks = inMemoryStore.subjectBanks || {};
    const allQuestions = [...(inMemoryStore.questions || [])];
    Object.values(banks).forEach(arr => {
      if (Array.isArray(arr)) allQuestions.push(...arr);
    });

    // Deduplicate
    const seen = new Set();
    const uniquePool = [];
    allQuestions.forEach(q => {
      const key = q.id || q.question_latex?.slice(0, 40);
      if (!seen.has(key)) {
        seen.add(key);
        uniquePool.push(q);
      }
    });

    let filtered = uniquePool;

    if (grade && grade !== 'ALL') {
      filtered = filtered.filter(q => String(q.grade) === String(grade));
    }

    if (subject && subject !== 'ALL') {
      filtered = filtered.filter(q => 
        (q.subject && q.subject.toLowerCase().includes(subject.toLowerCase())) ||
        (q.discipline && q.discipline.toLowerCase().includes(subject.toLowerCase()))
      );
    }

    if (chapter && chapter !== 'ALL') {
      filtered = filtered.filter(q => {
        const qChap = (q.chapter || q.chapter_name || q.topic || '').toLowerCase();
        return qChap.includes(chapter.toLowerCase());
      });
    }

    if (topic && topic !== 'ALL') {
      filtered = filtered.filter(q => {
        const qTop = (q.subtopic || q.topic || '').toLowerCase();
        return qTop.includes(topic.toLowerCase());
      });
    }

    res.json({
      success: true,
      count: filtered.length,
      questions: filtered
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/curriculum/generate-topic-question - Generate question for a specific chapter/topic
router.post('/generate-topic-question', async (req, res) => {
  try {
    const {
      grade = '11',
      subject = 'Biology',
      chapter = 'Molecular Basis of Inheritance',
      topic = 'DNA Replication',
      difficulty = 'MEDIUM',
      board = 'NEET'
    } = req.body;

    console.log(`[CURRICULUM AI] Synthesizing question for ${subject} -> ${chapter} -> ${topic} (${board})...`);

    const freshQ = await generateLlmQuestion({
      grade: String(grade),
      subject,
      chapter: `${chapter} – ${topic}`,
      board,
      difficulty,
      questionType: board.includes('JEE') ? 'NUMERICAL' : 'MCQ_SINGLE',
      provider: 'auto'
    });

    const cleanQ = {
      ...freshQ,
      id: `q_tax_${Date.now()}`,
      grade: String(grade),
      subject,
      chapter,
      topic,
      subtopic: topic,
      curriculum_board: board,
      pyq_appearance: `${board} Syllabus Grounded Question (Generated by HAPS-AI)`
    };

    // Save into inMemoryStore so it appears in the taxonomy tree
    inMemoryStore.questions.push(cleanQ);

    res.status(201).json({
      success: true,
      message: `Generated targeted question for ${subject} -> ${chapter} -> ${topic}.`,
      question: cleanQ
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
