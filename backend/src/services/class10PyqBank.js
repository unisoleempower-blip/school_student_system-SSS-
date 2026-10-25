// ============================================================================
// HAPS-AI SCHOLAR ASSISTANT: CLASS 10 NCERT MAPPED PREVIOUS YEAR QUESTION BANK
// Verified CBSE Board (2020-2024) and HP Board (HPBOSE) Questions with LaTeX
// ============================================================================

const class10Questions = [
  // ==========================================================================
  // SCIENCE - CHAPTER 9: LIGHT – REFLECTION AND REFRACTION
  // ==========================================================================
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
      pyq_tag: "CBSE Board Exam 2023 (Set 31/1/1) & HPBOSE 2022 Term-2",
      marks: 3
    },
    difficulty: "MEDIUM",
    question_type: "NUMERICAL",
    bloom_level: "APPLICATION",
    question_latex: "An object of height $h = 4\\,\\text{cm}$ is placed at a distance of $u = -25\\,\\text{cm}$ in front of a concave mirror of focal length $f = -15\\,\\text{cm}$. At what distance $v$ from the mirror should a screen be placed in order to obtain a sharp real image? Find the nature and height $h'$ of the image formed.",
    options_latex: [
      { key: "A", latex: "$v = -37.5\\,\\text{cm}$, $h' = -6\\,\\text{cm}$ (Real and Inverted)", is_correct: true, distractor_trap: null },
      { key: "B", latex: "$v = +37.5\\,\\text{cm}$, $h' = +6\\,\\text{cm}$ (Virtual and Erect)", is_correct: false, distractor_trap: "Ignored Cartesian sign conventions for concave mirror ($f < 0, u < 0$)" },
      { key: "C", latex: "$v = -9.37\\,\\text{cm}$, $h' = -1.5\\,\\text{cm}$", is_correct: false, distractor_trap: "Used lens formula $\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$ instead of mirror formula $\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f}$" },
      { key: "D", latex: "$v = -25.0\\,\\text{cm}$, $h' = -4\\,\\text{cm}$", is_correct: false, distractor_trap: "Assumed object is at center of curvature ($2f = 30\\text{cm}$)" }
    ],
    correct_answer_latex: "v = -37.5\\,\\text{cm},\\; h' = -6\\,\\text{cm}",
    solution_latex: "1. **Mirror Formula**: $$\\frac{1}{v} + \\frac{1}{u} = \\frac{1}{f} \\implies \\frac{1}{v} = \\frac{1}{f} - \\frac{1}{u}$$\n2. **Substitution with Sign Convention**: $u = -25\\,\\text{cm}$, $f = -15\\,\\text{cm}$. $$\\frac{1}{v} = \\frac{1}{-15} - \\left(\\frac{1}{-25}\\right) = -\\frac{1}{15} + \\frac{1}{25} = \\frac{-5 + 3}{75} = -\\frac{2}{75}$$\n$$v = -\\frac{75}{2} = -37.5\\,\\text{cm}$$\n3. **Magnification & Image Height**: $$m = -\\frac{v}{u} = \\frac{h'}{h} \\implies h' = -\\left(\\frac{-37.5}{-25}\\right) \\times 4 = -(1.5) \\times 4 = -6\\,\\text{cm}$$\nThe negative sign confirms that the image is **Real, Inverted, and Magnified**.",
    socratic_hints: [
      "What is the Cartesian sign convention for the focal length $f$ of a concave mirror?",
      "State the mirror formula linking $u$, $v$, and $f$. Be careful not to use the lens formula minus sign!",
      "Calculate linear magnification $m = -v/u = h'/h$."
    ],
    step_rubric: [
      { step: 1, description: "Correct statement of mirror formula with signs: $u=-25\\text{cm}, f=-15\\text{cm}$", marks: 1.0 },
      { step: 2, description: "Calculation of image distance $v = -37.5\\text{cm}$ with negative sign", marks: 1.0 },
      { step: 3, description: "Magnification and height calculation: $h' = -6\\text{cm}$, stating Real & Inverted", marks: 1.0 }
    ],
    benchmark_time_seconds: 150
  },

  // ==========================================================================
  // SCIENCE - CHAPTER 11: ELECTRICITY
  // ==========================================================================
  {
    id: "pyq_10_sci_elec_02",
    grade: "10",
    subject: "Science",
    chapter: "Electricity",
    ncert_mapping: {
      chapter_number: 11,
      chapter_name: "Electricity",
      ncert_section: "11.6 Resistance of a System of Resistors & Joule's Heating",
      page_reference: "NCERT Class 10 Science, Pages 213–218",
      pyq_tag: "CBSE Board Exam 2024 Standard & HPBOSE 2023",
      marks: 3
    },
    difficulty: "MEDIUM",
    question_type: "NUMERICAL",
    bloom_level: "APPLICATION",
    question_latex: "An electric heater rated $P = 1000\\,\\text{W}$ operates at $V = 220\\,\\text{V}$. Calculate: (i) the electric current $I$ drawn by the heater, (ii) the resistance $R$ of its heating element, and (iii) the heat energy $H$ produced in Joules when it runs for $t = 2\\,\\text{hours}$.",
    options_latex: [
      { key: "A", latex: "$I = 4.55\\,\\text{A}$, $R = 48.4\\,\\Omega$, $H = 7.2 \\times 10^6\\,\\text{J}$", is_correct: true, distractor_trap: null },
      { key: "B", latex: "$I = 4.55\\,\\text{A}$, $R = 48.4\\,\\Omega$, $H = 2000\\,\\text{J}$", is_correct: false, distractor_trap: "Forgot to convert time from hours to seconds ($t = 2 \\times 3600\\text{ s}$)" },
      { key: "C", latex: "$I = 0.22\\,\\text{A}$, $R = 1000\\,\\Omega$, $H = 1.44 \\times 10^5\\,\\text{J}$", is_correct: false, distractor_trap: "Inverted formula: used $I = V/P$ instead of $I = P/V$" },
      { key: "D", latex: "$I = 4.55\\,\\text{A}$, $R = 22.0\\,\\Omega$, $H = 3.6 \\times 10^6\\,\\text{J}$", is_correct: false, distractor_trap: "Calculation slip in $R = V^2/P$" }
    ],
    correct_answer_latex: "I = 4.55\\,\\text{A},\\; R = 48.4\\,\\Omega,\\; H = 7.2 \\times 10^6\\,\\text{J}",
    solution_latex: "1. **Current**: $$P = V \\cdot I \\implies I = \\frac{P}{V} = \\frac{1000\\,\\text{W}}{220\\,\\text{V}} \\approx 4.55\\,\\text{A}$$\n2. **Resistance**: $$R = \\frac{V^2}{P} = \\frac{(220)^2}{1000} = \\frac{48400}{1000} = 48.4\\,\\Omega$$\n3. **Heat Energy Produced**: $$t = 2\\,\\text{hours} = 2 \\times 3600\\,\\text{s} = 7200\\,\\text{s}$$\n$$H = P \\cdot t = 1000\\,\\text{W} \\times 7200\\,\\text{s} = 7.2 \\times 10^6\\,\\text{Joules} = 7.2\\,\\text{MJ}$$",
    socratic_hints: [
      "Relate electric power $P$ to voltage $V$ and current $I$.",
      "Express resistance using $R = V^2/P$ or Ohm's Law $R = V/I$.",
      "Crucial: What is the SI unit of time? Always convert hours to seconds before multiplying!"
    ],
    step_rubric: [
      { step: 1, description: "Formula and value for current $I = P/V = 4.55\\text{ A}$", marks: 1.0 },
      { step: 2, description: "Formula and value for resistance $R = 48.4\\;\\Omega$", marks: 1.0 },
      { step: 3, description: "Heat energy calculation with time in seconds: $H = 7.2 \\times 10^6\\text{ J}$", marks: 1.0 }
    ],
    benchmark_time_seconds: 120
  },

  // ==========================================================================
  // MATHEMATICS - CHAPTER 8: INTRODUCTION TO TRIGONOMETRY
  // ==========================================================================
  {
    id: "pyq_10_math_trig_03",
    grade: "10",
    subject: "Mathematics",
    chapter: "Introduction to Trigonometry",
    ncert_mapping: {
      chapter_number: 8,
      chapter_name: "Introduction to Trigonometry",
      ncert_section: "8.4 Trigonometric Identities",
      page_reference: "NCERT Class 10 Mathematics, Pages 190–193",
      pyq_tag: "CBSE Board Exam 2023 (4 Marks) & HPBOSE 2021",
      marks: 4
    },
    difficulty: "HARD",
    question_type: "SUBJECTIVE_DERIVATION",
    bloom_level: "ANALYZE",
    question_latex: "Prove the following trigonometric identity for acute angles: $$\\frac{\\sin\\theta - \\cos\\theta + 1}{\\sin\\theta + \\cos\\theta - 1} = \\frac{1}{\\sec\\theta - \\tan\\theta}$$ using the fundamental identity $\\sec^2\\theta = 1 + \\tan^2\\theta$.",
    options_latex: [],
    correct_answer_latex: "\\frac{1}{\\sec\\theta - \\tan\\theta}",
    solution_latex: "1. **Divide numerator and denominator by $\\cos\\theta$**: $$\\text{LHS} = \\frac{\\tan\\theta - 1 + \\sec\\theta}{\\tan\\theta + 1 - \\sec\\theta} = \\frac{(\\sec\\theta + \\tan\\theta) - 1}{(\\tan\\theta - \\sec\\theta) + 1}$$\n2. **Use $1 = \\sec^2\\theta - \\tan^2\\theta$ in the numerator**: $$= \\frac{(\\sec\\theta + \\tan\\theta) - (\\sec^2\\theta - \\tan^2\\theta)}{(\\tan\\theta - \\sec\\theta + 1)}$$\n$$= \\frac{(\\sec\\theta + \\tan\\theta) \\left[ 1 - (\\sec\\theta - \\tan\\theta) \\right]}{\\tan\\theta - \\sec\\theta + 1}$$\n$$= \\frac{(\\sec\\theta + \\tan\\theta) (1 - \\sec\\theta + \\tan\\theta)}{(\\tan\\theta - \\sec\\theta + 1)} = \\sec\\theta + \\tan\\theta$$\n3. **Rationalize / Convert to RHS**: $$\\sec\\theta + \\tan\\theta = \\frac{(\\sec\\theta + \\tan\\theta)(\\sec\\theta - \\tan\\theta)}{\\sec\\theta - \\tan\\theta} = \\frac{\\sec^2\\theta - \\tan^2\\theta}{\\sec\\theta - \\tan\\theta} = \\frac{1}{\\sec\\theta - \\tan\\theta} = \\text{RHS}$$ Hence proved.",
    socratic_hints: [
      "Divide every term in the numerator and denominator by $\\cos\\theta$ to express in terms of $\\sec\\theta$ and $\\tan\\theta$.",
      "Substitute $1 = \\sec^2\\theta - \\tan^2\\theta$ into the numerator only.",
      "Factor out the common factor $(\\sec\\theta + \\tan\\theta)$."
    ],
    step_rubric: [
      { step: 1, description: "Dividing numerator and denominator by $\\cos\\theta$ to introduce $\\sec\\theta, \\tan\\theta$", marks: 1.0 },
      { step: 2, description: "Substituting $1 = \\sec^2\\theta - \\tan^2\\theta$ and factoring as $(\\sec\\theta - \\tan\\theta)(\\sec\\theta + \\tan\\theta)$", marks: 1.5 },
      { step: 3, description: "Canceling common factor $(1 - \\sec\\theta + \\tan\\theta)$ to obtain $\\sec\\theta + \\tan\\theta$", marks: 0.5 },
      { step: 4, description: "Multiplying and dividing by $(\\sec\\theta - \\tan\\theta)$ to reach $\\frac{1}{\\sec\\theta - \\tan\\theta}$", marks: 1.0 }
    ],
    benchmark_time_seconds: 240
  },

  // ==========================================================================
  // MATHEMATICS - CHAPTER 4: QUADRATIC EQUATIONS
  // ==========================================================================
  {
    id: "pyq_10_math_quad_04",
    grade: "10",
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    ncert_mapping: {
      chapter_number: 4,
      chapter_name: "Quadratic Equations",
      ncert_section: "4.4 Nature of Roots & Discriminant",
      page_reference: "NCERT Class 10 Mathematics, Pages 88–91",
      pyq_tag: "CBSE Board Exam 2024 & HPBOSE 2022",
      marks: 3
    },
    difficulty: "MEDIUM",
    question_type: "MCQ_SINGLE",
    bloom_level: "APPLICATION",
    question_latex: "Find the values of $k$ for which the quadratic equation $$(k - 12)x^2 + 2(k - 12)x + 2 = 0$$ has real and equal roots, given that $k \\neq 12$.",
    options_latex: [
      { key: "A", latex: "$k = 14$", is_correct: true, distractor_trap: null },
      { key: "B", latex: "$k = 12$", is_correct: false, distractor_trap: "Ignored the condition that coefficient of $x^2$ cannot be 0 in a quadratic equation ($k \\neq 12$)" },
      { key: "C", latex: "$k = 12$ or $k = 14$", is_correct: false, distractor_trap: "Included extraneous root $k=12$ which reduces equation to $2=0$" },
      { key: "D", latex: "$k = -14$", is_correct: false, distractor_trap: "Sign error in factoring $(k-12)(k-14) = 0$" }
    ],
    correct_answer_latex: "k = 14",
    solution_latex: "1. For equal roots, the discriminant $D = b^2 - 4ac = 0$.\n2. Here, $a = (k - 12)$, $b = 2(k - 12)$, $c = 2$.\n$$D = [2(k - 12)]^2 - 4(k - 12)(2) = 0$$\n$$4(k - 12)^2 - 8(k - 12) = 0$$\n$$4(k - 12) \\left[ (k - 12) - 2 \\right] = 0 \\implies 4(k - 12)(k - 14) = 0$$\n3. Either $k = 12$ or $k = 14$.\nSince $k = 12$ makes the coefficient of $x^2$ zero (reducing it to $0 + 0 + 2 = 0$, which is impossible), we reject $k = 12$.\nTherefore, the only valid solution is **$k = 14$**.",
    socratic_hints: [
      "What is the condition on the discriminant $D$ for a quadratic equation to have equal roots?",
      "Factor out the common term $4(k - 12)$ before expanding.",
      "Check: If $k = 12$, does the equation remain a quadratic equation?"
    ],
    step_rubric: [
      { step: 1, description: "Condition for equal roots: $b^2 - 4ac = 0$", marks: 1.0 },
      { step: 2, description: "Setting up equation: $4(k-12)^2 - 8(k-12) = 0$ and finding $k=12, 14$", marks: 1.0 },
      { step: 3, description: "Rejecting $k=12$ and justifying final answer $k=14$", marks: 1.0 }
    ],
    benchmark_time_seconds: 120
  },

  // ==========================================================================
  // SCIENCE - CHAPTER 1: CHEMICAL REACTIONS AND EQUATIONS
  // ==========================================================================
  {
    id: "pyq_10_sci_chem_05",
    grade: "10",
    subject: "Science",
    chapter: "Chemical Reactions and Equations",
    ncert_mapping: {
      chapter_number: 1,
      chapter_name: "Chemical Reactions and Equations",
      ncert_section: "1.2.2 Decomposition Reactions & Thermal Decomposition",
      page_reference: "NCERT Class 10 Science, Pages 8–10",
      pyq_tag: "CBSE Board Exam 2023 & HPBOSE 2020",
      marks: 3
    },
    difficulty: "MEDIUM",
    question_type: "SUBJECTIVE_DERIVATION",
    bloom_level: "UNDERSTAND",
    question_latex: "When green crystals of ferrous sulphate $\\text{FeSO}_4 \\cdot 7\\text{H}_2\\text{O}$ are heated strongly in a dry boiling tube: (a) State two distinct observation changes, (b) Name the characteristic gases released, and (c) Write the balanced chemical equation with physical states.",
    options_latex: [],
    correct_answer_latex: "2\\text{FeSO}_4(s) \\xrightarrow{\\Delta} \\text{Fe}_2\\text{O}_3(s) + \\text{SO}_2(g) + \\text{SO}_3(g)",
    solution_latex: "1. **Observations**:\n- Green color of ferrous sulphate crystals changes to brownish-red solid ferric oxide ($\\text{Fe}_2\\text{O}_3$).\n- A gas having the characteristic smell of burning sulphur is evolved.\n- Water droplets condense on the cooler upper walls of the boiling tube.\n2. **Gases Released**: Sulphur dioxide ($\\text{SO}_2$) and Sulphur trioxide ($\\text{SO}_3$).\n3. **Balanced Chemical Equations**:\nStep 1: $\\text{FeSO}_4 \\cdot 7\\text{H}_2\\text{O}(s) \\xrightarrow{\\Delta} \\text{FeSO}_4(s) + 7\\text{H}_2\\text{O}(g)$ (loses water of crystallization)\nStep 2: $$2\\text{FeSO}_4(s) \\xrightarrow{\\Delta} \\text{Fe}_2\\text{O}_3(s) + \\text{SO}_2(g) + \\text{SO}_3(g)$$",
    socratic_hints: [
      "What is the original color of ferrous sulphate heptahydrate crystals?",
      "What happens when water of crystallization is driven off first by gentle heating?",
      "Which oxide of iron is formed when heating strongly, and what are the two choking sulphur gases?"
    ],
    step_rubric: [
      { step: 1, description: "Observations: color change from green to reddish-brown & burning sulphur smell", marks: 1.0 },
      { step: 2, description: "Naming gases: $\\text{SO}_2$ and $\\text{SO}_3$", marks: 1.0 },
      { step: 3, description: "Correctly balanced equation with physical states", marks: 1.0 }
    ],
    benchmark_time_seconds: 120
  },

  // ==========================================================================
  // MATHEMATICS - CHAPTER 5: ARITHMETIC PROGRESSIONS
  // ==========================================================================
  {
    id: "pyq_10_math_ap_06",
    grade: "10",
    subject: "Mathematics",
    chapter: "Arithmetic Progressions",
    ncert_mapping: {
      chapter_number: 5,
      chapter_name: "Arithmetic Progressions",
      ncert_section: "5.3 Sum of First n Terms of an AP",
      page_reference: "NCERT Class 10 Mathematics, Pages 106–112",
      pyq_tag: "CBSE Board Exam 2023 (Standard) & HPBOSE 2022",
      marks: 4
    },
    difficulty: "HARD",
    question_type: "NUMERICAL",
    bloom_level: "APPLICATION",
    question_latex: "If the sum of the first $m$ terms of an AP is the same as the sum of its first $n$ terms ($S_m = S_n$, where $m \\neq n$), show that the sum of its first $(m + n)$ terms is zero, i.e., $S_{m+n} = 0$.",
    options_latex: [
      { key: "A", latex: "$S_{m+n} = 0$", is_correct: true, distractor_trap: null },
      { key: "B", latex: "$S_{m+n} = m + n$", is_correct: false, distractor_trap: "Confused sum formula with index summation" },
      { key: "C", latex: "$S_{m+n} = -(m + n)$", is_correct: false, distractor_trap: "Sign error during division by $(m - n)$" },
      { key: "D", latex: "$S_{m+n} = 2(m + n)$", is_correct: false, distractor_trap: "Overcounted first term $2a$" }
    ],
    correct_answer_latex: "S_{m+n} = 0",
    solution_latex: "1. Let first term be $a$ and common difference be $d$.\n$$S_m = \\frac{m}{2}[2a + (m - 1)d], \\quad S_n = \\frac{n}{2}[2a + (n - 1)d]$$\n2. Given $S_m = S_n$:\n$$m[2a + (m - 1)d] = n[2a + (n - 1)d]$$\n$$2a(m - n) + d[m(m - 1) - n(n - 1)] = 0$$\n$$2a(m - n) + d[(m^2 - n^2) - (m - n)] = 0$$\n$$2a(m - n) + d(m - n)[(m + n) - 1] = 0$$\n3. Since $m \\neq n$, divide by $(m - n)$:\n$$2a + (m + n - 1)d = 0$$\n4. Now, sum of first $(m + n)$ terms is:\n$$S_{m+n} = \\frac{m+n}{2} \\left[ 2a + (m + n - 1)d \\right] = \\frac{m+n}{2} [0] = 0$$\nHence proved.",
    socratic_hints: [
      "Write the formula for the sum of $k$ terms: $S_k = \\frac{k}{2}[2a + (k-1)d]$.",
      "Equate $S_m = S_n$, multiply out and collect terms containing $2a$ and $d$ separately.",
      "Factor out $(m - n)$ using $m^2 - n^2 = (m - n)(m + n)$."
    ],
    step_rubric: [
      { step: 1, description: "Writing sum formulas for $S_m$ and $S_n$ and equating them", marks: 1.0 },
      { step: 2, description: "Rearranging: $2a(m-n) + d(m-n)(m+n-1) = 0$", marks: 1.5 },
      { step: 3, description: "Dividing by $(m-n)$ to establish $2a + (m+n-1)d = 0$", marks: 0.5 },
      { step: 4, description: "Writing $S_{m+n} = \\frac{m+n}{2}[2a + (m+n-1)d] = 0$", marks: 1.0 }
    ],
    benchmark_time_seconds: 180
  },

  // ==========================================================================
  // SCIENCE - CHAPTER 6: LIFE PROCESSES
  // ==========================================================================
  {
    id: "pyq_10_sci_bio_07",
    grade: "10",
    subject: "Science",
    chapter: "Life Processes",
    ncert_mapping: {
      chapter_number: 6,
      chapter_name: "Life Processes",
      ncert_section: "6.4 Excretion in Human Beings & Structure of Nephron",
      page_reference: "NCERT Class 10 Science, Pages 109–112",
      pyq_tag: "CBSE Board Exam 2024 & HPBOSE 2021",
      marks: 3
    },
    difficulty: "MEDIUM",
    question_type: "MCQ_SINGLE",
    bloom_level: "UNDERSTAND",
    question_latex: "Which of the following events is the first step in the formation of urine inside the nephron?",
    options_latex: [
      { key: "A", latex: "Glomerular Ultrafiltration under high hydrostatic blood pressure", is_correct: true, distractor_trap: null },
      { key: "B", latex: "Selective reabsorption of glucose and amino acids in tubular parts", is_correct: false, distractor_trap: "Reabsorption occurs secondary to ultrafiltration in proximal convoluted tubule" },
      { key: "C", latex: "Active tubular secretion of urea into collecting duct", is_correct: false, distractor_trap: "Tubular secretion happens at the end stage of urine modification" },
      { key: "D", latex: "Concentration of urine exclusively in urinary bladder", is_correct: false, distractor_trap: "Urinary bladder only stores urine temporarily, it does not filter or concentrate" }
    ],
    correct_answer_latex: "A",
    solution_latex: "1. **Glomerular Filtration**: Blood enters the glomerulus via the wider afferent arteriole and leaves via the narrower efferent arteriole, creating high hydrostatic pressure.\n2. This causes **ultrafiltration** of water, glucose, amino acids, salts, and nitrogenous wastes into **Bowman's Capsule**.\n3. **Selective reabsorption** follows as the filtrate passes along the tubular part of the nephron.\n4. Hence, Glomerular Ultrafiltration is the initial and crucial first step.",
    socratic_hints: [
      "Which cup-shaped structure in the nephron collects the initial filtrate?",
      "Why is blood pressure in glomerular capillaries exceptionally high?",
      "Differentiate between ultrafiltration (passive bulk flow) and selective reabsorption."
    ],
    step_rubric: [
      { step: 1, description: "Identifying Glomerulus and Bowman's capsule as site of ultrafiltration", marks: 1.0 },
      { step: 2, description: "Explaining hydrostatic pressure difference between afferent and efferent arterioles", marks: 1.0 },
      { step: 3, description: "Contrasting with secondary tubular reabsorption of useful solutes", marks: 1.0 }
    ],
    benchmark_time_seconds: 60
  },

  // ==========================================================================
  // SCIENCE - CHAPTER 3: METALS AND NON-METALS
  // ==========================================================================
  {
    id: "pyq_10_sci_chem_08",
    grade: "10",
    subject: "Science",
    chapter: "Metals and Non-Metals",
    ncert_mapping: {
      chapter_number: 3,
      chapter_name: "Metals and Non-Metals",
      ncert_section: "3.4.3 Thermit Reaction and Extraction of Metals",
      page_reference: "NCERT Class 10 Science, Pages 51–53",
      pyq_tag: "CBSE Board Exam 2024 & HPBOSE 2023",
      marks: 3
    },
    difficulty: "MEDIUM",
    question_type: "SUBJECTIVE_DERIVATION",
    bloom_level: "APPLICATION",
    question_latex: "Why is the reaction between Iron(III) oxide $\\text{Fe}_2\\text{O}_3$ and Aluminium $\\text{Al}$ powder (known as the **Thermit Reaction**) used to join railway tracks and cracked machine parts? Write the balanced chemical equation and identify the reducing agent.",
    options_latex: [],
    correct_answer_latex: "\\text{Fe}_2\\text{O}_3(s) + 2\\text{Al}(s) \\xrightarrow{\\Delta} 2\\text{Fe}(l) + \\text{Al}_2\\text{O}_3(s) + \\text{Heat}",
    solution_latex: "1. **Thermit Reaction Rationale**: The displacement reaction between Iron(III) oxide and Aluminium is **highly exothermic** (large amount of heat is liberated). The temperature reaches over $2500^\\circ\\text{C}$, causing the iron produced to be in the **molten (liquid) state** $\\text{Fe}(l)$, which flows into the cracks of railway tracks and solidifies upon cooling.\n2. **Balanced Chemical Equation**:\n$$\\text{Fe}_2\\text{O}_3(s) + 2\\text{Al}(s) \\xrightarrow{\\Delta} 2\\text{Fe}(l) + \\text{Al}_2\\text{O}_3(s) + \\text{Heat}$$\n3. **Reducing Agent**: **Aluminium ($\\text{Al}$)** acts as the reducing agent because it has higher chemical reactivity and greater affinity for oxygen than iron, thereby reducing $\\text{Fe}_2\\text{O}_3$ to $\\text{Fe}$.",
    socratic_hints: [
      "In the reactivity series, is Aluminium more reactive than Iron?",
      "Why is the iron obtained in the molten state rather than solid?",
      "Which element loses oxygen and which element gains oxygen in this redox reaction?"
    ],
    step_rubric: [
      { step: 1, description: "Explaining that the reaction is highly exothermic producing molten iron to fill track cracks", marks: 1.0 },
      { step: 2, description: "Correctly balanced equation with physical state of iron as liquid $\\text{Fe}(l)$", marks: 1.0 },
      { step: 3, description: "Identifying Aluminium as the reducing agent with justification based on reactivity", marks: 1.0 }
    ],
    benchmark_time_seconds: 120
  }
];

function getAllClass10Questions() {
  return class10Questions;
}

function getCuratedClass10Question(subject, chapter, board) {
  let matched = class10Questions;
  if (subject) matched = matched.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
  if (chapter) matched = matched.filter(q => q.chapter.toLowerCase().includes(chapter.toLowerCase()));
  if (board) matched = matched.filter(q => q.ncert_mapping.pyq_tag.includes(board));

  if (matched.length > 0) {
    return matched[Math.floor(Math.random() * matched.length)];
  }
  return class10Questions[0];
}

module.exports = {
  class10Questions,
  getAllClass10Questions,
  getCuratedClass10Question
};
