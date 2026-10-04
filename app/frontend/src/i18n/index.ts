import { ar } from './ar';
import { en } from './en';

export type Language = 'ar' | 'en';

const translations = {
  ar,
  en,
};

export const useTranslation = (language: Language = 'ar') => {
  const t = (path: string, defaultValue: string = ''): string => {
    const keys = path.split('.');
    let value: any = translations[language];

    for (const key of keys) {
      value = value?.[key];
    }

    return value || defaultValue || path;
  };

  return { t, language };
};

export const getDirection = (language: Language): 'ltr' | 'rtl' => {
  return language === 'ar' ? 'rtl' : 'ltr';
};

export default translations;
