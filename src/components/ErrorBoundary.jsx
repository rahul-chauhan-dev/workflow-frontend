import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card">
          <h2>Something went wrong</h2>
          <p className="card-text">An unexpected error occurred while showing this page.</p>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
            <a className="btn" href="/">
              Go to projects
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;