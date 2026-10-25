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
    { id: 'b0000000-0000-0000-0000-000000000001', full_name: 'Aryan Sharma', roll_number: '11-S-24', grade: '10', section: 'Science-A', board: 'CBSE', target_exam: 'JEE_ADVANCED', role: 'STUDENT' },
    { id: 'b0000000-0000-0000-0000-000000000002', full_name: 'Ananya Thakur', roll_number: '11-S-25', grade: '10', section: 'Science-A', board: 'HP_BOARD', target_exam: 'NEET_UG', role: 'STUDENT' },
    { id: 'b0000000-0000-0000-0000-000000000003', full_name: 'Rohit Verma', roll_number: '11-S-26', grade: '10', section: 'Science-A', board: 'CBSE', target_exam: 'JEE_MAIN', role: 'STUDENT' },
    { id: 'b0000000-0000-0000-0000-000000000004', full_name: 'Simran Kaur', roll_number: '11-S-27', grade: '10', section: 'Science-A', board: 'HP_BOARD', target_exam: 'NEET_UG', role: 'STUDENT' },
    { id: 'b0000000-0000-0000-0000-000000000005', full_name: 'Aditya Chauhan', roll_number: '11-S-28', grade: '10', section: 'Science-A', board: 'CBSE', target_exam: 'JEE_MAIN', role: 'STUDENT' },
    { id: 'b0000000-0000-0000-0000-000000000006', full_name: 'Mehak Sharma', roll_number: '11-S-29', grade: '10', section: 'Science-A', board: 'CBSE', target_exam: 'NEET_UG', role: 'STUDENT' },
    { id: 'a0000000-0000-0000-0000-000000000002', full_name: 'Er. Rajesh Kumar', role: 'TEACHER', email: 'rajesh.phy@himacademy.com' }
  ],
  // Subject-Wise Specialized Question Banks for:
  // - Class 10 Foundation (Maths, Science)
  // - Class 11 & 12 Non-Medical (Physics, Chemistry, Maths -> JEE Main / Adv / Boards)
  // - Class 11 & 12 Medical (Physics, Chemistry, Biology -> NEET / Boards)
  subjectBanks: {
    class10_maths: [
      {
        id: 'c10_m_01',
        grade: '10',
        stream: 'FOUNDATION',
        subject: 'Mathematics',
        chapter_number: 4,
        chapter_name: 'Quadratic Equations',
        topic: 'Roots of Quadratic Equations',
        subtopic: 'Discriminant & Nature of Roots',
        curriculum_board: 'CBSE_CLASS_10',
        pyq_appearance: 'CBSE Class 10 Board 2024 (Set 30/1/1) & HPBOSE 2022',
        difficulty: 'MEDIUM',
        question_format: 'MCQ_SINGLE',
        benchmark_time_seconds: 90,
        marks_weightage: 1,
        question_latex: 'If the quadratic equation $2x^2 - kx + 3 = 0$ has two equal real roots, what is the value of $k$?',
        options_latex: [
          { key: 'A', latex: '$k = \\pm 2\\sqrt{6}$', is_correct: true, distractor_trap: null },
          { key: 'B', latex: '$k = \\pm 6$', is_correct: false, distractor_trap: 'Forgot square root over 24' },
          { key: 'C', latex: '$k = \\pm 4\\sqrt{3}$', is_correct: false, distractor_trap: 'Factored 24 incorrectly as $16 \\times 3$' },
          { key: 'D', latex: '$k = 24$', is_correct: false, distractor_trap: 'Did not solve for $k = \\sqrt{D}$' }
        ],
        correct_answer_latex: 'A',
        solution_latex: 'For equal real roots, the discriminant $D = b^2 - 4ac = 0$. Here $a = 2, b = -k, c = 3$. Hence $(-k)^2 - 4(2)(3) = 0 \\implies k^2 = 24 \\implies k = \\pm \\sqrt{24} = \\pm 2\\sqrt{6}$.',
        socratic_hints: [
          "What is the condition on discriminant $D = b^2 - 4ac$ for equal roots?",
          "Identify $a, b, c$ from $2x^2 - kx + 3 = 0$.",
          "Set $b^2 - 4ac = 0$ and solve for $k$."
        ]
      },
      {
        id: 'c10_m_02',
        grade: '10',
        stream: 'FOUNDATION',
        subject: 'Mathematics',
        chapter_number: 8,
        chapter_name: 'Introduction to Trigonometry',
        topic: 'Trigonometric Identities',
        subtopic: 'Pythagorean Identities',
        curriculum_board: 'CBSE_CLASS_10',
        pyq_appearance: 'CBSE 2023 Standard Set-2',
        difficulty: 'MEDIUM',
        question_format: 'SHORT_ANSWER',
        benchmark_time_seconds: 120,
        marks_weightage: 3,
        question_latex: 'Prove that: $$\\frac{\\sin\\theta - 2\\sin^3\\theta}{2\\cos^3\\theta - \\cos\\theta} = \\tan\\theta$$',
        options_latex: [],
        correct_answer_latex: '\\tan\\theta',
        solution_latex: '$$\\text{LHS} = \\frac{\\sin\\theta(1 - 2\\sin^2\\theta)}{\\cos\\theta(2\\cos^2\\theta - 1)}$$. Since $\\sin^2\\theta = 1 - \\cos^2\\theta$, numerator bracket is $1 - 2(1 - \\cos^2\\theta) = 2\\cos^2\\theta - 1$. Hence $\\frac{\\sin\\theta(2\\cos^2\\theta - 1)}{\\cos\\theta(2\\cos^2\\theta - 1)} = \\frac{\\sin\\theta}{\\cos\\theta} = \\tan\\theta = \\text{RHS}$.',
        step_rubric: [
          { step: 1, description: 'Factoring out $\\sin\\theta$ from numerator and $\\cos\\theta$ from denominator', marks: 1.0 },
          { step: 2, description: 'Substituting $\\sin^2\\theta = 1 - \\cos^2\\theta$ in numerator bracket', marks: 1.0 },
          { step: 3, description: 'Canceling common factor $(2\\cos^2\\theta - 1)$ to obtain $\\tan\\theta$', marks: 1.0 }
        ]
      }
    ],
    class10_science: [
      {
        id: 'c10_s_01',
        grade: '10',
        stream: 'FOUNDATION',
        subject: 'Science',
        discipline: 'PHYSICS',
        chapter_number: 10,
        chapter_name: 'Light – Reflection and Refraction',
        topic: 'Spherical Mirrors',
        subtopic: 'Mirror Formula & Magnification',
        curriculum_board: 'CBSE_CLASS_10',
        pyq_appearance: 'CBSE 2024 & HPBOSE 2023',
        difficulty: 'MEDIUM',
        question_format: 'MCQ_SINGLE',
        benchmark_time_seconds: 90,
        marks_weightage: 1,
        question_latex: 'A concave mirror has a focal length of $15\\,\\text{cm}$. If an object is placed at $30\\,\\text{cm}$ in front of the mirror, the image is formed at:',
        options_latex: [
          { key: 'A', latex: '$-30\\,\\text{cm}$ in front of the mirror', is_correct: true, distractor_trap: null },
          { key: 'B', latex: '$+30\\,\\text{cm}$ behind the mirror', is_correct: false, distractor_trap: 'Failed to apply Cartesian sign convention' },
          { key: 'C', latex: '$-15\\,\\text{cm}$ at the focus', is_correct: false, distractor_trap: 'Confused center of curvature with focus' },
          { key: 'D', latex: 'Infinity', is_correct: false, distractor_trap: 'Assumed object was at the focus' }
        ],
        correct_answer_latex: 'A',
        solution_latex: 'Object is at $u = -30\\,\\text{cm} = 2f$. When an object is at the Center of Curvature $C$, a real and inverted image of the same size is formed at $C$, so $v = -30\\,\\text{cm}$.',
        socratic_hints: ["Calculate $2f$ for $f = 15\\,\\text{cm}$.", "What is the image position when object is at $C$ ($u = 2f$)?"]
      }
    ],
    senior_physics: [
      {
        id: 'snr_p_01',
        grade: '11',
        stream: 'COMMON_SENIOR',
        target_exam: 'JEE_MAIN',
        subject: 'Physics',
        chapter_number: 7,
        chapter_name: 'System of Particles and Rotational Motion',
        topic: 'Moment of Inertia & Torque',
        subtopic: 'Rolling Without Slipping',
        curriculum_board: 'JEE_MAIN',
        pyq_appearance: 'JEE Main 2024 (27 Jan Shift-1) & HPBOSE 2023',
        difficulty: 'HARD',
        question_format: 'MCQ_SINGLE',
        benchmark_time_seconds: 120,
        marks_weightage: 4,
        question_latex: 'A solid sphere of mass $M$ and radius $R$ rolls without slipping down an inclined plane of inclination $\\theta$. Find the linear acceleration $a$ of the center of mass.',
        options_latex: [
          { key: 'A', latex: '$a = \\frac{5}{7} g \\sin\\theta$', is_correct: true, distractor_trap: null },
          { key: 'B', latex: '$a = \\frac{2}{3} g \\sin\\theta$', is_correct: false, distractor_trap: 'Treated sphere as hollow sphere ($I = \\frac{2}{3}MR^2$)' },
          { key: 'C', latex: '$a = \\frac{1}{2} g \\sin\\theta$', is_correct: false, distractor_trap: 'Treated sphere as disc ($I = \\frac{1}{2}MR^2$)' },
          { key: 'D', latex: '$a = g \\sin\\theta$', is_correct: false, distractor_trap: 'Ignored rotational kinetic energy / friction torque' }
        ],
        correct_answer_latex: 'A',
        solution_latex: 'For pure rolling down an incline, acceleration $a = \\frac{g\\sin\\theta}{1 + \\frac{I}{MR^2}}$. For a solid sphere, $I = \\frac{2}{5}MR^2$. Therefore, $$a = \\frac{g\\sin\\theta}{1 + 2/5} = \\frac{5}{7}g\\sin\\theta$$.',
        socratic_hints: [
          "Recall the standard formula for linear acceleration in rolling without slipping: $a = \\frac{g\\sin\\theta}{1 + I/(MR^2)}$.",
          "What is the moment of inertia $I$ of a solid uniform sphere about its diameter?",
          "Substitute $I = \\frac{2}{5}MR^2$ and simplify the fraction."
        ]
      }
    ],
    senior_chemistry: [
      {
        id: 'snr_c_01',
        grade: '12',
        stream: 'COMMON_SENIOR',
        target_exam: 'NEET_UG',
        subject: 'Chemistry',
        branch: 'PHYSICAL',
        chapter_number: 3,
        chapter_name: 'Electrochemistry',
        topic: 'Nernst Equation',
        subtopic: 'Cell Potential & Equilibrium Constant',
        curriculum_board: 'NEET_UG',
        pyq_appearance: 'NEET 2023 & CBSE 2022',
        difficulty: 'MEDIUM',
        question_format: 'MCQ_SINGLE',
        benchmark_time_seconds: 75,
        marks_weightage: 4,
        question_latex: 'For the cell reaction $\\text{Zn}(s) + \\text{Cu}^{2+}(aq) \\rightleftharpoons \\text{Zn}^{2+}(aq) + \\text{Cu}(s)$, the standard cell potential $E^\\circ_{\\text{cell}}$ is $1.10\\,\\text{V}$. What is $\\Delta G^\\circ$ for the reaction? (Take $F = 96500\\,\\text{C/mol}$)',
        options_latex: [
          { key: 'A', latex: '$-212.3\\,\\text{kJ/mol}$', is_correct: true, distractor_trap: null },
          { key: 'B', latex: '$+212.3\\,\\text{kJ/mol}$', is_correct: false, distractor_trap: 'Forgot negative sign in $\\Delta G^\\circ = -nFE^\\circ$' },
          { key: 'C', latex: '$-106.15\\,\\text{kJ/mol}$', is_correct: false, distractor_trap: 'Used $n = 1$ instead of $n = 2$ electrons transferred' },
          { key: 'D', latex: '$-424.6\\,\\text{kJ/mol}$', is_correct: false, distractor_trap: 'Multiplied by 4 instead of 2' }
        ],
        correct_answer_latex: 'A',
        solution_latex: '$$\\Delta G^\\circ = -nFE^\\circ_{\\text{cell}}$$. Here $n = 2$ electrons. $\\Delta G^\\circ = -2 \\times 96500 \\times 1.10 = -212300\\,\\text{J/mol} = -212.3\\,\\text{kJ/mol}$.',
        socratic_hints: ["How many electrons are transferred in $\\text{Zn} \\to \\text{Zn}^{2+}$?", "Recall the thermodynamic relation $\\Delta G^\\circ = -nFE^\\circ$."]
      }
    ],
    senior_mathematics: [
      {
        id: 'snr_m_01',
        grade: '12',
        stream: 'NON_MEDICAL',
        target_exam: 'JEE_MAIN',
        subject: 'Mathematics',
        math_branch: 'CALCULUS',
        chapter_number: 7,
        chapter_name: 'Integrals',
        topic: 'Definite Integrals',
        subtopic: 'King Property of Definite Integrals',
        curriculum_board: 'JEE_MAIN',
        pyq_appearance: 'JEE Main 2024 (Shift-1)',
        difficulty: 'HARD',
        question_format: 'NUMERICAL_INTEGER',
        benchmark_time_seconds: 150,
        marks_weightage: 4,
        question_latex: 'Evaluate the definite integral $I = \\int_{0}^{\\pi/2} \\frac{\\sin^{2026} x}{\\sin^{2026} x + \\cos^{2026} x}\\,dx$. If $I = \\frac{\\pi}{k}$, what is the integer value of $k$?',
        options_latex: [],
        correct_answer_latex: '4',
        solution_latex: 'Applying the King property $\\int_a^b f(x) dx = \\int_a^b f(a+b-x) dx$: $$I = \\int_0^{\\pi/2} \\frac{\\cos^{2026} x}{\\cos^{2026} x + \\sin^{2026} x} dx$$. Adding the two expressions: $$2I = \\int_0^{\\pi/2} 1\\,dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$$. Therefore, $k = 4$.',
        socratic_hints: [
          "Apply the identity $\\int_0^a f(x)dx = \\int_0^a f(a-x)dx$.",
          "What is $\\sin(\\frac{\\pi}{2} - x)$ and $\\cos(\\frac{\\pi}{2} - x)$?",
          "Add the original integral and transformed integral."
        ]
      },
      {
        id: 'snr_m_02',
        grade: '12',
        stream: 'NON_MEDICAL',
        target_exam: 'CBSE_CLASS_12',
        subject: 'Mathematics',
        math_branch: 'ALGEBRA',
        chapter_number: 4,
        chapter_name: 'Determinants',
        topic: 'Applications of Determinants & Matrices',
        subtopic: 'Solving linear systems by Matrix Method: AX = B ⇒ X = A⁻¹B',
        curriculum_board: 'CBSE_BOARD',
        pyq_appearance: 'CBSE Class 12 Board 2023 & 2020 (5-Mark Guaranteed)',
        difficulty: 'HARD',
        question_format: 'SUBJECTIVE_LONG',
        benchmark_time_seconds: 360,
        marks_weightage: 5,
        question_latex: 'Solve the following system of linear equations using the matrix inversion method: $$2x + 3y + 3z = 5$$ $$x - 2y + z = -4$$ $$3x - y - 2z = 3$$',
        options_latex: [],
        correct_answer_latex: '$x = 1, y = 2, z = -1$',
        solution_latex: 'Write in matrix form $AX = B$ where $A = \\begin{bmatrix} 2 & 3 & 3 \\\\ 1 & -2 & 1 \\\\ 3 & -1 & -2 \\end{bmatrix}$, $X = \\begin{bmatrix} x \\\\ y \\\\ z \\end{bmatrix}$, $B = \\begin{bmatrix} 5 \\\\ -4 \\\\ 3 \\end{bmatrix}$. First, compute $|A| = 2(4+1) - 3(-2-3) + 3(-1+6) = 10 + 15 + 15 = 40 \\neq 0$. Next, calculate cofactors to obtain $\\text{adj}(A) = \\begin{bmatrix} 5 & 3 & 9 \\\\ 5 & -13 & 1 \\\\ 5 & 11 & -7 \\end{bmatrix}$. Finally, $X = A^{-1}B = \\frac{1}{40}\\text{adj}(A)B = \\begin{bmatrix} 1 \\\\ 2 \\\\ -1 \\end{bmatrix}$. Hence, $x = 1, y = 2, z = -1$.',
        socratic_hints: [
          "Express the system in the matrix form $AX = B$.",
          "Calculate the determinant $|A|$ to verify that the matrix is non-singular.",
          "Find the adjoint matrix by computing cofactors and transposing.",
          "Multiply $A^{-1} = \\frac{1}{|A|}\\text{adj}(A)$ with $B$ to obtain $X$."
        ]
      },
      {
        id: 'snr_m_03',
        grade: '12',
        stream: 'NON_MEDICAL',
        target_exam: 'CBSE_CLASS_12',
        subject: 'Mathematics',
        math_branch: 'VECTORS_3D',
        chapter_number: 11,
        chapter_name: 'Three-Dimensional Geometry (3D)',
        topic: 'Shortest Distance Between Lines',
        subtopic: 'Skew lines definition and shortest distance',
        curriculum_board: 'CBSE_BOARD',
        pyq_appearance: 'CBSE Class 12 Board 2024 & 2022 (5-Mark Guaranteed)',
        difficulty: 'HARD',
        question_format: 'SUBJECTIVE_LONG',
        benchmark_time_seconds: 300,
        marks_weightage: 5,
        question_latex: 'Find the shortest distance between the skew lines: $$\\vec{r} = (\\hat{i} + 2\\hat{j} + 3\\hat{k}) + \\lambda(\\hat{i} - 3\\hat{j} + 2\\hat{k})$$ $$\\vec{r} = (4\\hat{i} + 5\\hat{j} + 6\\hat{k}) + \\mu(2\\hat{i} + 3\\hat{j} + \\hat{k})$$',
        options_latex: [],
        correct_answer_latex: '$d = \\frac{3\\sqrt{19}}{sqrt{19}} = \\frac{3}{\\sqrt{19}} \\text{ or } \\frac{3\\sqrt{19}}{19}$ units',
        solution_latex: 'Identify points and direction vectors: $\\vec{a}_1 = \\hat{i}+2\\hat{j}+3\\hat{k}$, $\\vec{b}_1 = \\hat{i}-3\\hat{j}+2\\hat{k}$; $\\vec{a}_2 = 4\\hat{i}+5\\hat{j}+6\\hat{k}$, $\\vec{b}_2 = 2\\hat{i}+3\\hat{j}+\\hat{k}$. Then $\\vec{a}_2 - \\vec{a}_1 = 3\\hat{i}+3\\hat{j}+3\\hat{k}$. Vector cross product: $\\vec{b}_1 \\times \\vec{b}_2 = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ 1 & -3 & 2 \\\\ 2 & 3 & 1 \\end{vmatrix} = -9\\hat{i} + 3\\hat{j} + 9\\hat{k}$. Its magnitude is $|\\vec{b}_1 \\times \\vec{b}_2| = \\sqrt{(-9)^2 + 3^2 + 9^2} = \\sqrt{171} = 3\\sqrt{19}$. Scalar triple product $(\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 \\times \\vec{b}_2) = 3(-9) + 3(3) + 3(9) = -27 + 9 + 27 = 9$. Shortest distance $d = \\left|\\frac{9}{3\\sqrt{19}}\\right| = \\frac{3}{\\sqrt{19}}$ units.',
        socratic_hints: [
          "Identify $\\vec{a}_1, \\vec{b}_1$ from the first line and $\\vec{a}_2, \\vec{b}_2$ from the second line.",
          "Compute $\\vec{a}_2 - \\vec{a}_1$ and $\\vec{b}_1 \\times \\vec{b}_2$.",
          "Apply the formula $d = \\left|\\frac{(\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 \\times \\vec{b}_2)}{|\\vec{b}_1 \\times \\vec{b}_2|}\\right|$."
        ]
      },
      {
        id: 'snr_m_04',
        grade: '12',
        stream: 'NON_MEDICAL',
        target_exam: 'CBSE_CLASS_12',
        subject: 'Mathematics',
        math_branch: 'LINEAR_PROGRAMMING',
        chapter_number: 12,
        chapter_name: 'Linear Programming (LPP)',
        topic: 'Corner Point Method',
        subtopic: 'Bounded region: Evaluating Z at all corner points for max/min',
        curriculum_board: 'CBSE_BOARD',
        pyq_appearance: 'CBSE Class 12 Board 2023 (5-Mark Guaranteed)',
        difficulty: 'MEDIUM',
        question_format: 'SUBJECTIVE_LONG',
        benchmark_time_seconds: 240,
        marks_weightage: 5,
        question_latex: 'Solve the following linear programming problem graphically: Maximize $Z = 4x + y$ subject to the constraints: $$x + y \\leq 50$$ $$3x + y \\leq 90$$ $$x \\geq 0, y \\geq 0$$',
        options_latex: [],
        correct_answer_latex: 'Maximum $Z = 120$ at $(30, 0)$',
        solution_latex: '1. Plot boundary lines $x + y = 50$ (intercepts $(50,0), (0,50)$) and $3x + y = 90$ (intercepts $(30,0), (0,90)$). 2. Testing $(0,0)$ confirms origin lies in both half-planes. 3. Find intersection of boundary lines: $(3x+y) - (x+y) = 90 - 50 \\implies 2x = 40 \\implies x = 20, y = 30$. 4. Feasible corner points are $O(0, 0)$, $A(30, 0)$, $B(20, 30)$, $C(0, 50)$. 5. Evaluate $Z$: $Z(0,0)=0$, $Z(30,0)=4(30)+0=120$, $Z(20,30)=4(20)+30=110$, $Z(0,50)=0+50=50$. Hence, Maximum $Z = 120$ occurs at $(30, 0)$.',
        socratic_hints: [
          "Convert inequalities to equations and find the $x$ and $y$ intercepts.",
          "Shade the region towards the origin since $(0,0)$ satisfies both inequalities.",
          "Find the intersection coordinates of $x + y = 50$ and $3x + y = 90$.",
          "Evaluate $Z$ at each vertex of the polygon."
        ]
      },
      {
        id: 'snr_m_05',
        grade: '12',
        stream: 'NON_MEDICAL',
        target_exam: 'CBSE_CLASS_12',
        subject: 'Mathematics',
        math_branch: 'CALCULUS',
        chapter_number: 6,
        chapter_name: 'Applications of Derivatives (AOD)',
        topic: 'Maxima and Minima',
        subtopic: 'Applied geometric optimization word problems',
        curriculum_board: 'CBSE_BOARD',
        pyq_appearance: 'CBSE Class 12 Board 2023 & 2019 (5-Mark / Case-Study)',
        difficulty: 'HARD',
        question_format: 'SUBJECTIVE_LONG',
        benchmark_time_seconds: 300,
        marks_weightage: 5,
        question_latex: 'An open box with a square base is to be constructed out of a given quantity of cardboard of area $c^2$. Show that the maximum volume of the box is $\\frac{c^3}{6\\sqrt{3}}$.',
        options_latex: [],
        correct_answer_latex: '$V_{max} = \\frac{c^3}{6\\sqrt{3}}$',
        solution_latex: 'Let length of base be $x$ and height be $h$. Total surface area of open box: $S = x^2 + 4xh = c^2 \\implies h = \\frac{c^2 - x^2}{4x}$. Volume $V = x^2 h = x^2 \\left(\\frac{c^2 - x^2}{4x}\\right) = \\frac{1}{4}(c^2 x - x^3)$. Differentiating with respect to $x$: $\\frac{dV}{dx} = \\frac{1}{4}(c^2 - 3x^2)$. Setting $\\frac{dV}{dx} = 0 \\implies x = \\frac{c}{\\sqrt{3}}$. Second derivative test: $\\frac{d^2V}{dx^2} = -\\frac{6x}{4} < 0$ at $x = \\frac{c}{\\sqrt{3}}$, confirming a maximum. Substituting $x = \\frac{c}{\\sqrt{3}}$: $V_{max} = \\frac{1}{4}\\left(c^2 \\cdot \\frac{c}{\\sqrt{3}} - \\frac{c^3}{3\\sqrt{3}}\\right) = \\frac{1}{4} \\cdot \\frac{2c^3}{3\\sqrt{3}} = \\frac{c^3}{6\\sqrt{3}}$.',
        socratic_hints: [
          "Express the surface area of the open box (bottom + 4 sides) in terms of $x$ and $h$.",
          "Solve for $h$ in terms of $x$ and substitute into $V = x^2 h$.",
          "Differentiate $V$ with respect to $x$ and equate to zero.",
          "Check the second derivative to establish that $V$ is indeed maximized."
        ]
      },
      {
        id: 'snr_m_06',
        grade: '12',
        stream: 'NON_MEDICAL',
        target_exam: 'CBSE_CLASS_12',
        subject: 'Mathematics',
        math_branch: 'PROBABILITY',
        chapter_number: 13,
        chapter_name: 'Probability',
        topic: 'Bayes\' Theorem',
        subtopic: 'Cause-and-effect reversal problems (machine defects, medical diagnostic tests, truth/lie)',
        curriculum_board: 'CBSE_BOARD',
        pyq_appearance: 'CBSE Class 12 Board 2024 (4-Mark Case-Study)',
        difficulty: 'MEDIUM',
        question_format: 'SUBJECTIVE_LONG',
        benchmark_time_seconds: 240,
        marks_weightage: 4,
        question_latex: 'In a factory, three machines $E_1, E_2, E_3$ produce $50\\%, 30\\%, 20\\%$ of the total output. Of their output, $2\\%, 2\\%, 3\\%$ are defective bolts respectively. A bolt is chosen at random and found to be defective. What is the probability that it was produced by machine $E_2$?',
        options_latex: [],
        correct_answer_latex: '$P(E_2|A) = \\frac{3}{11}$',
        solution_latex: 'Let $A$ be the event that the bolt is defective. Probabilities: $P(E_1) = 0.5, P(E_2) = 0.3, P(E_3) = 0.2$. Conditional probabilities: $P(A|E_1) = 0.02, P(A|E_2) = 0.02, P(A|E_3) = 0.03$. Total probability $P(A) = (0.5)(0.02) + (0.3)(0.02) + (0.2)(0.03) = 0.010 + 0.006 + 0.006 = 0.022$. By Bayes\' Theorem: $$P(E_2|A) = \\frac{P(E_2)P(A|E_2)}{P(A)} = \\frac{0.3 \\times 0.02}{0.022} = \\frac{0.006}{0.022} = \\frac{6}{22} = \\frac{3}{11}$$.',
        socratic_hints: [
          "Define the partition events $E_1, E_2, E_3$ and the observed event $A$ (defective bolt).",
          "Compute the total probability $P(A) = \\sum P(E_i)P(A|E_i)$.",
          "Apply Bayes Theorem formula for $P(E_2|A)$."
        ]
      },
      {
        id: 'snr_m_07',
        grade: '12',
        stream: 'NON_MEDICAL',
        target_exam: 'CBSE_CLASS_12',
        subject: 'Mathematics',
        math_branch: 'RELATIONS_FUNCTIONS',
        chapter_number: 1,
        chapter_name: 'Relations and Functions',
        topic: 'Types of Relations',
        subtopic: 'Equivalence Relations & Equivalence Classes [a]',
        curriculum_board: 'CBSE_BOARD',
        pyq_appearance: 'CBSE Class 12 Board 2023 (3-Mark Standard)',
        difficulty: 'MEDIUM',
        question_format: 'SUBJECTIVE_LONG',
        benchmark_time_seconds: 180,
        marks_weightage: 3,
        question_latex: 'Let $\\mathbb{Z}$ be the set of all integers and $R$ be the relation on $\\mathbb{Z} \\times \\mathbb{Z}$ defined by $((a, b), (c, d)) \\in R \\iff a + d = b + c$. Prove that $R$ is an equivalence relation.',
        options_latex: [],
        correct_answer_latex: 'Equivalence relation proven (Reflexive, Symmetric, Transitive)',
        solution_latex: '1. Reflexivity: For all $(a, b) \\in \\mathbb{Z} \\times \\mathbb{Z}$, $a + b = b + a \\implies ((a, b), (a, b)) \\in R$. Hence $R$ is reflexive. 2. Symmetry: Let $((a, b), (c, d)) \\in R \\implies a + d = b + c \\implies c + b = d + a \\implies c + b = a + d \\implies ((c, d), (a, b)) \\in R$. Hence $R$ is symmetric. 3. Transitivity: Let $((a, b), (c, d)) \\in R$ and $((c, d), (e, f)) \\in R$. Then $a + d = b + c$ and $c + f = d + e$. Adding the two equations: $(a + d) + (c + f) = (b + c) + (d + e) \\implies a + f = b + e \\implies ((a, b), (e, f)) \\in R$. Hence $R$ is transitive. Since $R$ is reflexive, symmetric, and transitive, it is an equivalence relation.',
        socratic_hints: [
          "Check reflexivity by substituting $(c, d) = (a, b)$. Does $a + b = b + a$ hold?",
          "Check symmetry: Does $a + d = b + c$ imply $c + b = d + a$?",
          "For transitivity, add the two equations $a + d = b + c$ and $c + f = d + e$ together and cancel common terms."
        ]
      }
    ],
    senior_biology: [
      {
        id: 'snr_b_01',
        grade: '12',
        stream: 'MEDICAL',
        target_exam: 'NEET_UG',
        subject: 'Biology',
        branch: 'BOTANY',
        chapter_number: 4,
        chapter_name: 'Principles of Inheritance and Variation',
        chapter: 'Principles of Inheritance and Variation',
        topic: 'Dihybrid Cross & Law of Independent Assortment',
        subtopic: 'Mendelian Genetics & Dihybrid Cross',
        curriculum_board: 'NEET_UG',
        pyq_appearance: 'NEET 2023 & AIPMT 2014',
        difficulty: 'MEDIUM',
        question_format: 'MCQ_SINGLE',
        benchmark_time_seconds: 45,
        marks_weightage: 4,
        question_latex: 'In a dihybrid cross between two heterozygous round yellow seeded pea plants ($RrYy \\times RrYy$), what proportion of the $F_2$ offspring will have the genotype $RRYy$?',
        options_latex: [
          { key: 'A', latex: '$\\frac{2}{16}$', is_correct: true, distractor_trap: null },
          { key: 'B', latex: '$\\frac{4}{16}$', is_correct: false, distractor_trap: 'Confused $RRYy$ with double heterozygous $RrYy$' },
          { key: 'C', latex: '$\\frac{1}{16}$', is_correct: false, distractor_trap: 'Confused with double homozygous $RRYY$' },
          { key: 'D', latex: '$\\frac{9}{16}$', is_correct: false, distractor_trap: 'Provided phenotypic ratio of Round Yellow instead of genotypic fraction' }
        ],
        correct_answer_latex: 'A',
        solution_latex: 'In Mendel dihybrid cross: Probability of $RR = 1/4$, and probability of $Yy = 2/4 = 1/2$. Therefore, $P(RRYy) = \\frac{1}{4} \\times \\frac{2}{4} = \\frac{2}{16}$.',
        socratic_hints: [
          "Treat the two gene pairs ($R$ and $Y$) independently.",
          "What is the probability of obtaining $RR$ from $Rr \\times Rr$?",
          "What is the probability of obtaining $Yy$ from $Yy \\times Yy$? Multiply the probabilities."
        ]
      },
      {
        id: 'snr_b_02',
        grade: '12',
        stream: 'MEDICAL',
        target_exam: 'NEET_UG',
        subject: 'Biology',
        branch: 'BOTANY',
        chapter_number: 5,
        chapter_name: 'Molecular Basis of Inheritance',
        chapter: 'Molecular Basis of Inheritance',
        topic: 'Replication: Semi-Conservative Mode (Meselson & Stahl) & Enzymes',
        subtopic: 'Semi-Conservative DNA Replication (Meselson & Stahl)',
        curriculum_board: 'NEET_UG',
        pyq_appearance: 'NEET 2022 Phase-1 & CBSE 2023',
        difficulty: 'MEDIUM',
        question_format: 'MCQ_SINGLE',
        benchmark_time_seconds: 50,
        marks_weightage: 4,
        question_latex: '$E. coli$ cells grown in $^{15}\\text{NH}_4\\text{Cl}$ medium were transferred to $^{14}\\text{NH}_4\\text{Cl}$ medium. After 40 minutes (2 generations of replication), what will be the ratio of hybrid density DNA ($^{15}\\text{N}/^{14}\\text{N}$) to light density DNA ($^{14}\\text{N}/^{14}\\text{N}$)?',
        options_latex: [
          { key: 'A', latex: '$1 : 1$', is_correct: true, distractor_trap: null },
          { key: 'B', latex: '$1 : 3$', is_correct: false, distractor_trap: 'Calculated 3 generations (60 min) instead of 2 generations (40 min)' },
          { key: 'C', latex: '$3 : 1$', is_correct: false, distractor_trap: 'Inverted ratio of light vs hybrid' },
          { key: 'D', latex: '$0 : 1$', is_correct: false, distractor_trap: 'Assumed conservative replication mechanism' }
        ],
        correct_answer_latex: 'A',
        solution_latex: 'Generation 0 (0 min): 100% Heavy ($^{15}\\text{N}/^{15}\\text{N}$). Generation 1 (20 min): 100% Hybrid ($^{15}\\text{N}/^{14}\\text{N}$). Generation 2 (40 min): 50% Hybrid ($^{15}\\text{N}/^{14}\\text{N}$) and 50% Light ($^{14}\\text{N}/^{14}\\text{N}$). Thus, the ratio of hybrid to light DNA is $50 : 50 = 1 : 1$.',
        socratic_hints: [
          "Recall that $E. coli$ divides every 20 minutes.",
          "In 40 minutes, how many rounds of DNA replication occur?",
          "Trace the 2 parent strands and 2 newly synthesized light strands in generation 2."
        ]
      },
      {
        id: 'snr_b_03',
        grade: '12',
        stream: 'MEDICAL',
        target_exam: 'NEET_UG',
        subject: 'Biology',
        branch: 'BOTANY',
        chapter_number: 5,
        chapter_name: 'Molecular Basis of Inheritance',
        chapter: 'Molecular Basis of Inheritance',
        topic: 'Regulation of Gene Expression (Lac Operon)',
        subtopic: 'Lac Operon & Inducer Mechanism',
        curriculum_board: 'NEET_UG',
        pyq_appearance: 'NEET 2024 & CBSE 2020',
        difficulty: 'EASY',
        question_format: 'MCQ_SINGLE',
        benchmark_time_seconds: 40,
        marks_weightage: 4,
        question_latex: 'In the lactose operon of $E. coli$, lactose acts as an inducer by directly binding to which component?',
        options_latex: [
          { key: 'A', latex: 'Repressor protein produced by the $i$ gene', is_correct: true, distractor_trap: null },
          { key: 'B', latex: 'Operator gene ($o$ gene)', is_correct: false, distractor_trap: 'Repressor binds to operator, not lactose directly' },
          { key: 'C', latex: 'Promoter gene ($p$ gene)', is_correct: false, distractor_trap: 'RNA polymerase binds to promoter' },
          { key: 'D', latex: 'Structural gene $z$', is_correct: false, distractor_trap: 'Gene $z$ encodes $\\beta$-galactosidase' }
        ],
        correct_answer_latex: 'A',
        solution_latex: 'Lactose (or allolactose) functions as an inducer by binding to the active repressor protein synthesized by the regulatory $i$ gene. This binding alters repressor conformation, preventing it from binding to the operator region and allowing RNA polymerase to transcribe the $z, y, a$ structural genes.',
        socratic_hints: [
          "Which protein keeps the operon in an 'OFF' state by blocking the operator?",
          "How does an inducer release this blockage?"
        ]
      },
      {
        id: 'snr_b_04',
        grade: '11',
        stream: 'MEDICAL',
        target_exam: 'NEET_UG',
        subject: 'Biology',
        branch: 'ZOOLOGY',
        chapter_number: 16,
        chapter_name: 'Excretory Products and their Elimination',
        chapter: 'Excretory Products and their Elimination',
        topic: 'Counter-Current Mechanism (Loop of Henle & Vasa Recta)',
        subtopic: 'Medullary Osmotic Gradient',
        curriculum_board: 'NEET_UG',
        pyq_appearance: 'NEET 2023 & AIPMT 2015',
        difficulty: 'MEDIUM',
        question_format: 'MCQ_SINGLE',
        benchmark_time_seconds: 60,
        marks_weightage: 4,
        question_latex: 'The counter-current mechanism in the human kidney maintains an osmotic gradient in the medullary interstitium increasing from $300\\,\\text{mOsmol/L}$ to $1200\\,\\text{mOsmol/L}$. Which two solutes are primarily responsible for maintaining this medullary gradient?',
        options_latex: [
          { key: 'A', latex: '$\\text{NaCl}$ and Urea', is_correct: true, distractor_trap: null },
          { key: 'B', latex: '$\\text{NaCl}$ and Glucose', is_correct: false, distractor_trap: 'Glucose is fully reabsorbed in PCT and does not create medullary osmolarity' },
          { key: 'C', latex: 'Uric acid and Potassium ($K^+$)', is_correct: false, distractor_trap: 'Uric acid has minimal concentration in medullary interstitial fluid' },
          { key: 'D', latex: 'Creatinine and Bicarbonate ($\\text{HCO}_3^-$)', is_correct: false, distractor_trap: 'Bicarbonate is absorbed in PCT/DCT for acid-base buffer' }
        ],
        correct_answer_latex: 'A',
        solution_latex: 'According to NCERT Chapter 16, the medullary interstitial hyperosmolarity gradient is maintained primarily by $\\text{NaCl}$ (transported by the ascending limb of Henle loop and exchanged with the descending limb of vasa recta) and small amounts of Urea (entering the thin ascending limb from the medullary collecting duct).',
        socratic_hints: [
          "Which electrolyte is actively extruded by the thick ascending limb of Henle's loop?",
          "Which organic nitrogenous waste diffuses out of the collecting duct into the medullary interstitium?"
        ]
      },
      {
        id: 'snr_b_05',
        grade: '12',
        stream: 'MEDICAL',
        target_exam: 'NEET_UG',
        subject: 'Biology',
        branch: 'BOTANY',
        chapter_number: 9,
        chapter_name: 'Biotechnology: Principles and Processes',
        chapter: 'Biotechnology: Principles and Processes',
        topic: 'Cloning Vectors (pBR322: ori, rop, Selectable Markers, ampR, tetR)',
        subtopic: 'Insertional Inactivation in pBR322',
        curriculum_board: 'NEET_UG',
        pyq_appearance: 'NEET 2024 & CBSE Class 12 Board 2023',
        difficulty: 'HARD',
        question_format: 'MCQ_SINGLE',
        benchmark_time_seconds: 70,
        marks_weightage: 4,
        question_latex: 'If a foreign gene is ligated at the $Bam\\text{HI}$ restriction site located within the tetracycline resistance gene ($tet^R$) of cloning vector $\\text{pBR322}$, what will be the antibiotic phenotype of recombinant transformants?',
        options_latex: [
          { key: 'A', latex: 'Ampicillin resistant ($\\text{amp}^R$) and Tetracycline sensitive ($\\text{tet}^S$)', is_correct: true, distractor_trap: null },
          { key: 'B', latex: 'Tetracycline resistant ($\\text{tet}^R$) and Ampicillin sensitive ($\\text{amp}^S$)', is_correct: false, distractor_trap: 'Inverted antibiotic resistance markers' },
          { key: 'C', latex: 'Resistant to both Ampicillin and Tetracycline', is_correct: false, distractor_trap: 'Ignored insertional inactivation of the $tet^R$ gene' },
          { key: 'D', latex: 'Sensitive to both Ampicillin and Tetracycline', is_correct: false, distractor_trap: 'Ampicillin gene remained intact and functional' }
        ],
        correct_answer_latex: 'A',
        solution_latex: 'The $Bam\\text{HI}$ recognition sequence lies within the $tet^R$ gene of pBR322. Insertion of alien DNA disrupts the coding sequence of the $tet^R$ gene (insertional inactivation), causing loss of tetracycline resistance. The $amp^R$ gene remains intact and expresses $\\beta$-lactamase, so recombinants grow on ampicillin medium but not on tetracycline medium.',
        socratic_hints: [
          "Where is the $Bam\\text{HI}$ site situated in the standard pBR322 plasmid map?",
          "What happens to a gene's expression when a foreign DNA sequence is spliced inside its coding region?"
        ]
      },
      {
        id: 'snr_b_06',
        grade: '11',
        stream: 'MEDICAL',
        target_exam: 'NEET_UG',
        subject: 'Biology',
        branch: 'BOTANY',
        chapter_number: 8,
        chapter_name: 'Cell: The Unit of Life',
        chapter: 'Cell: The Unit of Life',
        topic: 'Plasma Membrane (Fluid Mosaic Model)',
        subtopic: 'Fluid Mosaic Model & Membrane Lipids',
        curriculum_board: 'NEET_UG',
        pyq_appearance: 'NEET 2023 & AIPMT 2012',
        difficulty: 'EASY',
        question_format: 'MCQ_SINGLE',
        benchmark_time_seconds: 35,
        marks_weightage: 4,
        question_latex: 'According to the Fluid Mosaic Model of Singer and Nicolson (1972), the quasi-fluid nature of the membrane lipid bilayer enables:',
        options_latex: [
          { key: 'A', latex: 'Lateral movement of proteins within the overall bilayer', is_correct: true, distractor_trap: null },
          { key: 'B', latex: 'Rapid flip-flop movement of all membrane proteins', is_correct: false, distractor_trap: 'Proteins rarely or never undergo flip-flop movement across the hydrophilic interior' },
          { key: 'C', latex: 'Completely rigid mechanical support with zero fluidity', is_correct: false, distractor_trap: 'Contradicts the fluid model' },
          { key: 'D', latex: 'Dissolution of the lipid bilayer at physiological temperature', is_correct: false, distractor_trap: 'Bilayer maintains integrity and selective permeability' }
        ],
        correct_answer_latex: 'A',
        solution_latex: 'The quasi-fluid nature of lipids enables lateral movement of integral proteins within the overall bilayer. This ability to move within the membrane is measured as its fluidity, which is vital for cell growth, formation of intercellular junctions, secretion, endocytosis, and cell division.',
        socratic_hints: [
          "Do proteins in a biological membrane move laterally or flip-flop across?",
          "How did Singer and Nicolson describe proteins in the lipid sea ('protein icebergs in a sea of lipids')?"
        ]
      }
    ]
  },
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
  ],
  submissions: [
    {
      submissionId: 'sub_10_sci_01_aryan',
      assessmentId: 'asgn_10_sci_01',
      assessmentTitle: 'Class 10 Science: Light – Spherical Mirrors & Derivations',
      studentId: 'b0000000-0000-0000-0000-000000000001',
      studentName: 'Aryan Sharma',
      rollNumber: '11-S-24',
      grade: '10',
      section: 'Science-A',
      totalScore: 12,
      totalMarks: 12,
      percentage: 100,
      totalTimeSpentSeconds: 219,
      smartCardSummary: 'Mastered all 3 topics with sub-benchmark speeds. Flawless application of sign conventions and electrical units.',
      questionBreakdown: [
        {
          questionIndex: 1,
          questionId: 'q_asgn_01',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Spherical Mirrors',
          timeSpentSeconds: 68,
          benchmarkSeconds: 90,
          isCorrect: true,
          selectedOption: 'B',
          correctAnswer: 'B',
          mistakeClassification: { type: 'NONE', label: 'Flawless Execution', explanation: 'Applied mirror formula with correct sign conventions.' }
        },
        {
          questionIndex: 2,
          questionId: 'q_asgn_02',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Refraction & Snell Law',
          timeSpentSeconds: 61,
          benchmarkSeconds: 75,
          isCorrect: true,
          selectedOption: 'A',
          correctAnswer: 'A',
          mistakeClassification: { type: 'NONE', label: 'Flawless Execution', explanation: 'Correctly solved v = c/n for water.' }
        },
        {
          questionIndex: 3,
          questionId: 'q_asgn_03',
          topic: 'Electricity',
          subtopic: 'Joule Heating & Resistance',
          timeSpentSeconds: 90,
          benchmarkSeconds: 90,
          isCorrect: true,
          selectedOption: 'A',
          correctAnswer: 'A',
          mistakeClassification: { type: 'NONE', label: 'Flawless Execution', explanation: 'Converted 2 hours into 7200 seconds accurately.' }
        }
      ],
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      submissionId: 'sub_10_sci_01_ananya',
      assessmentId: 'asgn_10_sci_01',
      assessmentTitle: 'Class 10 Science: Light – Spherical Mirrors & Derivations',
      studentId: 'b0000000-0000-0000-0000-000000000002',
      studentName: 'Ananya Thakur',
      rollNumber: '11-S-25',
      grade: '10',
      section: 'Science-A',
      totalScore: 8,
      totalMarks: 12,
      percentage: 67,
      totalTimeSpentSeconds: 285,
      smartCardSummary: 'Strong optics comprehension. Stumbled on time-unit conversion (2 hours to seconds) in Joule heating.',
      questionBreakdown: [
        {
          questionIndex: 1,
          questionId: 'q_asgn_01',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Spherical Mirrors',
          timeSpentSeconds: 82,
          benchmarkSeconds: 90,
          isCorrect: true,
          selectedOption: 'B',
          correctAnswer: 'B',
          mistakeClassification: { type: 'NONE', label: 'Correct', explanation: 'Accurate mirror formula calculation.' }
        },
        {
          questionIndex: 2,
          questionId: 'q_asgn_02',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Refraction & Snell Law',
          timeSpentSeconds: 68,
          benchmarkSeconds: 75,
          isCorrect: true,
          selectedOption: 'A',
          correctAnswer: 'A',
          mistakeClassification: { type: 'NONE', label: 'Correct', explanation: 'Quick Snell law speed ratio computation.' }
        },
        {
          questionIndex: 3,
          questionId: 'q_asgn_03',
          topic: 'Electricity',
          subtopic: 'Joule Heating & Resistance',
          timeSpentSeconds: 135,
          benchmarkSeconds: 90,
          isCorrect: false,
          selectedOption: 'B',
          correctAnswer: 'A',
          mistakeClassification: {
            type: 'CALCULATION',
            label: 'Unit Conversion Failure',
            explanation: 'Forgot to convert 2 hours into 7200 seconds ($2 \\times 3600\\,\\text{s}$).',
            distractorTrap: 'Selected option computed without multiplying time by 3600.'
          }
        }
      ],
      submittedAt: new Date(Date.now() - 3600000 * 2.5).toISOString()
    },
    {
      submissionId: 'sub_10_sci_01_rohit',
      assessmentId: 'asgn_10_sci_01',
      assessmentTitle: 'Class 10 Science: Light – Spherical Mirrors & Derivations',
      studentId: 'b0000000-0000-0000-0000-000000000003',
      studentName: 'Rohit Verma',
      rollNumber: '11-S-26',
      grade: '10',
      section: 'Science-A',
      totalScore: 4,
      totalMarks: 12,
      percentage: 33,
      totalTimeSpentSeconds: 340,
      smartCardSummary: 'Critical hesitation in Cartesian sign conventions and formula inversion in Snell law. Needs 1-on-1 re-teaching.',
      questionBreakdown: [
        {
          questionIndex: 1,
          questionId: 'q_asgn_01',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Spherical Mirrors',
          timeSpentSeconds: 145,
          benchmarkSeconds: 90,
          isCorrect: false,
          selectedOption: 'C',
          correctAnswer: 'B',
          mistakeClassification: {
            type: 'SIGN_CONVENTION',
            label: 'Sign Convention Failure',
            explanation: 'Assumed positive sign for real image distance (+30cm instead of -30cm).',
            distractorTrap: 'Violated Cartesian sign convention where real image in front of mirror has negative distance.'
          }
        },
        {
          questionIndex: 2,
          questionId: 'q_asgn_02',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Refraction & Snell Law',
          timeSpentSeconds: 95,
          benchmarkSeconds: 75,
          isCorrect: false,
          selectedOption: 'B',
          correctAnswer: 'A',
          mistakeClassification: {
            type: 'FORMULA_BASED',
            label: 'Formula Inversion Error',
            explanation: 'Multiplied speed of light by refractive index ($c \\times n$) instead of dividing ($c / n$).',
            distractorTrap: 'Speed of light in any material medium cannot exceed c ($3 \\times 10^8$ m/s).'
          }
        },
        {
          questionIndex: 3,
          questionId: 'q_asgn_03',
          topic: 'Electricity',
          subtopic: 'Joule Heating & Resistance',
          timeSpentSeconds: 100,
          benchmarkSeconds: 90,
          isCorrect: true,
          selectedOption: 'A',
          correctAnswer: 'A',
          mistakeClassification: { type: 'NONE', label: 'Correct', explanation: 'Correctly evaluated H = P * t.' }
        }
      ],
      submittedAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      submissionId: 'sub_10_sci_01_simran',
      assessmentId: 'asgn_10_sci_01',
      assessmentTitle: 'Class 10 Science: Light – Spherical Mirrors & Derivations',
      studentId: 'b0000000-0000-0000-0000-000000000004',
      studentName: 'Simran Kaur',
      rollNumber: '11-S-27',
      grade: '10',
      section: 'Science-A',
      totalScore: 8,
      totalMarks: 12,
      percentage: 67,
      totalTimeSpentSeconds: 270,
      smartCardSummary: 'High procedural accuracy in optics. Lost marks on Q3 due to parameter extraction error ($t=1\\text{h}$ instead of $2\\text{h}$).',
      questionBreakdown: [
        {
          questionIndex: 1,
          questionId: 'q_asgn_01',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Spherical Mirrors',
          timeSpentSeconds: 75,
          benchmarkSeconds: 90,
          isCorrect: true,
          selectedOption: 'B',
          correctAnswer: 'B',
          mistakeClassification: { type: 'NONE', label: 'Correct', explanation: 'Accurate mirror formula application.' }
        },
        {
          questionIndex: 2,
          questionId: 'q_asgn_02',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Refraction & Snell Law',
          timeSpentSeconds: 70,
          benchmarkSeconds: 75,
          isCorrect: true,
          selectedOption: 'A',
          correctAnswer: 'A',
          mistakeClassification: { type: 'NONE', label: 'Correct', explanation: 'Correctly calculated 3e8 * 3/4.' }
        },
        {
          questionIndex: 3,
          questionId: 'q_asgn_03',
          topic: 'Electricity',
          subtopic: 'Joule Heating & Resistance',
          timeSpentSeconds: 125,
          benchmarkSeconds: 90,
          isCorrect: false,
          selectedOption: 'C',
          correctAnswer: 'A',
          mistakeClassification: {
            type: 'CALCULATION',
            label: 'Parameter Extraction Mistake',
            explanation: 'Substituted time $t = 1\\,\\text{hour}$ instead of given $2\\,\\text{hours}$.',
            distractorTrap: 'Selected option yielded exactly half the total energy.'
          }
        }
      ],
      submittedAt: new Date(Date.now() - 3600000 * 3.5).toISOString()
    },
    {
      submissionId: 'sub_10_sci_01_aditya',
      assessmentId: 'asgn_10_sci_01',
      assessmentTitle: 'Class 10 Science: Light – Spherical Mirrors & Derivations',
      studentId: 'b0000000-0000-0000-0000-000000000005',
      studentName: 'Aditya Chauhan',
      rollNumber: '11-S-28',
      grade: '10',
      section: 'Science-A',
      totalScore: 4,
      totalMarks: 12,
      percentage: 33,
      totalTimeSpentSeconds: 360,
      smartCardSummary: 'Significant time overrun on spherical mirrors (160s vs 90s). Needs concept re-teaching on mirror ray geometries.',
      questionBreakdown: [
        {
          questionIndex: 1,
          questionId: 'q_asgn_01',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Spherical Mirrors',
          timeSpentSeconds: 160,
          benchmarkSeconds: 90,
          isCorrect: false,
          selectedOption: 'A',
          correctAnswer: 'B',
          mistakeClassification: {
            type: 'CONCEPTUAL',
            label: 'Ray Geometry Confusion',
            explanation: 'Substituted focal length $f$ as the image distance $v$ without applying equation.',
            distractorTrap: 'Confused object placement at $2f$ with focus.'
          }
        },
        {
          questionIndex: 2,
          questionId: 'q_asgn_02',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Refraction & Snell Law',
          timeSpentSeconds: 85,
          benchmarkSeconds: 75,
          isCorrect: true,
          selectedOption: 'A',
          correctAnswer: 'A',
          mistakeClassification: { type: 'NONE', label: 'Correct', explanation: 'Snell law calculated accurately.' }
        },
        {
          questionIndex: 3,
          questionId: 'q_asgn_03',
          topic: 'Electricity',
          subtopic: 'Joule Heating & Resistance',
          timeSpentSeconds: 115,
          benchmarkSeconds: 90,
          isCorrect: false,
          selectedOption: 'B',
          correctAnswer: 'A',
          mistakeClassification: {
            type: 'CALCULATION',
            label: 'Unit Conversion Failure',
            explanation: 'Substituted raw hours into Joule formula without converting to SI seconds.',
            distractorTrap: 'Selected option missing $3600\\text{s}$ factor.'
          }
        }
      ],
      submittedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      submissionId: 'sub_10_sci_01_mehak',
      assessmentId: 'asgn_10_sci_01',
      assessmentTitle: 'Class 10 Science: Light – Spherical Mirrors & Derivations',
      studentId: 'b0000000-0000-0000-0000-000000000006',
      studentName: 'Mehak Sharma',
      rollNumber: '11-S-29',
      grade: '10',
      section: 'Science-A',
      totalScore: 8,
      totalMarks: 12,
      percentage: 67,
      totalTimeSpentSeconds: 245,
      smartCardSummary: 'Swift problem solver (sub-benchmark on Q1 & Q3). Quick recap suggested on refractive index constants.',
      questionBreakdown: [
        {
          questionIndex: 1,
          questionId: 'q_asgn_01',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Spherical Mirrors',
          timeSpentSeconds: 80,
          benchmarkSeconds: 90,
          isCorrect: true,
          selectedOption: 'B',
          correctAnswer: 'B',
          mistakeClassification: { type: 'NONE', label: 'Correct', explanation: 'Proper mirror equation solved.' }
        },
        {
          questionIndex: 2,
          questionId: 'q_asgn_02',
          topic: 'Light – Reflection and Refraction',
          subtopic: 'Refraction & Snell Law',
          timeSpentSeconds: 110,
          benchmarkSeconds: 75,
          isCorrect: false,
          selectedOption: 'C',
          correctAnswer: 'A',
          mistakeClassification: {
            type: 'CONCEPTUAL',
            label: 'Material Constant Confusion',
            explanation: 'Used glass refractive index ($1.5$) instead of water ($4/3$).',
            distractorTrap: 'Confused refractive indices of dense flint glass and water.'
          }
        },
        {
          questionIndex: 3,
          questionId: 'q_asgn_03',
          topic: 'Electricity',
          subtopic: 'Joule Heating & Resistance',
          timeSpentSeconds: 55,
          benchmarkSeconds: 90,
          isCorrect: true,
          selectedOption: 'A',
          correctAnswer: 'A',
          mistakeClassification: { type: 'NONE', label: 'Correct', explanation: 'Rapid and accurate calculation.' }
        }
      ],
      submittedAt: new Date(Date.now() - 3600000 * 4.5).toISOString()
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
