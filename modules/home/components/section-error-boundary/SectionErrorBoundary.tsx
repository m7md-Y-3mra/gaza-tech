'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

type Props = {
  fallbackMessage: string;
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SectionErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border-destructive/25 bg-destructive/5 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-destructive">{this.props.fallbackMessage}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
