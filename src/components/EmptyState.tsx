import React from 'react';
import { useI18n } from '@/hooks/useI18n';

interface EmptyStateProps {
  onAddLocation: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddLocation }) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-4">📍</div>
      <h2 className="text-2xl font-bold mb-2">{t('empty.noLocations')}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {t('empty.startMessage')}
      </p>
      <button onClick={onAddLocation} className="btn-primary flex items-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>{t('empty.addFirst')}</span>
      </button>
    </div>
  );
};

export default EmptyState;
