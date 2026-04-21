import { Link } from '@tanstack/react-router'
import { Avatar, Separator, Tooltip } from '@heroui/react'
import { useAuthStore } from '@/lib/stores/authStore'

export function BottomNav() {
  const { user } = useAuthStore()
  const initials = user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : '?'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur md:hidden">
      <Separator />
      <div className="flex items-center justify-around px-4 py-2">
        <Tooltip>
          <Tooltip.Trigger>
            <Link
              to="/"
              aria-label="ホーム"
              className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 p-2 text-default-500 [&.active]:text-primary"
            >
              <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">ホーム</span>
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Content>ホーム</Tooltip.Content>
        </Tooltip>

        <Tooltip>
          <Tooltip.Trigger>
            <Link
              to="/search"
              aria-label="検索"
              className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 p-2 text-default-500 [&.active]:text-primary"
            >
              <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs">検索</span>
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Content>検索</Tooltip.Content>
        </Tooltip>

        <Tooltip>
          <Tooltip.Trigger>
            <Link
              to="/users/$username"
              params={{ username: user?.username ?? '' }}
              aria-label="プロフィール"
              className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 p-2 text-default-500 [&.active]:text-primary"
            >
              <Avatar size="sm" color="accent" className="w-6 h-6">
                <Avatar.Fallback className="text-[10px]">{initials}</Avatar.Fallback>
              </Avatar>
              <span className="text-xs">プロフィール</span>
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Content>プロフィール</Tooltip.Content>
        </Tooltip>
      </div>
    </nav>
  )
}
