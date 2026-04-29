import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { UpdateAvatarDocument } from '@/lib/graphql/generated/graphql'
import { validateAvatarFile } from '@/lib/utils/avatar'

type UseAvatarUploadOptions = {
  currentAvatarUrl?: string | null
  onValidationError?: (message: string) => void
}

export function useAvatarUpload({
  currentAvatarUrl,
  onValidationError,
}: UseAvatarUploadOptions) {
  const [preview, setPreview] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  const revokePreviewUrl = useCallback(() => {
    // Object URLs are browser resources; keep exactly one live preview URL and release it promptly.
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      revokePreviewUrl()
    }
  }, [revokePreviewUrl])

  const [updateAvatar, { loading }] = useMutation(UpdateAvatarDocument, {
    onCompleted: () => {
      revokePreviewUrl()
      setPreview(null)
    },
    refetchQueries: ['UserByUsername', 'Me'],
  })

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const validation = validateAvatarFile(file)
      if (!validation.valid) {
        onValidationError?.(validation.message)
        return
      }

      // Show the selected image immediately while the upload mutation is still in flight.
      revokePreviewUrl()
      const url = URL.createObjectURL(file)
      objectUrlRef.current = url
      setPreview(url)
      updateAvatar({ variables: { avatar: file } })
      e.target.value = ''
    },
    [onValidationError, revokePreviewUrl, updateAvatar],
  )

  return {
    src: preview ?? currentAvatarUrl,
    loading,
    handleFileChange,
  }
}
