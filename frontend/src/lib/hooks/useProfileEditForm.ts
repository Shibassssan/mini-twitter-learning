import { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { UpdateProfileDocument } from '@/lib/graphql/generated/graphql'

type UseProfileEditFormOptions = {
  user: { displayName: string; bio?: string | null }
  isOpen: boolean
  onClose: () => void
}

export const BIO_MAX_LENGTH = 200

export function useProfileEditForm({ user, isOpen, onClose }: UseProfileEditFormOptions) {
  const [displayName, setDisplayName] = useState(user.displayName)
  const [bio, setBio] = useState(user.bio ?? '')

  useEffect(() => {
    // Re-opened modals should discard stale edits and reflect the latest server-backed user data.
    if (isOpen) {
      setDisplayName(user.displayName)
      setBio(user.bio ?? '')
    }
  }, [isOpen, user.displayName, user.bio])

  const [updateProfile, { loading }] = useMutation(UpdateProfileDocument, {
    onCompleted: onClose,
    refetchQueries: ['UserByUsername', 'Me'],
  })

  const isValid = displayName.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = displayName.trim()
    if (!trimmedName) return

    updateProfile({
      variables: {
        displayName: trimmedName,
        // Empty bio is stored as null so the backend keeps one canonical "no bio" value.
        bio: bio.trim() || null,
      },
    })
  }

  return {
    displayName,
    setDisplayName,
    bio,
    setBio,
    isValid,
    loading,
    handleSubmit,
  }
}
