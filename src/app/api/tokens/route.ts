import { NextRequest, NextResponse } from 'next/server';
import { ZAI } from 'z-ai-web-dev-sdk';

// Token configuration
const TOKENS = {
  USDT: {
    ethereum: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      chainId: 1,
      logoURI: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
    }
  },
  USDC: {
    ethereum: {
      address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 1,
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
    }
  },
  POL: {
    polygon: {
      address: '0x455e53C31b987D3f18d6d7DdF5D6932bE9C80902',
      symbol: 'POL',
      name: 'Polygon',
      decimals: 18,
      chainId: 137,
      logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
    }
  }
};

// Mock price data (in a real app, you'd fetch this from a price API)
const MOCK_PRICES = {
  'USDT-ethereum': 1.00,
  'USDC-ethereum': 1.00,
  'POL-polygon': 0.85
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const tokenKey = searchParams.get('token');

    if (tokenKey) {
      // Get specific token info
      const [symbol, chain] = tokenKey.split('-');
      const tokenInfo = TOKENS[symbol as keyof typeof TOKENS]?.[chain as keyof typeof TOKENS[symbol as keyof typeof TOKENS]];
      
      if (!tokenInfo) {
        return NextResponse.json({ error: 'Token not found' }, { status: 404 });
      }

      const price = MOCK_PRICES[tokenKey as keyof typeof MOCK_PRICES] || 0;
      
      return NextResponse.json({
        ...tokenInfo,
        price,
        tokenKey
      });
    }

    // Get all available tokens
    const tokens = Object.entries(TOKENS).flatMap(([symbol, chains]) =>
      Object.entries(chains).map(([chain, info]) => ({
        ...info,
        symbol,
        chain,
        tokenKey: `${symbol}-${chain}`,
        price: MOCK_PRICES[`${symbol}-${chain}` as keyof typeof MOCK_PRICES] || 0
      }))
    );

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, tokenKey, quantity, action } = await request.json();

    if (!walletAddress || !tokenKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [symbol, chain] = tokenKey.split('-');
    const tokenInfo = TOKENS[symbol as keyof typeof TOKENS]?.[chain as keyof typeof TOKENS[symbol as keyof typeof TOKENS]];
    
    if (!tokenInfo) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const price = MOCK_PRICES[tokenKey as keyof typeof MOCK_PRICES] || 0;
    const value = quantity * price;

    // In a real implementation, this would interact with the blockchain
    // For now, we'll simulate the token operation
    const result = {
      success: true,
      transaction: {
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: walletAddress,
        to: tokenInfo.address,
        symbol: tokenInfo.symbol,
        quantity,
        price,
        value,
        action: action || 'add',
        timestamp: new Date().toISOString(),
        chainId: tokenInfo.chainId
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error managing tokens:', error);
    return NextResponse.json({ error: 'Failed to manage tokens' }, { status: 500 });
  }
}