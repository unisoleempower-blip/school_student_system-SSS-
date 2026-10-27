/**
 * Automated Verification Script:
 * Teacher Dummy Sign-In, Subject Scoping, Class 11 & Student Roster Management
 */

const http = require('http');

const PORT = 5050;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`[PASS] ${message}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('TEACHER AUTHENTICATION, SUBJECT SCOPE & CLASS MANAGEMENT TESTS');
  console.log('================================================================\n');

  // 1. Verify Faculty Directory Listing
  console.log('Step 1: Fetching Departmental Faculty Directory...');
  const facultyRes = await makeRequest('/api/curriculum/faculty');
  assert(facultyRes.status === 200, 'GET /api/curriculum/faculty returns HTTP 200');
  assert(Array.isArray(facultyRes.data.faculty), 'Faculty array returned');
  assert(facultyRes.data.faculty.length >= 4, `Found ${facultyRes.data.faculty.length} faculty profiles`);
  
  const phyTeacher = facultyRes.data.faculty.find(f => f.subjectKey === 'PHYSICS');
  const bioTeacher = facultyRes.data.faculty.find(f => f.subjectKey === 'BIOLOGY');
  assert(phyTeacher && (phyTeacher.full_name === 'Dr. Vikram Sharma' || phyTeacher.name === 'Dr. Vikram Sharma'), 'Dr. Vikram Sharma configured as Physics Faculty');
  assert(bioTeacher && (bioTeacher.full_name === 'Dr. Ananya Mukherjee' || bioTeacher.name === 'Dr. Ananya Mukherjee'), 'Dr. Ananya Mukherjee configured as Biology Faculty');

  // 2. Teacher Dummy Login - Physics Faculty
  console.log('\nStep 2: Authenticating as Physics Faculty (Dr. Vikram Sharma)...');
  const phyLogin = await makeRequest('/api/curriculum/faculty/login', 'POST', { facultyId: 'fac_phy_01' });
  assert(phyLogin.status === 200, 'Physics login succeeds with HTTP 200');
  assert(phyLogin.data.faculty.subjectKey === 'PHYSICS', 'Authenticated user subjectKey is PHYSICS');
  assert(phyLogin.data.faculty.designation.includes('Physics'), 'Correct designation assigned');

  // 3. Subject Scoping for Physics Teacher
  console.log('\nStep 3: Verifying Subject Isolation for Physics Faculty...');
  const phyClasses = await makeRequest('/api/curriculum/classes?teacherSubjectKey=PHYSICS');
  assert(phyClasses.status === 200, 'GET /api/curriculum/classes?teacherSubjectKey=PHYSICS returns HTTP 200');
  assert(Array.isArray(phyClasses.data.classes), 'Classes array returned for Physics faculty');
  assert(phyClasses.data.classes.length > 0, `Physics faculty has ${phyClasses.data.classes.length} classes available`);

  // Assert every single class in the Physics view has ONLY Physics in subjects array
  for (const c of phyClasses.data.classes) {
    const isOnlyPhy = c.subjects.length === 1 && (c.subjects[0] === 'Physics' || c.subjects[0]?.name === 'Physics' || c.subjects[0]?.key === 'PHYSICS');
    assert(isOnlyPhy, 
      `Class ${c.id} (${c.name}) exposes ONLY Physics (Found: ${JSON.stringify(c.subjects)})`);
  }

  // 4. Subject Scoping for Biology Faculty
  console.log('\nStep 4: Verifying Subject Isolation for Biology Faculty...');
  const bioClasses = await makeRequest('/api/curriculum/classes?teacherSubjectKey=BIOLOGY');
  assert(bioClasses.status === 200, 'GET /api/curriculum/classes?teacherSubjectKey=BIOLOGY returns HTTP 200');
  
  // Non-Med classes (without biology) must NOT appear in Biology teacher scope
  const nonMedFoundInBio = bioClasses.data.classes.some(c => c.id === '11-NonMed' || c.id === '12-NonMed');
  assert(!nonMedFoundInBio, 'Non-Medical classes are strictly excluded from Biology faculty scope');

  // And all classes in Biology view must have ONLY Biology
  for (const c of bioClasses.data.classes) {
    const isOnlyBio = c.subjects.length === 1 && (c.subjects[0] === 'Biology' || c.subjects[0]?.name === 'Biology' || c.subjects[0]?.key === 'BIOLOGY');
    assert(isOnlyBio,
      `Class ${c.id} exposes ONLY Biology (Found: ${JSON.stringify(c.subjects)})`);
  }

  // 5. Creating a New Class (e.g. Class 11 Section C)
  console.log('\nStep 5: Testing Teacher Dynamic Class Section Creation...');
  const uniqueSec = `Sec-${Date.now().toString(36)}`;
  const newClassPayload = {
    id: `11-Sci-${uniqueSec}`,
    name: `Class 11 Science - Section ${uniqueSec}`,
    grade: 11,
    section: uniqueSec,
    stream: 'Science Composite',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics']
  };

  const createClassRes = await makeRequest('/api/curriculum/classes', 'POST', newClassPayload);
  assert(createClassRes.status === 201, 'POST /api/curriculum/classes returns HTTP 201 Created');
  assert(createClassRes.data.class.id === newClassPayload.id, 'New class Section registered with correct ID');

  // Verify newly created class appears in Physics faculty query
  const updatedPhyClasses = await makeRequest('/api/curriculum/classes?teacherSubjectKey=PHYSICS');
  const foundNewClass = updatedPhyClasses.data.classes.find(c => c.id === newClassPayload.id);
  assert(foundNewClass !== undefined, 'Newly created Class 11 section appears in Physics teacher class list');
  const isFoundOnlyPhy = foundNewClass.subjects.length === 1 && (foundNewClass.subjects[0] === 'Physics' || foundNewClass.subjects[0]?.name === 'Physics' || foundNewClass.subjects[0]?.key === 'PHYSICS');
  assert(isFoundOnlyPhy, 
    'Newly created class respects Physics subject scoping');

  // 6. Adding / Enrolling Student to Database for Activity Tracking
  console.log('\nStep 6: Enrolling New Student into Class 11th Database...');
  const uniqueRoll = `11-SC-${Math.floor(1000 + Math.random() * 9000)}`;
  const newStudentPayload = {
    classId: newClassPayload.id,
    rollNumber: uniqueRoll,
    fullName: 'Himanshu Thakur',
    email: 'himanshu.t@himacademy.ac.in',
    hostelResident: true,
    roomNumber: 'D-304'
  };

  const enrollRes = await makeRequest('/api/curriculum/students', 'POST', newStudentPayload);
  assert(enrollRes.status === 201, 'POST /api/curriculum/students returns HTTP 201 Created');
  assert(enrollRes.data.student.roll_number === uniqueRoll, 'Student roll number recorded');
  assert(String(enrollRes.data.student.grade) === '11', 'Student grade automatically assigned as 11');
  assert(enrollRes.data.student.hostel_resident === true, 'Hostel resident status recorded');
  assert(enrollRes.data.totalStudentsInClass >= 1, 'Class roster count updated in database');

  // 7. Verify Remedial Feedback Professionalism (No Emojis)
  console.log('\nStep 7: Verifying Remedial Feedback Quality & Emoji Absence...');
  const formulaCheck = await makeRequest('/api/assessments/remedial/verify-formula', 'POST', {
    subtopic: 'Simple Harmonic Motion',
    formulaInput: 'T = 2 * pi * sqrt(m / k)',
    subject: 'Physics'
  });
  assert(formulaCheck.status === 200, 'Formula verification endpoint succeeds');
  const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u;
  assert(!emojiRegex.test(formulaCheck.data.feedback || ''), 'No emojis in formula feedback response');
  assert(!emojiRegex.test(formulaCheck.data.message || ''), 'No emojis in formula message response');

  console.log('\n================================================================');
  console.log('ALL TEACHER AUTH & CLASS MANAGEMENT VERIFICATIONS PASSED (7/7)');
  console.log('================================================================\n');
}

runTestSuite().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
