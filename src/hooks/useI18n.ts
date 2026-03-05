import { useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import { Locale, TranslationKey, translations } from '@/i18n/translations';

export const useI18n = () => {
  const language = useAppStore((state) => state.settings.language || 'fr');

  const t = useMemo(() => {
    return (key: TranslationKey, params?: Record<string, string | number>): string => {
      const locale = (language || 'fr') as Locale;
      const dictionary = translations[locale] || translations.en;
      let text = dictionary[key] || translations.en[key] || key;

      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          text = text.replace(`{${paramKey}}`, String(value));
        });
      }

      return text;
    };
  }, [language]);

  return {
    language: (language || 'fr') as Locale,
    t,
  };
};
