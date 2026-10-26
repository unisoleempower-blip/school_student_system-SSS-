// ==============================================================================
// HAPS-AI SCHOLAR ASSISTANT: PERSONALIZED REMEDIAL ASSIGNMENT ENGINE
// Generates individualized remedial assignments based on student test telemetry,
// exact wrong answers, hesitation lag, distractor traps, and formula misconceptions.
// ==============================================================================

const FORMULA_REPOSITORY = {
  'Spherical Mirrors': {
    name: 'Mirror Formula & New Cartesian Sign Conventions',
    latex: '\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}',
    magnificationLatex: 'm = -\\frac{v}{u} = \\frac{h_i}{h_o}',
    prompt: 'Write the Mirror Formula relating focal length f, image distance v, and object distance u:',
    canonicalPattern: /(1\s*\/\s*f\s*=\s*1\s*\/\s*v\s*\+\s*1\s*\/\s*u)|(1\s*\/\s*v\s*\+\s*1\s*\/\s*u\s*=\s*1\s*\/\s*f)|(\\frac\{1\}\{f\}\s*=\s*\\frac\{1\}\{v\}\s*\+\s*\\frac\{1\}\{u\})/i,
    signRules: 'Concave mirror: f is always NEGATIVE (f < 0). Object distance u is always NEGATIVE (u < 0). Real image: v is NEGATIVE (v < 0).',
    practiceQuestion: {
      id: 'rem_q_mirror_01',
      topic: 'Light – Reflection and Refraction',
      subtopic: 'Spherical Mirrors',
      questionLatex: 'An object is placed at $u = -20\\,\\text{cm}$ in front of a concave mirror of focal length $f = -10\\,\\text{cm}$. Calculate the position $v$ of the image formed.',
      options: [
        { key: 'A', latex: '$v = -20\\,\\text{cm}$ (at Center of Curvature $C$)', isCorrect: true },
        { key: 'B', latex: '$v = +20\\,\\text{cm}$ (behind mirror)', isCorrect: false, trap: 'Forgot negative sign for real image in front of mirror' },
        { key: 'C', latex: '$v = -10\\,\\text{cm}$ (at focus)', isCorrect: false, trap: 'Confused object location with focal point' },
        { key: 'D', latex: '$v = -6.67\\,\\text{cm}$', isCorrect: false, trap: 'Added focal length instead of subtracting in formula inversion' }
      ],
      correctAnswer: 'A',
      solutionLatex: 'Using mirror formula: $$\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u} \\implies \\frac{1}{-10} = \\frac{1}{v} + \\frac{1}{-20}$$ isolates to: $$\\frac{1}{v} = -\\frac{1}{10} + \\frac{1}{20} = -\\frac{1}{20} \\implies v = -20\\,\\text{cm}.$$ The image is real, inverted, and located at $C$.'
    }
  },

  'Refraction & Snell Law': {
    name: "Snell's Law & Refractive Index Velocity Equation",
    latex: 'n = \\frac{c}{v} \\quad \\text{and} \\quad n_1 \\sin(i) = n_2 \\sin(r)',
    prompt: 'Write the formula for refractive index n of a medium in terms of speed of light in vacuum c and speed in medium v:',
    canonicalPattern: /(n\s*=\s*c\s*\/\s*v)|(n\s*=\s*\\frac\{c\}\{v\})|(v\s*=\s*c\s*\/\s*n)/i,
    signRules: 'Refractive index is dimensionless (n > 1 for dense optical media). As n increases, speed of light v decreases proportionally.',
    practiceQuestion: {
      id: 'rem_q_snell_01',
      topic: 'Light – Reflection and Refraction',
      subtopic: 'Refraction & Snell Law',
      questionLatex: 'A beam of light travels from vacuum into dense flint glass of refractive index $n = 1.5$. If $c = 3.0 \\times 10^8\\,\\text{m/s}$, what is the speed of light in the glass?',
      options: [
        { key: 'A', latex: '$v = 2.0 \\times 10^8\\,\\text{m/s}$', isCorrect: true },
        { key: 'B', latex: '$v = 4.5 \\times 10^8\\,\\text{m/s}$', isCorrect: false, trap: 'Multiplied by n instead of dividing by n' },
        { key: 'C', latex: '$v = 1.5 \\times 10^8\\,\\text{m/s}$', isCorrect: false, trap: 'Substituted refractive index directly as velocity' },
        { key: 'D', latex: '$v = 2.25 \\times 10^8\\,\\text{m/s}$', isCorrect: false, trap: 'Used water refractive index (1.33) calculation' }
      ],
      correctAnswer: 'A',
      solutionLatex: 'Using $n = \\frac{c}{v} \\implies v = \\frac{c}{n} = \\frac{3.0 \\times 10^8\\,\\text{m/s}}{1.5} = 2.0 \\times 10^8\\,\\text{m/s}$.'
    }
  },

  'Joule Heating & Resistance': {
    name: "Joule's Heating Law with SI Units Transformation",
    latex: 'H = I^2 R t = \\frac{V^2}{R} t = V I t',
    prompt: "Write Joule's Heating formula relating heat energy H with voltage V, resistance R, and time t:",
    canonicalPattern: /(H\s*=\s*I\^?2\s*\*?\s*R\s*\*?\s*t)|(H\s*=\s*V\^?2\s*\/\s*R\s*\*?\s*t)|(H\s*=\s*V\s*\*?\s*I\s*\*?\s*t)|(\\frac\{V\^?2\}\{R\}\s*\*?\s*t)/i,
    signRules: 'CRITICAL RULE: Time t MUST be converted to seconds (1 hour = 3600 seconds, 1 minute = 60 seconds). Never leave time in hours or minutes!',
    practiceQuestion: {
      id: 'rem_q_joule_01',
      topic: 'Electricity',
      subtopic: 'Joule Heating & Resistance',
      questionLatex: 'An electric immersion heater of resistance $R = 100\\,\\Omega$ is operated at $V = 200\\,\\text{V}$ for $t = 10\\,\\text{minutes}$. Calculate the heat dissipated in Joules.',
      options: [
        { key: 'A', latex: '$H = 2.4 \\times 10^5\\,\\text{J}$', isCorrect: true },
        { key: 'B', latex: '$H = 4.0 \\times 10^3\\,\\text{J}$', isCorrect: false, trap: 'Forgot to convert 10 minutes to seconds ($600\\,\\text{s}$)' },
        { key: 'C', latex: '$H = 4.0 \\times 10^5\\,\\text{J}$', isCorrect: false, trap: 'Used $t = 1000\\,\\text{s}$ instead of $600\\,\\text{s}$' },
        { key: 'D', latex: '$H = 2.4 \\times 10^6\\,\\text{J}$', isCorrect: false, trap: 'Extra factor of 10 in voltage squared multiplication' }
      ],
      correctAnswer: 'A',
      solutionLatex: 'First convert time to seconds: $t = 10 \\times 60 = 600\\,\\text{s}$. Then: $$H = \\frac{V^2}{R} t = \\frac{(200)^2}{100} \\times 600 = \\frac{40000}{100} \\times 600 = 400 \\times 600 = 240,000\\,\\text{J} = 2.4 \\times 10^5\\,\\text{J}$$.'
    }
  },

  'Rotational Motion': {
    name: "Centripetal Torque & Angular Acceleration Relation",
    latex: '\\vec{\\tau} = \\vec{r} \\times \\vec{F} = I \\vec{\\alpha} \\quad \\text{and} \\quad \\tau_{\\text{centripetal}} = 0',
    prompt: 'Write the torque formula relating position vector r and force vector F:',
    canonicalPattern: /(tau\s*=\s*r\s*x\s*F)|(\\tau\s*=\s*\\vec\{r\}\s*\\times\s*\\vec\{F\})|(\\tau\s*=\s*I\s*\\alpha)|(tau\s*=\s*I\s*\*?\s*alpha)/i,
    signRules: 'Torque requires perpendicular distance: \\tau = r F \\sin(\\theta). For centripetal forces directed towards center, angle \\theta = 180^\\circ \\implies \\sin(180^\\circ) = 0, so centripetal torque is identically zero.',
    practiceQuestion: {
      id: 'rem_q_rot_01',
      topic: 'Rotational Motion',
      subtopic: 'Rotational Motion',
      questionLatex: 'A solid uniform cylinder of mass $M$ and radius $R$ is rotated by an applied tangential force $F$ at its rim. What is its angular acceleration $\\alpha$ if $I = \\frac{1}{2} M R^2$?',
      options: [
        { key: 'A', latex: '$\\alpha = \\frac{2F}{MR}$', isCorrect: true },
        { key: 'B', latex: '$\\alpha = \\frac{F}{MR}$', isCorrect: false, trap: 'Treated cylinder as hollow thin shell ($I=MR^2$)' },
        { key: 'C', latex: '$\\alpha = \\frac{F}{2MR}$', isCorrect: false, trap: 'Multiplied instead of dividing by moment of inertia constant' },
        { key: 'D', latex: '$\\alpha = \\frac{4F}{MR}$', isCorrect: false, trap: 'Incorrectly squared the radius factor' }
      ],
      correctAnswer: 'A',
      solutionLatex: 'Torque $\\tau = F R$. Using $\\tau = I \\alpha \\implies F R = \\left(\\frac{1}{2} M R^2\\right) \\alpha \\implies \\alpha = \\frac{2F}{MR}$.'
    }
  },

  'Chemical Thermodynamics': {
    name: 'Standard Gibbs Free Energy & Cell Potential',
    latex: '\\Delta G^\\circ = -n F E^\\circ_{\\text{cell}}',
    prompt: 'Write the relation between standard Gibbs free energy change ΔG°, electron transfer n, Faraday constant F, and cell potential E°:',
    canonicalPattern: /(delta\s*G\s*=\s*-?\s*n\s*\*?\s*F\s*\*?\s*E)|(\\Delta\s*G\s*=\s*-nFE)/i,
    signRules: 'Spontaneous galvanic cell processes require E° > 0 and ΔG° < 0. Don\'t forget the negative sign in ΔG° = -nFE°!',
    practiceQuestion: {
      id: 'rem_q_thermo_01',
      topic: 'Chemical Thermodynamics',
      subtopic: 'Chemical Thermodynamics',
      questionLatex: 'For a galvanic cell reaction with $n = 2$ electrons transferred, $E^\\circ_{\\text{cell}} = +1.10\\,\\text{V}$. Taking $F = 96500\\,\\text{C/mol}$, calculate $\\Delta G^\\circ$ in $\\text{kJ/mol}$.',
      options: [
        { key: 'A', latex: '$\\Delta G^\\circ = -212.3\\,\\text{kJ/mol}$', isCorrect: true },
        { key: 'B', latex: '$\\Delta G^\\circ = +212.3\\,\\text{kJ/mol}$', isCorrect: false, trap: 'Forgot the negative sign in $\\Delta G^\\circ = -nFE^\\circ$' },
        { key: 'C', latex: '$\\Delta G^\\circ = -106.15\\,\\text{kJ/mol}$', isCorrect: false, trap: 'Used $n = 1$ instead of $n = 2$ electrons transferred' },
        { key: 'D', latex: '$\\Delta G^\\circ = -424.6\\,\\text{kJ/mol}$', isCorrect: false, trap: 'Multiplied by 4 instead of 2' }
      ],
      correctAnswer: 'A',
      solutionLatex: '$$\\Delta G^\\circ = -n F E^\\circ = -(2) \\times (96500) \\times (1.10) = -212300\\,\\text{J/mol} = -212.3\\,\\text{kJ/mol}$$.'
    }
  },

  'Quadratic Equations': {
    name: 'Quadratic Discriminant & Nature of Roots',
    latex: 'D = b^2 - 4ac \\quad \\text{and} \\quad x = \\frac{-b \\pm \\sqrt{D}}{2a}',
    prompt: 'Write the discriminant formula D for the quadratic equation ax² + bx + c = 0:',
    canonicalPattern: /(D\s*=\s*b\^?2\s*-\s*4\s*\*?\s*a\s*\*?\s*c)|(b\^?2\s*-\s*4ac)/i,
    signRules: 'If D > 0: two distinct real roots. If D = 0: two equal real roots. If D < 0: no real roots (complex conjugates).',
    practiceQuestion: {
      id: 'rem_q_quad_01',
      topic: 'Mathematics',
      subtopic: 'Quadratic Equations',
      questionLatex: 'Find the discriminant $D$ for the quadratic equation $2x^2 - 4x + 3 = 0$ and state the nature of its roots.',
      options: [
        { key: 'A', latex: '$D = -8$ (No real roots)', isCorrect: true },
        { key: 'B', latex: '$D = +8$ (Two distinct real roots)', isCorrect: false, trap: 'Subtracted in reverse: $4ac - b^2$' },
        { key: 'C', latex: '$D = 40$', isCorrect: false, trap: 'Added $4ac$ instead of subtracting: $b^2 + 4ac$' },
        { key: 'D', latex: '$D = 0$ (Equal roots)', isCorrect: false, trap: 'Sign error in calculation' }
      ],
      correctAnswer: 'A',
      solutionLatex: '$$D = b^2 - 4ac = (-4)^2 - 4(2)(3) = 16 - 24 = -8$$. Since $D < 0$, the equation has no real roots.'
    }
  }
};

/**
 * Generate a personalized remedial assignment tailored specifically to
 * what the student got wrong, their time-lag, distractor trap, and formula errors.
 */
function generatePersonalizedRemedialAssignment({
  studentId = 'b0000000-0000-0000-0000-000000000001',
  studentName = 'Aryan Sharma',
  rollNumber = '11-S-24',
  assessmentId = 'asgn_10_sci_01',
  assessmentTitle = 'Class 10 Science: Light – Spherical Mirrors & Derivations',
  questionBreakdown = []
}) {
  const timestamp = Date.now();
  const assignmentId = `rem_${assessmentId}_${studentId}_${timestamp}`;

  // 1. Separate questions into correct and wrong/unattempted
  const correctQuestions = questionBreakdown.filter(q => q.isCorrect === true);
  const wrongQuestions = questionBreakdown.filter(q => !q.isCorrect);

  const totalQuestions = questionBreakdown.length || 3;
  const wrongCount = wrongQuestions.length;
  const correctCount = correctQuestions.length;
  const accuracyPercentage = Math.round((correctCount / totalQuestions) * 100);

  // 2. Identify Weak Concepts and Formula Gaps
  const formulaDrills = [];
  const remedialQuestions = [];
  const conceptGaps = [];

  // If student made errors, map to exact formula drills
  if (wrongQuestions.length > 0) {
    for (const wq of wrongQuestions) {
      const subtopic = wq.subtopic || 'Spherical Mirrors';
      const repoEntry = FORMULA_REPOSITORY[subtopic] || FORMULA_REPOSITORY['Spherical Mirrors'];

      conceptGaps.push({
        questionIndex: wq.questionIndex,
        subtopic,
        topic: wq.topic || 'Science',
        studentAnswer: wq.selectedOption || 'Unattempted',
        correctAnswer: wq.correctAnswer,
        timeSpentSeconds: wq.timeSpentSeconds || 45,
        benchmarkSeconds: wq.benchmarkSeconds || 90,
        diagnosedTrap: wq.mistakeClassification?.explanation || 'Incorrect formula application or sign rule error.',
        recommendedRemedy: `Master formula: ${repoEntry.name}`
      });

      // Avoid duplicate formula drills for the same subtopic
      if (!formulaDrills.some(f => f.subtopic === subtopic)) {
        formulaDrills.push({
          drillId: `fdrill_${subtopic.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${timestamp}`,
          subtopic,
          formulaName: repoEntry.name,
          prompt: repoEntry.prompt,
          expectedLatex: repoEntry.latex,
          canonicalPattern: repoEntry.canonicalPattern.toString(),
          rulesAndTraps: repoEntry.signRules,
          status: 'PENDING_SUBMISSION'
        });

        remedialQuestions.push({
          ...repoEntry.practiceQuestion,
          drillOrigin: `Targeted practice for ${subtopic} missed in Q${wq.questionIndex}`
        });
      }
    }
  } else {
    // Student scored 100%! Provide High-Yield Olympiad Extension Drill
    conceptGaps.push({
      subtopic: 'Advanced Olympiad & JEE Extension',
      diagnosedTrap: 'None - Perfect Score Achieved!',
      recommendedRemedy: 'Practice complex non-routine multi-concept derivations.'
    });

    const rotEntry = FORMULA_REPOSITORY['Rotational Motion'];
    formulaDrills.push({
      drillId: `fdrill_advanced_${timestamp}`,
      subtopic: 'Rotational Motion',
      formulaName: rotEntry.name,
      prompt: rotEntry.prompt,
      expectedLatex: rotEntry.latex,
      canonicalPattern: rotEntry.canonicalPattern.toString(),
      rulesAndTraps: rotEntry.signRules,
      status: 'PENDING_SUBMISSION'
    });
    remedialQuestions.push(rotEntry.practiceQuestion);
  }

  // 3. Dual-Action Plan for Teachers and Parents
  const dualActionPlan = {
    hostelPrepAction: {
      faculty: 'Residential Physics & Math Proctor',
      timeSlot: '7:30 PM – 8:00 PM Evening Study',
      directive: wrongCount > 0 
        ? `Have ${studentName.split(' ')[0]} write out ${formulaDrills.map(f => f.formulaName).join(' & ')} on whiteboard and solve the 2 targeted remedial questions.`
        : `Introduce advanced Olympiad derivation on non-inertial frames to stretch ${studentName.split(' ')[0]}'s potential.`,
      priority: wrongCount > 1 ? 'HIGH' : 'NORMAL'
    },
    parentHomeAction: {
      directive: wrongCount > 0
        ? `Ask ${studentName.split(' ')[0]} to explain the sign conventions of ${formulaDrills[0].formulaName} during Sunday call (Feynman technique).`
        : `Celebrate ${studentName.split(' ')[0]}'s 100% score and encourage consistent revision routine.`,
      focusConcept: formulaDrills[0]?.subtopic || 'Optics & Mechanics'
    }
  };

  return {
    success: true,
    assignmentId,
    title: `Personalized Remedial Assignment: ${formulaDrills.map(f => f.subtopic).join(' & ')}`,
    student: {
      id: studentId,
      name: studentName,
      rollNumber,
      sourceAssessmentId: assessmentId,
      sourceAssessmentTitle: assessmentTitle
    },
    performanceSummary: {
      totalQuestions,
      correctCount,
      wrongCount,
      accuracyPercentage,
      totalTimeSpentSeconds: questionBreakdown.reduce((acc, q) => acc + (q.timeSpentSeconds || 0), 0)
    },
    conceptGaps,
    formulaDrills,
    remedialQuestions,
    dualActionPlan,
    createdAt: new Date().toISOString()
  };
}

/**
 * Validates a student's written formula string against canonical patterns
 */
function verifyStudentFormula(subtopic, studentInput) {
  if (!studentInput || typeof studentInput !== 'string') {
    return {
      isValid: false,
      message: 'Please write the formula in the input box before verifying.',
      modelFormulaLatex: null
    };
  }

  const cleanInput = studentInput.trim().replace(/\s+/g, ' ');
  const repoEntry = FORMULA_REPOSITORY[subtopic] || FORMULA_REPOSITORY['Spherical Mirrors'];

  const isMatch = repoEntry.canonicalPattern.test(cleanInput);

  if (isMatch) {
    return {
      isValid: true,
      message: `🎉 Flawless! You have accurately written the ${repoEntry.name}.`,
      modelFormulaLatex: repoEntry.latex,
      signRules: repoEntry.signRules
    };
  }

  return {
    isValid: false,
    message: `Not quite right. Check variable placement or sign rules for ${repoEntry.name}.`,
    hint: `Correct mathematical structure: ${repoEntry.latex}`,
    modelFormulaLatex: repoEntry.latex,
    signRules: repoEntry.signRules
  };
}

module.exports = {
  FORMULA_REPOSITORY,
  generatePersonalizedRemedialAssignment,
  verifyStudentFormula
};
