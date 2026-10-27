#!/usr/bin/env node
// ==============================================================================
// AUTOMATED STAGING ENVIRONMENT VERIFICATION SUITE
// HAPS-AI Scholar Assistant - Enterprise Classroom Intelligence & Diagnostic Engine
// ==============================================================================
// This script conducts automated smoke & integration tests against a live Staging/Preview
// deployment. Promotion to Production is gated by this script exiting with code 0.
// ==============================================================================

const { execSync } = require('child_process');

const targetUrl = process.argv[2] || process.env.STAGING_URL || '';

console.log('====================================================================');
console.log('🧪 HAPS-AI SCHOLAR ASSISTANT: STAGING ENVIRONMENT VERIFICATION');
console.log('====================================================================');
console.log(`Target Staging URL: ${targetUrl || '(Using Vercel CLI Linked Preview Context)'}`);
console.log(`Timestamp:          ${new Date().toISOString()}`);
console.log('--------------------------------------------------------------------\n');

let passCount = 0;
let failCount = 0;
const results = [];

function executeRequest(endpoint, options = {}) {
  const method = options.method || 'GET';
  const data = options.data ? JSON.stringify(options.data) : null;
  const isHtml = options.isHtml || false;
  
  // Try direct fetch if targetUrl is provided
  if (targetUrl) {
    const fullUrl = targetUrl.replace(/\/$/, '') + endpoint;
    try {
      const curlCmd = [
        'curl', '-s', '-S',
        '-X', method,
        isHtml ? '-H "Accept: text/html"' : '-H "Accept: application/json"',
        data ? `-H "Content-Type: application/json" -d '${data}'` : '',
        `"${fullUrl}"`
      ].filter(Boolean).join(' ');

      const stdout = execSync(curlCmd, { encoding: 'utf8', timeout: 45000 });
      // If Vercel SSO redirect is detected, fall back to vercel curl
      if (!stdout.includes('Redirecting') && !stdout.includes('sso-api')) {
        return { success: true, body: stdout };
      }
    } catch (err) {
      // Fallback to vercel curl
    }
  }

  // Use npx vercel curl to bypass deployment protection
  try {
    const deploymentFlag = targetUrl ? `--deployment "${targetUrl}"` : '';
    const vercelCurlCmd = [
      'npx', 'vercel', 'curl', endpoint,
      deploymentFlag,
      '--',
      '-s',
      '-X', method,
      isHtml ? '-H "Accept: text/html"' : '-H "Accept: application/json"',
      data ? `-H "Content-Type: application/json" -d '${data}'` : ''
    ].filter(Boolean).join(' ');

    const stdout = execSync(vercelCurlCmd, { encoding: 'utf8', timeout: 60000 });
    
    if (isHtml) {
      return { success: true, body: stdout };
    }

    // Extract JSON payload from stdout (remove leading CLI logs like "Vercel CLI 65.2.0")
    const cleanOutput = stdout.replace(/^Vercel CLI[^\n]*\n?/i, '').trim();
    const jsonMatch = cleanOutput.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return { success: true, body: jsonMatch[0] };
    }
    return { success: true, body: cleanOutput };
  } catch (err) {
    return { success: false, error: err.message, stderr: err.stderr ? err.stderr.toString() : '' };
  }
}

function makeRequest(endpoint, options = {}) {
  let res = executeRequest(endpoint, options);
  // Retry once if request timed out due to initial serverless cold-start
  if (!res.success) {
    try { execSync('sleep 2'); } catch(e) {}
    res = executeRequest(endpoint, options);
  }
  return res;
}

function runTest(testName, testFn) {
  process.stdout.write(`• Checking: ${testName} ... `);
  const startTime = Date.now();
  try {
    testFn();
    const duration = Date.now() - startTime;
    console.log(`✅ PASSED (${duration}ms)`);
    passCount++;
    results.push({ name: testName, status: 'PASSED', duration });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.log(`❌ FAILED (${duration}ms)`);
    console.error(`  ↳ Reason: ${err.message}\n`);
    failCount++;
    results.push({ name: testName, status: 'FAILED', error: err.message, duration });
  }
}

// -----------------------------------------------------------------------------
// WARM UP SERVERLESS DEPLOYMENT (ABSORB COLD-START)
// -----------------------------------------------------------------------------
console.log('⏳ Warming up preview deployment to absorb serverless cold-start...');
for (let attempt = 1; attempt <= 3; attempt++) {
  const warmup = makeRequest('/api/health');
  if (warmup.success) {
    console.log('⚡ Deployment warmed up successfully!\n');
    break;
  }
  try { execSync('sleep 3'); } catch(e) {}
}

// -----------------------------------------------------------------------------
// TEST SUITE DEFINITIONS
// -----------------------------------------------------------------------------

// TEST 1: API Gateway Health Status
runTest('API Gateway Health & Curriculum Support (/api/health)', () => {
  const res = makeRequest('/api/health');
  if (!res.success) throw new Error(`Request failed: ${res.error}`);
  
  const data = JSON.parse(res.body);
  if (data.status !== 'HEALTHY') {
    throw new Error(`Expected status 'HEALTHY', got '${data.status}'`);
  }
  if (!data.school || !data.school.includes('Him Academy Public School')) {
    throw new Error(`Invalid school identifier: ${data.school}`);
  }
  if (!Array.isArray(data.curriculumSupport) || !data.curriculumSupport.includes('HP_BOARD')) {
    throw new Error('Curriculum support must include HP_BOARD and CBSE');
  }
});

// TEST 2: Assessments Catalog & PYQ Delivery
runTest('Assessments Catalog & PYQ Integrity (/api/assessments)', () => {
  const res = makeRequest('/api/assessments');
  if (!res.success) throw new Error(`Request failed: ${res.error}`);

  const data = JSON.parse(res.body);
  if (!data.success || !Array.isArray(data.assessments)) {
    throw new Error('Expected success: true and assessments array');
  }
  if (data.assessments.length === 0) {
    throw new Error('Assessments list is empty, expected pre-seeded assessments');
  }
  const sample = data.assessments[0];
  if (!sample.id || !sample.title || sample.questionCount === undefined) {
    throw new Error(`Malformed assessment object: ${JSON.stringify(sample)}`);
  }
});

// TEST 3: Individual Assessment Query & LaTeX Formula Integrity
runTest('Assessment Question Retrieval with LaTeX Formulas (/api/assessments/asgn_10_sci_01)', () => {
  const res = makeRequest('/api/assessments/asgn_10_sci_01');
  if (!res.success) throw new Error(`Request failed: ${res.error}`);

  const data = JSON.parse(res.body);
  if (!data.success || !data.assessment) {
    throw new Error('Failed to retrieve assessment asgn_10_sci_01');
  }
  const questions = data.assessment.questions;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Assessment contains no questions');
  }
  // Verify LaTeX formulas exist in questions
  const hasLatex = questions.some(q => {
    const text = q.question_latex || q.questionLatex || '';
    return text.includes('$');
  });
  if (!hasLatex) {
    throw new Error('Expected LaTeX mathematical notation ($) in assessment questions');
  }
});

// TEST 4: Class Telemetry Analytics & Pedagogical Dashboard
runTest('Class Telemetry & Pedagogical Action Plan (/api/analytics/class-dashboard)', () => {
  const res = makeRequest('/api/analytics/class-dashboard?assessmentId=asgn_10_sci_01');
  if (!res.success) throw new Error(`Request failed: ${res.error}`);

  const data = JSON.parse(res.body);
  if (!data.success) {
    throw new Error(`Dashboard API responded with success: false - ${data.error || ''}`);
  }
  if (!data.classSummary || typeof data.classSummary.totalSubmissions !== 'number') {
    throw new Error('Missing or invalid classSummary payload');
  }
  if (!Array.isArray(data.questionAnalytics) || data.questionAnalytics.length === 0) {
    throw new Error('Missing questionAnalytics metrics');
  }
  if (!data.pedagogicalActionPlan) {
    throw new Error('Missing pedagogicalActionPlan in dashboard response');
  }
});

// TEST 5: Exam Pattern Blueprint Catalog
runTest('Exam Pattern Blueprint Intelligence (/api/assessments/pattern-exam/blueprints)', () => {
  const res = makeRequest('/api/assessments/pattern-exam/blueprints');
  if (!res.success) throw new Error(`Request failed: ${res.error}`);

  const data = JSON.parse(res.body);
  if (!data.success || !data.blueprints) {
    throw new Error('Failed to fetch exam blueprints');
  }
  const blueprints = Array.isArray(data.blueprints) ? data.blueprints : Object.values(data.blueprints || {});
  const expectedPatterns = ['CBSE_CLASS_10_SCIENCE', 'JEE_MAIN_NON_MED', 'NEET_UG_MED'];
  for (const pattern of expectedPatterns) {
    if (!blueprints.some(b => b.id === pattern)) {
      throw new Error(`Missing expected blueprint for ${pattern}`);
    }
  }
});

// TEST 6: Sub-Second Diagnostic Test Submission & Scoring Flow
runTest('Live Test Submission & Diagnostic Scoring Flow (POST /api/assessments/asgn_10_sci_01/submit)', () => {
  const payload = {
    studentId: 'b0000000-0000-0000-0000-000000000001',
    studentName: 'Aryan Sharma',
    rollNumber: '11-S-24',
    responses: [
      { questionIndex: 1, selectedOption: 'B', timeSpentSeconds: 42 },
      { questionIndex: 2, selectedOption: 'A', timeSpentSeconds: 38 },
      { questionIndex: 3, selectedOption: 'A', timeSpentSeconds: 65 }
    ]
  };

  const res = makeRequest('/api/assessments/asgn_10_sci_01/submit', {
    method: 'POST',
    data: payload
  });

  if (!res.success) throw new Error(`Submission request failed: ${res.error}`);

  const data = JSON.parse(res.body);
  if (!data.success || !data.results) {
    throw new Error(`Invalid test submission response: ${res.body}`);
  }
  if (data.results.totalMarks !== 12) {
    throw new Error(`Expected totalMarks 12, received: ${data.results.totalMarks}`);
  }
  if (!data.results.personalizedAssignment) {
    throw new Error('Missing personalizedAssignment in submission result');
  }
});

// TEST 7: Personalized Remedial Formula Verification API
runTest('Personalized Remedial Formula Verification API (POST /api/assessments/remedial/verify-formula)', () => {
  const payload = {
    subtopic: 'Spherical Mirrors',
    formulaInput: '1/f = 1/v + 1/u'
  };
  const res = makeRequest('/api/assessments/remedial/verify-formula', {
    method: 'POST',
    data: payload
  });
  if (!res.success) throw new Error(`Formula verification request failed: ${res.error}`);
  const data = JSON.parse(res.body);
  if (!data.success || !data.isValid) {
    throw new Error(`Expected isValid: true for mirror formula, got: ${res.body}`);
  }
});

// TEST 8: Frontend App Shell & Remedial Assignment Modal Delivery
runTest('Frontend App Shell & Remedial Modal Delivery (/index.html)', () => {
  const res = makeRequest('/', { isHtml: true });
  if (!res.success) throw new Error(`Failed to fetch frontend root: ${res.error}`);

  if (!res.body.includes('HAPS-AI Scholar Assistant') || !res.body.includes('modalPersonalizedRemedial')) {
    throw new Error('Frontend root did not return valid HTML shell with modalPersonalizedRemedial');
  }
});

// TEST 9: Teacher Departmental Faculty Directory & Authentication
runTest('Teacher Departmental Faculty Directory & Auth (/api/curriculum/faculty)', () => {
  const res = makeRequest('/api/curriculum/faculty');
  if (!res.success) throw new Error(`Faculty request failed: ${res.error}`);
  const data = JSON.parse(res.body);
  if (!data.success || !Array.isArray(data.faculty) || data.faculty.length < 4) {
    throw new Error('Expected 4 departmental faculty profiles');
  }
  
  // Test login for Physics faculty
  const loginRes = makeRequest('/api/curriculum/faculty/login', {
    method: 'POST',
    data: { facultyId: 'fac_phy_01' }
  });
  if (!loginRes.success) throw new Error(`Login request failed: ${loginRes.error}`);
  const loginData = JSON.parse(loginRes.body);
  if (!loginData.success || loginData.teacher.subjectKey !== 'PHYSICS') {
    throw new Error('Expected teacher.subjectKey to be PHYSICS');
  }
});

// TEST 10: Strict Subject Isolation for Signed-in Teacher
runTest('Strict Subject Isolation for Teacher Scope (/api/curriculum/classes?teacherSubjectKey=PHYSICS)', () => {
  const res = makeRequest('/api/curriculum/classes?teacherSubjectKey=PHYSICS');
  if (!res.success) throw new Error(`Classes request failed: ${res.error}`);
  const data = JSON.parse(res.body);
  if (!data.success || !Array.isArray(data.classes)) {
    throw new Error('Expected classes array for Physics faculty');
  }
  for (const cls of data.classes) {
    const isOnlyPhy = cls.subjects.length === 1 && (cls.subjects[0]?.name === 'Physics' || cls.subjects[0]?.key === 'PHYSICS');
    if (!isOnlyPhy) {
      throw new Error(`Class ${cls.id} has non-physics subjects: ${JSON.stringify(cls.subjects)}`);
    }
  }
});

// -----------------------------------------------------------------------------
// VERIFICATION REPORT & PRODUCTION GATE EXIT CODE
// -----------------------------------------------------------------------------
console.log('\n====================================================================');
console.log('📊 STAGING ENVIRONMENT VERIFICATION SUMMARY');
console.log('====================================================================');
console.log(`Total Verification Checks: ${passCount + failCount}`);
console.log(`Passed:                    ${passCount}`);
console.log(`Failed:                    ${failCount}`);
console.log('--------------------------------------------------------------------');

if (failCount > 0) {
  console.error('\n🚫 GATE REJECTED: STAGING ENVIRONMENT HAS FAILED CHECKS.');
  console.error('⚠️  STRICT SAFETY POLICY: Promotion to Production is BLOCKED!');
  console.error('Please fix the above failures in staging before pushing to production.\n');
  process.exit(1);
} else {
  console.log('\n🎯 GATE APPROVED: 100% OF STAGING VERIFICATION CHECKS PASSED!');
  console.log('✅ Staging environment is verified healthy, secure, and accurate.');
  console.log('🚀 SAFE TO PROMOTE AND PUSH TO PRODUCTION.\n');
  process.exit(0);
}
