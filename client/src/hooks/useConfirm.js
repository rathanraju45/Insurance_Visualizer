import { useState, useCallback } from 'react';

export function useConfirm() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    danger: false,
    onConfirm: null
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        danger: options.danger || false,
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
  }, [dialogState.onConfirm]);

  const handleCancel = useCallback(() => {
    if (dialogState.onCancel) {
      dialogState.onCancel();
    }
  }, [dialogState.onCancel]);

  return {
    dialogState,
    confirm,
    handleConfirm,
    handleCancel
  };
}
