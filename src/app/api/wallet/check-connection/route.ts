import { NextRequest, NextResponse } from 'next/server'

interface ConnectionCheckRequest {
  type: 'mobile' | 'browser'
  walletId: string
  timestamp: number
}

// In-memory storage for connection status
// In production, this would be a database
const connectionStatus = new Map<string, {
  connected: boolean
  address?: string
  networkAdded?: boolean
  timestamp: number
}>()

export async function POST(request: NextRequest) {
  try {
    const body: ConnectionCheckRequest = await request.json()
    const { type, walletId, timestamp } = body

    // Check if we have a connection record for this wallet
    const connectionKey = `${walletId}-${timestamp}`
    const status = connectionStatus.get(connectionKey)

    if (status && Date.now() - status.timestamp < 60000) { // Valid for 1 minute
      return NextResponse.json({
        connected: status.connected,
        address: status.address,
        networkAdded: status.networkAdded,
        timestamp: status.timestamp
      })
    }

    // Simulate mobile wallet connection detection
    // In a real implementation, this would check deep link callbacks or WebSocket connections
    if (type === 'mobile') {
      // Simulate random connection for demo purposes
      const isConnected = Math.random() > 0.7 // 30% chance of connection
      
      if (isConnected) {
        const mockAddress = `0x${Math.random().toString(36).substr(2, 8)}${Math.random().toString(36).substr(2, 8)}`
        
        connectionStatus.set(connectionKey, {
          connected: true,
          address: mockAddress,
          networkAdded: true,
          timestamp: Date.now()
        })
        
        return NextResponse.json({
          connected: true,
          address: mockAddress,
          networkAdded: true,
          timestamp: Date.now()
        })
      }
    }

    return NextResponse.json({
      connected: false,
      address: null,
      networkAdded: false,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Connection check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Endpoint for mobile wallets to report successful connection
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletId, address, networkAdded, timestamp } = body

    const connectionKey = `${walletId}-${timestamp}`
    
    connectionStatus.set(connectionKey, {
      connected: true,
      address,
      networkAdded: networkAdded || true,
      timestamp: Date.now()
    })

    return NextResponse.json({
      success: true,
      message: 'Connection status updated'
    })

  } catch (error) {
    console.error('Connection update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}