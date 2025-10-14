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
  QrCode,
  ExternalLink,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { enhancedWalletConnector, ENHANCED_WALLET_CONFIGS } from '@/lib/enhanced-wallet-connector';

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
  config: any;
  detected: boolean;
}

const SuperEnhancedMobileConnectPage: React.FC = () => {
  const [connectionState, setConnectionState] = useState<any>({
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
  const [detectedWallets, setDetectedWallets] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  const mobileWallets: MobileWalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      config: ENHANCED_WALLET_CONFIGS.metamask,
      detected: detectedWallets.has('metamask')
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: '🛡️',
      config: ENHANCED_WALLET_CONFIGS.trustwallet,
      detected: detectedWallets.has('trustwallet')
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      icon: '🔵',
      config: ENHANCED_WALLET_CONFIGS.coinbase,
      detected: detectedWallets.has('coinbase')
    }
  ];

  useEffect(() => {
    // Check if mobile
    setIsMobile(enhancedWalletConnector.isMobile());
    
    // Start wallet detection
    detectWallets();
    
    // Check URL parameters for auto-connect
    const urlParams = new URLSearchParams(window.location.search);
    const walletParam = urlParams.get('wallet');
    const autoParam = urlParams.get('auto');
    
    if (walletParam && autoParam === 'true') {
      const wallet = mobileWallets.find(w => w.id === walletParam);
      if (wallet) {
        setTimeout(() => connectWallet(wallet), 1000);
      }
    }

    // Check existing connection
    checkExistingConnection();
    
    // Set up continuous detection
    const interval = setInterval(detectWallets, 2000);
    return () => clearInterval(interval);
  }, [detectedWallets]);

  const detectWallets = async () => {
    try {
      const detected = await enhancedWalletConnector.detectAllWallets();
      setDetectedWallets(new Set(detected));
    } catch (error) {
      console.error('Detection failed:', error);
    }
  };

  const checkExistingConnection = async () => {
    try {
      for (const wallet of mobileWallets) {
        const status = enhancedWalletConnector.getConnectionStatus(wallet.id);
        if (status.isConnected && status.account) {
          setConnectionState({
            isConnected: true,
            account: status.account,
            chainId: '0x15bca',
            walletType: wallet.name,
            balance: '0'
          });
          setStep('complete');
          setSuccess('Already connected to POL Sandbox!');
          return;
        }
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
      console.log(`🚀 Starting enhanced connection to ${wallet.name}...`);
      
      if (wallet.detected && !isMobile) {
        // Desktop connection
        const state = await enhancedWalletConnector.connectWallet(wallet.id);
        setConnectionState(state);
        await setupWallet(state, wallet.id);
      } else {
        // Mobile connection - try deep link
        const currentUrl = window.location.href;
        
        setSuccess(`Opening ${wallet.name}...`);
        
        // Try to open mobile wallet
        enhancedWalletConnector.openMobileWallet(wallet.id, currentUrl);
        
        // Wait for connection
        setTimeout(async () => {
          try {
            const state = await enhancedWalletConnector.connectWallet(wallet.id);
            setConnectionState(state);
            await setupWallet(state, wallet.id);
          } catch (error) {
            console.error('Mobile connection failed:', error);
            
            // Fallback to installation
            setSuccess(`Opening ${wallet.name} installation...`);
            window.open(wallet.config.installUrl + encodeURIComponent(currentUrl), '_blank');
            
            setError(`Please install ${wallet.name} first`);
            setStep('initial');
          }
          setLoading(null);
        }, 5000);
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setError(error.message || `Failed to connect to ${wallet.name}`);
      setLoading(null);
      setStep('initial');
    }
  };

  const setupWallet = async (state: any, walletId: string) => {
    setStep('setup');
    setSuccess('Setting up POL Sandbox...');

    try {
      // Add network
      setSuccess('Adding POL Sandbox network...');
      const networkAdded = await enhancedWalletConnector.setupPOLNetwork(walletId);
      
      if (networkAdded) {
        setSuccess('Switching to POL Sandbox...');
        
        // Add tokens
        setSuccess('Adding default tokens...');
        const tokenResults = await enhancedWalletConnector.addTokens(walletId, DEFAULT_TOKENS);
        
        const successCount = tokenResults.filter(Boolean).length;
        setSuccess(`✅ Added ${successCount}/${DEFAULT_TOKENS.length} tokens!`);
        
        setSuccess('🎉 Connected to POL Sandbox!');
        setStep('complete');
      } else {
        throw new Error('Failed to setup network');
      }
    } catch (error: any) {
      console.error('Setup failed:', error);
      setError(error.message || 'Setup failed. Please add network manually.');
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
            Enhanced mobile support • Better compatibility
          </p>
        </div>
      </div>

      {/* Detection Status */}
      <Alert className={detectedWallets.size > 0 ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
        {detectedWallets.size > 0 ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-yellow-600" />
        )}
        <AlertDescription>
          {detectedWallets.size > 0 
            ? `Detected ${detectedWallets.size} wallet(s): ${Array.from(detectedWallets).join(', ')}`
            : 'No wallets detected. Make sure your wallet app is installed.'
          }
        </AlertDescription>
      </Alert>

      {/* Wallet Options */}
      <div className="grid grid-cols-1 gap-3">
        {mobileWallets.map((wallet) => (
          <Card 
            key={wallet.id}
            className={`cursor-pointer hover:shadow-lg transition-all ${
              wallet.detected ? 'border-green-500 bg-green-50' : ''
            }`}
            onClick={() => connectWallet(wallet)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${wallet.config.color} rounded-xl flex items-center justify-center`}>
                    <span className="text-2xl">{wallet.icon}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {wallet.detected && (
                      <Badge variant="default" className="text-xs">
                        <Wifi className="w-3 h-3 mr-1" />
                        Detected
                      </Badge>
                    )}
                    {loading === wallet.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">{wallet.name}</h3>
                  <p className="text-xs text-gray-500">
                    {wallet.detected 
                      ? 'Tap to connect' 
                      : isMobile 
                        ? 'Tap to open app' 
                        : 'Tap to install'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile Specific Instructions */}
      {isMobile && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            <strong>Mobile Users:</strong> If a wallet doesn't open automatically, 
            make sure the app is installed and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Features */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Zap className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Enhanced Detection</p>
            <p className="text-xs text-gray-500">Better wallet compatibility</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Automatic Setup</p>
            <p className="text-xs text-gray-500">Network and tokens configured</p>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Having trouble?</strong> Try refreshing the page or installing the latest version of your wallet app.
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

      {isMobile && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            If the wallet doesn't open, please check that the app is installed and try again.
          </AlertDescription>
        </Alert>
      )}
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
          <ExternalLink className="w-4 h-4 mr-2" />
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

export default SuperEnhancedMobileConnectPage;