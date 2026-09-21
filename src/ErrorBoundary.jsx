import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
            role="alert" 
            aria-live="assertive"
            className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-900"
        >
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden">
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-start gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                <ShieldAlert className="w-8 h-8" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-800">System Failure Detected</h1>
                <p className="text-red-600 mt-1">A critical error occurred in the EcoGuard system.</p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50">
                <details className="group" open>
                    <summary className="font-semibold text-slate-700 cursor-pointer list-none flex items-center gap-2 select-none">
                        <span className="group-open:hidden">▶</span>
                        <span className="hidden group-open:inline">▼</span>
                        Error Diagnostics
                    </summary>
                    <div className="mt-4 p-4 bg-slate-900 text-red-400 font-mono text-xs rounded overflow-auto max-h-[400px]">
                        <p className="font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                        <pre className="text-slate-400 whitespace-pre-wrap">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                </details>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reboot System
                </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
