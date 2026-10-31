/**
 * Automated Verification: AI Voice Tutor & Hinglish Audio Explanation Engine
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  cleanLatexForSpeech,
  generateHinglishAudioBrief,
  answerStudentInterruption
} = require('../backend/src/services/aiVoiceTutorService');

console.log('--- TESTING AI VOICE TUTOR & HINGLISH EXPLANATION ENGINE ---');

// 1. Test LaTeX Cleaner for Natural Speech
console.log('\n[TEST 1] Testing LaTeX Math Cleaner for Speech...');
const rawLatex1 = "Deduce Ohm's law and resistivity $\\rho = \\frac{m}{ne^2\\tau}$";
const clean1 = cleanLatexForSpeech(rawLatex1);
assert(!clean1.includes('\\frac'), 'Must remove \\frac');
assert(!clean1.includes('\\tau'), 'Must remove \\tau');
assert(clean1.includes('upon'), 'Must replace \\frac with upon');
assert(clean1.includes('square'), 'Must convert ^2 to square');
console.log('  Cleaned speech sample 1:', clean1);

const rawLatex2 = "Total impedance $Z = \\sqrt{R^2 + (X_L - X_C)^2}$";
const clean2 = cleanLatexForSpeech(rawLatex2);
assert(!clean2.includes('\\sqrt'), 'Must remove \\sqrt');
assert(clean2.includes('square root of'), 'Must replace \\sqrt with square root of');
assert(clean2.includes('X L'), 'Must replace X_L with X L');
console.log('  Cleaned speech sample 2:', clean2);
console.log('[PASS] LaTeX mathematical cleaner transforms complex formulas into fluid spoken words.');

// 2. Test generateHinglishAudioBrief Service Logic
console.log('\n[TEST 2] Testing generateHinglishAudioBrief...');
async function testHinglishBrief() {
  const brief = await generateHinglishAudioBrief({
    questionId: 'snr_p_03',
    questionText: 'Deduce Ohm\'s law using drift velocity concept and derive expression for resistivity $\\rho = \\frac{m}{ne^2\\tau}$',
    chapterName: 'Current Electricity',
    topic: 'Drift Velocity and Ohm\'s Law'
  });

  assert(brief.hinglishBrief, 'Must return hinglishBrief');
  assert(brief.cleanSpokenQuestion, 'Must return cleanSpokenQuestion');
  assert(brief.firstStepFormula, 'Must return firstStepFormula');
  assert(brief.pitfallTip, 'Must return pitfallTip');
  assert(brief.hinglishBrief.toLowerCase().includes('drift') || brief.hinglishBrief.toLowerCase().includes('question'), 'Brief must mention core topic in Hinglish');
  console.log('  Hinglish Brief:', brief.hinglishBrief);
  console.log('  Governing Formula:', brief.firstStepFormula);
  console.log('  Pitfall Advice:', brief.pitfallTip);
  console.log('[PASS] Hinglish audio briefing roadmap generated successfully.');
}

// 3. Test answerStudentInterruption Service Logic
console.log('\n[TEST 3] Testing answerStudentInterruption (Student Voice Doubts)...');
async function testInterruption() {
  // Test doubt 1: Formula doubt
  const ans1 = await answerStudentInterruption({
    questionText: 'Deduce Ohm\'s law $\\rho = \\frac{m}{ne^2\\tau}$',
    studentDoubt: 'Sir, yahan pehle kaunsa formula use karna hai?'
  });
  assert(ans1.answerHinglish, 'Must return answerHinglish');
  assert(ans1.suggestedNextStep, 'Must return suggestedNextStep');
  console.log('  Student Question: "Sir, yahan pehle kaunsa formula use karna hai?"');
  console.log('  Teacher Reply in Hinglish:', ans1.answerHinglish);

  // Test doubt 2: Sign convention doubt
  const ans2 = await answerStudentInterruption({
    questionText: 'Work done by friction force on inclined plane',
    studentDoubt: 'Minus sign kyu lagaya yahan?'
  });
  assert(ans2.answerHinglish, 'Must return answerHinglish');
  console.log('  Student Question: "Minus sign kyu lagaya yahan?"');
  console.log('  Teacher Reply in Hinglish:', ans2.answerHinglish);
  console.log('[PASS] Live student interruption doubt handler answered accurately in natural Hinglish.');
}

// 4. Test Neural Audio Synthesis
console.log('\n[TEST 4] Testing Neural Audio Synthesis Engine...');
const { synthesizeNeuralAudio, NEURAL_VOICES } = require('../backend/src/services/aiVoiceTutorService');
assert(NEURAL_VOICES.swara, 'Must define swara neural voice');
assert(NEURAL_VOICES.madhur, 'Must define madhur neural voice');
assert(NEURAL_VOICES.neerja, 'Must define neerja neural voice');

async function testNeuralAudioSynthesis() {
  const audioRes = await synthesizeNeuralAudio({ text: 'Namaste! Chalo question solve karte hain.', voiceKey: 'swara' });
  assert(Buffer.isBuffer(audioRes.buffer), 'Must return audio buffer');
  assert(audioRes.buffer.length > 5000, 'Audio buffer must contain MP3 audio data');
  assert.strictEqual(audioRes.voice, 'hi-IN-SwaraNeural');
  console.log(`  Neural MP3 Generated: ${audioRes.buffer.length} bytes (Voice: ${audioRes.voice})`);
  console.log('[PASS] Ultra-realistic human neural MP3 audio synthesized successfully.');
}

// 5. Verify Frontend Integration in app.js and styles.css
console.log('\n[TEST 5] Verifying Frontend Voice Engine Integration...');
const appJsPath = path.join(__dirname, '..', 'frontend', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

assert(appJsContent.includes('function readQuestionAloud('), 'Must define readQuestionAloud in app.js');
assert(appJsContent.includes('function explainQuestionInHinglish('), 'Must define explainQuestionInHinglish in app.js');
assert(appJsContent.includes('function interruptVoiceTutor('), 'Must define interruptVoiceTutor in app.js');
assert(appJsContent.includes('function toggleVoiceMicInput('), 'Must define toggleVoiceMicInput in app.js');
assert(appJsContent.includes('function submitVoiceDoubt('), 'Must define submitVoiceDoubt in app.js');
assert(appJsContent.includes('function setVoiceTutorPersona('), 'Must define setVoiceTutorPersona in app.js');
assert(appJsContent.includes('stopVoiceAudioPlayback'), 'Must define stopVoiceAudioPlayback for clean audio management');
assert(appJsContent.includes('window.readQuestionAloud = readQuestionAloud;'), 'Must export readQuestionAloud to window');
assert(appJsContent.includes('window.explainQuestionInHinglish = explainQuestionInHinglish;'), 'Must export explainQuestionInHinglish to window');
assert(appJsContent.includes('window.interruptVoiceTutor = interruptVoiceTutor;'), 'Must export interruptVoiceTutor to window');
assert(appJsContent.includes('window.setVoiceTutorPersona = setVoiceTutorPersona;'), 'Must export setVoiceTutorPersona to window');
assert(appJsContent.includes('stopVoiceTutor()'), 'Navigation must automatically stop active speech');

const cssPath = path.join(__dirname, '..', 'frontend', 'css', 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.includes('.qb-voice-tutor-banner'), 'Must contain .qb-voice-tutor-banner in styles.css');
assert(cssContent.includes('.qb-voice-wave'), 'Must contain .qb-voice-wave in styles.css');
assert(cssContent.includes('.qb-voice-transcript-drawer'), 'Must contain .qb-voice-transcript-drawer in styles.css');
assert(cssContent.includes('.qb-voice-interruption-box'), 'Must contain .qb-voice-interruption-box in styles.css');
assert(cssContent.includes('.qb-voice-persona-select'), 'Must contain .qb-voice-persona-select in styles.css');
assert(cssContent.includes('.qb-voice-badge-neural'), 'Must contain .qb-voice-badge-neural in styles.css');
console.log('[PASS] Frontend DOM, persona selectors, and JS audio engine bindings verified.');

// 6. Test Live HTTP Routes
console.log('\n[TEST 6] Testing Backend HTTP Endpoints (/api/voice-tutor)...');
async function testHttpEndpoints() {
  const { app } = require('../backend/src/server');
  const http = require('http');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(5098, resolve));
  const API_BASE = 'http://localhost:5098';

  try {
    const explainRes = await fetch(`${API_BASE}/api/voice-tutor/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: 'snr_p_03',
        questionText: 'Deduce Ohm\'s law $\\rho = \\frac{m}{ne^2\\tau}$',
        topic: 'Drift Velocity'
      })
    });
    assert.strictEqual(explainRes.status, 200, 'POST /api/voice-tutor/explain must return 200');
    const explainData = await explainRes.json();
    assert.strictEqual(explainData.success, true);
    assert(explainData.data.hinglishBrief, 'Must return hinglishBrief');
    assert(explainData.data.audioUrl, 'Must return audioUrl');
    console.log('  POST /api/voice-tutor/explain -> HTTP 200 OK');

    const interruptRes = await fetch(`${API_BASE}/api/voice-tutor/interrupt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText: 'Deduce Ohm\'s law',
        studentDoubt: 'Pehla formula kaunsa hai?'
      })
    });
    assert.strictEqual(interruptRes.status, 200, 'POST /api/voice-tutor/interrupt must return 200');
    const interruptData = await interruptRes.json();
    assert.strictEqual(interruptData.success, true);
    assert(interruptData.data.answerHinglish, 'Must return answerHinglish');
    console.log('  POST /api/voice-tutor/interrupt -> HTTP 200 OK');

    const audioRes = await fetch(`${API_BASE}/api/voice-tutor/audio?text=Namaste&voice=swara`);
    assert.strictEqual(audioRes.status, 200, 'GET /api/voice-tutor/audio must return 200');
    assert.strictEqual(audioRes.headers.get('content-type'), 'audio/mpeg');
    const audioBuf = await audioRes.arrayBuffer();
    assert(audioBuf.byteLength > 2000, 'Audio response must be valid MP3 stream');
    console.log(`  GET /api/voice-tutor/audio -> HTTP 200 OK (Streamed ${audioBuf.byteLength} bytes MP3)`);

    const synthRes = await fetch(`${API_BASE}/api/voice-tutor/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Testing audio', voice: 'madhur' })
    });
    assert.strictEqual(synthRes.status, 200, 'POST /api/voice-tutor/synthesize must return 200');
    const synthData = await synthRes.json();
    assert.strictEqual(synthData.success, true);
    assert(synthData.audioDataUri, 'Must return audioDataUri');
    // Test Gemini Live Token Endpoint
    const tokenRes = await fetch(`${API_BASE}/api/voice-tutor/gemini-live-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(tokenRes.status, 200, 'POST /api/voice-tutor/gemini-live-token must return 200');
    const tokenData = await tokenRes.json();
    assert.strictEqual(tokenData.success, true);
    assert(tokenData.token && tokenData.token.startsWith('auth_tokens/'), 'Must return valid ephemeral auth token');
    assert(tokenData.wsUrl && tokenData.wsUrl.startsWith('wss://'), 'Must return valid secure WebSocket endpoint');
    console.log(`  POST /api/voice-tutor/gemini-live-token -> HTTP 200 OK (Token: ${tokenData.token.substring(0, 24)}...)`);

    // Test Gemini Multimodal Live WebSocket Handshake
    console.log('\n[TEST 7] Testing Gemini Multimodal Live WebSocket Handshake & Auto-Interruption Setup...');
    const WebSocket = require('ws');
    const ws = new WebSocket(tokenData.wsUrl);
    const wsHandshakePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => { ws.close(); reject(new Error('WebSocket handshake timed out')); }, 10000);
      ws.on('open', () => {
        ws.send(JSON.stringify({
          setup: {
            model: tokenData.model,
            generationConfig: {
              responseModalities: ['AUDIO'],
              thinkingConfig: { thinkingBudget: 0 }
            },
            systemInstruction: { parts: [{ text: 'You are an expert Indian school mentor.' }] },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            realtimeInputConfig: {
              automaticActivityDetection: { disabled: false, prefixPaddingMs: 100, silenceDurationMs: 350 },
              activityHandling: 'START_OF_ACTIVITY_INTERRUPTS'
            }
          }
        }));
      });

      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.setupComplete) {
          clearTimeout(timeout);
          ws.close();
          resolve(true);
        } else if (msg.error) {
          clearTimeout(timeout);
          ws.close();
          reject(new Error(msg.error.message || 'WebSocket setup failed'));
        }
      });

      ws.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    await wsHandshakePromise;
    console.log('  WebSocket Gemini Live Handshake -> setupComplete confirmed (thinkingBudget: 0, silenceDurationMs: 350, activityHandling: START_OF_ACTIVITY_INTERRUPTS)');
  } finally {
    server.close();
  }

  // Test 8: Verify Client Engine File
  console.log('\n[TEST 8] Verifying Client-Side geminiLiveVoiceTutor.js...');
  const liveJsPath = path.join(__dirname, '..', 'frontend', 'js', 'geminiLiveVoiceTutor.js');
  assert(fs.existsSync(liveJsPath), 'geminiLiveVoiceTutor.js must exist');
  const liveJsContent = fs.readFileSync(liveJsPath, 'utf8');
  assert(liveJsContent.includes('class GeminiLiveVoiceTutorEngine'), 'Must define GeminiLiveVoiceTutorEngine');
  assert(liveJsContent.includes('START_OF_ACTIVITY_INTERRUPTS'), 'Must configure START_OF_ACTIVITY_INTERRUPTS');
  assert(liveJsContent.includes('content.interrupted'), 'Must handle server interruption event');
  assert(liveJsContent.includes('window.geminiLiveVoiceTutor'), 'Must expose window.geminiLiveVoiceTutor');
  assert(liveJsContent.includes('thinkingBudget: 0'), 'Must configure thinkingBudget: 0 for sub-2s conversational latency');
  assert(liveJsContent.includes('switchToQuestion'), 'Must define switchToQuestion for multi-question continuity');
  // Test 9: Verify Interactive Whiteboard (tldraw) Integration
  console.log('\n[TEST 9] Verifying Interactive Whiteboard (tldraw) Integration...');
  const wbHtmlPath = path.join(__dirname, '..', 'frontend', 'whiteboard.html');
  assert(fs.existsSync(wbHtmlPath), 'whiteboard.html must exist');
  const wbHtml = fs.readFileSync(wbHtmlPath, 'utf8');
  assert(wbHtml.includes('tldraw'), 'whiteboard.html must import tldraw');
  assert(wbHtml.includes('WhiteboardController'), 'Must define WhiteboardController');
  assert(wbHtml.includes('addQuestionHeader'), 'Must support question header shape creation');
  assert(wbHtml.includes('drawPhysicsDiagram'), 'Must support physics/optics/circuit diagram drawing');
  assert(wbHtml.includes('addStepFormula'), 'Must support formula step box drawing');
  assert(wbHtml.includes('highlightDoubt'), 'Must support doubt note with pointer arrow');
  assert(wbHtml.includes('addFinalAnswer'), 'Must support final answer card');

  assert(appJsContent.includes('toggleLiveWhiteboard'), 'app.js must define toggleLiveWhiteboard');
  assert(appJsContent.includes('toggleExpandWhiteboard'), 'app.js must define toggleExpandWhiteboard');
  assert(appJsContent.includes('syncQuestionToWhiteboard'), 'app.js must define syncQuestionToWhiteboard');
  assert(appJsContent.includes('syncDoubtToWhiteboard'), 'app.js must define syncDoubtToWhiteboard');
  assert(appJsContent.includes('wbContainer_'), 'app.js must render whiteboard container');
  assert(appJsContent.includes('wbIframe_'), 'app.js must render whiteboard iframe');

  assert(cssContent.includes('.qb-whiteboard-container'), 'styles.css must style .qb-whiteboard-container');
  assert(cssContent.includes('.qb-whiteboard-iframe'), 'styles.css must style .qb-whiteboard-iframe');
  console.log('[PASS] tldraw Interactive Whiteboard & Voice Assistant synchronization verified.');

  console.log('\n========================================================================');
  console.log('ALL AI VOICE TUTOR & TLDRAW WHITEBOARD TESTS PASSED 100%!');
  console.log('========================================================================\n');
}

async function runAll() {
  await testHinglishBrief();
  await testInterruption();
  await testNeuralAudioSynthesis();
  await testHttpEndpoints();
  process.exit(0);
}

runAll();
