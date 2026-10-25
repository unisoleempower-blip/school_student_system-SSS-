// ============================================================================
// HAPS-AI SCHOLAR ASSISTANT: MULTI-LLM QUESTION GENERATION ENGINE
// Dual Engine: Google Gemini 1.5 & Groq (LPU Llama-3.3) with Automatic Failover
// Grounded in NCERT Curriculum and Class 10/11/12 Board Blueprints
// ============================================================================

require('dotenv').config();

/**
 * Generate curriculum-compliant LaTeX question using Groq or Gemini LLM
 * @param {object} params
 * @param {string} params.grade e.g., '10', '11', '12'
 * @param {string} params.subject e.g., 'Science', 'Mathematics', 'Physics'
 * @param {string} params.chapter e.g., 'Light - Reflection and Refraction', 'Trigonometry'
 * @param {string} params.board e.g., 'CBSE', 'HP_BOARD', 'JEE_MAIN', 'NEET'
 * @param {string} params.difficulty e.g., 'EASY', 'MEDIUM', 'HARD'
 * @param {string} params.questionType e.g., 'MCQ_SINGLE', 'NUMERICAL', 'SUBJECTIVE_DERIVATION'
 * @param {string} params.provider 'auto' | 'gemini' | 'groq'
 */
async function generateLlmQuestion({
  grade = '10',
  subject = 'Science',
  chapter = 'Light – Reflection and Refraction',
  ncertSection = '9.2 Spherical Mirrors and Mirror Formula',
  board = 'CBSE',
  difficulty = 'MEDIUM',
  questionType = 'NUMERICAL',
  provider = 'auto'
}) {
  const geminiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
  const groqKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '';

  console.log(`[LLM ENGINE] Request: Class ${grade} ${subject} - ${chapter} (${board}) | Provider: ${provider}`);

  // Build the strict pedagogical prompt grounded in NCERT & Board patterns
  const systemPrompt = `You are the Lead Academic Assessment Specialist for Him Academy Public School (HAPS), Hamirpur.
Your objective is to generate authentic, curriculum-grounded assessment questions for Class ${grade} (${board} & HP Board).
You MUST adhere strictly to:
1. Pristine LaTeX mathematical formatting: use $...$ for inline formulas and $$...$$ for display equations.
2. Direct alignment with the official NCERT textbook for Class ${grade} ${subject}.
3. CBSE / HPBOSE Board blueprint marking scheme: specify step-by-step rubrics.
4. If MCQ, each wrong option (distractor) MUST have a specific diagnostic reason explaining the conceptual trap.
5. Return ONLY a valid JSON object matching the requested schema. No conversational preamble.`;

  const userPrompt = `Generate a high quality assessment question for:
- Class: ${grade}
- Subject: ${subject}
- NCERT Chapter: ${chapter}
- NCERT Section: ${ncertSection}
- Curriculum Board: ${board} (HP Board / CBSE alignment)
- Difficulty: ${difficulty}
- Format: ${questionType}

Output strictly in this JSON format:
{
  "question_latex": "The question text with clean LaTeX like $f = -15\\\\,\\\\text{cm}$",
  "options_latex": [
    { "key": "A", "latex": "$...$", "is_correct": false, "distractor_trap": "Reason for error" },
    { "key": "B", "latex": "$...$", "is_correct": true, "distractor_trap": null }
  ],
  "correct_answer_latex": "B or the final numerical value",
  "solution_latex": "Step-by-step derivation with clear equations",
  "socratic_hints": [
    "Hint 1 prompting method without giving answer",
    "Hint 2 focusing on formula application"
  ],
  "step_rubric": [
    { "step": 1, "description": "Formula statement & sign convention", "marks": 1.0 },
    { "step": 2, "description": "Substitution & calculation", "marks": 1.0 },
    { "step": 3, "description": "Final value with SI unit", "marks": 1.0 }
  ],
  "ncert_mapping": {
    "chapter_name": "${chapter}",
    "ncert_section": "${ncertSection}",
    "page_reference": "NCERT Class ${grade}",
    "pyq_similarity": "${board} Board (Similar to 2023/2022 Question)",
    "marks": 3
  },
  "benchmark_time_seconds": 120,
  "bloom_level": "APPLICATION"
}`;

  // 1. Try Groq if selected or in auto mode with active key
  if ((provider === 'groq' || provider === 'auto') && groqKey) {
    try {
      console.log('[LLM ENGINE] Calling Groq Cloud API with LPU acceleration...');
      const groqResult = await callGroqApi({ apiKey: groqKey, systemPrompt, userPrompt });
      if (groqResult) {
        const cleanPayload = sanitizeQuestionPayload(groqResult.data);
        return {
          id: `groq_${Date.now()}`,
          llm_provider: `Groq LPU (${groqResult.modelUsed})`,
          inference_time_ms: groqResult.durationMs,
          ...cleanPayload,
          curriculum_board: board,
          grade,
          subject,
          is_ai_generated: true,
          generated_at: new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn('[LLM ENGINE] Groq API call failed. Falling back to Gemini:', err.message);
    }
  }

  // 2. Try Gemini if selected or in auto mode with active key
  if ((provider === 'gemini' || provider === 'auto') && geminiKey) {
    try {
      console.log('[LLM ENGINE] Calling Google Gemini API...');
      const geminiResult = await callGeminiApi({ apiKey: geminiKey, systemPrompt, userPrompt });
      if (geminiResult) {
        const cleanPayload = sanitizeQuestionPayload(geminiResult.data);
        return {
          id: `gemini_${Date.now()}`,
          llm_provider: `Google Gemini (${geminiResult.modelUsed})`,
          inference_time_ms: geminiResult.durationMs,
          ...cleanPayload,
          curriculum_board: board,
          grade,
          subject,
          is_ai_generated: true,
          generated_at: new Date().toISOString()
        };
      }
    } catch (err) {
      console.warn('[LLM ENGINE] Gemini API call failed. Falling back to NCERT PYQ Bank:', err.message);
    }
  }

  // 3. Fallback: Curated NCERT & Previous Year Question Bank
  console.log('[LLM ENGINE] No live LLM keys detected or API offline. Generating from verified NCERT Class 10/11 PYQ Bank.');
  const { getCuratedClass10Question } = require('./class10PyqBank');
  const fallbackQ = getCuratedClass10Question(subject, chapter, board);
  
  return {
    id: `ncert_pyq_${Date.now()}`,
    llm_provider: 'HAPS Curated NCERT & Board PYQ Bank (Offline/Deterministic)',
    ...fallbackQ,
    grade,
    subject,
    curriculum_board: board,
    is_ai_generated: false,
    generated_at: new Date().toISOString()
  };
}

/**
 * Extract and parse JSON safely from LLM output (handles markdown code fences and reasoning prefixes)
 */
function cleanAndParseJson(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let text = raw.trim();

  // Strip markdown code fences if present: ```json ... ```
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // Try direct parse
  try {
    return JSON.parse(text);
  } catch (e) {
    // Attempt greedy regex match for innermost or outermost balanced JSON object
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        // Fall through
      }
    }
    throw new Error(`Unable to parse LLM JSON response: ${text.slice(0, 150)}...`);
  }
}

/**
 * Call Groq Cloud API using native high-speed fetch with verified models
 */
async function callGroqApi({ apiKey, systemPrompt, userPrompt }) {
  const start = Date.now();
  const modelsToTry = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.25,
          max_tokens: 2500
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq model ${model} HTTP ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const durationMs = Date.now() - start;
      const content = json.choices[0].message.content;
      const parsedData = cleanAndParseJson(content);

      return {
        data: parsedData,
        modelUsed: model,
        durationMs
      };
    } catch (err) {
      lastError = err;
      console.warn(`[LLM ENGINE] Groq model ${model} attempt failed: ${err.message}. Trying next model...`);
    }
  }

  throw lastError || new Error('All Groq model attempts failed.');
}

/**
 * Call Google Gemini API using native fetch with timeout guard
 */
async function callGeminiApi({ apiKey, systemPrompt, userPrompt }) {
  const start = Date.now();
  const geminiModels = ['gemini-2.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError = null;

  for (const model of geminiModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout guard

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nTask Instructions:\n${userPrompt}\n\nIMPORTANT: Return ONLY a valid JSON object starting with { and ending with }.` }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.25
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini ${model} HTTP ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const durationMs = Date.now() - start;
      const rawText = json.candidates[0].content.parts[0].text;
      const parsedData = cleanAndParseJson(rawText);

      return {
        data: parsedData,
        modelUsed: model,
        durationMs
      };
    } catch (err) {
      lastError = err;
      console.warn(`[LLM ENGINE] Gemini model ${model} attempt failed: ${err.message}.`);
    }
  }

  throw lastError || new Error('All Gemini model endpoints failed.');
}

function sanitizeLatexString(str) {
  if (!str || typeof str !== 'string') return str;
  let s = str.replace(/\\\]\\/g, '\\]');
  s = s.replace(/\\\]\s*\\/g, '\\]');
  s = s.replace(/([:;,])\s*\\\s*(?=\\\[|\$\$)/g, '$1\n');
  return s;
}

function sanitizeQuestionPayload(data) {
  if (!data || typeof data !== 'object') return data;
  const q = { ...data };
  if (q.question_latex) q.question_latex = sanitizeLatexString(q.question_latex);
  if (q.solution_latex) q.solution_latex = sanitizeLatexString(q.solution_latex);
  if (Array.isArray(q.options_latex)) {
    q.options_latex = q.options_latex.map(opt => ({
      ...opt,
      latex: sanitizeLatexString(opt.latex),
      distractor_trap: opt.distractor_trap ? sanitizeLatexString(opt.distractor_trap) : opt.distractor_trap
    }));
  }
  if (Array.isArray(q.socratic_hints)) {
    q.socratic_hints = q.socratic_hints.map(h => sanitizeLatexString(h));
  }
  if (Array.isArray(q.step_rubric)) {
    q.step_rubric = q.step_rubric.map(r => ({
      ...r,
      description: sanitizeLatexString(r.description)
    }));
  }
  return q;
}

module.exports = {
  generateLlmQuestion,
  sanitizeLatexString,
  sanitizeQuestionPayload
};

