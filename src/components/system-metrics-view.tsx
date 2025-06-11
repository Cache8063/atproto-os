'use client'
import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

interface SystemMetrics {
  cpu: { usage: number; cores: number; model: string }
  memory: { percentage: number; usedGB: number; totalGB: number }
  uptime: { formatted: string; days: number; hours: number; minutes: number }
  system: { platform: string; architecture: string; hostname: string }
}

export default function SystemMetricsView() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">System Metrics</h2>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">CPU Usage</span>
                  <span className={`font-bold ${
                    metrics.cpu.usage > 80 ? 'text-red-400' : 
                    metrics.cpu.usage > 60 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {Math.round(metrics.cpu.usage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.cpu.usage > 80 ? 'bg-red-400' : 
                      metrics.cpu.usage > 60 ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${Math.min(metrics.cpu.usage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Memory</span>
                  <span className={`font-bold ${
                    metrics.memory.percentage > 80 ? 'text-red-400' : 
                    metrics.memory.percentage > 60 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {metrics.memory.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.memory.percentage > 80 ? 'bg-red-400' : 
                      metrics.memory.percentage > 60 ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${Math.min(metrics.memory.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics.memory.usedGB}GB / {metrics.memory.totalGB}GB
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Hostname:</span>
                <span className="text-white">{metrics.system.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform:</span>
                <span className="text-white">{metrics.system.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Architecture:</span>
                <span className="text-white">{metrics.system.architecture}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CPU Cores:</span>
                <span className="text-white">{metrics.cpu.cores}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime:</span>
                <span className="text-white">{metrics.uptime.formatted}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
