
import React from 'react';
import { SocialPost, PostStatus } from '../types';
import { ChevronLeft, ChevronRight, Instagram, Facebook, Linkedin, Twitter, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface CalendarViewProps {
  posts: SocialPost[];
  onPostClick: (post: SocialPost) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ posts, onPostClick }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getPostsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter(p => p.scheduledDate === dateStr);
  };

  const getStatusColor = (status: PostStatus) => {
    switch (status) {
      case 'draft': return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-neutral-800/50';
      case 'awaiting_approval': return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-500/10 animate-pulse';
      case 'scheduled': return 'border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
      case 'posted': return 'bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 opacity-75';
      case 'failed': return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-500/10';
      default: return 'bg-neutral-100 dark:bg-neutral-800';
    }
  };

  const getPlatformIcon = (p: string) => {
    switch(p) {
      case 'instagram': return <Instagram size={10} />;
      case 'facebook': return <Facebook size={10} />;
      case 'linkedin': return <Linkedin size={10} />;
      case 'twitter': return <Twitter size={10} />;
      default: return null;
    }
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-black">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400"><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentMonth(new Date())} className="text-sm font-medium text-orange-600 dark:text-orange-500 hover:text-orange-500 dark:hover:text-orange-400">Today</button>
          <button onClick={nextMonth} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md text-neutral-500 dark:text-neutral-400"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-center text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-neutral-200 dark:bg-neutral-800 gap-[1px] border-neutral-200 dark:border-neutral-800">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-neutral-50 dark:bg-black/40 min-h-[120px]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayPosts = getPostsForDay(day);
          const isToday = day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();

          return (
            <div key={day} className={`bg-white dark:bg-black p-2 min-h-[120px] border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors relative group ${isToday ? 'bg-orange-50/30 dark:bg-neutral-900/50' : ''}`}>
              <span className={`text-xs font-bold mb-2 block ${isToday ? 'text-orange-600 dark:text-orange-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
                {day}
              </span>
              
              <div className="space-y-1.5">
                {dayPosts.map(post => (
                  <button
                    key={post.id}
                    onClick={() => onPostClick(post)}
                    className={`w-full text-left p-1.5 rounded text-[10px] shadow-sm hover:brightness-110 dark:hover:brightness-110 transition-all flex flex-col gap-1 ${getStatusColor(post.status)}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1 text-neutral-500 dark:text-neutral-400">
                        {post.platforms.map(p => <span key={p}>{getPlatformIcon(p)}</span>)}
                      </div>
                      {post.status === 'awaiting_approval' && <AlertCircle size={10} className="text-orange-500" />}
                      {post.status === 'scheduled' && <Clock size={10} className="text-emerald-500" />}
                      {post.status === 'posted' && <CheckCircle2 size={10} className="text-emerald-500" />}
                    </div>
                    <span className="truncate text-neutral-900 dark:text-white font-bold">{post.title || "Untitled Post"}</span>
                    <span className="text-neutral-500 dark:text-neutral-500 font-medium">{post.scheduledTime}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
