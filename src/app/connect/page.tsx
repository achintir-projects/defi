'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  QrCode, 
  Smartphone, 
  Monitor,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Loader2,
  ExternalLink,
  Copy
} from 'lucide-react';
import { universalWalletConnector, WalletConnectionState } from '@/lib/universal-wallet-connector';
import { WalletVerification } from '@/components/wallet-verification';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  mobile: boolean;
  desktop: boolean;
  deepLink?: string;
  installUrl: string;
  priority: number;
}

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

const ConnectPage: React.FC = () => {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  });
  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'connecting' | 'setup' | 'complete'>('select');
  const [isMobile, setIsMobile] = useState(false);
  const [walletConnectUri, setWalletConnectUri] = useState<string>('');

  const walletOptions: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Most popular crypto wallet',
      mobile: true,
      desktop: true,
      deepLink: 'metamask://dapp/',
      installUrl: 'https://metamask.io/download/',
      priority: 1
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Secure mobile wallet',
      mobile: true,
      desktop: true,
      deepLink: 'https://link.trustwallet.com/open_url?coin_id=60&url=',
      installUrl: 'https://trustwallet.com/download/',
      priority: 2
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Easy to use wallet',
      mobile: true,
      desktop: true,
      deepLink: 'cbwallet://dapp/',
      installUrl: 'https://www.coinbase.com/wallet',
      priority: 3
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect any wallet',
      mobile: true,
      desktop: false,
      deepLink: 'wc:',
      installUrl: 'https://walletconnect.com/',
      priority: 4
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Multi-chain wallet',
      mobile: true,
      desktop: true,
      deepLink: 'phantom://browse/',
      installUrl: 'https://phantom.app/',
      priority: 5
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      icon: '⚡',
      description: 'Exchange wallet',
      mobile: true,
      desktop: true,
      deepLink: 'okx://wallet/dapp/',
      installUrl: 'https://www.okx.com/web3',
      priority: 6
    },
    {
      id: 'bybit',
      name: 'Bybit Wallet',
      icon: '🐯',
      description: 'Trading platform wallet',
      mobile: true,
      desktop: true,
      deepLink: 'bybitdapp://browser/',
      installUrl: 'https://www.bybit.com/en/web3',
      priority: 7
    }
  ];

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      const userAgent = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(userAgent);
    };
    checkMobile();

    // Parse URL parameters for QR code data
    parseUrlParameters();

    // Check for existing connection
    checkExistingConnection();

    // Auto-detect wallets
    detectWallets();
  }, []);

  const parseUrlParameters = () => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const wallet = urlParams.get('wallet');
    const auto = urlParams.get('auto');
    const data = urlParams.get('data');
    
    if (wallet && auto === 'true' && data) {
      try {
        const connectionData = JSON.parse(decodeURIComponent(data));
        console.log('Received connection data from QR code:', connectionData);
        
        // Auto-connect with the provided data
        autoConnectWithQRData(connectionData);
      } catch (error) {
        console.error('Failed to parse QR code data:', error);
        setError('Invalid QR code data. Please try scanning again.');
      }
    }
  };

  const autoConnectWithQRData = async (connectionData: any) => {
    const walletId = connectionData.wallet;
    const wallet = walletOptions.find(w => w.id === walletId);
    
    if (!wallet) {
      setError('Unsupported wallet specified in QR code');
      return;
    }

    setSelectedWallet(wallet);
    setStep('connecting');
    setLoading(wallet.id);
    setError(null);
    setSuccess(null);

    try {
      // For mobile, try deep link first
      if (isMobile && wallet.deepLink) {
        if (wallet.id === 'walletconnect') {
          const uri = await generateWalletConnectUri();
          setWalletConnectUri(uri);
          window.open(wallet.deepLink + uri, '_blank');
        } else if (wallet.id === 'trustwallet') {
          // Special handling for Trust Wallet
          const baseUrl = window.location.origin;
          const qrData = {
            wallet: wallet.id,
            auto: true,
            network: POL_NETWORK_CONFIG,
            tokens: DEFAULT_TOKENS.map(token => ({
              ...token,
              balance: token.symbol === 'POL' ? '500000000000000000000' : 
                       token.symbol === 'USDT' ? '1000000000' : '500000000',
              price: token.symbol === 'POL' ? 750.00 : 1.00
            }))
          };
          const encodedUrl = encodeURIComponent(baseUrl + '?data=' + encodeURIComponent(JSON.stringify(qrData)));
          window.open(wallet.deepLink + encodedUrl, '_blank');
        } else {
          window.open(wallet.deepLink, '_blank');
        }
        
        // Wait a moment for the wallet to open
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Try to connect via browser extension
      const state = await universalWalletConnector.connect(wallet.id);
      setConnectionState(state);
      
      // Auto-setup network and tokens with QR data
      await setupWalletWithQRData(state, connectionData);
      
    } catch (error) {
      console.error('Auto-connection failed:', error);
      setError(`Failed to auto-connect to ${wallet.name}. Please try connecting manually.`);
      
      // Fallback: redirect to installation
      if (!isMobile) {
        setTimeout(() => {
          window.open(wallet.installUrl, '_blank');
        }, 2000);
      }
    } finally {
      setLoading(null);
    }
  };

  const detectWallets = async () => {
    try {
      const detected = await universalWalletConnector.detectWallet();
      console.log('Detected wallets:', detected);
    } catch (error) {
      console.error('Failed to detect wallets:', error);
    }
  };

  const checkExistingConnection = async () => {
    try {
      const state = universalWalletConnector.getConnectionState();
      if (state.isConnected) {
        setConnectionState(state);
        setStep('complete');
        setSuccess('Wallet already connected to POL Sandbox!');
      }
    } catch (error) {
      console.error('Failed to check existing connection:', error);
    }
  };

  const connectWallet = async (wallet: WalletOption) => {
    setSelectedWallet(wallet);
    setStep('connecting');
    setLoading(wallet.id);
    setError(null);
    setSuccess(null);

    try {
      // For mobile, try deep link first
      if (isMobile && wallet.deepLink) {
        if (wallet.id === 'walletconnect') {
          // Generate WalletConnect URI
          const uri = await generateWalletConnectUri();
          setWalletConnectUri(uri);
          window.open(wallet.deepLink + uri, '_blank');
        } else if (wallet.id === 'trustwallet') {
          // Special handling for Trust Wallet
          const baseUrl = window.location.origin;
          const qrData = {
            wallet: wallet.id,
            auto: true,
            network: POL_NETWORK_CONFIG,
            tokens: DEFAULT_TOKENS.map(token => ({
              ...token,
              balance: token.symbol === 'POL' ? '500000000000000000000' : 
                       token.symbol === 'USDT' ? '1000000000' : '500000000',
              price: token.symbol === 'POL' ? 750.00 : 1.00
            }))
          };
          const encodedUrl = encodeURIComponent(baseUrl + '?data=' + encodeURIComponent(JSON.stringify(qrData)));
          window.open(wallet.deepLink + encodedUrl, '_blank');
        } else {
          window.open(wallet.deepLink, '_blank');
        }
        
        // Wait a moment for the wallet to open
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Try to connect via browser extension
      const state = await universalWalletConnector.connect(wallet.id);
      setConnectionState(state);
      
      // Auto-setup network and tokens
      await setupWallet(state);
      
    } catch (error) {
      console.error('Connection failed:', error);
      setError(`Failed to connect to ${wallet.name}. Please make sure it's installed and try again.`);
      
      // Fallback: redirect to installation
      if (!isMobile) {
        setTimeout(() => {
          window.open(wallet.installUrl, '_blank');
        }, 2000);
      }
    } finally {
      setLoading(null);
    }
  };

  const generateWalletConnectUri = async (): Promise<string> => {
    // Generate a mock WalletConnect URI for demo
    const projectId = 'your-project-id';
    const metadata = {
      name: 'POL Sandbox',
      description: 'Connect to POL Sandbox Network',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      icons: ['https://pol-sandbox.com/icon.png']
    };
    
    // In production, this would use the actual WalletConnect protocol
    return `wc:${Math.random().toString(36).substring(2, 15)}@2?relay-protocol=irn&symKey=${Math.random().toString(36).substring(2, 15)}`;
  };

  const setupWalletWithQRData = async (state: WalletConnectionState, connectionData: any) => {
    setStep('setup');
    setSuccess('Wallet connected! Configuring POL Sandbox network with preset data...');

    try {
      // Add POL Sandbox network from QR data or default
      const networkConfig = connectionData.network || POL_NETWORK_CONFIG;
      await addCustomNetwork(networkConfig);
      
      // Add tokens from QR data with preset balances
      if (connectionData.tokens && connectionData.tokens.length > 0) {
        await addTokensWithBalances(connectionData.tokens);
      } else {
        await addDefaultTokens();
      }
      
      // Switch to POL network
      await switchToCustomNetwork(networkConfig);
      
      // Store the preset balances and prices in local storage for the app to use
      if (connectionData.tokens) {
        localStorage.setItem('pol-sandbox-tokens', JSON.stringify(connectionData.tokens));
      }
      
      setSuccess('🎉 Successfully connected to POL Sandbox! Network and tokens with preset balances have been configured.');
      setStep('complete');
      
    } catch (error) {
      console.error('Setup failed:', error);
      setError('Connected wallet, but failed to setup network. Please add POL Sandbox manually.');
      setStep('complete');
    }
  };

  const setupWallet = async (state: WalletConnectionState) => {
    setStep('setup');
    setSuccess('Wallet connected! Setting up POL Sandbox network...');

    try {
      // Add POL Sandbox network
      await addPOLNetwork();
      
      // Add default tokens
      await addDefaultTokens();
      
      // Switch to POL network
      await switchToPOLNetwork();
      
      setSuccess('🎉 Successfully connected to POL Sandbox! Network and tokens have been added automatically.');
      setStep('complete');
      
    } catch (error) {
      console.error('Setup failed:', error);
      setError('Connected wallet, but failed to setup network. Please add POL Sandbox manually.');
      setStep('complete');
    }
  };

  const addCustomNetwork = async (networkConfig: any) => {
    try {
      // Check if wallet has ethereum provider
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig]
        });
      }
    } catch (error) {
      console.error('Failed to add custom network:', error);
      throw error;
    }
  };

  const addPOLNetwork = async () => {
    try {
      // Check if wallet has ethereum provider
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [POL_NETWORK_CONFIG]
        });
      }
    } catch (error) {
      console.error('Failed to add network:', error);
      throw error;
    }
  };

  const switchToCustomNetwork = async (networkConfig: any) => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkConfig.chainId }]
        });
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      // If network doesn't exist, add it first
      if (error.code === 4902) {
        await addCustomNetwork(networkConfig);
        await switchToCustomNetwork(networkConfig);
      }
    }
  };

  const switchToPOLNetwork = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: POL_NETWORK_CONFIG.chainId }]
        });
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      // If network doesn't exist, add it first
      if (error.code === 4902) {
        await addPOLNetwork();
        await switchToPOLNetwork();
      }
    }
  };

  const addTokensWithBalances = async (tokens: any[]) => {
    try {
      if (window.ethereum) {
        for (const token of tokens) {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: token.address,
                symbol: token.symbol,
                decimals: token.decimals,
                image: token.logoURI
              }
            }
          });
          
          // Store the preset balance and price for this wallet
          const walletAddress = connectionState.account;
          if (walletAddress) {
            await storeTokenBalance(walletAddress, token);
          }
        }
      }
    } catch (error) {
      console.error('Failed to add tokens with balances:', error);
      // Don't throw error for tokens, as network setup is more important
    }
  };

  const addDefaultTokens = async () => {
    try {
      if (window.ethereum) {
        for (const token of DEFAULT_TOKENS) {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: token.address,
                symbol: token.symbol,
                decimals: token.decimals,
                image: token.logoURI
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to add tokens:', error);
      // Don't throw error for tokens, as network setup is more important
    }
  };

  const storeTokenBalance = async (walletAddress: string, token: any) => {
    try {
      // Store the preset balance and price via API
      await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          symbol: token.symbol,
          chain: 'POL Sandbox',
          balance: token.balance,
          price: token.price,
          action: 'add',
          preset: true // Mark as preset from QR code
        })
      });
    } catch (error) {
      console.error('Failed to store token balance:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderWalletSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Connect to POL Sandbox</h1>
        <p className="text-muted-foreground">
          Choose your wallet to automatically connect to POL Sandbox network
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {walletOptions.map((wallet) => (
          <Card 
            key={wallet.id} 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => connectWallet(wallet)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{wallet.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{wallet.name}</h3>
                  <p className="text-sm text-muted-foreground">{wallet.description}</p>
                  <div className="flex gap-1 mt-2">
                    {wallet.mobile && <Badge variant="outline" className="text-xs">Mobile</Badge>}
                    {wallet.desktop && <Badge variant="outline" className="text-xs">Desktop</Badge>}
                  </div>
                </div>
                {loading === wallet.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Automatic Setup:</strong> We'll automatically add the POL Sandbox network and default tokens (POL, USDC, USDT) to your wallet.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderConnecting = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          {selectedWallet && <span className="text-3xl">{selectedWallet.icon}</span>}
        </div>
        <div>
          <h2 className="text-2xl font-bold">Connecting to {selectedWallet?.name}</h2>
          <p className="text-muted-foreground">
            {isMobile ? 'Opening your wallet app...' : 'Please approve the connection in your wallet'}
          </p>
        </div>
        <Loader2 className="h-8 w-8 mx-auto animate-spin" />
      </div>

      {isMobile && selectedWallet?.deepLink && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            If your wallet didn't open automatically, 
            <Button 
              variant="link" 
              className="p-0 h-auto"
              onClick={() => window.open(selectedWallet.deepLink, '_blank')}
            >
              click here to open {selectedWallet.name}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderSetup = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Setting up POL Sandbox</h2>
          <p className="text-muted-foreground">
            Automatically configuring network and tokens...
          </p>
        </div>
        <Loader2 className="h-8 w-8 mx-auto animate-spin" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Wallet connected</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Adding POL Sandbox network...</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
          <span>Adding default tokens...</span>
        </div>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">🎉 Connected Successfully!</h2>
          <p className="text-muted-foreground">
            Your wallet is now connected to POL Sandbox
          </p>
        </div>
      </div>

      {/* Wallet Verification */}
      <WalletVerification 
        connectionState={connectionState}
        onRetry={() => setStep('select')}
      />

      {connectionState.isConnected && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Wallet:</span>
                <span className="font-medium">{selectedWallet?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address:</span>
                <span className="font-mono text-sm">
                  {connectionState.account?.slice(0, 6)}...{connectionState.account?.slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network:</span>
                <Badge variant="default">POL Sandbox</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>POL Sandbox network added</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Default tokens added (POL, USDC, USDT)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Ready to use POL Sandbox</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button 
            onClick={() => window.open('https://pol-sandbox.com', '_blank')}
            className="flex-1 max-w-xs"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open POL Sandbox
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setStep('select');
              setSelectedWallet(null);
              setSuccess(null);
            }}
          >
            Connect Another Wallet
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {step === 'select' && renderWalletSelection()}
          {step === 'connecting' && renderConnecting()}
          {step === 'setup' && renderSetup()}
          {step === 'complete' && renderComplete()}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Secure connection • Automatic setup • No configuration needed</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;