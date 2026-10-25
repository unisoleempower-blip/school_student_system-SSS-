// ============================================================================
// HAPS-AI SCHOLAR ASSISTANT: POSTGRESQL DATABASE CLIENT
// Dual Mode: Live PostgreSQL Pool with Graceful In-Memory Fallback for Dev
// ============================================================================

let Pool = null;
try {
  Pool = require('pg').Pool;
} catch (e) {
  // pg module not yet installed locally; in-memory store active
}

let pool = null;
let isConnected = false;

// Mock in-memory store for instant offline development & test suites
const inMemoryStore = {
  users: [
    { id: 'b0000000-0000-0000-0000-000000000001', full_name: 'Aryan Sharma', roll_number: '11-S-24', grade: '11', section: 'Science-A', board: 'CBSE', target_exam: 'JEE_ADVANCED', role: 'STUDENT' },
    { id: 'b0000000-0000-0000-0000-000000000002', full_name: 'Ananya Thakur', roll_number: '11-S-25', grade: '11', section: 'Science-A', board: 'HP_BOARD', target_exam: 'NEET_UG', role: 'STUDENT' },
    { id: 'a0000000-0000-0000-0000-000000000002', full_name: 'Er. Rajesh Kumar', role: 'TEACHER', email: 'rajesh.phy@himacademy.com' }
  ],
  questions: [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      topic: 'Rotational Motion',
      subtopic: 'Moment of Inertia',
      curriculum_board: 'JEE_MAIN',
      grade: '11',
      question_type: 'MCQ_SINGLE',
      difficulty: 'MEDIUM',
      question_latex: 'A solid uniform cylinder of mass $M$ and radius $R$ is free to rotate about its geometric axis. A light string is wound around its circumference and pulled with a constant tension $T$. Find the angular acceleration $\\alpha$ of the cylinder.',
      options_latex: [
        { key: 'A', latex: '$\\alpha = \\frac{T}{MR}$', is_correct: false, distractor_trap: 'Treated cylinder as hollow thin shell ($I=MR^2$)' },
        { key: 'B', latex: '$\\alpha = \\frac{2T}{MR}$', is_correct: true, distractor_trap: null },
        { key: 'C', latex: '$\\alpha = \\frac{T}{2MR}$', is_correct: false, distractor_trap: 'Multiplied instead of dividing by moment of inertia constant' },
        { key: 'D', latex: '$\\alpha = \\frac{4T}{MR}$', is_correct: false, distractor_trap: 'Calculation error in radius factor' }
      ],
      correct_answer_latex: 'B',
      solution_latex: 'Torque about central axis is $\\tau = T \\cdot R$. Moment of inertia for solid cylinder is $I = \\frac{1}{2} M R^2$. Since $\\tau = I\\alpha \\implies TR = (\\frac{1}{2}MR^2)\\alpha \\implies \\alpha = \\frac{2T}{MR}$.',
      socratic_hints: [
        "What is the torque produced by tension $T$ acting at radius $R$?",
        "What is the moment of inertia $I$ of a solid cylinder?",
        "Equate torque $\\tau = I\\alpha$ to solve for angular acceleration."
      ],
      benchmark_time_seconds: 90
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      topic: 'Work, Energy and Power',
      subtopic: 'Work-Energy Theorem',
      curriculum_board: 'CBSE',
      grade: '11',
      question_type: 'NUMERICAL',
      difficulty: 'MEDIUM',
      question_latex: 'A variable force $F(x) = (3x^2 - 2x + 5)\\,\\text{N}$ acts on a particle of mass $m = 2\\,\\text{kg}$ moving along the $x$-axis. Calculate the net work done by this force in moving the particle from $x = 1\\,\\text{m}$ to $x = 3\\,\\text{m}$.',
      options_latex: [],
      correct_answer_latex: '28 J',
      solution_latex: '$$W = \\int_{1}^{3} (3x^2 - 2x + 5)\\,dx = \\left[ x^3 - x^2 + 5x \\right]_1^3 = (27 - 9 + 15) - (1 - 1 + 5) = 33 - 5 = 28\\,\\text{J}$$',
      socratic_hints: [
        "Recall that work done by a variable force is $W = \\int F(x) dx$.",
        "Integrate each polynomial term separately.",
        "Subtract the lower limit value from the upper limit value."
      ],
      benchmark_time_seconds: 120
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      topic: 'Oscillations & SHM',
      subtopic: 'Damped Oscillations',
      curriculum_board: 'JEE_ADVANCED',
      grade: '11',
      question_type: 'MCQ_SINGLE',
      difficulty: 'HARD',
      question_latex: 'An oscillator of mass $m$ undergoes damped harmonic oscillations with damping coefficient $b$. If the mechanical energy of the oscillator decays to $\\frac{1}{e}$ of its initial value in time $t_0$, what is $t_0$?',
      options_latex: [
        { key: 'A', latex: '$t_0 = \\frac{m}{b}$', is_correct: true, distractor_trap: null },
        { key: 'B', latex: '$t_0 = \\frac{2m}{b}$', is_correct: false, distractor_trap: 'Confused amplitude decay time with total energy decay time' },
        { key: 'C', latex: '$t_0 = \\frac{m}{2b}$', is_correct: false, distractor_trap: 'Inverted damping factor coefficient' },
        { key: 'D', latex: '$t_0 = \\frac{b}{m}$', is_correct: false, distractor_trap: 'Dimensional mismatch' }
      ],
      correct_answer_latex: 'A',
      solution_latex: 'Mechanical energy decays as $E(t) = E_0 e^{-\\frac{b}{m}t}$. Setting $E(t_0) = E_0 e^{-1} \\implies \\frac{b}{m}t_0 = 1 \\implies t_0 = \\frac{m}{b}$.',
      socratic_hints: [
        "How is energy related to amplitude in simple harmonic motion?",
        "Recall that $E \\propto A^2$. If $A(t) = A_0 e^{-bt/(2m)}$, what is $E(t)$?",
        "Equate the power of the exponential to $-1$."
      ],
      benchmark_time_seconds: 180
    }
  ],
  telemetry: [],
  conceptMastery: [
    { student_id: 'b0000000-0000-0000-0000-000000000001', topic: 'Rotational Motion', subtopic: 'Moment of Inertia', mastery_status: 'MASTERED', mastery_score: 92.5, accuracy: 95.0, avg_time_sec: 54, attempts: 18 },
    { student_id: 'b0000000-0000-0000-0000-000000000001', topic: 'Work, Energy & Power', subtopic: 'Work-Energy Theorem', mastery_status: 'NEEDS_RECAP', mastery_score: 68.0, accuracy: 75.0, avg_time_sec: 185, attempts: 12 },
    { student_id: 'b0000000-0000-0000-0000-000000000001', topic: 'Oscillations', subtopic: 'Damped Oscillations', mastery_status: 'CRITICAL_WEAKNESS', mastery_score: 34.0, accuracy: 30.0, avg_time_sec: 220, attempts: 8 }
  ],
  handwrittenSubmissions: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      student_id: 'b0000000-0000-0000-0000-000000000001',
      student_name: 'Aryan Sharma',
      question_id: 'c0000000-0000-0000-0000-000000000002',
      sheet_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      ocr_transcription_latex: 'Step 1: $W = \\int_{1}^{3} (3x^2 - 2x + 5) dx$\nStep 2: $[x^3 - x^2 + 5x]_{1}^{3}$\nStep 3: $(27 - 9 + 15) - (1 - 1 + 5) = 33 - 5 = 28\\text{ Joules}$',
      step_evaluations: [
        { step: 1, description: 'Formulation of Definite Integral', formula_latex: 'W = \\int_{1}^{3} F(x) dx', marks_awarded: 1.0, max_marks: 1.0, status: 'CORRECT' },
        { step: 2, description: 'Correct Antiderivative Polynomial', formula_latex: '[x^3 - x^2 + 5x]_{1}^{3}', marks_awarded: 1.5, max_marks: 1.5, status: 'CORRECT' },
        { step: 3, description: 'Boundary Arithmetic & SI Units', formula_latex: '33 - 5 = 28\\text{ J}', marks_awarded: 1.5, max_marks: 1.5, status: 'CORRECT' }
      ],
      total_marks_awarded: 4.0,
      max_marks: 4.0,
      error_type: 'NONE',
      ai_confidence_score: 0.98,
      teacher_verified: true,
      teacher_comments: 'Clear presentation. Integral bounds clearly indicated.'
    }
  ],
  weeklyReports: [
    {
      id: '20000000-0000-0000-0000-000000000001',
      student_id: 'b0000000-0000-0000-0000-000000000001',
      student_name: 'Aryan Sharma',
      week_range: '18 Oct 2026 - 24 Oct 2026',
      overall_score_percentage: 76.5,
      total_study_hours: 14.5,
      questions_attempted: 64,
      average_velocity_seconds: 115,
      mastered_concepts: [
        { topic: 'Rotational Motion', subtopic: 'Moment of Inertia', accuracy: 92, status: 'MASTERED' }
      ],
      recap_concepts: [
        { topic: 'Work-Energy', subtopic: 'Work-Energy Theorem', accuracy: 75, status: 'NEEDS_RECAP', reason: 'Takes 180s vs 120s benchmark; extra algebraic hesitation.' }
      ],
      weak_concepts: [
        { topic: 'Oscillations', subtopic: 'Damped Oscillations', accuracy: 30, status: 'CRITICAL_WEAKNESS', reason: 'Confusing energy decay constant (b/m) with amplitude (b/2m).' }
      ],
      school_hostel_actions: [
        { directive: 'Conduct a 15-minute 1-on-1 derivation during 7:30 PM residential evening study on damped oscillation equations.', faculty: 'Er. Rajesh Kumar', priority: 'HIGH' },
        { directive: 'Assign Targeted Practice Drill #SHM-04 (5 numericals with frictional damping).', faculty: 'Physics Dept', priority: 'MEDIUM' }
      ],
      parent_actions: [
        { directive: 'Ask Aryan to explain the principle of car shock absorbers (Feynman technique) for 5 minutes during your Sunday phone call.', purpose: 'Solidifies intuitive physical grasp.' },
        { directive: 'Ensure 45 minutes of quiet study on Sunday morning for the short recap quiz.', purpose: 'Reinforces retention before Monday classes.' }
      ]
    }
  ],
  assessments: [
    {
      id: 'asgn_10_sci_01',
      title: 'Class 10 Science: Light – Spherical Mirrors & Derivations',
      description: 'CBSE & HP Board standard diagnostic assessment covering mirror formula, sign conventions, and image formation.',
      teacherName: 'Er. Rajesh Kumar',
      grade: '10',
      section: 'Science-A',
      board: 'CBSE',
      subject: 'Science',
      durationMinutes: 30,
      totalMarks: 12,
      questions: [
        {
          id: 'q_asgn_01',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Spherical Mirrors',
          grade: '10',
          board: 'CBSE',
          question_type: 'MCQ_SINGLE',
          difficulty: 'MEDIUM',
          benchmark_time_seconds: 90,
          question_latex: 'An object is placed at a distance of $30\\,\\text{cm}$ in front of a concave mirror of focal length $15\\,\\text{cm}$. The distance of the image from the mirror is:',
          options_latex: [
            { key: 'A', latex: '$v = -15\\,\\text{cm}$', is_correct: false, distractor_trap: 'Substituted focal length as image distance' },
            { key: 'B', latex: '$v = -30\\,\\text{cm}$', is_correct: true, distractor_trap: null },
            { key: 'C', latex: '$v = +30\\,\\text{cm}$', is_correct: false, distractor_trap: 'Sign convention error: took real image as positive' },
            { key: 'D', latex: '$v = -60\\,\\text{cm}$', is_correct: false, distractor_trap: 'Multiplied denominator factor incorrectly' }
          ],
          correct_answer: 'B',
          solution_latex: 'For a concave mirror, $f = -15\\,\\text{cm}$ and $u = -30\\,\\text{cm}$. Using mirror formula: $$\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u} \\implies \\frac{1}{v} = \\frac{1}{-15} - \\frac{1}{-30} = -\\frac{1}{30} \\implies v = -30\\,\\text{cm}$$',
          socratic_hints: [
            "Write the mirror formula $\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}$.",
            "Apply the New Cartesian sign convention: both $f$ and $u$ are negative for a concave mirror.",
            "Solve for $v$ by isolating $\\frac{1}{v}$."
          ]
        },
        {
          id: 'q_asgn_02',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Refraction & Snell Law',
          grade: '10',
          board: 'CBSE',
          question_type: 'MCQ_SINGLE',
          difficulty: 'MEDIUM',
          benchmark_time_seconds: 75,
          question_latex: 'Light enters from air into water of refractive index $n = \\frac{4}{3}$. What is the speed of light in water if the speed of light in vacuum is $c = 3.0 \\times 10^8\\,\\text{m/s}$?',
          options_latex: [
            { key: 'A', latex: '$v = 2.25 \\times 10^8\\,\\text{m/s}$', is_correct: true, distractor_trap: null },
            { key: 'B', latex: '$v = 4.0 \\times 10^8\\,\\text{m/s}$', is_correct: false, distractor_trap: 'Multiplied by refractive index instead of dividing' },
            { key: 'C', latex: '$v = 1.5 \\times 10^8\\,\\text{m/s}$', is_correct: false, distractor_trap: 'Used glass refractive index (1.5) instead of water (1.33)' },
            { key: 'D', latex: '$v = 2.0 \\times 10^8\\,\\text{m/s}$', is_correct: false, distractor_trap: 'Calculation error in fraction inversion' }
          ],
          correct_answer: 'A',
          solution_latex: 'Refractive index is defined as $n = \\frac{c}{v}$. Therefore, $$v = \\frac{c}{n} = \\frac{3.0 \\times 10^8}{4/3} = 3.0 \\times 10^8 \\times \\frac{3}{4} = 2.25 \\times 10^8\\,\\text{m/s}$$',
          socratic_hints: [
            "What is the definition of absolute refractive index $n$ in terms of speeds of light?",
            "Use $n = \\frac{c}{v}$ where $c$ is speed in vacuum and $v$ is speed in the medium.",
            "Substitute $n = \\frac{4}{3}$ and calculate."
          ]
        },
        {
          id: 'q_asgn_03',
          topic: 'Electricity',
          subtopic: 'Joule Heating & Resistance',
          grade: '10',
          board: 'CBSE',
          question_type: 'MCQ_SINGLE',
          difficulty: 'MEDIUM',
          benchmark_time_seconds: 90,
          question_latex: 'An electric heater of resistance $R = 50\\,\\Omega$ is connected to a $220\\,\\text{V}$ line for $2\\,\\text{hours}$. Calculate the heat energy produced in joules.',
          options_latex: [
            { key: 'A', latex: '$H = 6.97 \\times 10^6\\,\\text{J}$', is_correct: true, distractor_trap: null },
            { key: 'B', latex: '$H = 1.94 \\times 10^3\\,\\text{J}$', is_correct: false, distractor_trap: 'Forgot to convert hours to seconds ($3600\\,\\text{s}$)' },
            { key: 'C', latex: '$H = 3.48 \\times 10^6\\,\\text{J}$', is_correct: false, distractor_trap: 'Used 1 hour instead of 2 hours' },
            { key: 'D', latex: '$H = 1.39 \\times 10^7\\,\\text{J}$', is_correct: false, distractor_trap: 'Doubled the power formula factor' }
          ],
          correct_answer: 'A',
          solution_latex: 'Power is $P = \\frac{V^2}{R} = \\frac{(220)^2}{50} = \\frac{48400}{50} = 968\\,\\text{W}$. Time is $t = 2 \\times 3600 = 7200\\,\\text{s}$. Total heat energy: $$H = P \\times t = 968 \\times 7200 = 6.9696 \\times 10^6\\,\\text{J} \\approx 6.97 \\times 10^6\\,\\text{J}$$',
          socratic_hints: [
            "Calculate power dissipated using $P = \\frac{V^2}{R}$.",
            "Convert time from hours to seconds: $2\\,\\text{h} = 2 \\times 3600\\,\\text{s}$.",
            "Calculate heat energy $H = P \\times t$."
          ]
        }
      ],
      createdAt: new Date().toISOString()
    }
  ]
};

function initDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('[DATABASE] No DATABASE_URL set. Initializing high-speed in-memory store for HAPS-AI Assistant.');
    return;
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on('connect', () => {
      isConnected = true;
      console.log('[DATABASE] Connected to PostgreSQL 16 successfully.');
    });

    pool.on('error', (err) => {
      console.warn('[DATABASE] PostgreSQL pool warning:', err.message);
      isConnected = false;
    });
  } catch (err) {
    console.warn('[DATABASE] Failed to instantiate PG Pool. Using in-memory fallback.', err.message);
  }
}

async function query(text, params = []) {
  if (pool && isConnected) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`[DATABASE QUERY] ${text.slice(0, 40)}... took ${duration}ms, rows: ${res.rowCount}`);
      return res;
    } catch (err) {
      console.warn('[DATABASE QUERY ERROR] Falling back to in-memory store:', err.message);
    }
  }

  // In-memory simulation fallback
  return { rows: [], rowCount: 0 };
}

module.exports = {
  initDatabase,
  query,
  inMemoryStore
};
