'use client';

import { Button } from '@repo/design/components/ui/button';
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {}

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">something went wrong</p>
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false })}
            >
              try again
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
