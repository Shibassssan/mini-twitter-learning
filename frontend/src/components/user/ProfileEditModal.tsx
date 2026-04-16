import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { Modal, Button, TextField, Label, Input, TextArea, Description, useOverlayState } from '@heroui/react'
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
              <TextField name="displayName">
                <Label>表示名</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  fullWidth
                />
              </TextField>
              <TextField name="bio">
                <Label>自己紹介</Label>
                <TextArea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={BIO_MAX_LENGTH}
                  rows={3}
                  fullWidth
                  style={{ resize: 'none' }}
                />
                <Description className="text-right">{bio.length}/{BIO_MAX_LENGTH}</Description>
              </TextField>
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
