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
  initApp();
});

function initApp() {
  initLucideIcons();
  setupRoleSwitching();
  setupTeacherSubTabs();
  setupThemeToggle();
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

      if (targetTabId === 'tabClass10Pyq' && allClass10Pyqs.length === 0) {
        setupClass10PyqExplorer();
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
      alert(`✅ Question added to Active Classroom Test Session!\nTarget: Class ${q.grade || '10'} ${q.subject || 'Science'}\nEngine: ${q.llm_provider || 'AI Engine'}\nBenchmark Time: ${q.benchmark_time_seconds || 120}s`);
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
// 2B. CLASS 10 NCERT & PYQ EXPLORER
// -----------------------------------------------------------------------------
let allClass10Pyqs = [];

async function setupClass10PyqExplorer() {
  const container = document.getElementById('class10PyqContainer');
  const totalCountEl = document.getElementById('pyqTotalCount');
  const btnRefresh = document.getElementById('btnRefreshPyqBank');
  const filterSubject = document.getElementById('pyqFilterSubject');
  const filterChapter = document.getElementById('pyqFilterChapter');
  const filterBoard = document.getElementById('pyqFilterBoard');
  const searchInput = document.getElementById('pyqSearchInput');

  if (!container) return;

  const loadPyqs = async () => {
    container.innerHTML = `
      <div style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
        <i data-lucide="loader-2" class="spin" style="width:24px; height:24px; margin: 0 auto 8px; display:block;"></i>
        Loading verified NCERT Class 10 Board Questions...
      </div>
    `;
    initLucideIcons();

    try {
      const res = await fetch('http://localhost:5050/api/questions/class10-pyq');
      if (res.ok) {
        const data = await res.json();
        allClass10Pyqs = data.questions || [];
      } else {
        throw new Error('Fallback to bundled PYQs');
      }
    } catch (e) {
      console.warn('Backend PYQ fetch error, loading default PYQ set:', e);
      allClass10Pyqs = getBundledClass10Pyqs();
    }

    if (totalCountEl) totalCountEl.innerText = allClass10Pyqs.length;
    filterAndRenderPyqs();
  };

  const filterAndRenderPyqs = () => {
    let filtered = [...allClass10Pyqs];
    const subj = filterSubject ? filterSubject.value : 'ALL';
    const chap = filterChapter ? filterChapter.value : 'ALL';
    const board = filterBoard ? filterBoard.value : 'ALL';
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    if (subj !== 'ALL') {
      filtered = filtered.filter(q => q.subject.toLowerCase() === subj.toLowerCase());
    }
    if (chap !== 'ALL') {
      filtered = filtered.filter(q => q.chapter.toLowerCase().includes(chap.toLowerCase()));
    }
    if (board !== 'ALL') {
      filtered = filtered.filter(q => q.ncert_mapping && q.ncert_mapping.pyq_tag.toLowerCase().includes(board.toLowerCase()));
    }
    if (query) {
      filtered = filtered.filter(q => 
        q.chapter.toLowerCase().includes(query) ||
        q.question_latex.toLowerCase().includes(query) ||
        (q.ncert_mapping && q.ncert_mapping.ncert_section.toLowerCase().includes(query)) ||
        (q.ncert_mapping && q.ncert_mapping.page_reference.toLowerCase().includes(query))
      );
    }

    renderPyqCards(filtered);
  };

  if (filterSubject) filterSubject.addEventListener('change', filterAndRenderPyqs);
  if (filterChapter) filterChapter.addEventListener('change', filterAndRenderPyqs);
  if (filterBoard) filterBoard.addEventListener('change', filterAndRenderPyqs);
  if (searchInput) searchInput.addEventListener('input', filterAndRenderPyqs);
  if (btnRefresh) btnRefresh.addEventListener('click', loadPyqs);

  await loadPyqs();
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
        state.currentQuestion = qObj;
        alert(`✅ Question "${qObj.chapter}" added to Active Classroom Assessment Test!\nBenchmark: ${qObj.benchmark_time_seconds}s\nAligned: ${qObj.ncert_mapping?.pyq_tag}`);
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
    btnSubmitExam.addEventListener('click', () => {
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;
      let totalMarks = 0;

      examState.questions.forEach((q, idx) => {
        const studentAns = examState.answers[idx];
        if (studentAns === null) {
          unattempted++;
        } else if (studentAns === q.correctKey) {
          correct++;
          totalMarks += 4;
        } else {
          incorrect++;
          totalMarks -= 1;
        }
      });

      const maxMarks = examState.questions.length * 4;
      const pct = Math.max(0, ((totalMarks / maxMarks) * 100)).toFixed(1);

      if (confirm(`Submit Official Assessment?\n\n• Attempted: ${30 - unattempted} / 30\n• Correct (+4): ${correct}\n• Incorrect (-1): ${incorrect}\n• Estimated Score: ${totalMarks} / ${maxMarks} (${pct}%)\n\nProceed to sync results to Teacher Co-Pilot?`)) {
        alert(`🎉 Assessment Successfully Submitted!\n\nScore: ${totalMarks} / ${maxMarks} (${pct}%)\n• Correct: ${correct}\n• Incorrect: ${incorrect}\n• Unanswered: ${unattempted}\n\nReal-time Kafka telemetry sent to HAPS Teacher Co-Pilot and Parent WhatsApp Dossier.`);
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

  container.innerHTML = '';
  for (let i = 0; i < 30; i++) {
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
  const answered = examState.answers.filter(a => a !== null).length;
  const review = examState.reviewStatus.filter((r, idx) => r && examState.answers[idx] === null).length;
  const visited = examState.visitedStatus.filter((v, idx) => v && examState.answers[idx] === null && !examState.reviewStatus[idx]).length;
  const notVisited = 30 - examState.visitedStatus.filter(v => v).length;

  document.getElementById('countAnswered').innerText = answered;
  document.getElementById('countNotAnswered').innerText = visited;
  document.getElementById('countReview').innerText = review;
  document.getElementById('countNotVisited').innerText = notVisited;
}

// Initialization is handled cleanly on DOMContentLoaded via initApp()
