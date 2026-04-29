import { useId, useRef } from 'react'
import { Avatar, Spinner } from '@heroui/react'
import { useAvatarUpload } from '@/lib/hooks/useAvatarUpload'
import { AVATAR_ACCEPTED_TYPES, getInitials } from '@/lib/utils/avatar'

type AvatarUploaderProps = {
  currentAvatarUrl?: string | null
  displayName: string
  size?: 'sm' | 'lg'
  editable?: boolean
}

export function AvatarUploader({
  currentAvatarUrl,
  displayName,
  size = 'sm',
  editable = false,
}: AvatarUploaderProps) {
  const fileInputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const { src, loading, handleFileChange } = useAvatarUpload({
    currentAvatarUrl,
    onValidationError: alert,
  })

  const initials = getInitials(displayName)

  const avatarSize = size === 'lg' ? 'lg' as const : 'md' as const

  const avatarInner = (
    <>
      <Avatar
        size={avatarSize}
        color="accent"
        className={size === 'lg' ? 'size-20 text-xl' : ''}
      >
        <Avatar.Image src={src ?? undefined} alt={displayName} />
        <Avatar.Fallback>{initials}</Avatar.Fallback>
      </Avatar>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
          <Spinner size="sm" color="current" className="text-white" />
        </div>
      )}
    </>
  )

  return (
    <div className="relative">
      {editable ? (
        <label
          htmlFor={fileInputId}
          className={`relative block ${size === 'lg' ? 'size-20' : ''} ${
            loading ? 'pointer-events-none opacity-80' : 'cursor-pointer hover:opacity-80'
          } transition-opacity`}
        >
          {avatarInner}
        </label>
      ) : (
        <div className={`relative ${size === 'lg' ? 'size-20' : ''}`}>{avatarInner}</div>
      )}

      {editable && (
        <input
          id={fileInputId}
          ref={inputRef}
          type="file"
          accept={AVATAR_ACCEPTED_TYPES.join(',')}
          onChange={handleFileChange}
          className="sr-only"
        />
      )}
    </div>
  )
}
