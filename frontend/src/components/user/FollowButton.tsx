import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { FollowUserDocument, UnfollowUserDocument } from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'

interface FollowButtonProps {
  userId: string
  isFollowedByMe: boolean
  username: string
}

export function FollowButton({ userId, isFollowedByMe, username }: FollowButtonProps) {
  const { user } = useAuthStore()
  const [hovering, setHovering] = useState(false)

  const [followUser, { loading: followLoading }] = useMutation(FollowUserDocument, {
    variables: { userUuid: userId },
    optimisticResponse: {
      followUser: {
        __typename: 'User',
        id: userId,
        username,
        displayName: '',
        isFollowedByMe: true,
        followersCount: 0,
        followingCount: 0,
      },
    },
  })

  const [unfollowUser, { loading: unfollowLoading }] = useMutation(UnfollowUserDocument, {
    variables: { userUuid: userId },
    optimisticResponse: {
      unfollowUser: {
        __typename: 'User',
        id: userId,
        username,
        displayName: '',
        isFollowedByMe: false,
        followersCount: 0,
        followingCount: 0,
      },
    },
  })

  if (user?.id === userId) return null

  const loading = followLoading || unfollowLoading

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    if (isFollowedByMe) {
      unfollowUser()
    } else {
      followUser()
    }
  }

  if (isFollowedByMe) {
    const showUnfollow = hovering
    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        disabled={loading}
        className={`rounded-full px-4 py-1.5 text-sm font-bold border transition-colors ${
          showUnfollow
            ? 'border-danger/40 text-danger bg-danger/10'
            : 'border-default-300 text-foreground'
        } disabled:opacity-50`}
      >
        {showUnfollow ? 'フォロー解除' : 'フォロー中'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-full px-4 py-1.5 text-sm font-bold bg-foreground text-background transition-opacity disabled:opacity-50"
    >
      フォローする
    </button>
  )
}
