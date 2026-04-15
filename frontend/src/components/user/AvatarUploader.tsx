import { useRef, useState } from 'react'
import { useMutation } from '@apollo/client/react'
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [updateAvatar, { loading }] = useMutation(UpdateAvatarDocument, {
    onCompleted: () => setPreview(null),
    refetchQueries: ['UserByUsername', 'Me'],
  })

  const dimension = size === 'lg' ? 'w-20 h-20' : 'w-10 h-10'
  const textSize = size === 'lg' ? 'text-xl' : 'text-sm'
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

    setPreview(URL.createObjectURL(file))
    updateAvatar({ variables: { avatar: file } })
    e.target.value = ''
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => editable && inputRef.current?.click()}
        disabled={!editable || loading}
        className={`${dimension} rounded-full overflow-hidden flex items-center justify-center bg-primary text-white font-bold ${textSize} shrink-0 ${
          editable ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'
        }`}
      >
        {src ? (
          <img src={src} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          initials
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>

      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      )}
    </div>
  )
}
