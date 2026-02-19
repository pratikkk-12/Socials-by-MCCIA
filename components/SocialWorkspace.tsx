
import React, { useState } from 'react';
import { SocialPost, UserProfile, ProjectAssets } from '../types';
import CalendarView from './CalendarView';
import PostDetailView from './PostDetailView';
import { Calendar as CalendarIcon, List, BarChart3, Plus, Layers, AlertCircle, CalendarPlus } from 'lucide-react';
import { generateICS, downloadICS } from '../services/calendarService';

interface SocialWorkspaceProps {
  posts: SocialPost[];
  onUpdatePosts: (posts: SocialPost[]) => void;
  userProfile?: UserProfile;
  projectAssets?: ProjectAssets;
  onPostSelect?: (id: string | null) => void;
}

const SocialWorkspace: React.FC<SocialWorkspaceProps> = ({ posts, onUpdatePosts, userProfile, projectAssets, onPostSelect }) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'analytics'>('calendar');
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  const handlePostClick = (post: SocialPost) => {
    setSelectedPost(post);
    if (onPostSelect) onPostSelect(post.id);
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
    if (onPostSelect) onPostSelect(null);
  };

  const handleUpdatePost = (updated: SocialPost) => {
    const newPosts = posts.map(p => p.id === updated.id ? updated : p);
    onUpdatePosts(newPosts);
  };

  const handleDeletePost = (id: string) => {
    const newPosts = posts.filter(p => p.id !== id);
    onUpdatePosts(newPosts);
  };

  const handleCreatePost = () => {
    const newPost: SocialPost = {
        id: `post-${Date.now()}`,
        title: 'New Draft Post',
        caption: '',
        platforms: ['instagram'],
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '12:00',
        status: 'draft',
        tags: []
    };
    onUpdatePosts([...posts, newPost]);
    setSelectedPost(newPost);
    if (onPostSelect) onPostSelect(newPost.id);
  };

  const handleBatchApplyAssets = () => {
    if (!projectAssets?.styleInstructions) {
        alert("No project style instructions defined in Project Settings.");
        return;
    }
    const confirmed = window.confirm("This will append your Project Style Instructions to the AI prompts of ALL draft posts. Continue?");
    if (!confirmed) return;

    const updatedPosts = posts.map(p => {
        if (p.status === 'draft') {
            return {
                ...p,
                imagePrompt: p.imagePrompt 
                    ? `${p.imagePrompt}. \n\nStyle Note: ${projectAssets.styleInstructions}`
                    : `Create an image for a post about "${p.title}". Style Note: ${projectAssets.styleInstructions}`
            };
        }
        return p;
    });
    onUpdatePosts(updatedPosts);
  };

  const handleExportCampaign = () => {
      if (posts.length === 0) return;
      const icsData = generateICS(posts, userProfile?.brandName || "MrJSON");
      downloadICS(icsData, `Campaign_${userProfile?.brandName || 'Export'}`);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      {/* Workspace Header */}
      <div className="min-h-14 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between px-4 py-2 bg-white dark:bg-black gap-3 transition-colors duration-300">
        <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-lg p-1 border border-neutral-200 dark:border-neutral-800 overflow-x-auto shrink-0 transition-colors">
            <button 
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-md flex items-center gap-2 text-[10px] md:text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'}`}
            >
                <CalendarIcon size={14} />
                <span className="hidden sm:inline">Calendar</span>
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md flex items-center gap-2 text-[10px] md:text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'}`}
            >
                <List size={14} />
                <span className="hidden sm:inline">List</span>
            </button>
            <button 
                onClick={() => setViewMode('analytics')}
                className={`p-1.5 rounded-md flex items-center gap-2 text-[10px] md:text-sm font-medium transition-all ${viewMode === 'analytics' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'}`}
            >
                <BarChart3 size={14} />
                <span className="hidden sm:inline">Analytics</span>
            </button>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
             <div className="text-[10px] text-neutral-500 hidden sm:block">
                <span className="text-orange-600 dark:text-orange-500 font-bold">{posts.filter(p => p.status === 'awaiting_approval').length}</span> <span className="hidden lg:inline">Approval Pending</span><span className="lg:hidden">Pending</span>
             </div>
             
             <button 
                onClick={handleExportCampaign}
                className="text-neutral-500 dark:text-neutral-400 hover:text-orange-600 dark:hover:text-orange-500 text-[10px] font-medium px-2 py-1.5 rounded-md flex items-center gap-1.5 transition-colors border border-transparent hover:border-neutral-300 dark:hover:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50"
             >
                 <CalendarPlus size={14} />
                 <span className="hidden md:inline">Sync Calendar</span>
             </button>

             <button 
                onClick={handleBatchApplyAssets}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-[10px] font-medium px-2 py-1.5 rounded-md flex items-center gap-1 transition-colors border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
             >
                 <Layers size={14} />
                 <span className="hidden md:inline">Apply Styles</span>
             </button>

             <button 
                 onClick={handleCreatePost}
                 className="bg-orange-600 hover:bg-orange-500 text-white dark:text-black text-[10px] lg:text-sm font-bold px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors shadow-sm"
             >
                 <Plus size={14} />
                 <span>Create</span>
             </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 dark:text-neutral-500 px-4 text-center">
                <AlertCircle size={48} className="mb-4 opacity-20" />
                <p className="mb-2 text-sm lg:text-base">This project is currently empty.</p>
                <p className="text-xs">Use the chat to "Plan a campaign" or click the Create button.</p>
            </div>
        ) : (
            <div className="h-full overflow-auto">
                {viewMode === 'calendar' && (
                    <CalendarView posts={posts} onPostClick={handlePostClick} />
                )}
                
                {viewMode === 'list' && (
                    <div className="p-4 md:p-6 min-w-[600px] bg-white dark:bg-transparent transition-colors duration-300">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-neutral-400 dark:text-neutral-500 text-[10px] lg:text-xs uppercase border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="pb-3 pl-2">Schedule</th>
                                    <th className="pb-3">Content Preview</th>
                                    <th className="pb-3">Platforms</th>
                                    <th className="pb-3 text-right pr-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.slice().sort((a,b) => a.scheduledDate.localeCompare(b.scheduledDate)).map(post => (
                                    <tr 
                                        key={post.id} 
                                        onClick={() => handlePostClick(post)}
                                        className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer group text-xs lg:text-sm text-neutral-600 dark:text-neutral-300 transition-colors"
                                    >
                                        <td className="py-4 pl-2 font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                                          {post.scheduledDate} <br/> <span className="text-neutral-500 dark:text-neutral-600">{post.scheduledTime}</span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <p className="font-bold text-neutral-900 dark:text-white mb-1 line-clamp-1">{post.title}</p>
                                            <p className="text-[10px] lg:text-xs text-neutral-400 dark:text-neutral-500 line-clamp-1 italic">"{post.caption}"</p>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex gap-1 opacity-60 group-hover:opacity-100 flex-wrap max-w-[100px]">
                                                {post.platforms.map(p => (
                                                  <span key={p} className="w-5 h-5 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded text-[9px] font-black">{p[0].toUpperCase()}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            <span className={`px-2 py-1 rounded-[4px] text-[8px] lg:text-[10px] uppercase font-black tracking-widest 
                                                ${post.status === 'scheduled' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500 border border-emerald-500/10' : 
                                                  post.status === 'awaiting_approval' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 border border-orange-500/10' : 
                                                  'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700'}`}>
                                                {post.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {viewMode === 'analytics' && (
                    <div className="p-8 flex items-center justify-center h-full text-neutral-400 dark:text-neutral-500 flex-col text-center bg-white dark:bg-transparent">
                        <BarChart3 size={48} className="mb-4 opacity-20" />
                        <p className="max-w-xs text-sm">Post-launch analytics will populate here once campaigns are live on connected channels.</p>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Modals */}
      {selectedPost && (
        <PostDetailView 
            post={selectedPost} 
            userProfile={userProfile}
            projectAssets={projectAssets}
            onClose={handleCloseDetail} 
            onUpdate={handleUpdatePost}
            onDelete={handleDeletePost}
        />
      )}
    </div>
  );
};

export default SocialWorkspace;
