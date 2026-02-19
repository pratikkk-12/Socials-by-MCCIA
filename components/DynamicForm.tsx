
import React, { useEffect } from 'react';
import { FormField } from '../types';
import { Plus, Trash2, Wand2, Sparkles, ChevronDown, Info } from 'lucide-react';

interface DynamicFormProps {
  fields: FormField[];
  data: any;
  onChange: (newData: any) => void;
  onEnhance: () => void;
  isEnhancing: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ fields, data, onChange, onEnhance, isEnhancing }) => {
  
  useEffect(() => {
    const defaultData = { ...data };
    let hasChanges = false;
    fields.forEach(field => {
      if (defaultData[field.name] === undefined && field.default !== undefined) {
        defaultData[field.name] = field.default;
        hasChanges = true;
      }
    });
    if (hasChanges) {
      onChange(defaultData);
    }
  }, [fields]);

  const handleChange = (name: string, value: any) => {
    onChange({ ...data, [name]: value });
  };

  const inputClasses = "w-full bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 md:p-3.5 text-xs md:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/10 outline-none transition-all shadow-sm dark:shadow-inner";

  return (
    <div className="space-y-8 md:space-y-10 pb-64">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2 md:space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1">
             <label className="text-[9px] md:text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                {field.label || field.name.replace(/_/g, ' ')}
                {field.required && <span className="text-amber-500 ml-1">*</span>}
             </label>
             {field.description && <span className="text-[9px] md:text-[10px] text-neutral-400 dark:text-neutral-600 font-medium italic">{field.description}</span>}
          </div>

          {field.type === 'textarea' && (
            <textarea
              className={`${inputClasses} min-h-[120px] md:min-h-[140px] resize-none leading-relaxed scrollbar-thin`}
              placeholder={field.placeholder}
              value={data[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}

          {field.type === 'text' && (
            <input
              type="text"
              className={inputClasses}
              placeholder={field.placeholder}
              value={data[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}

          {field.type === 'select' && (
            <div className="relative">
              <select
                className={`${inputClasses} appearance-none pr-10`}
                value={data[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
              >
                <option value="" disabled className="bg-white dark:bg-black">Select configuration...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt} className="bg-white dark:bg-black py-2">
                    {opt.toString().toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={16} />
            </div>
          )}

          {field.type === 'json_editor' && (
             <div className="relative group">
                <textarea
                  className={`${inputClasses} font-mono text-[10px] md:text-xs min-h-[150px] md:min-h-[180px] bg-neutral-50 dark:bg-black border-neutral-200 dark:border-neutral-800/80 group-focus-within:border-amber-500/40 scrollbar-thin`}
                  placeholder={field.placeholder}
                  value={typeof data[field.name] === 'object' ? JSON.stringify(data[field.name], null, 2) : (data[field.name] || '')}
                  onChange={(e) => {
                     try {
                         const parsed = JSON.parse(e.target.value);
                         handleChange(field.name, parsed);
                     } catch (err) {
                         handleChange(field.name, e.target.value);
                     }
                  }}
                />
                <div className="absolute top-3 right-3 opacity-30 group-hover:opacity-100 transition-opacity">
                   <div className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">JSON</div>
                </div>
             </div>
          )}

          {field.type === 'array' && (
            <div className="space-y-2">
              {(data[field.name] || []).map((item: string, idx: number) => (
                <div key={idx} className="flex gap-2 group animate-fade-in">
                  <input
                    type="text"
                    className={`${inputClasses} py-2`}
                    value={item}
                    onChange={(e) => {
                        const newArray = [...(data[field.name] || [])];
                        newArray[idx] = e.target.value;
                        handleChange(field.name, newArray);
                    }}
                  />
                  <button
                    onClick={() => {
                        const newArray = [...(data[field.name] || [])];
                        newArray.splice(idx, 1);
                        handleChange(field.name, newArray);
                    }}
                    className="p-2 text-neutral-400 dark:text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleChange(field.name, [...(data[field.name] || []), ""])}
                className="flex items-center gap-2 text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest hover:text-amber-500 py-2 group"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                  <Plus size={14} />
                </div>
                Add Entry
              </button>
            </div>
          )}

          {field.type === 'dynamic_fields' && (
            <div className="space-y-3 bg-neutral-100 dark:bg-neutral-900/30 p-3 md:p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800/50">
              {(data.custom_fields || []).map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center animate-fade-in">
                  <input
                    type="text"
                    placeholder="KEY"
                    className="w-full sm:w-1/3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 text-[10px] text-amber-600 dark:text-amber-500 font-bold tracking-tight outline-none focus:border-amber-500/30"
                    value={item.key}
                    onChange={(e) => {
                        const current = [...(data.custom_fields || [])];
                        current[idx] = { ...current[idx], key: e.target.value };
                        handleChange('custom_fields', current);
                    }}
                  />
                  <div className="flex w-full gap-2 items-center">
                    <input
                      type="text"
                      placeholder="VALUE"
                      className="flex-1 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 text-[10px] text-neutral-800 dark:text-neutral-300 outline-none focus:border-amber-500/30"
                      value={item.value}
                      onChange={(e) => {
                          const current = [...(data.custom_fields || [])];
                          current[idx] = { ...current[idx], value: e.target.value };
                          handleChange('custom_fields', current);
                      }}
                    />
                    <button
                      onClick={() => {
                          const current = [...(data.custom_fields || [])];
                          current.splice(idx, 1);
                          handleChange('custom_fields', current);
                      }}
                      className="p-2 text-neutral-400 dark:text-neutral-700 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => handleChange('custom_fields', [...(data.custom_fields || []), { key: "", value: "" }])}
                className="flex items-center gap-2 text-[10px] font-black text-neutral-500 hover:text-amber-500 transition-colors pt-1"
              >
                <Plus size={14} /> Add Property
              </button>
            </div>
          )}
        </div>
      ))}

      {/* AI Forge Wand */}
      <div className="fixed bottom-32 sm:bottom-20 right-4 sm:right-8 flex flex-col items-end pointer-events-none z-[60] gap-3">
        <div className="pointer-events-auto bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-3 animate-fade-in group hover:border-emerald-500/30 transition-all shadow-lg">
           <Info size={12} className="text-neutral-400 dark:text-neutral-500 group-hover:text-emerald-500 transition-colors" />
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">Scalability Protocol</span>
              <span className="text-[9px] text-neutral-600 dark:text-neutral-400">Powered by <span className="text-emerald-600 dark:text-emerald-500 font-bold">Gemini Flash</span>.</span>
           </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-3 md:gap-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-800 p-2 md:p-2.5 pr-3 rounded-[2rem] shadow-xl dark:shadow-[0_25px_60px_rgba(0,0,0,0.8)] border-t-neutral-100 dark:border-t-white/5">
           <div className="hidden sm:flex flex-col px-4 border-r border-neutral-200 dark:border-neutral-800">
              <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Forge Engine</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase flex items-center gap-1.5 mt-0.5">
                 <Sparkles size={10} className="animate-pulse" /> Flash Core
              </span>
           </div>
           <button
            onClick={onEnhance}
            disabled={isEnhancing}
            title="Optimizes structure and logic using high-speed Flash intelligence"
            className={`
              flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest text-black shadow-lg shadow-emerald-600/30
              transition-all duration-300 transform active:scale-95
              ${isEnhancing 
                ? 'bg-neutral-200 dark:bg-neutral-800 cursor-not-allowed opacity-75 text-emerald-600 dark:text-emerald-500' 
                : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/50 hover:-translate-y-0.5'}
            `}
          >
            {isEnhancing ? (
              <>
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-emerald-500/30 border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin" />
                <span>REFINING...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3 md:w-4 md:h-4" />
                <span>ENHANCE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicForm;
