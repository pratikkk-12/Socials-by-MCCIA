
import React from 'react';
import { TEMPLATES } from '../constants';
import { Template } from '../types';
import { Copy, ArrowRight } from 'lucide-react';

interface TemplateLibraryProps {
  onSelect: (template: Template) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSelect }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto transition-colors duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Template Library</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">Jump start your prompt generation with pre-built structures.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((template) => (
          <div 
            key={template.id}
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer flex flex-col shadow-sm dark:shadow-none"
            onClick={() => onSelect(template)}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500 text-xs font-medium border border-orange-500/20">
                {template.category_id.replace('_', ' ')}
              </span>
              <div className="text-neutral-300 dark:text-neutral-600 group-hover:text-orange-500 transition-colors">
                <Copy className="w-4 h-4" />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">{template.name}</h3>
            <p className="text-neutral-500 dark:text-neutral-500 text-sm mb-6 flex-1 line-clamp-3">{template.description}</p>
            
            <div className="flex items-center text-sm text-orange-600 dark:text-orange-500 font-medium mt-auto group-hover:translate-x-1 transition-transform">
              <span>Use Template</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateLibrary;
