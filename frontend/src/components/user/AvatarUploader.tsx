import { useEffect, useId, useRef, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Avatar, Spinner } from '@heroui/react'
import { UpdateAvatarDocument } from '@/lib/graphql/generated/graphql'

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null
  displayName: string
  size?: 'sm' | 'lg'
  editable?: boolean
}

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function AvatarUploader({
  currentAvatarUrl,
  displayName,
  size = 'sm',
  editable = false,
}: AvatarUploaderProps) {
  const fileInputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const revokePreviewUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      revokePreviewUrl()
    }
  }, [])

  const [updateAvatar, { loading }] = useMutation(UpdateAvatarDocument, {
    onCompleted: () => {
      revokePreviewUrl()
      setPreview(null)
    },
    refetchQueries: ['UserByUsername', 'Me'],
  })

  const initials = displayName.slice(0, 2).toUpperCase()
  const src = preview ?? currentAvatarUrl

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('JPEG、PNG、WebP形式の画像を選択してください')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('ファイルサイズは2MB以下にしてください')
      return
    }

    revokePreviewUrl()
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setPreview(url)
    updateAvatar({ variables: { avatar: file } })
    e.target.value = ''
  }

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
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
        />
      )}
    </div>
  )
}
