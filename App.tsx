
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage, SocialPost, AppMode, Project } from './types';
import { generateFromNaturalLanguage } from './services/geminiService';
import { 
  initFirebase, 
  saveProjectToCloud, 
  loadProjectsFromCloud, 
  deleteProjectFromCloud,
  saveProfileToCloud,
  loadProfileFromCloud
} from './services/firebaseService';
import { 
  Bot, 
  Settings as SettingsIcon, 
  Send, 
  Loader2, 
  Plus, 
  MessageSquare, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Trash, 
  Settings2, 
  X, 
  Zap,
  BarChart3,
  HelpCircle,
  Menu,
  Sparkles,
  Timer,
  Cloud,
  CloudOff,
  Sun,
  Moon,
  Calendar,
  Terminal
} from 'lucide-react';
import SocialWorkspace from './components/SocialWorkspace';
import ClassicWorkspace from './components/ClassicWorkspace';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';
import HelpPanel from './components/HelpPanel';

const parseInline = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-neutral-900 dark:text-white font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <div className="space-y-1.5 w-full">
      {text.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
             return (
                 <div key={i} className="flex gap-2 ml-2">
                     <span className="text-amber-500 shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 block"></span>
                     <span className="flex-1 text-neutral-600 dark:text-neutral-300">{parseInline(trimmed.replace(/^[-•*]\s/, '').trim())}</span>
                 </div>
             )
        }
        const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
        if (numMatch) {
            return (
                <div key={i} className="flex gap-3 ml-1 mt-3 mb-1 bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/5 shadow-sm hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                    <span className="text-amber-500 font-bold font-mono text-lg shrink-0 w-6 text-center">{numMatch[1]}</span>
                    <div className="flex-1 flex flex-col justify-center text-neutral-800 dark:text-neutral-200">
                        {parseInline(numMatch[2])}
                    </div>
                </div>
            )
        }
        return <div key={i} className="leading-relaxed min-h-[1.2em] text-neutral-600 dark:text-neutral-300">{parseInline(line)}</div>;
      })}
    </div>
  )
}

function App() {
  const [mode, setMode] = useState<AppMode | 'settings' | 'dashboard'>('social');
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(window.innerWidth > 1280);
  const [isCloudEnabled, setIsCloudEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('promptforge_theme');
    return saved ? saved === 'dark' : true;
  });

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'default-project',
      name: 'Initial Forge',
      createdAt: Date.now(),
      messages: [{ role: 'assistant', text: "Welcome to Socials by MCCIA. System protocols active.", timestamp: Date.now() }],
      posts: [],
      schemas: []
    }
  ]);
  const [activeProjectId, setActiveProjectId] = useState<string>('default-project');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    brandName: 'MCCIA User',
    tagline: 'Creating Perfect JSON',
    website: '',
    logoUrl: '',
    targetAudience: '',
    brandVoice: 'Technical yet accessible',
    brandVisuals: 'Clean, industrial, high-contrast',
    primaryColor: '#f59e0b',
    secondaryColor: '#171717',
    socialCredentials: {},
    geminiApiKey: '',
    firebaseConfig: null,
    otherLlmEnabled: false,
    otherLlmBaseUrl: 'https://api.groq.com/openai/v1',
    otherLlmModelId: 'llama3-70b-8192',
    otherLlmApiKey: ''
  });

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const chatHistory = activeProject.messages;
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('promptforge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('promptforge_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const getEnv = (key: string) => {
      try { return process?.env?.[key]; } catch (e) { return undefined; }
    };

    const envFirebaseConfig = {
      apiKey: getEnv('FIREBASE_API_KEY'),
      authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
      projectId: getEnv('FIREBASE_PROJECT_ID'),
      storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnv('FIREBASE_APP_ID'),
      measurementId: getEnv('FIREBASE_MEASUREMENT_ID')
    };

    const hasEnvConfig = !!(envFirebaseConfig.apiKey && envFirebaseConfig.projectId);

    const savedProfile = localStorage.getItem('promptforge_profile');
    let profileToUse = userProfile;
    if (savedProfile) {
        try { 
            const parsed = JSON.parse(savedProfile);
            profileToUse = { ...userProfile, ...parsed };
            setUserProfile(profileToUse);
        } catch (e) {}
    }

    const finalFirebaseConfig = hasEnvConfig ? envFirebaseConfig : profileToUse.firebaseConfig;

    if (finalFirebaseConfig) {
       const success = initFirebase(finalFirebaseConfig);
       setIsCloudEnabled(success);
       if (success) {
           loadDataFromCloud();
           if (hasEnvConfig) {
              setUserProfile(prev => ({...prev, firebaseConfig: envFirebaseConfig}));
           }
       }
    }

    if (!hasEnvConfig && !profileToUse.firebaseConfig) {
        const savedProjects = localStorage.getItem('promptforge_projects');
        if (savedProjects) {
            try {
                const parsed = JSON.parse(savedProjects);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setProjects(parsed);
                    setActiveProjectId(parsed[0].id);
                }
            } catch(e) {}
        }
    }
  }, []);

  const loadDataFromCloud = async () => {
      setIsSyncing(true);
      try {
        const cloudProjects = await loadProjectsFromCloud();
        if (cloudProjects && cloudProjects.length > 0) {
            setProjects(cloudProjects);
            setActiveProjectId(cloudProjects[0].id);
        }
      } catch (e) {
        console.error("Cloud vault synchronization failed", e);
      } finally {
        setIsSyncing(false);
      }
  };

  useEffect(() => {
    if (!isCloudEnabled) {
      localStorage.setItem('promptforge_projects', JSON.stringify(projects));
      return;
    }
    const timer = setTimeout(() => {
       setIsSyncing(true);
       saveProjectToCloud(activeProject).finally(() => setIsSyncing(false));
    }, 2500);
    return () => clearTimeout(timer);
  }, [projects, activeProjectId, isCloudEnabled]);

  const handleSaveProfile = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('promptforge_profile', JSON.stringify(newProfile));
    if (newProfile.firebaseConfig) {
        const success = initFirebase(newProfile.firebaseConfig);
        setIsCloudEnabled(success);
        if (success) {
            await saveProfileToCloud(newProfile);
            loadDataFromCloud();
        }
    }
  };

  const createNewProject = async () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: `Project ${projects.length + 1}`,
      createdAt: Date.now(),
      messages: [{ role: 'assistant', text: "What are we forging today?", timestamp: Date.now() }],
      assets: { styleInstructions: "", referenceImages: [] },
      posts: [],
      schemas: []
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    if (isCloudEnabled) await saveProjectToCloud(newProject);
    setMode('social');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const deleteProject = async (e: React.MouseEvent, id: string) => {
     e.stopPropagation();
     if (projects.length <= 1) return; 
     const newProjects = projects.filter(p => p.id !== id);
     setProjects(newProjects);
     if (activeProjectId === id) setActiveProjectId(newProjects[0].id);
     if (isCloudEnabled) await deleteProjectFromCloud(id);
  };

  const updateActiveProject = (updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, ...updates } : p));
  };

  const updateActiveProjectPosts = (updatedPosts: SocialPost[]) => {
      setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, posts: updatedPosts } : p));
  };

  const updateActiveProjectMessages = (newMessages: ChatMessage[]) => {
      setProjects(prev => prev.map(p => {
          if (p.id === activeProjectId) {
              let name = p.name;
              if ((p.name.startsWith("Project ") || p.name === "Initial Forge") && newMessages.length > 1) {
                   const firstUserMsg = newMessages.find(m => m.role === 'user');
                   if (firstUserMsg) name = firstUserMsg.text.slice(0, 24) + (firstUserMsg.text.length > 24 ? '...' : '');
              }
              return { ...p, messages: newMessages, name };
          }
          return p;
      }));
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const input = userInput;
    setUserInput('');
    const updatedHistory = [...chatHistory, { role: 'user', text: input, timestamp: Date.now() } as ChatMessage];
    updateActiveProjectMessages(updatedHistory);
    setIsGenerating(true);
    setIsRateLimited(false);
    try {
        const currentAppMode = (mode === 'settings' || mode === 'dashboard') ? 'social' : mode; 
        const result = await generateFromNaturalLanguage(input, userProfile, currentAppMode, updatedHistory, activeProject.assets);
        const finalHistory = [...updatedHistory, { role: 'assistant', text: result.explanation, timestamp: Date.now() } as ChatMessage];
        updateActiveProjectMessages(finalHistory);
        const rawOutput = result.json_output;
        const potentialPosts = (rawOutput?.posts || (Array.isArray(rawOutput) ? rawOutput : null));
        const hasPosts = Array.isArray(potentialPosts) && potentialPosts.length > 0 && potentialPosts[0].caption;
        if (hasPosts) {
            updateActiveProjectPosts([...activeProject.posts, ...potentialPosts]);
            setMode('social'); 
        } else if (result.category_id === 'clarification') {
            setIsChatOpen(true);
        } else if (result.json_output && mode === 'classic') {
            updateActiveProject({ schemas: [...activeProject.schemas, result.json_output] });
            setMode('classic'); 
        }
    } catch (error: any) {
        if (error.message?.includes('429')) setIsRateLimited(true);
        const errorMessage = error.message || "An unexpected error occurred.";
        const finalHistory = [...updatedHistory, { role: 'assistant', text: `Forging failed: ${errorMessage}`, timestamp: Date.now() } as ChatMessage];
        updateActiveProjectMessages(finalHistory);
    } finally {
        setIsGenerating(false);
        setIsRateLimited(false);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-black text-neutral-900 dark:text-neutral-300 overflow-hidden font-sans relative transition-colors duration-300">
      <div 
        className={`
          fixed inset-y-0 left-0 z-[60] lg:relative lg:flex lg:z-30
          ${isSidebarOpen ? 'w-full sm:w-80 translate-x-0' : 'w-0 -translate-x-full lg:w-16 lg:translate-x-0'} 
          border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-all duration-300 bg-neutral-50 dark:bg-neutral-950
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <div className={`flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
              <div className="w-8 h-8 bg-[#e65100] rounded-lg flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <span className="font-black text-neutral-900 dark:text-white tracking-tighter text-lg leading-tight">Socials by<br/>MCCIA</span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg text-neutral-500 ${!isSidebarOpen && 'mx-auto'}`}>
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
        </div>

        {isSidebarOpen ? (
          <>
            <div className="p-4 shrink-0">
              <button onClick={createNewProject} className="w-full flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-bold py-3 rounded-xl transition-all shadow-sm">
                <Plus size={18} /> New Project
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 space-y-1 py-2 scrollbar-thin">
              {projects.map(proj => (
                <div key={proj.id} onClick={() => { setActiveProjectId(proj.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeProjectId === proj.id ? 'bg-orange-600/10 border border-orange-600/20 text-neutral-900 dark:text-white' : 'hover:bg-neutral-200 dark:hover:bg-neutral-900 border border-transparent text-neutral-500'}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <MessageSquare size={16} className={activeProjectId === proj.id ? 'text-[#e65100]' : 'text-neutral-400 dark:text-neutral-600'} />
                    <span className="text-sm font-medium truncate">{proj.name}</span>
                  </div>
                  {projects.length > 1 && (
                    <button onClick={(e) => deleteProject(e, proj.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"><Trash size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2 shrink-0">
              <button onClick={() => { setMode('dashboard'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'dashboard' ? 'bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-900 hover:text-neutral-800 dark:hover:text-neutral-300'}`}>
                <BarChart3 size={18} /> Dashboard
              </button>
              <button onClick={() => { setShowHelp(true); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-900 hover:text-neutral-800 dark:hover:text-neutral-300">
                <HelpCircle size={18} /> Help & Features
              </button>
              <button onClick={() => { setMode('settings'); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'settings' ? 'bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-900 hover:text-neutral-800 dark:hover:text-neutral-300'}`}>
                <SettingsIcon size={18} /> Settings
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center py-6 gap-6 overflow-hidden">
            <button onClick={createNewProject} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-[#e65100] shadow-sm"><Plus size={20} /></button>
            <button onClick={() => setMode('dashboard')} className="p-3 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"><BarChart3 size={20} /></button>
            <button onClick={() => setShowHelp(true)} className="p-3 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"><HelpCircle size={20} /></button>
            <button onClick={() => setMode('settings')} className="p-3 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"><SettingsIcon size={20} /></button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <div className="h-16 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-black shrink-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"><Menu size={20} /></button>
            )}
            <div className="flex items-center gap-4 min-w-0 max-w-full">
              <h2 className="hidden md:flex text-xs font-black text-neutral-900 dark:text-white uppercase tracking-widest items-center gap-2 truncate shrink-0">
                <Zap size={16} className="text-orange-600 shrink-0" /> <span className="truncate max-w-[150px]">{activeProject.name}</span>
              </h2>
              
              {/* SOCIAL / JSON Pill Toggle - Placed prominently in Nav Bar */}
              <div className="flex bg-neutral-100 dark:bg-[#111111] rounded-full p-1 border border-neutral-200 dark:border-neutral-800 shadow-sm shrink-0">
                <button 
                  onClick={() => setMode('social')} 
                  className={`flex items-center gap-2 px-4 sm:px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${mode === 'social' ? 'bg-[#e65100] text-white shadow-lg scale-105' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'}`}
                >
                  <Calendar size={14} className="shrink-0" />
                  <span>SOCIAL</span>
                </button>
                <button 
                  onClick={() => setMode('classic')} 
                  className={`flex items-center gap-2 px-4 sm:px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${mode === 'classic' ? 'bg-[#e65100] text-white shadow-lg scale-105' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'}`}
                >
                  <Terminal size={14} className="shrink-0" />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-colors">
                 {isSyncing ? (
                     <div className="flex items-center gap-2 animate-pulse">
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                         <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Syncing</span>
                     </div>
                 ) : isCloudEnabled ? (
                     <div className="flex items-center gap-2">
                         <Cloud size={14} className="text-emerald-500" />
                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                     </div>
                 ) : (
                     <div className="flex items-center gap-2 opacity-50">
                         <CloudOff size={14} className="text-neutral-400 dark:text-neutral-600" />
                         <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">Local</span>
                     </div>
                 )}
             </div>
             
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 transition-all shadow-sm"
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
             >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>

             <button 
                onClick={() => setIsChatOpen(!isChatOpen)} 
                className={`p-2 rounded-lg border transition-all ${isChatOpen ? 'bg-[#e65100] border-[#e65100] text-white shadow-lg shadow-orange-600/20' : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400'}`}
                title="Toggle Assistant"
             >
                <MessageSquare size={18} />
             </button>

             <button 
                onClick={() => setShowProjectSettings(!showProjectSettings)} 
                className="flex items-center gap-2 px-2 lg:px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-[10px] font-black text-neutral-900 dark:text-neutral-300 uppercase tracking-widest transition-all"
             >
                <Settings2 size={14} /> 
                <span className="hidden sm:inline">Project DNA</span>
             </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden relative bg-white dark:bg-black transition-colors duration-300">
            {mode === 'social' && <SocialWorkspace posts={activeProject.posts} onUpdatePosts={updateActiveProjectPosts} userProfile={userProfile} projectAssets={activeProject.assets} />}
            {mode === 'classic' && <ClassicWorkspace initialJson={activeProject.schemas[activeProject.schemas.length - 1]} userProfile={userProfile} />}
            {mode === 'settings' && <Settings profile={userProfile} onSave={handleSaveProfile} />}
            {mode === 'dashboard' && <Dashboard />}
          </div>

          <div className={`${isChatOpen ? 'w-full md:w-[420px]' : 'w-0'} h-full bg-neutral-50 dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-30 ${window.innerWidth < 768 && isChatOpen ? 'fixed inset-y-0 right-0 z-[100]' : ''}`}>
            <div className="h-20 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-6 bg-white dark:bg-neutral-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e65100] rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/10"><Bot className="text-white" size={24} /></div>
                <div><h2 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">Assistant</h2>
                  <div className="flex items-center gap-1.5 mt-0.5"><div className={`w-1.5 h-1.5 rounded-full ${isRateLimited ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} /><span className={`text-[10px] font-bold uppercase tracking-tighter ${isRateLimited ? 'text-amber-500' : 'text-emerald-500'}`}>{isRateLimited ? 'Retrying' : 'Ready'}</span></div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-black/5 dark:bg-black/40">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-[1.5rem] p-4 text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#e65100] text-white font-bold shadow-orange-600/10' : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800'}`}><FormattedText text={msg.text} /></div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
              <div className="flex flex-col gap-3">
                {isRateLimited && <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-1"><Timer size={14} className="text-amber-500 animate-pulse" /><span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Model busy - Orchestrating queue...</span></div>}
                <div className="relative group">
                  <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder={mode === 'social' ? "Plan a 5-day campaign..." : "Forge a specific schema..."} className="w-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl py-4 pl-4 pr-12 text-sm text-neutral-900 dark:text-white focus:border-orange-600 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-700 min-h-[60px] max-h-[150px] resize-none scrollbar-thin" />
                  <div className="absolute right-4 bottom-4">{isGenerating ? <Loader2 className="animate-spin text-orange-600" size={18} /> : <Sparkles className="text-neutral-300 dark:text-neutral-700" size={18} />}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="text-[8px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">Protocol</span><span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter">Sanitized Input</span></div>
                  <button onClick={handleSendMessage} disabled={isGenerating || !userInput.trim()} className="bg-[#e65100] hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 active:scale-95 flex items-center gap-2"><Send size={14} /> Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showProjectSettings && (
           <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] w-full max-w-xl p-6 lg:p-8 relative shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto transition-colors duration-300">
                 <button onClick={() => setShowProjectSettings(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"><X size={20} /></button>
                 <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-2 uppercase tracking-tight">Project DNA</h3>
                 <p className="text-neutral-500 text-xs lg:text-sm mb-6 lg:mb-8 font-medium">Configure assets and style instructions for this specific project.</p>
                 <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Style Instructions</label>
                        <textarea value={activeProject.assets?.styleInstructions || ""} onChange={(e) => updateActiveProject({ assets: { ...activeProject.assets!, styleInstructions: e.target.value } })} className="w-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 text-sm text-neutral-900 dark:text-white focus:border-orange-600 outline-none min-h-[120px] resize-none" />
                    </div>
                    <button onClick={() => setShowProjectSettings(false)} className="w-full py-4 bg-[#e65100] hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-orange-600/10">Apply Project DNA</button>
                 </div>
              </div>
           </div>
        )}
        <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />
      </div>
    </div>
  );
}

export default App;
