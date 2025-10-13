import { NextRequest, NextResponse } from 'next/server';

// Configuration API for POL Sandbox settings
let configStore: any = {
  systemEnabled: true,
  autoStart: false,
  logLevel: 'info',
  priceOverrideEnabled: false,
  adjustmentFactor: 0.05,
  strategy: 'moderate',
  maxDeviation: 0.1,
  targetTokens: ['USDT', 'USDC', 'DAI'],
  customRpcEnabled: false,
  rpcUrl: 'https://defi-tw.netlify.app/api/rpc',
  chainId: 9191,
  apiKey: '',
  apiEndpoint: 'https://defi-tw.netlify.app/api',
  webhookUrl: '',
  extensionEnabled: false,
  autoInject: true,
  overrideApis: ['coingecko', 'dexscreener', 'cryptocompare']
};

export async function GET() {
  try {
    return NextResponse.json(configStore);
  } catch (error) {
    console.error('Config GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    // Validate configuration
    const requiredFields = [
      'systemEnabled',
      'priceOverrideEnabled',
      'adjustmentFactor',
      'strategy',
      'targetTokens'
    ];
    
    for (const field of requiredFields) {
      if (config[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Update configuration
    configStore = { ...configStore, ...config };
    
    console.log('Configuration updated:', configStore);
    
    return NextResponse.json({
      success: true,
      config: configStore
    });
    
  } catch (error) {
    console.error('Config POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}