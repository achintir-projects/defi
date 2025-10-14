import { NextRequest, NextResponse } from 'next/server';

// Mock wallet balances (in a real app, this would come from blockchain or database)
const MOCK_WALLET_BALANCES: Record<string, Array<{
  symbol: string;
  chain: string;
  balance: number;
  price: number;
  value: number;
  address: string;
  decimals: number;
}>> = {
  '0x1234567890123456789012345678901234567890': [
    {
      symbol: 'USDT',
      chain: 'ethereum',
      balance: 1000.50,
      price: 1.00,
      value: 1000.50,
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6
    },
    {
      symbol: 'USDC',
      chain: 'ethereum',
      balance: 500.25,
      price: 1.00,
      value: 500.25,
      address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
      decimals: 6
    },
    {
      symbol: 'POL',
      chain: 'polygon',
      balance: 100,
      price: 0.85,
      value: 85.00,
      address: '0x455e53C31b987D3f18d6d7DdF5D6932bE9C80902',
      decimals: 18
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Get mock balances for the wallet
    const balances = MOCK_WALLET_BALANCES[walletAddress] || [];
    
    // Calculate total portfolio value
    const totalValue = balances.reduce((sum, token) => sum + token.value, 0);

    return NextResponse.json({
      walletAddress,
      balances,
      totalValue,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet balance' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, symbol, chain, balance, price, action } = await request.json();

    if (!walletAddress || !symbol || !chain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize wallet if it doesn't exist
    if (!MOCK_WALLET_BALANCES[walletAddress]) {
      MOCK_WALLET_BALANCES[walletAddress] = [];
    }

    const existingTokenIndex = MOCK_WALLET_BALANCES[walletAddress].findIndex(
      token => token.symbol === symbol && token.chain === chain
    );

    const tokenPrice = price || 1.00; // Default price if not provided
    const tokenValue = balance * tokenPrice;

    if (action === 'remove') {
      // Remove token
      if (existingTokenIndex !== -1) {
        MOCK_WALLET_BALANCES[walletAddress].splice(existingTokenIndex, 1);
      }
    } else if (action === 'update') {
      // Update existing token
      if (existingTokenIndex !== -1) {
        MOCK_WALLET_BALANCES[walletAddress][existingTokenIndex] = {
          ...MOCK_WALLET_BALANCES[walletAddress][existingTokenIndex],
          balance,
          price: tokenPrice,
          value: tokenValue
        };
      }
    } else {
      // Add new token or update existing
      const tokenData = {
        symbol,
        chain,
        balance,
        price: tokenPrice,
        value: tokenValue,
        address: symbol === 'USDT' ? '0xdAC17F958D2ee523a2206206994597C13D831ec7' :
                symbol === 'USDC' ? '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e' :
                '0x455e53C31b987D3f18d6d7DdF5D6932bE9C80902',
        decimals: symbol === 'POL' ? 18 : 6
      };

      if (existingTokenIndex !== -1) {
        MOCK_WALLET_BALANCES[walletAddress][existingTokenIndex] = tokenData;
      } else {
        MOCK_WALLET_BALANCES[walletAddress].push(tokenData);
      }
    }

    // Recalculate total portfolio value
    const totalValue = MOCK_WALLET_BALANCES[walletAddress].reduce((sum, token) => sum + token.value, 0);

    return NextResponse.json({
      success: true,
      walletAddress,
      balances: MOCK_WALLET_BALANCES[walletAddress],
      totalValue,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return NextResponse.json({ error: 'Failed to update wallet balance' }, { status: 500 });
  }
}