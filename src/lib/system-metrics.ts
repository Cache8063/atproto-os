// src/lib/system-metrics.ts
import si from 'systeminformation'

export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    speed: number
    temperature?: number
  }
  memory: {
    used: number
    total: number
    percentage: number
    available: number
  }
  disk: {
    used: number
    total: number
    percentage: number
    available: number
  }
  network: {
    bytesReceived: number
    bytesSent: number
    packetsReceived: number
    packetsSent: number
  }
  uptime: number
  processes: number
  loadAverage: number[]
}

export interface ProcessInfo {
  pid: number
  name: string
  cpu: number
  memory: number
  state: string
}

class SystemMetricsService {
  private metricsCache: SystemMetrics | null = null
  private lastUpdate = 0
  private cacheDuration = 5000 // 5 seconds

  async getCurrentMetrics(): Promise<SystemMetrics> {
    const now = Date.now()
    
    // Return cached data if recent
    if (this.metricsCache && (now - this.lastUpdate) < this.cacheDuration) {
      return this.metricsCache
    }

    try {
      // Fetch all metrics in parallel for better performance
      const [
        cpuData,
        memData,
        diskData,
        networkData,
        osInfo,
        processData,
        loadData
      ] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.osInfo(),
        si.processes(),
        si.currentLoad()
      ])

      // Calculate CPU usage
      const cpuUsage = loadData.currentLoad || 0

      // Get primary disk (usually first one)
      const primaryDisk = diskData[0] || {
        used: 0,
        size: 1,
        available: 1
      }

      // Get primary network interface stats
      const primaryNetwork = networkData[0] || {
        rx_bytes: 0,
        tx_bytes: 0,
        rx_packets: 0,
        tx_packets: 0
      }

      const metrics: SystemMetrics = {
        cpu: {
          usage: Math.round(cpuUsage * 100) / 100,
          cores: cpuData.cores || 1,
          speed: cpuData.speed || 0,
          temperature: loadData.cpuTemperature || undefined
        },
        memory: {
          used: memData.used,
          total: memData.total,
          percentage: Math.round((memData.used / memData.total) * 100 * 100) / 100,
          available: memData.available
        },
        disk: {
          used: primaryDisk.used,
          total: primaryDisk.size,
          percentage: Math.round((primaryDisk.used / primaryDisk.size) * 100 * 100) / 100,
          available: primaryDisk.available
        },
        network: {
          bytesReceived: primaryNetwork.rx_bytes || 0,
          bytesSent: primaryNetwork.tx_bytes || 0,
          packetsReceived: primaryNetwork.rx_packets || 0,
          packetsSent: primaryNetwork.tx_packets || 0
        },
        uptime: osInfo.uptime || 0,
        processes: processData.all?.length || 0,
        loadAverage: loadData.avgLoad ? [
          loadData.avgLoad,
          loadData.avgLoad,
          loadData.avgLoad
        ] : [0, 0, 0]
      }

      this.metricsCache = metrics
      this.lastUpdate = now

      return metrics
    } catch (error) {
      console.error('Error fetching system metrics:', error)
      
      // Return fallback/mock data if real metrics fail
      return {
        cpu: { usage: 0, cores: 1, speed: 0 },
        memory: { used: 0, total: 1, percentage: 0, available: 1 },
        disk: { used: 0, total: 1, percentage: 0, available: 1 },
        network: { bytesReceived: 0, bytesSent: 0, packetsReceived: 0, packetsSent: 0 },
        uptime: 0,
        processes: 0,
        loadAverage: [0, 0, 0]
      }
    }
  }

  async getTopProcesses(limit = 10): Promise<ProcessInfo[]> {
    try {
      const processData = await si.processes()
      
      return (processData.list || [])
        .filter(proc => proc.cpu > 0) // Only processes using CPU
        .sort((a, b) => (b.cpu || 0) - (a.cpu || 0)) // Sort by CPU usage
        .slice(0, limit)
        .map(proc => ({
          pid: proc.pid || 0,
          name: proc.name || 'Unknown',
          cpu: Math.round((proc.cpu || 0) * 100) / 100,
          memory: Math.round((proc.memory || 0) * 100) / 100,
          state: proc.state || 'unknown'
        }))
    } catch (error) {
      console.error('Error fetching process data:', error)
      return []
    }
  }

  async getDiskUsage(): Promise<Array<{
    filesystem: string
    size: number
    used: number
    available: number
    percentage: number
    mount: string
  }>> {
    try {
      const diskData = await si.fsSize()
      
      return diskData.map(disk => ({
        filesystem: disk.fs,
        size: disk.size,
        used: disk.used,
        available: disk.available,
        percentage: Math.round((disk.used / disk.size) * 100 * 100) / 100,
        mount: disk.mount
      }))
    } catch (error) {
      console.error('Error fetching disk data:', error)
      return []
    }
  }

  async getNetworkInterfaces(): Promise<Array<{
    interface: string
    ip4: string
    ip6: string
    mac: string
    speed: number
    duplex: string
    mtu: number
    state: string
  }>> {
    try {
      const networkData = await si.networkInterfaces()
      
      return networkData.map(iface => ({
        interface: iface.iface,
        ip4: iface.ip4 || '',
        ip6: iface.ip6 || '',
        mac: iface.mac || '',
        speed: iface.speed || 0,
        duplex: iface.duplex || '',
        mtu: iface.mtu || 0,
        state: iface.operstate || 'unknown'
      }))
    } catch (error) {
      console.error('Error fetching network interfaces:', error)
      return []
    }
  }

  // Format bytes to human readable format
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  // Format uptime to human readable format
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }
}

// Singleton instance
export const systemMetrics = new SystemMetricsService()

// Hook for React components
import { useState, useEffect } from 'react'

export function useSystemMetrics(refreshInterval = 5000) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const fetchMetrics = async () => {
      try {
        setError(null)
        const data = await systemMetrics.getCurrentMetrics()
        setMetrics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
        console.error('Metrics fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    // Fetch immediately
    fetchMetrics()

    // Set up interval for regular updates
    intervalId = setInterval(fetchMetrics, refreshInterval)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [refreshInterval])

  return { metrics, loading, error, refetch: () => systemMetrics.getCurrentMetrics() }
}