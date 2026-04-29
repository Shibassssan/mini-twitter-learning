import { Modal, useOverlayState } from '@heroui/react'
import { useUiStore } from '@/lib/stores/uiStore'
import { TweetComposer } from './TweetComposer'

export function TweetComposerModal() {
  const { isTweetModalOpen, setIsTweetModalOpen } = useUiStore()
  const state = useOverlayState({
    isOpen: isTweetModalOpen,
    onOpenChange: setIsTweetModalOpen,
  })

  return (
    <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.setOpen} isDismissable>
      <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.Header>投稿を作成</Modal.Header>
          <Modal.Body className="pb-4">
            <TweetComposer onSuccess={() => setIsTweetModalOpen(false)} />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
