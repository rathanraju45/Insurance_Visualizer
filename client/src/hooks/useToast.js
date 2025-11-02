import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 6000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration = 6000) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration = 8000) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration = 7000) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration = 6000) => addToast(message, 'info', duration), [addToast]);

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info
  };
}
