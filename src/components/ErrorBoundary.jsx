import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px',
            padding: '40px',
            textAlign: 'center',
            background: 'var(--background)',
          }}
        >
          <div
            style={{
              padding: '20px',
              borderRadius: '50%',
              background: 'rgba(255, 59, 48, 0.1)',
              color: '#FF3B30',
            }}
          >
            <AlertTriangle size={40} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', fontSize: '0.95rem' }}>
            {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          <button
            className="btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{ justifyContent: 'center' }}
          >
            <RefreshCw size={18} />
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
