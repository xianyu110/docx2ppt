
import React from 'react';
import { Language, translations } from '../i18n';

interface Props {
  lang?: Language;
}

const Footer: React.FC<Props> = ({ lang = 'zh' }) => {
  const t = translations[lang];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-40 border-t border-gray-100 dark:border-white/10 pt-24 pb-12 bg-gray-50/50 dark:bg-black/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-bolt text-white"></i>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{t.navTitle}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              {t.footerDesc}
            </p>
          </div>
          
          <div className="flex flex-col md:items-end space-y-6">
            <div className="space-y-2 md:text-right">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t.createdBy}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{t.author}</p>
            </div>
            
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-500 transition-all duration-300">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-500 transition-all duration-300">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-500 transition-all duration-300">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
              <a href="mailto:contact@example.com" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-500 transition-all duration-300">
                <i className="fa-solid fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-24 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-400 dark:text-gray-600 uppercase tracking-widest text-center md:text-left">
          <p>© {currentYear} {t.navTitle} {t.rights}.</p>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-indigo-500 transition-colors">{t.privacy}</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">{t.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
