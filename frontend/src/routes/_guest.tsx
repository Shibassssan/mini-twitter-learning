import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/lib/stores/authStore'

export const Route = createFileRoute('/_guest')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: GuestLayout,
})

function GuestLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse 70% 40% at 50% -5%, oklch(0.94 0.025 264 / 0.7), transparent), var(--background)',
      }}
    >
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
