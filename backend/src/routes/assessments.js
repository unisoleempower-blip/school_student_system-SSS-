// ============================================================================
// HAPS-AI SCHOLAR ASSISTANT: ASSESSMENTS & TEST SUBMISSION API ROUTER
// Manages teacher assignment creation, student test delivery, sub-second telemetry
// evaluation, dynamic concept mastery breakdown, and automated weekly report updates.
// ============================================================================

const express = require('express');
const router = express.Router();
const { inMemoryStore } = require('../config/database');
const { emitEvent } = require('../kafka/producer');
const { processTelemetryEvent } = require('../kafka/consumer');
const { generateWeeklyReport } = require('../services/smartReportService');
const { getAllClass10Questions } = require('../services/class10PyqBank');
const { generateLlmQuestion } = require('../services/llmQuestionEngine');
const { EXAM_BLUEPRINTS, analyzeBankCoverage, generatePatternMatchedExam } = require('../services/examPatternAnalyzer');
const { generatePersonalizedRemedialAssignment, verifyStudentFormula } = require('../services/remedialAssignmentService');

// 1. GET /api/assessments - List all test assignments
router.get('/', (req, res) => {
  try {
    const list = inMemoryStore.assessments || [];
    res.json({
      success: true,
      count: list.length,
      assessments: list.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        teacherName: a.teacherName,
        grade: a.grade,
        section: a.section,
        board: a.board,
        subject: a.subject,
        durationMinutes: a.durationMinutes,
        totalMarks: a.totalMarks,
        questionCount: a.questions ? a.questions.length : 0,
        createdAt: a.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /api/assessments/:id - Fetch full assessment with questions
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const assessment = (inMemoryStore.assessments || []).find(a => a.id === id);

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/assessments - Teacher publishes a new test assignment
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description = '',
      teacherName = 'Er. Rajesh Kumar',
      grade = '10',
      section = 'Science-A',
      board = 'CBSE',
      subject = 'Science',
      durationMinutes = 30,
      totalMarks = 20,
      questions = []
    } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Assessment title and at least one question are required.'
      });
    }

    const newAssessment = {
      id: `asgn_${Date.now()}`,
      title,
      description,
      teacherName,
      grade,
      section,
      board,
      subject,
      durationMinutes: Number(durationMinutes) || 30,
      totalMarks: Number(totalMarks) || (questions.length * 4),
      questions: questions.map((q, idx) => ({
        id: q.id || `q_asgn_${Date.now()}_${idx + 1}`,
        topic: q.topic || q.chapter || 'Science Core',
        subtopic: q.subtopic || (q.ncert_mapping ? q.ncert_mapping.ncert_section : 'General'),
        grade: q.grade || grade,
        board: q.curriculum_board || board,
        question_type: q.question_type || 'MCQ_SINGLE',
        difficulty: q.difficulty || 'MEDIUM',
        benchmark_time_seconds: Number(q.benchmark_time_seconds) || 90,
        question_latex: q.question_latex,
        options_latex: q.options_latex || [],
        correct_answer: q.correct_answer || q.correct_answer_latex || 'B',
        solution_latex: q.solution_latex || '',
        socratic_hints: q.socratic_hints || [],
        ncert_mapping: q.ncert_mapping || null,
        step_rubric: q.step_rubric || []
      })),
      createdAt: new Date().toISOString()
    };

    if (!inMemoryStore.assessments) inMemoryStore.assessments = [];
    inMemoryStore.assessments.unshift(newAssessment);

    // Emit event to Kafka stream
    await emitEvent('assessment.published', newAssessment.id, {
      title: newAssessment.title,
      grade: newAssessment.grade,
      teacher: newAssessment.teacherName,
      questionCount: newAssessment.questions.length
    });

    res.status(201).json({
      success: true,
      message: 'Assessment published successfully to class roster.',
      assessment: newAssessment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/assessments/:id/submit - Student submits test, generates telemetry & diagnostics
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentId = 'b0000000-0000-0000-0000-000000000001',
      studentName = 'Aryan Sharma',
      answers = []
    } = req.body;

    const assessment = (inMemoryStore.assessments || []).find(a => a.id === id);
    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    let totalScore = 0;
    const totalMarks = assessment.totalMarks || (assessment.questions.length * 4);
    const questionBreakdown = [];
    let totalTimeSpent = 0;

    let normalizedAnswers = [];
    if (Array.isArray(answers)) {
      normalizedAnswers = answers;
    } else if (answers && typeof answers === 'object') {
      normalizedAnswers = Object.entries(answers).map(([k, v]) => {
        if (typeof v === 'object' && v !== null) return { questionIndex: Number(k), ...v };
        return { questionIndex: Number(k), selectedOption: String(v) };
      });
    }

    // Evaluate each question
    for (let i = 0; i < assessment.questions.length; i++) {
      const q = assessment.questions[i];
      const studentAns = normalizedAnswers.find(a => a.questionId === q.id || a.questionIndex === (i + 1)) || normalizedAnswers[i] || {};
      const selected = studentAns.selectedOption || null;
      const timeSpent = Number(studentAns.timeSpentSeconds) || 45;
      const hesitation = Number(studentAns.hesitationSeconds) || 8;
      const hintsUsed = Number(studentAns.hintsUsed) || 0;
      totalTimeSpent += timeSpent;

      const expectedAnswer = (q.correct_answer || q.correct_answer_latex || 'B').trim();
      const isCorrect = selected && selected.trim() === expectedAnswer;

      const marksForQ = isCorrect ? 4.0 : (selected ? -1.0 : 0.0);
      totalScore = Math.max(0, totalScore + marksForQ);

      const benchmark = q.benchmark_time_seconds || 90;
      let category = 'FAST_ACCURATE';
      if (isCorrect) {
        category = timeSpent > (benchmark * 1.3) ? 'SLOW_ACCURATE' : 'FAST_ACCURATE';
      } else {
        category = timeSpent > (benchmark * 1.3) ? 'SLOW_MISCONCEPTION' : 'FAST_CARELESS_SLIP';
      }

      // Record Telemetry Event
      const telemetryPayload = {
        action: 'QuestionTelemetryRecorded',
        studentId,
        questionId: q.id,
        assessmentId: id,
        timeSpentSeconds: timeSpent,
        hesitationSeconds: hesitation,
        attemptStatus: isCorrect ? 'CORRECT' : 'INCORRECT',
        selectedOption: selected,
        topic: q.topic || 'Science',
        subtopic: q.subtopic || 'General',
        benchmarkSeconds: benchmark,
        hintsUsed,
        category
      };

      // Emit to Kafka & update local concept mastery
      const event = await emitEvent('telemetry.question-timer', studentId, telemetryPayload);
      processTelemetryEvent(event);

      inMemoryStore.telemetry.push({
        id: `tel_${Date.now()}_${i}`,
        ...telemetryPayload,
        recordedAt: new Date().toISOString()
      });

      questionBreakdown.push({
        questionIndex: i + 1,
        questionId: q.id,
        subtopic: q.subtopic,
        selectedOption: selected,
        correctAnswer: expectedAnswer,
        isCorrect,
        timeSpentSeconds: timeSpent,
        benchmarkSeconds: benchmark,
        category,
        marksAwarded: marksForQ
      });
    }

    const percentage = Math.round((totalScore / totalMarks) * 100);

    // Dynamic Concept Classification for this student
    const studentMastery = inMemoryStore.conceptMastery.filter(m => m.student_id === studentId);
    const mastered = studentMastery.filter(m => m.mastery_status === 'MASTERED');
    const recap = studentMastery.filter(m => m.mastery_status === 'NEEDS_RECAP');
    const weak = studentMastery.filter(m => m.mastery_status === 'CRITICAL_WEAKNESS');

    // Automatically regenerate Weekly Smart Report with fresh diagnostic data
    const updatedReport = await generateWeeklyReport(studentId);
    inMemoryStore.weeklyReports.unshift(updatedReport);

    // Save to inMemoryStore.submissions for real-time teacher classroom analytics
    if (!inMemoryStore.submissions) inMemoryStore.submissions = [];
    const studentUser = (inMemoryStore.users || []).find(u => u.id === studentId);
    const submissionRecord = {
      submissionId: `sub_${id}_${studentId}_${Date.now()}`,
      assessmentId: id,
      assessmentTitle: assessment.title,
      studentId,
      studentName: studentName || studentUser?.full_name || 'Aryan Sharma',
      rollNumber: studentUser?.roll_number || '12-NM-01',
      grade: assessment.grade || '12',
      section: assessment.section || '12-NonMed',
      totalScore,
      totalMarks,
      percentage,
      totalTimeSpentSeconds: totalTimeSpent,
      smartCardSummary: `Scored ${percentage}% on ${assessment.title}. Mastered ${mastered.length} subtopics, needs recap on ${recap.length}, critical weakness on ${weak.length}.`,
      questionBreakdown: questionBreakdown.map(qb => {
        let errorType = 'NONE';
        if (!qb.isCorrect) {
          errorType = qb.timeSpentSeconds > (qb.benchmarkSeconds * 1.5) ? 'TIME_PRESSURE' : 'CONCEPTUAL';
        }
        return {
          ...qb,
          mistakeClassification: {
            type: errorType,
            label: qb.isCorrect ? 'Correct Execution' : (errorType === 'TIME_PRESSURE' ? 'Time Pressure Hesitation' : 'Conceptual Error'),
            explanation: qb.isCorrect ? 'Accurate problem solution.' : 'Error in formula or concept execution.'
          }
        };
      }),
      submittedAt: new Date().toISOString()
    };
    inMemoryStore.submissions.unshift(submissionRecord);

    // 4. Generate Personalized Remedial Assignment based on exact questions missed & formulas
    const personalizedAssignment = generatePersonalizedRemedialAssignment({
      studentId,
      studentName: studentName || studentUser?.full_name || 'Aryan Sharma',
      rollNumber: studentUser?.roll_number || '11-S-24',
      assessmentId: id,
      assessmentTitle: assessment.title,
      questionBreakdown
    });

    if (!inMemoryStore.remedialAssignments) inMemoryStore.remedialAssignments = [];
    inMemoryStore.remedialAssignments.unshift(personalizedAssignment);

    res.json({
      success: true,
      message: 'Test submitted and evaluated with sub-second diagnostic classification.',
      results: {
        assessmentId: id,
        assessmentTitle: assessment.title,
        studentId,
        studentName,
        totalQuestions: assessment.questions.length,
        totalScore,
        totalMarks,
        percentage,
        totalTimeSpentSeconds: totalTimeSpent,
        questionBreakdown,
        diagnosticMatrix: {
          masteredCount: mastered.length,
          recapCount: recap.length,
          weakCount: weak.length,
          mastered: mastered.map(m => m.subtopic),
          recap: recap.map(m => m.subtopic),
          weak: weak.map(m => m.subtopic)
        },
        weeklyReportId: updatedReport.id,
        personalizedAssignment
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4a. GET /api/assessments/remedial/:id - Fetch personalized remedial assignment
router.get('/remedial/:id', (req, res) => {
  try {
    const { id } = req.params;
    const assignments = inMemoryStore.remedialAssignments || [];
    const found = assignments.find(a => a.assignmentId === id);
    if (!found) {
      // If not found by exact ID, return the latest or generate a default one
      if (assignments.length > 0) return res.json({ success: true, assignment: assignments[0] });
      return res.status(404).json({ success: false, error: 'Remedial assignment not found' });
    }
    res.json({ success: true, assignment: found });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4b. POST /api/assessments/remedial/verify-formula - Verify student formula input with LaTeX feedback
router.post('/remedial/verify-formula', (req, res) => {
  try {
    const { subtopic = 'Spherical Mirrors', formulaInput = '' } = req.body;
    const evaluation = verifyStudentFormula(subtopic, formulaInput);
    res.json({ success: true, ...evaluation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4c. POST /api/assessments/remedial/generate - Generate on-demand personalized remedial assignment
router.post('/remedial/generate', (req, res) => {
  try {
    const {
      studentId = 'b0000000-0000-0000-0000-000000000001',
      studentName = 'Aryan Sharma',
      rollNumber = '11-S-24',
      assessmentId = 'asgn_10_sci_01',
      assessmentTitle = 'Class 10 Science: Light – Spherical Mirrors & Derivations',
      questionBreakdown = []
    } = req.body;

    const assignment = generatePersonalizedRemedialAssignment({
      studentId,
      studentName,
      rollNumber,
      assessmentId,
      assessmentTitle,
      questionBreakdown
    });

    if (!inMemoryStore.remedialAssignments) inMemoryStore.remedialAssignments = [];
    inMemoryStore.remedialAssignments.unshift(assignment);

    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/assessments/auto-generate - 1-Click Auto-Generate Competitive Exam / Board Quiz
router.post('/auto-generate', async (req, res) => {
  try {
    const {
      examType = 'JEE_MAIN',
      grade = '10',
      subject = 'Science',
      questionCount = 5,
      targetSection = '10-Science-A',
      title = null
    } = req.body;

    const count = Math.min(30, Math.max(1, Number(questionCount) || 5));
    const selectedQuestions = [];

    // 1. Gather matching questions from NCERT PYQ bank & in-memory store
    const pyqs = getAllClass10Questions().filter(q => 
      q.subject.toLowerCase() === subject.toLowerCase() || subject === 'ALL'
    );
    const storeQuestions = (inMemoryStore.questions || []).filter(q =>
      (String(q.grade) === String(grade) || !q.grade) &&
      (q.subject?.toLowerCase() === subject.toLowerCase() || q.topic?.toLowerCase().includes(subject.toLowerCase()))
    );

    const combinedPool = [...pyqs, ...storeQuestions];
    
    // Deduplicate by question_latex
    const seen = new Set();
    const uniquePool = [];
    combinedPool.forEach(q => {
      if (!seen.has(q.question_latex)) {
        seen.add(q.question_latex);
        uniquePool.push(q);
      }
    });

    // Shuffle pool
    const shuffled = uniquePool.sort(() => 0.5 - Math.random());
    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      selectedQuestions.push(shuffled[i]);
    }

    // 2. If more questions needed, generate dynamically via LLM Engine
    if (selectedQuestions.length < count) {
      const remaining = count - selectedQuestions.length;
      console.log(`[ASSESSMENT AUTO-GEN] Generating ${remaining} supplementary questions via LLM Engine...`);
      for (let j = 0; j < remaining; j++) {
        try {
          const freshQ = await generateLlmQuestion({
            grade,
            subject,
            chapter: j % 2 === 0 ? 'Light – Reflection and Refraction' : 'Electricity',
            board: examType === 'HP_BOARDS' ? 'HP_BOARD' : (examType === 'CBSE_BOARDS' ? 'CBSE' : 'JEE_MAIN'),
            difficulty: examType === 'OLYMPIAD' ? 'OLYMPIAD_LEVEL' : (examType.includes('JEE') ? 'HARD' : 'MEDIUM'),
            questionType: examType.includes('JEE') || examType.includes('NEET') ? 'MCQ_SINGLE' : 'NUMERICAL',
            provider: 'auto'
          });
          if (freshQ && freshQ.question_latex) {
            selectedQuestions.push(freshQ);
          }
        } catch (e) {
          console.warn('[ASSESSMENT AUTO-GEN] LLM supplementary generation fallback:', e.message);
        }
      }
    }

    const testTitle = title || `${grade === '10' ? 'Class 10' : 'Class 11'} ${subject} ${examType.replace(/_/g, ' ')} Auto-Diagnostic Quiz`;
    const durationMinutes = Math.max(15, count * 3);
    const totalMarks = count * 4;

    const newAssessment = {
      id: `asgn_auto_${Date.now()}`,
      title: testTitle,
      description: `Auto-generated ${examType} competitive assessment with ${selectedQuestions.length} curated questions.`,
      teacherName: 'HAPS-AI Auto-Examiner',
      grade: String(grade),
      section: targetSection,
      board: examType,
      subject,
      durationMinutes,
      totalMarks,
      questions: selectedQuestions.map((q, idx) => ({
        id: q.id || `q_auto_${Date.now()}_${idx + 1}`,
        topic: q.topic || q.chapter || 'Science Core',
        subtopic: q.subtopic || (q.ncert_mapping ? q.ncert_mapping.ncert_section : 'Standard'),
        grade: q.grade || grade,
        board: q.curriculum_board || examType,
        question_type: q.question_type || 'MCQ_SINGLE',
        difficulty: q.difficulty || 'MEDIUM',
        benchmark_time_seconds: Number(q.benchmark_time_seconds) || 90,
        question_latex: q.question_latex,
        options_latex: q.options_latex || [],
        correct_answer: q.correct_answer || q.correct_answer_latex || 'B',
        solution_latex: q.solution_latex || '',
        socratic_hints: q.socratic_hints || [],
        ncert_mapping: q.ncert_mapping || null,
        step_rubric: q.step_rubric || []
      })),
      createdAt: new Date().toISOString()
    };

    if (!inMemoryStore.assessments) inMemoryStore.assessments = [];
    inMemoryStore.assessments.unshift(newAssessment);

    // Emit event to Kafka stream
    await emitEvent('assessment.published', newAssessment.id, {
      title: newAssessment.title,
      examType,
      grade: newAssessment.grade,
      questionCount: newAssessment.questions.length
    });

    res.status(201).json({
      success: true,
      message: `Auto-generated ${examType} test paper with ${newAssessment.questions.length} questions.`,
      assessment: newAssessment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 6. AI PATTERN-MATCHED EXAM GENERATION (JEE MAIN, NEET, CBSE & HP BOARD)
// ============================================================================

// GET /api/assessments/pattern-exam/blueprints - List official exam blueprints
router.get('/pattern-exam/blueprints', (req, res) => {
  try {
    const list = Object.keys(EXAM_BLUEPRINTS).map(k => ({
      id: k,
      name: EXAM_BLUEPRINTS[k].name,
      grade: EXAM_BLUEPRINTS[k].grade,
      stream: EXAM_BLUEPRINTS[k].stream,
      subjects: EXAM_BLUEPRINTS[k].subjects,
      markingScheme: EXAM_BLUEPRINTS[k].markingScheme,
      defaultBenchmarkSeconds: EXAM_BLUEPRINTS[k].defaultBenchmarkSeconds,
      sections: EXAM_BLUEPRINTS[k].sections,
      highYieldTopics: EXAM_BLUEPRINTS[k].highYieldTopics
    }));
    res.json({ success: true, count: list.length, blueprints: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/assessments/pattern-exam/analyze - AI Pattern Analysis of question bank
router.post('/pattern-exam/analyze', (req, res) => {
  try {
    const { blueprintId = 'JEE_MAIN_NON_MED' } = req.body;
    const blueprint = EXAM_BLUEPRINTS[blueprintId];
    if (!blueprint) {
      return res.status(404).json({
        success: false,
        error: `Unknown blueprint "${blueprintId}". Available: ${Object.keys(EXAM_BLUEPRINTS).join(', ')}`
      });
    }

    const banks = inMemoryStore.subjectBanks || {};
    const allQuestions = [];
    Object.values(banks).forEach(arr => {
      if (Array.isArray(arr)) allQuestions.push(...arr);
    });

    const analysis = analyzeBankCoverage(blueprintId, allQuestions);
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/assessments/pattern-exam/generate - 1-Click AI Pattern Exam Paper Generator
router.post('/pattern-exam/generate', async (req, res) => {
  try {
    const {
      blueprintId = 'JEE_MAIN_NON_MED',
      mode = 'QUICK_DIAGNOSTIC', // 'QUICK_DIAGNOSTIC' (6-12 Qs) or 'FULL_MOCK' (30-90 Qs)
      targetSection = '11-Science-A',
      title = null
    } = req.body;

    const blueprint = EXAM_BLUEPRINTS[blueprintId];
    if (!blueprint) {
      return res.status(404).json({
        success: false,
        error: `Invalid blueprintId. Choose from: ${Object.keys(EXAM_BLUEPRINTS).join(', ')}`
      });
    }

    const generatedExam = await generatePatternMatchedExam({
      blueprintId,
      mode,
      subjectBank: inMemoryStore.subjectBanks || {},
      title,
      targetSection
    });

    if (!inMemoryStore.assessments) inMemoryStore.assessments = [];
    inMemoryStore.assessments.unshift(generatedExam);

    // Emit event to telemetry / event stream
    await emitEvent('assessment.published', generatedExam.id, {
      title: generatedExam.title,
      examType: blueprintId,
      stream: generatedExam.stream,
      grade: generatedExam.grade,
      questionCount: generatedExam.questions.length,
      totalMarks: generatedExam.totalMarks
    });

    res.status(201).json({
      success: true,
      message: `Successfully synthesized ${blueprint.name} test paper matching the official exam pattern.`,
      exam: generatedExam
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

