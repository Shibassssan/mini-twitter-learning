import { Spinner } from '@heroui/react'

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" color="accent" />
        <p className="text-lg font-semibold text-foreground">MiniTwitter</p>
      </div>
    </div>
  )
}
