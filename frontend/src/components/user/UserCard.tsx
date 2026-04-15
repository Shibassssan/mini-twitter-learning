import { Link } from '@tanstack/react-router'
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

export function UserCard({ user }: UserCardProps) {
  const initials = user.displayName.slice(0, 2).toUpperCase()

  return (
    <Link
      to="/users/$username"
      params={{ username: user.username }}
      className="flex gap-3 p-4 border-b border-divider hover:bg-default-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="font-bold text-sm block truncate">{user.displayName}</span>
            <span className="text-default-400 text-sm block truncate">@{user.username}</span>
          </div>
          <div className="shrink-0">
            <FollowButton userId={user.id} isFollowedByMe={user.isFollowedByMe} username={user.username} />
          </div>
        </div>
        {user.bio && (
          <p className="mt-1 text-sm text-default-600 line-clamp-2">{user.bio}</p>
        )}
      </div>
    </Link>
  )
}
