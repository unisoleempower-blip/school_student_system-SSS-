// ============================================================================
// HAPS-AI SCHOLAR ASSISTANT: EXAM PATTERN ANALYZER & TEST GENERATION ENGINE
// AI-Driven Blueprint Synthesis for:
//   - Class 10 Foundation (Maths, Science: CBSE & HPBOSE)
//   - Class 11 & 12 Non-Medical (Physics, Chemistry, Maths -> JEE Main / Advanced)
//   - Class 11 & 12 Medical (Physics, Chemistry, Biology -> NEET UG)
// ============================================================================

const { generateLlmQuestion } = require('./llmQuestionEngine');

// 1. Official Exam Blueprint Library
const EXAM_BLUEPRINTS = {
  // --------------------------------------------------------------------------
  // JEE MAIN (Class 11 & 12 Non-Medical)
  // --------------------------------------------------------------------------
  'JEE_MAIN_NON_MED': {
    examId: 'JEE_MAIN_NON_MED',
    name: 'JEE Main (Non-Medical Stream: PCM)',
    grade: '11_12',
    stream: 'NON_MEDICAL',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    defaultBenchmarkSeconds: 120,
    quickMockQuestionCount: 9, // 3 Phys, 3 Chem, 3 Maths for quick diagnostic
    fullExamQuestionCount: 90, // 30 Phys, 30 Chem, 30 Maths (75 to attempt)
    sections: [
      { name: 'Section A (MCQ)', type: 'MCQ_SINGLE', marksPerQuestion: 4, negative: -1, description: 'Single correct option' },
      { name: 'Section B (Numerical)', type: 'NUMERICAL_INTEGER', marksPerQuestion: 4, negative: -1, description: 'Numerical value answer (round to nearest integer)' }
    ],
    highYieldTopics: {
      Physics: ['Rotational Motion', 'Work, Energy & Power', 'Electrostatics & Gauss Law', 'Current Electricity', 'Current & Magnetism', 'Modern Physics & Semiconductors'],
      Chemistry: ['Chemical Thermodynamics', 'Chemical Equilibrium', 'Coordination Compounds', 'Aldehydes, Ketones & Carboxylic Acids', 'Chemical Kinetics', 'Solutions'],
      Mathematics: ['Definite Integration & Areas', 'Differential Equations', 'Matrices & Determinants', 'Vectors & 3D Geometry', 'Coordinate Geometry (Conics)', 'Probability & Binomial']
    }
  },

  // --------------------------------------------------------------------------
  // NEET UG (Class 11 & 12 Medical)
  // --------------------------------------------------------------------------
  'NEET_UG_MED': {
    examId: 'NEET_UG_MED',
    name: 'NEET UG (Medical Stream: PCB)',
    grade: '11_12',
    stream: 'MEDICAL',
    subjects: ['Physics', 'Chemistry', 'Biology_Botany', 'Biology_Zoology'],
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    defaultBenchmarkSeconds: 60,
    quickMockQuestionCount: 12, // 3 Phys, 3 Chem, 3 Botany, 3 Zoology
    fullExamQuestionCount: 200, // 180 to attempt
    sections: [
      { name: 'Section A (Core NCERT MCQs)', type: 'MCQ_SINGLE', marksPerQuestion: 4, negative: -1, description: 'Direct NCERT factual & conceptual queries' },
      { name: 'Section B (Analytical & Statement MCQs)', type: 'ASSERTION_REASON', marksPerQuestion: 4, negative: -1, description: 'Assertion-Reason and multi-statement evaluations' }
    ],
    highYieldTopics: {
      Physics: ['Optics (Ray & Wave)', 'Thermodynamics & Kinetic Theory', 'Current Electricity', 'Semiconductor Electronics', 'Dual Nature of Matter'],
      Chemistry: ['General Organic Chemistry (GOC)', 'Equilibrium', 'Coordination Chemistry', 'Biomolecules & Polymers', 'Electrochemistry'],
      Biology_Botany: ['Genetics: Principles of Inheritance', 'Molecular Basis of Inheritance', 'Plant Physiology (Photosynthesis)', 'Ecology & Environment', 'Sexual Reproduction in Flowering Plants'],
      Biology_Zoology: ['Human Physiology (Neural & Chemical Control)', 'Human Reproduction & Reproductive Health', 'Biotechnology: Principles & Processes', 'Evolution & Animal Kingdom']
    }
  },

  // --------------------------------------------------------------------------
  // CBSE CLASS 10 MATHEMATICS
  // --------------------------------------------------------------------------
  'CBSE_CLASS_10_MATHS': {
    examId: 'CBSE_CLASS_10_MATHS',
    name: 'CBSE Class 10 Mathematics Standard',
    grade: '10',
    stream: 'FOUNDATION',
    subjects: ['Mathematics'],
    markingScheme: { correct: 1, incorrect: 0, unattempted: 0, stepMarking: true },
    defaultBenchmarkSeconds: 120,
    quickMockQuestionCount: 6,
    fullExamQuestionCount: 38,
    sections: [
      { name: 'Section A (MCQs & Assertion-Reason)', type: 'MCQ_SINGLE', marksPerQuestion: 1, count: 20 },
      { name: 'Section B (Very Short Answer)', type: 'SHORT_ANSWER', marksPerQuestion: 2, count: 5 },
      { name: 'Section C (Short Answer)', type: 'SHORT_ANSWER', marksPerQuestion: 3, count: 6 },
      { name: 'Section D (Long Answer / Proofs)', type: 'LONG_DERIVATION', marksPerQuestion: 5, count: 4 },
      { name: 'Section E (Case-Based Integrated)', type: 'CASE_BASED', marksPerQuestion: 4, count: 3 }
    ],
    highYieldTopics: {
      Mathematics: ['Quadratic Equations', 'Arithmetic Progressions', 'Triangles (Similarity & BPT)', 'Introduction to Trigonometry', 'Circles', 'Surface Areas & Volumes', 'Statistics']
    }
  },

  // --------------------------------------------------------------------------
  // CBSE CLASS 10 SCIENCE
  // --------------------------------------------------------------------------
  'CBSE_CLASS_10_SCIENCE': {
    examId: 'CBSE_CLASS_10_SCIENCE',
    name: 'CBSE Class 10 Science (Physics, Chemistry, Biology)',
    grade: '10',
    stream: 'FOUNDATION',
    subjects: ['Science'],
    markingScheme: { correct: 1, incorrect: 0, unattempted: 0, stepMarking: true },
    defaultBenchmarkSeconds: 100,
    quickMockQuestionCount: 6,
    fullExamQuestionCount: 39,
    sections: [
      { name: 'Section A (MCQs & Assertion-Reason)', type: 'MCQ_SINGLE', marksPerQuestion: 1, count: 20 },
      { name: 'Section B (Short Answer I)', type: 'SHORT_ANSWER', marksPerQuestion: 2, count: 6 },
      { name: 'Section C (Short Answer II)', type: 'SHORT_ANSWER', marksPerQuestion: 3, count: 7 },
      { name: 'Section D (Long Answer Derivations)', type: 'LONG_DERIVATION', marksPerQuestion: 5, count: 3 },
      { name: 'Section E (Source/Case-Based Assessment)', type: 'CASE_BASED', marksPerQuestion: 4, count: 3 }
    ],
    highYieldTopics: {
      Science: ['Chemical Reactions & Equations', 'Acids, Bases & Salts', 'Metals & Non-metals', 'Carbon & its Compounds', 'Life Processes (Nutrition, Circulation, Excretion)', 'Light (Mirror & Lens Formula)', 'Electricity & Joule Heating']
    }
  },

  // --------------------------------------------------------------------------
  // HP BOARDS CLASS 10 (Himachal Pradesh Board of School Education)
  // --------------------------------------------------------------------------
  'HP_BOARD_CLASS_10': {
    examId: 'HP_BOARD_CLASS_10',
    name: 'HP Board Class 10 Science & Mathematics',
    grade: '10',
    stream: 'FOUNDATION',
    subjects: ['Science', 'Mathematics'],
    markingScheme: { correct: 1, incorrect: 0, stepMarking: true },
    defaultBenchmarkSeconds: 120,
    quickMockQuestionCount: 6,
    fullExamQuestionCount: 30,
    sections: [
      { name: 'Section A (Objective & Multiple Choice)', type: 'MCQ_SINGLE', marksPerQuestion: 1 },
      { name: 'Section B (Short Answer Questions)', type: 'SHORT_ANSWER', marksPerQuestion: 2 },
      { name: 'Section C (Analytical & Numerical Questions)', type: 'NUMERICAL', marksPerQuestion: 3 },
      { name: 'Section D (Long Derivation & Ray Diagrams)', type: 'LONG_DERIVATION', marksPerQuestion: 5 }
    ],
    highYieldTopics: {
      Science: ['Prakash (Refraction & Lens)', 'Vidyut (Ohm Law & Circuits)', 'Jaiv Prakram (Life Processes)', 'Amla, Kshar evam Lavan (Acids & Bases)'],
      Mathematics: ['Dvighat Samikaran (Quadratic Equations)', 'Samantar Shreniyan (AP)', 'Trikonmiti (Trigonometry)']
    }
  }
};

/**
 * 2. Analyze question bank coverage against an official exam blueprint
 */
function analyzeBankCoverage(blueprintId, subjectQuestions = []) {
  const blueprint = EXAM_BLUEPRINTS[blueprintId] || EXAM_BLUEPRINTS['JEE_MAIN_NON_MED'];
  
  const stats = {
    blueprint: blueprint.name,
    targetGrade: blueprint.grade,
    stream: blueprint.stream,
    totalQuestionsInBank: subjectQuestions.length,
    highYieldCoverage: {},
    difficultySpread: { EASY: 0, MEDIUM: 0, HARD: 0, OLYMPIAD: 0 },
    questionTypeSpread: {},
    recommendations: []
  };

  subjectQuestions.forEach(q => {
    // Difficulty
    const diff = (q.difficulty || 'MEDIUM').toUpperCase();
    stats.difficultySpread[diff] = (stats.difficultySpread[diff] || 0) + 1;

    // Type
    const type = q.question_type || q.question_format || 'MCQ_SINGLE';
    stats.questionTypeSpread[type] = (stats.questionTypeSpread[type] || 0) + 1;
  });

  // Calculate high-yield coverage
  const highYieldMap = blueprint.highYieldTopics || {};
  Object.keys(highYieldMap).forEach(sub => {
    const expectedTopics = highYieldMap[sub] || [];
    const covered = expectedTopics.map(t => {
      const matchCount = subjectQuestions.filter(q => 
        (q.topic && q.topic.toLowerCase().includes(t.toLowerCase())) ||
        (q.chapter && q.chapter.toLowerCase().includes(t.toLowerCase()))
      ).length;
      return { topic: t, questionCount: matchCount, isAdequate: matchCount >= 3 };
    });
    stats.highYieldCoverage[sub] = covered;
  });

  return stats;
}

/**
 * 3. AI Pattern-Driven Quiz / Test Generation Engine
 */
async function generatePatternMatchedExam({
  blueprintId = 'JEE_MAIN_NON_MED',
  mode = 'QUICK_DIAGNOSTIC', // 'QUICK_DIAGNOSTIC' (5-12 Qs) or 'FULL_MOCK' (30-90 Qs)
  subjectBank = {}, // Map of { class10_maths: [], class10_science: [], senior_physics: [], ... }
  title = null,
  targetSection = '10-A'
}) {
  const blueprint = EXAM_BLUEPRINTS[blueprintId] || EXAM_BLUEPRINTS['JEE_MAIN_NON_MED'];
  const targetCount = mode === 'FULL_MOCK' ? blueprint.fullExamQuestionCount : blueprint.quickMockQuestionCount;

  console.log(`[PATTERN EXAM GEN] Generating ${blueprint.name} [${mode}] with target ${targetCount} questions...`);

  // Gather pool of existing questions matching the stream / grade
  const combinedBank = [];
  if (blueprint.stream === 'FOUNDATION') {
    if (subjectBank.class10_maths) combinedBank.push(...subjectBank.class10_maths);
    if (subjectBank.class10_science) combinedBank.push(...subjectBank.class10_science);
  } else if (blueprint.stream === 'NON_MEDICAL') {
    if (subjectBank.senior_physics) combinedBank.push(...subjectBank.senior_physics);
    if (subjectBank.senior_chemistry) combinedBank.push(...subjectBank.senior_chemistry);
    if (subjectBank.senior_mathematics) combinedBank.push(...subjectBank.senior_mathematics);
  } else if (blueprint.stream === 'MEDICAL') {
    if (subjectBank.senior_physics) combinedBank.push(...subjectBank.senior_physics);
    if (subjectBank.senior_chemistry) combinedBank.push(...subjectBank.senior_chemistry);
    if (subjectBank.senior_biology) combinedBank.push(...subjectBank.senior_biology);
  }

  // Deduplicate and filter by subjects
  const selectedQuestions = [];
  const seen = new Set();

  // Shuffle existing bank
  const shuffled = [...combinedBank].sort(() => 0.5 - Math.random());
  for (const q of shuffled) {
    if (selectedQuestions.length >= targetCount) break;
    const key = q.question_latex?.slice(0, 50) || q.id;
    if (!seen.has(key)) {
      seen.add(key);
      selectedQuestions.push(q);
    }
  }

  // If questions are insufficient to fulfill the blueprint, invoke AI LLM Engine with exact exam pattern prompt
  if (selectedQuestions.length < targetCount) {
    const deficit = targetCount - selectedQuestions.length;
    console.log(`[PATTERN EXAM GEN] Bank has ${selectedQuestions.length}/${targetCount}. Generating ${deficit} pattern-matched questions via LLM...`);

    const subjectsList = blueprint.subjects;
    for (let i = 0; i < deficit; i++) {
      const targetSub = subjectsList[i % subjectsList.length];
      const highYieldList = blueprint.highYieldTopics[targetSub] || ['General Core'];
      const targetChapter = highYieldList[i % highYieldList.length];

      try {
        const freshQ = await generateLlmQuestion({
          grade: blueprint.grade === '10' ? '10' : '11',
          subject: targetSub.includes('Biology') ? 'Biology' : targetSub,
          chapter: targetChapter,
          board: blueprint.examId.includes('HP') ? 'HP_BOARD' : (blueprint.examId.includes('NEET') ? 'NEET' : 'JEE_MAIN'),
          difficulty: blueprint.examId.includes('JEE') ? 'HARD' : (blueprint.examId.includes('NEET') ? 'MEDIUM' : 'MEDIUM'),
          questionType: blueprint.examId.includes('JEE') && i % 2 === 1 ? 'NUMERICAL' : 'MCQ_SINGLE',
          provider: 'auto'
        });

        if (freshQ && freshQ.question_latex) {
          selectedQuestions.push({
            ...freshQ,
            id: `q_pat_${Date.now()}_${i + 1}`,
            curriculum_board: blueprint.examId,
            exam_blueprint: blueprint.name
          });
        }
      } catch (err) {
        console.warn(`[PATTERN EXAM GEN] Failed generating supplementary for ${targetSub}:`, err.message);
      }
    }
  }

  const examDurationMinutes = Math.max(15, Math.round(selectedQuestions.length * (blueprint.defaultBenchmarkSeconds / 60) * 1.25));
  const totalMarks = selectedQuestions.reduce((acc, q) => acc + (q.marks_weightage || (blueprint.stream === 'FOUNDATION' ? 2 : 4)), 0);

  const examAssessment = {
    id: `exam_${blueprint.examId.toLowerCase()}_${Date.now()}`,
    title: title || `${blueprint.name} ${mode === 'FULL_MOCK' ? 'Grand Test' : 'Diagnostic Pattern Quiz'}`,
    examType: blueprint.examId,
    stream: blueprint.stream,
    grade: blueprint.grade,
    section: targetSection,
    teacherName: 'HAPS-AI Scholar Examiner',
    durationMinutes: examDurationMinutes,
    totalMarks,
    markingScheme: blueprint.markingScheme,
    instructions: [
      `This test strictly follows the latest ${blueprint.name} official pattern.`,
      blueprint.markingScheme.incorrect < 0 ? `Marking Scheme: +${blueprint.markingScheme.correct} for correct, ${blueprint.markingScheme.incorrect} for negative/incorrect.` : 'No negative marking. Step-by-step marking rubrics are active.',
      `Target speed benchmark: ~${blueprint.defaultBenchmarkSeconds}s per question.`
    ],
    questions: selectedQuestions.map((q, idx) => ({
      id: q.id || `q_p_${Date.now()}_${idx + 1}`,
      question_number: idx + 1,
      subject: q.subject || q.discipline || (blueprint.stream === 'FOUNDATION' ? 'Science' : 'Physics'),
      topic: q.topic || q.chapter || 'Core Syllabus',
      subtopic: q.subtopic || 'Concept Standard',
      grade: q.grade || (blueprint.grade === '10' ? '10' : '11'),
      board: q.curriculum_board || blueprint.examId,
      question_type: q.question_type || q.question_format || 'MCQ_SINGLE',
      difficulty: q.difficulty || 'MEDIUM',
      benchmark_time_seconds: Number(q.benchmark_time_seconds) || blueprint.defaultBenchmarkSeconds,
      marks: q.marks_weightage || (blueprint.stream === 'FOUNDATION' ? 2 : 4),
      negative_marks: blueprint.markingScheme.incorrect || 0,
      question_latex: q.question_latex,
      options_latex: q.options_latex || [],
      correct_answer: q.correct_answer || q.correct_answer_latex || 'B',
      solution_latex: q.solution_latex || '',
      step_rubric: q.step_rubric || [],
      socratic_hints: q.socratic_hints || [],
      ncert_mapping: q.ncert_mapping || {
        pyq_tag: q.pyq_appearance || `${blueprint.name} Historical Trend`,
        chapter_name: q.chapter || q.topic || 'Standard Chapter'
      }
    })),
    createdAt: new Date().toISOString()
  };

  return examAssessment;
}

module.exports = {
  EXAM_BLUEPRINTS,
  analyzeBankCoverage,
  generatePatternMatchedExam
};
