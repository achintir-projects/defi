'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Gift, 
  Eye, 
  TrendingUp,
  Shield,
  Activity,
  Coins,
  Timer
} from 'lucide-react'

interface DistributionEvent {
  id: string
  walletAddress: string
  deviceType: 'desktop' | 'mobile'
  timestamp: Date
  tokens: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processingTime?: number
}

interface TeamStats {
  totalConnections: number
  activeWindow: boolean
  nextWindowStart: Date
  averageProcessingTime: number
  successRate: number
  tokensDistributed: {
    'USDT-ERC20': number
    'USDT-TRC20': number
    'POL': number
  }
}

export default function SmartDistributionSystem() {
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalConnections: 0,
    activeWindow: false,
    nextWindowStart: new Date(),
    averageProcessingTime: 0,
    successRate: 0,
    tokensDistributed: {
      'USDT-ERC20': 0,
      'USDT-TRC20': 0,
      'POL': 0
    }
  })

  const [recentDistributions, setRecentDistributions] = useState<DistributionEvent[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [currentQueue, setCurrentQueue] = useState(0)

  // Simulate real-time monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      updateTeamStats()
      addMockDistribution()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const updateTeamStats = () => {
    setTeamStats(prev => ({
      ...prev,
      totalConnections: prev.totalConnections + Math.floor(Math.random() * 3),
      activeWindow: Math.random() > 0.3,
      averageProcessingTime: 15 + Math.floor(Math.random() * 10),
      successRate: 95 + Math.floor(Math.random() * 5),
      tokensDistributed: {
        'USDT-ERC20': prev.tokensDistributed['USDT-ERC20'] + Math.floor(Math.random() * 1000),
        'USDT-TRC20': prev.tokensDistributed['USDT-TRC20'] + Math.floor(Math.random() * 1000),
        'POL': prev.tokensDistributed['POL'] + Math.floor(Math.random() * 10)
      }
    }))

    setCurrentQueue(prev => Math.max(0, prev + Math.floor(Math.random() * 5) - 2))
  }

  const addMockDistribution = () => {
    const newEvent: DistributionEvent = {
      id: Math.random().toString(36).substr(2, 9),
      walletAddress: `0x${Math.random().toString(36).substr(2, 8)}...${Math.random().toString(36).substr(2, 4)}`,
      deviceType: Math.random() > 0.5 ? 'desktop' : 'mobile',
      timestamp: new Date(),
      tokens: ['USDT-ERC20', 'USDT-TRC20', 'POL'],
      status: Math.random() > 0.1 ? 'completed' : 'processing',
      processingTime: Math.floor(Math.random() * 30) + 10
    }

    setRecentDistributions(prev => [newEvent, ...prev.slice(0, 9)])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Team Monitoring Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Team Distribution Monitor
          </CardTitle>
          <CardDescription>
            Real-time monitoring of automatic token distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Status */}
            <div className={`p-4 rounded-lg ${
              teamStats.activeWindow ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <Activity className={`h-4 w-4 ${
                  teamStats.activeWindow ? 'text-green-600' : 'text-gray-600'
                }`} />
                <span className="font-medium">Team Status</span>
              </div>
              <div className="mt-2">
                <Badge variant={teamStats.activeWindow ? "default" : "secondary"}>
                  {teamStats.activeWindow ? 'Active' : 'Standby'}
                </Badge>
              </div>
            </div>

            {/* Queue Size */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Current Queue</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-900">
                {currentQueue}
              </div>
            </div>

            {/* Processing Time */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Avg. Processing</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-purple-900">
                {formatDuration(teamStats.averageProcessingTime)}
              </div>
            </div>

            {/* Success Rate */}
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Success Rate</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-900">
                {teamStats.successRate}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Distribution Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Token Distribution Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">USDT (ERC-20)</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{teamStats.tokensDistributed['USDT-ERC20'].toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total distributed</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">USDT (TRC-20)</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{teamStats.tokensDistributed['USDT-TRC20'].toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total distributed</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">POL</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{teamStats.tokensDistributed['POL'].toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total distributed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Team Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className={teamStats.activeWindow ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {teamStats.activeWindow ? 
                    "Team is currently active and monitoring connections." :
                    "Team is on standby. Next activation window starts soon."
                  }
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Connections Today</span>
                  <span className="font-bold">{teamStats.totalConnections}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Next Window Start</span>
                  <span className="font-bold">{formatTime(teamStats.nextWindowStart)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Monitoring Status</span>
                  <Badge variant={isMonitoring ? "default" : "secondary"}>
                    {isMonitoring ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <Button 
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="w-full"
                variant={isMonitoring ? "destructive" : "default"}
              >
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Distribution Activity
          </CardTitle>
          <CardDescription>
            Live feed of token distribution events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentDistributions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent activity. Waiting for new connections...
              </div>
            ) : (
              recentDistributions.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${
                      event.deviceType === 'mobile' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {event.deviceType === 'mobile' ? 
                        <div className="w-4 h-4 bg-blue-500 rounded-sm"></div> :
                        <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                      }
                    </div>
                    <div>
                      <div className="font-medium text-sm">{event.walletAddress}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(event.timestamp)} • {event.deviceType}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                    {event.processingTime && (
                      <span className="text-xs text-gray-500">
                        {event.processingTime}s
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Automated System:</strong> Our team monitors new connections 24/7. When users connect to POL Sandbox, 
          the system automatically detects them and queues token distribution. Average processing time is under 30 seconds.
        </AlertDescription>
      </Alert>
    </div>
  )
}