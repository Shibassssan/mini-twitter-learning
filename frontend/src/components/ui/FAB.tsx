import { useNavigate } from '@tanstack/react-router'

export function FAB() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate({ to: '/compose' })}
      className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-20"
      aria-label="ツイートを作成"
    >
      +
    </button>
  )
}
