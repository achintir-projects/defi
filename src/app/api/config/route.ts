import { NextRequest, NextResponse } from 'next/server';

// Configuration API for POL Sandbox settings
const defaultConfig: any = {
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

// In-memory storage for serverless environments
let memoryConfig: any = { ...defaultConfig };

// Helper function to get configuration with multiple fallbacks
async function getConfig(): Promise<any> {
  try {
    // Method 1: Try database first
    try {
      const { db } = await import('@/lib/db');
      const configRecord = await db.config.findFirst({
        where: { key: 'pol_sandbox_config' }
      });
      
      if (configRecord) {
        const config = { ...defaultConfig, ...JSON.parse(configRecord.value) };
        memoryConfig = config; // Update memory cache
        return config;
      }
    } catch (dbError) {
      console.log('Database not available, trying fallback methods');
    }

    // Method 2: Try environment variables
    if (process.env.POL_SANDBOX_CONFIG) {
      try {
        const envConfig = JSON.parse(process.env.POL_SANDBOX_CONFIG);
        const config = { ...defaultConfig, ...envConfig };
        memoryConfig = config; // Update memory cache
        return config;
      } catch (envError) {
        console.log('Environment config invalid');
      }
    }

    // Method 3: Use memory cache (last resort)
    if (memoryConfig && Object.keys(memoryConfig).length > Object.keys(defaultConfig).length) {
      return memoryConfig;
    }

    // Method 4: Return default config
    return defaultConfig;
    
  } catch (error) {
    console.error('Config retrieval error:', error);
    return defaultConfig;
  }
}

// Helper function to save configuration with multiple methods
async function saveConfig(config: any): Promise<boolean> {
  let saved = false;
  
  try {
    // Method 1: Try database
    try {
      const { db } = await import('@/lib/db');
      await db.config.upsert({
        where: { key: 'pol_sandbox_config' },
        update: { value: JSON.stringify(config) },
        create: {
          key: 'pol_sandbox_config',
          value: JSON.stringify(config)
        }
      });
      saved = true;
      console.log('Config saved to database');
    } catch (dbError) {
      console.log('Database save failed, trying fallback methods');
    }

    // Method 2: Update memory cache (always works)
    memoryConfig = config;
    saved = true;
    console.log('Config saved to memory cache');

    // Method 3: Log the config for debugging
    console.log('Configuration updated:', JSON.stringify(config, null, 2));
    
    return saved;
    
  } catch (error) {
    console.error('Save config error:', error);
    // At least save to memory
    memoryConfig = config;
    return true;
  }
}

export async function GET() {
  try {
    const config = await getConfig();
    
    // Add debug info
    const response = {
      ...config,
      _debug: {
        timestamp: new Date().toISOString(),
        storage: 'database_or_fallback'
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Config GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration', _debug: { error: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    // Add debug logging
    console.log('POST request received:', JSON.stringify(config, null, 2));
    
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
    
    // Get current config and merge with new values
    const currentConfig = await getConfig();
    const updatedConfig = { ...currentConfig, ...config };
    
    // Remove debug fields from previous GET
    delete updatedConfig._debug;
    
    // Save using multiple methods
    const saved = await saveConfig(updatedConfig);
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to persist configuration' },
        { status: 500 }
      );
    }
    
    console.log('Configuration successfully updated and saved');
    
    return NextResponse.json({
      success: true,
      config: updatedConfig,
      _debug: {
        timestamp: new Date().toISOString(),
        saved: true
      }
    });
    
  } catch (error) {
    console.error('Config POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save configuration',
        _debug: { 
          error: error.message,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}