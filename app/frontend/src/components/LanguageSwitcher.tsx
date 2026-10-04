import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react';
import './LanguageSwitcher.css';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const items: ICommandBarItemProps[] = [
    {
      key: 'language',
      text: language === 'ar' ? 'العربية' : 'English',
      iconProps: { iconName: 'LocaleLanguage' },
      onClick: () => {
        setLanguage(language === 'ar' ? 'en' : 'ar');
      },
    },
  ];

  return <CommandBar items={items} />;
};
