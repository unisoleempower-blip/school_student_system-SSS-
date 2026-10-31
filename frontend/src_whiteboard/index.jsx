import React, { Component, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Tldraw } from 'tldraw';

let editorInstance = null;
let shapeYOffset = 60;
const queuedEvents = [];

function hideLoader() {
  const loader = document.getElementById('whiteboard-loading');
  if (loader && loader.style.display !== 'none') {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 200);
  }
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[TLDRAW WHITEBOARD ERROR BOUNDARY]:', error, errorInfo);
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
      console.warn('Error clearing shapes:', e);
    }
    shapeYOffset = 60;
  },

  zoomFit() {
    if (!editorInstance) return;
    try {
      editorInstance.zoomToFit({ duration: 350 });
    } catch (e) {
      console.warn('zoomToFit error:', e);
    }
  },

  addQuestionHeader({ title, chapter, marks }) {
    if (!editorInstance) {
      if (window.drawFallbackHeader) window.drawFallbackHeader(title, chapter, marks);
      return;
    }
    const cleanTitle = (title || '')
      .replace(/\$+/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
      .trim();

    try {
      editorInstance.createShape({
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
    } catch (e) {
      console.warn('createShape header error:', e);
    }
  },

  addStepFormula({ stepNum = 1, title = 'Governing Law', formula = '', explanation = '' }) {
    if (!editorInstance) {
      if (window.drawFallbackStep) window.drawFallbackStep(stepNum, title, formula, explanation);
      return;
    }
    const cleanFormula = (formula || '').replace(/\$+/g, '').trim();
    const cleanExp = (explanation || '').replace(/\$+/g, '').trim();

    try {
      editorInstance.createShape({
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
    } catch (e) {
      console.warn('createShape step error:', e);
    }
  },

  drawPhysicsDiagram(type = 'lens', params = {}) {
    if (!editorInstance) {
      if (window.drawFallbackDiagram) window.drawFallbackDiagram(type, params);
      return;
    }
    const cx = 410;
    const cy = shapeYOffset + 120;

    try {
      if (type === 'lens' || type === 'optics') {
        editorInstance.createShape({
          type: 'line',
          x: 60,
          y: cy,
          props: {
            points: [
              { id: 'p1', index: 'a1', x: 0, y: 0 },
              { id: 'p2', index: 'a2', x: 700, y: 0 }
            ],
            color: 'grey',
            size: 's',
            dash: 'dashed'
          }
        });

        editorInstance.createShape({
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

        editorInstance.createShape({
          type: 'text',
          x: cx - 140,
          y: cy + 10,
          props: { text: 'F1 (Focus)', size: 's', color: 'orange' }
        });
        editorInstance.createShape({
          type: 'text',
          x: cx + 110,
          y: cy + 10,
          props: { text: 'F2 (Focus)', size: 's', color: 'orange' }
        });

        editorInstance.createShape({
          type: 'arrow',
          x: cx - 220,
          y: cy,
          props: {
            start: { x: 0, y: 0 },
            end: { x: 0, y: -70 },
            color: 'red'
          }
        });
        editorInstance.createShape({
          type: 'text',
          x: cx - 250,
          y: cy - 90,
          props: { text: 'Object (h)', size: 's', color: 'red' }
        });

        editorInstance.createShape({
          type: 'arrow',
          x: cx - 220,
          y: cy - 70,
          props: {
            start: { x: 0, y: 0 },
            end: { x: 220, y: 0 },
            color: 'yellow'
          }
        });
        editorInstance.createShape({
          type: 'arrow',
          x: cx,
          y: cy - 70,
          props: {
            start: { x: 0, y: 0 },
            end: { x: 260, y: 150 },
            color: 'yellow'
          }
        });

        editorInstance.createShape({
          type: 'arrow',
          x: cx + 260,
          y: cy,
          props: {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 80 },
            color: 'green'
          }
        });
        editorInstance.createShape({
          type: 'text',
          x: cx + 270,
          y: cy + 30,
          props: { text: 'Image (Real, Inverted)', size: 's', color: 'green' }
        });

        shapeYOffset += 260;
      } else if (type === 'circuit' || type === 'electricity') {
        editorInstance.createShape({
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

        editorInstance.createShape({
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

        editorInstance.createShape({
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
        editorInstance.createShape({
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
    } catch (e) {
      console.warn('drawPhysicsDiagram error:', e);
    }
  },

  highlightDoubt({ doubtText, answerText }) {
    if (!editorInstance) {
      if (window.drawFallbackDoubt) window.drawFallbackDoubt(doubtText, answerText);
      return;
    }
    const curY = shapeYOffset;

    try {
      editorInstance.createShape({
        type: 'note',
        x: 480,
        y: curY,
        props: {
          color: 'red',
          text: `Doubt: "${doubtText}"\n\nExplanation: ${answerText}`
        }
      });

      editorInstance.createShape({
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
    } catch (e) {
      console.warn('highlightDoubt error:', e);
    }
  },

  addFinalAnswer({ answer, keyInsight }) {
    if (!editorInstance) {
      if (window.drawFallbackFinal) window.drawFallbackFinal(answer, keyInsight);
      return;
    }
    const cleanAnswer = (answer || '').replace(/\$+/g, '').trim();

    try {
      editorInstance.createShape({
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
    } catch (e) {
      console.warn('addFinalAnswer error:', e);
    }
  }
};

window.whiteboardController = WhiteboardController;

function processWhiteboardEvent(data) {
  if (!data || !data.type) return;
  if (!editorInstance) {
    queuedEvents.push(data);
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
    // Safety timer: Dismiss loading spinner after max 700ms so screen is never blocked
    const timer = setTimeout(() => {
      hideLoader();
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleMount = (editor) => {
    editorInstance = editor;
    console.log('[TLDRAW WHITEBOARD] Local bundle Editor mounted successfully!');
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
        inferDarkMode: true
      })
    )
  );
}

function init() {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    const root = createRoot(rootEl);
    root.render(React.createElement(WhiteboardApp));
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
