import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Token distribution API for POL Sandbox
const SUPPORTED_TOKENS = {
  'USDT-ERC20': {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD'
  },
  'USDT-TRC20': {
    address: '0x41A6143F3DAA903F95C92F5EE06a1b7C5C6c1BBE',
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD (TRC20)'
  },
  'USDC': {
    address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin'
  },
  'DAI': {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin'
  },
  'ETH': {
    address: 'native',
    decimals: 18,
    symbol: 'ETH',
    name: 'Ethereum'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, token, amount, chainId = 9191 } = await request.json();

    // Validate request
    if (!walletAddress || !token || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, token, amount' },
        { status: 400 }
      );
    }

    // Validate token
    if (!SUPPORTED_TOKENS[token as keyof typeof SUPPORTED_TOKENS]) {
      return NextResponse.json(
        { error: `Unsupported token: ${token}. Supported tokens: ${Object.keys(SUPPORTED_TOKENS).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Validate amount
    if (parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    const tokenInfo = SUPPORTED_TOKENS[token as keyof typeof SUPPORTED_TOKENS];
    
    // Create distribution record
    const distribution = await db.distribution.create({
      data: {
        walletAddress,
        token,
        amount: parseFloat(amount),
        chainId,
        status: 'pending',
        txHash: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Simulate token transfer (in production, this would interact with blockchain)
    const transferResult = await simulateTokenTransfer(
      walletAddress,
      token,
      parseFloat(amount),
      chainId
    );

    // Update distribution record
    await db.distribution.update({
      where: { id: distribution.id },
      data: {
        status: transferResult.success ? 'completed' : 'failed',
        txHash: transferResult.txHash,
        updatedAt: new Date()
      }
    });

    if (transferResult.success) {
      return NextResponse.json({
        success: true,
        distribution: {
          id: distribution.id,
          walletAddress,
          token,
          amount: parseFloat(amount),
          chainId,
          status: 'completed',
          txHash: transferResult.txHash,
          tokenInfo,
          createdAt: distribution.createdAt
        },
        message: `Successfully sent ${amount} ${token} to ${walletAddress}`
      });
    } else {
      return NextResponse.json(
        { error: 'Transfer failed', details: transferResult.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Token distribution error:', error);
    return NextResponse.json(
      { error: 'Failed to process token distribution' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    let distributions;
    
    if (walletAddress) {
      // Get distributions for specific wallet
      distributions = await db.distribution.findMany({
        where: { walletAddress },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    } else {
      // Get all recent distributions
      distributions = await db.distribution.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100
      });
    }

    return NextResponse.json({
      success: true,
      distributions: distributions.map(dist => ({
        ...dist,
        tokenInfo: SUPPORTED_TOKENS[dist.token as keyof typeof SUPPORTED_TOKENS]
      }))
    });

  } catch (error) {
    console.error('Get distributions error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve distributions' },
      { status: 500 }
    );
  }
}

// Simulate token transfer (in production, use actual blockchain interaction)
async function simulateTokenTransfer(
  walletAddress: string,
  token: string,
  amount: number,
  chainId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock transaction hash
    const txHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    // Simulate success rate (95% success)
    const success = Math.random() > 0.05;

    if (success) {
      console.log(`Simulated transfer: ${amount} ${token} to ${walletAddress} (tx: ${txHash})`);
      return { success: true, txHash };
    } else {
      return { success: false, error: 'Simulated network error' };
    }

  } catch (error) {
    return { success: false, error: 'Transfer simulation failed' };
  }
}

// Get supported tokens
export async function PUT() {
  try {
    return NextResponse.json({
      success: true,
      tokens: SUPPORTED_TOKENS
    });
  } catch (error) {
    console.error('Get supported tokens error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve supported tokens' },
      { status: 500 }
    );
  }
}