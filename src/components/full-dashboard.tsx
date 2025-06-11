'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  MessageSquare, 
  Activity, 
  Settings,
  Bell,
  Users,
  X,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/hybrid-auth-context';
import VersionFooter from '@/components/version-footer';
import NavigationSidebar from '@/components/navigation-sidebar';
import TimelineView from '@/components/timeline-view';
import ThreadView from '@/components/thread-view';
import SystemMetricsView from '@/components/system-metrics-view';
import TerminalView from '@/components/terminal-view';

export type ViewType = 'timeline' | 'terminal' | 'metrics' | 'settings' | null;

export interface ThreadData {
  id: string
  rootPost: any
  posts: any[]
  author: {
    handle: string
    displayName: string
    avatar?: string
  }
}

const FullDashboard = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('timeline');
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(timeTimer);
    };
  }, []);

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
  };

  const handleOpenThread = (post: any) => {
    const threadId = `thread-${post.uri}`;
    
    // Check if thread already exists
    const existingThread = threads.find(t => t.id === threadId);
    if (existingThread) {
      setActiveThread(threadId);
      return;
    }

    // Create new thread
    const newThread: ThreadData = {
      id: threadId,
      rootPost: post,
      posts: [post], // Start with just the root post
      author: {
        handle: post.author.handle,
        displayName: post.author.displayName,
        avatar: post.author.avatar
      }
    };

    setThreads(prev => [...prev, newThread]);
    setActiveThread(threadId);
  };

  const handleCloseThread = (threadId: string) => {
    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (activeThread === threadId) {
      setActiveThread(threads.length > 1 ? threads[0].id : null);
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'timeline':
        return <TimelineView onOpenThread={handleOpenThread} />;
      case 'terminal':
        return <TerminalView />;
      case 'metrics':
        return <SystemMetricsView />;
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
            <div className="text-gray-300">Settings panel coming soon...</div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select an option from the sidebar</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">AT Protocol Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300" suppressHydrationWarning>
              {mounted ? currentTime : '--:--:--'}
            </div>
            <button className="p-2 hover:bg-gray-700/50 rounded relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Navigation */}
        <NavigationSidebar 
          activeView={activeView} 
          onViewChange={handleViewChange}
        />

        {/* Main Content Area */}
        <main className="flex-1 border-r border-gray-700/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView || 'empty'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Right Sidebar - Threads */}
        <AnimatePresence>
          {threads.length > 0 && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/30 backdrop-blur-sm border-l border-gray-700/30 overflow-hidden"
            >
              <ThreadView
                threads={threads}
                activeThread={activeThread}
                onThreadSelect={setActiveThread}
                onCloseThread={handleCloseThread}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Version Footer */}
      <VersionFooter />
    </div>
  );
};

export default FullDashboard;
