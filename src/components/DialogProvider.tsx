import React, { createContext, useContext, useState, useCallback } from 'react';
import Dialog from './Dialog';

interface DialogOptions {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => Promise<boolean>;
  showAlert: (options: Omit<DialogOptions, 'cancelText'>) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const showDialog = useCallback((options: DialogOptions): Promise<boolean> => {
    setDialogOptions(options);
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const showAlert = useCallback((options: Omit<DialogOptions, 'cancelText'>): Promise<void> => {
    setDialogOptions({ ...options, confirmText: options.confirmText || 'OK' });
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolvePromise(() => () => {
        resolve();
        return true;
      });
    });
  }, []);

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setDialogOptions(null);
    setResolvePromise(null);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setDialogOptions(null);
    setResolvePromise(null);
  };

  return (
    <DialogContext.Provider value={{ showDialog, showAlert }}>
      {children}
      {dialogOptions && (
        <Dialog
          isOpen={isOpen}
          onClose={handleCancel}
          title={dialogOptions.title}
          type={dialogOptions.type}
          onConfirm={dialogOptions.cancelText ? handleConfirm : undefined}
          confirmText={dialogOptions.confirmText}
          cancelText={dialogOptions.cancelText}
        >
          {dialogOptions.message}
        </Dialog>
      )}
    </DialogContext.Provider>
  );
};
