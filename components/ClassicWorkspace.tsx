
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { Template, Category, UserProfile } from '../types';
import TemplateLibrary from './TemplateLibrary';
import DynamicForm from './DynamicForm';
import JsonPreview from './JsonPreview';
import { enhancePromptWithAI } from '../services/geminiService';
import { ChevronRight, ArrowLeft, LayoutGrid, Zap, Blocks, ChevronUp, FileJson } from 'lucide-react';

interface ClassicWorkspaceProps {
  initialJson?: any;
  userProfile: UserProfile;
}

const ClassicWorkspace: React.FC<ClassicWorkspaceProps> = ({ initialJson, userProfile }) => {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<any>(initialJson || {});
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  React.useEffect(() => {
    if (initialJson) {
      setFormData(initialJson);
      if (!activeCategory) {
          setActiveCategory(CATEGORIES.find(c => c.id === 'custom') || null);
      }
    }
  }, [initialJson]);

  const handleTemplateSelect = (template: Template) => {
    const category = CATEGORIES.find(c => c.id === template.category_id);
    if (category) {
      setActiveCategory(category);
      setFormData(template.data);
    }
  };

  const handleEnhance = async () => {
    if (!activeCategory) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePromptWithAI(formData, activeCategory.name, userProfile);
      setFormData(enhanced);
      setIsPreviewExpanded(true);
    } catch (error) {
      console.error("Enhancement failed", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  if (!activeCategory) {
    return (
      <div className="h-full overflow-y-auto bg-neutral-50 dark:bg-black p-6 md:p-12 pb-32 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
           <div className="mb-8 md:mb-12">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-[2px] bg-amber-500"></div>
                 <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.4em]">Architectural Studio</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mb-4">Forge Technical Prompts.</h1>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl text-sm md:text-lg leading-relaxed">
                Select a structural anchor to begin building production-ready JSON payloads for automation, APIs, or system instructions.
              </p>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-20">
              {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat); setFormData({}); }}
                    className="flex flex-col items-start p-6 md:p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] hover:border-amber-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all group relative overflow-hidden text-left shadow-sm dark:shadow-none"
                  >
                      <div className="p-3 md:p-4 bg-neutral-50 dark:bg-black rounded-2xl mb-4 md:mb-6 group-hover:scale-110 transition-transform border border-neutral-200 dark:border-neutral-800 group-hover:border-amber-500/30">
                         <Blocks className="text-amber-600 dark:text-amber-500" size={20} />
                      </div>
                      <span className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white mb-2">{cat.name}</span>
                      <p className="text-[10px] md:text-xs text-neutral-500 dark:text-neutral-500 leading-relaxed mb-4">{cat.description}</p>
                      <ChevronRight className="text-neutral-400 dark:text-neutral-700 group-hover:text-amber-500 transition-colors ml-auto" size={18} />
                  </button>
              ))}
           </div>

           <div className="border-t border-neutral-200 dark:border-neutral-800 pt-12 md:pt-16">
              <TemplateLibrary onSelect={handleTemplateSelect} />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full animate-fade-in overflow-hidden bg-white dark:bg-black flex flex-col transition-colors duration-300">
        {/* Header Bar */}
        <div className="h-14 md:h-16 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-black z-20 shrink-0 transition-colors duration-300">
            <div className="flex items-center gap-2 md:gap-4">
                <button onClick={() => setActiveCategory(null)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all">
                    <ArrowLeft size={18} />
                </button>
                <div className="h-6 w-[1px] bg-neutral-200 dark:bg-neutral-800" />
                <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Forging</span>
                    <span className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[120px]">{activeCategory.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all shadow-sm"
                >
                    <FileJson size={14} className="text-amber-600 dark:text-amber-500" />
                    <span className="hidden sm:inline">Output Console</span>
                </button>
                <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-[10px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mr-2">Architect v1.0</span>
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                </div>
            </div>
        </div>

        {/* Workspace Form Area */}
        <div className={`flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin transition-all duration-500 ${isPreviewExpanded ? 'blur-sm opacity-50 scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}>
            <div className="max-w-3xl mx-auto">
                <DynamicForm 
                    fields={activeCategory.fields}
                    data={formData}
                    onChange={setFormData}
                    onEnhance={handleEnhance}
                    isEnhancing={isEnhancing}
                />
            </div>
        </div>

        {/* SLIDING PREVIEW DRAWER */}
        <div 
            className={`
                fixed inset-x-0 bottom-0 z-[100] bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out
                ${isPreviewExpanded ? 'h-[85vh]' : 'h-14'}
            `}
        >
            <button 
                onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-amber-600 rounded-full flex items-center justify-center text-black shadow-xl shadow-amber-600/20 hover:scale-110 active:scale-95 transition-all z-[110]"
            >
                <ChevronUp className={`transition-transform duration-500 ${isPreviewExpanded ? 'rotate-180' : 'rotate-0'}`} size={24} />
            </button>

            {!isPreviewExpanded && (
                <div 
                    onClick={() => setIsPreviewExpanded(true)}
                    className="h-full w-full flex items-center justify-between px-6 md:px-12 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <FileJson size={16} className="text-amber-600 dark:text-amber-500" />
                        <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.3em]">Architectural Output Live</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-tighter">Forge Sync Active</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={`h-full flex flex-col transition-opacity duration-300 ${isPreviewExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex-1 overflow-hidden">
                    <JsonPreview data={formData} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default ClassicWorkspace;
