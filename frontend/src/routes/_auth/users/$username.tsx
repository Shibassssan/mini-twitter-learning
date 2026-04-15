import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/users/$username')({
  component: UserProfilePage,
})

function UserProfilePage() {
  const { username } = Route.useParams()

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">@{username}</h1>
      <p className="text-default-500 mt-2">プロフィール機能はPhase 3で実装予定です。</p>
    </div>
  )
}
