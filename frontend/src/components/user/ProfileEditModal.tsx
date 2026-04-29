import { Modal, Button, TextField, Label, Input, TextArea, Description, useOverlayState } from '@heroui/react'
import { useUiStore } from '@/lib/stores/uiStore'
import { BIO_MAX_LENGTH, useProfileEditForm } from '@/lib/hooks/useProfileEditForm'

interface ProfileEditModalProps {
  user: { displayName: string; bio?: string | null }
}

export function ProfileEditModal({ user }: ProfileEditModalProps) {
  const { isProfileEditOpen, setIsProfileEditOpen } = useUiStore()
  const state = useOverlayState({
    isOpen: isProfileEditOpen,
    onOpenChange: setIsProfileEditOpen,
  })
  const onClose = () => state.setOpen(false)

  const {
    displayName,
    setDisplayName,
    bio,
    setBio,
    isValid,
    loading,
    handleSubmit,
  } = useProfileEditForm({
    user,
    isOpen: state.isOpen,
    onClose,
  })

  return (
    <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen} isDismissable>
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
                onPress={onClose}
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
    </Modal.Backdrop>
  )
}
