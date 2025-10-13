import { NextRequest, NextResponse } from 'next/server';

// Price API for POL Sandbox
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokens = searchParams.get('tokens')?.split(',') || [];
    const addresses = searchParams.get('addresses')?.split(',') || [];

    console.log('Price API Request:', { tokens, addresses });

    if (tokens.length > 0) {
      const prices = await getPricesBySymbols(tokens);
      return NextResponse.json({
        success: true,
        data: prices,
        timestamp: Date.now()
      });
    }

    if (addresses.length > 0) {
      const prices = await getPricesByAddresses(addresses);
      return NextResponse.json({
        success: true,
        data: prices,
        timestamp: Date.now()
      });
    }

    // Return all supported tokens
    const allPrices = await getAllPrices();
    return NextResponse.json({
      success: true,
      data: allPrices,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Price API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch prices'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    console.log('Price API POST:', { action, data });

    switch (action) {
      case 'setPriceOverride':
        const result = await setPriceOverride(data);
        return NextResponse.json({
          success: true,
          data: result
        });

      case 'updateTokenPrice':
        const updateResult = await updateTokenPrice(data);
        return NextResponse.json({
          success: true,
          data: updateResult
        });

      case 'batchUpdatePrices':
        const batchResult = await batchUpdatePrices(data.prices);
        return NextResponse.json({
          success: true,
          data: batchResult
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Price API POST Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}

async function getPricesBySymbols(symbols: string[]) {
  const prices = {};
  
  for (const symbol of symbols) {
    prices[symbol] = await calculateTokenPrice(symbol);
  }
  
  return prices;
}

async function getPricesByAddresses(addresses: string[]) {
  const prices = {};
  
  for (const address of addresses) {
    prices[address] = await calculateTokenPriceByAddress(address);
  }
  
  return prices;
}

async function getAllPrices() {
  const supportedTokens = [
    { symbol: 'USDT-ERC20', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    { symbol: 'USDT-TRC20', address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', decimals: 6 },
    { symbol: 'USDC', address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e', decimals: 6 },
    { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
    { symbol: 'BUSD', address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53', decimals: 18 },
    { symbol: 'FRAX', address: '0x853d955aCEf822Db058eb8505911ED77F175b99e', decimals: 18 },
    { symbol: 'LUSD', address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0', decimals: 18 }
  ];

  const prices = {};
  for (const token of supportedTokens) {
    prices[token.symbol] = await calculateTokenPrice(token.symbol, token.address);
  }
  
  return prices;
}

async function calculateTokenPrice(symbol: string, address?: string) {
  // Base price for stablecoins
  const basePrice = 1.0;
  
  // POL Sandbox price adjustment algorithm
  const marketDepth = Math.random() * 5000000; // $0-5M depth
  const volatility = Math.random() * 0.3; // 0-30% daily volatility
  const liquidityScore = 0.5 + Math.random() * 0.5; // 0.5-1.0 score
  const userBehavior = Math.random() * 2 - 1; // -1 to 1

  // Calculate adjustment factors
  const depthFactor = Math.max(0.1, Math.min(2.0, 1.0 / (1.0 + marketDepth / 1000000)));
  const volatilityFactor = Math.max(0.8, Math.min(1.2, 1.0 + volatility * 0.1));
  const liquidityFactor = Math.max(0.9, Math.min(1.1, 1.0 + liquidityScore * 0.05));
  const behaviorFactor = Math.max(0.95, Math.min(1.05, 1.0 + userBehavior * 0.02));

  // Combined adjustment
  const totalAdjustment = depthFactor * volatilityFactor * liquidityFactor * behaviorFactor;
  const adjustedPrice = basePrice * totalAdjustment;

  // Calculate confidence based on data quality
  const confidence = Math.min(0.95, 
    (1.0 - volatility) * 0.4 + 
    liquidityScore * 0.3 + 
    (1.0 - Math.abs(totalAdjustment - 1.0)) * 0.3
  );

  return {
    symbol,
    address: address || `0x${Math.random().toString(16).substr(2, 40)}`,
    basePrice,
    finalPrice: adjustedPrice,
    adjustment: totalAdjustment - 1.0,
    confidence,
    timestamp: Date.now(),
    decimals: symbol.includes('USDT') ? 6 : symbol === 'USDC' ? 6 : 18,
    factors: {
      marketDepth,
      volatility,
      liquidityScore,
      userBehavior
    },
    marketData: {
      marketCap: Math.floor(Math.random() * 50000000000), // $0-50B
      volume24h: Math.floor(Math.random() * 1000000000), // $0-1B
      change24h: (Math.random() - 0.5) * 2 // -1% to +1%
    }
  };
}

async function calculateTokenPriceByAddress(address: string) {
  // For now, just return a mock price based on address
  const symbol = address.slice(0, 4).toUpperCase();
  return await calculateTokenPrice(symbol, address);
}

async function setPriceOverride(config: any) {
  // Store configuration (in production, would use database)
  console.log('Setting price override config:', config);
  
  // Store in localStorage for demo purposes
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('pol-price-override', JSON.stringify(config));
  }
  
  return { success: true, config };
}

async function updateTokenPrice(data: any) {
  const { symbol, price, adjustmentFactor } = data;
  
  console.log(`Updating price for ${symbol}:`, { price, adjustmentFactor });
  
  // In production, would update database
  return {
    symbol,
    previousPrice: 1.0,
    newPrice: price,
    adjustmentFactor,
    timestamp: Date.now()
  };
}

async function batchUpdatePrices(prices: any[]) {
  const results = [];
  
  for (const priceData of prices) {
    const result = await updateTokenPrice(priceData);
    results.push(result);
  }
  
  return {
    updated: results.length,
    results
  };
}