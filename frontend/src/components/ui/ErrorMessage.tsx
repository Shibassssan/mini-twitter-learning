interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

export function ErrorMessage({ message = 'エラーが発生しました', onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
      <p className="text-danger">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="text-primary text-sm underline">
          再試行
        </button>
      )}
    </div>
  )
}
