import { useNavigate } from '@tanstack/react-router'
import { Button } from '@heroui/react'

export function FAB() {
  const navigate = useNavigate()
  return (
    <Button
      isIconOnly
      variant="primary"
      size="lg"
      onPress={() => navigate({ to: '/compose' })}
      className="md:hidden fixed bottom-20 right-4 z-20 size-14 rounded-full shadow-lg text-2xl"
      aria-label="投稿を作成"
    >
      +
    </Button>
  )
}
