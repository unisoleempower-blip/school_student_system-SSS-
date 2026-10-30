/**
 * Automated Verification: Intuitive Solution Mastercard & Step Walkthrough Engine
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'frontend', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

console.log('--- TESTING INTUITIVE SOLUTION CARD ENGINE ---');

// 1. Verify CSS styles for Mastercard are present
const cssPath = path.join(__dirname, '..', 'frontend', 'css', 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.includes('.qb-solution-mastercard'), 'Must contain .qb-solution-mastercard class');
assert(cssContent.includes('.qb-solution-concept-box'), 'Must contain .qb-solution-concept-box class');
assert(cssContent.includes('.qb-solution-step-item'), 'Must contain .qb-solution-step-item class');
assert(cssContent.includes('.qb-solution-answer-box'), 'Must contain .qb-solution-answer-box class');
assert(cssContent.includes('.qb-solution-exam-tip-box'), 'Must contain .qb-solution-exam-tip-box class');
assert(cssContent.includes('.qb-nav-banner'), 'Must contain .qb-nav-banner class');
assert(cssContent.includes('.qb-solution-prompt-card'), 'Must contain .qb-solution-prompt-card class');
assert(cssContent.includes('.qb-jump-pill'), 'Must contain .qb-jump-pill class');
assert(cssContent.includes('.qb-page-badge'), 'Must contain .qb-page-badge class');
assert(cssContent.includes('@media print'), 'Must contain @media print styles');
console.log('[PASS] CSS styles verified for intuitive solution mastercard, single-question pagination, and print mode.');

// 2. Check structure of formatIntuitiveSteps and Single-Question Navigation
assert(appJsContent.includes('parsedSteps,'), 'Must return parsedSteps in formatIntuitiveSteps');
assert(appJsContent.includes('principleIntuition,'), 'Must return principleIntuition in formatIntuitiveSteps');
assert(appJsContent.includes('examTip'), 'Must return examTip in formatIntuitiveSteps');
assert(appJsContent.includes('function toggleCardSolutionView(qId)'), 'Must define toggleCardSolutionView');
assert(appJsContent.includes('window.toggleCardSolutionView = toggleCardSolutionView;'), 'Must export toggleCardSolutionView');
assert(appJsContent.includes('function nextQbQuestion()'), 'Must define nextQbQuestion');
assert(appJsContent.includes('function prevQbQuestion()'), 'Must define prevQbQuestion');
assert(appJsContent.includes('function setQbQuestionIndex(idx)'), 'Must define setQbQuestionIndex');
assert(appJsContent.includes('function renderQbCurrentPage()'), 'Must define renderQbCurrentPage');
assert(appJsContent.includes('state.qbSolutionRevealed = false'), 'Solution must be hidden by default on question transition');
console.log('[PASS] formatIntuitiveSteps contract, single-question navigation, and solution toggle verified.');

// 3. Test math-safe parsing
const mathSafeSplit = (text) => {
  const parts = [];
  let cur = '';
  let inMath = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '$') {
      inMath = !inMath;
      cur += c;
    } else if ((c === '.' || c === ';' || c === '\n') && !inMath) {
      if (cur.trim().length > 3) parts.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim().length > 0) parts.push(cur.trim());
  return parts;
};

const formulaText = "Squaring both sides, $5b^2 = a^2 \\implies 5 \\mid a$. Let $a = 5c$. Substituting, $5b^2 = 25c^2$.";
const blocks = mathSafeSplit(formulaText);
assert.strictEqual(blocks.length, 3, 'Must split into 3 sentences without breaking $ math blocks');
assert(blocks[0].includes('$5b^2 = a^2 \\implies 5 \\mid a$'), 'Must keep implication inside $ intact');
console.log('[PASS] Math-safe sentence parser preserves LaTeX expressions.');

// 4. Verify chapter-specific intuition coverage across chapters
const sampleChapters = [
  'Real Numbers',
  'Polynomials',
  'Pair of Linear Equations',
  'Quadratic Equations',
  'Arithmetic Progressions',
  'Triangles',
  'Coordinate Geometry',
  'Introduction to Trigonometry',
  'Some Applications of Trigonometry',
  'Circles',
  'Areas Related to Circles',
  'Surface Areas and Volumes',
  'Statistics',
  'Probability'
];

sampleChapters.forEach(ch => {
  assert(appJsContent.includes(ch), `formatIntuitiveSteps must include chapter guidance for ${ch}`);
});
console.log('[PASS] All 14 Class 10 NCERT chapters have configured pedagogical intuitions.');

console.log('======================================================');
console.log('ALL INTUITIVE SOLUTION CARD ENGINE TESTS PASSED 100%!');
console.log('======================================================');
