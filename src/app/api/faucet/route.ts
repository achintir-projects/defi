import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface FaucetRequest {
  address: string
  network: string
  tokens: string[]
}

interface DistributionRecord {
  id: string
  address: string
  network: string
  tokens: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  timestamp: Date
  processingTime?: number
  txHash?: string
  error?: string
}

// In-memory storage for demo purposes
// In production, this would be a database
const distributionQueue: DistributionRecord[] = []
const teamNotifications: string[] = []

export async function POST(request: NextRequest) {
  try {
    const body: FaucetRequest = await request.json()
    const { address, network, tokens } = body

    // Validate request
    if (!address || !network || !tokens || tokens.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Validate network
    if (network !== 'pol-sandbox') {
      return NextResponse.json(
        { error: 'Unsupported network' },
        { status: 400 }
      )
    }

    // Validate address format
    if (!address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Create distribution record
    const distributionId = `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const record: DistributionRecord = {
      id: distributionId,
      address,
      network,
      tokens,
      status: 'pending',
      timestamp: new Date()
    }

    // Add to queue
    distributionQueue.push(record)

    // Notify team (in production, this would be via WebSocket, Slack, etc.)
    const notification = `New faucet request: ${address} requesting ${tokens.join(', ')} on ${network}`
    teamNotifications.push(notification)
    console.log('Team notification:', notification)

    // Process distribution asynchronously
    processDistribution(record)

    return NextResponse.json({
      success: true,
      distributionId,
      message: 'Token distribution request received. Processing will begin shortly.',
      estimatedTime: '30 seconds',
      queuePosition: distributionQueue.length
    })

  } catch (error) {
    console.error('Faucet request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (address) {
    // Get specific distribution status
    const userDistributions = distributionQueue.filter(d => d.address === address)
    return NextResponse.json({
      distributions: userDistributions,
      total: userDistributions.length
    })
  } else {
    // Get queue status (for team monitoring)
    const pendingCount = distributionQueue.filter(d => d.status === 'pending').length
    const processingCount = distributionQueue.filter(d => d.status === 'processing').length
    const completedCount = distributionQueue.filter(d => d.status === 'completed').length
    const failedCount = distributionQueue.filter(d => d.status === 'failed').length

    return NextResponse.json({
      queue: {
        pending: pendingCount,
        processing: processingCount,
        completed: completedCount,
        failed: failedCount,
        total: distributionQueue.length
      },
      recentActivity: distributionQueue.slice(-10).reverse(),
      teamNotifications: teamNotifications.slice(-5)
    })
  }
}

async function processDistribution(record: DistributionRecord) {
  try {
    // Update status to processing
    record.status = 'processing'
    const startTime = Date.now()

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 15000 + Math.random() * 15000))

    // Use ZAI to determine optimal distribution strategy
    const zai = await ZAI.create()
    
    const strategyPrompt = `
    Analyze this token distribution request and provide the optimal distribution strategy:
    
    Address: ${record.address}
    Network: ${record.network}
    Tokens: ${record.tokens.join(', ')}
    
    Consider:
    1. Gas fees optimization
    2. Transaction batching
    3. Failure handling
    4. User experience
    
    Provide a brief strategy recommendation.
    `

    const strategyResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a blockchain distribution expert optimizing token transfers.'
        },
        {
          role: 'user',
          content: strategyPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    })

    const strategy = strategyResponse.choices[0]?.message?.content || 'Standard distribution'

    // Simulate transaction processing
    const txHash = `0x${Math.random().toString(36).substr(2, 64)}`
    
    // Update record with success
    record.status = 'completed'
    record.processingTime = Date.now() - startTime
    record.txHash = txHash

    console.log(`Distribution completed: ${record.id} - ${strategy}`)

    // In production, this would interact with actual blockchain contracts
    // For demo purposes, we're simulating the process

  } catch (error) {
    console.error('Distribution processing error:', error)
    record.status = 'failed'
    record.error = error instanceof Error ? error.message : 'Unknown error'
  }
}

// Team monitoring endpoint
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'clear-completed') {
    const initialLength = distributionQueue.length
    const filtered = distributionQueue.filter(d => d.status !== 'completed')
    distributionQueue.length = 0
    distributionQueue.push(...filtered)
    
    return NextResponse.json({
      cleared: initialLength - filtered.length,
      remaining: distributionQueue.length
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}