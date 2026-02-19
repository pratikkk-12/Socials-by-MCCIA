
import React from 'react';
import { 
  X, Share2, Zap, ArrowRight, MessageSquare, FileJson, Target, 
  Palette, Cloud, Database, CalendarPlus, Layers, Wand2, 
  Sparkles, LayoutGrid, List, BarChart3, Settings2, Code2, 
  Hash, Image as ImageIcon, Gauge, Cpu, Workflow
} from 'lucide-react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-[#0a0a0a] border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out overflow-hidden transition-colors duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111111] transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Zap size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">MCCIA Architect's Handbook</h2>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-tighter">System Version 1.0.4 // Production Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-thin bg-white dark:bg-transparent">
          
          {/* Module 1: The Social Forge */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <Share2 size={16} className="text-orange-600 dark:text-amber-500" />
              <h3 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em]">Module 01: The Social Forge</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Plan complex multi-day, multi-platform campaigns that remain tonally and visually locked to your Brand DNA.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 rounded-2xl group hover:border-amber-500/30 transition-all shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-2">
                  <FileJson size={14} className="text-orange-600 dark:text-amber-500" />
                  <span className="text-[10px] font-black text-neutral-800 dark:text-white uppercase tracking-widest">Campaign Visual Protocol</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Every campaign generates a global "Visual DNA" object. This blueprint defines lighting, color palettes, and composition rules applied to every post.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={14} className="text-orange-600 dark:text-amber-500" />
                  <span className="text-[10px] font-black text-neutral-800 dark:text-white uppercase tracking-widest">Hashtag Engineering</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Automatically synthesizes 15+ high-performance tags categorized by niche, reach, and industry relevance.
                </p>
              </div>
            </div>

            <div className="bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
               <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest block mb-2">Usage Example</span>
               <p className="text-[11px] text-neutral-600 dark:text-neutral-300 italic">"Forge a 7-day campaign for a Cyberpunk-themed streetwear drop."</p>
            </div>
          </section>

          {/* Module 2: The JSON Laboratory */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <Code2 size={16} className="text-blue-600 dark:text-blue-500" />
              <h3 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em]">Module 02: The JSON Laboratory</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Architect technical JSON schemas for automation, API mocks, and custom AI system instructions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 size={14} className="text-blue-600 dark:text-blue-500" />
                  <span className="text-[10px] font-black text-neutral-800 dark:text-white uppercase tracking-widest">AI Enhance</span>
                </div>
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  Refines raw input into valid, logic-dense structures using <span className="text-blue-600 dark:text-blue-400">Flash-3 Intelligence</span>.
                </p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-2">
                  <Workflow size={14} className="text-blue-600 dark:text-blue-500" />
                  <span className="text-[10px] font-black text-neutral-800 dark:text-white uppercase tracking-widest">Automation Ready</span>
                </div>
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  Outputs are pre-sanitized for direct injection into automation tools.
                </p>
              </div>
            </div>
          </section>

          {/* Module 3: Brand DNA Synthesis */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <Target size={16} className="text-emerald-600 dark:text-emerald-500" />
              <h3 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em]">Module 03: Brand DNA</h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Your identity is the "Kernel" of the engine. Configure it once in Settings.
            </p>

            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-emerald-600 dark:text-emerald-500"><Palette size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-tight">Project DNA Style Overrides</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">Use the "Project DNA" button to set style instructions that override global Brand DNA.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-emerald-600 dark:text-emerald-500"><ImageIcon size={16} /></div>
                <div>
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-tight">Visual Analysis Engine</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">Upload a reference brand image in Settings to reverse engineer its aesthetic.</p>
                </div>
              </li>
            </ul>
          </section>

          {/* Module 4: System Protocols */}
          <section className="space-y-6 pb-20">
            <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <Gauge size={16} className="text-purple-600 dark:text-purple-500" />
              <h3 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em]">Module 04: System Protocols</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-2 mb-1"><CalendarPlus size={14} className="text-purple-600 dark:text-purple-400" /><span className="text-[9px] font-black text-neutral-800 dark:text-white uppercase">Calendar Sync</span></div>
                  <p className="text-[10px] text-neutral-500 italic">Export campaigns as .ics files for external calendars.</p>
               </div>
               <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-2 mb-1"><BarChart3 size={14} className="text-purple-600 dark:text-purple-400" /><span className="text-[9px] font-black text-neutral-800 dark:text-white uppercase">Mission Control</span></div>
                  <p className="text-[10px] text-neutral-500 italic">Audit your token efficiency and architectural output.</p>
               </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-8 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] transition-colors">
          <button onClick={onClose} className="w-full flex items-center justify-center gap-3 p-4 bg-orange-600 rounded-2xl text-xs font-black text-white hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/10 uppercase tracking-[0.2em]">
            INITIALIZE WORKSPACE <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPanel;
