import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

// Helper function to get configuration from database or fallback to default
async function getConfig(): Promise<any> {
  try {
    // Try to get config from database
    const configRecord = await db.config.findFirst({
      where: { key: 'pol_sandbox_config' }
    });
    
    if (configRecord) {
      return { ...defaultConfig, ...JSON.parse(configRecord.value) };
    }
    
    // Create default config if it doesn't exist
    await db.config.create({
      data: {
        key: 'pol_sandbox_config',
        value: JSON.stringify(defaultConfig)
      }
    });
    
    return defaultConfig;
  } catch (error) {
    console.error('Database config error:', error);
    // Fallback to default config
    return defaultConfig;
  }
}

// Helper function to save configuration to database
async function saveConfig(config: any): Promise<boolean> {
  try {
    await db.config.upsert({
      where: { key: 'pol_sandbox_config' },
      update: { value: JSON.stringify(config) },
      create: {
        key: 'pol_sandbox_config',
        value: JSON.stringify(config)
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to save config to database:', error);
    return false;
  }
}

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json(config);
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
    
    // Get current config and merge with new values
    const currentConfig = await getConfig();
    const updatedConfig = { ...currentConfig, ...config };
    
    // Save to database
    const saved = await saveConfig(updatedConfig);
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to persist configuration' },
        { status: 500 }
      );
    }
    
    console.log('Configuration updated:', updatedConfig);
    
    return NextResponse.json({
      success: true,
      config: updatedConfig
    });
    
  } catch (error) {
    console.error('Config POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}