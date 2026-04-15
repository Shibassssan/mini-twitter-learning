interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'まだツイートはありません' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-default-400 text-base">{message}</p>
    </div>
  )
}
