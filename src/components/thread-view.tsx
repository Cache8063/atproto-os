'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { ThreadData } from './full-dashboard';

interface ThreadViewProps {
  threads: ThreadData[]
  activeThread: string | null
  onThreadSelect: (threadId: string) => void
  onCloseThread: (threadId: string) => void
}

export default function ThreadView({ 
  threads, 
  activeThread, 
  onThreadSelect, 
  onCloseThread 
}: ThreadViewProps) {
  const currentThread = threads.find(t => t.id === activeThread);

  return (
    <div className="h-full flex flex-col">
      {/* Thread Tabs */}
      {threads.length > 1 && (
        <div className="p-2 border-b border-gray-700/30 flex space-x-1 overflow-x-auto">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onThreadSelect(thread.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-sm whitespace-nowrap ${
                activeThread === thread.id 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {thread.author.avatar ? (
                <img
                  src={thread.author.avatar}
                  alt={thread.author.displayName}
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-xs">
                    {thread.author.displayName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <span>{thread.author.displayName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseThread(thread.id);
                }}
                className="hover:bg-red-500/20 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Thread Content */}
      {currentThread ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-700/30">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Thread</span>
              </h3>
              <button
                onClick={() => onCloseThread(currentThread.id)}
                className="p-1 hover:bg-gray-700/50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {currentThread.posts.map((post, index) => (
                <motion.div
                  key={post.uri || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg ${
                    index === 0 ? 'bg-blue-600/10 border border-blue-500/20' : 'bg-gray-800/50'
                  }`}
                >
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {post.author?.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {post.author?.displayName?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-white">
                          {post.author?.displayName || 'Unknown'}
                        </span>
                        <span className="text-gray-400">
                          @{post.author?.handle || 'unknown'}
                        </span>
                        {index === 0 && (
                          <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">
                            Root
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-1 text-gray-200 text-sm break-words">
                        {post.text || 'No content'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Reply Form */}
            <div className="mt-4 pt-4 border-t border-gray-700/30">
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Reply to thread..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No thread selected</p>
          </div>
        </div>
      )}
    </div>
  );
}
