import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationModalProps) {
  const iconColors = {
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'warning' as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 rounded-full ${iconColors[variant]} mb-4`}>
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
          
          <h3 className="text-lg font-semibold text-surface-900 font-display mb-2">
            {title}
          </h3>
          
          <p className="text-surface-600 text-sm mb-6">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={buttonVariants[variant]}
              className="flex-1"
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
