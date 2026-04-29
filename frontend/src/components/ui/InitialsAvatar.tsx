const GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-sky-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
]

type InitialsAvatarProps = {
  displayName: string
  username: string
  avatarUrl?: string | null
  size?: 'sm' | 'md'
}

export function InitialsAvatar({ displayName, username, avatarUrl, size = 'sm' }: InitialsAvatarProps) {
  const initials = displayName.slice(0, 2).toUpperCase()
  const gradient = GRADIENTS[username.charCodeAt(0) % GRADIENTS.length]
  const sizeClass = size === 'md' ? 'w-10 h-10 text-xs' : 'w-8 h-8 text-[10px]'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className={`${sizeClass} rounded-full object-cover ring-1 ring-black/10`}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white ring-1 ring-black/10`}
    >
      {initials}
    </div>
  )
}
