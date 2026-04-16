import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/lib/stores/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { TweetComposerModal } from '@/components/tweet/TweetComposerModal'

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="skip-link rounded-md bg-foreground px-4 py-2 text-background outline-none"
      >
        メインコンテンツへスキップ
      </a>
      <TopBar />
      <div className="flex w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-0 sm:px-0">
        <Sidebar />
        <main
          id="main-content"
          className="flex-1 min-h-screen border-x border-divider pb-16 md:pb-0 w-full min-w-0"
        >
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <TweetComposerModal />
    </div>
  )
}
