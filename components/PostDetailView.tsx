
import React, { useState, useMemo } from 'react';
import { SocialPost, SocialPlatform, PostStatus, UserProfile, ProjectAssets } from '../types';
import { X, Image as ImageIcon, Check, Trash2, RefreshCw, Facebook, Instagram, Linkedin, Twitter, Calendar, Clock, AlertTriangle, Copy, Link as LinkIcon, Sparkles, MoreHorizontal, Heart, MessageCircle, Send, Bookmark, Wand2, CalendarPlus, Hash, FileJson, ChevronDown } from 'lucide-react';
import { generateImage, refineImagePrompt } from '../services/geminiService';
import { generateICS, downloadICS } from '../services/calendarService';

interface PostDetailViewProps {
  post: SocialPost;
  onClose: () => void;
  onUpdate: (updatedPost: SocialPost) => void;
  onDelete: (id: string) => void;
  userProfile?: UserProfile;
  projectAssets?: ProjectAssets;
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ post, onClose, onUpdate, onDelete, userProfile, projectAssets }) => {
  const [editedPost, setEditedPost] = useState<SocialPost>(post);
  const [activeTab, setActiveTab] = useState<SocialPlatform>(post.platforms[0] || 'instagram');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedProtocol, setCopiedProtocol] = useState(false);
  const [isSimulatingGen, setIsSimulatingGen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const formattedProtocol = useMemo(() => {
    if (!editedPost.campaignVisualProtocol) return "{\n  \"status\": \"Protocol not yet forged...\"\n}";
    try {
        const parsed = JSON.parse(editedPost.campaignVisualProtocol);
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        return editedPost.campaignVisualProtocol;
    }
  }, [editedPost.campaignVisualProtocol]);

  const togglePlatform = (p: SocialPlatform) => {
    const current = editedPost.platforms;
    const updated = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
    setEditedPost({ ...editedPost, platforms: updated });
  };

  const handleSave = () => {
    onUpdate(editedPost);
    onClose();
  };

  const handleApprove = () => {
    onUpdate({ ...editedPost, status: 'scheduled' });
    onClose();
  };

  const handleCopyPrompt = () => {
    if (editedPost.imagePrompt) {
        navigator.clipboard.writeText(editedPost.imagePrompt);
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleCopyProtocol = () => {
    if (editedPost.campaignVisualProtocol) {
        navigator.clipboard.writeText(formattedProtocol);
        setCopiedProtocol(true);
        setTimeout(() => setCopiedProtocol(false), 2000);
    }
  };

  const handleRefinePrompt = async () => {
      if (!userProfile || !editedPost.imagePrompt) return;
      setIsRefining(true);
      try {
          const refined = await refineImagePrompt(editedPost.imagePrompt, userProfile);
          setEditedPost(prev => ({ ...prev, imagePrompt: refined }));
      } catch (e) {
          console.error("Failed to refine", e);
      } finally {
          setIsRefining(false);
      }
  };

  const handleGeneratePlaceholder = async () => {
    setIsSimulatingGen(true);
    try {
        const prompt = editedPost.imagePrompt || editedPost.caption;
        if (!prompt) {
            alert("No prompt available to generate image.");
            setIsSimulatingGen(false);
            return;
        }
        const imageUrl = await generateImage(prompt);
        setEditedPost({ ...editedPost, imageUrl });
    } catch (error) {
        console.error("Failed to generate image", error);
        alert("Image generation failed.");
    } finally {
        setIsSimulatingGen(false);
    }
  };

  const handleSyncToCalendar = () => {
      const icsData = generateICS([editedPost], userProfile?.brandName || "PromptForge");
      downloadICS(icsData, `Post_${editedPost.title || editedPost.id}`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 dark:bg-black/95 backdrop-blur-xl flex items-start justify-center p-0 lg:p-8 animate-fade-in overflow-y-auto scrollbar-thin transition-colors duration-300">
      <div className="w-full max-w-7xl min-h-full lg:h-[90vh] flex flex-col lg:flex-row gap-4 lg:gap-12 items-start lg:items-center px-4 py-8 lg:p-0">
        
        {/* UNIT 1: Preview (Simulation) */}
        <div className="w-full lg:flex-1 h-auto lg:h-full relative flex flex-col items-center justify-center shrink-0">
          <div className="lg:absolute top-4 z-20 mb-6 lg:mb-0">
             <div className="flex gap-1 lg:gap-2 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-full shadow-lg">
                {(['instagram', 'facebook', 'linkedin', 'twitter'] as SocialPlatform[]).map(p => (
                  <button key={p} onClick={() => setActiveTab(p)} className={`p-2 lg:p-2.5 rounded-full transition-all ${activeTab === p ? 'bg-amber-600 text-black shadow-lg scale-105' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>
                    {p === 'instagram' && <Instagram size={16} />}
                    {p === 'facebook' && <Facebook size={16} />}
                    {p === 'linkedin' && <Linkedin size={16} />}
                    {p === 'twitter' && <Twitter size={16} />}
                  </button>
                ))}
             </div>
          </div>

          <div className="w-full max-w-[340px] md:max-w-[380px] h-[600px] lg:h-full lg:max-h-[820px] bg-white dark:bg-black border-[10px] md:border-[12px] border-neutral-200 dark:border-neutral-900 rounded-[3rem] md:rounded-[3.5rem] overflow-hidden relative shadow-2xl flex flex-col ring-1 ring-black/5 dark:ring-white/5">
             <div className="h-8 md:h-10 bg-white dark:bg-black flex items-center justify-between px-8 pt-2 shrink-0">
                <span className="text-[10px] md:text-[12px] font-bold text-neutral-900 dark:text-white">9:41</span>
                <div className="flex gap-1.5 items-center"><div className="w-4 h-2.5 bg-neutral-900 dark:bg-white rounded-[2px]" /><div className="w-0.5 h-1.5 bg-neutral-400 dark:bg-white/50 rounded-[1px]" /></div>
             </div>
             <div className="h-12 md:h-14 bg-white dark:bg-black flex items-center justify-between px-5 border-b border-neutral-100 dark:border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-amber-600 flex items-center justify-center text-[10px] font-black text-black">
                        {userProfile?.brandName?.substring(0,2).toUpperCase() || 'PF'}
                    </div>
                    <span className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[120px]">{userProfile?.brandName || 'PromptForge'}</span>
                </div>
                <MoreHorizontal size={18} className="text-neutral-400 dark:text-neutral-500" />
             </div>
             <div className="flex-1 overflow-y-auto bg-white dark:bg-black scrollbar-hide">
                <div className="aspect-[4/5] bg-neutral-50 dark:bg-neutral-900 relative overflow-hidden border-b border-neutral-100 dark:border-white/5">
                    {editedPost.imageUrl ? (
                        <img src={editedPost.imageUrl} alt="Post" className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                            <ImageIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-800 mb-4" />
                            <p className="text-[9px] text-neutral-400 dark:text-neutral-600 font-mono leading-relaxed truncate w-full">{editedPost.imagePrompt ? `"${editedPost.imagePrompt.slice(0, 40)}..."` : "Draft Prompt"}</p>
                        </div>
                    )}
                    {!editedPost.imageUrl && (
                        <div className="absolute inset-0 bg-black/5 dark:bg-black/10 flex items-center justify-center">
                            <button onClick={handleGeneratePlaceholder} className="bg-amber-600 hover:bg-amber-500 text-black px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2 transition-all shadow-xl active:scale-95">
                                {isSimulatingGen ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                {isSimulatingGen ? 'FORGING...' : 'GENERATE'}
                            </button>
                        </div>
                    )}
                </div>
                <div className="px-4 py-3 flex justify-between items-center"><div className="flex gap-4 text-neutral-900 dark:text-white"><Heart size={20} /><MessageCircle size={20} /><Send size={20} /></div><Bookmark size={20} className="text-neutral-900 dark:text-white" /></div>
                <div className="px-4 pb-6 space-y-1.5 text-xs">
                    <div className="font-bold text-neutral-900 dark:text-white">1,204 likes</div>
                    <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed"><span className="font-bold text-neutral-900 dark:text-white mr-2">{userProfile?.brandName || 'Architect'}</span>{editedPost.caption}</div>
                    <div className="text-orange-600 dark:text-amber-500 font-bold pt-1">{editedPost.tags?.map(t => `#${t.replace(/^#/, '')}`).join(' ')}</div>
                </div>
             </div>
             <div className="h-4 md:h-6 bg-white dark:bg-black flex justify-center items-start pt-1.5 shrink-0"><div className="w-24 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></div>
          </div>
        </div>

        {/* UNIT 2: Editor */}
        <div className="w-full lg:flex-1 min-h-[500px] lg:h-full bg-white dark:bg-neutral-900 rounded-[2rem] md:rounded-[2.5rem] flex flex-col border border-neutral-200 dark:border-white/5 shadow-2xl overflow-hidden relative max-w-2xl mb-8 lg:mb-0 transition-colors duration-300">
          <div className="h-16 lg:h-20 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between px-6 lg:px-8 bg-white dark:bg-neutral-900 shrink-0">
             <div className="min-w-0">
                 <h2 className="text-lg lg:text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight truncate">Forge Details</h2>
                 <span className="text-[9px] lg:text-[10px] text-orange-600 dark:text-amber-500 uppercase tracking-[0.2em] font-bold">{editedPost.status.replace('_', ' ')}</span>
             </div>
             <div className="flex items-center gap-2 lg:gap-3">
                <button onClick={handleSyncToCalendar} className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl text-orange-600 dark:text-amber-500 transition-colors border border-neutral-200 dark:border-white/5"><CalendarPlus size={18} /></button>
                <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full text-neutral-500 transition-colors"><X size={18} /></button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 lg:space-y-8 scrollbar-thin">
            <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">Destination Channels</label>
                <div className="flex gap-2 flex-wrap">
                    {(['instagram', 'facebook', 'linkedin', 'twitter'] as SocialPlatform[]).map(p => (
                        <button key={p} onClick={() => togglePlatform(p)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] lg:text-xs font-bold transition-all ${editedPost.platforms.includes(p) ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white shadow-sm' : 'bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-700'}`}>
                            {p === 'instagram' && <Instagram size={14} className={editedPost.platforms.includes(p) ? 'text-pink-500' : ''} />}
                            {p === 'facebook' && <Facebook size={14} className={editedPost.platforms.includes(p) ? 'text-blue-600' : ''} />}
                            {p === 'linkedin' && <Linkedin size={14} className={editedPost.platforms.includes(p) ? 'text-blue-700' : ''} />}
                            {p === 'twitter' && <Twitter size={14} className={editedPost.platforms.includes(p) ? 'text-sky-500' : ''} />}
                            <span className="capitalize">{p}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Release Date</label>
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-600 group-focus-within:text-orange-600 dark:group-focus-within:text-amber-500" />
                        <input type="date" value={editedPost.scheduledDate} onChange={(e) => setEditedPost({...editedPost, scheduledDate: e.target.value})} className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-xs lg:text-sm text-neutral-900 dark:text-white focus:border-orange-600 dark:focus:border-amber-500 outline-none transition-colors" />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Release Time</label>
                    <div className="relative group">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-600 group-focus-within:text-orange-600 dark:group-focus-within:text-amber-500" />
                        <input type="time" value={editedPost.scheduledTime} onChange={(e) => setEditedPost({...editedPost, scheduledTime: e.target.value})} className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-xs lg:text-sm text-neutral-900 dark:text-white focus:border-orange-600 dark:focus:border-amber-500 outline-none transition-colors" />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Architected Caption</label>
                <textarea value={editedPost.caption} onChange={(e) => setEditedPost({...editedPost, caption: e.target.value})} className="w-full bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-xs lg:text-sm text-neutral-900 dark:text-white focus:border-orange-600 dark:focus:border-amber-500 outline-none min-h-[120px] leading-relaxed resize-none scrollbar-thin transition-colors" placeholder="Forge your caption..." />
            </div>

            <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Hash size={12} /> Hashtag Engineering
                </label>
                <div className="bg-neutral-50 dark:bg-black/50 border border-neutral-200 dark:border-white/5 rounded-2xl p-4 transition-colors">
                    <textarea 
                        value={editedPost.tags?.join(', ') || ""} 
                        onChange={(e) => setEditedPost({...editedPost, tags: e.target.value.split(',').map(t => t.trim().replace(/^#/, ''))})} 
                        className="w-full bg-transparent text-[10px] lg:text-xs text-orange-600 dark:text-amber-500 font-mono leading-relaxed min-h-[60px] outline-none resize-none"
                        placeholder="e.g. tech, innovation..." 
                    />
                    <div className="flex justify-between items-center mt-2 border-t border-neutral-200 dark:border-neutral-800 pt-2">
                        <span className="text-[8px] text-neutral-400 dark:text-neutral-600 uppercase font-black tracking-widest">Global Reach Engine</span>
                        <div className="flex gap-2 overflow-x-auto">
                           {editedPost.tags?.slice(0, 4).map((t, idx) => (
                             <span key={idx} className="bg-orange-100 dark:bg-amber-500/10 text-orange-600 dark:text-amber-500 px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0">#{t}</span>
                           ))}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2"><FileJson size={12} /> Image Engineering Blueprint</span>
                    <span className="text-[8px] text-orange-600 dark:text-amber-500 font-bold uppercase tracking-tighter bg-orange-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">Architectural Logic</span>
                </label>
                <div className="relative group overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    <div className="absolute right-3 top-3 z-10 flex gap-2">
                        <button onClick={handleCopyProtocol} className="p-1.5 bg-white/80 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all backdrop-blur-md shadow-sm">
                            {copiedProtocol ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                    </div>
                    <div className="w-full bg-neutral-50 dark:bg-black p-4 text-[9px] lg:text-[10px] text-neutral-600 dark:text-neutral-400 font-mono leading-relaxed max-h-[220px] overflow-auto scrollbar-thin transition-colors">
                        <pre className="selection:bg-orange-600/10 dark:selection:bg-amber-500/30">
                            <code>{formattedProtocol}</code>
                        </pre>
                    </div>
                </div>
            </div>

            <div className="bg-neutral-100 dark:bg-black/50 rounded-[2rem] p-5 lg:p-6 border border-neutral-200 dark:border-white/5 transition-colors">
                 <label className="block text-[10px] font-black text-orange-600 dark:text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2"><ImageIcon size={14} /> Visual Synthesis Summary</label>
                 <div className="mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-600 uppercase font-black tracking-widest">Image Objective</span>
                        <div className="flex gap-2">
                            <button onClick={handleRefinePrompt} disabled={isRefining} className="text-[9px] flex items-center gap-1.5 text-orange-600 dark:text-amber-500 hover:text-orange-500 dark:hover:text-white transition-colors bg-orange-50 dark:bg-amber-500/10 px-2 py-1 rounded font-bold border border-orange-200 dark:border-none">
                                <Wand2 size={10} className={isRefining ? 'animate-spin' : ''} /> {isRefining ? 'Synthesizing...' : 'REFINE'}
                            </button>
                            <button onClick={handleCopyPrompt} className="text-[9px] flex items-center gap-1.5 text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors bg-white dark:bg-neutral-800 px-2 py-1 rounded font-bold shadow-sm border border-neutral-200 dark:border-none">
                                {copiedPrompt ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />} COPY
                            </button>
                        </div>
                    </div>
                    <textarea value={editedPost.imagePrompt || ""} onChange={(e) => setEditedPost({ ...editedPost, imagePrompt: e.target.value })} className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 lg:p-4 text-[10px] lg:text-xs text-neutral-600 dark:text-neutral-400 font-mono leading-relaxed min-h-[80px] outline-none scrollbar-thin resize-none transition-colors" placeholder="Describe visual objective..." />
                 </div>
                 <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                    <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
                        <input type="text" value={editedPost.imageUrl || ''} onChange={(e) => setEditedPost({...editedPost, imageUrl: e.target.value})} placeholder="Image URL..." className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 pl-10 pr-3 text-[10px] text-neutral-900 dark:text-white focus:border-orange-600 dark:focus:border-amber-500 outline-none transition-colors" />
                    </div>
                    <button onClick={handleGeneratePlaceholder} disabled={isSimulatingGen} className="bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-[10px] py-2 px-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-50 transition-colors">
                        {isSimulatingGen ? '...' : 'GENERATE'}
                    </button>
                 </div>
            </div>
          </div>

          <div className="p-6 lg:p-8 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 transition-colors">
            <button onClick={() => { onDelete(post.id); onClose(); }} className="w-full sm:w-auto text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">SCRAP POST</button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button onClick={handleSave} className="w-full sm:w-auto px-6 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-colors">SAVE DRAFT</button>
                <button onClick={handleApprove} className="w-full sm:w-auto px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white dark:text-black bg-orange-600 dark:bg-amber-600 hover:bg-orange-500 dark:hover:bg-amber-500 rounded-xl transition-all shadow-lg shadow-orange-600/20 dark:shadow-amber-600/20 active:scale-95">APPROVE FORGE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailView;
