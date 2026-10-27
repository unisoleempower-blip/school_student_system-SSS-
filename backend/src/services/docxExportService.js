// ==============================================================================
// HAPS-AI SCHOLAR ASSISTANT: PLAIN DOCX ASSIGNMENT & WORKSHEET GENERATOR
// Him Academy Public School, Hamirpur (H.P.)
// ==============================================================================
// Generates clean, professional Microsoft Word (.docx) documents for:
// 1. Post-Test Diagnostic Review & Personalized Remedial Assignments
// 2. Formula Recall & Derivation Worksheets ("Write That Formula")
// 3. Class Homework & Chapter Quizzes
// ==============================================================================

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle
} = require('docx');

/**
 * Clean LaTeX mathematical formatting into plain, readable Unicode for Word documents
 */
function cleanLatexForWord(text) {
  if (!text || typeof text !== 'string') return '';
  let str = text;

  // Common LaTeX math symbols to Unicode
  const symbolMap = {
    '\\\\Delta': 'Δ',
    '\\\\theta': 'θ',
    '\\\\alpha': 'α',
    '\\\\beta': 'β',
    '\\\\gamma': 'γ',
    '\\\\lambda': 'λ',
    '\\\\mu': 'μ',
    '\\\\pi': 'π',
    '\\\\rho': 'ρ',
    '\\\\sigma': 'σ',
    '\\\\tau': 'τ',
    '\\\\omega': 'ω',
    '\\\\Omega': 'Ω',
    '\\\\times': ' × ',
    '\\\\cdot': ' · ',
    '\\\\approx': ' ≈ ',
    '\\\\neq': ' ≠ ',
    '\\\\leq': ' ≤ ',
    '\\\\geq': ' ≥ ',
    '\\\\pm': ' ± ',
    '\\\\infty': ' ∞ ',
    '\\\\degree': '°',
    '\\\\circ': '°',
    '\\\\rightarrow': ' → ',
    '\\\\implies': ' ⟹ '
  };

  for (const [tex, uni] of Object.entries(symbolMap)) {
    str = str.replace(new RegExp(tex, 'g'), uni);
  }

  // Convert fractions \frac{num}{den} -> (num / den)
  str = str.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)');
  str = str.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)'); // handle nested

  // Convert \sqrt{x} -> √(x)
  str = str.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');

  // Convert \text{...} -> ...
  str = str.replace(/\\text\{([^{}]+)\}/g, '$1');
  str = str.replace(/\\mathrm\{([^{}]+)\}/g, '$1');
  str = str.replace(/\\mathbf\{([^{}]+)\}/g, '$1');

  // Convert superscripts and subscripts
  str = str.replace(/\^\{([^{}]+)\}/g, '^$1');
  str = str.replace(/\_\{([^{}]+)\}/g, '_$1');

  // Strip math delimiters $ and $$
  str = str.replace(/\$\$/g, ' ');
  str = str.replace(/\$/g, '');

  // Strip extra backslashes before punctuation
  str = str.replace(/\\,/g, ' ');
  str = str.replace(/\\;/g, ' ');
  str = str.replace(/\\quad/g, '   ');
  str = str.replace(/\\qquad/g, '      ');
  str = str.replace(/\\([a-zA-Z]+)/g, '$1');

  // Clean double spaces
  str = str.replace(/[ \t]+/g, ' ').trim();
  return str;
}

/**
 * Generate a complete, elegant Microsoft Word (.docx) file from an assignment or test payload
 */
async function generateAssignmentDocxBuffer(data = {}) {
  const {
    title = 'Student Academic Assignment',
    subject = 'General Science',
    grade = '12',
    section = '12-NonMed',
    studentName = 'Student',
    rollNumber = 'N/A',
    targetExam = 'CBSE / Competitive Exam',
    date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
    performanceSummary = null,
    conceptGaps = [],
    formulaDrills = [],
    remedialQuestions = [],
    questions = [],
    dualActionPlan = null
  } = data;

  const children = [];

  // 1. School Header & Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: 'HIM ACADEMY PUBLIC SCHOOL, HAMIRPUR (H.P.)',
          bold: true,
          size: 28, // 14pt
          color: '1E3A8A'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'Academic Session 2026-27 | AI Scholar Diagnostic & Remedial System',
          italics: true,
          size: 20, // 10pt
          color: '475569'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: cleanLatexForWord(title),
          bold: true,
          size: 26, // 13pt
          color: '0F172A'
        })
      ]
    })
  );

  // 2. Student Metadata Box (Table)
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
  };

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorder,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Student Name: ', bold: true, size: 20 }),
                  new TextRun({ text: studentName, size: 20 })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Roll Number: ', bold: true, size: 20 }),
                  new TextRun({ text: rollNumber, size: 20 })
                ]
              })
            ]
          }),
          new TableCell({
            borders: cellBorder,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Class & Stream: ', bold: true, size: 20 }),
                  new TextRun({ text: `Class ${grade} (${section})`, size: 20 })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Subject / Exam: ', bold: true, size: 20 }),
                  new TextRun({ text: `${subject} | ${targetExam}`, size: 20 })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Date: ', bold: true, size: 20 }),
                  new TextRun({ text: date, size: 20 })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  children.push(metaTable);
  children.push(new Paragraph({ spacing: { after: 200 } }));

  // 3. Diagnostic & Remedial Summary (if available)
  if (performanceSummary || conceptGaps.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 100, after: 80 },
        children: [
          new TextRun({
            text: 'DIAGNOSTIC TELEMETRY & ERROR ANALYSIS',
            bold: true,
            size: 22,
            color: 'B91C1C'
          })
        ]
      })
    );

    if (performanceSummary) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: `• Test Score / Accuracy: `, bold: true }),
            new TextRun({ text: `${performanceSummary.accuracyPercentage || 0}% (${performanceSummary.correctCount || 0} Correct / ${performanceSummary.totalQuestions || 0} Questions)` }),
            new TextRun({ text: ` | Remedial Focus Areas: `, bold: true }),
            new TextRun({ text: `${performanceSummary.wrongCount || conceptGaps.length || 0} Concept Gaps Identified` })
          ]
        })
      );
    }

    if (conceptGaps.length > 0) {
      conceptGaps.forEach((gap, idx) => {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            bullet: { level: 0 },
            children: [
              new TextRun({ text: `Gap ${idx + 1} [${gap.subtopic || gap.topic}]: `, bold: true }),
              new TextRun({ text: `${gap.diagnosedTrap || 'Formula application error'} ` }),
              new TextRun({ text: `→ Remedy: ${gap.recommendedRemedy || 'Formula revision'}`, italics: true, color: '0284C7' })
            ]
          })
        );
      });
    }

    children.push(new Paragraph({ spacing: { after: 180 } }));
  }

  // 4. PART 1: FORMULA RECALL & DERIVATION DRILLS ("WRITE THAT FORMULA")
  if (formulaDrills && formulaDrills.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: 'PART 1: FORMULA RECALL & DERIVATION DRILLS ("Write That Formula")',
            bold: true,
            size: 22,
            color: '4338CA'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: 'Directions: Write the exact mathematical equation for each concept below from memory. Follow Cartesian sign conventions and state each variable with its SI unit.',
            italics: true,
            size: 18,
            color: '64748B'
          })
        ]
      })
    );

    formulaDrills.forEach((f, idx) => {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({ text: `Drill 1.${idx + 1}: ${f.formulaName || f.subtopic}`, bold: true, size: 20 }),
            new TextRun({ text: ` (${f.subtopic})`, italics: true, color: '64748B' })
          ]
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `Prompt: `, bold: true }),
            new TextRun({ text: cleanLatexForWord(f.prompt || 'State the standard mathematical relationship:') })
          ]
        }),
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `Write Formula Here: `, bold: true, color: '334155' }),
            new TextRun({ text: `____________________________________________________________________` })
          ]
        })
      );

      if (f.rulesAndTraps || f.signRules) {
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `⚠️ Common Traps & Sign Rules: `, bold: true, color: 'DC2626' }),
              new TextRun({ text: cleanLatexForWord(f.rulesAndTraps || f.signRules), italics: true })
            ]
          })
        );
      }
    });

    children.push(new Paragraph({ spacing: { after: 180 } }));
  }

  // 5. PART 2: TARGETED PRACTICE QUESTIONS ("QUESTIONS ON THAT FORMULA")
  const allPracticeQuestions = remedialQuestions.length > 0 ? remedialQuestions : questions;

  if (allPracticeQuestions && allPracticeQuestions.length > 0) {
    const sectionTitle = remedialQuestions.length > 0
      ? 'PART 2: TARGETED REMEDIAL QUESTIONS ("Questions on That Formula")'
      : 'ACADEMIC QUESTIONS & MULTIPLE-CHOICE PRACTICE';

    children.push(
      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({
            text: sectionTitle,
            bold: true,
            size: 22,
            color: '047857'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({
            text: 'Directions: Solve each question completely in the workspace provided. Select the correct option and show step-by-step mathematical reasoning.',
            italics: true,
            size: 18,
            color: '64748B'
          })
        ]
      })
    );

    allPracticeQuestions.forEach((q, idx) => {
      const qNum = idx + 1;
      const qText = cleanLatexForWord(q.question_latex || q.questionLatex || q.questionText || '');
      const topicLabel = q.subtopic || q.topic || q.chapter || subject;

      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          children: [
            new TextRun({ text: `Q${qNum}. [${topicLabel}] `, bold: true, size: 20, color: '1E293B' }),
            new TextRun({ text: qText, size: 20 })
          ]
        })
      );

      // Render Options A, B, C, D
      const opts = (q.options_latex && q.options_latex.length > 0)
        ? q.options_latex
        : (q.options && q.options.length > 0 ? q.options : []);

      if (opts.length > 0) {
        opts.forEach(opt => {
          const optKey = opt.key || '•';
          const optText = cleanLatexForWord(opt.latex || opt.text || '');
          children.push(
            new Paragraph({
              spacing: { after: 30 },
              indent: { left: 400 },
              children: [
                new TextRun({ text: `(${optKey}) `, bold: true }),
                new TextRun({ text: optText })
              ]
            })
          );
        });
      }

      // Workspace lines for student derivation
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({ text: 'Student Working Space / Derivation:', italics: true, color: '94A3B8', size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { after: 30 },
          children: [new TextRun({ text: '_________________________________________________________________________________', color: 'E2E8F0' })]
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: '_________________________________________________________________________________', color: 'E2E8F0' })]
        })
      );
    });
  }

  // 6. PART 3: DUAL ACTION DIRECTIVES (HOSTEL & PARENT ACTIONS)
  if (dualActionPlan) {
    children.push(
      new Paragraph({
        spacing: { before: 140, after: 80 },
        children: [
          new TextRun({
            text: 'PART 3: DUAL ACTION DIRECTIVES (RESIDENTIAL & HOME ACTION)',
            bold: true,
            size: 22,
            color: '9333EA'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: '🏠 School Hostel Prep Directive (7:30 PM Study Hall): ', bold: true, color: '1E40AF' }),
          new TextRun({ text: dualActionPlan.hostelPrepAction?.directive || 'Conduct 15-minute 1-on-1 pedagogical review.' })
        ]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({ text: '👨‍👩‍👧 Parent Home Discussion Directive (Weekend Feynman Review): ', bold: true, color: '059669' }),
          new TextRun({ text: dualActionPlan.parentHomeAction?.directive || 'Ask student to explain core concept for 5 minutes during weekend call.' })
        ]
      })
    );
  }

  // 7. Signature Footer
  children.push(
    new Paragraph({ spacing: { before: 200 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: '_______________________________', color: '94A3B8' })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Subject Teacher / Faculty Signature', bold: true, size: 18 })
                  ]
                })
              ]
            }),
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: '_______________________________', color: '94A3B8' })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Hostel Tutor / Parent Signature', bold: true, size: 18 })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 in
              right: 720,
              bottom: 720,
              left: 720
            }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

module.exports = {
  cleanLatexForWord,
  generateAssignmentDocxBuffer
};
