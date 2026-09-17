import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Vectra interface error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page-error">
        <span><i className="bi bi-exclamation-triangle" /></span>
        <h1>This workspace could not be displayed</h1>
        <p>The rest of Vectra is still available. Reload this page or return to the dashboard.</p>
        <div>
          <button className="btn btn-light" onClick={() => window.location.reload()}>Reload page</button>
          <a className="btn btn-primary" href="/dashboard">Open dashboard</a>
        </div>
      </div>
    );
  }
}
