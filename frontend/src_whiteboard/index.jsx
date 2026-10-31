import React, { Component, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Tldraw } from 'tldraw';

let editorInstance = null;
let shapeYOffset = 60;
const queuedEvents = [];

function logTelemetry(event, data = {}) {
  try {
    const entry = {
      event,
      data,
      timestamp: new Date().toISOString()
    };
    if (window.appendDiagnosticLog) {
      window.appendDiagnosticLog(event, data);
    }
    console.log(`[WHITEBOARD TELEMETRY] ${event}:`, data);
    fetch('/api/voice-tutor/whiteboard-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(() => {});
  } catch (e) {}
}

async function purgeCorruptStorage() {
  logTelemetry('PURGE_STORAGE_START');
  try {
    if (typeof window !== 'undefined' && window.indexedDB) {
      if (window.indexedDB.databases) {
        const dbs = await window.indexedDB.databases();
        for (const db of dbs) {
          if (db.name && (db.name.includes('TLDRAW') || db.name.includes('tldraw'))) {
            logTelemetry('PURGE_DB', { dbName: db.name });
            window.indexedDB.deleteDatabase(db.name);
          }
        }
      } else {
        window.indexedDB.deleteDatabase('TLDRAW_DOCUMENT_v2');
        window.indexedDB.deleteDatabase('TLDRAW_DOCUMENT_v2undefined');
      }
    }
    if (typeof localStorage !== 'undefined') {
      for (const k of Object.keys(localStorage)) {
        if (k.toLowerCase().includes('tldraw')) {
          localStorage.removeItem(k);
        }
      }
    }
    logTelemetry('PURGE_STORAGE_SUCCESS');
  } catch (err) {
    logTelemetry('PURGE_STORAGE_ERROR', { message: err?.message, stack: err?.stack });
  }
}

function hideLoader() {
  const loader = document.getElementById('whiteboard-loading');
  if (loader && loader.style.display !== 'none') {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 200);
  }
}

function safeCreateShape(shapeData) {
  if (!editorInstance) {
    logTelemetry('SAFE_CREATE_SHAPE_SKIPPED_NO_EDITOR', { type: shapeData?.type });
    return null;
  }
  try {
    const created = editorInstance.createShape(shapeData);
    logTelemetry('SAFE_CREATE_SHAPE_SUCCESS', { type: shapeData?.type, geo: shapeData.props?.geo });
    return created;
  } catch (err) {
    console.error('[TLDRAW CREATE SHAPE ERROR]:', err, shapeData);
    logTelemetry('SAFE_CREATE_SHAPE_ERROR', {
      error: err?.message,
      stack: err?.stack,
      shapeType: shapeData?.type,
      props: shapeData?.props
    });
    return null;
  }
}

// Custom Error Fallback component replacing tldraw's default crash modal
const CustomErrorFallback = ({ error }) => {
  useEffect(() => {
    logTelemetry('TLDRAW_ERROR_FALLBACK_TRIGGERED', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null
    });
    purgeCorruptStorage();
    hideLoader();
    if (window.initFallbackCanvas) {
      window.initFallbackCanvas();
    }
    // Flush queued events into fallback canvas
    while (queuedEvents.length > 0) {
      const evt = queuedEvents.shift();
      processWhiteboardEvent(evt);
    }
  }, [error]);

  return null;
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    logTelemetry('REACT_ERROR_BOUNDARY_CAUGHT', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      componentStack: errorInfo?.componentStack
    });
    purgeCorruptStorage();
    hideLoader();
    if (window.initFallbackCanvas) {
      window.initFallbackCanvas();
    }
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const WhiteboardController = {
  isReady() {
    return !!editorInstance;
  },

  clear() {
    logTelemetry('WHITEBOARD_ACTION_CLEAR');
    if (!editorInstance) {
      if (window.clearFallbackCanvas) window.clearFallbackCanvas();
      return;
    }
    try {
      const allShapeIds = Array.from(editorInstance.getCurrentPageShapeIds());
      if (allShapeIds.length > 0) {
        editorInstance.deleteShapes(allShapeIds);
      }
    } catch (e) {
      logTelemetry('CLEAR_SHAPES_ERROR', { message: e?.message });
    }
    shapeYOffset = 60;
  },

  zoomFit() {
    logTelemetry('WHITEBOARD_ACTION_ZOOM_FIT');
    if (!editorInstance) return;
    try {
      editorInstance.zoomToFit({ duration: 350 });
    } catch (e) {
      logTelemetry('ZOOM_FIT_ERROR', { message: e?.message });
    }
  },

  addQuestionHeader({ title, chapter, marks }) {
    logTelemetry('WHITEBOARD_ACTION_ADD_HEADER', { title: title?.slice(0, 40), chapter, marks });
    if (!editorInstance) {
      if (window.drawFallbackHeader) window.drawFallbackHeader(title, chapter, marks);
      return;
    }
    const cleanTitle = (title || '')
      .replace(/\$+/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
      .trim();

    safeCreateShape({
      type: 'geo',
      x: 60,
      y: shapeYOffset,
      props: {
        geo: 'rectangle',
        w: 700,
        h: 90,
        color: 'blue',
        fill: 'semi',
        size: 'm',
        text: `${chapter ? chapter.toUpperCase() + (marks ? ` (${marks}M)` : '') + '\n' : ''}${cleanTitle}`
      }
    });
    shapeYOffset += 115;
    this.zoomFit();
  },

  addStepFormula({ stepNum = 1, title = 'Governing Law', formula = '', explanation = '' }) {
    logTelemetry('WHITEBOARD_ACTION_ADD_STEP', { stepNum, title, formula });
    if (!editorInstance) {
      if (window.drawFallbackStep) window.drawFallbackStep(stepNum, title, formula, explanation);
      return;
    }
    const cleanFormula = (formula || '').replace(/\$+/g, '').trim();
    const cleanExp = (explanation || '').replace(/\$+/g, '').trim();

    safeCreateShape({
      type: 'geo',
      x: 60,
      y: shapeYOffset,
      props: {
        geo: 'rectangle',
        w: 700,
        h: 110,
        color: stepNum === 1 ? 'yellow' : (stepNum === 2 ? 'light-blue' : 'green'),
        fill: 'semi',
        size: 'm',
        text: `Step ${stepNum}: ${title}\nFormula: ${cleanFormula}${cleanExp ? '\n' + cleanExp : ''}`
      }
    });
    shapeYOffset += 130;
    this.zoomFit();
  },

  drawPhysicsDiagram(type = 'lens', params = {}) {
    logTelemetry('WHITEBOARD_ACTION_DRAW_DIAGRAM', { type, params });
    if (!editorInstance) {
      if (window.drawFallbackDiagram) window.drawFallbackDiagram(type, params);
      return;
    }
    const cx = 410;
    const cy = shapeYOffset + 120;

    if (type === 'lens' || type === 'optics') {
      // Line shape with object points map conforming to TLLineShape schema
      safeCreateShape({
        type: 'line',
        x: 60,
        y: cy,
        props: {
          points: {
            a1: { id: 'a1', index: 'a1', x: 0, y: 0 },
            a2: { id: 'a2', index: 'a2', x: 700, y: 0 }
          },
          color: 'grey',
          size: 's',
          dash: 'dashed',
          spline: 'line'
        }
      });

      safeCreateShape({
        type: 'geo',
        x: cx - 22,
        y: cy - 90,
        props: {
          geo: 'ellipse',
          w: 44,
          h: 180,
          color: 'light-blue',
          fill: 'semi',
          text: 'Lens'
        }
      });

      safeCreateShape({
        type: 'text',
        x: cx - 140,
        y: cy + 10,
        props: { text: 'F1 (Focus)', size: 's', color: 'orange' }
      });
      safeCreateShape({
        type: 'text',
        x: cx + 110,
        y: cy + 10,
        props: { text: 'F2 (Focus)', size: 's', color: 'orange' }
      });

      safeCreateShape({
        type: 'arrow',
        x: cx - 220,
        y: cy,
        props: {
          start: { x: 0, y: 0 },
          end: { x: 0, y: -70 },
          color: 'red'
        }
      });
      safeCreateShape({
        type: 'text',
        x: cx - 250,
        y: cy - 90,
        props: { text: 'Object (h)', size: 's', color: 'red' }
      });

      safeCreateShape({
        type: 'arrow',
        x: cx - 220,
        y: cy - 70,
        props: {
          start: { x: 0, y: 0 },
          end: { x: 220, y: 0 },
          color: 'yellow'
        }
      });
      safeCreateShape({
        type: 'arrow',
        x: cx,
        y: cy - 70,
        props: {
          start: { x: 0, y: 0 },
          end: { x: 260, y: 150 },
          color: 'yellow'
        }
      });

      safeCreateShape({
        type: 'arrow',
        x: cx + 260,
        y: cy,
        props: {
          start: { x: 0, y: 0 },
          end: { x: 0, y: 80 },
          color: 'green'
        }
      });
      safeCreateShape({
        type: 'text',
        x: cx + 270,
        y: cy + 30,
        props: { text: 'Image (Real, Inverted)', size: 's', color: 'green' }
      });

      shapeYOffset += 260;
    } else if (type === 'circuit' || type === 'electricity') {
      safeCreateShape({
        type: 'geo',
        x: 90,
        y: cy - 60,
        props: {
          geo: 'rectangle',
          w: 620,
          h: 150,
          color: 'grey',
          fill: 'none',
          text: ''
        }
      });

      safeCreateShape({
        type: 'geo',
        x: 320,
        y: cy - 80,
        props: {
          geo: 'rectangle',
          w: 160,
          h: 40,
          color: 'orange',
          fill: 'semi',
          text: 'Resistor (R = V/I)'
        }
      });

      safeCreateShape({
        type: 'geo',
        x: 340,
        y: cy + 70,
        props: {
          geo: 'rectangle',
          w: 120,
          h: 36,
          color: 'green',
          fill: 'semi',
          text: 'Battery (V)'
        }
      });

      shapeYOffset += 210;
    } else {
      safeCreateShape({
        type: 'geo',
        x: 100,
        y: cy - 40,
        props: {
          geo: 'cloud',
          w: 580,
          h: 120,
          color: 'violet',
          fill: 'semi',
          text: params.label || 'Concept Visual Framework'
        }
      });
      shapeYOffset += 160;
    }

    this.zoomFit();
  },

  highlightDoubt({ doubtText, answerText }) {
    logTelemetry('WHITEBOARD_ACTION_HIGHLIGHT_DOUBT', { doubtText, answerText });
    if (!editorInstance) {
      if (window.drawFallbackDoubt) window.drawFallbackDoubt(doubtText, answerText);
      return;
    }
    const curY = shapeYOffset;

    safeCreateShape({
      type: 'note',
      x: 480,
      y: curY,
      props: {
        color: 'red',
        text: `Doubt: "${doubtText}"\n\nExplanation: ${answerText}`
      }
    });

    safeCreateShape({
      type: 'arrow',
      x: 410,
      y: curY + 40,
      props: {
        start: { x: 0, y: 0 },
        end: { x: 60, y: 0 },
        color: 'red'
      }
    });

    shapeYOffset += 160;
    this.zoomFit();
  },

  addFinalAnswer({ answer, keyInsight }) {
    logTelemetry('WHITEBOARD_ACTION_FINAL_ANSWER', { answer, keyInsight });
    if (!editorInstance) {
      if (window.drawFallbackFinal) window.drawFallbackFinal(answer, keyInsight);
      return;
    }
    const cleanAnswer = (answer || '').replace(/\$+/g, '').trim();

    safeCreateShape({
      type: 'geo',
      x: 100,
      y: shapeYOffset,
      props: {
        geo: 'diamond',
        w: 580,
        h: 110,
        color: 'green',
        fill: 'semi',
        size: 'm',
        text: `FINAL ANSWER:\n${cleanAnswer}\n(${keyInsight || 'Verified by CBSE Standard'})`
      }
    });

    shapeYOffset += 140;
    this.zoomFit();
  }
};

window.whiteboardController = WhiteboardController;

function processWhiteboardEvent(data) {
  if (!data || !data.type) return;
  logTelemetry('DISPATCH_WHITEBOARD_EVENT', { type: data.type, payload: data.payload });

  if (!editorInstance) {
    queuedEvents.push(data);
    if (window.drawFallbackHeader && data.type === 'INIT_QUESTION') {
      window.clearFallbackCanvas && window.clearFallbackCanvas();
      window.drawFallbackHeader(data.payload?.title, data.payload?.chapter, data.payload?.marks);
    } else if (window.drawFallbackDiagram && data.type === 'DRAW_DIAGRAM') {
      window.drawFallbackDiagram(data.payload?.diagramType, data.payload || {});
    } else if (window.drawFallbackStep && data.type === 'WRITE_STEP') {
      window.drawFallbackStep(data.payload?.stepNum, data.payload?.title, data.payload?.formula, data.payload?.explanation);
    } else if (window.drawFallbackDoubt && data.type === 'HIGHLIGHT_DOUBT') {
      window.drawFallbackDoubt(data.payload?.doubtText, data.payload?.answerText);
    } else if (window.drawFallbackFinal && data.type === 'FINAL_ANSWER') {
      window.drawFallbackFinal(data.payload?.answer, data.payload?.keyInsight);
    } else if (window.clearFallbackCanvas && data.type === 'CLEAR_BOARD') {
      window.clearFallbackCanvas();
    }
    return;
  }

  switch (data.type) {
    case 'INIT_QUESTION':
      WhiteboardController.clear();
      WhiteboardController.addQuestionHeader(data.payload || {});
      break;

    case 'DRAW_DIAGRAM':
      WhiteboardController.drawPhysicsDiagram(data.payload?.diagramType, data.payload || {});
      break;

    case 'WRITE_STEP':
      WhiteboardController.addStepFormula(data.payload || {});
      break;

    case 'HIGHLIGHT_DOUBT':
      WhiteboardController.highlightDoubt(data.payload || {});
      break;

    case 'FINAL_ANSWER':
      WhiteboardController.addFinalAnswer(data.payload || {});
      break;

    case 'CLEAR_BOARD':
      WhiteboardController.clear();
      break;

    case 'ZOOM_FIT':
      WhiteboardController.zoomFit();
      break;
  }
}

function WhiteboardApp() {
  useEffect(() => {
    const timer = setTimeout(() => {
      hideLoader();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleMount = (editor) => {
    editorInstance = editor;
    logTelemetry('TLDRAW_EDITOR_MOUNTED_SUCCESSFULLY');
    hideLoader();

    while (queuedEvents.length > 0) {
      const evt = queuedEvents.shift();
      processWhiteboardEvent(evt);
    }

    window.parent.postMessage({ type: 'WHITEBOARD_READY' }, '*');
  };

  return React.createElement(
    'div',
    { style: { position: 'fixed', inset: 0, width: '100%', height: '100%' } },
    React.createElement(
      ErrorBoundary,
      null,
      React.createElement(Tldraw, {
        onMount: handleMount,
        autoFocus: false,
        inferDarkMode: true,
        components: {
          ErrorFallback: CustomErrorFallback
        }
      })
    )
  );
}

async function init() {
  logTelemetry('WHITEBOARD_CLIENT_INIT_CALLED');
  await purgeCorruptStorage();

  const rootEl = document.getElementById('root');
  if (rootEl) {
    try {
      const root = createRoot(rootEl);
      root.render(React.createElement(WhiteboardApp));
      logTelemetry('REACT_ROOT_RENDER_CALLED');
    } catch (e) {
      logTelemetry('REACT_ROOT_RENDER_FAILED', { message: e?.message, stack: e?.stack });
    }
  } else {
    logTelemetry('ROOT_ELEMENT_NOT_FOUND');
  }

  document.getElementById('btnWbClear')?.addEventListener('click', () => {
    WhiteboardController.clear();
  });
  document.getElementById('btnWbFit')?.addEventListener('click', () => {
    WhiteboardController.zoomFit();
  });

  window.addEventListener('message', (event) => {
    processWhiteboardEvent(event.data);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
