'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  MessageSquare, 
  Activity, 
  Settings,
  Users
} from 'lucide-react';
import { ViewType } from './full-dashboard';

interface NavigationItem {
  id: ViewType
  label: string
  icon: React.ElementType
  badge?: string
}

const navigationItems: NavigationItem[] = [
  { id: 'timeline', label: 'Timeline', icon: MessageSquare },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'metrics', label: 'System', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings }
];

interface NavigationSidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

export default function NavigationSidebar({ activeView, onViewChange }: NavigationSidebarProps) {
  return (
    <aside className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/30 p-4">
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                  : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700/30">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Quick Actions</div>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 p-2 rounded text-sm text-gray-400 hover:text-white hover:bg-gray-700/50">
            <Users className="w-4 h-4" />
            <span>User Directory</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
