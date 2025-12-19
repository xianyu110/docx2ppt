
import React, { useState, useEffect } from 'react';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import LoadingScreen from './components/LoadingScreen';
import AnalysisResult from './components/AnalysisResult';
import { GeminiService } from './services/geminiService';
import { MineruService } from './services/mineruService';
import { AnalysisResult as AnalysisResultType } from './types';
import { Language, translations } from './i18n';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setShowErrorDetails(false);
    setLoadingMsg(t.loadingStep1);

    try {
      if (file.type === 'application/pdf') {
        const mineru = new MineruService();
        const { markdown, images } = await mineru.processFile(file);
        
        setLoadingMsg(t.loadingStep2);
        const gemini = new GeminiService();
        const analysis = await gemini.analyzeMineruOutput(markdown, Object.keys(images), lang);
        
        analysis.sections.forEach(section => {
          if (section.galleryItems) {
            section.galleryItems.forEach(item => {
              if (item.imageUrl && images[item.imageUrl]) {
                item.imageUrl = images[item.imageUrl];
              } else if (!item.imageUrl && Object.keys(images).length > 0) {
                const firstImgKey = Object.keys(images)[0];
                item.imageUrl = images[firstImgKey];
              }
            });
          }
        });

        setResult(analysis);
      } else {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = () => reject(new Error("File read error"));
          reader.readAsText(file);
        });

        const gemini = new GeminiService();
        const data = await gemini.analyzeContent(content, "Text", lang);
        setResult(data);
      }
    } catch (err: any) {
      console.error("Critical Error:", err);
      let msg = t.errorTitle;
      let details = err.stack || err.toString();
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        msg = t.errorFetchTitle;
        details = t.errorFetchDetails;
      }
      setError({ message: msg, details: details });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark' : ''} bg-white dark:bg-[#0a0a0a] transition-colors duration-500`}>
      {isLoading && <LoadingScreen message={loadingMsg} lang={lang} />}

      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-bolt text-white text-sm"></i>
            </div>
            <span className="font-bold text-gray-900 dark:text-white tracking-tight uppercase text-sm sm:text-base">{t.navTitle}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {result && (
              <div className="hidden md:flex items-center space-x-2 mr-4 border-r border-gray-100 dark:border-white/10 pr-4">
                <button className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-indigo-500 transition-colors flex items-center">
                  <i className="fa-solid fa-file-export mr-2"></i> {t.exportPpt}
                </button>
                <button className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-indigo-500 transition-colors flex items-center">
                  <i className="fa-solid fa-share-nodes mr-2"></i> {t.shareBtn}
                </button>
              </div>
            )}
            <button 
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              {lang === 'zh' ? 'EN' : '中文'}
            </button>
            <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-32">
        {!result ? (
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
              {t.heroTitle}<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">{t.heroTitleHighlight}</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              {t.heroSubtitle}
            </p>

            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative p-12 rounded-[3rem] bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-white/10 flex flex-col items-center transition-all">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <i className="fa-solid fa-cloud-arrow-up text-4xl text-indigo-500"></i>
                </div>
                <label className="cursor-pointer">
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf" />
                  <div className="px-12 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-all active:scale-95">
                    {t.uploadBtn}
                  </div>
                </label>
                <p className="mt-6 text-xs text-gray-400 uppercase tracking-[0.2em] font-medium">{t.uploadHint}</p>
              </div>
            </div>

            {error && (
              <div className="mt-12 p-6 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl animate-fade-in max-w-2xl mx-auto text-left">
                <div className="flex items-center mb-3">
                  <i className="fa-solid fa-circle-exclamation mr-3 text-lg"></i>
                  <span className="font-bold">{error.message}</span>
                </div>
                <button 
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="text-xs font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors mb-2"
                >
                  {showErrorDetails ? t.errorHideDetails : t.errorShowDetails}
                </button>
                {showErrorDetails && (
                  <pre className="mt-4 p-4 bg-black/5 dark:bg-white/5 rounded-lg text-[10px] overflow-x-auto font-mono opacity-80 leading-relaxed whitespace-pre-wrap">
                    {error.details}
                  </pre>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="max-w-6xl mx-auto px-4 mb-8 flex items-center justify-between">
              <button 
                onClick={() => setResult(null)} 
                className="group text-sm font-bold text-gray-400 hover:text-indigo-500 transition-all flex items-center"
              >
                <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center mr-3 group-hover:border-indigo-500/30">
                  <i className="fa-solid fa-arrow-left"></i>
                </div>
                {t.backBtn}
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">{t.styleMode}:</span>
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                   <button className="px-3 py-1 text-[10px] font-bold bg-white dark:bg-white/10 rounded shadow-sm text-indigo-500">LINEAR</button>
                   <button className="px-3 py-1 text-[10px] font-bold text-gray-500 hover:text-indigo-500 transition-colors">MODERN</button>
                </div>
              </div>
            </div>
            <AnalysisResult data={result} lang={lang} />
          </div>
        )}
      </main>
      <Footer lang={lang} />
    </div>
  );
};

export default App;
