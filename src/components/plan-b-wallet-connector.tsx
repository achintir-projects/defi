'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Smartphone, 
  Laptop, 
  Link, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  RefreshCw,
  BookOpen,
  Download,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';
import { 
  universalWalletConnector, 
  WalletConfig, 
  WalletConnectionState,
  PortfolioData 
} from '@/lib/universal-wallet-connector';
import NetworkStatusIndicator from '@/components/network-status-indicator';

declare global {
  interface Window {
    ethereum?: any;
    trustwallet?: any;
    _trustwallet?: any;
  }
}

interface PlanBWalletConnectorProps {
  onConnectionSuccess?: (state: WalletConnectionState) => void;
  onConnectionError?: (error: string) => void;
}

export const PlanBWalletConnector: React.FC<PlanBWalletConnectorProps> = ({
  onConnectionSuccess,
  onConnectionError
}) => {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string>('');

  useEffect(() => {
    detectWallets();
    setupNetworkMonitoring();
  }, []);

  const setupNetworkMonitoring = () => {
    if (window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        setConnectionState(prev => ({ ...prev, chainId }));
      };
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          handleDisconnect();
        } else {
          setConnectionState(prev => ({ ...prev, account: accounts[0] }));
        }
      };
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
  };

  const detectWallets = async () => {
    try {
      const detected = await universalWalletConnector.detectWallet();
      setDetectedWallets(detected);
    } catch (error) {
      console.error('Failed to detect wallets:', error);
    }
  };

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true);
    setError('');

    try {
      const state = await universalWalletConnector.connect(walletId);
      setConnectionState(state);
      onConnectionSuccess?.(state);
      setupNetworkMonitoring();
    } catch (error: any) {
      console.error('Connection failed:', error);
      setError(error.message || 'Failed to connect wallet');
      onConnectionError?.(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await universalWalletConnector.disconnect();
      setConnectionState({
        isConnected: false,
        account: null,
        chainId: null,
        walletType: null,
        balance: '0'
      });
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const supportedWallets = universalWalletConnector.getSupportedWallets();

  if (connectionState.isConnected) {
    return (
      <div className="space-y-6">
        <Card className="border-green-500 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Connected to {connectionState.walletType}
            </CardTitle>
            <CardDescription>
              Your wallet is successfully connected to POL Sandbox
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Account</div>
                <div className="font-mono text-sm">
                  {connectionState.account?.slice(0, 6)}...{connectionState.account?.slice(-4)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Chain ID</div>
                <div className="font-semibold">{connectionState.chainId}</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>

        <NetworkStatusIndicator 
          chainId={connectionState.chainId}
          walletType={connectionState.walletType}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Plan B Wallet Connection
          </CardTitle>
          <CardDescription>
            Multiple ways to connect your wallet when QR codes don't work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="direct" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="direct">Direct</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>

            {/* Direct Connection Tab */}
            <TabsContent value="direct" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Laptop className="w-4 h-4" />
                    Desktop Wallet Connection
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect directly with your browser extension wallet
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supportedWallets
                    .filter(wallet => detectedWallets.includes(wallet.id) && wallet.extension)
                    .map(wallet => (
                      <Button
                        key={wallet.id}
                        variant="default"
                        className={`h-16 flex items-center gap-3 justify-start px-4 ${
                          detectedWallets.includes(wallet.id) ? 'border-green-500 bg-green-50' : ''
                        }`}
                        onClick={() => handleConnect(wallet.id)}
                        disabled={isConnecting}
                      >
                        <div className="w-8 h-8 relative">
                          <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{wallet.name.slice(0, 2)}</span>
                          </div>
                          {detectedWallets.includes(wallet.id) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{wallet.name}</div>
                          <div className="text-xs text-muted-foreground">Detected</div>
                        </div>
                      </Button>
                    ))}
                </div>

                {detectedWallets.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No wallet extensions detected. Please install a wallet like MetaMask or Trust Wallet.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            {/* Mobile Connection Tab */}
            <TabsContent value="mobile" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Mobile Wallet Connection
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect using mobile wallet apps with deep links
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {supportedWallets
                    .filter(wallet => wallet.mobile)
                    .map(wallet => (
                      <Card key={wallet.id} className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{wallet.name.slice(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{wallet.name}</div>
                            <div className="text-xs text-muted-foreground">Mobile App</div>
                          </div>
                        </div>
                        
                          <div className="space-y-2">
                          {wallet.deeplink && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                const currentUrl = window.location.href;
                                let deepLinkUrl = '';
                                
                                // Special handling for different wallet formats
                                if (wallet.id === 'trustwallet') {
                                  // Trust Wallet uses URL parameter format
                                  deepLinkUrl = `${wallet.deeplink}${encodeURIComponent(currentUrl)}`;
                                } else if (wallet.id === 'tokenpocket') {
                                  // TokenPocket uses special format
                                  deepLinkUrl = `${wallet.deeplink}${encodeURIComponent(JSON.stringify({ url: currentUrl }))}`;
                                } else {
                                  // Standard format for most wallets
                                  deepLinkUrl = `${wallet.deeplink}${encodeURIComponent(currentUrl)}`;
                                }
                                
                                console.log(`Opening deep link for ${wallet.name}: ${deepLinkUrl}`);
                                
                                // Try to open the deep link
                                window.location.href = deepLinkUrl;
                                
                                // Fallback: if deep link doesn't work, open in a new tab after a short delay
                                setTimeout(() => {
                                  window.open(currentUrl, '_blank');
                                }, 2000);
                              }}
                            >
                              <Smartphone className="w-4 h-4 mr-2" />
                              Open App
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              copyToClipboard(window.location.href, 'url');
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            {copiedText === 'url' ? 'Copied!' : 'Copy URL'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>

                <Alert>
                  <BookOpen className="h-4 w-4" />
                  <AlertDescription>
                    <strong>How to connect on mobile:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Install your preferred wallet app</li>
                      <li>Copy this DApp URL using the button above</li>
                      <li>Paste the URL in your wallet's browser</li>
                      <li>Approve the connection request</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            {/* Manual Connection Tab */}
            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Manual Connection Steps
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Step-by-step guide for manual wallet connection
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Option 1: Browser Extension</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <div className="font-medium">Install Wallet Extension</div>
                        <div className="text-sm text-muted-foreground">
                          Add MetaMask, Trust Wallet, or another supported wallet to your browser
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <div className="font-medium">Create/Import Wallet</div>
                        <div className="text-sm text-muted-foreground">
                          Set up a new wallet or import your existing wallet
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <div className="font-medium">Refresh This Page</div>
                        <div className="text-sm text-muted-foreground">
                          Reload the page to detect your wallet
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <div className="font-medium">Connect Wallet</div>
                        <div className="text-sm text-muted-foreground">
                          Click the connect button and approve in your wallet
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Option 2: Mobile App Browser</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <div className="font-medium">Open Wallet App</div>
                        <div className="text-sm text-muted-foreground">
                          Launch MetaMask, Trust Wallet, or other supported app
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <div className="font-medium">Use In-App Browser</div>
                        <div className="text-sm text-muted-foreground">
                          Navigate to this URL in the wallet's built-in browser
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <div className="font-medium">Approve Connection</div>
                        <div className="text-sm text-muted-foreground">
                          Tap "Connect" when prompted by the DApp
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium mb-2">DApp URL:</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-white p-2 rounded border">
                      {window.location.href}
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(window.location.href, 'dapp')}
                    >
                      {copiedText === 'dapp' ? 'Copied!' : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Help Tab */}
            <TabsContent value="help" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Troubleshooting & Help
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Common issues and solutions for wallet connection
                  </p>
                </div>

                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Wallet not detected?</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Make sure your wallet extension is enabled</li>
                        <li>Try refreshing the page</li>
                        <li>Check if your browser supports wallet extensions</li>
                        <li>Try a different browser (Chrome, Firefox, Brave)</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Connection failed?</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Unlock your wallet and try again</li>
                        <li>Check if you're on the correct network</li>
                        <li>Clear your browser cache and retry</li>
                        <li>Restart your browser and wallet extension</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security tips:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Only connect to trusted DApps</li>
                        <li>Never share your private keys or seed phrase</li>
                        <li>Double-check the connection request details</li>
                        <li>Disconnect when you're done using the DApp</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Still having trouble?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full" asChild>
                        <a href="https://metamask.zendesk.com/hc/en-us" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          MetaMask Support
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="https://support.trustwallet.com/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Trust Wallet Support
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="mailto:support@pol-sandbox.com">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Contact POL Sandbox Support
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanBWalletConnector;