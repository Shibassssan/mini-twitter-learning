import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useQuery } from '@apollo/client/react'
import { useAuthStore } from '@/lib/stores/authStore'
import { UserByUsernameDocument } from '@/lib/graphql/generated/graphql'
import { ProfileHeader } from '@/components/user/ProfileHeader'
import { ProfileEditModal } from '@/components/user/ProfileEditModal'
import { ProfileSkeleton } from '@/components/user/ProfileSkeleton'
import { ProfileTabs } from '@/components/user/ProfileTabs'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export const Route = createFileRoute('/_auth/users/$username')({
  component: UserProfilePage,
})

function UserProfilePage() {
  const { username } = Route.useParams()
  const { pathname } = useLocation()
  const { user: me } = useAuthStore()

  const { data, loading, error } = useQuery(UserByUsernameDocument, {
    variables: { username },
  })

  if (pathname.endsWith('/connections')) return <Outlet />

  if (error) return <ErrorMessage message={error.message} onRetry={() => window.location.reload()} />
  if (loading || !data) return <ProfileSkeleton />

  const user = data.userByUsername
  const isOwnProfile = me?.id === user.id

  return (
    <div>
      <ProfileHeader user={user} />
      <ProfileTabs userId={user.id} isOwnProfile={isOwnProfile} />
      {isOwnProfile && <ProfileEditModal user={user} />}
    </div>
  )
}
