import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@apollo/client/react'
import { Button } from '@heroui/react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useUiStore } from '@/lib/stores/uiStore'
import { SignOutDocument } from '@/lib/graphql/generated/graphql'
import { AppLogo } from '@/components/icons/AppLogo'

export function Sidebar() {
  const { user, clearAuth } = useAuthStore()
  const { setIsTweetModalOpen } = useUiStore()
  const navigate = useNavigate()
  const [signOut] = useMutation(SignOutDocument)

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
    <aside className="hidden md:flex flex-col w-[72px] lg:w-60 xl:w-64 shrink-0 sticky top-0 h-screen py-5 px-3 lg:px-5 border-r border-border/60">
      <div className="flex items-center gap-3 mb-8 px-2">
        <AppLogo />
        <span className="text-xl font-bold text-foreground tracking-tight hidden lg:block">MiniPost</span>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        <Link
          to="/"
          aria-label="ホーム"
          className="flex items-center gap-3.5 px-3 py-3 rounded-xl text-foreground/80 hover:bg-default hover:text-foreground transition-colors [&.active]:font-semibold [&.active]:text-accent [&.active]:bg-accent/10"
        >
          <svg aria-hidden="true" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="hidden lg:block text-[15px]" aria-hidden="true">ホーム</span>
        </Link>

        <Link
          to="/search"
          aria-label="検索"
          className="flex items-center gap-3.5 px-3 py-3 rounded-xl text-foreground/80 hover:bg-default hover:text-foreground transition-colors [&.active]:font-semibold [&.active]:text-accent [&.active]:bg-accent/10"
        >
          <svg aria-hidden="true" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <span className="hidden lg:block text-[15px]" aria-hidden="true">検索</span>
        </Link>

        {user && (
          <Link
            to="/users/$username"
            params={{ username: user.username }}
            aria-label="プロフィール"
            className="flex items-center gap-3.5 px-3 py-3 rounded-xl text-foreground/80 hover:bg-default hover:text-foreground transition-colors [&.active]:font-semibold [&.active]:text-accent [&.active]:bg-accent/10"
          >
            <svg aria-hidden="true" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span className="hidden lg:block text-[15px]" aria-hidden="true">プロフィール</span>
          </Link>
        )}

        <Button
          variant="primary"
          aria-label="投稿する"
          onPress={() => setIsTweetModalOpen(true)}
          className="mt-5 flex items-center justify-center lg:justify-start gap-3 px-3 py-3 h-auto rounded-xl font-semibold text-[15px]"
        >
          <svg aria-hidden="true" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden lg:block" aria-hidden="true">投稿する</span>
        </Button>
      </nav>

      <div className="mt-auto">
        <Button
          variant="ghost"
          aria-label="ログアウト"
          onPress={handleSignOut}
          fullWidth
          className="flex items-center gap-3.5 px-3 py-3 h-auto rounded-xl text-foreground/60 hover:text-foreground hover:bg-default"
        >
          <svg aria-hidden="true" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
          </svg>
          <span className="hidden lg:block text-[15px]" aria-hidden="true">ログアウト</span>
        </Button>
      </div>
    </aside>
  )
}
