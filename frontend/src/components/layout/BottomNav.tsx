import { Link } from '@tanstack/react-router'
import { useAuthStore } from '@/lib/stores/authStore'

export function BottomNav() {
  const { user } = useAuthStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur border-t border-divider md:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        <Link
          to="/"
          className="flex flex-col items-center gap-1 p-2 text-default-500 [&.active]:text-primary"
        >
          <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">ホーム</span>
        </Link>
        <Link
          to="/search"
          className="flex flex-col items-center gap-1 p-2 text-default-500 [&.active]:text-primary"
        >
          <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs">検索</span>
        </Link>
        <Link
          to="/users/$username"
          params={{ username: user?.username ?? '' }}
          className="flex flex-col items-center gap-1 p-2 text-default-500 [&.active]:text-primary"
        >
          <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">プロフィール</span>
        </Link>
      </div>
    </nav>
  )
}
