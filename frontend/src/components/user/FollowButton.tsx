import { memo } from 'react'
import { useMutation } from '@apollo/client/react'
import { Button } from '@heroui/react'
import { FollowUserDocument, UnfollowUserDocument } from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'

interface FollowButtonProps {
  userId: string
  isFollowedByMe: boolean
  username: string
  displayName?: string
  followersCount?: number
  followingCount?: number
}

export const FollowButton = memo(function FollowButton({
  userId,
  isFollowedByMe,
  username,
  displayName,
  followersCount,
  followingCount,
}: FollowButtonProps) {
  const { user } = useAuthStore()

  const name = displayName ?? username
  const followers = followersCount ?? 0
  const following = followingCount ?? 0

  const [followUser, { loading: followLoading }] = useMutation(FollowUserDocument, {
    variables: { userUuid: userId },
    optimisticResponse: {
      followUser: {
        __typename: 'User',
        id: userId,
        username,
        displayName: name,
        isFollowedByMe: true,
        followersCount: followers + 1,
        followingCount: following,
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
        displayName: name,
        isFollowedByMe: false,
        followersCount: Math.max(0, followers - 1),
        followingCount: following,
      },
    },
  })

  if (user?.id === userId) return null

  const loading = followLoading || unfollowLoading

  if (isFollowedByMe) {
    return (
      <Button
        variant="outline"
        size="sm"
        isDisabled={loading}
        onPress={() => unfollowUser()}
        className="group rounded-full hover:border-danger/40 hover:text-danger hover:bg-danger/10"
      >
        <span className="group-hover:hidden">フォロー中</span>
        <span className="hidden group-hover:inline">フォロー解除</span>
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      isDisabled={loading}
      onPress={() => followUser()}
      className="rounded-full bg-foreground text-background"
    >
      フォローする
    </Button>
  )
})
