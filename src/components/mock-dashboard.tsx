'use client'
import React, { useState } from 'react';
import { LogIn, X, Eye, EyeOff, Shield } from 'lucide-react';

const MockATProtocolDashboard = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const handleLogin = () => {
    setError('');
    
    // Simple hardcoded check
    if ((identifier === 'demo' && password === 'demo') || 
        (identifier === 'test' && password === 'test')) {
      setUser({
        name: identifier === 'demo' ? 'Demo User' : 'Test User',
        handle: identifier === 'demo' ? 'demo.bsky.social' : 'test.bsky.social'
      });
      setShowLogin(false);
    } else {
      setError('Try: demo/demo or test/test');
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl border border-gray-600 p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-6">Login to AT Protocol</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="demo"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/30 border border-red-700 rounded p-2">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </button>

            <div className="mt-4 p-3 bg-gray-900/50 rounded text-xs text-gray-400">
              <p className="font-semibold text-white mb-2">Test Accounts:</p>
              <p><strong>demo</strong> / <strong>demo</strong></p>
              <p><strong>test</strong> / <strong>test</strong></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            AT Protocol Dashboard <span className="text-xs bg-green-600 px-2 py-1 rounded text-black">CONNECTED</span>
          </h1>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">@{user?.handle}</span>
            <button
              onClick={() => {setShowLogin(true); setUser(null);}}
              className="p-2 hover:bg-gray-700 rounded text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold">Welcome {user?.name}!</h3>
            </div>
            <p className="text-gray-300">You are successfully logged in to the AT Protocol Dashboard demo.</p>
            <p className="text-gray-400 text-sm mt-2">Handle: @{user?.handle}</p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Demo Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Authentication</span>
                <span className="text-green-400">✅ Working</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Dashboard</span>
                <span className="text-green-400">✅ Loading</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">AT Protocol</span>
                <span className="text-yellow-400">🧪 Demo Mode</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MockATProtocolDashboard;
