// src/types/index.ts
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export interface WidgetProps {
  title: string
  icon: LucideIcon
  children: ReactNode
  className?: string
}

export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    speed: number
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
  uptime: number
  processes: number
}

export interface Alert {
  id: number
  type: 'info' | 'warning' | 'error'
  message: string
  time: string
  timestamp: Date
}