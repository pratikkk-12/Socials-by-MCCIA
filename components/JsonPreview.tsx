
import React, { useState } from 'react';
import { Copy, Check, Download, FileJson, Zap, X, Minimize2, Terminal, Cpu, Share2, ChevronDown as ChevronDownIcon } from 'lucide-react';

interface JsonPreviewProps {
  data: any;
  isValid?: boolean;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ data, isValid = true }) => {
  const [copied, setCopied] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forge-output-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const useCases = [
    { icon: <Terminal size={14} />, label: "Automation", desc: "Inject into n8n/Zapier nodes" },
    { icon: <Cpu size={14} />, label: "API Mock", desc: "Use for frontend testing" },
    { icon: <Share2 size={14} />, label: "Protocols", desc: "Consistent AI image styles" }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black relative transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 lg:px-12 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
             <FileJson className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex flex-col">
             <h2 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">Architectural Output</h2>
             <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isValid ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isValid ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500'}`}>
                  {isValid ? 'Forge Validated Structure' : 'Syntax Error'}
                </span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUsage(!showUsage)}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            USE CASES {showUsage ? <ChevronDownIcon size={12} className="rotate-180" /> : <ChevronDownIcon size={12} />}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-all text-neutral-700 dark:text-neutral-300 text-[10px] font-black uppercase tracking-widest border border-neutral-200 dark:border-neutral-800 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-amber-600 dark:text-amber-500" />}
            <span>{copied ? 'Copied' : 'Copy Payload'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-2.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all shadow-sm"
            title="Download JSON"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Usage Tooltip Overlay */}
      {showUsage && (
        <div className="absolute top-24 right-12 z-30 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-2xl animate-fade-in">
           <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3">Downstream Usage</h4>
           <div className="space-y-3">
              {useCases.map((uc, i) => (
                <div key={i} className="flex gap-3">
                  <div className="p-1.5 bg-neutral-100 dark:bg-black rounded-lg text-neutral-400 dark:text-neutral-500">{uc.icon}</div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase">{uc.label}</p>
                    <p className="text-[9px] text-neutral-500">{uc.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}
      
      {/* Code Editor Body */}
      <div className="flex-1 overflow-auto bg-white dark:bg-black p-8 lg:px-12 selection:bg-amber-600/20 dark:selection:bg-amber-500/30">
        <div className="max-w-5xl mx-auto">
          <pre className="font-mono text-sm lg:text-base leading-relaxed">
            <code dangerouslySetInnerHTML={{
              __html: jsonString.replace(
                /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                (match) => {
                  let cls = 'text-amber-700 dark:text-amber-200'; // number
                  if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                      cls = 'text-amber-600 dark:text-amber-500 font-bold'; // key
                    } else {
                      cls = 'text-neutral-500 dark:text-neutral-400'; // string
                    }
                  } else if (/true|false/.test(match)) {
                    cls = 'text-emerald-600 dark:text-emerald-400 font-bold'; // boolean
                  } else if (/null/.test(match)) {
                    cls = 'text-red-600 dark:text-red-400 italic'; // null
                  }
                  return `<span class="${cls}">${match}</span>`;
                }
              )
            }} />
          </pre>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-8 lg:px-12 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-500" />
            <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.3em]">Production Ready Payload</span>
         </div>
         <p className="text-[10px] text-neutral-500 dark:text-neutral-600 font-bold uppercase tracking-widest hidden sm:block">
           Sanitized & Validated for Automations
         </p>
      </div>
    </div>
  );
};

export default JsonPreview;
