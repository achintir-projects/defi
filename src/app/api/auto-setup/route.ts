import { NextRequest, NextResponse } from 'next/server';

const POL_NETWORK_CONFIG = {
  chainId: '0x15bca', // 88888 in hex
  chainName: 'POL Sandbox',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://rpc.pol-sandbox.com/'],
  blockExplorerUrls: ['https://explorer.pol-sandbox.com']
};

const DEFAULT_TOKENS = [
  {
    address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
    symbol: 'POL',
    decimals: 18,
    logoURI: '/tokens/pol.png'
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    decimals: 6,
    logoURI: '/tokens/usdc.png'
  },
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    symbol: 'USDT',
    decimals: 6,
    logoURI: '/tokens/usdt.png'
  }
];

// GET - Return setup configuration for wallet
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletType = searchParams.get('wallet');
  const userAgent = request.headers.get('user-agent') || '';

  try {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Get wallet-specific configuration
    const walletConfig = getWalletConfig(walletType, isMobile);
    
    return NextResponse.json({
      success: true,
      config: {
        network: POL_NETWORK_CONFIG,
        tokens: DEFAULT_TOKENS,
        wallet: walletConfig
      }
    });

  } catch (error) {
    console.error('Auto-setup GET error:', error);
    return NextResponse.json({
      error: 'Failed to get setup configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Process wallet connection and setup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletType, address, action } = body;

    switch (action) {
      case 'connect':
        // Log the connection for analytics
        console.log(`Wallet connected: ${walletType} - ${address}`);
        
        // Return success with setup instructions
        return NextResponse.json({
          success: true,
          message: 'Connection successful',
          setup: {
            network: POL_NETWORK_CONFIG,
            tokens: DEFAULT_TOKENS,
            instructions: getSetupInstructions(walletType)
          }
        });

      case 'setup-complete':
        // Log successful setup
        console.log(`Setup complete: ${walletType} - ${address}`);
        
        return NextResponse.json({
          success: true,
          message: 'Setup completed successfully',
          redirectTo: '/dashboard'
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: 'Use: connect, setup-complete'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Auto-setup POST error:', error);
    return NextResponse.json({
      error: 'Setup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getWalletConfig(walletType: string | null, isMobile: boolean) {
  const configs: Record<string, any> = {
    metamask: {
      name: 'MetaMask',
      deepLink: isMobile ? 'metamask://dapp/' : null,
      installUrl: isMobile ? 'https://metamask.app.link/dapp/' : 'https://metamask.io/download/',
      supported: true
    },
    trustwallet: {
      name: 'Trust Wallet',
      deepLink: isMobile ? 'trust://dapp/' : null,
      installUrl: isMobile ? 'https://link.trustwallet.com/open_url?coin_id=60&url=' : 'https://trustwallet.com/download/',
      supported: true
    },
    coinbase: {
      name: 'Coinbase Wallet',
      deepLink: isMobile ? 'cbwallet://dapp/' : null,
      installUrl: isMobile ? 'https://go.cb-w.com/dapp' : 'https://www.coinbase.com/wallet',
      supported: true
    },
    walletconnect: {
      name: 'WalletConnect',
      deepLink: 'wc:',
      installUrl: 'https://walletconnect.com/',
      supported: true
    },
    phantom: {
      name: 'Phantom',
      deepLink: isMobile ? 'phantom://browse/' : null,
      installUrl: 'https://phantom.app/',
      supported: true
    },
    okx: {
      name: 'OKX Wallet',
      deepLink: isMobile ? 'okx://wallet/dapp/' : null,
      installUrl: 'https://www.okx.com/web3',
      supported: true
    }
  };

  return configs[walletType || ''] || {
    name: 'Unknown Wallet',
    deepLink: null,
    installUrl: 'https://metamask.io/download/',
    supported: false
  };
}

function getSetupInstructions(walletType: string): string[] {
  const instructions: Record<string, string[]> = {
    metamask: [
      'Approve the connection request in MetaMask',
      'Allow POL Sandbox network to be added automatically',
      'Approve default tokens (POL, USDC, USDT) to be added',
      'Switch to POL Sandbox network when prompted'
    ],
    trustwallet: [
      'Open Trust Wallet and approve the connection',
      'Allow network addition when prompted',
      'Approve token additions',
      'Switch to POL Sandbox network'
    ],
    coinbase: [
      'Approve connection in Coinbase Wallet',
      'Allow automatic network setup',
      'Approve token additions',
      'Switch to POL Sandbox network'
    ],
    walletconnect: [
      'Scan QR code with your mobile wallet',
      'Approve connection on your mobile device',
      'Follow the setup prompts in your wallet',
      'Network and tokens will be added automatically'
    ],
    phantom: [
      'Approve connection in Phantom wallet',
      'Allow network addition',
      'Approve token additions',
      'Switch to POL Sandbox network'
    ],
    okx: [
      'Approve connection in OKX Wallet',
      'Allow automatic setup',
      'Approve token additions',
      'Switch to POL Sandbox network'
    ]
  };

  return instructions[walletType] || [
    'Approve the connection in your wallet',
    'Allow network and token additions',
    'Switch to POL Sandbox network'
  ];
}