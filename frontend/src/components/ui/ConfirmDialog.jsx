import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './Button'

export const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  loading = false,
}) => (
  <Dialog.Root open={open} onOpenChange={(next) => { if (!next && !loading && onCancel) onCancel() }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-6 shadow-lg">
        <Dialog.Title className="text-base font-semibold text-foreground">{title}</Dialog.Title>
        {message && <Dialog.Description className="mt-2 text-sm text-muted-foreground">{message}</Dialog.Description>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmColor === 'success' ? 'success' : confirmColor === 'primary' ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
