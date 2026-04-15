import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { Modal, Button, useOverlayState } from '@heroui/react'
import { useUiStore } from '@/lib/stores/uiStore'
import { UpdateProfileDocument } from '@/lib/graphql/generated/graphql'

interface ProfileEditModalProps {
  user: { displayName: string; bio?: string | null }
}

const BIO_MAX_LENGTH = 160

export function ProfileEditModal({ user }: ProfileEditModalProps) {
  const { isProfileEditOpen, setIsProfileEditOpen } = useUiStore()
  const [displayName, setDisplayName] = useState(user.displayName)
  const [bio, setBio] = useState(user.bio ?? '')

  const state = useOverlayState({
    isOpen: isProfileEditOpen,
    onOpenChange: setIsProfileEditOpen,
  })

  useEffect(() => {
    if (isProfileEditOpen !== state.isOpen) {
      state.setOpen(isProfileEditOpen)
    }
  }, [isProfileEditOpen, state])

  useEffect(() => {
    if (isProfileEditOpen) {
      setDisplayName(user.displayName)
      setBio(user.bio ?? '')
    }
  }, [isProfileEditOpen, user.displayName, user.bio])

  const [updateProfile, { loading }] = useMutation(UpdateProfileDocument, {
    onCompleted: () => setIsProfileEditOpen(false),
    refetchQueries: ['UserByUsername', 'Me'],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = displayName.trim()
    if (!trimmedName) return
    updateProfile({ variables: { displayName: trimmedName, bio: bio.trim() || null } })
  }

  const isValid = displayName.trim().length > 0

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.Header>プロフィールを編集</Modal.Header>
          <form onSubmit={handleSubmit}>
            <Modal.Body className="space-y-4">
              <div>
                <label htmlFor="profile-displayName" className="block text-sm font-medium mb-1">
                  表示名
                </label>
                <input
                  id="profile-displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  className="w-full rounded-lg border border-default-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label htmlFor="profile-bio" className="block text-sm font-medium mb-1">
                  自己紹介
                </label>
                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={BIO_MAX_LENGTH}
                  rows={3}
                  className="w-full rounded-lg border border-default-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-none"
                />
                <p className="text-xs text-default-400 text-right mt-1">
                  {bio.length}/{BIO_MAX_LENGTH}
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                variant="ghost"
                onPress={() => setIsProfileEditOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="primary"
                isDisabled={!isValid || loading}
              >
                {loading ? '保存中...' : '保存'}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}
