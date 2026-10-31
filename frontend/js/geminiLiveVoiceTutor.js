/**
 * ============================================================================
 * UNISOLE AI SCHOOL - REAL-TIME FULL-DUPLEX VOICE ASSISTANT ENGINE
 * Powered by Google Gemini Multimodal Live API (WebSockets)
 * Based on https://github.com/moktagithub005/real_time_voice_agent
 * Features:
 *  - Full-Duplex 16kHz PCM Ingest & 24kHz PCM Egress
 *  - Instant Hands-Free Natural Interruption via Server-Side VAD
 *  - Real-time Bidirectional Streaming Transcription
 *  - Live Mic & Speaker Waveform Audio Visualizers
 * ============================================================================
 */

(function (window) {
  'use strict';

  function bytesToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let offset = 0; offset < len; offset += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(offset, Math.min(offset + 0x8000, len)));
    }
    return btoa(binary);
  }

  function floatToPcm16(input) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return new Uint8Array(output.buffer);
  }

  async function parseSocketMessage(data) {
    const text = typeof data === 'string' ? data : await data.text();
    return JSON.parse(text);
  }

  class GeminiLiveVoiceTutorEngine {
    constructor() {
      this.socket = null;
      this.inputContext = null;
      this.inputStream = null;
      this.processor = null;
      this.outputContext = null;
      this.outputGain = null;
      this.inputAnalyser = null;
      this.outputAnalyser = null;
      this.sources = [];
      this.scheduledEnd = 0;
      this.status = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED
      this.activeQuestionId = null;
      this.callbacks = {};
      this.levelAnimationId = null;
      this.isStreamingVoice = false;
      this.lastVoiceAt = 0;
      this.preAudioBuffer = [];

      this.currentInputText = '';
      this.currentOutputText = '';
    }

    getStatus() {
      return this.status;
    }

    getActiveQuestionId() {
      return this.activeQuestionId;
    }

    isSessionActive() {
      return this.status === 'CONNECTED' || this.status === 'CONNECTING';
    }

    stopPlayback() {
      for (const source of this.sources) {
        try {
          source.stop();
        } catch (e) {
          // Source may have already ended
        }
      }
      this.sources = [];
      if (this.outputContext) {
        this.scheduledEnd = this.outputContext.currentTime;
      }
      if (this.callbacks.onInterrupted) {
        this.callbacks.onInterrupted();
      }
    }

    playAudioChunk(base64Audio) {
      if (!this.outputContext || !this.outputGain) return;
      try {
        const binary = atob(base64Audio);
        const pcm = new Int16Array(binary.length / 2);
        for (let i = 0; i < pcm.length; i++) {
          pcm[i] = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8);
        }

        const audioBuffer = this.outputContext.createBuffer(1, pcm.length, 24000);
        const channel = audioBuffer.getChannelData(0);
        for (let i = 0; i < pcm.length; i++) {
          channel[i] = pcm[i] / 0x8000;
        }

        const source = this.outputContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputGain);

        const startAt = Math.max(this.outputContext.currentTime, this.scheduledEnd);
        source.start(startAt);
        this.scheduledEnd = startAt + audioBuffer.duration;
        this.sources.push(source);

        source.onended = () => {
          this.sources = this.sources.filter(candidate => candidate !== source);
        };
      } catch (err) {
        console.error('[GEMINI LIVE] Play audio error:', err);
      }
    }

    handleServerMessage(message) {
      const content = message.serverContent;
      if (!content) return;

      // Real-time server-side voice activity interruption
      if (content.interrupted) {
        console.log('[GEMINI LIVE] Interruption detected! Halting playing audio immediately.');
        this.stopPlayback();
      }

      // Input transcription (student speech)
      const inputText = content.inputTranscription?.text || content.interimInputTranscription?.text;
      if (inputText) {
        this.currentInputText += inputText;
        if (this.callbacks.onTranscript) {
          this.callbacks.onTranscript({
            role: 'student',
            text: this.currentInputText,
            isInterim: !content.turnComplete
          });
        }
      }

      // Output transcription (tutor speech)
      const outputText = content.outputTranscription?.text;
      if (outputText) {
        this.currentOutputText += outputText;
        if (this.callbacks.onTranscript) {
          this.callbacks.onTranscript({
            role: 'tutor',
            text: this.currentOutputText,
            isInterim: !content.turnComplete
          });
        }
      }

      // Turn Complete
      if (content.turnComplete) {
        if (this.callbacks.onTurnComplete) {
          this.callbacks.onTurnComplete({
            studentText: this.currentInputText,
            tutorText: this.currentOutputText
          });
        }
        this.currentInputText = '';
        this.currentOutputText = '';
      }

      // Play audio model turn
      for (const part of content.modelTurn?.parts || []) {
        if (part.inlineData?.data) {
          this.playAudioChunk(part.inlineData.data);
        }
      }
    }

    async startSession({
      questionId,
      questionText = '',
      solutionText = '',
      chapterName = '',
      topic = '',
      apiBaseUrl = '',
      callbacks = {}
    }) {
      if (this.isSessionActive()) {
        this.stopSession();
      }

      this.activeQuestionId = questionId;
      this.callbacks = callbacks;
      this.status = 'CONNECTING';
      if (this.callbacks.onStatusChange) this.callbacks.onStatusChange('CONNECTING');

      try {
        // 1. Fetch ephemeral auth token from backend
        const tokenRes = await fetch(`${apiBaseUrl}/api/voice-tutor/gemini-live-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!tokenRes.ok) {
          const errData = await tokenRes.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${tokenRes.status}`);
        }

        const { token, model, wsUrl } = await tokenRes.json();
        const liveWsUrl = wsUrl || `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(token)}`;

        // 2. Open WebSocket
        const socket = new WebSocket(liveWsUrl);
        this.socket = socket;

        await new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('Timed out opening Gemini Live WebSocket')), 10000);
          socket.onopen = () => {
            window.clearTimeout(timeout);
            resolve();
          };
          socket.onerror = (e) => {
            window.clearTimeout(timeout);
            reject(new Error('Gemini Live WebSocket connection failed'));
          };
          socket.onclose = (e) => {
            window.clearTimeout(timeout);
            reject(new Error(`Gemini Live closed unexpectedly (${e.code})`));
          };
        });

        // 3. Audio Output Setup (24kHz destination)
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.outputContext = new AudioCtx({ latencyHint: 'interactive' });
        this.outputGain = this.outputContext.createGain();
        this.outputAnalyser = this.outputContext.createAnalyser();
        this.outputAnalyser.fftSize = 256;
        this.outputGain.connect(this.outputAnalyser);
        this.outputAnalyser.connect(this.outputContext.destination);
        await this.outputContext.resume();

        // 4. Send Initial Setup Message
        const cleanQ = questionText.replace(/\$+/g, '').replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2');
        const cleanS = solutionText ? solutionText.replace(/\$+/g, '') : '';
        const systemPrompt = `You are a premier Indian school faculty mentor (like top Delhi/Kota faculty) explaining this question in warm, lively, natural Hinglish.
Question: ${cleanQ}
${cleanS ? `Solution steps: ${cleanS}` : ''}
${chapterName ? `Chapter: ${chapterName}` : ''} ${topic ? `| Topic: ${topic}` : ''}

Pedagogical Rules:
1. Speak in smooth, natural, friendly conversational Hinglish (using terms like 'beta', 'dhyan se dekho', 'pehla step', 'concept samjho').
2. Start by warmly greeting the student and briefly introducing how to approach this question in 2-3 clear, logical steps.
3. This is a real-time full-duplex session. Whenever the student speaks or asks a doubt, pause immediately and answer their specific doubt warmly before moving on.
4. Keep spoken explanations concise, crisp, and pedagogical.`;

        const setupMsg = {
          setup: {
            model: model || 'models/gemini-2.5-flash-native-audio-latest',
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Puck'
                  }
                }
              },
              thinkingConfig: {
                thinkingBudget: 0
              }
            },
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            realtimeInputConfig: {
              automaticActivityDetection: {
                disabled: false,
                prefixPaddingMs: 100,
                silenceDurationMs: 350
              },
              activityHandling: 'START_OF_ACTIVITY_INTERRUPTS'
            }
          }
        };

        socket.send(JSON.stringify(setupMsg));

        // 5. Await setupComplete handshake
        await new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('Timed out waiting for Gemini setup handshake')), 10000);
          const onMessage = async (event) => {
            const msg = await parseSocketMessage(event.data);
            if (msg.setupComplete) {
              window.clearTimeout(timeout);
              socket.removeEventListener('message', onMessage);
              resolve();
            } else if (msg.error) {
              window.clearTimeout(timeout);
              socket.removeEventListener('message', onMessage);
              reject(new Error(msg.error.message || 'Gemini setup rejected'));
            }
          };
          socket.addEventListener('message', onMessage);
          socket.addEventListener('close', () => {
            window.clearTimeout(timeout);
            socket.removeEventListener('message', onMessage);
            reject(new Error('WebSocket closed during setup'));
          }, { once: true });
        });

        // 6. Microphone Input Setup (16kHz PCM stream)
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.inputContext = new AudioCtx({ sampleRate: 16000, latencyHint: 'interactive' });
        this.inputStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        const micSource = this.inputContext.createMediaStreamSource(this.inputStream);
        this.inputAnalyser = this.inputContext.createAnalyser();
        this.inputAnalyser.fftSize = 256;
        micSource.connect(this.inputAnalyser);

        this.processor = this.inputContext.createScriptProcessor(2048, 1, 1);
        this.isStreamingVoice = false;
        this.lastVoiceAt = 0;
        this.preAudioBuffer = [];

        this.processor.onaudioprocess = (event) => {
          if (this.socket?.readyState !== WebSocket.OPEN) return;
          const samples = event.inputBuffer.getChannelData(0);

          // Audio energy check for client VAD
          let energy = 0;
          for (let i = 0; i < samples.length; i++) {
            energy += samples[i] * samples[i];
          }
          const rms = Math.sqrt(energy / samples.length);
          const isVoice = rms > 0.018;
          const now = performance.now();

          const pcmBytes = floatToPcm16(samples);
          const base64Chunk = bytesToBase64(pcmBytes);

          if (isVoice) {
            // Student started speaking or is actively speaking
            if (!this.isStreamingVoice) {
              this.isStreamingVoice = true;
              // Flush pre-buffer so first syllables are never clipped
              while (this.preAudioBuffer.length > 0) {
                const preChunk = this.preAudioBuffer.shift();
                this.socket.send(JSON.stringify({
                  realtimeInput: {
                    audio: {
                      data: preChunk,
                      mimeType: 'audio/pcm;rate=16000'
                    }
                  }
                }));
              }
            }
            this.lastVoiceAt = now;

            // Stream active voice chunk
            this.socket.send(JSON.stringify({
              realtimeInput: {
                audio: {
                  data: base64Chunk,
                  mimeType: 'audio/pcm;rate=16000'
                }
              }
            }));
          } else if (this.isStreamingVoice) {
            // Silence detected after active voice
            if ((now - this.lastVoiceAt) <= 350) {
              // Within conversational grace window (inter-word pause)
              this.socket.send(JSON.stringify({
                realtimeInput: {
                  audio: {
                    data: base64Chunk,
                    mimeType: 'audio/pcm;rate=16000'
                  }
                }
              }));
            } else {
              // Pause has exceeded 350ms: speech turn is finished!
              this.isStreamingVoice = false;
              this.socket.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }));
            }
          } else {
            // Continuous idle silence: retain last 2 chunks (~250ms) in ring buffer for natural onset padding
            this.preAudioBuffer.push(base64Chunk);
            if (this.preAudioBuffer.length > 2) {
              this.preAudioBuffer.shift();
            }
          }
        };

        micSource.connect(this.processor);
        this.processor.connect(this.inputContext.destination);

        // 7. Visualizer level reporting loop
        const inputData = new Uint8Array(this.inputAnalyser.frequencyBinCount);
        const outputData = new Uint8Array(this.outputAnalyser.frequencyBinCount);
        let lastReportAt = 0;

        const reportLevels = () => {
          if (!this.isSessionActive()) return;
          if (this.inputAnalyser) this.inputAnalyser.getByteTimeDomainData(inputData);
          if (this.outputAnalyser) this.outputAnalyser.getByteTimeDomainData(outputData);

          const calcRms = (data) => {
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              const val = (data[i] - 128) / 128;
              sum += val * val;
            }
            return Math.min(1, Math.sqrt(sum / data.length) * 3.5);
          };

          const now = performance.now();
          if (now - lastReportAt >= 33) {
            if (this.callbacks.onAudioLevel) {
              this.callbacks.onAudioLevel(calcRms(inputData), calcRms(outputData));
            }
            lastReportAt = now;
          }
          this.levelAnimationId = requestAnimationFrame(reportLevels);
        };
        this.levelAnimationId = requestAnimationFrame(reportLevels);

        // 8. Listen for server responses
        this.socket.onmessage = async (event) => {
          const msg = await parseSocketMessage(event.data);
          this.handleServerMessage(msg);
        };

        this.socket.onclose = () => {
          if (this.status !== 'DISCONNECTED') {
            this.stopSession();
          }
        };

        this.socket.onerror = (err) => {
          console.error('[GEMINI LIVE] Socket error:', err);
          if (this.callbacks.onError) this.callbacks.onError(err);
        };

        this.status = 'CONNECTED';
        if (this.callbacks.onStatusChange) this.callbacks.onStatusChange('CONNECTED');

        // Kick off the conversation with initial student prompt
        this.sendUserText(`Sir, please explain this question in mixed Hinglish: "${cleanQ}"`);

        return true;
      } catch (err) {
        console.error('[GEMINI LIVE] Failed to start live session:', err);
        this.stopSession();
        if (this.callbacks.onError) this.callbacks.onError(err);
        throw err;
      }
    }

    sendUserText(text) {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        throw new Error('Gemini Live session is not active');
      }
      this.stopPlayback();
      if (this.callbacks.onTranscript) {
        this.callbacks.onTranscript({ role: 'student', text, isInterim: false });
      }
      this.socket.send(JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text }] }],
          turnComplete: true
        }
      }));
    }

    commitTurn() {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.isStreamingVoice = false;
        this.socket.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }));
      }
    }

    interrupt() {
      this.stopPlayback();
    }

    mute(isMuted) {
      if (this.outputGain) {
        this.outputGain.gain.value = isMuted ? 0 : 1;
      }
    }

    stopSession() {
      this.stopPlayback();
      this.isStreamingVoice = false;
      this.preAudioBuffer = [];
      if (this.levelAnimationId) {
        cancelAnimationFrame(this.levelAnimationId);
        this.levelAnimationId = null;
      }
      if (this.processor) {
        try { this.processor.disconnect(); } catch (e) {}
        this.processor = null;
      }
      if (this.inputStream) {
        this.inputStream.getTracks().forEach(track => track.stop());
        this.inputStream = null;
      }
      if (this.inputContext) {
        try { this.inputContext.close(); } catch (e) {}
        this.inputContext = null;
      }
      if (this.outputContext) {
        try { this.outputContext.close(); } catch (e) {}
        this.outputContext = null;
      }
      if (this.socket) {
        try { this.socket.close(); } catch (e) {}
        this.socket = null;
      }

      this.status = 'DISCONNECTED';
      const prevQId = this.activeQuestionId;
      this.activeQuestionId = null;

      if (this.callbacks.onStatusChange) {
        this.callbacks.onStatusChange('DISCONNECTED', prevQId);
      }
    }
  }

  // Expose global singleton
  window.geminiLiveVoiceTutor = new GeminiLiveVoiceTutorEngine();
})(typeof window !== 'undefined' ? window : this);
