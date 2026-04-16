import { Avatar } from '@heroui/react'
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
        <Avatar size="sm" color="accent">
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar>
      </div>
    </header>
  )
}
