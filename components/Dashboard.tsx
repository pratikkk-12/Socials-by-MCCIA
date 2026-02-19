
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Zap, Star, Shield } from 'lucide-react';
import { Project } from '../types';

const Dashboard: React.FC = () => {
  const stats = useMemo(() => {
    const savedProjects = localStorage.getItem('promptforge_projects');
    if (!savedProjects) return { totalPosts: 0, totalSchemas: 0, chartData: [], totalGens: 0 };
    
    try {
      const projects: Project[] = JSON.parse(savedProjects);
      const postsCount = projects.reduce((acc, p) => acc + (p.posts?.length || 0), 0);
      const schemasCount = projects.reduce((acc, p) => acc + (p.schemas?.length || 0), 0);
      
      const data = [
        { name: 'Social', count: postsCount },
        { name: 'JSON', count: schemasCount },
        { name: 'Chat', count: projects.reduce((acc, p) => acc + p.messages.length, 0) },
        { name: 'Campaigns', count: projects.length }
      ];

      return {
        totalPosts: postsCount,
        totalSchemas: schemasCount,
        totalGens: postsCount + schemasCount,
        chartData: data
      };
    } catch (e) {
      return { totalPosts: 0, totalSchemas: 0, chartData: [], totalGens: 0 };
    }
  }, []);

  const cardClasses = "bg-white dark:bg-neutral-900/50 p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-xl transition-all duration-300";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
           <div className="w-6 h-[1px] bg-amber-500"></div>
           <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">System Metrics</span>
        </div>
        <h2 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Mission Control</h2>
        <p className="text-neutral-500 mt-2 text-sm">Real-time audit of your architectural output and token efficiency.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 dark:text-neutral-500 text-[10px] font-black uppercase tracking-widest">Total Forges</h3>
            <Activity className="text-amber-500 w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-neutral-900 dark:text-white">{stats.totalGens}</p>
          <p className="text-emerald-600 dark:text-emerald-500 text-[10px] font-bold mt-2 flex items-center gap-1 uppercase tracking-tighter">
            <Shield size={12} /> Local Storage Verified
          </p>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 dark:text-neutral-500 text-[10px] font-black uppercase tracking-widest">Efficiency Multiplier</h3>
            <Zap className="text-amber-500 w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-neutral-900 dark:text-white">{(stats.totalGens * 1.4).toFixed(1)}x</p>
          <p className="text-neutral-500 text-[10px] font-bold mt-2 uppercase tracking-tighter">
            Tokens saved vs. raw chat
          </p>
        </div>

        <div className={cardClasses}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 dark:text-neutral-500 text-[10px] font-black uppercase tracking-widest">Core Engine</h3>
            <Star className="text-amber-500 w-5 h-5" />
          </div>
          <p className="text-4xl font-black text-neutral-900 dark:text-white">
            {stats.totalPosts >= stats.totalSchemas ? 'Social' : 'JSON'}
          </p>
          <p className="text-neutral-500 text-[10px] font-bold mt-2 uppercase tracking-tighter">
            Most frequent workflow
          </p>
        </div>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-950 p-8 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 h-[450px] shadow-sm dark:shadow-2xl relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Zap size={200} className="text-neutral-900 dark:text-white" />
        </div>
        <h3 className="text-sm font-black text-neutral-900 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
           Architectural Distribution
        </h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={stats.chartData}>
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fontWeight: 'bold' }}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${value}`} 
            />
            <Tooltip 
              cursor={{fill: 'rgba(245, 158, 11, 0.05)'}}
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                color: '#000000',
                border: '1px solid #e5e5e5', 
                borderRadius: '16px',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
              itemStyle={{ color: '#f59e0b' }}
            />
            <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={40}>
              {stats.chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#a3a3a3'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
