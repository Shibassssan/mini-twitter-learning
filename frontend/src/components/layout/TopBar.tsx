import { Link } from '@tanstack/react-router'
import { Separator } from '@heroui/react'
import { useAuthStore } from '@/lib/stores/authStore'
import { AppLogo } from '@/components/icons/AppLogo'
import { InitialsAvatar } from '@/components/ui/InitialsAvatar'

export function TopBar() {
  const { user } = useAuthStore()

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <AppLogo className="w-6 h-6 text-accent" />
          <span className="text-base font-bold text-foreground tracking-tight">MiniPost</span>
        </div>

        {user && (
          <Link
            to="/users/$username"
            params={{ username: user.username }}
            aria-label="プロフィール"
          >
            <InitialsAvatar
              displayName={user.displayName}
              username={user.username}
            />
          </Link>
        )}
      </div>
      <Separator />
    </header>
  )
}
