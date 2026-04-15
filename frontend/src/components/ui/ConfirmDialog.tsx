import { Modal, Button, useOverlayState } from '@heroui/react'
import { useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmLabel?: string
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '確認',
  message = 'よろしいですか？',
  confirmLabel = '削除',
  isLoading = false,
}: ConfirmDialogProps) {
  const state = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onClose()
    },
  })

  useEffect(() => {
    if (isOpen !== state.isOpen) {
      state.setOpen(isOpen)
    }
  }, [isOpen, state])

  return (
    <Modal state={state}>
      <Modal.Backdrop isDismissable />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.Header>{title}</Modal.Header>
          <Modal.Body>
            <p>{message}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onPress={onClose}>
              キャンセル
            </Button>
            <Button variant="solid" className="bg-danger text-white" onPress={onConfirm} isDisabled={isLoading}>
              {isLoading ? '処理中...' : confirmLabel}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}
