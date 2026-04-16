import { memo } from 'react'
import { Link } from '@tanstack/react-router'
import { Avatar } from '@heroui/react'
import { FollowButton } from './FollowButton'

export interface UserCardData {
  id: string
  username: string
  displayName: string
  bio?: string | null
  avatarUrl?: string | null
  isFollowedByMe: boolean
  followersCount?: number
}

interface UserCardProps {
  user: UserCardData
}

export const UserCard = memo(function UserCard({ user }: UserCardProps) {
  const initials = user.displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex gap-3 p-4 border-b border-divider hover:bg-default-50 transition-colors items-start">
      <Link
        to="/users/$username"
        params={{ username: user.username }}
        className="flex gap-3 flex-1 min-w-0"
      >
        <Avatar size="md" color="accent" className="shrink-0">
          <Avatar.Image src={user.avatarUrl ?? undefined} alt={user.displayName} />
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="font-bold text-sm block truncate">{user.displayName}</span>
              <span className="text-default-400 text-sm block truncate">@{user.username}</span>
            </div>
          </div>
          {user.bio && (
            <p className="mt-1 text-sm text-default-600 line-clamp-2">{user.bio}</p>
          )}
        </div>
      </Link>
      <div className="shrink-0 pt-0.5">
        <FollowButton
          userId={user.id}
          isFollowedByMe={user.isFollowedByMe}
          username={user.username}
          displayName={user.displayName}
          followersCount={user.followersCount}
        />
      </div>
    </div>
  )
})
