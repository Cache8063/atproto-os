export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import os from 'os'

export async function GET() {
  try {
    // Get system info
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsagePercent = Math.round((usedMemory / totalMemory) * 100)

    // Get CPU info
    const cpus = os.cpus()
    const numCPUs = cpus.length

    // Calculate CPU usage (this is a simplified calculation)
    let totalIdle = 0
    let totalTick = 0
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type]
      }
      totalIdle += cpu.times.idle
    })
    
    const idle = totalIdle / numCPUs
    const total = totalTick / numCPUs
    const usage = 100 - ~~(100 * idle / total)

    // Get uptime
    const uptimeSeconds = os.uptime()
    const uptimeDays = Math.floor(uptimeSeconds / 86400)
    const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600)
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60)
    
    let uptimeString = ''
    if (uptimeDays > 0) {
      uptimeString = `${uptimeDays}d ${uptimeHours}h`
    } else if (uptimeHours > 0) {
      uptimeString = `${uptimeHours}h ${uptimeMinutes}m`
    } else {
      uptimeString = `${uptimeMinutes}m`
    }

    // Get load average (Unix/Linux only)
    const loadAvg = os.loadavg()

    // Platform info
    const platform = os.platform()
    const architecture = os.arch()
    const hostname = os.hostname()

    return NextResponse.json({
      cpu: {
        usage: Math.max(0, Math.min(100, usage)), // Clamp between 0-100
        cores: numCPUs,
        model: cpus[0]?.model || 'Unknown',
        loadAverage: loadAvg
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        percentage: memoryUsagePercent,
        totalGB: Math.round(totalMemory / 1024 / 1024 / 1024 * 100) / 100,
        usedGB: Math.round(usedMemory / 1024 / 1024 / 1024 * 100) / 100
      },
      uptime: {
        seconds: uptimeSeconds,
        formatted: uptimeString,
        days: uptimeDays,
        hours: uptimeHours,
        minutes: uptimeMinutes
      },
      system: {
        platform,
        architecture,
        hostname,
        nodeVersion: process.version
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting system metrics:', error)
    return NextResponse.json(
      { error: 'Failed to get system metrics' },
      { status: 500 }
    )
  }
}