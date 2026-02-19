
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, SocialPlatform } from '../types';
import { 
  Save, Sparkles, Upload, Check, Instagram, Facebook, 
  Linkedin, Twitter, ChevronDown, Link as LinkIcon, 
  Palette, Globe, Target, Info, Cpu, 
  Pencil, Info as InfoIcon, Globe as GlobeIcon, Key, ExternalLink,
  ShieldCheck, HelpCircle, Eye, EyeOff
} from 'lucide-react';

interface SettingsProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>({
    brandName: profile.brandName || '',
    tagline: profile.tagline || '',
    website: profile.website || '',
    logoUrl: profile.logoUrl || '',
    targetAudience: profile.targetAudience || '',
    brandVoice: profile.brandVoice || '',
    brandVisuals: profile.brandVisuals || '',
    primaryColor: profile.primaryColor || '#000000',
    secondaryColor: profile.secondaryColor || '#ffffff',
    socialCredentials: profile.socialCredentials || {},
    geminiApiKey: profile.geminiApiKey || '',
    otherLlmEnabled: profile.otherLlmEnabled || false,
    otherLlmBaseUrl: profile.otherLlmBaseUrl || 'https://api.groq.com/openai/v1',
    otherLlmModelId: profile.otherLlmModelId || 'llama3-70b-8192',
    otherLlmApiKey: profile.otherLlmApiKey || ''
  });

  const [isSaved, setIsSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<SocialPlatform | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => handleChange('logoUrl', reader.result as string);
    reader.readAsDataURL(file);
  };

  const platforms: { id: SocialPlatform; name: string; icon: React.ReactNode; color: string }[] = [
    { id: 'instagram', name: 'Instagram', icon: <Instagram size={18} />, color: 'text-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: <Facebook size={18} />, color: 'text-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={18} />, color: 'text-blue-700' },
    { id: 'twitter', name: 'Twitter (X)', icon: <Twitter size={18} />, color: 'text-sky-500' },
  ];

  const cardClasses = "bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#222222] rounded-2xl p-6 mb-6 shadow-sm transition-all duration-300";
  const labelClasses = "block text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2";
  const inputClasses = "w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#262626] rounded-lg p-3 text-sm text-neutral-900 dark:text-white focus:border-amber-600 focus:ring-1 focus:ring-amber-600/10 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-700";

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-black transition-colors duration-300 animate-fade-in">
      <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Settings & Connections</h1>
            <p className="text-neutral-500 text-sm">Manage your Brand DNA and Social Connections for Socials by MCCIA.</p>
          </div>

          {/* Gemini API Key Section - Redesigned for Manual Entry */}
          <div className="bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#222222] rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-neutral-100 dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shrink-0">
                <Key size={24} className="text-[#e65100]" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">Gemini AI Configuration</h2>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Configure your generation engine</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClasses}>
                  <ShieldCheck size={12} className="text-[#e65100]" /> 
                  Gemini API Key (Manual Entry)
                </label>
                <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"}
                    value={formData.geminiApiKey} 
                    onChange={(e) => handleChange('geminiApiKey', e.target.value)} 
                    placeholder="AIzaSy..." 
                    className={`${inputClasses} font-mono pr-12`}
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Detailed Rate Limit Info */}
                <div className="bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#2a2a2a] rounded-xl p-5">
                  <h4 className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <InfoIcon size={14} className="text-blue-500" />
                    Usage Limits (Free Tier)
                  </h4>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">RPM</span>
                        <span className="text-[11px] font-black text-neutral-900 dark:text-white">15</span>
                      </div>
                      <span className="text-[8px] text-neutral-500 font-medium uppercase tracking-tighter">Requests Per Minute</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">TPM</span>
                        <span className="text-[11px] font-black text-neutral-900 dark:text-white">1,000,000</span>
                      </div>
                      <span className="text-[8px] text-neutral-500 font-medium uppercase tracking-tighter">Tokens Per Minute</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">RPD</span>
                        <span className="text-[11px] font-black text-neutral-900 dark:text-white">1,500</span>
                      </div>
                      <span className="text-[8px] text-neutral-500 font-medium uppercase tracking-tighter">Requests Per Day</span>
                    </div>
                  </div>
                </div>

                {/* Setup Guide */}
                <div className="bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#2a2a2a] rounded-xl p-5">
                  <h4 className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <HelpCircle size={14} className="text-[#e65100]" />
                    How to get your key
                  </h4>
                  <div className="space-y-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                    <div className="flex gap-2">
                      <span className="w-4 h-4 rounded bg-[#e65100]/10 text-[#e65100] flex items-center justify-center shrink-0 font-bold">1</span>
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-white flex items-center gap-1">
                        Open Google AI Studio <ExternalLink size={8} />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-4 h-4 rounded bg-[#e65100]/10 text-[#e65100] flex items-center justify-center shrink-0 font-bold">2</span>
                      <span>Select "Get API key" from the left menu.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-4 h-4 rounded bg-[#e65100]/10 text-[#e65100] flex items-center justify-center shrink-0 font-bold">3</span>
                      <span>Create a new key or use an existing one.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-4 h-4 rounded bg-[#e65100]/10 text-[#e65100] flex items-center justify-center shrink-0 font-bold">4</span>
                      <span>Copy the key and paste it into the field above.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other LLM Providers Section */}
          <div className={cardClasses}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-neutral-100 dark:bg-[#1a1a1a] rounded-xl text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-[#222222]">
                  <Cpu size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-tight">Custom LLM Fallback</h2>
                  <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Connect external services if primary gateway is limited.</p>
                </div>
              </div>
              <button 
                onClick={() => handleChange('otherLlmEnabled', !formData.otherLlmEnabled)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${formData.otherLlmEnabled ? 'bg-[#e65100] text-white border-2 border-white/20' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}`}
              >
                {formData.otherLlmEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {formData.otherLlmEnabled && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}><GlobeIcon size={12}/> Base API URL</label>
                            <input 
                                type="text" 
                                value={formData.otherLlmBaseUrl} 
                                onChange={(e) => handleChange('otherLlmBaseUrl', e.target.value)} 
                                placeholder="https://api.groq.com/openai/v1" 
                                className={inputClasses} 
                            />
                        </div>
                        <div>
                            <label className={labelClasses}><Cpu size={12}/> Model ID</label>
                            <input 
                                type="text" 
                                value={formData.otherLlmModelId} 
                                onChange={(e) => handleChange('otherLlmModelId', e.target.value)} 
                                placeholder="llama3-70b-8192" 
                                className={inputClasses} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}><Key size={12}/> Provider API Key</label>
                        <input 
                            type="password" 
                            value={formData.otherLlmApiKey} 
                            onChange={(e) => handleChange('otherLlmApiKey', e.target.value)} 
                            placeholder="gsk_..." 
                            className={inputClasses} 
                        />
                    </div>
                </div>
            )}
          </div>

          {/* Brand DNA Section */}
          <div className={cardClasses}>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-neutral-100 dark:bg-[#1a1a1a] rounded-xl text-amber-600 border border-neutral-200 dark:border-[#222222]">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-tight">Brand DNA</h2>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Define your identity for campaign consistency.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Brand Name</label>
                  <input type="text" value={formData.brandName} onChange={(e) => handleChange('brandName', e.target.value)} placeholder="e.g. Acme Corp" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Tagline</label>
                  <input type="text" value={formData.tagline} onChange={(e) => handleChange('tagline', e.target.value)} placeholder="e.g. Innovation for everyone" className={inputClasses} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Website</label>
                  <input type="text" value={formData.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://example.com" className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Brand Logo (PNG)</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => logoInputRef.current?.click()}
                      className="w-12 h-12 shrink-0 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#262626] border-dashed rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-amber-600 transition-all"
                    >
                      <Upload size={18} />
                      <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/png" />
                    </button>
                    <input type="text" value={formData.logoUrl} onChange={(e) => handleChange('logoUrl', e.target.value)} placeholder="Or paste logo URL..." className={inputClasses} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Brand Colors</label>
                  <div className="flex items-center gap-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#262626] rounded-lg p-2.5">
                    <input type="color" value={formData.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} className="w-6 h-6 rounded bg-transparent border-none cursor-pointer" />
                    <input type="text" value={formData.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} className="bg-transparent text-xs text-neutral-900 dark:text-white font-mono outline-none w-full" />
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-600 font-bold uppercase tracking-tighter">Primary</span>
                  </div>
                </div>
                <div className="pt-6 sm:pt-0">
                  <div className="flex items-center gap-3 bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#262626] rounded-lg p-2.5 mt-0 md:mt-[18px]">
                    <input type="color" value={formData.secondaryColor} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="w-6 h-6 rounded bg-transparent border-none cursor-pointer" />
                    <input type="text" value={formData.secondaryColor} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="bg-transparent text-xs text-neutral-900 dark:text-white font-mono outline-none w-full" />
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-600 font-bold uppercase tracking-tighter">Secondary</span>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClasses}>Target Audience</label>
                <input type="text" value={formData.targetAudience} onChange={(e) => handleChange('targetAudience', e.target.value)} placeholder="e.g. Gen Z gamers" className={inputClasses} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Brand Voice</label>
                  <Pencil size={12} className="text-neutral-400 dark:text-neutral-700" />
                </div>
                <textarea 
                  value={formData.brandVoice} 
                  onChange={(e) => handleChange('brandVoice', e.target.value)} 
                  placeholder="e.g. Professional, Witty" 
                  className={`${inputClasses} min-h-[80px] resize-none`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Visual Style</label>
                  <button className="text-[9px] text-orange-600 dark:text-orange-500 font-bold flex items-center gap-1.5 hover:underline uppercase tracking-tighter">
                    <Sparkles size={12} /> Analyze Reference Image
                  </button>
                </div>
                <textarea 
                  value={formData.brandVisuals} 
                  onChange={(e) => handleChange('brandVisuals', e.target.value)} 
                  placeholder="Detailed visual identity..." 
                  className={`${inputClasses} min-h-[100px] resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Connected Accounts Section */}
          <div className={cardClasses}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-neutral-100 dark:bg-[#1a1a1a] rounded-xl text-blue-500 border border-neutral-200 dark:border-[#222222]">
                <LinkIcon size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-tight">Connected Accounts</h2>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Connect profiles to enable auto-posting.</p>
              </div>
            </div>

            <div className="space-y-3">
              {platforms.map((platform) => (
                <div key={platform.id} className="bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#262626] rounded-xl overflow-hidden shadow-sm dark:shadow-none">
                  <button 
                    onClick={() => setExpandedPlatform(expandedPlatform === platform.id ? null : platform.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={platform.color}>{platform.icon}</div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{platform.name}</span>
                    </div>
                    <ChevronDown size={16} className={`text-neutral-400 dark:text-neutral-600 transition-transform ${expandedPlatform === platform.id ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedPlatform === platform.id && (
                    <div className="p-4 border-t border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#0a0a0a]">
                       <p className="text-[10px] text-neutral-500 font-medium italic mb-4">OAuth credentials required for production...</p>
                       <button className="w-full py-2.5 bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#262626] rounded-lg text-[10px] font-black text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all uppercase tracking-widest">
                         Connect {platform.name}
                       </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-black border-t border-neutral-200 dark:border-[#222222] flex justify-end shrink-0 z-50 transition-colors duration-300">
        <button onClick={handleSave} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-black font-black py-3 px-10 rounded-xl transition-all shadow-xl shadow-amber-600/10 uppercase tracking-widest text-[10px]">
          {isSaved ? <Check size={16} /> : <Save size={16} />}
          <span>{isSaved ? 'Protocol Committed' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
