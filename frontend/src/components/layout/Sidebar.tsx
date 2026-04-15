import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@apollo/client/react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useUiStore } from '@/lib/stores/uiStore'
import { SIGN_OUT_MUTATION } from '@/lib/graphql/operations/auth'

export function Sidebar() {
  const { user, clearAuth } = useAuthStore()
  const { setIsTweetModalOpen } = useUiStore()
  const navigate = useNavigate()
  const [signOut] = useMutation(SIGN_OUT_MUTATION)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // ignore errors, clear auth regardless
    }
    clearAuth()
    navigate({ to: '/login' })
  }

  return (
    <aside className="hidden md:flex flex-col w-16 lg:w-56 xl:w-64 shrink-0 sticky top-0 h-screen py-4 px-2 lg:px-4 border-r border-divider">
      <div className="flex items-center gap-3 mb-6 px-2">
        <span className="text-xl font-bold text-foreground hidden lg:block">MiniTwitter</span>
        <svg className="w-7 h-7 text-primary lg:hidden" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
        </svg>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-full text-foreground hover:bg-default-100 transition-colors [&.active]:font-bold [&.active]:text-primary"
        >
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="hidden lg:block">ホーム</span>
        </Link>

        <Link
          to="/search"
          className="flex items-center gap-3 px-3 py-2.5 rounded-full text-foreground hover:bg-default-100 transition-colors [&.active]:font-bold [&.active]:text-primary"
        >
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden lg:block">検索</span>
        </Link>

        {user && (
          <Link
            to="/users/$username"
            params={{ username: user.username }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-full text-foreground hover:bg-default-100 transition-colors [&.active]:font-bold [&.active]:text-primary"
          >
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden lg:block">プロフィール</span>
          </Link>
        )}

        <button
          onClick={() => setIsTweetModalOpen(true)}
          className="mt-4 flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
        >
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden lg:block">ツイートする</span>
        </button>
      </nav>

      <div className="mt-auto">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-full text-foreground hover:bg-default-100 transition-colors w-full"
        >
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden lg:block text-sm">ログアウト</span>
        </button>
      </div>
    </aside>
  )
}
