'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  CheckCircle, 
  Loader2, 
  ArrowRight,
  Zap,
  Shield,
  Smartphone,
  QrCode
} from 'lucide-react';
import { universalWalletConnector, WalletConnectionState } from '@/lib/universal-wallet-connector';

const POL_NETWORK_CONFIG = {
  chainId: '0x15bca',
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
    decimals: 18
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    decimals: 6
  },
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    symbol: 'USDT',
    decimals: 6
  }
];

interface MobileWalletOption {
  id: string;
  name: string;
  icon: string;
  deepLink: string;
  installUrl: string;
  color: string;
}

const MobileConnectPage: React.FC = () => {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'initial' | 'connecting' | 'setup' | 'complete'>('initial');

  const mobileWallets: MobileWalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      deepLink: 'metamask://dapp/',
      installUrl: 'https://metamask.app.link/dapp/',
      color: 'bg-orange-500'
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: '🛡️',
      deepLink: 'trust://dapp/',
      installUrl: 'https://link.trustwallet.com/open_url?coin_id=60&url=',
      color: 'bg-blue-500'
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      icon: '🔵',
      deepLink: 'cbwallet://dapp/',
      installUrl: 'https://go.cb-w.com/dapp',
      color: 'bg-blue-600'
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      deepLink: 'phantom://browse/',
      installUrl: 'https://phantom.app/',
      color: 'bg-purple-500'
    },
    {
      id: 'okx',
      name: 'OKX',
      icon: '⚡',
      deepLink: 'okx://wallet/dapp/',
      installUrl: 'https://www.okx.com/web3',
      color: 'bg-black'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      deepLink: 'wc:',
      installUrl: 'https://walletconnect.com/',
      color: 'bg-cyan-500'
    }
  ];

  useEffect(() => {
    // Check URL parameters for auto-connect
    const urlParams = new URLSearchParams(window.location.search);
    const walletParam = urlParams.get('wallet');
    const autoParam = urlParams.get('auto');
    
    if (walletParam && autoParam === 'true') {
      const wallet = mobileWallets.find(w => w.id === walletParam);
      if (wallet) {
        connectWallet(wallet);
      }
    }

    // Check existing connection
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const state = universalWalletConnector.getConnectionState();
      if (state.isConnected) {
        setConnectionState(state);
        setStep('complete');
        setSuccess('Already connected to POL Sandbox!');
      }
    } catch (error) {
      console.error('Failed to check existing connection:', error);
    }
  };

  const connectWallet = async (wallet: MobileWalletOption) => {
    setLoading(wallet.id);
    setError(null);
    setSuccess(null);
    setStep('connecting');

    try {
      // Try deep link first
      const currentUrl = encodeURIComponent(window.location.href);
      const deepLinkUrl = wallet.deepLink + currentUrl;
      
      window.location.href = deepLinkUrl;
      
      // Wait for potential wallet connection
      setTimeout(async () => {
        try {
          const state = await universalWalletConnector.connect(wallet.id);
          setConnectionState(state);
          await setupWallet(state);
        } catch (error) {
          console.error('Connection failed:', error);
          // Fallback to installation
          window.open(wallet.installUrl + currentUrl, '_blank');
          setError(`Please install ${wallet.name} first`);
          setStep('initial');
        }
        setLoading(null);
      }, 3000);

    } catch (error) {
      console.error('Connection error:', error);
      setError(`Failed to connect to ${wallet.name}`);
      setLoading(null);
      setStep('initial');
    }
  };

  const setupWallet = async (state: WalletConnectionState) => {
    setStep('setup');
    setSuccess('Setting up POL Sandbox...');

    try {
      // Add network
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [POL_NETWORK_CONFIG]
        });

        // Switch to network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: POL_NETWORK_CONFIG.chainId }]
        });

        // Add tokens
        for (const token of DEFAULT_TOKENS) {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: token.address,
                symbol: token.symbol,
                decimals: token.decimals
              }
            }
          });
        }
      }

      setSuccess('🎉 Connected to POL Sandbox!');
      setStep('complete');

    } catch (error) {
      console.error('Setup failed:', error);
      setError('Setup failed. Please add network manually.');
      setStep('complete');
    }
  };

  const renderInitial = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Wallet className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Connect to POL</h1>
          <p className="text-gray-600 mt-2">
            Automatic setup • No configuration needed
          </p>
        </div>
      </div>

      {/* Wallet Options */}
      <div className="grid grid-cols-2 gap-3">
        {mobileWallets.map((wallet) => (
          <Card 
            key={wallet.id}
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => connectWallet(wallet)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className={`w-12 h-12 ${wallet.color} rounded-xl flex items-center justify-center`}>
                  <span className="text-2xl">{wallet.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{wallet.name}</h3>
                  <p className="text-xs text-gray-500">Tap to connect</p>
                </div>
                {loading === wallet.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Zap className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Automatic Network Setup</p>
            <p className="text-xs text-gray-500">POL Sandbox added automatically</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Default Tokens Added</p>
            <p className="text-xs text-gray-500">POL, USDC, USDT included</p>
          </div>
        </div>
      </div>

      <Alert>
        <QrCode className="h-4 w-4" />
        <AlertDescription>
          <strong>Secure & Simple:</strong> Your wallet is configured automatically with the correct network and tokens.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderConnecting = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center">
          <Smartphone className="h-10 w-10 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Opening Wallet...</h2>
          <p className="text-gray-600 mt-2">
            Please approve the connection in your wallet
          </p>
        </div>
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-600" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span>Connecting to wallet</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 border-2 border-gray-300 rounded-full"></div>
          <span>Setting up network</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 border-2 border-gray-300 rounded-full"></div>
          <span>Adding tokens</span>
        </div>
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-2xl flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Almost Done!</h2>
          <p className="text-gray-600 mt-2">
            Configuring POL Sandbox network and tokens...
          </p>
        </div>
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-green-600" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Wallet connected</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Adding POL Sandbox network</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 border-2 border-gray-300 rounded-full"></div>
          <span>Adding default tokens</span>
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto bg-green-500 rounded-2xl flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">🎉 All Set!</h2>
          <p className="text-gray-600 mt-2">
            Your wallet is ready for POL Sandbox
          </p>
        </div>
      </div>

      {connectionState.isConnected && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wallet:</span>
                <Badge variant="default">{connectionState.walletType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Address:</span>
                <span className="font-mono text-sm">
                  {connectionState.account?.slice(0, 6)}...{connectionState.account?.slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Network:</span>
                <Badge variant="default">POL Sandbox</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>✓ POL Sandbox network added</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>✓ Default tokens added</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>✓ Ready to use</span>
          </div>
        </div>

        <Button 
          onClick={() => window.open('https://pol-sandbox.com', '_blank')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
        >
          Open POL Sandbox
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {step === 'initial' && renderInitial()}
          {step === 'connecting' && renderConnecting()}
          {step === 'setup' && renderSetup()}
          {step === 'complete' && renderComplete()}
        </div>
      </div>
    </div>
  );
};

export default MobileConnectPage;