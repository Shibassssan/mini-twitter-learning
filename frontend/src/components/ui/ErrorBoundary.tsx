import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@heroui/react'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
          <div className="flex flex-col items-center gap-6 max-w-md text-center">
            <p className="text-lg font-semibold text-foreground">
              予期しないエラーが発生しました
            </p>
            {this.state.error && (
              <p className="text-sm text-default-500 break-all">
                {this.state.error.message}
              </p>
            )}
            <Button variant="primary" onPress={() => window.location.reload()}>
              再読み込み
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
