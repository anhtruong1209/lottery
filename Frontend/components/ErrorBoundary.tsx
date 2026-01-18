import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center z-50 relative">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Đã xảy ra lỗi hệ thống</h1>
                    <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full border border-red-500/30">
                        <h2 className="text-xl font-bold text-yellow-400 mb-2">{this.state.error?.toString()}</h2>
                        <details className="whitespace-pre-wrap text-sm text-gray-400 overflow-auto max-h-96">
                            {this.state.errorInfo?.componentStack}
                        </details>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-bold transition-colors"
                        >
                            Tải lại trang
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem('vishipel_token');
                                localStorage.removeItem('vishipel_auth');
                                window.location.reload();
                            }}
                            className="mt-6 ml-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white font-bold transition-colors"
                        >
                            Đăng xuất & Reset
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
