// ==============================================================================
// HAPS-AI SCHOLAR ASSISTANT: PEDAGOGICAL PIPELINE TOOLS
// Explicit Tool Abstractions for Clean Context Management:
// 1. quizTool: Rapid MCQ Speed Drills & Retrieval Practice
// 2. testTool: Formal NTA-Style Diagnostic Assessments & Evaluation
// 3. assignmentTool: Personalized Remedial Assignments & Word DOCX Exporters
// ==============================================================================

const { inMemoryStore } = require('../config/database');
const { ensureQuestionHasRichOptions } = require('./questionOptionEngine');
const { generatePersonalizedRemedialAssignment, verifyStudentFormula, FORMULA_REPOSITORY } = require('./remedialAssignmentService');
const { generateAssignmentDocxBuffer } = require('./docxExportService');
const { generateLlmQuestion } = require('./llmQuestionEngine');

/**
 * Normalizes subject and subjectKey to canonical values
 */
function resolveCanonicalSubject(subjectName = '', subjectKey = '', grade = '12') {
  const sName = (subjectName || '').toLowerCase().trim();
  const sKey = (subjectKey || '').toUpperCase().trim();

  if (sName.includes('bio') || sKey.includes('BIO')) {
    return { canonicalSubject: 'Biology', resolvedKey: 'BIOLOGY', stream: 'MEDICAL', defaultBankKey: 'senior_biology' };
  }
  if (sName.includes('chem') || sKey.includes('CHEM')) {
    return { canonicalSubject: 'Chemistry', resolvedKey: 'CHEMISTRY', stream: 'SCIENCE', defaultBankKey: 'senior_chemistry' };
  }
  if (sName.includes('math') || sKey.includes('MATH')) {
    const is10 = String(grade) === '10';
    return {
      canonicalSubject: 'Mathematics',
      resolvedKey: is10 ? 'CLASS10_MATHEMATICS' : 'MATHEMATICS',
      stream: is10 ? 'FOUNDATION' : 'NON_MEDICAL',
      defaultBankKey: is10 ? 'class10_maths' : 'senior_mathematics'
    };
  }
  if (sName.includes('phys') || sKey.includes('PHYS')) {
    return { canonicalSubject: 'Physics', resolvedKey: 'PHYSICS', stream: 'SCIENCE', defaultBankKey: 'senior_physics' };
  }
  if (String(grade) === '10' && (sName.includes('sci') || sKey.includes('SCI'))) {
    return { canonicalSubject: 'Science', resolvedKey: 'CLASS10_SCIENCE', stream: 'FOUNDATION', defaultBankKey: 'class10_science' };
  }

  return { canonicalSubject: subjectName || 'Physics', resolvedKey: subjectKey || 'PHYSICS', stream: 'GENERAL', defaultBankKey: 'senior_physics' };
}

// ==============================================================================
// TOOL 1: QUIZ TOOL
// Specialized in speed retrieval, 3-10 questions, strict topic focus, instant options
// ==============================================================================
const quizTool = {
  name: 'quizTool',
  description: 'Generates and evaluates high-yield speed quizzes with strict subject and chapter isolation.',

  async createQuiz({
    grade = '12',
    section = '12-Med',
    subjectName = 'Biology',
    subjectKey = 'BIOLOGY',
    chapterNumber = 1,
    chapterName = 'Sexual Reproduction in Flowering Plants',
    subtopics = [],
    questionCount = 5,
    difficulty = 'MEDIUM',
    title = null
  }) {
    const { canonicalSubject, resolvedKey, defaultBankKey } = resolveCanonicalSubject(subjectName, subjectKey, grade);
    const count = Math.min(15, Math.max(1, Number(questionCount) || 5));
    const banks = inMemoryStore.subjectBanks || {};
    const targetBank = banks[defaultBankKey] || [];

    // Filter strictly within target subject pool
    const subjectPool = [
      ...targetBank,
      ...(inMemoryStore.questions || []).filter(q => {
        const qSub = (q.subject || '').toLowerCase();
        const qKey = (q.subjectKey || '').toUpperCase();
        return qSub === canonicalSubject.toLowerCase() || qKey === resolvedKey;
      })
    ];

    const targetChap = (chapterName || '').toLowerCase().trim();
    let matchingQuestions = subjectPool.filter(q => {
      const qChap = (q.chapter || q.chapter_name || '').toLowerCase().trim();
      return qChap === targetChap || qChap.includes(targetChap) || targetChap.includes(qChap);
    });

    if (subtopics && subtopics.length > 0 && matchingQuestions.length > 0) {
      const subtopicMatches = matchingQuestions.filter(q => {
        const qTopic = (q.subtopic || q.topic || '').toLowerCase();
        return subtopics.some(sub => qTopic.includes(sub.toLowerCase()) || sub.toLowerCase().includes(qTopic));
      });
      if (subtopicMatches.length > 0) matchingQuestions = subtopicMatches;
    }

    if (matchingQuestions.length === 0) {
      console.log(`[QUIZ TOOL] Using broad ${canonicalSubject} pool for chapter: ${chapterName}`);
      matchingQuestions = subjectPool;
    }

    // Deduplicate
    const seen = new Set();
    const curatedQuestions = [];
    matchingQuestions.forEach(q => {
      const key = q.id || q.question_latex || q.questionText;
      if (!seen.has(key)) {
        seen.add(key);
        curatedQuestions.push(q);
      }
    });

    const selectedQuestions = curatedQuestions.sort(() => 0.5 - Math.random()).slice(0, count);

    // If more questions needed, fill from the SAME subject pool
    if (selectedQuestions.length < count && subjectPool.length > selectedQuestions.length) {
      const remainingPool = subjectPool.filter(q => !seen.has(q.id || q.question_latex || q.questionText));
      while (selectedQuestions.length < count && remainingPool.length > 0) {
        const picked = remainingPool.splice(Math.floor(Math.random() * remainingPool.length), 1)[0];
        seen.add(picked.id || picked.question_latex || picked.questionText);
        selectedQuestions.push(picked);
      }
    }

    // Ensure 100% of questions have rich, authentic, subject-appropriate options
    selectedQuestions.forEach(q => {
      q.subject = canonicalSubject;
      q.subjectKey = resolvedKey;
      ensureQuestionHasRichOptions(q);
    });

    const quizTitle = title || `Class ${grade} ${canonicalSubject}: ${chapterName} Speed Quiz`;
    const newQuiz = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: quizTitle,
      description: `Rapid 2-minute-per-question retrieval quiz on ${chapterName} (${canonicalSubject}).`,
      grade: String(grade),
      section,
      subject: canonicalSubject,
      subjectKey: resolvedKey,
      chapterName,
      subtopics,
      mode: 'QUIZ',
      durationMinutes: count * 2,
      totalMarks: count * 4,
      totalQuestions: selectedQuestions.length,
      questions: selectedQuestions,
      createdAt: new Date().toISOString()
    };

    if (!inMemoryStore.assessments) inMemoryStore.assessments = [];
    inMemoryStore.assessments.unshift(newQuiz);

    return newQuiz;
  }
};

// ==============================================================================
// TOOL 2: TEST TOOL
// Specialized in formal diagnostic tests, NTA marking scheme, full telemetry
// ==============================================================================
const testTool = {
  name: 'testTool',
  description: 'Generates and evaluates formal diagnostic tests with NTA marking schemes and Bloom cognitive classification.',

  async createTest({
    grade = '12',
    section = '12-NonMed',
    subjectName = 'Physics',
    subjectKey = 'PHYSICS',
    chapterNumber = 1,
    chapterName = 'Electric Charges and Fields',
    subtopics = [],
    questionCount = 10,
    difficulty = 'MEDIUM',
    title = null
  }) {
    const { canonicalSubject, resolvedKey, defaultBankKey } = resolveCanonicalSubject(subjectName, subjectKey, grade);
    const count = Math.min(30, Math.max(1, Number(questionCount) || 10));
    const banks = inMemoryStore.subjectBanks || {};
    const targetBank = banks[defaultBankKey] || [];

    const subjectPool = [
      ...targetBank,
      ...(inMemoryStore.questions || []).filter(q => {
        const qSub = (q.subject || '').toLowerCase();
        const qKey = (q.subjectKey || '').toUpperCase();
        return qSub === canonicalSubject.toLowerCase() || qKey === resolvedKey;
      })
    ];

    const targetChap = (chapterName || '').toLowerCase().trim();
    let matchingQuestions = subjectPool.filter(q => {
      const qChap = (q.chapter || q.chapter_name || '').toLowerCase().trim();
      return qChap === targetChap || qChap.includes(targetChap) || targetChap.includes(qChap);
    });

    if (subtopics && subtopics.length > 0 && matchingQuestions.length > 0) {
      const subtopicMatches = matchingQuestions.filter(q => {
        const qTopic = (q.subtopic || q.topic || '').toLowerCase();
        return subtopics.some(sub => qTopic.includes(sub.toLowerCase()) || sub.toLowerCase().includes(qTopic));
      });
      if (subtopicMatches.length > 0) matchingQuestions = subtopicMatches;
    }

    if (matchingQuestions.length === 0) {
      console.log(`[TEST TOOL] Using broad ${canonicalSubject} pool for chapter: ${chapterName}`);
      matchingQuestions = subjectPool;
    }

    const seen = new Set();
    const curatedQuestions = [];
    matchingQuestions.forEach(q => {
      const key = q.id || q.question_latex || q.questionText;
      if (!seen.has(key)) {
        seen.add(key);
        curatedQuestions.push(q);
      }
    });

    const selectedQuestions = curatedQuestions.sort(() => 0.5 - Math.random()).slice(0, count);

    // If more questions needed, fill from same subject pool
    if (selectedQuestions.length < count && subjectPool.length > selectedQuestions.length) {
      const remainingPool = subjectPool.filter(q => !seen.has(q.id || q.question_latex || q.questionText));
      while (selectedQuestions.length < count && remainingPool.length > 0) {
        const picked = remainingPool.splice(Math.floor(Math.random() * remainingPool.length), 1)[0];
        seen.add(picked.id || picked.question_latex || picked.questionText);
        selectedQuestions.push(picked);
      }
    }

    // Ensure 100% of questions have rich, authentic options
    selectedQuestions.forEach(q => {
      q.subject = canonicalSubject;
      q.subjectKey = resolvedKey;
      ensureQuestionHasRichOptions(q);
    });

    const testTitle = title || `Class ${grade} ${canonicalSubject}: ${chapterName} Diagnostic Test`;
    const newTest = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: testTitle,
      description: `Formal Diagnostic Assessment for ${canonicalSubject} – ${chapterName}. Total ${selectedQuestions.length} Questions (+4 Marks, -1 Negative).`,
      grade: String(grade),
      section,
      subject: canonicalSubject,
      subjectKey: resolvedKey,
      chapterName,
      subtopics,
      mode: 'TEST',
      durationMinutes: count * 3,
      totalMarks: count * 4,
      totalQuestions: selectedQuestions.length,
      questions: selectedQuestions,
      createdAt: new Date().toISOString()
    };

    if (!inMemoryStore.assessments) inMemoryStore.assessments = [];
    inMemoryStore.assessments.unshift(newTest);

    return newTest;
  }
};

// ==============================================================================
// TOOL 3: ASSIGNMENT TOOL
// Specialized in context-grounded remedial assignments, formula write-ins, docx export
// ==============================================================================
const assignmentTool = {
  name: 'assignmentTool',
  description: 'Generates personalized remedial assignments and homework worksheets with strict context preservation and plain Word (.docx) export.',

  /**
   * Generates a personalized remedial assignment strictly bound to the source test subject
   */
  generateRemedialAssignment({
    studentId = 'b0000000-0000-0000-0000-000000000001',
    studentName = 'Aryan Sharma',
    rollNumber = '11-S-24',
    assessmentId = 'asgn_01',
    assessmentTitle = 'Classroom Assessment',
    subject = 'Biology',
    subjectKey = 'BIOLOGY',
    grade = '12',
    chapterName = '',
    questionBreakdown = []
  }) {
    const { canonicalSubject, resolvedKey } = resolveCanonicalSubject(subject, subjectKey, grade);

    return generatePersonalizedRemedialAssignment({
      studentId,
      studentName,
      rollNumber,
      assessmentId,
      assessmentTitle,
      subject: canonicalSubject,
      subjectKey: resolvedKey,
      grade: String(grade),
      chapterName,
      questionBreakdown
    });
  },

  /**
   * Verifies formula/equation/principle input from student with real-time feedback
   */
  verifyFormula(subtopic, studentInput, subject = 'Biology') {
    return verifyStudentFormula(subtopic, studentInput, subject);
  },

  /**
   * Exports an assignment or worksheet as a plain Microsoft Word (.docx) buffer
   */
  async exportToDocx(assignmentPayload) {
    return generateAssignmentDocxBuffer(assignmentPayload);
  }
};

module.exports = {
  resolveCanonicalSubject,
  quizTool,
  testTool,
  assignmentTool
};
