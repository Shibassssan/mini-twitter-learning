import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Button } from '@heroui/react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useUiStore } from '@/lib/stores/uiStore'
import { FollowButton } from '@/components/user/FollowButton'
import { AvatarUploader } from '@/components/user/AvatarUploader'
import type { UserByUsernameQuery } from '@/lib/graphql/generated/graphql'

type ProfileUser = UserByUsernameQuery['userByUsername']

interface ProfileHeaderProps {
  user: ProfileUser
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { user: me } = useAuthStore()
  const { setIsProfileEditOpen } = useUiStore()
  const isOwnProfile = me?.id === user.id

  const joinDate = dayjs(user.createdAt).format('YYYY年M月から利用')

  return (
    <div>
      <div className="h-[150px] bg-gradient-to-r from-primary/60 to-primary/30" />

      <div className="px-4">
        <div className="flex justify-between items-start">
          <div className="-mt-10 border-4 border-background rounded-full">
            <AvatarUploader
              currentAvatarUrl={user.avatarUrl}
              displayName={user.displayName}
              size="lg"
              editable={isOwnProfile}
            />
          </div>

          <div className="mt-3">
            {isOwnProfile ? (
              <Button
                variant="outline"
                size="sm"
                onPress={() => setIsProfileEditOpen(true)}
                className="rounded-full"
              >
                プロフィールを編集
              </Button>
            ) : (
              <FollowButton
                userId={user.id}
                isFollowedByMe={user.isFollowedByMe}
                username={user.username}
                displayName={user.displayName}
                followersCount={user.followersCount}
                followingCount={user.followingCount}
              />
            )}
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-xl font-bold">{user.displayName}</h2>
          <p className="text-default-500 text-sm">@{user.username}</p>
        </div>

        {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}

        <p className="mt-2 text-default-500 text-sm flex items-center gap-1">
          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {joinDate}
        </p>

        <div className="mt-3 flex gap-4 text-sm">
          <span className="font-bold">{user.tweetsCount}</span>
          <span className="text-default-500">ツイート</span>
          <Link
            to="/users/$username/connections"
            params={{ username: user.username }}
            search={{ tab: 'following' }}
            className="hover:underline"
          >
            <span className="font-bold">{user.followingCount}</span>
            <span className="text-default-500 ml-1">フォロー中</span>
          </Link>
          <Link
            to="/users/$username/connections"
            params={{ username: user.username }}
            className="hover:underline"
          >
            <span className="font-bold">{user.followersCount}</span>
            <span className="text-default-500 ml-1">フォロワー</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
