'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ExternalLink,
  QrCode,
  Smartphone,
  Monitor,
  Search,
  Copy,
  Zap,
  ArrowRight,
  Download,
  Globe
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { universalWalletConnector, WalletConnectionState } from '@/lib/universal-wallet-connector';

interface EnhancedWalletConnectProps {
  onConnect?: (state: WalletConnectionState) => void;
  onDisconnect?: () => void;
  showBalance?: boolean;
  compact?: boolean;
}

interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  mobile: boolean;
  extension: boolean;
  installUrl: string;
  deepLink?: string;
  qrSupported?: boolean;
  category: 'popular' | 'mobile' | 'desktop' | 'hardware';
}

const EnhancedWalletConnect: React.FC<EnhancedWalletConnectProps> = ({ 
  onConnect, 
  onDisconnect, 
  showBalance = true,
  compact = false 
}) => {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  });
  const [detectedWallets, setDetectedWallets] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [walletConnectUri, setWalletConnectUri] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const allWallets: WalletInfo[] = [
    // Popular Wallets
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Most popular Ethereum wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://metamask.io/download/',
      deepLink: 'metamask://dapp/',
      qrSupported: true,
      category: 'popular'
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: '🛡️',
      description: 'Secure multi-coin wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://trustwallet.com/download/',
      deepLink: 'trust://dapp/',
      qrSupported: true,
      category: 'popular'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Coinbase crypto wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://www.coinbase.com/wallet',
      deepLink: 'cbwallet://dapp/',
      qrSupported: true,
      category: 'popular'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect any wallet via QR code',
      mobile: true,
      extension: false,
      installUrl: 'https://walletconnect.com/',
      qrSupported: true,
      category: 'popular'
    },

    // Mobile-First Wallets
    {
      id: 'safepal',
      name: 'SafePal',
      icon: '🔒',
      description: 'Secure crypto wallet',
      mobile: true,
      extension: false,
      installUrl: 'https://www.safepal.io/download',
      deepLink: 'safepal://dapp/',
      qrSupported: true,
      category: 'mobile'
    },
    {
      id: 'imtoken',
      name: 'imToken',
      icon: '💎',
      description: 'Professional mobile wallet',
      mobile: true,
      extension: false,
      installUrl: 'https://token.im/download',
      deepLink: 'imtokenv2://dapp/',
      qrSupported: true,
      category: 'mobile'
    },
    {
      id: 'mathwallet',
      name: 'MathWallet',
      icon: '🧮',
      description: 'Multi-chain wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://mathwallet.org/en-us/',
      deepLink: 'mathwallet://dapp/',
      qrSupported: true,
      category: 'mobile'
    },
    {
      id: 'tokenpocket',
      name: 'TokenPocket',
      icon: '🅿️',
      description: 'Universal wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://www.tokenpocket.pro/en/download/app',
      deepLink: 'tpoutside://open?param=',
      qrSupported: true,
      category: 'mobile'
    },
    {
      id: 'zerion',
      name: 'Zerion',
      icon: '🌟',
      description: 'DeFi wallet interface',
      mobile: true,
      extension: true,
      installUrl: 'https://zerion.io/download',
      deepLink: 'zerion://dapp/',
      qrSupported: true,
      category: 'mobile'
    },

    // Desktop Extension Wallets
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Solana ecosystem wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://phantom.app/',
      deepLink: 'phantom://browse/',
      qrSupported: false,
      category: 'desktop'
    },
    {
      id: 'rabby',
      name: 'Rabby',
      icon: '🐰',
      description: 'DeFi-focused wallet',
      mobile: false,
      extension: true,
      installUrl: 'https://rabby.io/',
      qrSupported: false,
      category: 'desktop'
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      icon: '⚡',
      description: 'Exchange wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://www.okx.com/web3',
      deepLink: 'okx://wallet/dapp/',
      qrSupported: true,
      category: 'desktop'
    },
    {
      id: 'binance',
      name: 'Binance Wallet',
      icon: '🟡',
      description: 'Binance Web3 Wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://www.binance.com/en/web3',
      deepLink: 'bnbapp://dapp/',
      qrSupported: true,
      category: 'desktop'
    },
    {
      id: 'cryptocom',
      name: 'Crypto.com DeFi Wallet',
      icon: '💎',
      description: 'DeFi focused wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://crypto.com/defi-wallet',
      deepLink: 'cryptodefimobile://dapp/',
      qrSupported: true,
      category: 'desktop'
    },
    {
      id: 'exodus',
      name: 'Exodus',
      icon: '📱',
      description: 'User-friendly wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://www.exodus.com/download/',
      qrSupported: false,
      category: 'desktop'
    },
    {
      id: 'brave',
      name: 'Brave Wallet',
      icon: '🦁',
      description: 'Built-in Brave wallet',
      mobile: false,
      extension: true,
      installUrl: 'https://brave.com/wallet/',
      qrSupported: false,
      category: 'desktop'
    },
    {
      id: 'xdefi',
      name: 'XDEFI Wallet',
      icon: '❌',
      description: 'Cross-chain wallet',
      mobile: true,
      extension: true,
      installUrl: 'https://www.xdefi.io/',
      deepLink: 'xdefi://dapp/',
      qrSupported: true,
      category: 'desktop'
    },

    // Advanced/Developer Wallets
    {
      id: 'frame',
      name: 'Frame',
      icon: '🖼️',
      description: 'Developer-focused wallet',
      mobile: false,
      extension: true,
      installUrl: 'https://frame.sh/',
      qrSupported: false,
      category: 'desktop'
    },
    {
      id: 'tally',
      name: 'Tally',
      icon: '📊',
      description: 'Governance wallet',
      mobile: false,
      extension: true,
      installUrl: 'https://tally.xyz/',
      qrSupported: false,
      category: 'desktop'
    }
  ];

  useEffect(() => {
    detectWallets();
    checkExistingConnection();
  }, []);

  const detectWallets = async () => {
    try {
      const wallets = await universalWalletConnector.detectWallet();
      setDetectedWallets(wallets);
    } catch (error) {
      console.error('Failed to detect wallets:', error);
    }
  };

  const checkExistingConnection = async () => {
    try {
      const state = universalWalletConnector.getConnectionState();
      if (state.isConnected) {
        setConnectionState(state);
        onConnect?.(state);
      }
    } catch (error) {
      console.error('Failed to check existing connection:', error);
    }
  };

  const connectWallet = async (walletType: string) => {
    setLoading(walletType);
    setError(null);

    try {
      const state = await universalWalletConnector.connect(walletType);
      setConnectionState(state);
      onConnect?.(state);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error(`Failed to connect to ${walletType}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const connectWithQR = async (wallet: WalletInfo) => {
    setSelectedWallet(wallet);
    setShowQR(true);
    
    // Generate WalletConnect URI
    try {
      // This would normally connect to WalletConnect protocol
      const mockUri = `wc:${Math.random().toString(36).substring(2, 15)}@2?relay-protocol=irn&symKey=${Math.random().toString(36).substring(2, 15)}`;
      setWalletConnectUri(mockUri);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setError('Failed to generate QR code');
    }
  };

  const disconnectWallet = async () => {
    try {
      await universalWalletConnector.disconnect();
      setConnectionState({
        isConnected: false,
        account: null,
        chainId: null,
        walletType: null,
        balance: '0'
      });
      onDisconnect?.();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredWallets = allWallets.filter(wallet => 
    wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wallet.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularWallets = filteredWallets.filter(w => w.category === 'popular');
  const mobileWallets = filteredWallets.filter(w => w.category === 'mobile');
  const desktopWallets = filteredWallets.filter(w => w.category === 'desktop');

  if (connectionState.isConnected) {
    if (compact) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {getWalletIcon(connectionState.walletType!)} {connectionState.account?.slice(0, 6)}...{connectionState.account?.slice(-4)}
          </Badge>
          <Button size="sm" variant="ghost" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      );
    }

    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-lg">{getWalletIcon(connectionState.walletType!)}</span>
              </div>
              <div>
                <div className="font-medium">{getWalletName(connectionState.walletType!)}</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {connectionState.account?.slice(0, 6)}...{connectionState.account?.slice(-4)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {showBalance && (
                <div className="text-right">
                  <div className="text-sm font-medium">{parseFloat(connectionState.balance).toFixed(4)} ETH</div>
                  <div className="text-xs text-muted-foreground">Chain {connectionState.chainId}</div>
                </div>
              )}
              <Button size="sm" variant="outline" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showQR && selectedWallet) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Connect {selectedWallet.name}
          </CardTitle>
          <CardDescription>
            Scan this QR code with your mobile wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="h-32 w-32 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">QR Code Placeholder</p>
                <p className="text-xs text-gray-500 mt-1">{walletConnectUri.substring(0, 20)}...</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => copyToClipboard(walletConnectUri)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Connection URI
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(selectedWallet.deepLink, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open {selectedWallet.name}
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setShowQR(false)}
            >
              Back to Wallet Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Your Wallet
          </CardTitle>
          <CardDescription>
            Choose from 20+ supported wallets or scan QR code with mobile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search wallets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Connect for Detected Wallets */}
          {detectedWallets.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-green-500" />
                <h3 className="font-medium">Detected Wallets</h3>
                <Badge variant="secondary" className="text-xs">
                  {detectedWallets.length} found
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {detectedWallets.slice(0, 4).map((walletId) => {
                  const wallet = allWallets.find(w => w.id === walletId);
                  if (!wallet) return null;
                  
                  return (
                    <Button
                      key={walletId}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => connectWallet(walletId)}
                      disabled={loading === walletId}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-lg">{wallet.icon}</span>
                        <div className="text-left">
                          <div className="font-medium">{wallet.name}</div>
                          <div className="text-xs text-muted-foreground">{wallet.description}</div>
                        </div>
                        {loading === walletId && (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-auto" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wallet Categories */}
          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="popular" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="desktop" className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                Desktop
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popular" className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularWallets.map((wallet) => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    loading={loading}
                    onConnect={connectWallet}
                    onConnectQR={connectWithQR}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mobileWallets.map((wallet) => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    loading={loading}
                    onConnect={connectWallet}
                    onConnectQR={connectWithQR}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="desktop" className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {desktopWallets.map((wallet) => (
                  <WalletCard
                    key={wallet.id}
                    wallet={wallet}
                    loading={loading}
                    onConnect={connectWallet}
                    onConnectQR={connectWithQR}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Install Wallet Section */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Download className="h-4 w-4" />
              <h3 className="font-medium">Don't have a wallet?</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                MetaMask
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://trustwallet.com/download/', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Trust Wallet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Coinbase
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface WalletCardProps {
  wallet: WalletInfo;
  loading: string | null;
  onConnect: (walletId: string) => void;
  onConnectQR: (wallet: WalletInfo) => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, loading, onConnect, onConnectQR }) => {
  const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{wallet.icon}</span>
          <div className="flex-1">
            <h4 className="font-medium">{wallet.name}</h4>
            <p className="text-xs text-muted-foreground">{wallet.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {wallet.qrSupported && isMobile && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onConnectQR(wallet)}
            >
              <QrCode className="h-3 w-3 mr-1" />
              QR
            </Button>
          )}
          
          {wallet.extension && !isMobile && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onConnect(wallet.id)}
              disabled={loading === wallet.id}
            >
              {loading === wallet.id ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Connect
                </>
              )}
            </Button>
          )}
          
          {wallet.mobile && isMobile && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => window.open(wallet.deepLink, '_blank')}
            >
              <Smartphone className="h-3 w-3 mr-1" />
              Open
            </Button>
          )}
          
          {!wallet.qrSupported && !wallet.extension && !wallet.mobile && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => window.open(wallet.installUrl, '_blank')}
            >
              <Download className="h-3 w-3 mr-1" />
              Install
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

const getWalletIcon = (walletId: string) => {
  const icons: Record<string, string> = {
    metamask: '🦊',
    trustwallet: '🛡️',
    coinbase: '🔵',
    safepal: '🔒',
    walletconnect: '🔗',
    phantom: '👻',
    rabby: '🐰',
    okx: '⚡',
    binance: '🟡',
    cryptocom: '💎',
    exodus: '📱',
    brave: '🦁',
    xdefi: '❌',
    mathwallet: '🧮',
    tokenpocket: '🅿️',
    imtoken: '💎',
    zerion: '🌟',
    frame: '🖼️',
    tally: '📊'
  };
  return icons[walletId] || '💼';
};

const getWalletName = (walletId: string) => {
  const names: Record<string, string> = {
    metamask: 'MetaMask',
    trustwallet: 'Trust Wallet',
    coinbase: 'Coinbase Wallet',
    safepal: 'SafePal',
    walletconnect: 'WalletConnect',
    phantom: 'Phantom',
    rabby: 'Rabby',
    okx: 'OKX Wallet',
    binance: 'Binance Wallet',
    cryptocom: 'Crypto.com DeFi Wallet',
    exodus: 'Exodus',
    brave: 'Brave Wallet',
    xdefi: 'XDEFI Wallet',
    mathwallet: 'MathWallet',
    tokenpocket: 'TokenPocket',
    imtoken: 'imToken',
    zerion: 'Zerion',
    frame: 'Frame',
    tally: 'Tally'
  };
  return names[walletId] || walletId;
};

export default EnhancedWalletConnect;