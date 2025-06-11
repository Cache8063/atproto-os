'use client'
import React, { useState } from 'react';
import { Terminal, Maximize } from 'lucide-react';

export default function TerminalView() {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([
    'user@atproto-dashboard:~$ ps aux | grep pds',
    'pds    1234  0.1  2.3  /usr/bin/pds',
    'user@atproto-dashboard:~$ systemctl status atproto',
    '● atproto.service - AT Protocol Service',
    '   Active: active (running) since Mon 2025-06-10 09:00:00 UTC',
    'user@atproto-dashboard:~$ '
  ]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      setHistory(prev => [...prev, `user@atproto-dashboard:~$ ${command}`, 'Command executed...', 'user@atproto-dashboard:~$ ']);
      setCommand('');
    }
  };

  return (
    <div className="h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Terminal className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Terminal</h2>
        </div>
        <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
          <Maximize className="w-4 h-4" />
          <span>Fullscreen</span>
        </button>
      </div>

      <div className="bg-black rounded-xl p-4 font-mono text-sm h-96 overflow-y-auto">
        <div className="space-y-1">
          {history.map((line, index) => (
            <div key={index} className={line.startsWith('user@') ? 'text-green-400' : 'text-gray-300'}>
              {line}
            </div>
          ))}
        </div>
        
        <form onSubmit={handleCommand} className="flex items-center mt-2">
          <span className="text-green-400">user@atproto-dashboard:~$ </span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none ml-1"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
