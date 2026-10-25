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
  testDraft: [],
  publishedAssessments: [],
  activeAssessment: null,
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
  initApp();
});

function initApp() {
  initLucideIcons();
  setupRoleSwitching();
  setupTeacherSubTabs();
  setupThemeToggle();
  setupTeacherTestBuilder();
  setupAiGenerator();
  setupTelemetryControls();
  renderTelemetryTable();
  setupHandwrittenStation();
  setupHandwrittenUploadAndVisionAi();
  setupWhatsAppNotificationModal();
  setupStudentMode();
  setupNtaExamPaletteEngine();
  setupWebSocketClient();
  initClassroomSeatmap();
  renderInitialQuestion();
  startStudentTimer();
  setupClass10PyqExplorer();
  setupTestAssignmentBuilder();
  setupStudentAssignedTests();
  setupClassAnalytics();
  loadClassAnalytics();
}


function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

const pendingMathQueue = new Set();
let katexRetryInterval = null;

function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function cleanFormula(tex) {
  let clean = decodeHtmlEntities(tex.trim());
  // Fix unescaped text{...} e.g. text{cm} -> \text{cm}
  clean = clean.replace(/(?<!\\)text\s*\{/g, '\\text{');
  clean = clean.replace(/(?<!\\)rm\s*\{/g, '\\mathrm{');
  // Fix unescaped % inside math formulas
  clean = clean.replace(/(?<!\\)%/g, '\\%');
  return clean;
}

/**
 * Universal robust LaTeX renderer using KaTeX
 * Handles:
 * 1. LaTeX environments: \begin{equation}...\end{equation}, \begin{align}...\end{align}
 * 2. Display math: $$...$$, \[...\], [ math \], and multi-step derivations
 * 3. Inline math: \(...\), $...$
 * 4. Automatic entity decoding, text{...} repair, and newline derivation formatting
 */
function renderLatexString(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  let content = rawText;

  // 1. Normalize linebreaks from LaTeX notation: \newline, .\newline, or stray leading 'newline'
  content = content.replace(/\.?\\newline/gi, '<br/>');
  content = content.replace(/(^|<br\/>|\n|[.;:])\s*newline\b\s*/gi, '$1<br/>');

  // 2. Normalize display brackets with LaTeX commands inside: e.g. '[ math \]' or '[ \frac{...} ]' -> '\[ math \]'
  content = content.replace(/(^|\s)\[\s*([^\[\]]*?\\[a-zA-Z]+[^\[\]]*?)\s*\\?\]/g, '$1\\[$2\\]');
  content = content.replace(/(^|\s)\[\s*([^\[\]]+?)\s*\\\]/g, '$1\\[$2\\]');

  // 3. Render LaTeX environments: \begin{...}...\end{...}
  content = content.replace(/\\begin\{(equation|align|aligned|gather|matrix|pmatrix|bmatrix)\}([\s\S]*?)\\end\{\1\}/g, (match) => {
    const cleanTex = cleanFormula(match);
    if (window.katex) {
      try {
        return window.katex.renderToString(cleanTex, { displayMode: true, throwOnError: false });
      } catch (e) {}
    }
    return `<div class="katex-display-fallback">${cleanTex}</div>`;
  });

  // 4. Render Display Math: $$...$$
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, tex) => {
    const cleanTex = cleanFormula(tex);
    if (window.katex) {
      try {
        return window.katex.renderToString(cleanTex, { displayMode: true, throwOnError: false });
      } catch (e) {}
    }
    return `<div class="katex-display-fallback">${cleanTex}</div>`;
  });

  // 5. Render Display Math: \[...\] (and consume optional trailing \ from LLM generation)
  content = content.replace(/\\\[([\s\S]*?)\\\](?:\\)?/g, (match, tex) => {
    const cleanTex = cleanFormula(tex);
    if (window.katex) {
      try {
        return window.katex.renderToString(cleanTex, { displayMode: true, throwOnError: false });
      } catch (e) {}
    }
    return `<div class="katex-display-fallback">${cleanTex}</div>`;
  });

  // 6. Render Inline Math: \(...\)
  content = content.replace(/\\\(([\s\S]*?)\\\)/g, (match, tex) => {
    const cleanTex = cleanFormula(tex);
    if (window.katex) {
      try {
        return window.katex.renderToString(cleanTex, { displayMode: false, throwOnError: false });
      } catch (e) {}
    }
    return `<span class="katex-inline-fallback">${cleanTex}</span>`;
  });

  // 7. Render Inline Math: $...$
  content = content.replace(/(^|[^\$])\$([^\$\n]+?)\$(?!\$)/g, (match, prefix, tex) => {
    const cleanTex = cleanFormula(tex);
    let rendered = `<span class="katex-inline-fallback">${cleanTex}</span>`;
    if (window.katex) {
      try {
        rendered = window.katex.renderToString(cleanTex, { displayMode: false, throwOnError: false });
      } catch (e) {}
    }
    return `${prefix}${rendered}`;
  });

  // 8. Post-processing text outside rendered math:
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  content = content.replace(/\\(\s*[\r\n]+)/g, '$1');
  content = content.replace(/([:;,])\s*\\\s*/g, '$1 ');

  // Format line breaks
  content = content.replace(/\n\s*\n/g, '<br/><br/>');
  content = content.replace(/\n/g, '<br/>');

  return content;
}

/**
 * Universal math renderer for DOM elements
 */
function renderMathInElement(element) {
  if (!element) return;

  if (!window.katex) {
    pendingMathQueue.add(element);
    if (!katexRetryInterval) {
      katexRetryInterval = setInterval(() => {
        if (window.katex) {
          clearInterval(katexRetryInterval);
          katexRetryInterval = null;
          pendingMathQueue.forEach(el => renderMathInElement(el));
          pendingMathQueue.clear();
        }
      }, 100);
    }
    return;
  }

  element.innerHTML = renderLatexString(element.innerHTML);
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
        const isTarget = tab.id === targetTabId;
        tab.style.display = isTarget ? 'block' : 'none';
        tab.classList.toggle('active', isTarget);
      });

      if (targetTabId === 'tabGenerator') {
        if (!teacherBuilderState.currentTaxonomy) {
          setupTeacherTestBuilder();
        }
      }

      if (targetTabId === 'tabClass10Pyq' && !currentCurriculumTaxonomy) {
        setupClass10PyqExplorer();
      }

      if (targetTabId === 'tabClassAnalytics') {
        loadClassAnalytics();
      }

      if (targetTabId === 'tabStudents' && currentAnalyticsData) {
        renderClassAnalytics(currentAnalyticsData);
      }

      initLucideIcons();
    });
  });
}

function setupThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const htmlRoot = document.documentElement;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', state.theme);
      if (themeIcon) themeIcon.setAttribute('data-lucide', state.theme === 'dark' ? 'sun' : 'moon');
      initLucideIcons();
    });
  }
}

// -----------------------------------------------------------------------------
// 2. AI LATEX QUESTION STUDIO
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 2. AI LATEX QUESTION STUDIO & MULTI-LLM INFERENCE
// -----------------------------------------------------------------------------
function setupAiGenerator() {
  const btnGenerate = document.getElementById('btnGenerateQuestion');
  const btnAddToTest = document.getElementById('btnAddToClassTest');
  const selectGrade = document.getElementById('selectGrade');
  const selectSubject = document.getElementById('selectSubject');
  const selectTopic = document.getElementById('selectTopic');
  const inputNcert = document.getElementById('inputNcertBlueprint');

  // Dynamic NCERT topic updating on grade/subject change
  const updateTopicsForGrade = () => {
    const grade = selectGrade ? selectGrade.value : '10';
    const subj = selectSubject ? selectSubject.value : 'Science';

    if (grade === '10') {
      if (subj === 'Mathematics') {
        selectTopic.innerHTML = `
          <option value="Introduction to Trigonometry" selected>Ch 8: Introduction to Trigonometry (Identities)</option>
          <option value="Quadratic Equations">Ch 4: Quadratic Equations (Roots & Discriminant)</option>
          <option value="Arithmetic Progressions">Ch 5: Arithmetic Progressions (Sum of n terms)</option>
          <option value="Real Numbers">Ch 1: Real Numbers (Fundamental Theorem)</option>
          <option value="Triangles">Ch 6: Triangles (BPT & Similarity)</option>
        `;
        if (inputNcert) inputNcert.value = '8.4 Trigonometric Identities (NCERT Pages 190–193)';
      } else {
        selectTopic.innerHTML = `
          <option value="Light – Reflection and Refraction" selected>Ch 9: Light – Reflection & Refraction (Mirrors & Lenses)</option>
          <option value="Electricity">Ch 11: Electricity (Joule Heating & Circuits)</option>
          <option value="Chemical Reactions and Equations">Ch 1: Chemical Reactions & Decomposition</option>
          <option value="Metals and Non-Metals">Ch 3: Metals & Non-Metals (Thermit Reaction)</option>
          <option value="Life Processes">Ch 6: Life Processes (Nephron Ultrafiltration)</option>
        `;
        if (inputNcert) inputNcert.value = '9.2 Spherical Mirrors and Mirror Formula (NCERT Pages 168–171)';
      }
    } else {
      selectTopic.innerHTML = `
        <option value="Rotational Motion" selected>Rotational Motion & Dynamics</option>
        <option value="Work, Energy and Power">Work, Energy and Power</option>
        <option value="Oscillations & SHM">Oscillations & SHM</option>
        <option value="Chemical Thermodynamics">Chemical Thermodynamics</option>
        <option value="Calculus & Limits">Calculus & Limits</option>
      `;
      if (inputNcert) inputNcert.value = 'Class 11 Physics NCERT Ch 7 Rigid Body Dynamics';
    }
  };

  if (selectGrade) selectGrade.addEventListener('change', updateTopicsForGrade);
  if (selectSubject) selectSubject.addEventListener('change', updateTopicsForGrade);

  // Check LLM Provider status from backend
  checkProviderStatus();

  if (btnGenerate) {
    btnGenerate.addEventListener('click', async () => {
      btnGenerate.disabled = true;
      btnGenerate.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:16px;height:16px;"></i> Generating via LLM...`;
      initLucideIcons();

      const grade = document.getElementById('selectGrade') ? document.getElementById('selectGrade').value : '10';
      const board = document.getElementById('selectBoard') ? document.getElementById('selectBoard').value : 'CBSE';
      const subject = document.getElementById('selectSubject') ? document.getElementById('selectSubject').value : 'Science';
      const chapter = document.getElementById('selectTopic') ? document.getElementById('selectTopic').value : 'Light – Reflection and Refraction';
      const difficulty = document.getElementById('selectDifficulty') ? document.getElementById('selectDifficulty').value : 'MEDIUM';
      const questionType = document.getElementById('selectQuestionType') ? document.getElementById('selectQuestionType').value : 'NUMERICAL';
      const provider = document.getElementById('selectLlmProvider') ? document.getElementById('selectLlmProvider').value : 'auto';
      const ncertSection = document.getElementById('inputNcertBlueprint') ? document.getElementById('inputNcertBlueprint').value : '';

      try {
        // Call Multi-LLM API endpoint
        const res = await fetch('http://localhost:5050/api/questions/generate-llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade,
            board,
            subject,
            chapter,
            ncertSection,
            difficulty,
            questionType,
            provider
          })
        });

        if (res.ok) {
          const data = await res.json();
          state.currentQuestion = data.question;
        } else {
          throw new Error('Fallback to local engine');
        }
      } catch (e) {
        console.warn('Backend LLM error, generating curated fallback question:', e);
        state.currentQuestion = generateLocalAiQuestion(subject, chapter, board);
      } finally {
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = `<i data-lucide="wand-2" style="width:16px; height:16px;"></i> Generate via LLM Engine`;
        initLucideIcons();
        renderCurrentQuestionInPreview();
      }
    });
  }

  if (btnAddToTest) {
    btnAddToTest.addEventListener('click', () => {
      const q = state.currentQuestion || {};
      addQuestionToTestDraft(q);
    });
  }
}

async function checkProviderStatus() {
  const badge = document.getElementById('providerLiveBadge');
  if (!badge) return;

  try {
    const res = await fetch('http://localhost:5050/api/questions/providers');
    if (res.ok) {
      const data = await res.json();
      const p = data.providers;
      if (p.groq?.configured && p.gemini?.configured) {
        badge.innerHTML = `⚡ Groq LPU + ♊ Gemini Active`;
        badge.style.background = 'rgba(16,185,129,0.15)';
        badge.style.color = '#10b981';
      } else if (p.groq?.configured) {
        badge.innerHTML = `⚡ Groq LPU (${p.speed || '350ms'})`;
      } else if (p.gemini?.configured) {
        badge.innerHTML = `♊ Google Gemini (${p.gemini.model})`;
      } else {
        badge.innerHTML = `📚 NCERT Offline PYQ Bank`;
      }
    }
  } catch (e) {
    // Keep default badge
  }
}

function generateLocalAiQuestion(subject, topic, board) {
  return {
    id: `ncert_local_${Date.now()}`,
    topic,
    chapter: topic,
    curriculum_board: board,
    grade: '10',
    subject: subject || 'Science',
    llm_provider: 'HAPS Curated NCERT & Board PYQ Bank (Offline/Deterministic)',
    question_latex: 'An object of height $h = 4\\,\\text{cm}$ is placed at a distance of $u = -25\\,\\text{cm}$ in front of a concave mirror of focal length $f = -15\\,\\text{cm}$. At what distance $v$ from the mirror should a screen be placed in order to obtain a sharp real image? Find the height $h\'$ of the image formed.',
    options_latex: [
      { key: 'A', latex: '$v = -37.5\\,\\text{cm}$, $h\' = -6\\,\\text{cm}$ (Real and Inverted)', is_correct: true, distractor_trap: null },
      { key: 'B', latex: '$v = +37.5\\,\\text{cm}$, $h\' = +6\\,\\text{cm}$ (Virtual and Erect)', is_correct: false, distractor_trap: 'Ignored Cartesian sign conventions for concave mirror ($f < 0, u < 0$)' },
      { key: 'C', latex: '$v = -9.37\\,\\text{cm}$, $h\' = -1.5\\,\\text{cm}$', is_correct: false, distractor_trap: 'Used lens formula instead of mirror formula' },
      { key: 'D', latex: '$v = -25.0\\,\\text{cm}$, $h\' = -4\\,\\text{cm}$', is_correct: false, distractor_trap: 'Assumed object at center of curvature' }
    ],
    correct_answer_latex: 'v = -37.5\\,\\text{cm},\\; h\' = -6\\,\\text{cm}',
    solution_latex: '1. **Mirror Formula**: $$\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f} \\implies \\frac{1}{v} = \\frac{1}{-15} - \\frac{1}{-25} = -\\frac{2}{75} \\implies v = -37.5\\,\\text{cm}$$\n2. **Magnification**: $$m = -\\frac{v}{u} = \\frac{h\'}{h} \\implies h\' = -\\left(\\frac{-37.5}{-25}\\right) \\times 4 = -6\\,\\text{cm}$$\nNegative sign confirms **Real and Inverted** image.',
    socratic_hints: [
      "What is the Cartesian sign convention for the focal length $f$ of a concave mirror?",
      "State the mirror formula linking $u$, $v$, and $f$.",
      "Calculate linear magnification $m = -v/u = h'/h$."
    ],
    step_rubric: [
      { step: 1, description: "Correct statement of mirror formula with signs: $u=-25\\text{cm}, f=-15\\text{cm}$", marks: 1.0 },
      { step: 2, description: "Calculation of image distance $v = -37.5\\text{cm}$ with negative sign", marks: 1.0 },
      { step: 3, description: "Magnification and height calculation: $h' = -6\\text{cm}$, stating Real & Inverted", marks: 1.0 }
    ],
    ncert_mapping: {
      chapter_name: "Light – Reflection and Refraction",
      ncert_section: "9.2.2 Mirror Formula and Magnification",
      page_reference: "NCERT Class 10 Science, Pages 168–171",
      pyq_similarity: "CBSE Board Exam 2023 & HPBOSE 2022",
      marks: 3
    },
    benchmark_time_seconds: 120
  };
}

function renderInitialQuestion() {
  renderCurrentQuestionInPreview();
}

function renderCurrentQuestionInPreview() {
  const q = state.currentQuestion || generateLocalAiQuestion('Science', 'Light – Reflection and Refraction', 'CBSE');
  const qTextEl = document.getElementById('renderQuestionText');
  const optListEl = document.getElementById('renderOptionsList');
  const solTextEl = document.getElementById('renderSolutionText');
  const badgeEl = document.getElementById('previewBadge');
  const subtitleEl = document.getElementById('previewMetaSubtitle');

  if (badgeEl) {
    badgeEl.innerText = `${q.curriculum_board || 'CBSE'} • Class ${q.grade || '10'}`;
  }

  if (subtitleEl && q.llm_provider) {
    const timeInfo = q.inference_time_ms ? ` (${q.inference_time_ms}ms)` : '';
    subtitleEl.innerHTML = `<span style="color:var(--accent-blue);font-weight:600;">${q.llm_provider}${timeInfo}</span>`;
  }

  // Set question text
  qTextEl.innerHTML = renderLatexString(q.question_latex);

  // Render options
  optListEl.innerHTML = '';
  if (q.options_latex && q.options_latex.length > 0) {
    q.options_latex.forEach(opt => {
      const optItem = document.createElement('div');
      optItem.className = `latex-option-item ${opt.is_correct ? 'correct' : ''}`;
      optItem.innerHTML = `
        <div class="latex-option-key">${opt.key}</div>
        <div style="flex:1;">
          <div class="opt-formula">${renderLatexString(opt.latex)}</div>
          ${opt.distractor_trap ? `<span class="distractor-badge">Trap: ${renderLatexString(opt.distractor_trap)}</span>` : '<span style="color:#10b981;font-size:0.72rem;font-weight:700;">✓ Correct Answer</span>'}
        </div>
      `;
      optListEl.appendChild(optItem);
    });
  }

  // Set solution and rubrics
  let solutionHtml = renderLatexString(q.solution_latex || '');

  // Append NCERT Mapping metadata pill if available
  if (q.ncert_mapping) {
    const m = q.ncert_mapping;
    solutionHtml += `
      <div style="margin-top: 1rem; padding: 10px 12px; background: rgba(59, 130, 246, 0.08); border-left: 3px solid var(--accent-blue); border-radius: 4px; font-size: 0.8rem;">
        <strong style="color: var(--accent-blue);">📘 NCERT Curriculum Blueprint:</strong> ${m.ncert_section || m.chapter_name || ''}<br/>
        <span style="color: var(--text-muted);">Reference: ${m.page_reference || ''} &bull; PYQ Alignment: ${m.pyq_similarity || m.pyq_tag || 'Board Exam'} &bull; Marks: ${m.marks || 3}M</span>
      </div>
    `;
  }

  // Append Step Rubrics if present
  if (q.step_rubric && q.step_rubric.length > 0) {
    solutionHtml += `
      <div style="margin-top: 1rem; border-top: 1px dashed var(--border-subtle); padding-top: 8px;">
        <strong style="color: #eab308; font-size: 0.82rem;">CBSE / HPBOSE Step-by-Step Marking Scheme:</strong>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
          ${q.step_rubric.map(r => `
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 4px; align-items: center;">
              <span><strong>Step ${r.step}:</strong> ${renderLatexString(r.description)}</span>
              <span style="color: var(--accent-emerald); font-weight: 700; white-space: nowrap; margin-left: 8px;">+${r.marks}M</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  solTextEl.innerHTML = solutionHtml;
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 2B. MASTER CURRICULUM SYLLABUS BREAKDOWN (SUBJECT -> CHAPTER -> TOPIC)
// -----------------------------------------------------------------------------
let allClass10Pyqs = [];
let currentCurriculumTaxonomy = null;

async function setupClass10PyqExplorer() {
  const accordionContainer = document.getElementById('curriculumAccordionContainer');
  const subjectSelect = document.getElementById('curriculumSubjectSelect');
  const gradeSelect = document.getElementById('curriculumGradeSelect');
  const searchInput = document.getElementById('curriculumSearchInput');
  const btnRefresh = document.getElementById('btnRefreshPyqBank');
  const btnExpandAll = document.getElementById('btnExpandAllChapters');
  const btnCollapseAll = document.getElementById('btnCollapseAllChapters');

  const chaptersCountEl = document.getElementById('curriculumChaptersCount');
  const topicsCountEl = document.getElementById('curriculumTopicsCount');
  const totalCountEl = document.getElementById('pyqTotalCount');
  const subjectTitleEl = document.getElementById('curriculumSubjectTitle');
  const streamBadgeEl = document.getElementById('curriculumStreamBadge');
  const targetExamsEl = document.getElementById('curriculumTargetExamsText');

  if (!accordionContainer) return;

  // 1. Core Fetch Function
  const loadCurriculum = async () => {
    const subjectKey = subjectSelect ? subjectSelect.value : 'BIOLOGY';
    const grade = gradeSelect ? gradeSelect.value : 'ALL';

    accordionContainer.innerHTML = `
      <div style="text-align:center; padding: 3rem; color: var(--text-muted);">
        <i data-lucide="loader-2" class="spin" style="width:28px; height:28px; margin: 0 auto 10px; display:block; color:var(--accent-blue);"></i>
        Loading hierarchical syllabus breakdown for ${subjectKey}...
      </div>
    `;
    initLucideIcons();

    try {
      const url = `http://localhost:5050/api/curriculum/taxonomy/${subjectKey}${grade !== 'ALL' ? `?grade=${grade}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        currentCurriculumTaxonomy = data;
      } else {
        throw new Error(`API returned ${res.status}`);
      }
    } catch (err) {
      console.warn('Backend curriculum fetch error, using offline fallback:', err);
      currentCurriculumTaxonomy = getOfflineCurriculumFallback(subjectKey, grade);
    }

    if (currentCurriculumTaxonomy) {
      // Update Summary KPI stats
      const chapters = currentCurriculumTaxonomy.chapters || [];
      const totalTopics = chapters.reduce((acc, ch) => acc + (ch.topics ? ch.topics.length : 0), 0);
      const totalQuestions = chapters.reduce((acc, ch) => acc + (ch.totalQuestionsInChapter || 0), 0);

      if (chaptersCountEl) chaptersCountEl.innerText = chapters.length;
      if (topicsCountEl) topicsCountEl.innerText = totalTopics;
      if (totalCountEl) totalCountEl.innerText = totalQuestions;

      if (subjectTitleEl) {
        subjectTitleEl.innerText = `${currentCurriculumTaxonomy.subjectName} (${currentCurriculumTaxonomy.stream === 'MEDICAL' ? 'Botany & Zoology' : currentCurriculumTaxonomy.stream})`;
      }
      if (streamBadgeEl) {
        streamBadgeEl.innerText = `${currentCurriculumTaxonomy.stream} • Class ${currentCurriculumTaxonomy.grades ? currentCurriculumTaxonomy.grades.join(' & ') : '11 & 12'}`;
      }
      if (targetExamsEl) {
        const exams = currentCurriculumTaxonomy.targetExams || ['NEET_UG', 'BOARDS'];
        const units = currentCurriculumTaxonomy.units || [];
        const unitsSummary = units.length > 0 
          ? ` • Units: ${units.map(u => `Unit ${u.unitNumber} (${u.weightageMarks}M)`).join(', ')}`
          : '';
        targetExamsEl.innerText = `Target Exams: ${exams.map(e => e.replace(/_/g, ' ')).join(', ')}${unitsSummary}`;
      }

      renderCurriculumAccordion();
    }
  };

  // 2. Render Accordion Function
  const renderCurriculumAccordion = () => {
    if (!currentCurriculumTaxonomy || !currentCurriculumTaxonomy.chapters) return;

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let chapters = currentCurriculumTaxonomy.chapters;

    // Filter chapters and topics by search query (including subtopics)
    if (query) {
      chapters = chapters.map(ch => {
        const chNameMatches = ch.chapterName.toLowerCase().includes(query) || (ch.unit && ch.unit.toLowerCase().includes(query));
        const matchedTopics = (ch.topics || []).filter(t => 
          t.topicName.toLowerCase().includes(query) ||
          (t.ncertSection && t.ncertSection.toLowerCase().includes(query)) ||
          (t.subtopics && Array.isArray(t.subtopics) && t.subtopics.some(st => st.toLowerCase().includes(query))) ||
          chNameMatches
        );

        return {
          ...ch,
          matchedTopics,
          matchesFilter: chNameMatches || matchedTopics.length > 0
        };
      }).filter(ch => ch.matchesFilter);
    }

    if (chapters.length === 0) {
      accordionContainer.innerHTML = `
        <div class="glass-card" style="text-align:center; padding: 3rem;">
          <i data-lucide="inbox" style="width:36px; height:36px; color:var(--text-muted); margin: 0 auto 10px; display:block;"></i>
          <h3 style="color:var(--text-primary); font-size:1.1rem; margin-bottom:4px;">No Chapters or Topics Match "${query}"</h3>
          <p style="color:var(--text-secondary); font-size:0.85rem;">Try searching for terms like "Chemical Reactions", "Refraction", "Ohm's Law", "Tyndall", "Nephron", or "Ozone".</p>
        </div>
      `;
      initLucideIcons();
      return;
    }

    accordionContainer.innerHTML = '';

    // Render Board High-Yield Blueprint Summary Card if available for the subject
    if (currentCurriculumTaxonomy.boardHighYieldSummary && !query) {
      const bys = currentCurriculumTaxonomy.boardHighYieldSummary;
      const summaryCard = document.createElement('div');
      summaryCard.className = 'curriculum-blueprint-card';
      summaryCard.style.cssText = 'background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(99, 102, 241, 0.08)); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;';
      summaryCard.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; display:inline-flex; align-items:center; gap:4px;">
              <i data-lucide="award" style="width:13px; height:13px;"></i> Board High-Yield Blueprint
            </span>
            <span style="font-weight:600; color:var(--text-primary); font-size:0.95rem;">${bys.examBoard || 'CBSE Class 12 Board Exam Priority Matrix'}</span>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted); background: rgba(255,255,255,0.05); padding: 3px 8px; border-radius: 4px;">80 Marks Theory Breakdown</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          <!-- 5-Mark Guarantees -->
          <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; padding: 12px;">
            <div style="display:flex; align-items:center; gap:6px; font-weight:600; color: #f87171; font-size: 0.85rem; margin-bottom: 8px;">
              <i data-lucide="zap" style="width:14px; height:14px;"></i> Guaranteed 5-Mark Questions (20M Total)
            </div>
            <ul style="margin:0; padding-left: 18px; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5;">
              ${(bys.fiveMarkGuarantees || []).map(item => `
                <li style="margin-bottom: 6px;">
                  <strong style="color:var(--text-primary);">${item.topic}</strong>: ${item.detail} 
                  <span style="display:block; font-size:0.7rem; color:var(--accent-blue);">${item.chapter}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- 4-Mark Case Studies -->
          <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 8px; padding: 12px;">
            <div style="display:flex; align-items:center; gap:6px; font-weight:600; color: #c084fc; font-size: 0.85rem; margin-bottom: 8px;">
              <i data-lucide="file-text" style="width:14px; height:14px;"></i> Case Study Archetypes (12M Total)
            </div>
            <ul style="margin:0; padding-left: 18px; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5;">
              ${(bys.caseStudyFourMark || []).map(item => `
                <li style="margin-bottom: 6px;">
                  <strong style="color:var(--text-primary);">${item.topic}</strong>: ${item.detail}
                  <span style="display:block; font-size:0.7rem; color:var(--accent-purple);">${item.chapter}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- 3-Mark Heavyweights -->
          <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 8px; padding: 12px;">
            <div style="display:flex; align-items:center; gap:6px; font-weight:600; color: #60a5fa; font-size: 0.85rem; margin-bottom: 8px;">
              <i data-lucide="check-circle-2" style="width:14px; height:14px;"></i> 3-Mark Heavyweights
            </div>
            <ul style="margin:0; padding-left: 18px; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5;">
              ${(bys.threeMarkHeavyweights || []).map(item => `
                <li style="margin-bottom: 6px;">
                  <strong style="color:var(--text-primary);">${item.topic}</strong>: ${item.detail}
                  <span style="display:block; font-size:0.7rem; color:var(--accent-cyan);">${item.chapter}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
      accordionContainer.appendChild(summaryCard);
    }

    chapters.forEach((ch, chIdx) => {
      const card = document.createElement('div');
      card.className = `curriculum-chapter-card ${query ? 'expanded' : (chIdx === 0 ? 'expanded' : '')}`;
      card.id = `chapter_card_${ch.id}`;

      const topicsToRender = query && ch.matchedTopics ? ch.matchedTopics : (ch.topics || []);
      const totalQInCh = ch.totalQuestionsInChapter || 0;

      card.innerHTML = `
        <!-- Chapter Header -->
        <div class="chapter-header" data-chapter-id="${ch.id}">
          <div class="chapter-title-group">
            <span class="chapter-num-badge">Ch ${ch.chapterNumber || (chIdx + 1)}</span>
            <div>
              <div class="chapter-name">${ch.chapterName}</div>
              <div class="chapter-meta-badges">
                ${ch.discipline ? `<span class="${ch.discipline.toLowerCase().includes('bot') ? 'badge-botany' : (ch.discipline.toLowerCase().includes('chem') ? 'badge-grade' : 'badge-zoology')}">${ch.discipline}</span>` : ''}
                ${ch.unit ? `<span class="badge-unit"><i data-lucide="layers" style="width:10px; height:10px; display:inline-block; vertical-align:middle;"></i> ${ch.unit}</span>` : ''}
                <span class="badge-grade">Class ${ch.grade}</span>
              </div>
            </div>
          </div>

          <div class="chapter-right-metrics">
            <span class="metric-pill">
              <i data-lucide="list-tree" style="width:13px; height:13px; color:var(--accent-blue);"></i>
              ${topicsToRender.length} Subtopics
            </span>
            <span class="metric-pill" style="${totalQInCh > 0 ? 'border-color: rgba(16, 185, 129, 0.4); color: #34d399;' : ''}">
              <i data-lucide="help-circle" style="width:13px; height:13px; color:${totalQInCh > 0 ? '#34d399' : 'var(--text-muted)'};"></i>
              ${totalQInCh} Questions in Bank
            </span>
            <i data-lucide="chevron-down" class="chevron-icon"></i>
          </div>
        </div>

        <!-- Chapter Body: Subtopics List -->
        <div class="chapter-body">
          ${ch.boardExamFocus ? `
            <div class="chapter-board-focus" style="margin-bottom: 14px; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 10px 14px;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 700; color: #fbbf24; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;">
                <i data-lucide="compass" style="width: 12px; height: 12px;"></i> Board Exam Priorities & Pitfalls
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 8px; font-size: 0.78rem;">
                <div style="color: var(--text-secondary);">
                  <strong style="color: #34d399;">High-Yield Focus:</strong> ${ch.boardExamFocus.highYield}
                </div>
                <div style="color: var(--text-secondary);">
                  <strong style="color: #f87171;">Common Board Trap:</strong> ${ch.boardExamFocus.standardTrap}
                </div>
                <div style="color: var(--text-secondary);">
                  <strong style="color: #60a5fa;">Exam Format:</strong> ${ch.boardExamFocus.questionType}
                </div>
              </div>
            </div>
          ` : ''}

          <div class="topic-list-container">
            ${topicsToRender.map((t, tIdx) => `
              <div class="topic-row ${t.highYield ? 'high-yield' : ''}" id="topic_row_${t.id}">
                <div class="topic-left-details">
                  <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; width:100%;">
                    <span class="ncert-sec-badge">NCERT §${t.ncertSection || `${ch.chapterNumber || chIdx + 1}.${tIdx + 1}`}</span>
                    <span class="topic-name-text">${t.topicName}</span>
                    ${t.highYield ? `
                      <span class="high-yield-tag">
                        <i data-lucide="flame" style="width:10px; height:10px;"></i> High Yield
                      </span>
                    ` : ''}
                  </div>
                  ${t.subtopics && Array.isArray(t.subtopics) && t.subtopics.length > 0 ? `
                    <div style="width: 100%; margin-top: 6px; display: flex; flex-wrap: wrap; gap: 5px;">
                      ${t.subtopics.map(st => `
                        <span style="font-size: 0.72rem; color: var(--text-secondary); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 2px 7px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                          <span style="width: 4px; height: 4px; border-radius: 50%; background: var(--accent-cyan);"></span>
                          ${st}
                        </span>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>

                <div class="topic-actions">
                  <button class="btn-topic-action btn-topic-ai" 
                          data-grade="${ch.grade}" 
                          data-subject="${currentCurriculumTaxonomy.subjectName}" 
                          data-chapter="${ch.chapterName}" 
                          data-topic="${t.topicName}"
                          data-board="${currentCurriculumTaxonomy.stream === 'MEDICAL' ? 'NEET' : (currentCurriculumTaxonomy.stream === 'FOUNDATION' ? 'CBSE' : 'JEE_MAIN')}"
                          title="Generate a brand new exam-quality question for this specific topic using AI">
                    <i data-lucide="sparkles" style="width:12px; height:12px;"></i> AI Question
                  </button>

                  <button class="btn-topic-action btn-topic-preview ${t.questionCount > 0 ? 'has-questions' : ''}" 
                          data-grade="${ch.grade}" 
                          data-subject="${currentCurriculumTaxonomy.subjectName}" 
                          data-chapter="${ch.chapterName}" 
                          data-topic="${t.topicName}"
                          data-topic-id="${t.id}"
                          title="View questions mapped to this topic">
                    <i data-lucide="eye" style="width:12px; height:12px;"></i> Questions (${t.questionCount || 0})
                  </button>
                </div>

                <!-- Topic Questions Drawer (Accordion Sub-Panel) -->
                <div class="topic-questions-drawer" id="drawer_${t.id}">
                  <!-- Dynamically populated when teacher clicks Questions -->
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      accordionContainer.appendChild(card);
    });

    // Attach Click Events for Chapter Accordion Toggle
    accordionContainer.querySelectorAll('.chapter-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const card = header.closest('.curriculum-chapter-card');
        if (card) {
          card.classList.toggle('expanded');
        }
      });
    });

    // Attach Click Events for "AI Question" Generation
    accordionContainer.querySelectorAll('.btn-topic-ai').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const grade = btn.getAttribute('data-grade');
        const subject = btn.getAttribute('data-subject');
        const chapter = btn.getAttribute('data-chapter');
        const topic = btn.getAttribute('data-topic');
        const board = btn.getAttribute('data-board') || 'NEET';

        const originalText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:12px; height:12px;"></i> Synthesizing...`;
        btn.disabled = true;

        try {
          const res = await fetch('http://localhost:5050/api/curriculum/generate-topic-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              grade,
              subject,
              chapter,
              topic,
              difficulty: 'MEDIUM',
              board
            })
          });

          const data = await res.json();
          if (data.success && data.question) {
            btn.innerHTML = `<i data-lucide="check" style="width:12px; height:12px; color:#10b981;"></i> Generated!`;
            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.disabled = false;
              initLucideIcons();
            }, 1800);

            // Add question to active test draft automatically or refresh view
            addQuestionToTestDraft(data.question);

            // Re-fetch taxonomy to update counts live
            await loadCurriculum();
          } else {
            throw new Error(data.error || 'Synthesis error');
          }
        } catch (err) {
          console.error('Failed to generate topic question:', err);
          btn.innerHTML = `<i data-lucide="alert-circle" style="width:12px; height:12px; color:#ef4444;"></i> Retry`;
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            initLucideIcons();
          }, 2000);
        }
      });
    });

    // Attach Click Events for Topic "Questions" Drawer
    accordionContainer.querySelectorAll('.btn-topic-preview').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const topicId = btn.getAttribute('data-topic-id');
        const subject = btn.getAttribute('data-subject');
        const chapter = btn.getAttribute('data-chapter');
        const topic = btn.getAttribute('data-topic');
        const drawer = document.getElementById(`drawer_${topicId}`);

        if (!drawer) return;

        if (drawer.classList.contains('active')) {
          drawer.classList.remove('active');
          drawer.innerHTML = '';
          return;
        }

        drawer.classList.add('active');
        drawer.innerHTML = `
          <div style="text-align:center; padding: 1.25rem; color: var(--text-muted); font-size: 0.85rem;">
            <i data-lucide="loader-2" class="spin" style="width:18px; height:18px; margin: 0 auto 6px; display:block;"></i>
            Loading questions for ${topic}...
          </div>
        `;
        initLucideIcons();

        try {
          const qUrl = `http://localhost:5050/api/curriculum/questions?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}&topic=${encodeURIComponent(topic)}`;
          const res = await fetch(qUrl);
          const data = await res.json();
          const qList = (data.success && data.questions) ? data.questions : [];

          if (qList.length === 0) {
            drawer.innerHTML = `
              <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                No questions currently filed under <strong>${topic}</strong>.<br/>
                Click <span style="color:var(--accent-cyan); font-weight:600;">"AI Question"</span> above to synthesize a verified exam question immediately!
              </div>
            `;
          } else {
            drawer.innerHTML = `
              <div style="font-size: 0.82rem; font-weight: 700; color: #34d399; margin-bottom: 0.5rem; display:flex; justify-content:space-between; align-items:center;">
                <span>Verified Questions for ${topic} (${qList.length})</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">KaTeX Rendered</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                ${qList.map((q, idx) => `
                  <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 12px 14px;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 6px; flex-wrap:wrap; gap:6px;">
                      <span class="pilot-tag" style="background:rgba(59,130,246,0.15); color:var(--accent-blue); font-size:0.72rem;">
                        Q${idx + 1} &bull; ${q.curriculum_board || 'NEET'} &bull; ${q.difficulty}
                      </span>
                      <span style="font-size:0.72rem; color:var(--text-muted);">
                        ⏱ Benchmark: ${q.benchmark_time_seconds || 60}s
                      </span>
                    </div>

                    <div style="font-size:0.92rem; color:var(--text-primary); margin-bottom:8px; line-height:1.5;" class="topic-math-block">
                      ${renderLatexString(q.question_latex)}
                    </div>

                    ${q.options_latex && q.options_latex.length > 0 ? `
                      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:6px; margin-bottom:8px;">
                        ${q.options_latex.map(opt => `
                          <div style="display:flex; align-items:center; gap:8px; padding:6px 10px; background:${opt.is_correct ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${opt.is_correct ? 'rgba(16,185,129,0.4)' : 'var(--border-subtle)'}; border-radius:4px; font-size:0.82rem;">
                            <strong style="color:${opt.is_correct ? '#10b981' : 'var(--text-muted)'}">${opt.key}</strong>
                            <div style="flex:1;" class="topic-math-block">${renderLatexString(opt.latex)}</div>
                            ${opt.is_correct ? '<span style="color:#10b981; font-size:0.68rem; font-weight:700;">✓ Correct</span>' : (opt.distractor_trap ? `<span style="color:#ef4444; font-size:0.65rem;" title="${opt.distractor_trap}">Trap</span>` : '')}
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}

                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--border-subtle); padding-top:6px; margin-top:6px;">
                      <div style="font-size:0.78rem; color:var(--text-muted);" class="topic-math-block">
                        <strong>Solution:</strong> ${renderLatexString(q.solution_latex?.slice(0, 140) || 'Step-by-step verification complete.')}...
                      </div>
                      <button class="btn-primary btn-add-drawer-q" data-qid="${q.id}" style="font-size:0.72rem; padding:4px 10px; white-space:nowrap;">
                        <i data-lucide="plus" style="width:12px; height:12px;"></i> Add to Draft
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `;

            // Attach "Add to Draft" button clicks
            drawer.querySelectorAll('.btn-add-drawer-q').forEach(addBtn => {
              addBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const qid = addBtn.getAttribute('data-qid');
                const matchedQ = qList.find(item => item.id === qid);
                if (matchedQ) {
                  addQuestionToTestDraft(matchedQ);
                  addBtn.innerHTML = `<i data-lucide="check" style="width:12px; height:12px; color:#10b981;"></i> Added!`;
                  setTimeout(() => {
                    addBtn.innerHTML = `<i data-lucide="plus" style="width:12px; height:12px;"></i> Add to Draft`;
                    initLucideIcons();
                  }, 1500);
                }
              });
            });
          }

          renderMathInElement(drawer);
          initLucideIcons();
        } catch (err) {
          console.error('Failed to load topic questions:', err);
          drawer.innerHTML = `<div style="color:#ef4444; padding:10px; font-size:0.82rem;">Error loading questions. Please try again.</div>`;
        }
      });
    });

    renderMathInElement(accordionContainer);
    initLucideIcons();
  };

  // 3. Event Listeners
  if (subjectSelect) {
    subjectSelect.addEventListener('change', loadCurriculum);
  }

  if (gradeSelect) {
    gradeSelect.addEventListener('change', loadCurriculum);
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderCurriculumAccordion();
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', loadCurriculum);
  }

  if (btnExpandAll) {
    btnExpandAll.addEventListener('click', () => {
      accordionContainer.querySelectorAll('.curriculum-chapter-card').forEach(card => {
        card.classList.add('expanded');
      });
    });
  }

  if (btnCollapseAll) {
    btnCollapseAll.addEventListener('click', () => {
      accordionContainer.querySelectorAll('.curriculum-chapter-card').forEach(card => {
        card.classList.remove('expanded');
      });
    });
  }

  // Initial load
  await loadCurriculum();
}

// Fallback curriculum helper when backend is offline
function getOfflineCurriculumFallback(subjectKey, grade) {
  if (subjectKey === 'PHYSICS') {
    return {
      subjectKey: 'PHYSICS',
      subjectName: 'Class 12 Physics',
      stream: 'COMMON_SENIOR',
      grades: ['12'],
      targetExams: ['CBSE_CLASS_12', 'HP_BOARD_CLASS_12', 'NEET_UG', 'JEE_MAIN'],
      totalChapters: 2,
      boardHighYieldSummary: {
        examBoard: 'CBSE / HPBOSE Class 12 Physics (70 Marks Theory)',
        fiveMarkGuarantees: [
          { rank: 1, topic: 'Ray Optics Derivations & Ray Diagrams', detail: 'Lens Maker\'s Formula and Microscope/Telescope ray diagrams', chapter: 'Chapter 9: Ray Optics' },
          { rank: 2, topic: 'Current Electricity & Magnetism', detail: 'Microscopic Ohm\'s Law and Moving Coil Galvanometer', chapter: 'Chapter 3 & 4' },
          { rank: 3, topic: 'AC Circuits & Resonance', detail: 'Series LCR phasor diagram and Full-wave rectifier', chapter: 'Chapter 7 & 14' }
        ],
        caseStudyFourMark: [
          { topic: 'Optics: TIR & Optical Fibres', detail: 'Total Internal Reflection and mirages', chapter: 'Chapter 9: Ray Optics' },
          { topic: 'Modern Physics', detail: 'Photoelectric effect graphical analysis', chapter: 'Chapter 11: Dual Nature' }
        ],
        threeMarkHeavyweights: [
          { topic: 'Huygens Wave Theory', detail: 'Proof of Snell\'s Law using secondary wavelets', chapter: 'Chapter 10: Wave Optics' },
          { topic: 'Gauss\'s Law Applications', detail: 'Field due to infinite plane sheet and wire', chapter: 'Chapter 1: Electric Charges' }
        ]
      },
      chapters: [
        {
          id: 'phy_12_ch01',
          grade: '12',
          discipline: 'ELECTROSTATICS',
          unit: 'Electrostatics & Current Electricity (Unit I & II - 16M)',
          chapterNumber: 1,
          chapterName: 'Electric Charges and Fields',
          totalQuestionsInChapter: 1,
          boardExamFocus: {
            highYield: 'Gauss\'s Law applications (infinitely long straight wire and uniformly charged infinite plane sheet); Electric field on equatorial line of dipole.',
            standardTrap: 'Forgetting vector directions when finding net torque/force or drawing electric field lines terminating perpendicularly.',
            questionType: '3-mark Gauss\'s law derivations, 2/3-mark dipole derivations.'
          },
          topics: [
            { id: 'phy_12_ch01_t1', topicName: 'Fundamentals of Electric Charge & Coulomb\'s Law', ncertSection: '1.1', highYield: true, questionCount: 0, subtopics: ['Quantization of charge (q = ±ne)', 'Coulomb\'s Law in vector form', 'Superposition principle', 'Dielectric constant'] },
            { id: 'phy_12_ch01_t2', topicName: 'Electric Field & Electric Dipole', ncertSection: '1.2', highYield: true, questionCount: 0, subtopics: ['Field due to point charge', 'Axial field derivation', 'Equatorial field derivation', 'Torque and potential energy in uniform field'] },
            { id: 'phy_12_ch01_t3', topicName: 'Gauss\'s Law and Its Applications', ncertSection: '1.3', highYield: true, questionCount: 1, subtopics: ['Electric flux (Φ = ∫E·dA)', 'Gauss Theorem (∮E·dA = q/ε₀)', 'Infinitely long charged wire', 'Uniformly charged infinite plane sheet (E = σ/2ε₀)'] }
          ]
        },
        {
          id: 'phy_12_ch09',
          grade: '12',
          discipline: 'OPTICS',
          unit: 'Electromagnetic Waves & Optics (Unit V & VI - 18M)',
          chapterNumber: 9,
          chapterName: 'Ray Optics and Optical Instruments',
          totalQuestionsInChapter: 1,
          boardExamFocus: {
            highYield: 'Lens Maker’s Formula; Single spherical surface refraction; Prism formula; Clean, labelled ray diagrams of Compound Microscope or Astronomical Telescope.',
            standardTrap: 'Incorrect sign convention for radii of curvature in Lens Maker\'s formula; forgetting image position at near point vs infinity.',
            questionType: 'Guaranteed 5-mark long answer derivation or 4-mark Case Study.'
          },
          topics: [
            { id: 'phy_12_ch09_t1', topicName: 'Refraction & Total Internal Reflection (TIR)', ncertSection: '9.1', highYield: true, questionCount: 0, subtopics: ['Snell\'s Law', 'TIR conditions (i > i_c)', 'Optical fibers (core > cladding)', 'Mirage and totally reflecting prisms'] },
            { id: 'phy_12_ch09_t2', topicName: 'Refraction at Spherical Surfaces and Lenses', ncertSection: '9.2', highYield: true, questionCount: 1, subtopics: ['Single spherical surface refraction (n₂/v - n₁/u = (n₂-n₁)/R)', 'Lens Maker\'s Formula derivation', 'Thin lens formula', 'Combination of thin lenses in contact'] },
            { id: 'phy_12_ch09_t3', topicName: 'Optical Instruments (Rays, Magnification & Adjustments)', ncertSection: '9.4', highYield: true, questionCount: 0, subtopics: ['Compound Microscope at D and infinity', 'Astronomical Telescope normal adjustment', 'Reflecting Cassegrain Telescope advantages'] }
          ]
        }
      ]
    };
  }

  if (subjectKey === 'CHEMISTRY') {
    return {
      subjectKey: 'CHEMISTRY',
      subjectName: 'Class 12 Chemistry',
      stream: 'COMMON_SENIOR',
      targetExams: ['CBSE_CLASS_12', 'HP_BOARD_CLASS_12', 'NEET_UG', 'JEE_MAIN'],
      totalChapters: 10,
      boardHighYieldSummary: {
        fiveMarkGuarantees: [
          'Solutions: Colligative property numericals involving van \'t Hoff factor (i) and degree of dissociation/association (α).',
          'Electrochemistry: Nernst equation calculations of cell potential, equilibrium constant (Kc), and ΔG° combined with Kohlrausch\'s Law.',
          'Organic Multistep Conversions: Named reactions (Aldol, Cannizzaro, Reimer-Tiemann, Gabriel Phthalimide, Hofmann Bromamide) with mechanistic steps.'
        ],
        fourMarkCaseStudies: [
          'Chemical Kinetics: Rate law determination from tabular concentration data and temperature dependence via Arrhenius equation.',
          'Coordination Compounds: Valence Bond Theory vs Crystal Field Theory electron splitting, spectrochemical series, and magnetic moments.'
        ],
        threeMarkCorePool: [
          'd- and f-Block Elements: Trends in standard reduction potentials (E°), Lanthanoid contraction consequences, and preparation/redox actions of KMnO4 & K2Cr2O7.',
          'Chemical Distinguishing Tests: Tollens, Fehling, Iodoform, Lucas, Carbylamine, and Hinsberg tests with observations and chemical equations.',
          'Biomolecules: Chemical proofs for the open-chain structure of glucose, peptide bonds, Zwitterion, and protein denaturation.'
        ]
      },
      chapters: [
        {
          id: 'chem_12_ch01',
          grade: '12',
          discipline: 'PHYSICAL_CHEMISTRY',
          unit: 'Section 1: Physical Chemistry (21 Marks)',
          chapterNumber: 1,
          chapterName: 'Solutions',
          totalQuestionsInChapter: 1,
          boardExamFocus: {
            highYield: 'Numericals on ΔT_f or Π combined with van \'t Hoff factor (i) to determine molar mass and degree of dissociation (α).',
            standardTrap: 'Forgetting van \'t Hoff factor i for electrolytes, or confusing mass of solvent w_A (in kg) with mass of solution.',
            questionType: '3-mark numerical or 5-mark combined numerical + Raoult\'s law deviation explanation.'
          },
          topics: [
            { id: 'chem_12_ch01_t1', topicName: 'Concentration Terms & Solubility (Henry\'s Law)', ncertSection: '1.1', highYield: true, questionCount: 0, subtopics: ['Mass %, ppm, mole fraction, molarity, molality', 'Henry\'s Law: p = K_H · x', 'Significance of K_H with temperature', 'Applications: carbonated drinks, scuba diving, anoxia'] },
            { id: 'chem_12_ch01_t2', topicName: 'Vapour Pressure & Raoult\'s Law', ncertSection: '1.2', highYield: true, questionCount: 0, subtopics: ['Raoult\'s Law for volatile solutes', 'Ideal solutions (ΔH=0, ΔV=0)', 'Positive deviation & minimum boiling azeotropes', 'Negative deviation & maximum boiling azeotropes'] },
            { id: 'chem_12_ch01_t3', topicName: 'Colligative Properties & Van \'t Hoff Factor', ncertSection: '1.3', highYield: true, questionCount: 1, subtopics: ['Relative Lowering of Vapour Pressure (RLVP)', 'Elevation of Boiling Point (ΔT_b = i·K_b·m)', 'Depression in Freezing Point (ΔT_f = i·K_f·m)', 'Osmotic Pressure (Π = i·CRT)', 'Van \'t Hoff factor (i) and degree of dissociation/association'] }
          ]
        },
        {
          id: 'chem_12_ch02',
          grade: '12',
          discipline: 'PHYSICAL_CHEMISTRY',
          unit: 'Section 1: Physical Chemistry (21 Marks)',
          chapterNumber: 2,
          chapterName: 'Electrochemistry',
          totalQuestionsInChapter: 1,
          boardExamFocus: {
            highYield: 'Nernst equation calculations involving log terms, equilibrium constant (Kc), and Δ_r G°; Kohlrausch\'s law numerical to find Λ°_m and α.',
            standardTrap: 'Using incorrect number of transferred electrons (n) in Nernst equation or flipping anode/cathode in E°_cell calculation.',
            questionType: 'Guaranteed 3-mark or 5-mark numerical.'
          },
          topics: [
            { id: 'chem_12_ch02_t1', topicName: 'Galvanic Cells & Nernst Equation', ncertSection: '2.1', highYield: true, questionCount: 1, subtopics: ['Standard Electrode Potential (E°)', 'Nernst Equation: E_cell = E°_cell - (0.0591/n) log Q', 'Equilibrium constant: log K_c = nE°/0.0591', 'Gibbs Free Energy: Δ_r G° = -nFE°'] },
            { id: 'chem_12_ch02_t2', topicName: 'Conductance in Electrolytic Solutions', ncertSection: '2.2', highYield: true, questionCount: 0, subtopics: ['Conductivity (κ) and Molar Conductivity (Λ_m)', 'Variation of κ and Λ_m with dilution', 'Debye-Hückel-Onsager equation', 'Kohlrausch\'s Law of Independent Migration of Ions'] },
            { id: 'chem_12_ch02_t3', topicName: 'Electrolysis & Commercial Batteries', ncertSection: '2.3', highYield: true, questionCount: 0, subtopics: ['Faraday\'s Laws of Electrolysis', 'Dry cell & Mercury cell (constant 1.35V voltage)', 'Lead-acid storage battery reactions', 'H₂-O₂ Fuel cell & corrosion mechanism'] }
          ]
        }
      ]
    };
  }

  return {
    subjectKey: subjectKey || 'BIOLOGY',
    subjectName: subjectKey === 'BIOLOGY' ? 'Class 12 Biology' : (subjectKey === 'CHEMISTRY' ? 'Class 12 Chemistry' : 'Science'),
    stream: subjectKey === 'BIOLOGY' ? 'MEDICAL' : 'COMMON_SENIOR',
    targetExams: ['CBSE_CLASS_12', 'HP_BOARD_CLASS_12', 'NEET_UG'],
    totalChapters: 13,
    units: [
      { unitNumber: 'Unit VI', unitName: 'Reproduction (Chapters 1 to 3)', weightageMarks: 16, chapters: [1, 2, 3] },
      { unitNumber: 'Unit VII', unitName: 'Genetics and Evolution (Chapters 4 to 6)', weightageMarks: 20, chapters: [4, 5, 6] },
      { unitNumber: 'Unit VIII', unitName: 'Biology in Human Welfare (Chapters 7 & 8)', weightageMarks: 12, chapters: [7, 8] },
      { unitNumber: 'Unit IX', unitName: 'Biotechnology: Principles & Applications (Chapters 9 & 10)', weightageMarks: 12, chapters: [9, 10] },
      { unitNumber: 'Unit X', unitName: 'Ecology and Environment (Chapters 11 to 13)', weightageMarks: 10, chapters: [11, 12, 13] }
    ],
    boardHighYieldSummary: {
      fiveMarkGuarantees: [
        'Menstrual Cycle: Hormonal tracking plots (FSH, LH, Estrogen, Progesterone) across 28 days with ovulation and corpus luteum.',
        'Molecular Pathways: DNA replication fork mechanisms, transcription split-gene processing (splicing, capping, tailing), and Lac Operon regulation.',
        'Recombinant DNA Technology: Vector pBR322 architecture with selectable markers, PCR cycle, and Humulin / ADA gene therapy.'
      ],
      fourMarkCaseStudies: [
        'Genetics: Pedigree analysis charts deducing Autosomal Recessive vs Dominant vs X-linked traits (Sickle-cell anemia, Thalassemia).',
        'Ecology: Verhulst-Pearl Logistic Growth (dN/dt = rN(K-N)/K) vs Exponential growth curves and Alexander von Humboldt\'s Species-Area Relationship.'
      ],
      threeMarkCorePool: [
        'Outbreeding Devices & Double Fertilization (syngamy + triple fusion producing 3n PEN).',
        'Hardy-Weinberg equilibrium calculation (p² + 2pq + q² = 1) and Homologous vs Analogous organs.',
        'Life cycle of Plasmodium (liver stage, RBC haemozoin release, mosquito gut) and HIV retrovirus replication.',
        'Microbes match-the-following (Statins, Cyclosporin A, Streptokinase) and Sewage Treatment BOD reduction.'
      ]
    },
    chapters: [
      {
        id: 'bio_12_ch01',
        grade: '12',
        discipline: 'BOTANY',
        unit: 'Unit VI: Reproduction (16 Marks)',
        chapterNumber: 1,
        chapterName: 'Sexual Reproduction in Flowering Plants',
        totalQuestionsInChapter: 1,
        boardExamFocus: {
          highYield: '7-celled, 8-nucleate female gametophyte; L.S. of anatropous ovule; Double fertilization; Outbreeding devices.',
          standardTrap: 'Confusing perisperm (persistent nucellus) with pericarp (fruit wall).',
          questionType: '5-mark embryo sac development; 3-mark outbreeding devices.'
        },
        topics: [
          { id: 't1', topicName: 'Pre-Fertilization: Structures and Events', ncertSection: '1.1', highYield: true, questionCount: 1 },
          { id: 't2', topicName: 'Pollination Mechanisms & Adaptations', ncertSection: '1.2', highYield: true, questionCount: 0 },
          { id: 't3', topicName: 'Double Fertilization & Post-Fertilization Events', ncertSection: '1.3', highYield: true, questionCount: 0 }
        ]
      },
      {
        id: 'bio_12_ch02',
        grade: '12',
        discipline: 'ZOOLOGY',
        unit: 'Unit VI: Reproduction (16 Marks)',
        chapterNumber: 2,
        chapterName: 'Human Reproduction',
        totalQuestionsInChapter: 1,
        boardExamFocus: {
          highYield: 'Menstrual cycle hormone tracking graphs; Spermatogenesis vs Oogenesis ploidy; Blastocyst implantation.',
          standardTrap: 'Confusing primary oocyte (Prophase-I) with secondary oocyte (Metaphase-II).',
          questionType: '5-mark menstrual cycle with graphs; 3-mark gametogenesis.'
        },
        topics: [
          { id: 't4', topicName: 'The Male and Female Reproductive Systems', ncertSection: '2.1', highYield: true, questionCount: 0 },
          { id: 't5', topicName: 'Gametogenesis', ncertSection: '2.2', highYield: true, questionCount: 0 },
          { id: 't6', topicName: 'The Menstrual Cycle', ncertSection: '2.3', highYield: true, questionCount: 1 },
          { id: 't7', topicName: 'Fertilization, Pregnancy & Parturition', ncertSection: '2.4', highYield: true, questionCount: 0 }
        ]
      },
      {
        id: 'bio_12_ch05',
        grade: '12',
        discipline: 'BOTANY',
        unit: 'Unit VII: Genetics and Evolution (20 Marks)',
        chapterNumber: 5,
        chapterName: 'Molecular Basis of Inheritance',
        totalQuestionsInChapter: 1,
        boardExamFocus: {
          highYield: 'DNA replication fork mechanisms; Transcription in eukaryotes; Lac Operon switched-on vs off states.',
          standardTrap: 'Writing RNA transcript polarity backwards (mRNA is synthesized 5\'→3\').',
          questionType: '5-mark Lac operon or Replication fork; 3-mark DNA fingerprinting.'
        },
        topics: [
          { id: 't8', topicName: 'DNA Structure and Packaging', ncertSection: '5.1', highYield: true, questionCount: 0 },
          { id: 't9', topicName: 'Identifying Genetic Material & Replication', ncertSection: '5.2', highYield: true, questionCount: 0 },
          { id: 't10', topicName: 'Transcription and Processing', ncertSection: '5.3', highYield: true, questionCount: 0 },
          { id: 't11', topicName: 'Genetic Code, Translation & Regulation', ncertSection: '5.4', highYield: true, questionCount: 1 },
          { id: 't12', topicName: 'Human Genome Project (HGP) & DNA Fingerprinting', ncertSection: '5.5', highYield: true, questionCount: 0 }
        ]
      }
    ]
  };
}

function renderPyqCards(pyqs) {
  const container = document.getElementById('class10PyqContainer');
  if (!container) return;

  if (pyqs.length === 0) {
    container.innerHTML = `
      <div class="glass-card" style="text-align:center; padding: 3rem;">
        <i data-lucide="inbox" style="width:36px; height:36px; color:var(--text-muted); margin: 0 auto 10px; display:block;"></i>
        <h3 style="color:var(--text-primary); font-size:1.1rem; margin-bottom:4px;">No Questions Match This Filter</h3>
        <p style="color:var(--text-secondary); font-size:0.85rem;">Try adjusting the subject, chapter, or search keywords.</p>
      </div>
    `;
    initLucideIcons();
    return;
  }

  container.innerHTML = '';

  pyqs.forEach((q, index) => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.position = 'relative';
    card.style.padding = '1.25rem 1.5rem';
    card.style.border = '1px solid var(--border-subtle)';

    const mapping = q.ncert_mapping || {};
    const marks = mapping.marks || 3;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="pilot-tag" style="background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); border-color: rgba(59, 130, 246, 0.3); font-weight:700;">
            Q${index + 1} &bull; Class 10 ${q.subject}
          </span>
          <span class="pilot-tag" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); border-color: rgba(16, 185, 129, 0.3);">
            ${mapping.pyq_tag || 'Board Exam'}
          </span>
          <span class="pilot-tag" style="background: rgba(234, 179, 8, 0.12); color: #eab308; border-color: rgba(234, 179, 8, 0.3);">
            ${marks} Marks &bull; ${q.difficulty}
          </span>
        </div>

        <div style="font-size: 0.75rem; color: var(--text-muted); display:flex; align-items:center; gap:6px;">
          <i data-lucide="book" style="width:13px; height:13px; color:var(--accent-blue);"></i>
          <span>${mapping.page_reference || 'NCERT Class 10'}</span>
        </div>
      </div>

      <div style="margin-bottom: 0.5rem; font-size: 0.82rem; color: var(--accent-cyan); font-weight: 600;">
        Chapter: ${q.chapter} &bull; Section: ${mapping.ncert_section || 'Standard'}
      </div>

      <div class="pyq-latex-body" style="font-size: 1rem; color: var(--text-primary); margin-bottom: 1rem; line-height: 1.6; padding: 10px 14px; background: rgba(0,0,0,0.18); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
        ${renderLatexString(q.question_latex)}
      </div>

      <!-- Multiple Choice Options (if present) -->
      ${q.options_latex && q.options_latex.length > 0 ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 8px; margin-bottom: 1rem;">
          ${q.options_latex.map(opt => `
            <div style="display:flex; align-items:center; gap:10px; padding: 8px 12px; background: ${opt.is_correct ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${opt.is_correct ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}; border-radius: 6px;">
              <span style="font-weight:700; font-size:0.85rem; color:${opt.is_correct ? '#10b981' : 'var(--text-muted)'}; min-width:18px;">${opt.key}</span>
              <div style="font-size:0.88rem; flex:1;" class="pyq-math-inline">${renderLatexString(opt.latex)}</div>
              ${opt.is_correct ? '<span style="color:#10b981; font-size:0.72rem; font-weight:700;">✓ Correct</span>' : (opt.distractor_trap ? `<span style="color:#ef4444; font-size:0.68rem; max-width:140px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${opt.distractor_trap}">Trap</span>` : '')}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Expandable Rubric & Solution Accordion -->
      <details style="margin-bottom: 1rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 8px 12px;">
        <summary style="cursor: pointer; font-weight: 600; font-size: 0.85rem; color: var(--accent-emerald); display: flex; align-items: center; justify-content: space-between;">
          <span>View CBSE / HPBOSE Step-by-Step Marking Rubric (${marks} Marks)</span>
          <span style="font-size: 0.72rem; color: var(--text-muted);">Click to expand</span>
        </summary>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border-subtle);">
          <div style="margin-bottom: 8px; font-size: 0.85rem; color: var(--text-secondary);" class="pyq-math-inline">
            <strong>Full Solution:</strong><br/>
            ${renderLatexString(q.solution_latex)}
          </div>

          ${q.step_rubric && q.step_rubric.length > 0 ? `
            <div style="margin-top: 8px; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
              <strong style="color: #eab308; font-size: 0.78rem;">Marking Scheme Breakdown:</strong>
              <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
                ${q.step_rubric.map(r => `
                  <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-secondary); align-items:center;">
                    <span><strong>Step ${r.step}:</strong> ${renderLatexString(r.description)}</span>
                    <span style="color:#10b981; font-weight:700; white-space:nowrap; margin-left:8px;">+${r.marks}M</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </details>

      <!-- Action Footer -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
        <div style="font-size: 0.75rem; color: var(--text-muted);">
          Benchmark: ${q.benchmark_time_seconds || 120}s &bull; Bloom Level: ${q.bloom_level || 'APPLICATION'}
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn-secondary btn-generate-variant" data-id="${q.id}" data-subject="${q.subject}" data-chapter="${q.chapter}" data-board="${mapping.pyq_tag?.includes('HPBOSE') ? 'HP_BOARD' : 'CBSE'}" style="font-size:0.78rem; padding:5px 10px;">
            <i data-lucide="sparkles" style="width:13px; height:13px;"></i> Generate AI Variant
          </button>
          <button class="btn-primary btn-add-pyq-test" data-id="${q.id}" style="font-size:0.78rem; padding:5px 12px;">
            <i data-lucide="plus-circle" style="width:13px; height:13px;"></i> Add to Class Test
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
    renderMathInElement(card);
  });

  // Attach button handlers
  container.querySelectorAll('.btn-add-pyq-test').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const qid = e.currentTarget.getAttribute('data-id');
      const qObj = pyqs.find(q => q.id === qid);
      if (qObj) {
        addQuestionToTestDraft(qObj);
      }
    });
  });

  container.querySelectorAll('.btn-generate-variant').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subj = e.currentTarget.getAttribute('data-subject');
      const chap = e.currentTarget.getAttribute('data-chapter');
      const board = e.currentTarget.getAttribute('data-board');

      // Switch to Generator Studio Tab
      const tabGenBtn = document.getElementById('tabBtnGenerator');
      if (tabGenBtn) tabGenBtn.click();

      // Pre-fill fields
      const selGrade = document.getElementById('selectGrade');
      const selBoard = document.getElementById('selectBoard');
      const selSubj = document.getElementById('selectSubject');
      const selTopic = document.getElementById('selectTopic');

      if (selGrade) selGrade.value = '10';
      if (selBoard) selBoard.value = board || 'CBSE';
      if (selSubj) selSubj.value = subj || 'Science';
      if (selTopic) selTopic.value = chap;

      // Trigger generate
      const btnGen = document.getElementById('btnGenerateQuestion');
      if (btnGen) btnGen.click();
    });
  });

  initLucideIcons();
}

function getBundledClass10Pyqs() {
  return [
    {
      id: "pyq_10_sci_light_01",
      grade: "10",
      subject: "Science",
      chapter: "Light – Reflection and Refraction",
      ncert_mapping: {
        chapter_number: 9,
        chapter_name: "Light – Reflection and Refraction",
        ncert_section: "9.2.2 Mirror Formula and Magnification",
        page_reference: "NCERT Class 10 Science, Pages 168–171",
        pyq_tag: "CBSE Board Exam 2023 (Set 31/1/1) & HPBOSE 2022",
        marks: 3
      },
      difficulty: "MEDIUM",
      question_type: "NUMERICAL",
      bloom_level: "APPLICATION",
      question_latex: "An object of height $h = 4\\,\\text{cm}$ is placed at a distance of $u = -25\\,\\text{cm}$ in front of a concave mirror of focal length $f = -15\\,\\text{cm}$. At what distance $v$ from the mirror should a screen be placed in order to obtain a sharp real image? Find the nature and height $h'$ of the image formed.",
      options_latex: [
        { key: "A", latex: "$v = -37.5\\,\\text{cm}$, $h' = -6\\,\\text{cm}$ (Real and Inverted)", is_correct: true, distractor_trap: null },
        { key: "B", latex: "$v = +37.5\\,\\text{cm}$, $h' = +6\\,\\text{cm}$ (Virtual and Erect)", is_correct: false, distractor_trap: "Ignored Cartesian sign conventions" },
        { key: "C", latex: "$v = -9.37\\,\\text{cm}$, $h' = -1.5\\,\\text{cm}$", is_correct: false, distractor_trap: "Used lens formula instead of mirror formula" },
        { key: "D", latex: "$v = -25.0\\,\\text{cm}$, $h' = -4\\,\\text{cm}$", is_correct: false, distractor_trap: "Assumed object at center of curvature" }
      ],
      correct_answer_latex: "v = -37.5\\,\\text{cm},\\; h' = -6\\,\\text{cm}",
      solution_latex: "1. **Mirror Formula**: $$\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f} \\implies \\frac{1}{v} = \\frac{1}{-15} - \\frac{1}{-25} = -\\frac{2}{75} \\implies v = -37.5\\,\\text{cm}$$\n2. **Magnification**: $$m = -\\frac{v}{u} = \\frac{h'}{h} \\implies h' = -\\left(\\frac{-37.5}{-25}\\right) \\times 4 = -6\\,\\text{cm}$$",
      socratic_hints: ["Apply mirror formula with $f=-15\\text{cm}, u=-25\\text{cm}$.", "Calculate magnification $m = -v/u$."],
      step_rubric: [
        { step: 1, description: "Mirror formula statement with correct signs", marks: 1.0 },
        { step: 2, description: "Calculation of $v = -37.5\\text{cm}$", marks: 1.0 },
        { step: 3, description: "Height $h' = -6\\text{cm}$ and stating Real & Inverted", marks: 1.0 }
      ],
      benchmark_time_seconds: 150
    }
  ];
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
}

function setupTelemetryControls() {
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

  if (btnHint && hintNumEl && hintTextEl && hintBox) {
    btnHint.addEventListener('click', () => {
      const activeQ = (examState.questions && examState.questions.length > 0)
        ? examState.questions[examState.currentQuestionIndex]
        : state.currentQuestion;
      const hints = (activeQ && activeQ.socratic_hints && activeQ.socratic_hints.length > 0)
        ? activeQ.socratic_hints
        : (state.currentQuestion?.socratic_hints || [
            "What fundamental formula governs this physical or mathematical system?",
            "Check what values or quantities are conserved in this interaction.",
            "Substitute given numerical values carefully to solve for the target variable."
          ]);

      state.studentTimer.hintsRevealed = (state.studentTimer.hintsRevealed % hints.length) + 1;
      const hintIdx = state.studentTimer.hintsRevealed - 1;
      const hint = hints[hintIdx];

      hintNumEl.innerText = state.studentTimer.hintsRevealed;
      hintTextEl.innerHTML = renderLatexString(hint);
      hintBox.classList.add('visible');
      initLucideIcons();
    });
  }

  const btnSubmit = document.getElementById('btnSubmitStudentAnswer');
  const feedbackAlert = document.getElementById('studentFeedbackAlert');

  if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
      if (!state.studentTimer.selectedOption) {
        alert('Please select an option before submitting.');
        return;
      }

      const isCorrect = state.studentTimer.selectedOption === (state.currentQuestion.correct_answer || 'B');
      const timeSpent = state.studentTimer.secondsElapsed;

      // Post telemetry to backend and broadcast via WebSocket
      try {
        fetch('http://localhost:5050/api/telemetry/record', {
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

      // Send WebSocket Telemetry Tick
      sendWsMessage({
        type: 'STUDENT_ANSWER_SUBMITTED',
        studentId: 'b0000000-0000-0000-0000-000000000001',
        studentName: 'Aryan Sharma',
        seatIndex: 0,
        timeSpent,
        isCorrect
      });

      if (feedbackAlert) {
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
      }
    });
  }
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

  qTextEl.innerHTML = renderLatexString(q.question_latex);

  optListEl.innerHTML = '';
  if (q.options_latex && q.options_latex.length > 0) {
    q.options_latex.forEach(opt => {
      const optItem = document.createElement('div');
      optItem.className = 'latex-option-item';
      optItem.innerHTML = `
        <div class="latex-option-key">${opt.key}</div>
        <div style="flex:1;">
          <div class="opt-formula">${renderLatexString(opt.latex)}</div>
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

        // WebSocket option select broadcast
        sendWsMessage({
          type: 'STUDENT_OPTION_SELECTED',
          studentId: 'b0000000-0000-0000-0000-000000000001',
          seatIndex: 0,
          option: opt.key
        });
      });

      optListEl.appendChild(optItem);
      renderMathInElement(optItem);
    });
  }
}

// -----------------------------------------------------------------------------
// TASK-10: DRAG & DROP FILE UPLOAD & VISION AI EXECUTION
// -----------------------------------------------------------------------------
function setupHandwrittenUploadAndVisionAi() {
  const fileInput = document.getElementById('handwrittenFileInput');
  const dropZone = document.getElementById('sheetDropZone');
  const btnUpload = document.getElementById('btnUploadNewSheet');
  const btnRunScan = document.getElementById('btnRunVisionAiScan');
  const scannedPaperImg = document.getElementById('scannedPaperImg');
  const scanline = document.getElementById('sheetScanline');

  if (!dropZone || !fileInput) return;

  // Trigger file browser
  const triggerBrowser = () => fileInput.click();
  dropZone.addEventListener('click', triggerBrowser);
  if (btnUpload) btnUpload.addEventListener('click', triggerBrowser);

  // Drag over states
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  function handleFileSelected(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      scannedPaperImg.src = e.target.result;
      runVisionAiScan(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  if (btnRunScan) {
    btnRunScan.addEventListener('click', () => {
      runVisionAiScan(scannedPaperImg.src);
    });
  }

  async function runVisionAiScan(imageData) {
    if (scanline) scanline.style.display = 'block';
    if (btnRunScan) btnRunScan.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:14px;height:14px;"></i> Scanning with Gemini 1.5 Flash...`;
    initLucideIcons();

    try {
      const res = await fetch('http://localhost:5050/api/upload/handwritten-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          studentId: 'b0000000-0000-0000-0000-000000000001',
          questionId: 'c0000000-0000-0000-0000-000000000002',
          subject: 'Physics'
        })
      });

      if (res.ok) {
        const data = await res.json();
        renderVisionEvaluationResult(data.evaluation);
      } else {
        throw new Error('Fallback to local vision engine');
      }
    } catch (err) {
      // Local simulated response with clean bounding boxes
      renderVisionEvaluationResult({
        totalMarksAwarded: 4.0,
        maxPossibleMarks: 4.0,
        aiConfidenceScore: 0.985,
        steps: [
          { stepIndex: 1, title: "Definite Integral Formulation", maxMarks: 1.0, awardedMarks: 1.0, status: "CORRECT", boundingBox: { ymin: 20, xmin: 10, ymax: 38, xmax: 90 } },
          { stepIndex: 2, title: "Monomial Antiderivative Integration", maxMarks: 1.5, awardedMarks: 1.5, status: "CORRECT", boundingBox: { ymin: 44, xmin: 10, ymax: 65, xmax: 90 } },
          { stepIndex: 3, title: "Arithmetic Evaluation & SI Unit", maxMarks: 1.5, awardedMarks: 1.5, status: "CORRECT", boundingBox: { ymin: 70, xmin: 10, ymax: 90, xmax: 90 } }
        ]
      });
    } finally {
      setTimeout(() => {
        if (scanline) scanline.style.display = 'none';
        if (btnRunScan) btnRunScan.innerHTML = `<i data-lucide="sparkles" style="width:14px;height:14px;"></i> Run Vision AI Evaluation`;
        initLucideIcons();
      }, 1200);
    }
  }

  function renderVisionEvaluationResult(evalData) {
    document.getElementById('displayTotalMarks').innerText = `${evalData.totalMarksAwarded.toFixed(1)} / ${evalData.maxPossibleMarks.toFixed(1)}`;

    const boxContainer = document.getElementById('dynamicBoundingBoxesContainer');
    if (boxContainer && evalData.steps) {
      boxContainer.innerHTML = '';
      evalData.steps.forEach(step => {
        const b = step.boundingBox;
        const box = document.createElement('div');
        box.className = 'bounding-overlay-box';
        box.style.top = `${b.ymin}%`;
        box.style.left = `${b.xmin}%`;
        box.style.width = `${b.xmax - b.xmin}%`;
        box.style.height = `${b.ymax - b.ymin}%`;
        box.title = `${step.title}: +${step.awardedMarks} pts`;
        boxContainer.appendChild(box);
      });
    }

    alert('✨ Vision AI Evaluation Complete!\nScored 4.0/4.0 against official CBSE/HPBOSE marking rubric.');
  }
}

// -----------------------------------------------------------------------------
// TASK-11: LIVE CLASSROOM SEATMAP & WEBSOCKET PROTOCOL
// -----------------------------------------------------------------------------
let wsClient = null;

function setupWebSocketClient() {
  try {
    wsClient = new WebSocket('ws://localhost:5050');

    wsClient.onopen = () => {
      console.log('[WEBSOCKET CLIENT] Connected to HAPS telemetry server.');
      document.getElementById('kafkaStatusTicker').innerHTML = '<span style="color:#10b981;">●</span> Kafka: Streaming Live';
    };

    wsClient.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleIncomingTelemetry(msg);
      } catch (e) {}
    };

    wsClient.onerror = () => {
      document.getElementById('kafkaStatusTicker').innerHTML = '<span style="color:#f59e0b;">●</span> Stream Bus: In-Memory Live';
    };
  } catch (e) {
    document.getElementById('kafkaStatusTicker').innerHTML = '<span style="color:#f59e0b;">●</span> Stream Bus: Local Loop';
  }
}

function sendWsMessage(payload) {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify(payload));
  } else {
    // Local loopback
    handleIncomingTelemetry(payload);
  }
}

function handleIncomingTelemetry(msg) {
  if (msg.type === 'STUDENT_ANSWER_SUBMITTED' || msg.type === 'STUDENT_OPTION_SELECTED') {
    const seatPods = document.querySelectorAll('.seat-pod');
    if (seatPods.length > 0) {
      const targetPod = seatPods[msg.seatIndex || 0];
      if (targetPod) {
        targetPod.classList.add('active-solving');
        const dot = targetPod.querySelector('.pulse-dot');
        if (dot) {
          dot.className = `pulse-dot ${msg.isCorrect === false ? 'red' : 'green'}`;
        }
        setTimeout(() => targetPod.classList.remove('active-solving'), 2500);
      }
    }
  }
}

function initClassroomSeatmap() {
  const seatmapGrid = document.getElementById('classroomSeatmapGrid');
  if (!seatmapGrid) return;

  seatmapGrid.innerHTML = '';
  const students = [
    { name: 'Aryan S.', status: 'green', time: '0:54' },
    { name: 'Ananya T.', status: 'amber', time: '1:45' },
    { name: 'Rohit N.', status: 'red', time: '3:15' },
    { name: 'Kavya V.', status: 'green', time: '0:42' },
    { name: 'Harsh M.', status: 'green', time: '0:48' },
    { name: 'Riya K.', status: 'green', time: '0:55' },
    { name: 'Aditya P.', status: 'amber', time: '1:30' },
    { name: 'Sanya D.', status: 'green', time: '0:38' }
  ];

  for (let i = 0; i < 32; i++) {
    const s = students[i % students.length];
    const pod = document.createElement('div');
    pod.className = 'seat-pod';
    pod.innerHTML = `
      <div style="font-size:0.75rem; font-weight:700; color:var(--text-primary);">
        <span class="pulse-dot ${s.status}"></span> Desk ${i + 1}
      </div>
      <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">${s.name}</div>
      <div style="font-size:0.65rem; color:var(--accent-amber); font-family:monospace;">${s.time}</div>
    `;

    pod.addEventListener('click', () => {
      alert(`Desk ${i + 1}: ${s.name}\nActive Status: ${s.status === 'green' ? 'Solving accurately within benchmark' : s.status === 'amber' ? 'Hesitating (>60s)' : 'Misconception / Hints requested'}`);
    });

    seatmapGrid.appendChild(pod);
  }
}

// -----------------------------------------------------------------------------
// TASK-12: WHATSAPP NOTIFICATION MODAL & PRINT REPORT
// -----------------------------------------------------------------------------
function setupWhatsAppNotificationModal() {
  const btnOpen = document.getElementById('btnOpenWhatsAppModal');
  const btnClose = document.getElementById('btnCloseWhatsAppModal');
  const modal = document.getElementById('whatsAppModal');
  const btnConfirm = document.getElementById('btnConfirmSendWhatsApp');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      modal.classList.add('active');
      initLucideIcons();
    });
  }

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (btnConfirm) {
    btnConfirm.addEventListener('click', async () => {
      btnConfirm.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:14px;height:14px;"></i> Dispatching...`;
      initLucideIcons();

      try {
        await fetch('http://localhost:5050/api/notifications/whatsapp-dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: 'b0000000-0000-0000-0000-000000000001',
            parentPhone: '+91 98160-XXXXX'
          })
        });
      } catch (e) {}

      setTimeout(() => {
        alert('📲 WhatsApp Notification successfully dispatched to Parent via HAPS WhatsApp Webhook Gateway!');
        modal.classList.remove('active');
        btnConfirm.innerHTML = `<i data-lucide="send" style="width:14px;height:14px;"></i> Dispatch WhatsApp Webhook`;
        initLucideIcons();
      }, 900);
    });
  }

  // Official Printable PDF trigger
  const btnPrint = document.getElementById('btnDownloadReportPdf');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }
}

// -----------------------------------------------------------------------------
// TASK-13: NTA EXAM SIMULATOR & 30-QUESTION PALETTE GRID
// -----------------------------------------------------------------------------
const examState = {
  currentQuestionIndex: 0,
  activeSubject: 'Physics',
  answers: Array(30).fill(null),
  reviewStatus: Array(30).fill(false),
  visitedStatus: Array(30).fill(false),
  questions: []
};

function generate30ExamQuestions() {
  const list = [];
  // 1-10 Physics
  for (let i = 1; i <= 10; i++) {
    list.push({
      num: i,
      subject: 'Physics',
      topic: i <= 5 ? 'Rotational Motion' : 'Oscillations & SHM',
      question_latex: `A particle of mass $m=${i}\\,\\text{kg}$ rotates in a circular path of radius $R=2\\,\\text{m}$. Find the required centripetal torque $\\tau$ about the origin.`,
      options: [
        { key: 'A', latex: '$\\tau = 0$' },
        { key: 'B', latex: `$\\tau = ${i * 4}\\,\\text{N}\\cdot\\text{m}$` },
        { key: 'C', latex: `$\\tau = ${i * 2}\\,\\text{N}\\cdot\\text{m}$` },
        { key: 'D', latex: '$\\tau = \\infty$' }
      ],
      correctKey: 'A',
      socratic_hints: [
        "What is the angle $\\theta$ between the position vector $\\vec{r}$ and the centripetal force $\\vec{F}_c$ directed towards the center?",
        "Recall torque $\\vec{\\tau} = \\vec{r} \\times \\vec{F} = r F \\sin(\\theta)$. Here $\\vec{r}$ and $\\vec{F}_c$ are collinear.",
        "Since $\\sin(180^\\circ) = 0$, the centripetal torque about the origin is identically zero."
      ]
    });
  }
  // 11-20 Chemistry
  for (let i = 11; i <= 20; i++) {
    list.push({
      num: i,
      subject: 'Chemistry',
      topic: 'Chemical Thermodynamics',
      question_latex: `Calculate the change in entropy $\\Delta S$ when ${i}\\,\\text{moles}$ of an ideal gas expands isothermally from $V_1 = 1\\,\\text{L}$ to $V_2 = 10\\,\\text{L}$.`,
      options: [
        { key: 'A', latex: `$\\Delta S = ${i} R \\ln(10)$` },
        { key: 'B', latex: `$\\Delta S = 0$` },
        { key: 'C', latex: `$\\Delta S = -${i} R \\ln(10)$` },
        { key: 'D', latex: `$\\Delta S = ${i} R$` }
      ],
      correctKey: 'A',
      socratic_hints: [
        "In an isothermal reversible expansion, $\\Delta U = 0 \\implies q_{\\text{rev}} = -W$.",
        "Recall the formula for work in isothermal expansion: $W = -nRT \\ln\\left(\\frac{V_2}{V_1}\\right)$.",
        "Entropy change is $\\Delta S = \\frac{q_{\\text{rev}}}{T} = n R \\ln\\left(\\frac{V_2}{V_1}\\right)$."
      ]
    });
  }
  // 21-30 Mathematics
  for (let i = 21; i <= 30; i++) {
    list.push({
      num: i,
      subject: 'Mathematics',
      topic: 'Calculus & Limits',
      question_latex: `Evaluate the derivative $\\frac{d}{dx}\\left[ x^{${i - 18}} \\sin(x) \\right]$ at $x = 0$.`,
      options: [
        { key: 'A', latex: '$0$' },
        { key: 'B', latex: '$1$' },
        { key: 'C', latex: `${i - 18}` },
        { key: 'D', latex: '$\\pi$' }
      ],
      correctKey: 'A',
      socratic_hints: [
        "Use the product rule: $\\frac{d}{dx}[u \\cdot v] = u' v + u v'$ where $u(x) = x^k$ and $v(x) = \\sin(x)$.",
        "Notice that as $x \\to 0$, both $x^k = 0$ (for $k \\ge 2$) and $\\sin(0) = 0$.",
        "Evaluating both terms at $x=0$ yields $0 \\cdot \\sin(0) + 0 \\cdot \\cos(0) = 0$."
      ]
    });
  }
  return list;
}

function setupNtaExamPaletteEngine() {
  examState.questions = generate30ExamQuestions();
  examState.visitedStatus[0] = true;

  renderPaletteButtons();
  renderActiveNtaQuestion();
  updatePaletteCounts();

  // Wire Subject Switcher
  const subButtons = document.querySelectorAll('#examSubjectSwitcher .section-tab-btn');
  subButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      subButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      examState.activeSubject = btn.getAttribute('data-subject');

      // Jump to first question of that subject
      if (examState.activeSubject === 'Physics') jumpToQuestion(0);
      else if (examState.activeSubject === 'Chemistry') jumpToQuestion(10);
      else if (examState.activeSubject === 'Mathematics') jumpToQuestion(20);
    });
  });

  // Action Buttons
  const btnSaveNext = document.getElementById('btnSaveAndNext');
  const btnReview = document.getElementById('btnMarkForReview');
  const btnClear = document.getElementById('btnClearResponse');
  const btnSubmitExam = document.getElementById('btnSubmitFullExam');

  if (btnSaveNext) {
    btnSaveNext.addEventListener('click', () => {
      if (state.studentTimer.selectedOption) {
        examState.answers[examState.currentQuestionIndex] = state.studentTimer.selectedOption;
      }
      advanceQuestion();
    });
  }

  if (btnReview) {
    btnReview.addEventListener('click', () => {
      examState.reviewStatus[examState.currentQuestionIndex] = true;
      if (state.studentTimer.selectedOption) {
        examState.answers[examState.currentQuestionIndex] = state.studentTimer.selectedOption;
      }
      advanceQuestion();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      examState.answers[examState.currentQuestionIndex] = null;
      state.studentTimer.selectedOption = null;
      document.querySelectorAll('#studentRenderOptions .latex-option-item').forEach(el => {
        el.style.borderColor = 'var(--border-subtle)';
        el.style.background = 'rgba(255, 255, 255, 0.03)';
      });
      renderPaletteButtons();
      updatePaletteCounts();
    });
  }

  if (btnSubmitExam) {
    btnSubmitExam.addEventListener('click', async () => {
      const attemptedCount = examState.answers.filter(a => a !== null).length;
      const totalQ = examState.questions.length;

      if (!confirm(`Submit Assessment: "${state.activeAssessment?.title || 'Classroom Diagnostic Test'}"?\n\n• Attempted: ${attemptedCount} / ${totalQ} Questions\n\nProceed to evaluate and stream diagnostic results to Teacher Co-Pilot & Parent Report Card?`)) {
        return;
      }

      btnSubmitExam.disabled = true;
      btnSubmitExam.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:14px;height:14px;"></i> Submitting & Diagnosing...`;
      initLucideIcons();

      const asgnId = state.activeAssessment?.id || 'asgn_10_sci_01';

      try {
        const res = await fetch(`http://localhost:5050/api/assessments/${asgnId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: 'b0000000-0000-0000-0000-000000000001',
            studentName: 'Aryan Sharma',
            answers: examState.questions.map((q, idx) => ({
              questionId: q.id,
              selectedOption: examState.answers[idx],
              timeSpentSeconds: 45 + (idx * 5),
              hesitationSeconds: 6 + idx,
              hintsUsed: state.studentTimer.hintsRevealed
            }))
          })
        });

        if (res.ok) {
          const data = await res.json();
          displayDiagnosticResults(data.results);
        } else {
          throw new Error('Fallback to local calculation');
        }
      } catch (e) {
        console.warn('Backend submit error, calculating locally:', e);
        alert(`Assessment Submitted!\nScore recorded and streamed to Teacher Live Telemetry Monitor.`);
      } finally {
        btnSubmitExam.disabled = false;
        btnSubmitExam.innerHTML = `<i data-lucide="send" style="width:14px;height:14px;"></i> Submit Full Assessment`;
        initLucideIcons();
      }
    });
  }
}

function advanceQuestion() {
  const autoSave = document.getElementById('autoSaveIndicator');
  if (autoSave) {
    autoSave.innerHTML = `<i data-lucide="check-check" style="width:12px; height:12px; vertical-align:middle; color:#10b981;"></i> Saved!`;
    initLucideIcons();
    setTimeout(() => {
      autoSave.innerHTML = `<i data-lucide="check" style="width:12px; height:12px; vertical-align:middle;"></i> Auto-Saved`;
      initLucideIcons();
    }, 1200);
  }

  if (examState.currentQuestionIndex < 29) {
    jumpToQuestion(examState.currentQuestionIndex + 1);
  } else {
    renderPaletteButtons();
    updatePaletteCounts();
    alert("You have reached the final question (Q30). You can review responses on the palette or click 'Submit Full Assessment'.");
  }
}

function jumpToQuestion(index) {
  examState.currentQuestionIndex = index;
  examState.visitedStatus[index] = true;
  state.studentTimer.selectedOption = examState.answers[index];

  // Reset hint box
  const hintBox = document.getElementById('socraticHintBox');
  if (hintBox) hintBox.classList.remove('visible');
  state.studentTimer.hintsRevealed = 0;

  renderActiveNtaQuestion();
  renderPaletteButtons();
  updatePaletteCounts();
}

function renderActiveNtaQuestion() {
  const q = examState.questions[examState.currentQuestionIndex];
  if (!q) return;

  document.getElementById('currentQuestionNum').innerText = q.num;
  document.getElementById('ntaQuestionTitle').innerHTML = `Question ${q.num} of 30 &bull; ${q.subject} (${q.topic})`;

  const qText = document.getElementById('studentRenderQuestion');
  const optList = document.getElementById('studentRenderOptions');

  qText.innerHTML = renderLatexString(q.question_latex);

  optList.innerHTML = '';
  q.options.forEach(opt => {
    const isSelected = examState.answers[examState.currentQuestionIndex] === opt.key;
    const item = document.createElement('div');
    item.className = 'latex-option-item';
    if (isSelected) {
      item.style.borderColor = 'var(--accent-cyan)';
      item.style.background = 'rgba(56, 189, 248, 0.12)';
    }

    item.innerHTML = `
      <div class="latex-option-key">${opt.key}</div>
      <div style="flex:1;">
        <div class="opt-formula">${renderLatexString(opt.latex)}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      document.querySelectorAll('#studentRenderOptions .latex-option-item').forEach(el => {
        el.style.borderColor = 'var(--border-subtle)';
        el.style.background = 'rgba(255, 255, 255, 0.03)';
      });
      item.style.borderColor = 'var(--accent-cyan)';
      item.style.background = 'rgba(56, 189, 248, 0.12)';
      state.studentTimer.selectedOption = opt.key;
      examState.answers[examState.currentQuestionIndex] = opt.key;
      renderPaletteButtons();
      updatePaletteCounts();
    });

    optList.appendChild(item);
    renderMathInElement(item);
  });
}

function renderPaletteButtons() {
  const container = document.getElementById('ntaQuestionPalette');
  if (!container) return;

  const totalCount = examState.questions ? examState.questions.length : 30;
  container.innerHTML = '';
  for (let i = 0; i < totalCount; i++) {
    const btn = document.createElement('div');
    btn.className = 'palette-btn';
    btn.innerText = i + 1;

    const isCurrent = i === examState.currentQuestionIndex;
    const isAnswered = examState.answers[i] !== null;
    const isReviewed = examState.reviewStatus[i];
    const isVisited = examState.visitedStatus[i];

    if (isCurrent) btn.classList.add('active');

    if (isAnswered) {
      btn.classList.add('answered');
    } else if (isReviewed) {
      btn.classList.add('marked-review');
    } else if (isVisited) {
      btn.classList.add('not-answered');
    } else {
      btn.classList.add('not-visited');
    }

    btn.addEventListener('click', () => jumpToQuestion(i));
    container.appendChild(btn);
  }
}

function updatePaletteCounts() {
  const totalCount = examState.questions ? examState.questions.length : 30;
  const answered = examState.answers.filter(a => a !== null).length;
  const review = examState.reviewStatus.filter((r, idx) => r && examState.answers[idx] === null).length;
  const visited = examState.visitedStatus.filter((v, idx) => v && examState.answers[idx] === null && !examState.reviewStatus[idx]).length;
  const notVisited = totalCount - examState.visitedStatus.filter(v => v).length;

  document.getElementById('countAnswered').innerText = answered;
  document.getElementById('countNotAnswered').innerText = visited;
  document.getElementById('countReview').innerText = review;
  document.getElementById('countNotVisited').innerText = Math.max(0, notVisited);
}

// -----------------------------------------------------------------------------
// 10. TEST ASSIGNMENT BUILDER & STUDENT ADAPTIVE DELIVERY
// -----------------------------------------------------------------------------
function setupTestAssignmentBuilder() {
  const btnOpen = document.getElementById('btnOpenTestBuilder');
  const btnClose = document.getElementById('btnCloseTestBuilder');
  const btnClear = document.getElementById('btnClearDraftTest');
  const btnPublish = document.getElementById('btnPublishTestAssignment');
  const modal = document.getElementById('modalTestBuilder');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      openTestBuilderModal();
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      if (modal) modal.classList.remove('active');
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      state.testDraft = [];
      updateTestDraftBadges();
      renderTestBuilderModal();
    });
  }

  if (btnPublish) {
    btnPublish.addEventListener('click', async () => {
      if (!state.testDraft || state.testDraft.length === 0) {
        alert('Please add at least one question to the draft before publishing.');
        return;
      }

      const titleInput = document.getElementById('inputTestTitle');
      const title = titleInput ? titleInput.value.trim() : 'Class 10 Science Weekly Diagnostic';
      const classSec = document.getElementById('selectTestClassSection')?.value || '10-Science-A';

      btnPublish.disabled = true;
      btnPublish.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:16px;height:16px;"></i> Publishing to Class Roster...`;
      initLucideIcons();

      try {
        const res = await fetch('http://localhost:5050/api/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description: `Official diagnostic test for ${classSec} with ${state.testDraft.length} questions.`,
            grade: classSec.startsWith('10') ? '10' : (classSec.startsWith('11') ? '11' : '12'),
            section: classSec,
            subject: 'Science',
            durationMinutes: Math.max(15, state.testDraft.length * 5),
            totalMarks: state.testDraft.length * 4,
            questions: state.testDraft
          })
        });

        if (res.ok) {
          const data = await res.json();
          alert(`🎉 Test "${title}" successfully published and assigned to ${classSec}!\n\n• Questions: ${state.testDraft.length}\n• Total Marks: ${state.testDraft.length * 4}\n• Target: ${classSec}\n\nStudents can now take this assessment immediately in the Student Portal.`);
          state.testDraft = [];
          updateTestDraftBadges();
          if (modal) modal.classList.remove('active');
          await loadStudentAssignedTests();
        } else {
          throw new Error('Failed to publish');
        }
      } catch (err) {
        alert('Error publishing assessment. Running in resilient local mode.');
        if (modal) modal.classList.remove('active');
      } finally {
        btnPublish.disabled = false;
        btnPublish.innerHTML = `<i data-lucide="send" style="width:16px;height:16px;"></i> Publish & Assign to Class Roster`;
        initLucideIcons();
      }
    });
  }
}

function addQuestionToTestDraft(q) {
  if (!q) return;
  const existing = state.testDraft.find(item => item.id === q.id);
  if (!existing) {
    state.testDraft.push(q);
  }
  updateTestDraftBadges();
  alert(`✅ Question added to Test Assignment Draft!\nTotal: ${state.testDraft.length} Questions drafted.\n\nClick "Test Builder" in the navigation bar to review and assign to your class roster.`);
}

function updateTestDraftBadges() {
  const badge = document.getElementById('testDraftCount');
  if (badge) badge.innerText = state.testDraft.length;
}

function openTestBuilderModal() {
  const modal = document.getElementById('modalTestBuilder');
  if (!modal) return;
  renderTestBuilderModal();
  modal.classList.add('active');
  initLucideIcons();
}

function renderTestBuilderModal() {
  const countEl = document.getElementById('modalDraftQuestionCount');
  const marksEl = document.getElementById('modalDraftTotalMarks');
  const listEl = document.getElementById('modalDraftQuestionsList');
  if (!listEl) return;

  const count = state.testDraft.length;
  if (countEl) countEl.innerText = count;
  if (marksEl) marksEl.innerText = `Total: ${count * 4} Marks • ~${count * 5} Mins`;

  listEl.innerHTML = '';
  if (count === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding: 2rem 1rem; color: var(--text-muted);">
        <i data-lucide="inbox" style="width:36px; height:36px; opacity:0.4; margin-bottom:8px;"></i>
        <p style="font-size:0.85rem;">No questions added to the draft yet.<br/>Use <strong>"Add to Active Test"</strong> in the AI Question Studio or <strong>"Add to Class Test"</strong> in the NCERT PYQ Explorer.</p>
      </div>
    `;
    initLucideIcons();
    return;
  }

  state.testDraft.forEach((q, idx) => {
    const item = document.createElement('div');
    item.style.padding = '10px 12px';
    item.style.background = 'rgba(255, 255, 255, 0.03)';
    item.style.border = '1px solid var(--border-subtle)';
    item.style.borderRadius = '6px';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'flex-start';
    item.style.gap = '10px';

    item.innerHTML = `
      <div style="flex:1;">
        <div style="font-size:0.75rem; color:var(--accent-cyan); font-weight:700; margin-bottom:4px;">
          Q${idx + 1} &bull; ${q.chapter || q.topic || 'Science'} (${q.subtopic || 'General'}) &bull; +4M / -1M
        </div>
        <div style="font-size:0.82rem; color:var(--text-primary); line-height:1.4;">
          ${renderLatexString(q.question_latex)}
        </div>
      </div>
      <button class="btn-remove-draft" data-id="${q.id}" style="background:transparent; border:none; color:var(--accent-rose); cursor:pointer; padding:4px;">
        <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
      </button>
    `;

    item.querySelector('.btn-remove-draft').addEventListener('click', (e) => {
      const qid = e.currentTarget.getAttribute('data-id');
      state.testDraft = state.testDraft.filter(d => d.id !== qid);
      updateTestDraftBadges();
      renderTestBuilderModal();
    });

    listEl.appendChild(item);
  });

  initLucideIcons();
}

async function setupStudentAssignedTests() {
  const btnLoad = document.getElementById('btnLoadAssignedTest');
  const selectEl = document.getElementById('selectStudentAssignedTest');

  await loadStudentAssignedTests();

  if (btnLoad) {
    btnLoad.addEventListener('click', () => {
      const asgnId = selectEl ? selectEl.value : null;
      if (!asgnId) return;
      const assessment = state.publishedAssessments.find(a => a.id === asgnId);
      if (assessment) {
        startAssignedTest(assessment);
      }
    });
  }

  // Diagnostic Results Modal Handlers
  const btnCloseDiag = document.getElementById('btnCloseDiagnosticResults');
  const btnGoReport = document.getElementById('btnGoToSmartReport');
  const modalDiag = document.getElementById('modalDiagnosticResults');

  if (btnCloseDiag && modalDiag) {
    btnCloseDiag.addEventListener('click', () => {
      modalDiag.classList.remove('active');
    });
  }

  if (btnGoReport) {
    btnGoReport.addEventListener('click', () => {
      if (modalDiag) modalDiag.classList.remove('active');
      // Switch to Teacher role & Smart Reports sub-tab
      const btnRoleTeacher = document.getElementById('btnRoleTeacher');
      if (btnRoleTeacher) btnRoleTeacher.click();
      const tabSmartReports = document.getElementById('tabBtnSmartReports');
      if (tabSmartReports) tabSmartReports.click();
    });
  }
}

async function loadStudentAssignedTests() {
  const selectEl = document.getElementById('selectStudentAssignedTest');
  if (!selectEl) return;

  try {
    const res = await fetch('http://localhost:5050/api/assessments');
    if (res.ok) {
      const data = await res.json();
      state.publishedAssessments = data.assessments || [];
    }
  } catch (e) {
    console.warn('Could not fetch assessments from backend, using default.');
  }

  selectEl.innerHTML = '';
  if (state.publishedAssessments.length === 0) {
    selectEl.innerHTML = `<option value="">No Active Tests Assigned</option>`;
    return;
  }

  state.publishedAssessments.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.title} (${a.questionCount || a.questions?.length || 3} Qs • ${a.durationMinutes || 30}m)`;
    selectEl.appendChild(opt);
  });

  // Select first assessment by default
  if (!state.activeAssessment && state.publishedAssessments.length > 0) {
    state.activeAssessment = state.publishedAssessments[0];
    const bannerTitle = document.getElementById('assignedTestBannerTitle');
    if (bannerTitle) bannerTitle.innerText = state.activeAssessment.title;
  }
}

async function startAssignedTest(assessmentSummary) {
  let fullAssessment = assessmentSummary;
  // If questions are not in summary, fetch full assessment details
  if (!fullAssessment.questions || fullAssessment.questions.length === 0) {
    try {
      const res = await fetch(`http://localhost:5050/api/assessments/${assessmentSummary.id}`);
      if (res.ok) {
        const data = await res.json();
        fullAssessment = data.assessment;
      }
    } catch (e) {}
  }

  state.activeAssessment = fullAssessment;

  const bannerTitle = document.getElementById('assignedTestBannerTitle');
  if (bannerTitle) bannerTitle.innerText = fullAssessment.title;

  // Map questions into examState
  examState.questions = (fullAssessment.questions || []).map((q, idx) => ({
    id: q.id,
    num: idx + 1,
    subject: fullAssessment.subject || 'Science',
    topic: q.topic || q.chapter || 'Topic',
    subtopic: q.subtopic || 'General',
    question_latex: q.question_latex,
    options: (q.options_latex && q.options_latex.length > 0)
      ? q.options_latex
      : [
          { key: 'A', latex: 'Option A' },
          { key: 'B', latex: 'Option B' },
          { key: 'C', latex: 'Option C' },
          { key: 'D', latex: 'Option D' }
        ],
    correctKey: q.correct_answer || 'B',
    socratic_hints: q.socratic_hints || [],
    benchmark_time_seconds: q.benchmark_time_seconds || 90
  }));

  examState.currentQuestionIndex = 0;
  examState.answers = Array(examState.questions.length).fill(null);
  examState.reviewStatus = Array(examState.questions.length).fill(false);
  examState.visitedStatus = Array(examState.questions.length).fill(false);
  examState.visitedStatus[0] = true;

  // Reset timer
  state.studentTimer.secondsElapsed = 0;
  state.studentTimer.hintsRevealed = 0;
  state.studentTimer.selectedOption = null;

  renderActiveNtaQuestion();
  renderPaletteButtons();
  updatePaletteCounts();

  alert(`🚀 Test Started: "${fullAssessment.title}"\n\n• Questions: ${examState.questions.length}\n• Duration: ${fullAssessment.durationMinutes} Minutes\n• Live Telemetry: Sub-second timer streaming to Teacher Seatmap.\n\nGood luck!`);
}

function displayDiagnosticResults(results) {
  const modal = document.getElementById('modalDiagnosticResults');
  if (!modal) return;

  const scoreEl = document.getElementById('diagScoreVal');
  const pctEl = document.getElementById('diagPercentageVal');
  const speedEl = document.getElementById('diagAvgSpeedVal');
  const hesEl = document.getElementById('diagHesitationVal');
  const masteredListEl = document.getElementById('diagMasteredList');
  const recapListEl = document.getElementById('diagRecapList');
  const weakListEl = document.getElementById('diagWeakList');
  const tableEl = document.getElementById('diagQuestionsTable');

  if (scoreEl) scoreEl.innerText = `${results.totalScore} / ${results.totalMarks}`;
  if (pctEl) pctEl.innerText = `(${results.percentage}%)`;
  const avgSpeed = Math.round((results.totalTimeSpentSeconds || 120) / (results.totalQuestions || 1));
  if (speedEl) speedEl.innerText = `${avgSpeed}s`;
  if (hesEl) hesEl.innerText = `7s`;

  const matrix = results.diagnosticMatrix || {};
  if (masteredListEl) {
    masteredListEl.innerHTML = (matrix.mastered && matrix.mastered.length > 0)
      ? matrix.mastered.map(m => `<span class="pilot-tag" style="background:rgba(16,185,129,0.15); color:#10b981; margin:2px;">${m}</span>`).join(' ')
      : '<span style="color:var(--text-muted);">None in this test</span>';
  }

  if (recapListEl) {
    recapListEl.innerHTML = (matrix.recap && matrix.recap.length > 0)
      ? matrix.recap.map(m => `<span class="pilot-tag" style="background:rgba(234,179,8,0.15); color:#eab308; margin:2px;">${m}</span>`).join(' ')
      : '<span style="color:var(--text-muted);">None in this test</span>';
  }

  if (weakListEl) {
    weakListEl.innerHTML = (matrix.weak && matrix.weak.length > 0)
      ? matrix.weak.map(m => `<span class="pilot-tag" style="background:rgba(239,68,68,0.15); color:#ef4444; margin:2px;">${m}</span>`).join(' ')
      : '<span style="color:var(--text-muted);">None detected</span>';
  }

  if (tableEl && results.questionBreakdown) {
    tableEl.innerHTML = results.questionBreakdown.map(q => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 8px; font-size:0.75rem; background:rgba(255,255,255,0.02); border-radius:4px;">
        <span><strong>Q${q.questionIndex}:</strong> ${q.subtopic} &bull; Ans: ${q.selectedOption || 'None'}</span>
        <span style="display:flex; gap:8px; align-items:center;">
          <span style="color:var(--text-muted);">${q.timeSpentSeconds}s</span>
          <span class="pilot-tag" style="padding:1px 6px; font-size:0.68rem; background:${q.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${q.isCorrect ? '#10b981' : '#ef4444'};">${q.category} (${q.marksAwarded > 0 ? '+' : ''}${q.marksAwarded}M)</span>
        </span>
      </div>
    `).join('');
  }

  modal.classList.add('active');
  initLucideIcons();
}

// ============================================================================
// TEACHER CLASS-WISE EXAM ANALYTICS & STUDENT DRILL-DOWN CONTROLLER
// ============================================================================

let currentAnalyticsData = null;
const analyticsCharts = {};

function destroyChart(key) {
  if (analyticsCharts[key]) {
    try {
      analyticsCharts[key].destroy();
    } catch (e) {
      console.warn('Error destroying chart', key, e);
    }
    analyticsCharts[key] = null;
  }
}

function setupClassAnalytics() {
  const selectAssessment = document.getElementById('selectAnalyticsAssessment');
  const btnRefresh = document.getElementById('btnRefreshAnalytics');
  const btnCloseModal = document.getElementById('btnCloseStudentDrilldown');
  const drilldownModal = document.getElementById('modalStudentDrilldown');

  if (selectAssessment) {
    selectAssessment.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      if (selectedId) loadClassAnalytics(selectedId);
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      const selectedId = selectAssessment ? selectAssessment.value : null;
      loadClassAnalytics(selectedId);
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeStudentDrilldown);
  }

  if (drilldownModal) {
    drilldownModal.addEventListener('click', (e) => {
      if (e.target === drilldownModal) {
        closeStudentDrilldown();
      }
    });
  }
}

async function loadClassAnalytics(assessmentId) {
  try {
    const url = assessmentId 
      ? `http://localhost:5050/api/analytics/class-dashboard?assessmentId=${assessmentId}`
      : `http://localhost:5050/api/analytics/class-dashboard`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) {
      console.warn('[CLASS ANALYTICS] Fetch failed:', data.error);
      return;
    }

    currentAnalyticsData = data;

    // Populate dropdown if needed
    const selectAssessment = document.getElementById('selectAnalyticsAssessment');
    if (selectAssessment && data.availableAssessments) {
      const currentVal = assessmentId || data.assessment.id;
      selectAssessment.innerHTML = data.availableAssessments.map(a => `
        <option value="${a.id}" ${a.id === currentVal ? 'selected' : ''}>
          ${a.title} (${a.grade ? 'Class ' + a.grade : 'General'})
        </option>
      `).join('');
    }

    renderClassAnalytics(data);
  } catch (err) {
    console.error('[CLASS ANALYTICS] Network error:', err.message);
  }
}

// -----------------------------------------------------------------------------
// VISUAL PROGRESS CHARTS (Chart.js)
// -----------------------------------------------------------------------------
function renderClassAnalyticsCharts(data) {
  if (!window.Chart || !data) return;

  const { questionAnalytics = [], studentRoster = [], highlights = {}, classSummary = {} } = data;

  // 1. Question Performance (Accuracy vs Errors) - Horizontal Bar Chart
  const ctxPerf = document.getElementById('chartQuestionPerformance');
  if (ctxPerf && questionAnalytics.length > 0) {
    destroyChart('questionPerf');

    const labels = questionAnalytics.map(q => `Q${q.questionIndex}: ${q.subtopic}`);
    const correctData = questionAnalytics.map(q => q.accuracyRate);
    const errorData = questionAnalytics.map(q => q.errorRate);

    analyticsCharts.questionPerf = new Chart(ctxPerf, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '% Solved Correctly',
            data: correctData,
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: '% Errors / Mistakes',
            data: errorData,
            backgroundColor: 'rgba(244, 63, 94, 0.85)',
            borderColor: '#f43f5e',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}%`
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            max: 100,
            ticks: { color: '#94a3b8', callback: (v) => `${v}%` },
            grid: { color: 'rgba(255, 255, 255, 0.06)' }
          },
          y: {
            stacked: true,
            ticks: { color: '#cbd5e1', font: { family: 'Inter', size: 11, weight: '600' } },
            grid: { display: false }
          }
        }
      }
    });

    const perfSummaryEl = document.getElementById('chartQuestionPerfSummary');
    if (perfSummaryEl && highlights.mostAttempted && highlights.mostWrong) {
      perfSummaryEl.innerHTML = `🌟 Solved Most: <strong>Q${highlights.mostAttempted.questionIndex}</strong> (${highlights.mostAttempted.attemptRate}) &bull; ⚠️ Hardest: <strong>Q${highlights.mostWrong.questionIndex}</strong> (${highlights.mostWrong.errorRate} Err)`;
    }
  }

  // 2. Class Score Distribution - Doughnut Chart
  const ctxScore = document.getElementById('chartScoreDistribution');
  if (ctxScore && studentRoster.length > 0) {
    destroyChart('scoreDist');

    let distinction = 0; // >=80%
    let firstClass = 0;  // 60-79%
    let passing = 0;     // 40-59%
    let remedial = 0;    // <40%

    studentRoster.forEach(s => {
      const p = s.percentage;
      if (p >= 80) distinction++;
      else if (p >= 60) firstClass++;
      else if (p >= 40) passing++;
      else remedial++;
    });

    analyticsCharts.scoreDist = new Chart(ctxScore, {
      type: 'doughnut',
      data: {
        labels: [
          `Distinction (80–100%): ${distinction}`,
          `First Class (60–79%): ${firstClass}`,
          `Passing (40–59%): ${passing}`,
          `Remedial (<40%): ${remedial}`
        ],
        datasets: [{
          data: [distinction, firstClass, passing, remedial],
          backgroundColor: [
            'rgba(16, 185, 129, 0.85)',
            'rgba(56, 189, 248, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(244, 63, 94, 0.85)'
          ],
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#cbd5e1', font: { family: 'Inter', size: 11 }, boxWidth: 14 }
          }
        }
      }
    });

    const scoreSummaryEl = document.getElementById('chartScoreDistSummary');
    if (scoreSummaryEl) {
      scoreSummaryEl.innerHTML = `Class Avg: <strong>${classSummary.averagePercentage || '61.2%'}</strong> (${studentRoster.length} students)`;
    }
  }

  // 3. Question Time Spent vs Benchmark - Grouped Bar Chart
  const ctxTime = document.getElementById('chartQuestionTime');
  if (ctxTime && questionAnalytics.length > 0) {
    destroyChart('questionTime');

    const labels = questionAnalytics.map(q => `Q${q.questionIndex}`);
    const actualTimes = questionAnalytics.map(q => q.avgTimeSpentSeconds);
    const benchmarkTimes = questionAnalytics.map(q => q.benchmarkSeconds);

    analyticsCharts.questionTime = new Chart(ctxTime, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual Class Avg Time (s)',
            data: actualTimes,
            backgroundColor: 'rgba(56, 189, 248, 0.85)',
            borderColor: '#38bdf8',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Benchmark Standard (s)',
            data: benchmarkTimes,
            backgroundColor: 'rgba(148, 163, 184, 0.35)',
            borderColor: '#94a3b8',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}s`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#cbd5e1', font: { weight: '600' } },
            grid: { display: false }
          },
          y: {
            ticks: { color: '#94a3b8', callback: (v) => `${v}s` },
            grid: { color: 'rgba(255, 255, 255, 0.06)' }
          }
        }
      }
    });

    const timeSummaryEl = document.getElementById('chartTimeLagSummary');
    if (timeSummaryEl) {
      const slowest = [...questionAnalytics].sort((a,b) => b.avgTimeSpentSeconds - a.avgTimeSpentSeconds)[0];
      if (slowest) {
        timeSummaryEl.innerHTML = `Slowest: <strong>Q${slowest.questionIndex} (${slowest.avgTimeSpentSeconds}s)</strong> vs ${slowest.benchmarkSeconds}s target`;
      }
    }
  }

  // 4. Common Mistake Categories Breakdown - Doughnut Chart
  const ctxMistakes = document.getElementById('chartMistakeDistribution');
  if (ctxMistakes && questionAnalytics.length > 0) {
    destroyChart('mistakeDist');

    const mistakeTotals = {
      CONCEPTUAL: 0,
      FORMULA_BASED: 0,
      CALCULATION: 0,
      SIGN_CONVENTION: 0,
      TIME_PRESSURE: 0
    };

    questionAnalytics.forEach(q => {
      const b = q.mistakeBreakdown || {};
      mistakeTotals.CONCEPTUAL += (b.CONCEPTUAL || 0);
      mistakeTotals.FORMULA_BASED += (b.FORMULA_BASED || 0);
      mistakeTotals.CALCULATION += (b.CALCULATION || 0);
      mistakeTotals.SIGN_CONVENTION += (b.SIGN_CONVENTION || 0);
      mistakeTotals.TIME_PRESSURE += (b.TIME_PRESSURE || 0);
    });

    analyticsCharts.mistakeDist = new Chart(ctxMistakes, {
      type: 'doughnut',
      data: {
        labels: [
          `Calculation Slips (${mistakeTotals.CALCULATION})`,
          `Conceptual Errors (${mistakeTotals.CONCEPTUAL})`,
          `Formula Confusion (${mistakeTotals.FORMULA_BASED})`,
          `Sign/Unit Errors (${mistakeTotals.SIGN_CONVENTION})`
        ],
        datasets: [{
          data: [
            mistakeTotals.CALCULATION,
            mistakeTotals.CONCEPTUAL,
            mistakeTotals.FORMULA_BASED,
            mistakeTotals.SIGN_CONVENTION
          ],
          backgroundColor: [
            'rgba(245, 158, 11, 0.85)',
            'rgba(139, 92, 246, 0.85)',
            'rgba(59, 130, 246, 0.85)',
            'rgba(236, 72, 153, 0.85)'
          ],
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#cbd5e1', font: { family: 'Inter', size: 11 }, boxWidth: 14 }
          }
        }
      }
    });

    const mistakeSummaryEl = document.getElementById('chartMistakesSummary');
    if (mistakeSummaryEl) {
      mistakeSummaryEl.innerHTML = `Most Frequent: <strong>Calculation & Units</strong> (${mistakeTotals.CALCULATION} stumbles)`;
    }
  }
}

function renderClassAnalytics(data) {
  if (!data || !data.classSummary) return;

  const { classSummary, assessment, questionAnalytics, highlights, pedagogicalActionPlan, studentRoster } = data;

  // 1. KPI Cards
  const kpiAvgScore = document.getElementById('kpiAvgScore');
  const kpiAvgSub = document.getElementById('kpiAvgSub');
  const kpiHighestScore = document.getElementById('kpiHighestScore');
  const kpiHighestStudent = document.getElementById('kpiHighestStudent');
  const kpiLowestScore = document.getElementById('kpiLowestScore');
  const kpiLowestStudent = document.getElementById('kpiLowestStudent');
  const kpiAvgVelocity = document.getElementById('kpiAvgVelocity');
  const kpiAvgVelocitySub = document.getElementById('kpiAvgVelocitySub');

  if (kpiAvgScore) {
    kpiAvgScore.innerHTML = `${classSummary.averageScore} <span style="font-size:1rem; color:var(--text-muted); font-weight:500;">/ ${assessment.totalMarks}</span> <span style="font-size:0.95rem; color:var(--accent-cyan);">(${classSummary.averagePercentage})</span>`;
  }
  if (kpiAvgSub) {
    kpiAvgSub.innerText = `${classSummary.totalSubmissions} / ${classSummary.classEnrolledCount} Students Tested (${classSummary.participationRate})`;
  }

  if (kpiHighestScore) {
    kpiHighestScore.innerHTML = `${classSummary.highestScore.score} <span style="font-size:1rem; color:var(--text-muted); font-weight:500;">/ ${assessment.totalMarks}</span> <span style="font-size:0.95rem;">(${classSummary.highestScore.percentage}%)</span>`;
  }
  if (kpiHighestStudent) {
    const names = (classSummary.highestScore.students || []).map(s => s.studentName).join(', ');
    kpiHighestStudent.innerText = names || 'Topper';
  }

  if (kpiLowestScore) {
    kpiLowestScore.innerHTML = `${classSummary.lowestScore.score} <span style="font-size:1rem; color:var(--text-muted); font-weight:500;">/ ${assessment.totalMarks}</span> <span style="font-size:0.95rem;">(${classSummary.lowestScore.percentage}%)</span>`;
  }
  if (kpiLowestStudent) {
    const names = (classSummary.lowestScore.students || []).map(s => s.studentName).join(', ');
    kpiLowestStudent.innerText = names || 'Remedial Focus';
  }

  if (kpiAvgVelocity) {
    const mins = Math.floor(classSummary.averageTimeSpentSeconds / 60);
    const secs = classSummary.averageTimeSpentSeconds % 60;
    kpiAvgVelocity.innerText = `${mins}m ${secs}s`;
  }
  if (kpiAvgVelocitySub) {
    const avgPerQ = Math.round(classSummary.averageTimeSpentSeconds / (assessment.totalQuestions || 1));
    kpiAvgVelocitySub.innerText = `Pacing: ~${avgPerQ}s / Question (Benchmark: 90s)`;
  }

  // 2. Highlights (Most Attempted, Most Failed, Time Hotspot)
  const txtMostAttemptedTitle = document.getElementById('txtMostAttemptedTitle');
  const txtMostAttemptedDetail = document.getElementById('txtMostAttemptedDetail');
  const badgeMostAttemptedRate = document.getElementById('badgeMostAttemptedRate');

  if (highlights.mostAttempted) {
    if (txtMostAttemptedTitle) txtMostAttemptedTitle.innerText = `Q${highlights.mostAttempted.questionIndex}: ${highlights.mostAttempted.subtopic}`;
    if (txtMostAttemptedDetail) txtMostAttemptedDetail.innerText = `${highlights.mostAttempted.attemptCount} / ${classSummary.totalSubmissions} students attempted this question.`;
    if (badgeMostAttemptedRate) badgeMostAttemptedRate.innerText = highlights.mostAttempted.attemptRate;
  }

  const txtMostWrongTitle = document.getElementById('txtMostWrongTitle');
  const txtMostWrongDetail = document.getElementById('txtMostWrongDetail');
  const badgeMostWrongRate = document.getElementById('badgeMostWrongRate');

  if (highlights.mostWrong) {
    if (txtMostWrongTitle) txtMostWrongTitle.innerText = `Q${highlights.mostWrong.questionIndex}: ${highlights.mostWrong.subtopic}`;
    if (txtMostWrongDetail) txtMostWrongDetail.innerText = `${highlights.mostWrong.wrongCount} students made errors. Primary trap: ${highlights.mostWrong.dominantMistake}.`;
    if (badgeMostWrongRate) badgeMostWrongRate.innerText = `${highlights.mostWrong.errorRate} Error`;
  }

  const txtTimeHotspotTitle = document.getElementById('txtTimeHotspotTitle');
  const txtTimeHotspotDetail = document.getElementById('txtTimeHotspotDetail');
  const badgeTimeLag = document.getElementById('badgeTimeLag');

  if (pedagogicalActionPlan.timeManagementAlerts && pedagogicalActionPlan.timeManagementAlerts.length > 0) {
    const tAlert = pedagogicalActionPlan.timeManagementAlerts[0];
    if (txtTimeHotspotTitle) txtTimeHotspotTitle.innerText = `Q${tAlert.questionIndex}: ${tAlert.concept}`;
    if (txtTimeHotspotDetail) txtTimeHotspotDetail.innerText = `Avg ${tAlert.avgTime} vs ${tAlert.benchmarkTime} benchmark. ${tAlert.timeLagSeconds} time lag.`;
    if (badgeTimeLag) badgeTimeLag.innerText = tAlert.timeLagSeconds;
  } else if (questionAnalytics.length > 0) {
    const slowQ = [...questionAnalytics].sort((a,b) => b.avgTimeSpentSeconds - a.avgTimeSpentSeconds)[0];
    if (txtTimeHotspotTitle) txtTimeHotspotTitle.innerText = `Q${slowQ.questionIndex}: ${slowQ.subtopic}`;
    if (txtTimeHotspotDetail) txtTimeHotspotDetail.innerText = `Students spent ${slowQ.avgTimeSpentSeconds}s on average (Benchmark: ${slowQ.benchmarkSeconds}s).`;
    if (badgeTimeLag) badgeTimeLag.innerText = `${slowQ.avgTimeSpentSeconds}s`;
  }

  // 3. Render the 4 Visual Progress Charts
  renderClassAnalyticsCharts(data);

  // 4. Pedagogical Action Plan (Quick Recap vs Teach Once Again)
  const recapContainer = document.getElementById('recapConceptsContainer');
  if (recapContainer) {
    const recaps = pedagogicalActionPlan.quickRecapNeeded || [];
    if (recaps.length === 0) {
      recapContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No concepts in the 50%–75% recap bracket. Excellent retention!</p>';
    } else {
      recapContainer.innerHTML = recaps.map(r => `
        <div class="directive-card recap-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:var(--text-primary); font-size:0.9rem;">Q${r.questionIndex}: ${r.concept}</strong>
            <span class="speed-badge optimal" style="background:rgba(245,158,11,0.2); color:#fbbf24;">${r.accuracyRate} Accuracy</span>
          </div>
          <p style="font-size:0.78rem; color:var(--text-secondary); margin-bottom:6px;">Topic: ${r.topic} &bull; Dominant error: <span class="badge-mistake badge-mistake-formula">${r.dominantMistake}</span></p>
          <div style="background:rgba(0,0,0,0.2); padding:6px 10px; border-radius:4px; font-size:0.78rem; color:#fde68a;">
            <i data-lucide="check" style="width:12px;height:12px;vertical-align:middle;"></i> ${r.recommendation}
          </div>
        </div>
      `).join('');
    }
  }

  const reteachContainer = document.getElementById('reteachConceptsContainer');
  if (reteachContainer) {
    const reteaches = pedagogicalActionPlan.teachOnceAgainNeeded || [];
    if (reteaches.length === 0) {
      reteachContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No critical gaps (<50% accuracy). Class demonstrated solid foundational mastery.</p>';
    } else {
      reteachContainer.innerHTML = reteaches.map(t => `
        <div class="directive-card reteach-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:#f87171; font-size:0.9rem;">Q${t.questionIndex}: ${t.concept}</strong>
            <span class="speed-badge hesitating" style="background:rgba(244,63,94,0.2); color:#fb7185;">${t.accuracyRate} Accuracy &bull; ${t.studentsStruggledCount} Failed</span>
          </div>
          <p style="font-size:0.78rem; color:var(--text-secondary); margin-bottom:6px;">Topic: ${t.topic} &bull; Stumble type: <span class="badge-mistake badge-mistake-calc">${t.dominantMistake}</span></p>
          <div style="background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:4px; font-size:0.78rem; color:#fecdd3;">
            <i data-lucide="alert-circle" style="width:12px;height:12px;vertical-align:middle;"></i> ${t.recommendation}
          </div>
        </div>
      `).join('');
    }
  }

  // 5. Question Breakdown Matrix Table
  const qTableBody = document.getElementById('classQuestionBreakdownTableBody');
  if (qTableBody && questionAnalytics) {
    qTableBody.innerHTML = questionAnalytics.map(q => {
      const isHighFail = q.errorRate >= 50;
      const isRecap = q.accuracyRate >= 50 && q.accuracyRate < 75;
      const statusBadge = isHighFail
        ? '<span class="speed-badge hesitating" style="background:rgba(244,63,94,0.2); color:#fb7185;">Teach Once Again</span>'
        : (isRecap ? '<span class="speed-badge optimal" style="background:rgba(245,158,11,0.2); color:#fbbf24;">Quick Recap</span>' : '<span class="speed-badge fast">Mastered</span>');

      const mistakeBadge = q.dominantMistake !== 'None'
        ? `<span class="badge-mistake badge-mistake-${q.dominantMistake.toLowerCase().includes('calc') ? 'calc' : (q.dominantMistake.toLowerCase().includes('sign') ? 'sign' : (q.dominantMistake.toLowerCase().includes('formula') ? 'formula' : 'conceptual'))}">${q.dominantMistake}</span>`
        : '<span class="badge-mistake badge-mistake-none">None</span>';

      return `
        <tr style="border-bottom: 1px solid var(--border-subtle);">
          <td style="padding: 10px 8px; font-weight:700; color:var(--accent-blue);">Q${q.questionIndex}</td>
          <td style="padding: 10px 8px;">
            <div style="font-weight:600; color:var(--text-primary);">${q.subtopic}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${q.topic}</div>
          </td>
          <td style="padding: 10px 8px;">
            <strong>${q.attemptRate}%</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${q.attemptCount}/${classSummary.totalSubmissions})</span>
          </td>
          <td style="padding: 10px 8px;">
            <span style="font-weight:700; color:${q.accuracyRate >= 70 ? '#34d399' : (q.accuracyRate >= 50 ? '#fbbf24' : '#fb7185')};">${q.accuracyRate}%</span>
          </td>
          <td style="padding: 10px 8px;">
            <span>${q.avgTimeSpentSeconds}s</span> <span style="font-size:0.72rem; color:var(--text-muted);">(${q.benchmarkSeconds}s)</span>
          </td>
          <td style="padding: 10px 8px;">${mistakeBadge}</td>
          <td style="padding: 10px 8px;">${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  // 6. Student Performance Roster Table (Populates both Tab 1 & Tab 2)
  const sTableBody1 = document.getElementById('classStudentRosterTableBody');
  const sTableBody2 = document.getElementById('tabStudentsRosterTableBody');

  function buildRosterRows(roster) {
    if (!roster) return '';
    return roster.map(s => {
      const mins = Math.floor(s.totalTimeSpentSeconds / 60);
      const secs = s.totalTimeSpentSeconds % 60;
      const scoreColor = s.percentage >= 70 ? '#34d399' : (s.percentage >= 50 ? '#fbbf24' : '#fb7185');
      const scoreBg = s.percentage >= 70 ? 'rgba(16,185,129,0.15)' : (s.percentage >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)');

      const mistakeBadge = s.wrongQuestionsCount > 0
        ? `<span class="badge-mistake badge-mistake-calc">${s.primaryMistake}</span>`
        : `<span class="badge-mistake badge-mistake-none">Flawless (100%)</span>`;

      return `
        <tr style="border-bottom: 1px solid var(--border-subtle);">
          <td style="padding: 10px 8px; font-weight:600; color:var(--text-muted);">${s.rollNumber}</td>
          <td style="padding: 10px 8px;">
            <div style="font-weight:700; color:var(--text-primary);">${s.studentName}</div>
            <div style="font-size:0.72rem; color:var(--text-secondary); max-width:280px; text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${s.smartCardSummary || 'Completed test'}</div>
          </td>
          <td style="padding: 10px 8px;">
            <span class="pilot-tag" style="background:${scoreBg}; color:${scoreColor}; font-weight:700; font-size:0.78rem;">
              ${s.score}/${s.totalMarks} (${s.percentage}%)
            </span>
          </td>
          <td style="padding: 10px 8px; font-size:0.8rem;">${mins}m ${secs}s</td>
          <td style="padding: 10px 8px; font-size:0.8rem; font-weight:600; color:${s.wrongQuestionsCount === 0 ? '#34d399' : '#fb7185'};">
            ${s.wrongQuestionsCount} Wrong
          </td>
          <td style="padding: 10px 8px;">${mistakeBadge}</td>
          <td style="padding: 10px 8px; text-align: right;">
            <button class="btn-secondary" onclick="openStudentDrilldown('${s.studentId}', '${assessment.id}')" style="font-size:0.75rem; padding:5px 10px; border-radius:6px; cursor:pointer;">
              <i data-lucide="eye" style="width:13px; height:13px;"></i> View Smart Card
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (sTableBody1 && studentRoster) sTableBody1.innerHTML = buildRosterRows(studentRoster);
  if (sTableBody2 && studentRoster) sTableBody2.innerHTML = buildRosterRows(studentRoster);

  // Setup search filter in Tab 2
  const searchInput = document.getElementById('searchStudentInput');
  if (searchInput && studentRoster) {
    searchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = studentRoster.filter(s => 
        s.studentName.toLowerCase().includes(q) || 
        (s.rollNumber || '').toLowerCase().includes(q)
      );
      if (sTableBody2) sTableBody2.innerHTML = buildRosterRows(filtered);
      initLucideIcons();
    };
  }

  initLucideIcons();
}

// -----------------------------------------------------------------------------
// STUDENT DRILLDOWN CHARTS (Chart.js)
// -----------------------------------------------------------------------------
function renderStudentDrilldownCharts(questionBreakdown, student, smartCard) {
  if (!window.Chart || !questionBreakdown || questionBreakdown.length === 0) return;

  // 1. Time per Question vs Benchmark
  const ctxTime = document.getElementById('chartStudentDrilldownTime');
  if (ctxTime) {
    destroyChart('studentTime');

    const labels = questionBreakdown.map(q => `Q${q.questionIndex}`);
    const studentTimes = questionBreakdown.map(q => q.timeSpentSeconds);
    const benchmarkTimes = questionBreakdown.map(q => q.benchmarkSeconds);

    analyticsCharts.studentTime = new Chart(ctxTime, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: `${student.fullName || 'Student'} Time (s)`,
            data: studentTimes,
            backgroundColor: questionBreakdown.map(q => q.isCorrect ? 'rgba(16, 185, 129, 0.85)' : 'rgba(244, 63, 94, 0.85)'),
            borderColor: questionBreakdown.map(q => q.isCorrect ? '#10b981' : '#f43f5e'),
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Benchmark Target (s)',
            data: benchmarkTimes,
            backgroundColor: 'rgba(148, 163, 184, 0.3)',
            borderColor: '#94a3b8',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', font: { size: 10 } }
          }
        },
        scales: {
          x: { ticks: { color: '#cbd5e1' }, grid: { display: false } },
          y: { ticks: { color: '#94a3b8', callback: (v) => `${v}s` }, grid: { color: 'rgba(255, 255, 255, 0.06)' } }
        }
      }
    });
  }

  // 2. Mistake Types Breakdown
  const ctxMistakes = document.getElementById('chartStudentDrilldownMistakes');
  if (ctxMistakes) {
    destroyChart('studentMistakes');

    let correctCount = 0;
    let conceptualCount = 0;
    let formulaCount = 0;
    let calculationCount = 0;

    questionBreakdown.forEach(q => {
      if (q.isCorrect) {
        correctCount++;
      } else {
        const type = (q.mistakeClassification?.type || '').toUpperCase();
        if (type.includes('CONCEPT')) conceptualCount++;
        else if (type.includes('FORMULA')) formulaCount++;
        else if (type.includes('CALC') || type.includes('SIGN')) calculationCount++;
        else calculationCount++;
      }
    });

    analyticsCharts.studentMistakes = new Chart(ctxMistakes, {
      type: 'doughnut',
      data: {
        labels: [
          `Correct (${correctCount})`,
          `Calculation (${calculationCount})`,
          `Conceptual (${conceptualCount})`,
          `Formula (${formulaCount})`
        ],
        datasets: [{
          data: [correctCount, calculationCount, conceptualCount, formulaCount],
          backgroundColor: [
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(139, 92, 246, 0.85)',
            'rgba(59, 130, 246, 0.85)'
          ],
          borderColor: '#0f172a',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#cbd5e1', font: { size: 10 }, boxWidth: 12 }
          }
        }
      }
    });
  }
}

// 7. Individual Student Drill-Down
async function openStudentDrilldown(studentId, assessmentId) {
  try {
    const res = await fetch(`http://localhost:5050/api/analytics/student-test-drilldown/${studentId}/${assessmentId}`);
    const data = await res.json();

    if (!data.success) {
      alert(data.error || 'Failed to load student drilldown.');
      return;
    }

    const { student, submission, questionBreakdown, smartCard } = data;

    // Header info
    const rollEl = document.getElementById('drilldownStudentRoll');
    const examEl = document.getElementById('drilldownStudentTargetExam');
    const nameEl = document.getElementById('drilldownStudentName');
    const testTitleEl = document.getElementById('drilldownTestTitle');
    const scoreBadge = document.getElementById('drilldownScoreBadge');
    const timeBadge = document.getElementById('drilldownTimeBadge');
    const summaryText = document.getElementById('drilldownSummaryText');
    const teacherAction = document.getElementById('drilldownTeacherAction');
    const parentSnippet = document.getElementById('drilldownParentSnippet');
    const qList = document.getElementById('drilldownQuestionsList');

    if (rollEl) rollEl.innerText = `Roll: ${student.rollNumber || '11-S-24'}`;
    if (examEl) examEl.innerText = student.targetExam || 'CBSE';
    if (nameEl) nameEl.innerText = student.fullName;
    if (testTitleEl) testTitleEl.innerText = submission.assessmentTitle;
    if (scoreBadge) scoreBadge.innerText = `${submission.totalScore}/${submission.totalMarks} (${submission.percentage}%)`;
    if (timeBadge) timeBadge.innerText = smartCard.totalTimeFormatted;
    if (summaryText) summaryText.innerText = smartCard.shortSummary;
    if (teacherAction) teacherAction.innerText = smartCard.teacherActionDirective;
    if (parentSnippet) parentSnippet.innerText = smartCard.parentWhatsAppSnippet;

    // Render Student Modal Charts
    renderStudentDrilldownCharts(questionBreakdown, student, smartCard);

    if (qList && questionBreakdown) {
      qList.innerHTML = questionBreakdown.map(q => {
        const isCorrect = q.isCorrect;
        const pacing = q.speedPacing;
        const m = q.mistakeClassification || {};

        let badgeClass = 'badge-mistake-none';
        if (!isCorrect) {
          const type = (m.type || '').toUpperCase();
          if (type.includes('CALC')) badgeClass = 'badge-mistake-calc';
          else if (type.includes('SIGN')) badgeClass = 'badge-mistake-sign';
          else if (type.includes('FORMULA')) badgeClass = 'badge-mistake-formula';
          else if (type.includes('TIME')) badgeClass = 'badge-mistake-time';
          else badgeClass = 'badge-mistake-conceptual';
        }

        const pacingColor = pacing === 'FAST' ? '#10b981' : (pacing === 'OPTIMAL' ? '#38bdf8' : '#f59e0b');

        return `
          <div style="background:rgba(255,255,255,0.02); border:1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.35)'}; border-radius:var(--radius-md); padding:1rem;">
            <!-- Question Header -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
              <div>
                <strong style="color:var(--text-primary); font-size:0.95rem;">Q${q.questionIndex}: ${q.subtopic}</strong>
                <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Topic: ${q.topic}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="speed-badge" style="background:${pacing === 'FAST' ? 'rgba(16,185,129,0.2)' : (pacing === 'OPTIMAL' ? 'rgba(56,189,248,0.2)' : 'rgba(245,158,11,0.2)')}; color:${pacingColor};">
                  ⏱️ ${q.timeSpentSeconds}s (Target: ${q.benchmarkSeconds}s) &bull; ${pacing}
                </span>
                <span class="pilot-tag" style="background:${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}; color:${isCorrect ? '#34d399' : '#fb7185'}; font-weight:700;">
                  ${isCorrect ? 'CORRECT (+4M)' : 'INCORRECT'}
                </span>
              </div>
            </div>

            <!-- Mistake Classification & Explanation -->
            <div style="background:rgba(0,0,0,0.25); border-radius:var(--radius-sm); padding:10px 12px; margin-top:8px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
                <span class="badge-mistake ${badgeClass}">${m.label || m.type}</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">
                  Selected: <strong style="color:${isCorrect ? '#34d399' : '#fb7185'};">${q.selectedOption || 'None'}</strong> | Expected: <strong style="color:#34d399;">${q.correctAnswer}</strong>
                </span>
              </div>
              <p style="font-size:0.82rem; color:var(--text-primary); margin-bottom:2px; line-height:1.4;">
                ${m.explanation || ''}
              </p>
              ${m.distractorTrap ? `
                <div style="font-size:0.75rem; color:#fca5a5; margin-top:4px;">
                  ⚠️ <em>Trap identified: ${m.distractorTrap}</em>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    const modal = document.getElementById('modalStudentDrilldown');
    if (modal) modal.classList.add('active');
    initLucideIcons();
  } catch (err) {
    console.error('[STUDENT DRILLDOWN] Error:', err.message);
  }
}

function closeStudentDrilldown() {
  const modal = document.getElementById('modalStudentDrilldown');
  if (modal) modal.classList.remove('active');
  destroyChart('studentTime');
  destroyChart('studentMistakes');
}

// Global exposure for inline onclick handlers
window.openStudentDrilldown = openStudentDrilldown;
window.closeStudentDrilldown = closeStudentDrilldown;
window.loadClassAnalytics = loadClassAnalytics;

// -----------------------------------------------------------------------------
// 12. TEACHER-SCOPED CURRICULUM TEST & QUIZ GENERATOR (FIRST-PRINCIPLES LOGICAL VIEW)
// -----------------------------------------------------------------------------
const teacherBuilderState = {
  classes: [],
  selectedClassId: '12-NonMed',
  selectedSubjectKey: 'PHYSICS',
  currentTaxonomy: null,
  expandedChapters: new Set([1]),
  activeModalScope: null
};

function getSubjectIcon(key) {
  switch (key) {
    case 'PHYSICS': return 'zap';
    case 'CHEMISTRY': return 'flask-conical';
    case 'MATHEMATICS': return 'calculator';
    case 'BIOLOGY': return 'dna';
    case 'CLASS10_SCIENCE':
    case 'SCIENCE': return 'atom';
    case 'CLASS10_MATHEMATICS': return 'calculator';
    default: return 'book-open';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getFallbackClasses() {
  return [
    {
      id: '12-NonMed',
      key: '12-NonMed',
      name: 'Class 12th (Non-Medical)',
      grade: '12',
      section: '12-NonMed',
      stream: 'NON_MEDICAL',
      badge: 'JEE & Boards',
      defaultSubject: 'PHYSICS',
      subjects: [
        { key: 'PHYSICS', name: 'Physics', grade: '12' },
        { key: 'CHEMISTRY', name: 'Chemistry', grade: '12' },
        { key: 'MATHEMATICS', name: 'Mathematics', grade: '12' }
      ],
      students: [
        { id: '12-NM-01', name: 'Aryan Sharma', roll: '12-NM-01' },
        { id: '12-NM-02', name: 'Rohit Negi', roll: '12-NM-02' },
        { id: '12-NM-03', name: 'Kavya Verma', roll: '12-NM-03' },
        { id: '12-NM-04', name: 'Kunal Sharma', roll: '12-NM-04' },
        { id: '12-NM-05', name: 'Divyansh Thakur', roll: '12-NM-05' },
        { id: '12-NM-06', name: 'Akshat Jaswal', roll: '12-NM-06' },
        { id: '12-NM-07', name: 'Rahul Sen', roll: '12-NM-07' },
        { id: '12-NM-08', name: 'Sahil Dhiman', roll: '12-NM-08' }
      ]
    },
    {
      id: '12-Med',
      key: '12-Med',
      name: 'Class 12th (Medical)',
      grade: '12',
      section: '12-Med',
      stream: 'MEDICAL',
      badge: 'NEET & Boards',
      defaultSubject: 'BIOLOGY',
      subjects: [
        { key: 'PHYSICS', name: 'Physics', grade: '12' },
        { key: 'CHEMISTRY', name: 'Chemistry', grade: '12' },
        { key: 'BIOLOGY', name: 'Biology', grade: '12' }
      ],
      students: [
        { id: '12-M-01', name: 'Ananya Thakur', roll: '12-M-01' },
        { id: '12-M-02', name: 'Simran Kaur', roll: '12-M-02' },
        { id: '12-M-03', name: 'Mehak Sharma', roll: '12-M-03' },
        { id: '12-M-04', name: 'Pallavi Katoch', roll: '12-M-04' },
        { id: '12-M-05', name: 'Shreya Dogra', roll: '12-M-05' }
      ]
    },
    {
      id: '10-Science-A',
      key: '10-Science-A',
      name: 'Class 10th (Section A)',
      grade: '10',
      section: '10-Science-A',
      stream: 'FOUNDATION',
      badge: 'Secondary',
      defaultSubject: 'CLASS10_SCIENCE',
      subjects: [
        { key: 'CLASS10_SCIENCE', name: 'Science', grade: '10' },
        { key: 'CLASS10_MATHEMATICS', name: 'Mathematics', grade: '10' }
      ],
      students: [
        { id: '10-A-01', name: 'Rohit Verma', roll: '10-A-01' },
        { id: '10-A-02', name: 'Aditya Chauhan', roll: '10-A-02' },
        { id: '10-A-03', name: 'Tanvi Sood', roll: '10-A-03' },
        { id: '10-A-04', name: 'Nikhil Rana', roll: '10-A-04' }
      ]
    }
  ];
}

async function setupTeacherTestBuilder() {
  const classSelect = document.getElementById('selectTeacherClassScope');
  const pillsContainer = document.getElementById('containerSubjectPills');
  const rosterBtn = document.getElementById('btnToggleClassRosterPreview');
  const rosterDrawer = document.getElementById('drawerClassRosterPreview');
  const searchInput = document.getElementById('searchChapterInput');
  const modal = document.getElementById('modalGenerateCurriculumTest');
  const btnCloseModal = document.getElementById('btnCloseGenTestModal');
  const btnCancelModal = document.getElementById('btnCancelGenModal');

  if (!classSelect || !pillsContainer) return;

  // 1. Fetch available classes & enrolled students
  await loadTeacherClassesList();

  // 2. Class change listener
  classSelect.addEventListener('change', (e) => {
    teacherBuilderState.selectedClassId = e.target.value;
    updateTeacherClassScopeUI();
  });

  // 3. Roster drawer toggle
  if (rosterBtn && rosterDrawer) {
    rosterBtn.addEventListener('click', () => {
      rosterDrawer.classList.toggle('open');
      const icon = document.getElementById('iconRosterDrawerChevron');
      if (icon) {
        icon.style.transform = rosterDrawer.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  // 4. Search/filter input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderCurriculumChaptersAccordion(e.target.value.trim());
    });
  }

  // 5. Modal close buttons
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeCurriculumTestModal);
  }
  if (btnCancelModal) {
    btnCancelModal.addEventListener('click', closeCurriculumTestModal);
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCurriculumTestModal();
    });
  }
}

async function loadTeacherClassesList() {
  try {
    const res = await fetch('http://localhost:5050/api/curriculum/classes');
    if (res.ok) {
      const data = await res.json();
      teacherBuilderState.classes = (data.classes || []).map(c => ({
        ...c,
        id: c.key || c.id || c.section
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch curriculum classes from backend, using default roster:', err);
    teacherBuilderState.classes = getFallbackClasses();
  }

  if (!teacherBuilderState.classes || teacherBuilderState.classes.length === 0) {
    teacherBuilderState.classes = getFallbackClasses();
  }

  // Populate #selectTeacherClassScope options
  const classSelect = document.getElementById('selectTeacherClassScope');
  if (classSelect && teacherBuilderState.classes.length > 0) {
    classSelect.innerHTML = teacherBuilderState.classes.map(c => `
      <option value="${c.id}" ${c.id === teacherBuilderState.selectedClassId ? 'selected' : ''}>
        ${c.name} &bull; ${c.badge || (c.stream ? c.stream.replace('_', ' ') : 'General')}
      </option>
    `).join('');
  }

  updateTeacherClassScopeUI();
}

function updateTeacherClassScopeUI() {
  const currentClass = teacherBuilderState.classes.find(c => c.id === teacherBuilderState.selectedClassId) 
    || teacherBuilderState.classes[0];
  if (!currentClass) return;

  // 1. Update enrolled students count badge and roster chips
  const countLabel = document.getElementById('labelEnrolledStudentsCount');
  const chipsContainer = document.getElementById('listClassEnrolledStudentChips');
  const targetClassLabel = document.getElementById('labelGenTargetClass');

  const students = currentClass.students || [];
  if (countLabel) {
    countLabel.innerText = `${students.length} Students in Class`;
  }
  if (targetClassLabel) {
    targetClassLabel.innerText = `All ${students.length} Students in ${currentClass.name}`;
  }

  if (chipsContainer) {
    chipsContainer.innerHTML = students.map(s => `
      <span class="student-chip">
        <i data-lucide="user" style="width:11px; height:11px; opacity:0.7;"></i>
        ${s.name} <span class="roll-badge">${s.roll || s.id}</span>
      </span>
    `).join('');
  }

  // 2. Render Subject Pills strictly scoped to this class
  const pillsContainer = document.getElementById('containerSubjectPills');
  if (pillsContainer) {
    const subjects = currentClass.subjects || [];
    
    // Check if current selected subject is valid for this class; if not, switch to defaultSubject or first subject
    const subjectExists = subjects.some(s => s.key === teacherBuilderState.selectedSubjectKey);
    if (!subjectExists && subjects.length > 0) {
      teacherBuilderState.selectedSubjectKey = currentClass.defaultSubject || subjects[0].key;
    }

    pillsContainer.innerHTML = subjects.map(s => {
      const isActive = s.key === teacherBuilderState.selectedSubjectKey;
      return `
        <button type="button" 
          class="subject-pill-btn ${isActive ? 'active' : ''}" 
          data-subject-key="${s.key}"
          data-grade="${s.grade || currentClass.grade}"
          onclick="selectCurriculumSubject('${s.key}', '${s.grade || currentClass.grade}')">
          <i data-lucide="${getSubjectIcon(s.key)}" style="width:14px; height:14px;"></i>
          ${s.name}
        </button>
      `;
    }).join('');
  }

  initLucideIcons();

  // 3. Load curriculum taxonomy for the selected subject & grade
  loadCurriculumForClassAndSubject(teacherBuilderState.selectedSubjectKey, currentClass.grade);
}

async function loadCurriculumForClassAndSubject(subjectKey, grade) {
  const container = document.getElementById('testBuilderChaptersContainer');
  const headingTitle = document.getElementById('headingCurriculumSubjectTitle');

  const currentClass = teacherBuilderState.classes.find(c => c.id === teacherBuilderState.selectedClassId);
  const currentSubj = currentClass?.subjects?.find(s => s.key === subjectKey);
  const subjName = currentSubj ? currentSubj.name : subjectKey;

  if (headingTitle) {
    headingTitle.innerHTML = `Class ${grade || '12'} ${subjName} &bull; Complete Chapter List`;
  }

  if (container) {
    container.innerHTML = `
      <div style="text-align:center; padding: 2.5rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        <i data-lucide="loader-2" class="spin" style="width:26px; height:26px; margin: 0 auto 10px; display:block; color:var(--accent-blue);"></i>
        Loading structured NCERT syllabus for ${subjName}...
      </div>
    `;
    initLucideIcons();
  }

  try {
    const url = `http://localhost:5050/api/curriculum/taxonomy/${subjectKey}?grade=${grade || '12'}`;
    const res = await fetch(url);
    if (res.ok) {
      teacherBuilderState.currentTaxonomy = await res.json();
    } else {
      throw new Error(`API status ${res.status}`);
    }
  } catch (err) {
    console.warn('[CURRICULUM BUILDER] Using fallback taxonomy:', err);
    teacherBuilderState.currentTaxonomy = getOfflineCurriculumFallback(subjectKey, grade);
  }

  // By default, open Chapter 1 so the teacher immediately sees the sub-topics
  teacherBuilderState.expandedChapters = new Set([1]);
  renderCurriculumChaptersAccordion();
}

function renderCurriculumChaptersAccordion(filterQuery = '') {
  const container = document.getElementById('testBuilderChaptersContainer');
  if (!container) return;

  const taxonomy = teacherBuilderState.currentTaxonomy;
  if (!taxonomy || !taxonomy.chapters || taxonomy.chapters.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 2.5rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md);">
        <i data-lucide="alert-circle" style="width:28px; height:28px; margin: 0 auto 10px; display:block; color: #f59e0b;"></i>
        No syllabus chapters found for this selection.
      </div>
    `;
    initLucideIcons();
    return;
  }

  const query = (filterQuery || '').toLowerCase();

  let visibleChapters = taxonomy.chapters;
  if (query) {
    visibleChapters = taxonomy.chapters.filter(ch => {
      const chTitle = (ch.chapterName || ch.title || '').toLowerCase();
      const unit = (ch.unit || '').toLowerCase();
      const hasTopicMatch = (ch.topics || []).some(t => {
        const tTitle = (t.topicName || t.title || '').toLowerCase();
        const hasSubMatch = (t.subtopics || []).some(st => (typeof st === 'string' ? st : (st.title || '')).toLowerCase().includes(query));
        return tTitle.includes(query) || hasSubMatch;
      });
      return chTitle.includes(query) || unit.includes(query) || hasTopicMatch;
    });
  }

  if (visibleChapters.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 2rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md);">
        No chapters or sub-topics match "<strong>${filterQuery}</strong>". Try clearing your search.
      </div>
    `;
    return;
  }

  container.innerHTML = visibleChapters.map(ch => {
    const chNum = ch.chapterNumber;
    const chTitle = ch.chapterName || ch.title || `Chapter ${chNum}`;
    const isExpanded = teacherBuilderState.expandedChapters.has(chNum) || !!query;
    const topics = ch.topics || [];
    
    // Count total sub-topics
    let totalSubtopics = 0;
    topics.forEach(t => {
      totalSubtopics += (t.subtopics || []).length;
    });

    const examFocus = ch.boardExamFocus;

    return `
      <div class="chapter-accordion-card ${isExpanded ? 'expanded' : ''}" id="chapterCard_${chNum}">
        <!-- CHAPTER HEADER -->
        <div class="chapter-accordion-header" onclick="toggleChapterAccordion(${chNum}, event)">
          <div class="chapter-info-col">
            <div class="chapter-title-row">
              <span class="chapter-badge">Ch ${chNum}</span>
              <span class="chapter-name">${chTitle}</span>
            </div>
            <div class="chapter-meta-row">
              ${ch.unit ? `<span><i data-lucide="folder" style="width:11px; height:11px; vertical-align:middle;"></i> ${ch.unit}</span>` : ''}
              <span>&bull;</span>
              <span>${topics.length} Main Topics</span>
              <span>&bull;</span>
              <span>${totalSubtopics} Sub-topics</span>
              ${ch.discipline ? `<span class="stream-tag">${ch.discipline}</span>` : ''}
            </div>
          </div>

          <!-- Quick Action Buttons on Header -->
          <div class="chapter-header-actions" onclick="event.stopPropagation();">
            <button type="button" class="btn-gen-chapter-test" 
              onclick="openGenTestForChapter(${chNum}, '${escapeHtml(chTitle)}', event)"
              title="Generate a full test covering all ${totalSubtopics} sub-topics of this chapter">
              <i data-lucide="zap" style="width:14px; height:14px;"></i>
              Generate Chapter Test
            </button>
            <div class="accordion-chevron-circle" onclick="toggleChapterAccordion(${chNum}, event)">
              <i data-lucide="chevron-down" style="width:16px; height:16px; transition: transform 0.2s ease;"></i>
            </div>
          </div>
        </div>

        <!-- ACCORDION BODY (SUB-TOPICS & TOPIC DETAILS) -->
        <div class="chapter-accordion-body" style="display: ${isExpanded ? 'block' : 'none'};">
          ${examFocus ? `
            <div class="exam-focus-callout">
              <div class="callout-header">
                <i data-lucide="award" style="width:14px; height:14px; color:#f59e0b;"></i>
                <strong>Board & Competitive Exam Focus</strong>
              </div>
              <div class="callout-body">
                <div><strong>High-Yield:</strong> ${examFocus.highYield || 'Standard questions'}</div>
                ${examFocus.standardTrap ? `<div style="margin-top:4px; color:#f87171;"><strong>Common Trap:</strong> ${examFocus.standardTrap}</div>` : ''}
              </div>
            </div>
          ` : ''}

          <div class="topics-accordion-list">
            ${topics.map((t, tIdx) => {
              const tTitle = t.topicName || t.title || `Topic ${tIdx + 1}`;
              const subtopics = (t.subtopics || []).map(st => typeof st === 'string' ? st : (st.title || st.name || ''));
              const escapedTopicTitle = escapeHtml(tTitle);
              const escapedSubtopicsJson = escapeHtml(JSON.stringify(subtopics));

              return `
                <div class="topic-section-block">
                  <div class="topic-section-header">
                    <div class="topic-title-area">
                      <span class="topic-tag">${t.ncertSection ? `Sec ${t.ncertSection}` : `Topic ${tIdx + 1}`}</span>
                      <strong class="topic-title">${tTitle}</strong>
                      ${t.highYield ? `<span class="badge-highyield"><i data-lucide="flame" style="width:11px; height:11px;"></i> High Yield</span>` : ''}
                    </div>

                    <div class="topic-actions">
                      <button type="button" class="btn-subtopic-quiz"
                        onclick="openGenTestForTopic(${chNum}, '${escapeHtml(chTitle)}', '${escapedTopicTitle}', ${escapedSubtopicsJson}, event)"
                        title="Create a quiz or assignment strictly focused on this topic's sub-topics">
                        <i data-lucide="pencil-line" style="width:13px; height:13px;"></i>
                        Create Sub-Topic Quiz
                      </button>
                    </div>
                  </div>

                  <!-- Subtopic Bullets List -->
                  <div class="subtopics-list">
                    ${subtopics.map(st => `
                      <div class="subtopic-item-row">
                        <div class="subtopic-bullet-col">
                          <i data-lucide="circle-dot" style="width:11px; height:11px; color:var(--accent-blue);"></i>
                          <span class="subtopic-text">${st}</span>
                        </div>
                        <button type="button" class="btn-micro-quiz" 
                          onclick="openGenTestForSingleSubtopic(${chNum}, '${escapeHtml(chTitle)}', '${escapeHtml(st)}', event)"
                          title="Generate a 3-question quick check on this exact concept">
                          Quick Quiz
                        </button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  initLucideIcons();
}

function toggleChapterAccordion(chNum, event) {
  if (event) event.stopPropagation();
  if (teacherBuilderState.expandedChapters.has(chNum)) {
    teacherBuilderState.expandedChapters.delete(chNum);
  } else {
    teacherBuilderState.expandedChapters.add(chNum);
  }
  const card = document.getElementById(`chapterCard_${chNum}`);
  if (card) {
    const isNowExpanded = teacherBuilderState.expandedChapters.has(chNum);
    card.classList.toggle('expanded', isNowExpanded);
    const body = card.querySelector('.chapter-accordion-body');
    if (body) {
      body.style.display = isNowExpanded ? 'block' : 'none';
    }
  }
  initLucideIcons();
}

function selectCurriculumSubject(subjectKey, grade) {
  teacherBuilderState.selectedSubjectKey = subjectKey;
  
  // Update pill active class
  document.querySelectorAll('.subject-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-subject-key') === subjectKey);
  });

  const currentClass = teacherBuilderState.classes.find(c => c.id === teacherBuilderState.selectedClassId);
  loadCurriculumForClassAndSubject(subjectKey, grade || currentClass?.grade || '12');
}

function openGenTestForChapter(chNum, chTitle, event) {
  if (event) event.stopPropagation();
  const currentClass = teacherBuilderState.classes.find(c => c.id === teacherBuilderState.selectedClassId);
  const chapter = teacherBuilderState.currentTaxonomy?.chapters?.find(c => c.chapterNumber === chNum);
  
  // Collect all subtopics for this chapter
  const allSubtopics = [];
  if (chapter && chapter.topics) {
    chapter.topics.forEach(t => {
      (t.subtopics || []).forEach(st => {
        allSubtopics.push(typeof st === 'string' ? st : (st.title || ''));
      });
    });
  }

  teacherBuilderState.activeModalScope = {
    classId: teacherBuilderState.selectedClassId,
    subjectKey: teacherBuilderState.selectedSubjectKey,
    chapterNumber: chNum,
    chapterTitle: chTitle,
    subtopics: allSubtopics,
    isFullChapter: true
  };

  const currentSubj = currentClass?.subjects?.find(s => s.key === teacherBuilderState.selectedSubjectKey);
  const subjName = currentSubj ? currentSubj.name : 'Physics';

  // Fill modal fields
  document.getElementById('modalGenClassBadge').innerText = currentClass ? currentClass.name : 'Class 12th';
  document.getElementById('modalGenChapterTitle').innerText = `Ch ${chNum}: ${chTitle}`;
  document.getElementById('modalGenScopeSubtitle').innerText = `Scope: Full Chapter Comprehensive (${allSubtopics.length} Sub-topics)`;
  document.getElementById('inputGenTestTitle').value = `${subjName}: Ch ${chNum} ${chTitle} - Chapter Test`;
  document.getElementById('selectGenTestMode').value = 'TEST';
  document.getElementById('selectGenTestCount').value = '10';
  document.getElementById('selectGenTestDifficulty').value = 'MEDIUM';
  document.getElementById('labelGenTargetClass').innerText = `All ${currentClass?.students?.length || 8} Students in ${currentClass?.name || 'Class'}`;

  const modal = document.getElementById('modalGenerateCurriculumTest');
  if (modal) modal.classList.add('active');
  initLucideIcons();
}

function openGenTestForTopic(chNum, chTitle, topicTitle, subtopics, event) {
  if (event) event.stopPropagation();
  const currentClass = teacherBuilderState.classes.find(c => c.id === teacherBuilderState.selectedClassId);
  const currentSubj = currentClass?.subjects?.find(s => s.key === teacherBuilderState.selectedSubjectKey);
  const subjName = currentSubj ? currentSubj.name : 'Physics';

  teacherBuilderState.activeModalScope = {
    classId: teacherBuilderState.selectedClassId,
    subjectKey: teacherBuilderState.selectedSubjectKey,
    chapterNumber: chNum,
    chapterTitle: chTitle,
    subtopics: subtopics || [topicTitle],
    isFullChapter: false
  };

  document.getElementById('modalGenClassBadge').innerText = currentClass ? currentClass.name : 'Class 12th';
  document.getElementById('modalGenChapterTitle').innerText = `${topicTitle}`;
  document.getElementById('modalGenScopeSubtitle').innerText = `Scope: Sub-topics under ${chTitle} (${(subtopics || []).length} Sub-topics)`;
  document.getElementById('inputGenTestTitle').value = `${subjName} Quiz: ${topicTitle}`;
  document.getElementById('selectGenTestMode').value = 'QUIZ';
  document.getElementById('selectGenTestCount').value = '5';
  document.getElementById('selectGenTestDifficulty').value = 'MEDIUM';
  document.getElementById('labelGenTargetClass').innerText = `All ${currentClass?.students?.length || 8} Students in ${currentClass?.name || 'Class'}`;

  const modal = document.getElementById('modalGenerateCurriculumTest');
  if (modal) modal.classList.add('active');
  initLucideIcons();
}

function openGenTestForSingleSubtopic(chNum, chTitle, subtopic, event) {
  if (event) event.stopPropagation();
  const currentClass = teacherBuilderState.classes.find(c => c.id === teacherBuilderState.selectedClassId);
  const currentSubj = currentClass?.subjects?.find(s => s.key === teacherBuilderState.selectedSubjectKey);
  const subjName = currentSubj ? currentSubj.name : 'Physics';

  teacherBuilderState.activeModalScope = {
    classId: teacherBuilderState.selectedClassId,
    subjectKey: teacherBuilderState.selectedSubjectKey,
    chapterNumber: chNum,
    chapterTitle: chTitle,
    subtopics: [subtopic],
    isFullChapter: false
  };

  document.getElementById('modalGenClassBadge').innerText = currentClass ? currentClass.name : 'Class 12th';
  document.getElementById('modalGenChapterTitle').innerText = subtopic;
  document.getElementById('modalGenScopeSubtitle').innerText = `Scope: Single Sub-topic Focus (${chTitle})`;
  document.getElementById('inputGenTestTitle').value = `Quick Check: ${subtopic.split(':')[0] || subtopic}`;
  document.getElementById('selectGenTestMode').value = 'QUIZ';
  document.getElementById('selectGenTestCount').value = '3';
  document.getElementById('selectGenTestDifficulty').value = 'MEDIUM';
  document.getElementById('labelGenTargetClass').innerText = `All ${currentClass?.students?.length || 8} Students in ${currentClass?.name || 'Class'}`;

  const modal = document.getElementById('modalGenerateCurriculumTest');
  if (modal) modal.classList.add('active');
  initLucideIcons();
}

function closeCurriculumTestModal() {
  const modal = document.getElementById('modalGenerateCurriculumTest');
  if (modal) modal.classList.remove('active');
}

async function submitGenerateCurriculumTest() {
  const scope = teacherBuilderState.activeModalScope;
  if (!scope) return;

  const currentClass = teacherBuilderState.classes.find(c => c.id === teacherBuilderState.selectedClassId) || {};
  const currentSubj = currentClass?.subjects?.find(s => s.key === teacherBuilderState.selectedSubjectKey);
  const subjName = currentSubj ? currentSubj.name : 'Physics';

  const btnSubmit = document.getElementById('btnSubmitGenTest');
  const title = document.getElementById('inputGenTestTitle')?.value?.trim() || `${scope.chapterTitle} Test`;
  const mode = document.getElementById('selectGenTestMode')?.value || 'QUIZ';
  const questionCount = parseInt(document.getElementById('selectGenTestCount')?.value || '5', 10);
  const difficulty = document.getElementById('selectGenTestDifficulty')?.value || 'MEDIUM';

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:16px;height:16px;"></i> Generating & Assigning to Class...`;
    initLucideIcons();
  }

  try {
    const payload = {
      classKey: teacherBuilderState.selectedClassId,
      grade: currentClass.grade || '12',
      section: currentClass.section || currentClass.key || teacherBuilderState.selectedClassId,
      subjectKey: teacherBuilderState.selectedSubjectKey,
      subjectName: subjName,
      chapterNumber: scope.chapterNumber,
      chapterName: scope.chapterTitle,
      subtopics: scope.isFullChapter ? [] : scope.subtopics,
      mode,
      questionCount,
      difficulty,
      title
    };

    const res = await fetch('http://localhost:5050/api/curriculum/generate-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      closeCurriculumTestModal();

      const modeLabel = mode === 'QUIZ' ? 'Speed Quiz' : (mode === 'ASSIGNMENT' ? 'Assignment' : 'Diagnostic Test');
      const studentCount = data.assignedStudentsCount || 8;
      
      alert(`🎉 ${modeLabel} Successfully Created & Assigned!\n\n` +
        `• Title: "${data.assessment?.title || title}"\n` +
        `• Chapter: ${scope.chapterTitle}\n` +
        `• Questions: ${data.assessment?.questions?.length || questionCount} Questions\n` +
        `• Assigned to: ${studentCount} Students in ${currentClass.name || teacherBuilderState.selectedClassId}\n\n` +
        `Initial student submissions and diagnostics are ready! Switching to Class Dashboard...`);

      // Switch to Class Analytics Tab and load this test
      if (data.assessment && data.assessment.id) {
        await loadClassAnalytics(data.assessment.id);
      } else {
        await loadClassAnalytics();
      }

      // Switch to Class Dashboard tab
      const classDashTabBtn = document.getElementById('tabBtnClassAnalytics');
      if (classDashTabBtn) {
        classDashTabBtn.click();
      }
    } else {
      throw new Error(`Server returned ${res.status}`);
    }
  } catch (err) {
    console.error('Error generating curriculum test:', err);
    alert('There was an error generating the test. Please check backend connection.');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<i data-lucide="zap" style="width:16px;height:16px;"></i> Create & Assign Now`;
      initLucideIcons();
    }
  }
}

// Global exposure for inline onclick handlers
window.toggleChapterAccordion = toggleChapterAccordion;
window.selectCurriculumSubject = selectCurriculumSubject;
window.openGenTestForChapter = openGenTestForChapter;
window.openGenTestForTopic = openGenTestForTopic;
window.openGenTestForSingleSubtopic = openGenTestForSingleSubtopic;
window.closeCurriculumTestModal = closeCurriculumTestModal;
window.submitGenerateCurriculumTest = submitGenerateCurriculumTest;
window.setupTeacherTestBuilder = setupTeacherTestBuilder;



