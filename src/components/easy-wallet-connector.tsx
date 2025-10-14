'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Smartphone, 
  Monitor, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Shield,
  ArrowRight
} from 'lucide-react';
import { universalWalletConnector, WalletConfig, WalletConnectionState } from '@/lib/universal-wallet-connector';

interface EasyWalletConnectorProps {
  onConnect?: (state: WalletConnectionState) => void;
  onDisconnect?: () => void;
}

const EasyWalletConnector: React.FC<EasyWalletConnectorProps> = ({ onConnect, onDisconnect }) => {
  const [detectedWallets, setDetectedWallets] = useState<string[]>([]);
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInstallDialog, setShowInstallDialog] = useState<string | null>(null);

  // Detect available wallets on mount
  useEffect(() => {
    detectAvailableWallets();
  }, []);

  const detectAvailableWallets = async () => {
    try {
      const wallets = await universalWalletConnector.detectWallet();
      setDetectedWallets(wallets);
    } catch (error) {
      console.error('Failed to detect wallets:', error);
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

  const getWalletConfig = (walletId: string): WalletConfig | undefined => {
    return universalWalletConnector.getSupportedWallets().find(w => w.id === walletId);
  };

  const isMobile = () => {
    return typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const getWalletInstallUrl = (walletId: string): string => {
    const urls: Record<string, string> = {
      metamask: isMobile() ? 'https://metamask.app.link/dapp/' : 'https://metamask.io/download/',
      trustwallet: isMobile() ? 'https://link.trustwallet.com/open_url?coin_id=60&url=' : 'https://trustwallet.com/download/',
      coinbase: isMobile() ? 'https://go.cb-w.com/dapp' : 'https://www.coinbase.com/wallet',
      safepal: isMobile() ? 'safepal://dapp/' : 'https://www.safepal.io/download',
      walletconnect: 'https://walletconnect.com/'
    };
    return urls[walletId] || '#';
  };

  const getWalletIcon = (walletId: string) => {
    const icons: Record<string, string> = {
      metamask: '🦊',
      trustwallet: '🛡️',
      coinbase: '🔵',
      safepal: '🔒',
      walletconnect: '🔗'
    };
    return icons[walletId] || '💼';
  };

  if (connectionState.isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Your wallet is successfully connected to the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Wallet:</span>
              <Badge variant="secondary">
                {getWalletIcon(connectionState.walletType!)} {getWalletConfig(connectionState.walletType!)?.name}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Address:</span>
              <span className="text-sm font-mono">
                {connectionState.account?.slice(0, 6)}...{connectionState.account?.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Balance:</span>
              <span className="text-sm font-medium">{parseFloat(connectionState.balance).toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Chain:</span>
              <Badge variant="outline">Chain ID {connectionState.chainId}</Badge>
            </div>
          </div>
          
          <Button onClick={disconnectWallet} variant="outline" className="w-full">
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Your Wallet
        </CardTitle>
        <CardDescription>
          Choose your preferred wallet to connect to the POL Sandbox platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="detected" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detected" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Connect
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              All Wallets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detected" className="space-y-4">
            <div className="text-center py-4">
              <h3 className="text-lg font-medium mb-2">Detected Wallets</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We found these wallets in your browser. Click to connect instantly.
              </p>
            </div>
            
            {detectedWallets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {detectedWallets.map((walletId) => {
                  const config = getWalletConfig(walletId);
                  if (!config) return null;
                  
                  return (
                    <Button
                      key={walletId}
                      onClick={() => connectWallet(walletId)}
                      disabled={loading === walletId}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      variant="outline"
                    >
                      <span className="text-2xl">{getWalletIcon(walletId)}</span>
                      <span className="font-medium">{config.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {config.extension ? 'Extension' : 'Mobile'}
                      </Badge>
                      {loading === walletId && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Wallets Detected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We couldn't find any installed wallets. Install one to get started!
                </p>
                <Button onClick={() => setShowInstallDialog('metamask')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Install MetaMask
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="text-center py-4">
              <h3 className="text-lg font-medium mb-2">All Supported Wallets</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose from our full list of supported wallets
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {universalWalletConnector.getSupportedWallets().map((wallet) => (
                <Card key={wallet.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <span className="text-3xl">{getWalletIcon(wallet.id)}</span>
                      <div>
                        <h4 className="font-medium">{wallet.name}</h4>
                        <div className="flex gap-1 justify-center mt-1">
                          {wallet.mobile && (
                            <Badge variant="outline" className="text-xs">
                              <Smartphone className="h-3 w-3 mr-1" />
                              Mobile
                            </Badge>
                          )}
                          {wallet.extension && (
                            <Badge variant="outline" className="text-xs">
                              <Monitor className="h-3 w-3 mr-1" />
                              Extension
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {detectedWallets.includes(wallet.id) ? (
                        <Button
                          onClick={() => connectWallet(wallet.id)}
                          disabled={loading === wallet.id}
                          className="w-full"
                          size="sm"
                        >
                          {loading === wallet.id ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setShowInstallDialog(wallet.id)}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Install
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Install Wallet Dialog */}
        <Dialog open={!!showInstallDialog} onOpenChange={() => setShowInstallDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Install {showInstallDialog && getWalletConfig(showInstallDialog)?.name}</DialogTitle>
              <DialogDescription>
                Get started with {showInstallDialog && getWalletConfig(showInstallDialog)?.name} to connect to the platform
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center py-4">
                <span className="text-4xl">{showInstallDialog && getWalletIcon(showInstallDialog)}</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Why {showInstallDialog && getWalletConfig(showInstallDialog)?.name}?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Secure and reliable wallet connection</li>
                  <li>• Support for multiple networks</li>
                  <li>• Easy transaction signing</li>
                  <li>• Enhanced security features</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const url = getWalletInstallUrl(showInstallDialog!);
                    window.open(url, '_blank');
                  }}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Download Now
                </Button>
                <Button variant="outline" onClick={() => setShowInstallDialog(null)}>
                  Later
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EasyWalletConnector;