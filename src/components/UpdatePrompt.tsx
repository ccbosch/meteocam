import React, { useEffect, useState } from 'react';
import Dialog from './Dialog';
import { useI18n } from '@/hooks/useI18n';

interface UpdatePromptProps {
  onUpdate: () => void;
}

let showUpdatePromptHandler: (() => void) | null = null;

export const triggerUpdatePrompt = () => {
  if (showUpdatePromptHandler) {
    showUpdatePromptHandler();
  }
};

const UpdatePrompt: React.FC<UpdatePromptProps> = ({ onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    showUpdatePromptHandler = () => setIsOpen(true);

    return () => {
      showUpdatePromptHandler = null;
    };
  }, []);

  const handleUpdate = () => {
    setIsOpen(false);
    onUpdate();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={t('update.title')}
      type="info"
      onConfirm={handleUpdate}
      confirmText={t('update.confirm')}
      cancelText={t('update.later')}
    >
      <p>{t('update.message')}</p>
      <p className="text-sm text-gray-500 mt-2">{t('update.reloadHint')}</p>
    </Dialog>
  );
};

export default UpdatePrompt;
