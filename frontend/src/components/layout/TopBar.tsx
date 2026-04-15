import { useAuthStore } from '@/lib/stores/authStore'

export function TopBar() {
  const { user } = useAuthStore()

  const initials = user?.displayName
    ? user.displayName.slice(0, 2).toUpperCase()
    : '?'

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur md:hidden border-b border-divider">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-lg font-bold text-foreground">MiniTwitter</span>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  )
}
