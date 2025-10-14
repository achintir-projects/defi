// API routes that need to be proxied to the Next.js server
const apiRoutes = [
  '/api/prices',
  '/api/config',
  '/api/rpc',
  '/api/health',
  '/api/simulation',
  '/api/socket.io'
];

module.exports = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle different API routes
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  try {
    switch (pathname) {
      case '/api/prices':
        return await handlePricesAPI(req, res);
      
      case '/api/config':
        return await handleConfigAPI(req, res);
      
      case '/api/rpc':
        return await handleRPCAPI(req, res);
      
      case '/api/health':
        return await handleHealthAPI(req, res);
      
      case '/api/simulation':
        return await handleSimulationAPI(req, res);
      
      default:
        res.status(404).json({ error: 'API endpoint not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Price API handler
async function handlePricesAPI(req, res) {
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const tokens = searchParams.get('tokens')?.split(',') || [];
    const addresses = searchParams.get('addresses')?.split(',') || [];

    // Mock price data
    const prices = {};
    const allTokens = ['USDT-ERC20', 'USDT-TRC20', 'USDC', 'DAI', 'BUSD', 'FRAX', 'LUSD'];
    
    for (const symbol of allTokens) {
      if (tokens.length === 0 || tokens.includes(symbol)) {
        const basePrice = 1.0;
        const adjustment = 1 + (Math.random() - 0.5) * 0.1;
        const finalPrice = basePrice * adjustment;
        
        prices[symbol] = {
          symbol,
          address: `0x${Math.random().toString(16).substr(2, 40)}`,
          basePrice,
          finalPrice,
          adjustment: adjustment - 1.0,
          confidence: 0.85 + Math.random() * 0.1,
          timestamp: Date.now(),
          factors: {
            marketDepth: Math.random() * 5000000,
            volatility: Math.random() * 0.3,
            liquidityScore: 0.5 + Math.random() * 0.5,
            userBehavior: Math.random() * 2 - 1
          },
          marketData: {
            marketCap: Math.floor(Math.random() * 50000000000),
            volume24h: Math.floor(Math.random() * 1000000000),
            change24h: (Math.random() - 0.5) * 2
          }
        };
      }
    }

    return res.json({
      success: true,
      data: prices,
      timestamp: Date.now()
    });
  }

  if (req.method === 'POST') {
    const body = JSON.parse(req.body);
    const { action, ...data } = body;

    switch (action) {
      case 'updateTokenPrice':
        return res.json({
          success: true,
          data: {
            symbol: data.symbol,
            previousPrice: 1.0,
            newPrice: data.targetPrice,
            adjustmentFactor: data.adjustmentFactor,
            timestamp: Date.now()
          }
        });

      case 'batchUpdatePrices':
        return res.json({
          success: true,
          data: {
            updated: data.prices?.length || 0,
            results: data.prices || []
          }
        });

      default:
        return res.status(400).json({ success: false, error: 'Unknown action' });
    }
  }
}

// Config API handler
async function handleConfigAPI(req, res) {
  if (req.method === 'GET') {
    return res.json({
      systemEnabled: true,
      autoStart: false,
      logLevel: 'info',
      priceOverrideEnabled: false,
      adjustmentFactor: 0.05,
      strategy: 'moderate',
      maxDeviation: 0.1,
      targetTokens: ['USDT-ERC20', 'USDT-TRC20', 'USDC', 'DAI'],
      customRpcEnabled: false,
      rpcUrl: `${process.env.URL}/api/rpc`,
      chainId: 9191,
      apiKey: '',
      apiEndpoint: `${process.env.URL}/api`,
      webhookUrl: '',
      extensionEnabled: false,
      autoInject: true,
      overrideApis: ['coingecko', 'dexscreener', 'cryptocompare']
    });
  }

  if (req.method === 'POST') {
    const config = JSON.parse(req.body);
    return res.json({
      success: true,
      config
    });
  }
}

// RPC API handler
async function handleRPCAPI(req, res) {
  if (req.method === 'GET') {
    return res.json({
      name: 'POL Sandbox',
      version: '1.0.0',
      network: {
        name: 'POL Sandbox Network',
        chainId: 9191,
        rpcUrl: `${process.env.URL}/api/rpc`,
        symbol: 'ETH',
        blockExplorer: `${process.env.URL}/explorer`,
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

  if (req.method === 'POST') {
    const body = JSON.parse(req.body);
    const { method, params = [], id } = body;

    switch (method) {
      case 'pol_getPrice':
        return res.json({
          id,
          jsonrpc: '2.0',
          result: {
            tokenAddress: params[0],
            basePrice: 1.0,
            finalPrice: 1.0 + (Math.random() - 0.5) * 0.1,
            adjustment: (Math.random() - 0.5) * 0.1,
            confidence: 0.85 + Math.random() * 0.1,
            timestamp: Date.now()
          }
        });

      default:
        return res.json({
          id,
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method ${method} not supported`
          }
        });
    }
  }
}

// Health API handler
async function handleHealthAPI(req, res) {
  return res.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
}

// Simulation API handler
async function handleSimulationAPI(req, res) {
  if (req.method === 'POST') {
    const body = JSON.parse(req.body);
    
    return res.json({
      success: true,
      simulation: {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        parameters: body,
        results: {
          priceAdjustments: Array(5).fill(0).map(() => ({
            token: ['USDT-ERC20', 'USDT-TRC20', 'USDC'][Math.floor(Math.random() * 3)],
            originalPrice: 1.0,
            adjustedPrice: 1.0 + (Math.random() - 0.5) * 0.1,
            adjustment: (Math.random() - 0.5) * 0.1
          })),
          totalValueLocked: Math.floor(Math.random() * 1000000),
          apr: (Math.random() * 20 + 5).toFixed(2)
        }
      }
    });
  }
}