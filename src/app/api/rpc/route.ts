import { NextRequest, NextResponse } from 'next/server';

// RPC endpoint for POL Sandbox
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params = [], id } = body;

    console.log('RPC Request:', { method, params, id });

    // Handle different RPC methods
    switch (method) {
      case 'eth_call':
        return NextResponse.json({
          id,
          jsonrpc: '2.0',
          result: await handleEthCall(params)
        });

      case 'eth_getBalance':
        return NextResponse.json({
          id,
          jsonrpc: '2.0',
          result: await handleEthGetBalance(params)
        });

      case 'eth_getBlockByNumber':
        return NextResponse.json({
          id,
          jsonrpc: '2.0',
          result: await handleEthGetBlockByNumber(params)
        });

      case 'eth_chainId':
        return NextResponse.json({
          id,
          jsonrpc: '2.0',
          result: '0x23E7' // 9191 in hex
        });

      case 'net_version':
        return NextResponse.json({
          id,
          jsonrpc: '2.0',
          result: '9191'
        });

      // POL-specific methods
      case 'pol_getPrice':
        return NextResponse.json({
          id,
          jsonrpc: '2.0',
          result: await handlePolGetPrice(params)
        });

      case 'pol_getBatchPrices':
        return NextResponse.json({
          id,
          jsonrpc: '2.0',
          result: await handlePolGetBatchPrices(params)
        });

      case 'pol_setPriceOverride':
        return NextResponse.json({
          id,
          jsonrpc: '2.0',
          result: await handlePolSetPriceOverride(params)
        });

      case 'pol_getSupportedTokens':
        return NextResponse.json({
          id,
          jsonrpc: '2.0',
          result: await handlePolGetSupportedTokens()
        });

      default:
        return NextResponse.json({
          id,
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method ${method} not supported`
          }
        });
    }
  } catch (error) {
    console.error('RPC Error:', error);
    return NextResponse.json({
      id: body.id,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error'
      }
    });
  }
}

async function handleEthCall(params: any[]) {
  const [transaction, block] = params;
  
  // Check if this is a price oracle call
  if (isPriceOracleCall(transaction)) {
    return await overrideOracleResponse(transaction);
  }
  
  // For non-oracle calls, return a mock response
  return '0x0000000000000000000000000000000000000000000000000000000000000000';
}

async function handleEthGetBalance(params: any[]) {
  const [address, block] = params;
  // Return mock balance (100 ETH in hex)
  return '0x56BC75E2D630E8000';
}

async function handleEthGetBlockByNumber(params: any[]) {
  const [blockNumber, includeTransactions] = params;
  
  return {
    number: '0x1',
    hash: '0x...',
    parentHash: '0x...',
    timestamp: Math.floor(Date.now() / 1000),
    gasLimit: '0x1C9C380',
    gasUsed: '0x5208',
    miner: '0x...',
    difficulty: '0x0',
    totalDifficulty: '0x0',
    transactions: includeTransactions ? [] : [],
    uncles: []
  };
}

async function handlePolGetPrice(params: any[]) {
  const [tokenAddress] = params;
  
  // Mock POL price calculation
  const basePrice = 1.00;
  const adjustment = 1 + (Math.random() - 0.5) * 0.1; // ±5% adjustment
  const finalPrice = basePrice * adjustment;
  
  return {
    tokenAddress,
    basePrice,
    finalPrice,
    adjustment: adjustment - 1,
    confidence: 0.85 + Math.random() * 0.1,
    timestamp: Date.now(),
    factors: {
      marketDepth: Math.random() * 5000000,
      volatility: Math.random() * 0.3,
      liquidityScore: 0.5 + Math.random() * 0.5,
      userBehavior: Math.random() * 2 - 1
    }
  };
}

async function handlePolGetBatchPrices(params: any[]) {
  const [tokenAddresses] = params;
  const results = {};
  
  for (const address of tokenAddresses) {
    results[address] = await handlePolGetPrice([address]);
  }
  
  return results;
}

async function handlePolSetPriceOverride(params: any[]) {
  const [config] = params;
  
  // Store configuration (in production, would use database)
  console.log('Setting price override config:', config);
  
  return true;
}

async function handlePolGetSupportedTokens() {
  return [
    {
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      enabled: true
    },
    {
      symbol: 'USDC',
      address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
      decimals: 6,
      enabled: true
    },
    {
      symbol: 'DAI',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      enabled: true
    },
    {
      symbol: 'BUSD',
      address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
      decimals: 18,
      enabled: false
    }
  ];
}

function isPriceOracleCall(transaction: any): boolean {
  const priceOracles = [
    '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', // Chainlink ETH/USD
    '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e', // Mock USDC oracle
  ];
  
  return priceOracles.includes(transaction.to?.toLowerCase());
}

async function overrideOracleResponse(transaction: any): Promise<string> {
  // Return POL-adjusted price in oracle format
  const polPrice = await handlePolGetPrice([transaction.to]);
  
  // Convert price to oracle format (Chainlink uses 8 decimals)
  const priceInWei = Math.floor(polPrice.finalPrice * 1e8);
  return '0x' + priceInWei.toString(16);
}

// Handle GET requests for RPC endpoint info
export async function GET() {
  return NextResponse.json({
    name: 'POL Sandbox RPC',
    version: '1.0.0',
    network: {
      name: 'POL Sandbox Network',
      chainId: 9191,
      rpcUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      symbol: 'ETH',
      blockExplorer: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/explorer`,
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    },
    supportedMethods: [
      'eth_call',
      'eth_getBalance',
      'eth_getBlockByNumber',
      'eth_chainId',
      'net_version',
      'pol_getPrice',
      'pol_getBatchPrices',
      'pol_setPriceOverride',
      'pol_getSupportedTokens'
    ]
  });
}