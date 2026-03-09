import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  dangerous?: boolean;
  confirmText?: string;
  cancelText?: string;
}

interface UIContextValue {
  showToast: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToast({ id, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmOptions(options);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOptions(null);
  }, []);

  return (
    <UIContext.Provider value={{ showToast, confirm }}>
      {children}
      <Toast toast={toast} onHide={hideToast} />
      <ConfirmModal options={confirmOptions} onClose={closeConfirm} />
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
