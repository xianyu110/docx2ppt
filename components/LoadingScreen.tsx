
import React from 'react';
import { Language, translations } from '../i18n';

interface Props {
  message?: string;
  lang?: Language;
}

const LoadingScreen: React.FC<Props> = ({ message, lang = 'zh' }) => {
  const t = translations[lang];
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
      <p className="text-xl font-medium text-gray-900 dark:text-gray-100 animate-pulse text-center px-4">
        {message || t.loadingStep1}
      </p>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t.loadingGeneral}</p>
    </div>
  );
};

export default LoadingScreen;
