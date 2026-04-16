import { Button } from '@heroui/react'

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

export function ErrorMessage({ message = 'エラーが発生しました', onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <p className="text-danger">{message}</p>
      {onRetry && (
        <Button variant="ghost" size="sm" onPress={onRetry}>
          再試行
        </Button>
      )}
    </div>
  )
}
