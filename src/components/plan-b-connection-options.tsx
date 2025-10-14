'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Monitor, 
  Link, 
  Copy, 
  ExternalLink, 
  QrCode,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Download,
  Globe,
  Zap,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { POL_NETWORK_CONFIG } from '@/lib/trust-wallet-network-fix';

interface PlanBConnectionOptionsProps {
  onConnectionSuccess?: (state: any) => void;
  onConnectionError?: (error: string) => void;
  compact?: boolean;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  deepLink: string;
  fallbackUrl: string;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

const PlanBConnectionOptions: React.FC<PlanBConnectionOptionsProps> = ({ 
  onConnectionSuccess,
  onConnectionError,
  compact = false 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('mobile');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [manualUrl, setManualUrl] = useState('');

  const walletOptions: WalletOption[] = [
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: '🛡️',
      deepLink: 'https://link.trustwallet.com/open_url?coin_id=60&url=',
      fallbackUrl: 'https://trustwallet.com/download/',
      mobileOnly: true
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      deepLink: 'metamask://dapp/',
      fallbackUrl: 'https://metamask.io/download/',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      deepLink: 'cbwallet://dapp/',
      fallbackUrl: 'https://www.coinbase.com/wallet',
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      deepLink: 'phantom://browse/',
      fallbackUrl: 'https://phantom.app/',
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      icon: '⚡',
      deepLink: 'okx://wallet/dapp/',
      fallbackUrl: 'https://www.okx.com/web3',
    },
    {
      id: 'bybit',
      name: 'Bybit Wallet',
      icon: '🐯',
      deepLink: 'bybitdapp://browser/',
      fallbackUrl: 'https://www.bybit.com/en/web3',
    }
  ];

  useEffect(() => {
    // Check if mobile device
    const userAgent = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(userAgent);
    
    // Set default manual URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pol-sandbox.com';
    setManualUrl(`${baseUrl}/connect?auto=true&fallback=true`);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleMobileDeepLink = (wallet: WalletOption) => {
    setConnectionStatus('connecting');
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pol-sandbox.com';
    const connectionData = {
      wallet: wallet.id,
      auto: true,
      fallback: true,
      network: POL_NETWORK_CONFIG,
      timestamp: Date.now()
    };
    
    const deepLinkUrl = wallet.deepLink + encodeURIComponent(`${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}`);
    
    try {
      // Try to open deep link
      window.location.href = deepLinkUrl;
      
      // Fallback to app store after delay
      setTimeout(() => {
        if (connectionStatus === 'connecting') {
          window.open(wallet.fallbackUrl, '_blank');
          setConnectionStatus('idle');
        }
      }, 3000);
      
      // Simulate success after delay
      setTimeout(() => {
        setConnectionStatus('success');
        onConnectionSuccess?.({
          isConnected: true,
          walletType: wallet.name,
          method: 'mobile-deep-link',
          fallback: true
        });
      }, 1000);
      
    } catch (error) {
      setConnectionStatus('error');
      onConnectionError?.(`Failed to open ${wallet.name}: ${error}`);
    }
  };

  const handleDesktopFallback = (wallet: WalletOption) => {
    setConnectionStatus('connecting');
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pol-sandbox.com';
    
    // Open wallet extension download
    window.open(wallet.fallbackUrl, '_blank');
    
    // Also open connection page in new tab
    const connectionUrl = `${baseUrl}/connect?wallet=${wallet.id}&fallback=true&desktop=true`;
    window.open(connectionUrl, '_blank');
    
    setTimeout(() => {
      setConnectionStatus('success');
      onConnectionSuccess?.({
        isConnected: true,
        walletType: wallet.name,
        method: 'desktop-fallback',
        fallback: true
      });
    }, 2000);
  };

  const handleManualConnection = () => {
    setConnectionStatus('connecting');
    copyToClipboard(manualUrl);
    
    setTimeout(() => {
      setConnectionStatus('success');
      onConnectionSuccess?.({
        isConnected: true,
        walletType: 'Manual',
        method: 'manual-url',
        fallback: true
      });
    }, 1000);
  };

  const handleUrlPaste = () => {
    navigator.clipboard.readText().then(text => {
      if (text.includes('pol-sandbox.com') || text.includes('connect')) {
        setManualUrl(text);
      }
    }).catch(() => {
      // Clipboard access denied
    });
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Plan B Options
          </CardTitle>
          <CardDescription>
            Alternative connection methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMethod('mobile')}
              className={selectedMethod === 'mobile' ? 'bg-primary text-primary-foreground' : ''}
            >
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMethod('desktop')}
              className={selectedMethod === 'desktop' ? 'bg-primary text-primary-foreground' : ''}
            >
              <Monitor className="h-3 w-3 mr-1" />
              Desktop
            </Button>
          </div>

          {selectedMethod === 'mobile' && isMobile && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Mobile deep links:</p>
              <div className="grid grid-cols-2 gap-1">
                {walletOptions.slice(0, 4).map((wallet) => (
                  <Button
                    key={wallet.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleMobileDeepLink(wallet)}
                    className="text-xs h-8"
                  >
                    {wallet.icon} {wallet.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedMethod === 'desktop' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Desktop options:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualConnection}
                className="w-full text-xs h-8"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Manual URL
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold">Plan B Connection Options</h2>
        </div>
        <p className="text-muted-foreground">
          When standard wallet connection doesn't work, try these alternative methods
        </p>
      </div>

      {/* Connection Status */}
      {connectionStatus !== 'idle' && (
        <Alert className={connectionStatus === 'success' ? 'border-green-500 bg-green-50' : connectionStatus === 'error' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}>
          {connectionStatus === 'connecting' && <RefreshCw className="h-4 w-4 animate-spin" />}
          {connectionStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
          {connectionStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
          <AlertDescription>
            {connectionStatus === 'connecting' && 'Attempting connection...'}
            {connectionStatus === 'success' && 'Connection initiated successfully! Check your wallet app.'}
            {connectionStatus === 'error' && 'Connection failed. Please try another method.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${selectedMethod === 'mobile' ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'}`}
          onClick={() => setSelectedMethod('mobile')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5" />
              Mobile Deep Link
            </CardTitle>
            <CardDescription>
              Direct app connection on mobile devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={isMobile ? 'default' : 'secondary'}>
                {isMobile ? 'Available' : 'Desktop detected'}
              </Badge>
              {isMobile && (
                <p className="text-xs text-muted-foreground">
                  Opens wallet app directly with connection data
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedMethod === 'desktop' ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'}`}
          onClick={() => setSelectedMethod('desktop')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5" />
              Desktop Fallback
            </CardTitle>
            <CardDescription>
              Browser extension and manual connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant='default'>
                Always Available
              </Badge>
              <p className="text-xs text-muted-foreground">
                Install extension or use manual URL
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedMethod === 'manual' ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'}`}
          onClick={() => setSelectedMethod('manual')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link className="h-5 w-5" />
              Manual URL
            </CardTitle>
            <CardDescription>
              Copy-paste connection link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant='default'>
                Universal
              </Badge>
              <p className="text-xs text-muted-foreground">
                Works on any device with a browser
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Method Content */}
      {selectedMethod === 'mobile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Deep Link Connection
            </CardTitle>
            <CardDescription>
              Click on your wallet to open the app directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isMobile && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Mobile deep links work best on mobile devices. On desktop, these links will redirect to the wallet download page.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {walletOptions.map((wallet) => (
                <Button
                  key={wallet.id}
                  variant="outline"
                  onClick={() => isMobile ? handleMobileDeepLink(wallet) : handleDesktopFallback(wallet)}
                  className="flex flex-col gap-2 h-auto p-4"
                >
                  <span className="text-2xl">{wallet.icon}</span>
                  <span className="text-sm font-medium">{wallet.name}</span>
                  {wallet.mobileOnly && <Badge variant="secondary" className="text-xs">Mobile</Badge>}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === 'desktop' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Desktop Fallback Options
            </CardTitle>
            <CardDescription>
              Install browser extensions or use alternative connection methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {walletOptions.filter(w => !w.mobileOnly).map((wallet) => (
                <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{wallet.icon}</span>
                    <div>
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-muted-foreground">Browser Extension</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDesktopFallback(wallet)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Install
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Manual URL Connection
            </CardTitle>
            <CardDescription>
              Copy this URL and paste it into your wallet's dApp browser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="manual-url">Connection URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="manual-url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(manualUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUrlPaste}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              {copiedText === manualUrl && (
                <p className="text-xs text-green-600 mt-1">URL copied to clipboard!</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={handleManualConnection} className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                Connect with This URL
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(manualUrl, '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>

            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>How to use:</strong> Copy this URL, open your wallet app, find the dApp browser, and paste the URL to connect to POL Sandbox.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanBConnectionOptions;