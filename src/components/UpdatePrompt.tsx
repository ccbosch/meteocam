import React, { useEffect, useState } from 'react';
import Dialog from './Dialog';

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
      title="Update Available"
      type="info"
      onConfirm={handleUpdate}
      confirmText="Update Now"
      cancelText="Later"
    >
      <p>A new version of MeteoCam is available. Would you like to update now?</p>
      <p className="text-sm text-gray-500 mt-2">The app will reload after updating.</p>
    </Dialog>
  );
};

export default UpdatePrompt;
