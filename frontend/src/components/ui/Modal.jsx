import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const maxWidthClasses = {
  xs: 'max-w-[444px]',
  sm: 'max-w-[600px]',
  md: 'max-w-[900px]',
  lg: 'max-w-[1200px]',
  xl: 'max-w-[1400px]',
}

export const Modal = ({ open, onClose, title, children, actions, maxWidth = 'sm', hideDividers }) => (
  <Dialog.Root open={open} onOpenChange={(next) => { if (!next && onClose) onClose() }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <Dialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card shadow-lg',
          maxWidthClasses[maxWidth] || maxWidthClasses.sm,
        )}
      >
        {title && (
          <div
            className={cn(
              'flex items-center justify-between px-5 py-4',
              !hideDividers && 'border-b',
            )}
          >
            <Dialog.Title className="text-base font-semibold text-foreground">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {actions && (
          <div className="flex justify-end gap-2 border-t px-5 py-3">{actions}</div>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
