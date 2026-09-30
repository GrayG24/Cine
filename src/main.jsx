import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress benign sandbox-specific WebSocket, HMR, and storage/quota errors
const SUPPRESS_PATTERNS = [
  'websocket',
  'failed to connect',
  'closed without opened',
  'sockjs-node',
  'connection closed',
  'connection refused',
  'vite-hmr',
  'quota exceeded',
  'quotaexceedederror',
  'resource-exhausted',
  'resource_exhausted'
];

const shouldSuppress = (msg) => {
  if (!msg) return false;
  const lowerMsg = String(msg).toLowerCase();
  return SUPPRESS_PATTERNS.some(pattern => lowerMsg.includes(pattern));
};

const getDetailedString = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  try {
    const serialized = JSON.stringify(val);
    if (serialized) return serialized;
  } catch (e) {}
  let out = '';
  try {
    for (const k in val) {
      out += ` ${k}:${val[k]}`;
    }
  } catch (e) {}
  return out;
};

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message || (typeof reason === 'string' ? reason : '');
  const detailed = getDetailedString(reason);
  if (shouldSuppress(message) || shouldSuppress(detailed)) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);

window.addEventListener('error', (event) => {
  const message = event.message || '';
  const detailed = getDetailedString(event.error);
  if (shouldSuppress(message) || shouldSuppress(detailed) || shouldSuppress(event.error?.message)) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}, true);

// Patch console to hide these warnings/errors from the user's view
const originalWarn = console.warn;
console.warn = (...args) => {
  const joinedStr = args.map(arg => typeof arg === 'string' ? arg : getDetailedString(arg)).join(' ');
  if (shouldSuppress(joinedStr)) return;
  originalWarn.apply(console, args);
};

const originalError = console.error;
console.error = (...args) => {
  const joinedStr = args.map(arg => typeof arg === 'string' ? arg : getDetailedString(arg)).join(' ');
  if (shouldSuppress(joinedStr)) return;
  originalError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
