import type { IncomingMessage, ServerResponse } from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RecognizedAutomatonData, ScanApiResponse } from '../src/types/automata.ts';

// Try loading .env at startup
function getEnvKey(name: string): string | undefined {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [k, ...vParts] = trimmed.split('=');
        if (k.trim() === name) {
          const val = vParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (val && val !== 'undefined' && val !== 'null' && !val.includes('test-gemini-key')) {
            return val;
          }
          return undefined; // explicitly empty or test key in .env
        }
      }
    }
  } catch {
    // Ignore error
  }
  const procVal = process.env[name]?.trim();
  if (procVal && procVal !== 'undefined' && procVal !== 'null' && !procVal.includes('test-gemini-key')) {
    return procVal;
  }
  return undefined;
}

const SYSTEM_PROMPT = `You are an expert Computer Science professor and computer vision specialist in Automata Theory and Formal Languages.
Your task is to analyze photographs of handwritten or printed automata problems from students' notebooks, textbooks, or exam question papers.

You must recognize either:
1. State Transition Diagrams:
   - Nodes/circles representing states (e.g. q0, q1, A, B, S0, etc.)
   - Start/Initial state: Indicated by an incoming directed arrow from nowhere (often labeled "Start" or "→").
   - Final/Accepting states: Indicated by a DOUBLE CONCENTRIC CIRCLE (or asterisk * in text).
   - Transitions: Directed arrows with symbol labels (e.g. '0', '1', 'a', 'b', '0,1').
   - Self-loops: Arrows that start and end on the same state.
   - Epsilon transitions: Arrows labeled with 'ε', 'e', 'eps', 'λ', or 'lambda'.
   - Non-determinism: A state having multiple arrows for the same symbol or ε-moves.

2. Transition Tables:
   - First column listing states (initial indicated by '→', final indicated by '*').
   - Header row listing alphabet symbols (0, 1, a, b, or ε).
   - Table cells containing next states (e.g. {q0, q1}, q1, or empty/dash/∅ for no transition).

3. Question Instructions:
   - Look for text like "Convert NFA to DFA", "Convert ε-NFA to DFA", "Eliminate ε-transitions", "Minimize the following DFA", "Convert DFA to NFA".

Output a valid, parseable JSON object matching this exact schema:
{
  "type": "DFA" | "NFA" | "ENFA",
  "states": ["q0", "q1", ...],
  "alphabet": ["0", "1", ...],
  "initialState": "q0",
  "finalStates": ["q2", ...],
  "transitions": {
    "q0": {
      "0": ["q0", "q1"],
      "1": ["q0"]
    },
    "q1": {
      "1": ["q2"]
    }
  },
  "questionText": "Exact or summarized question text if present in the image",
  "detectedTargetConversion": "NFA_TO_DFA" | "ENFA_TO_DFA" | "ENFA_TO_NFA" | "DFA_TO_NFA" | "DFA_MINIMIZATION",
  "uncertainties": [
    {
      "element": "Name of ambiguous transition, state, or arrow",
      "reason": "Why it was ambiguous (e.g. faint double circle, smudge, unclear label)",
      "suggestion": "Your best interpretation"
    }
  ],
  "notes": "Brief explanation of what was seen in the image",
  "confidenceScore": 0.95
}

CRITICAL RULES:
1. Every state name in 'transitions' targets MUST exist in the 'states' array.
2. In 'transitions', every target MUST be an array of strings (e.g. ["q1"], not "q1").
3. For epsilon transitions, use the symbol "ε" in 'transitions'.
4. Do NOT include "ε" in the 'alphabet' array (alphabet is strictly the input symbols like 0, 1 or a, b).
5. If an arrow is faint, missing, or handwriting is ambiguous, include it in 'uncertainties' so the student can verify.
6. Return strictly JSON with no markdown backticks or commentary.`;

async function callGeminiVision(apiKey: string, base64Data: string, mimeType: string): Promise<RecognizedAutomatonData> {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let message = `Gemini API error (${res.status} ${res.statusText})`;
        let isKeyError = false;
        try {
          const parsedErr = JSON.parse(errorText);
          if (parsedErr.error && parsedErr.error.message) {
            message = parsedErr.error.message;
            if (
              parsedErr.error.status === 'INVALID_ARGUMENT' ||
              parsedErr.error.code === 400 ||
              parsedErr.error.code === 401 ||
              message.toLowerCase().includes('api key')
            ) {
              isKeyError = true;
            }
          }
        } catch {
          // ignore parse error
        }
        if (isKeyError || errorText.includes('API_KEY_INVALID') || errorText.includes('API key not valid')) {
          const keyErr: any = new Error(message || 'API key not valid. Please pass a valid API key.');
          keyErr.isApiKeyError = true;
          throw keyErr;
        }
        throw new Error(message);
      }

      const json: any = await res.json();
      const rawText: string | undefined = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Gemini returned an empty response.');
      }

      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      return normalizeRecognizedData(parsed);
    } catch (err: any) {
      lastError = err;
      if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
        continue;
      }
      break;
    }
  }

  throw lastError || new Error('Failed to query Gemini API');
}

async function callOpenAIVision(apiKey: string, base64Data: string, mimeType: string): Promise<RecognizedAutomatonData> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract this automaton question and state diagram/table into the required JSON.' },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = `OpenAI API error (${res.status})`;
    let isKeyError = false;
    try {
      const parsedErr = JSON.parse(errorText);
      if (parsedErr.error && parsedErr.error.message) {
        message = parsedErr.error.message;
        if (res.status === 401 || message.toLowerCase().includes('api key')) {
          isKeyError = true;
        }
      }
    } catch {
      // ignore
    }
    if (isKeyError) {
      const keyErr: any = new Error(message);
      keyErr.isApiKeyError = true;
      throw keyErr;
    }
    throw new Error(message);
  }

  const json: any = await res.json();
  const rawText: string | undefined = json.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error('OpenAI returned an empty response.');
  }

  const parsed = JSON.parse(rawText);
  return normalizeRecognizedData(parsed);
}

function normalizeRecognizedData(raw: any): RecognizedAutomatonData {
  const states: string[] = Array.isArray(raw.states)
    ? raw.states.map((s: unknown) => String(s).trim()).filter(Boolean)
    : ['q0'];
  const alphabet: string[] = Array.isArray(raw.alphabet)
    ? raw.alphabet
        .map((s: unknown) => String(s).trim())
        .filter((s: string) => s && s !== 'ε' && s !== 'e' && s !== 'eps')
    : ['0', '1'];
  const initialState: string =
    raw.initialState && states.includes(String(raw.initialState).trim())
      ? String(raw.initialState).trim()
      : states[0] || 'q0';

  const finalStates: string[] = Array.isArray(raw.finalStates)
    ? raw.finalStates
        .map((s: unknown) => String(s).trim())
        .filter((s: string) => states.includes(s))
    : [];

  const transitions: Record<string, Record<string, string[]>> = {};

  for (const st of states) {
    transitions[st] = {};
  }

  let hasEpsilon = false;
  let hasNfaBranch = false;

  if (raw.transitions && typeof raw.transitions === 'object') {
    for (const [fromState, symMap] of Object.entries(raw.transitions)) {
      const from = String(fromState).trim();
      if (!states.includes(from)) {
        states.push(from);
      }
      transitions[from] = transitions[from] || {};

      if (symMap && typeof symMap === 'object') {
        for (const [sym, targetVal] of Object.entries(symMap as Record<string, any>)) {
          let s = String(sym).trim();
          if (s === 'e' || s === 'eps' || s === 'lambda' || s === 'λ') {
            s = 'ε';
          }
          if (s === 'ε') {
            hasEpsilon = true;
          } else if (!alphabet.includes(s)) {
            alphabet.push(s);
          }

          let targetList: string[] = [];
          if (Array.isArray(targetVal)) {
            targetList = targetVal.map((t: unknown) => String(t).trim()).filter(Boolean);
          } else if (typeof targetVal === 'string' && targetVal.trim() && targetVal !== '∅') {
            targetList = targetVal.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
          }

          for (const t of targetList) {
            if (!states.includes(t)) {
              states.push(t);
              transitions[t] = transitions[t] || {};
            }
          }

          transitions[from][s] = targetList;
          if (targetList.length > 1) {
            hasNfaBranch = true;
          }
        }
      }
    }
  }

  let detectedType: 'DFA' | 'NFA' | 'ENFA' = 'DFA';
  if (hasEpsilon || raw.type === 'ENFA' || raw.type === 'epsilon-NFA') {
    detectedType = 'ENFA';
  } else if (hasNfaBranch || raw.type === 'NFA') {
    detectedType = 'NFA';
  }

  let detectedTarget: any = raw.detectedTargetConversion;
  if (!detectedTarget) {
    const qLower = String(raw.questionText || '').toLowerCase();
    if (qLower.includes('minimize') || qLower.includes('minimization')) {
      detectedTarget = 'DFA_MINIMIZATION';
    } else if (
      qLower.includes('epsilon-nfa to nfa') ||
      qLower.includes('eliminate epsilon') ||
      qLower.includes('eliminate ε')
    ) {
      detectedTarget = 'ENFA_TO_NFA';
    } else if (detectedType === 'ENFA') {
      detectedTarget = 'ENFA_TO_DFA';
    } else if (detectedType === 'NFA') {
      detectedTarget = 'NFA_TO_DFA';
    } else {
      detectedTarget = 'DFA_TO_NFA';
    }
  }

  return {
    type: detectedType,
    states,
    alphabet,
    initialState,
    finalStates,
    transitions,
    questionText: raw.questionText || undefined,
    detectedTargetConversion: detectedTarget,
    uncertainties: Array.isArray(raw.uncertainties) ? raw.uncertainties : [],
    notes: raw.notes || 'Extracted via Multimodal AI Vision.',
    confidenceScore: typeof raw.confidenceScore === 'number' ? raw.confidenceScore : 0.9,
  };
}

export async function handleVisionScanRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, x-provider');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/vision-status') {
    const gemini = getEnvKey('GEMINI_API_KEY');
    const openai = getEnvKey('OPENAI_API_KEY');
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        hasGeminiKey: !!gemini,
        hasOpenaiKey: !!openai,
        activeProvider: gemini ? 'gemini' : openai ? 'openai' : 'none',
      })
    );
    return;
  }

  if (req.method === 'POST' && req.url === '/api/save-api-key') {
    let body = '';
    req.on('data', (chunk: Buffer | string) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { provider, apiKey } = JSON.parse(body);
        if (typeof apiKey !== 'string') {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Invalid API key format' }));
          return;
        }

        const envVarName = provider === 'openai' ? 'OPENAI_API_KEY' : 'GEMINI_API_KEY';
        const cleanKey = apiKey.trim();

        if (cleanKey && cleanKey !== 'DELETE') {
          process.env[envVarName] = cleanKey;
        } else {
          delete process.env[envVarName];
        }

        const envPath = path.resolve(process.cwd(), '.env');
        let currentEnv = '';
        if (fs.existsSync(envPath)) {
          currentEnv = fs.readFileSync(envPath, 'utf8');
        }

        const lines = currentEnv.split('\n');
        let replaced = false;
        const newLines = lines.map(line => {
          if (line.trim().startsWith(`${envVarName}=`)) {
            replaced = true;
            return cleanKey && cleanKey !== 'DELETE' ? `${envVarName}=${cleanKey}` : `${envVarName}=`;
          }
          return line;
        });

        if (!replaced && cleanKey && cleanKey !== 'DELETE') {
          newLines.push(`${envVarName}=${cleanKey}`);
        }

        fs.writeFileSync(envPath, newLines.join('\n').trim() + '\n', 'utf8');

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, message: `Saved ${envVarName} securely to .env` }));
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk: Buffer | string) => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Image file too large (max 25MB)' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        const imageBase64DataUrl: string = parsed.image;

        if (!imageBase64DataUrl) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'No image data provided' }));
          return;
        }

        const match = imageBase64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
        const mimeType = match ? match[1] : 'image/jpeg';
        const base64Data = match ? match[2] : imageBase64DataUrl;

        const customKey = (req.headers['x-api-key'] as string) || parsed.apiKey;
        const requestedProvider = (req.headers['x-provider'] as string) || parsed.provider;

        let geminiKey = getEnvKey('GEMINI_API_KEY');
        let openaiKey = getEnvKey('OPENAI_API_KEY');

        if (customKey) {
          if (requestedProvider === 'openai') {
            openaiKey = customKey;
          } else {
            geminiKey = customKey;
          }
        }

        let result: RecognizedAutomatonData;
        let providerUsed = '';

        if (requestedProvider === 'openai' && openaiKey) {
          providerUsed = 'OpenAI Vision';
          result = await callOpenAIVision(openaiKey, base64Data, mimeType);
        } else if (geminiKey) {
          providerUsed = 'Google Gemini Vision';
          result = await callGeminiVision(geminiKey, base64Data, mimeType);
        } else if (openaiKey) {
          providerUsed = 'OpenAI Vision';
          result = await callOpenAIVision(openaiKey, base64Data, mimeType);
        } else {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          const errorResp: ScanApiResponse = {
            success: false,
            error: 'MISSING_API_KEY',
            message:
              'No AI Vision API key configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to your .env file or enter your API key in the settings.',
          };
          res.end(JSON.stringify(errorResp));
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const successResp: ScanApiResponse = {
          success: true,
          data: result,
          provider: providerUsed,
        };
        res.end(JSON.stringify(successResp));
      } catch (err: any) {
        console.error('Vision processing error:', err);
        const isKeyErr =
          err.isApiKeyError ||
          (err.message && (
            err.message.includes('API key not valid') ||
            err.message.includes('API_KEY_INVALID') ||
            err.message.includes('Invalid Gemini API Key') ||
            err.message.includes('Invalid OpenAI API Key') ||
            err.message.includes('invalid_api_key')
          ));

        res.statusCode = isKeyErr ? 401 : 500;
        res.setHeader('Content-Type', 'application/json');
        const errResp: ScanApiResponse = {
          success: false,
          error: isKeyErr ? 'INVALID_API_KEY' : 'VISION_PROCESSING_ERROR',
          message: isKeyErr
            ? 'The configured Gemini API key is invalid or unauthorized. Please verify or update your API key in Settings.'
            : (err.message || 'Failed to analyze the image with AI Vision.'),
        };
        res.end(JSON.stringify(errResp));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
}

