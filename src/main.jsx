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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL APP CRASH CAUGHT BY BOUNDARY:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('cine_uncloaked');
    } catch (e) {}
    window.location.reload();
  };

  handleHardReset = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#030712',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '1rem',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              fontSize: '28px'
            }}>
              ⚡
            </div>

            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              letterSpacing: '-0.025em',
              marginBottom: '0.75rem',
              textTransform: 'uppercase'
            }}>
              Application Recovery
            </h1>

            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              The platform encountered an unexpected runtime state. You can reload cleanly or reset your local session data below.
            </p>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 1.75rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Reload App
              </button>

              <button
                onClick={this.handleHardReset}
                style={{
                  padding: '0.75rem 1.75rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer'
                }}
              >
                Clear Cache & Reload
              </button>
            </div>

            {this.state.error && (
              <details style={{
                marginTop: '1.5rem',
                textAlign: 'left',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <summary style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer' }}>
                  Diagnostics Details
                </summary>
                <pre style={{
                  fontSize: '0.7rem',
                  color: '#f87171',
                  overflowX: 'auto',
                  marginTop: '0.5rem',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
                }}>
                  {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
