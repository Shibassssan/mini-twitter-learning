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
      <TopBar />
      <div className="flex max-w-4xl mx-auto">
        <Sidebar />
        <main className="flex-1 min-h-screen border-x border-divider pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <TweetComposerModal />
    </div>
  )
}
