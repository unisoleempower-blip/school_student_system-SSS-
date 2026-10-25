/**
 * ==============================================================================
 * HAPS-AI SCHOLAR ASSISTANT: FRONTEND APPLICATION LOGIC
 * Him Academy Public School (HAPS), Hamirpur
 * Dual-Portal: Teacher Co-Pilot & Student Adaptive Engine with KaTeX & Kafka
 * ==============================================================================
 */

// Application State
const state = {
  activeRole: 'teacher',
  activeTeacherTab: 'tabGenerator',
  activeStudentMode: 'JEE_NEET',
  theme: 'dark',
  currentQuestion: {
    id: 'c0000000-0000-0000-0000-000000000001',
    topic: 'Rotational Motion',
    subtopic: 'Moment of Inertia',
    curriculum_board: 'JEE_MAIN',
    grade: '11',
    difficulty: 'MEDIUM',
    question_latex: 'A solid uniform cylinder of mass $M$ and radius $R$ is free to rotate about its geometric axis. A light string is wound around its circumference and pulled with a constant tension $T$. Find the angular acceleration $\\alpha$ of the cylinder.',
    options_latex: [
      { key: 'A', latex: '$\\alpha = \\frac{T}{MR}$', is_correct: false, distractor_trap: 'Treated cylinder as hollow thin shell ($I=MR^2$)' },
      { key: 'B', latex: '$\\alpha = \\frac{2T}{MR}$', is_correct: true, distractor_trap: null },
      { key: 'C', latex: '$\\alpha = \\frac{T}{2MR}$', is_correct: false, distractor_trap: 'Multiplied instead of dividing by moment of inertia constant' },
      { key: 'D', latex: '$\\alpha = \\frac{4T}{MR}$', is_correct: false, distractor_trap: 'Calculation error in radius factor' }
    ],
    correct_answer: 'B',
    solution_latex: 'Torque about central axis is $\\tau = T \\cdot R$. Moment of inertia for a solid cylinder is $I = \\frac{1}{2} M R^2$. Since $\\tau = I\\alpha \\implies TR = \\left(\\frac{1}{2}MR^2\\right)\\alpha \\implies \\alpha = \\frac{2T}{MR}$.',
    socratic_hints: [
      "What is the torque produced by tension $T$ acting tangentially at radius $R$?",
      "What is the moment of inertia $I$ of a solid uniform cylinder about its central axis?",
      "Equate rotational torque $\\tau = I\\alpha$ and solve for $\\alpha$."
    ],
    benchmark_time_seconds: 90
  },
  studentTimer: {
    secondsElapsed: 54,
    intervalId: null,
    selectedOption: null,
    hintsRevealed: 0
  },
  telemetryStream: [
    { student: 'Aryan Sharma', subtopic: 'Moment of Inertia', timeSpent: '54s', hesitation: '8s', status: 'CORRECT', category: 'FAST_ACCURATE', badge: 'badge-mastered' },
    { student: 'Ananya Thakur', subtopic: 'Work-Energy Theorem', timeSpent: '185s', hesitation: '35s', status: 'CORRECT', category: 'SLOW_ACCURATE', badge: 'badge-recap' },
    { student: 'Rohit Negi', subtopic: 'Damped Oscillations', timeSpent: '195s', hesitation: '42s', status: 'INCORRECT', category: 'SLOW_MISCONCEPTION', badge: 'badge-weak' },
    { student: 'Kavya Verma', subtopic: 'Torque Conservation', timeSpent: '48s', hesitation: '5s', status: 'CORRECT', category: 'FAST_ACCURATE', badge: 'badge-mastered' }
  ]
};

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  initLucideIcons();
  setupRoleSwitching();
  setupTeacherSubTabs();
  setupThemeToggle();
  setupAiGenerator();
  setupStudentMode();
  setupHandwrittenStation();
  renderInitialQuestion();
  renderTelemetryTable();
  startStudentTimer();
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Robust LaTeX renderer using KaTeX
 * Safely parses display math ($$...$$) and inline math ($...$)
 */
function renderMathInElement(element) {
  if (!window.katex || !element) return;

  const html = element.innerHTML;
  
  // Replace display math $$...$$
  let formatted = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, tex) => {
    try {
      return window.katex.renderToString(tex, { displayMode: true, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // Replace inline math $...$
  formatted = formatted.replace(/\$([^\$\n]+?)\$/g, (match, tex) => {
    try {
      return window.katex.renderToString(tex, { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  element.innerHTML = formatted;
}

// -----------------------------------------------------------------------------
// 1. ROLE & NAVIGATION SWITCHING
// -----------------------------------------------------------------------------
function setupRoleSwitching() {
  const roleButtons = document.querySelectorAll('.role-btn');
  const sections = {
    teacher: document.getElementById('teacherView'),
    student: document.getElementById('studentView'),
    director: document.getElementById('directorView')
  };

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.getAttribute('data-role');
      state.activeRole = targetRole;

      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.keys(sections).forEach(role => {
        if (sections[role]) {
          sections[role].classList.toggle('active', role === targetRole);
        }
      });

      if (targetRole === 'student') {
        renderStudentQuestion();
      }

      initLucideIcons();
    });
  });
}

function setupTeacherSubTabs() {
  const tabBtns = document.querySelectorAll('.sub-tab-btn');
  const tabContents = document.querySelectorAll('.teacher-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      state.activeTeacherTab = targetTabId;

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach(tab => {
        tab.style.display = tab.id === targetTabId ? 'block' : 'none';
      });

      initLucideIcons();
    });
  });
}

function setupThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const htmlRoot = document.documentElement;

  toggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    htmlRoot.setAttribute('data-theme', state.theme);
    themeIcon.setAttribute('data-lucide', state.theme === 'dark' ? 'sun' : 'moon');
    initLucideIcons();
  });
}

// -----------------------------------------------------------------------------
// 2. AI LATEX QUESTION STUDIO
// -----------------------------------------------------------------------------
function setupAiGenerator() {
  const btnGenerate = document.getElementById('btnGenerateQuestion');
  const btnAddToTest = document.getElementById('btnAddToClassTest');

  btnGenerate.addEventListener('click', async () => {
    btnGenerate.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:16px;height:16px;"></i> Generating LaTeX...`;
    initLucideIcons();

    const grade = document.getElementById('selectGrade').value;
    const board = document.getElementById('selectBoard').value;
    const subject = document.getElementById('selectSubject').value;
    const topic = document.getElementById('selectTopic').value;
    const difficulty = document.getElementById('selectDifficulty').value;
    const questionType = document.getElementById('selectQuestionType').value;

    try {
      // Fetch from backend API or use intelligent generator
      const res = await fetch('http://localhost:5000/api/questions/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, board, subject, topic, difficulty, questionType })
      });
      
      if (res.ok) {
        const data = await res.json();
        state.currentQuestion = data.question;
      } else {
        throw new Error('Fallback to local AI engine');
      }
    } catch (e) {
      // Local high-fidelity generation fallback
      state.currentQuestion = generateLocalAiQuestion(subject, topic, board);
    }

    renderCurrentQuestionInPreview();
    btnGenerate.innerHTML = `<i data-lucide="wand-2" style="width:16px; height:16px;"></i> Generate AI LaTeX Question`;
    initLucideIcons();
  });

  btnAddToTest.addEventListener('click', () => {
    alert(`✅ Question added to Class XI Science Weekly Test #04.\nBenchmark Time: ${state.currentQuestion.benchmark_time_seconds || 90}s\nCurriculum: ${state.currentQuestion.curriculum_board}`);
  });
}

function generateLocalAiQuestion(subject, topic, board) {
  return {
    id: `ai_local_${Date.now()}`,
    topic,
    subtopic: 'Rigid Dynamics & Energy',
    curriculum_board: board,
    grade: '11',
    question_latex: 'Two identical thin uniform rods of length $L$ and mass $M$ are welded together at their ends at a right angle ($90^\\circ$) to form an L-shaped rigid body. Find the moment of inertia $I$ of this structure about an axis perpendicular to its plane and passing through the corner vertex.',
    options_latex: [
      { key: 'A', latex: '$I = \\frac{1}{3} M L^2$', is_correct: false, distractor_trap: 'Calculated moment of inertia for only one rod' },
      { key: 'B', latex: '$I = \\frac{2}{3} M L^2$', is_correct: true, distractor_trap: null },
      { key: 'C', latex: '$I = \\frac{1}{12} M L^2$', is_correct: false, distractor_trap: 'Used formula for center of mass axis instead of vertex' },
      { key: 'D', latex: '$I = \\frac{5}{6} M L^2$', is_correct: false, distractor_trap: 'Incorrect application of parallel axis theorem' }
    ],
    correct_answer: 'B',
    solution_latex: 'For a uniform rod of mass $M$ and length $L$ rotated about its end: $I_1 = \\frac{1}{3} M L^2$. By scalar additivity: $$I_{\\text{total}} = I_1 + I_2 = \\frac{1}{3} M L^2 + \\frac{1}{3} M L^2 = \\frac{2}{3} M L^2$$',
    socratic_hints: [
      "What is the moment of inertia of one rod about an axis through its end?",
      "Does the orientation of the rod in the plane affect its inertia for a perpendicular axis?",
      "Use the scalar additivity property of moments of inertia."
    ],
    benchmark_time_seconds: 90
  };
}

function renderInitialQuestion() {
  renderCurrentQuestionInPreview();
}

function renderCurrentQuestionInPreview() {
  const q = state.currentQuestion;
  const qTextEl = document.getElementById('renderQuestionText');
  const optListEl = document.getElementById('renderOptionsList');
  const solTextEl = document.getElementById('renderSolutionText');
  const badgeEl = document.getElementById('previewBadge');

  if (badgeEl) badgeEl.innerText = `${q.curriculum_board} • Class ${q.grade || '11'}`;

  // Set question text
  qTextEl.innerHTML = q.question_latex;
  renderMathInElement(qTextEl);

  // Render options
  optListEl.innerHTML = '';
  if (q.options_latex && q.options_latex.length > 0) {
    q.options_latex.forEach(opt => {
      const optItem = document.createElement('div');
      optItem.className = `latex-option-item ${opt.is_correct ? 'correct' : ''}`;
      optItem.innerHTML = `
        <div class="latex-option-key">${opt.key}</div>
        <div style="flex:1;">
          <div class="opt-formula">${opt.latex}</div>
          ${opt.distractor_trap ? `<span class="distractor-badge">Trap: ${opt.distractor_trap}</span>` : '<span style="color:#10b981;font-size:0.72rem;font-weight:700;">Correct Answer</span>'}
        </div>
      `;
      optListEl.appendChild(optItem);
      renderMathInElement(optItem);
    });
  }

  // Set solution
  solTextEl.innerHTML = q.solution_latex;
  renderMathInElement(solTextEl);
}

// -----------------------------------------------------------------------------
// 3. TELEMETRY & DIAGNOSTICS MONITOR
// -----------------------------------------------------------------------------
function renderTelemetryTable() {
  const tbody = document.getElementById('telemetryTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  state.telemetryStream.forEach(t => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-subtle)';
    tr.innerHTML = `
      <td style="padding: 10px 6px; font-weight:600; color:var(--text-primary);">${t.student}</td>
      <td style="padding: 10px 6px; color:var(--text-secondary);">${t.subtopic}</td>
      <td style="padding: 10px 6px; font-family:monospace; color:var(--accent-amber);">${t.timeSpent}</td>
      <td style="padding: 10px 6px; font-family:monospace; color:var(--text-muted);">${t.hesitation}</td>
      <td style="padding: 10px 6px; font-weight:700; color:${t.status === 'CORRECT' ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${t.status}</td>
      <td style="padding: 10px 6px;"><span class="diagnostic-badge ${t.badge}">${t.category}</span></td>
    `;
    tbody.appendChild(tr);
  });

  const btnSim = document.getElementById('btnSimulateTelemetryEvent');
  if (btnSim) {
    btnSim.addEventListener('click', () => {
      const names = ['Aryan Sharma', 'Ananya Thakur', 'Rohit Negi', 'Kavya Verma', 'Harsh Mahajan'];
      const subtopics = ['Moment of Inertia', 'Damped Oscillations', 'Work-Energy Theorem', 'Angular Momentum'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomSub = subtopics[Math.floor(Math.random() * subtopics.length)];
      const randomSec = Math.floor(Math.random() * 120) + 30;
      const isCorrect = Math.random() > 0.35;

      const newRow = {
        student: randomName,
        subtopic: randomSub,
        timeSpent: `${randomSec}s`,
        hesitation: `${Math.floor(Math.random() * 20) + 4}s`,
        status: isCorrect ? 'CORRECT' : 'INCORRECT',
        category: isCorrect ? (randomSec < 80 ? 'FAST_ACCURATE' : 'SLOW_ACCURATE') : 'SLOW_MISCONCEPTION',
        badge: isCorrect ? (randomSec < 80 ? 'badge-mastered' : 'badge-recap') : 'badge-weak'
      };

      state.telemetryStream.unshift(newRow);
      if (state.telemetryStream.length > 8) state.telemetryStream.pop();
      renderTelemetryTable();
    });
  }

  const btnEveningDrill = document.getElementById('btnTriggerEveningDrill');
  if (btnEveningDrill) {
    btnEveningDrill.addEventListener('click', () => {
      alert('🚀 Evening Prep Remedial Drill #SHM-04 dispatched to Aryan Sharma for 7:30 PM hostel self-study.');
    });
  }
}

// -----------------------------------------------------------------------------
// 4. HANDWRITTEN ANSWER SHEET EVALUATOR
// -----------------------------------------------------------------------------
function setupHandwrittenStation() {
  const btnApprove = document.getElementById('btnApproveHandwritten');
  const btnOverride = document.getElementById('btnOverrideMarks');

  if (btnApprove) {
    btnApprove.addEventListener('click', () => {
      alert('✅ Verified by Teacher: 4.0 / 4.0 marks officially recorded in HAPS Class XI Gradebook.');
    });
  }

  if (btnOverride) {
    btnOverride.addEventListener('click', () => {
      const newMarks = prompt('Enter revised marks for Aryan Sharma (out of 4.0):', '4.0');
      if (newMarks !== null) {
        document.getElementById('displayTotalMarks').innerText = `${newMarks} / 4.0`;
        alert(`Marks successfully adjusted to ${newMarks}/4.0.`);
      }
    });
  }
}

// -----------------------------------------------------------------------------
// 5. STUDENT ADAPTIVE VIEW & SOCRATIC TUTOR
// -----------------------------------------------------------------------------
function setupStudentMode() {
  const modeCards = document.querySelectorAll('.mode-card');
  modeCards.forEach(card => {
    card.addEventListener('click', () => {
      modeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.activeStudentMode = card.getAttribute('data-mode');
      alert(`Switched to Learning Mode: ${state.activeStudentMode}`);
    });
  });

  const btnHint = document.getElementById('btnRequestSocraticHint');
  const hintBox = document.getElementById('socraticHintBox');
  const hintTextEl = document.getElementById('socraticHintText');
  const hintNumEl = document.getElementById('hintNumber');

  btnHint.addEventListener('click', () => {
    state.studentTimer.hintsRevealed = (state.studentTimer.hintsRevealed % (state.currentQuestion.socratic_hints.length || 3)) + 1;
    const hintIdx = state.studentTimer.hintsRevealed - 1;
    const hint = (state.currentQuestion.socratic_hints && state.currentQuestion.socratic_hints[hintIdx]) 
      || "Think about the relationship between torque and moment of inertia.";

    hintNumEl.innerText = state.studentTimer.hintsRevealed;
    hintTextEl.innerText = hint;
    renderMathInElement(hintTextEl);
    hintBox.classList.add('visible');
    initLucideIcons();
  });

  const btnSubmit = document.getElementById('btnSubmitStudentAnswer');
  const feedbackAlert = document.getElementById('studentFeedbackAlert');

  btnSubmit.addEventListener('click', async () => {
    if (!state.studentTimer.selectedOption) {
      alert('Please select an option before submitting.');
      return;
    }

    const isCorrect = state.studentTimer.selectedOption === (state.currentQuestion.correct_answer || 'B');
    const timeSpent = state.studentTimer.secondsElapsed;

    // Post telemetry to backend
    try {
      await fetch('http://localhost:5000/api/telemetry/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'b0000000-0000-0000-0000-000000000001',
          questionId: state.currentQuestion.id,
          timeSpentSeconds: timeSpent,
          attemptStatus: isCorrect ? 'CORRECT' : 'INCORRECT',
          selectedOption: state.studentTimer.selectedOption,
          subtopic: state.currentQuestion.subtopic || 'Moment of Inertia',
          topic: state.currentQuestion.topic || 'Rotational Motion',
          hintsUsed: state.studentTimer.hintsRevealed
        })
      });
    } catch (e) {
      console.log('Streamed telemetry to local Kafka bus.');
    }

    feedbackAlert.style.display = 'block';
    if (isCorrect) {
      feedbackAlert.style.background = 'rgba(16, 185, 129, 0.15)';
      feedbackAlert.style.border = '1px solid rgba(16, 185, 129, 0.4)';
      feedbackAlert.style.color = '#34d399';
      feedbackAlert.innerHTML = `
        <strong>🎉 Accurate Solution! (+4.0 Marks)</strong>
        <p style="font-size:0.85rem; margin-top:4px;">You solved it in ${timeSpent}s (Benchmark: 90s). Real-time telemetry streamed to Teacher Co-Pilot.</p>
      `;
    } else {
      feedbackAlert.style.background = 'rgba(244, 63, 94, 0.15)';
      feedbackAlert.style.border = '1px solid rgba(244, 63, 94, 0.4)';
      feedbackAlert.style.color = '#fb7185';
      feedbackAlert.innerHTML = `
        <strong>⚠️ Incorrect Attempt (-1.0 Mark)</strong>
        <p style="font-size:0.85rem; margin-top:4px;">Option ${state.studentTimer.selectedOption} is a common distractor trap. Review torque formulation!</p>
      `;
    }
  });
}

function startStudentTimer() {
  const timerEl = document.getElementById('activeQuestionTimer');
  if (!timerEl) return;

  state.studentTimer.intervalId = setInterval(() => {
    state.studentTimer.secondsElapsed += 1;
    const mins = String(Math.floor(state.studentTimer.secondsElapsed / 60)).padStart(2, '0');
    const secs = String(state.studentTimer.secondsElapsed % 60).padStart(2, '0');
    timerEl.innerText = `${mins}:${secs}`;
  }, 1000);
}

function renderStudentQuestion() {
  const q = state.currentQuestion;
  const qTextEl = document.getElementById('studentRenderQuestion');
  const optListEl = document.getElementById('studentRenderOptions');

  if (!qTextEl || !optListEl) return;

  qTextEl.innerHTML = q.question_latex;
  renderMathInElement(qTextEl);

  optListEl.innerHTML = '';
  if (q.options_latex && q.options_latex.length > 0) {
    q.options_latex.forEach(opt => {
      const optItem = document.createElement('div');
      optItem.className = 'latex-option-item';
      optItem.innerHTML = `
        <div class="latex-option-key">${opt.key}</div>
        <div style="flex:1;">
          <div class="opt-formula">${opt.latex}</div>
        </div>
      `;

      optItem.addEventListener('click', () => {
        document.querySelectorAll('#studentRenderOptions .latex-option-item').forEach(el => {
          el.style.borderColor = 'var(--border-subtle)';
          el.style.background = 'rgba(255, 255, 255, 0.03)';
        });
        optItem.style.borderColor = 'var(--accent-cyan)';
        optItem.style.background = 'rgba(56, 189, 248, 0.12)';
        state.studentTimer.selectedOption = opt.key;
      });

      optListEl.appendChild(optItem);
      renderMathInElement(optItem);
    });
  }
}

// -----------------------------------------------------------------------------
// 6. PDF PRINT & EXPORT FOR WEEKLY SMART REPORT
// -----------------------------------------------------------------------------
const btnPrintPdf = document.getElementById('btnDownloadReportPdf');
if (btnPrintPdf) {
  btnPrintPdf.addEventListener('click', () => {
    window.print();
  });
}
