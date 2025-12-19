
import React from 'react';
import { AnalysisResult as AnalysisResultType, Section, GalleryItem } from '../types';
import { Language, translations } from '../i18n';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

interface Props {
  data: AnalysisResultType;
  lang?: Language;
}

const GalleryCard: React.FC<{ item: GalleryItem }> = ({ item }) => {
  return (
    <div className="group rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_rgba(99,102,241,0.12)] hover:-translate-y-1">
      <div className="aspect-[16/10] w-full bg-gray-50 dark:bg-black/20 relative overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            loading="lazy"
            className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105 animate-fade-in" 
          />
        ) : (
          <div className="flex flex-col items-center opacity-30">
            <i className="fa-solid fa-image text-4xl mb-3"></i>
            <span className="text-xs font-medium uppercase tracking-widest">Image Unavailable</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg">{item.title}</h4>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
          {item.description}
        </p>
      </div>
    </div>
  );
};

const RenderSection: React.FC<{ section: Section, lang: Language }> = ({ section, lang }) => {
  const t = translations[lang];
  
  const SectionHeader = () => (
    <div className="flex items-center justify-between mb-8 group/header">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
        <span className="w-1 h-6 bg-indigo-500 rounded-full mr-4 opacity-0 group-hover/header:opacity-100 transition-opacity"></span>
        {section.title}
      </h3>
      <button className="opacity-0 group-hover:opacity-100 transition-all px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white">
        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> {t.aiEdit}
      </button>
    </div>
  );

  return (
    <div className="group relative">
      {section.type !== 'text' && <SectionHeader />}
      
      {(() => {
        switch (section.type) {
          case 'stats':
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                {section.stats?.map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 hover:border-indigo-500/30 transition-all group/stat">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 block">{stat.label}</span>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover/stat:text-indigo-500 transition-colors">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            );
          
          case 'chart':
            return (
              <div className="mb-16 p-8 rounded-[2rem] bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {section.chartType === 'line' ? (
                      <LineChart data={section.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 11}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 11}} dx={-10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', backdropFilter: 'blur(4px)' }}
                          itemStyle={{ color: '#818cf8' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={section.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 11}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 11}} dx={-10} />
                        <Tooltip 
                          cursor={{fill: 'rgba(99,102,241,0.05)'}}
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', backdropFilter: 'blur(4px)' }}
                        />
                        <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            );

          case 'gallery':
            return (
              <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                {section.galleryItems?.map((item, i) => (
                  <GalleryCard key={i} item={item} />
                ))}
              </div>
            );

          case 'list':
            return (
              <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.listItems?.map((item, i) => (
                  <div key={i} className="flex items-start p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 hover:shadow-sm transition-all hover:bg-white dark:hover:bg-white/[0.04]">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 mr-4 shadow-lg shadow-indigo-500/20">
                       <i className="fa-solid fa-check text-[10px]"></i>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed pt-1 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            );

          default:
            return (
              <div className="mb-24 max-w-4xl mx-auto text-center px-4 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-indigo-500/5 blur-[80px] rounded-full"></div>
                <h3 className="text-3xl md:text-5xl font-black mb-8 text-gray-900 dark:text-white tracking-tighter leading-tight relative">
                  {section.title}
                </h3>
                <div className="text-gray-500 dark:text-gray-400 whitespace-pre-wrap leading-relaxed text-lg md:text-xl font-light max-w-2xl mx-auto">
                  {section.content}
                </div>
              </div>
            );
        }
      })()}
    </div>
  );
};

const AnalysisResult: React.FC<Props> = ({ data, lang = 'zh' }) => {
  const t = translations[lang];
  return (
    <div className="animate-fade-in max-w-6xl mx-auto px-4 py-16 pb-32">
      <header className="mb-24 text-center">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
          <i className="fa-solid fa-chart-line mr-2"></i>
          {t.analysisReport}
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white mb-10 tracking-tighter leading-[0.9] lg:px-20">
          {data.title}
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 dark:text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
          {data.subtitle}
        </p>
      </header>

      <div className="relative mb-32">
        <div className="absolute -inset-4 bg-indigo-500/5 blur-3xl rounded-full opacity-50"></div>
        <section className="relative p-12 md:p-20 rounded-[3rem] bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="absolute top-12 left-12 text-indigo-500/10">
            <i className="fa-solid fa-quote-left text-9xl"></i>
          </div>
          <div className="relative z-10">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-500 mb-10 flex items-center">
              <span className="w-8 h-px bg-indigo-500 mr-4"></span>
              {t.summaryHeader}
            </h2>
            <p className="text-2xl md:text-5xl text-gray-800 dark:text-gray-100 font-bold leading-tight tracking-tight">
              {data.summary}
            </p>
          </div>
        </section>
      </div>

      <div className="space-y-4">
        {data.sections.map((section) => (
          <RenderSection key={section.id} section={section} lang={lang} />
        ))}
      </div>
      
      {/* 增强版分享引导 */}
      <div className="mt-32 p-12 rounded-[2.5rem] bg-indigo-600 text-white text-center overflow-hidden relative shadow-2xl shadow-indigo-500/30">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 blur-[80px] rounded-full"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-4 tracking-tight">Ready to present?</h3>
          <p className="text-indigo-100 mb-8 max-w-md mx-auto opacity-80 font-medium">
            Generate a unique link to share this insight or export it as a high-quality PPTX file for your team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button className="px-10 py-4 bg-white text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
               <i className="fa-solid fa-link mr-2"></i> {t.shareBtn}
             </button>
             <button className="px-10 py-4 bg-indigo-500/50 text-white border border-white/20 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
               <i className="fa-solid fa-file-powerpoint mr-2"></i> {t.exportPpt}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
