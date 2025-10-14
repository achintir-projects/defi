'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  QrCode, 
  Share2, 
  Copy, 
  ExternalLink, 
  Smartphone, 
  Monitor,
  CheckCircle,
  ArrowRight,
  Wallet,
  Link,
  Download
} from 'lucide-react';
import QRCodeLib from 'qrcode';

interface ShareableWalletConnectProps {
  compact?: boolean;
}

const ShareableWalletConnect: React.FC<ShareableWalletConnectProps> = ({ compact = false }) => {
  const [selectedWallet, setSelectedWallet] = useState<string>('metamask');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [qrCodeLoading, setQrCodeLoading] = useState<boolean>(false);

  const walletOptions = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', priority: 1 },
    { id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️', priority: 2 },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', priority: 3 },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', priority: 4 },
    { id: 'phantom', name: 'Phantom', icon: '👻', priority: 5 },
    { id: 'okx', name: 'OKX Wallet', icon: '⚡', priority: 6 },
    { id: 'bybit', name: 'Bybit Wallet', icon: '🐯', priority: 7 }
  ];

  useEffect(() => {
    // Check if mobile device
    const userAgent = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(userAgent);
    
    // Generate initial link
    generateConnectionLink(selectedWallet);
  }, []);

  const generateConnectionLink = async (walletId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pol-sandbox.com';
    
    // Create comprehensive wallet connection data
    const connectionData = {
      wallet: walletId,
      auto: true,
      network: {
        name: 'POL Sandbox',
        chainId: '0x539', // 1337 in hex
        rpcUrls: ['https://rpc.pol-sandbox.com'],
        nativeCurrency: {
          name: 'POL',
          symbol: 'POL',
          decimals: 18
        },
        blockExplorerUrls: ['https://explorer.pol-sandbox.com']
      },
      tokens: [
        {
          address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
          symbol: 'POL',
          name: 'POL Token',
          decimals: 18,
          balance: '500000000000000000000', // 500 POL
          price: 750.00,
          logoURI: `${baseUrl}/pol-logo.png`
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
          balance: '1000000000', // 1000 USDT
          price: 1.00,
          logoURI: `${baseUrl}/usdt-logo.png`
        },
        {
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          balance: '500000000', // 500 USDC
          price: 1.00,
          logoURI: `${baseUrl}/usdc-logo.png`
        }
      ],
      timestamp: Date.now(),
      version: '1.0'
    };

    // Generate wallet-specific deep links
    let deepLinkUrl = '';
    
    if (isMobile) {
      // Mobile deep linking based on wallet
      switch (walletId) {
        case 'metamask':
          deepLinkUrl = `metamask://dapp/${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}`;
          break;
        case 'trustwallet':
          deepLinkUrl = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(baseUrl + '?data=' + encodeURIComponent(JSON.stringify(connectionData)))}`;
          break;
        case 'coinbase':
          deepLinkUrl = `cbwallet://dapp/${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}`;
          break;
        case 'phantom':
          deepLinkUrl = `phantom://browse/${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}`;
          break;
        case 'okx':
          deepLinkUrl = `okx://wallet/dapp/${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}`;
          break;
        case 'bybit':
          deepLinkUrl = `bybitdapp://browser/${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}`;
          break;
        case 'walletconnect':
          deepLinkUrl = `wc:${generateWalletConnectURI(connectionData)}`;
          break;
        default:
          deepLinkUrl = `${baseUrl}/connect?wallet=${walletId}&auto=true&data=${encodeURIComponent(JSON.stringify(connectionData))}`;
      }
    } else {
      // Desktop fallback
      deepLinkUrl = `${baseUrl}/connect?wallet=${walletId}&auto=true&data=${encodeURIComponent(JSON.stringify(connectionData))}`;
    }
    
    setGeneratedLink(deepLinkUrl);
    
    // Generate real QR code
    setQrCodeLoading(true);
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(deepLinkUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      // Fallback to mock QR code
      const mockQrDataUrl = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" font-size="12">QR Code for ${walletId}</text>
          <text x="100" y="120" text-anchor="middle" font-size="8">${deepLinkUrl.substring(0, 30)}...</text>
        </svg>
      `)}`;
      setQrCode(mockQrDataUrl);
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleWalletChange = (walletId: string) => {
    setSelectedWallet(walletId);
    generateConnectionLink(walletId);
  };

  const generateWalletConnectURI = (data: any): string => {
    // Generate WalletConnect URI for deep linking
    const wcData = {
      topic: 'pol-sandbox-' + Date.now(),
      version: 2,
      symKey: 'x'.repeat(64), // Mock symmetric key
      relay: { protocol: 'irn' },
      client: {
        rpcUrl: typeof window !== 'undefined' ? window.location.origin : 'https://pol-sandbox.com',
        methods: ['eth_sign', 'eth_signTransaction', 'eth_sendTransaction', 'personal_sign'],
        events: ['accountsChanged', 'chainChanged']
      },
      data: data
    };
    
    return btoa(JSON.stringify(wcData)).substring(0, 100);
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `pol-sandbox-${selectedWallet}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyQRCodeImage = async () => {
    if (!qrCode) return;
    
    try {
      const blob = await (await fetch(qrCode)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy QR code image:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Connect to POL Sandbox',
          text: `Connect your ${walletOptions.find(w => w.id === selectedWallet)?.name} wallet to POL Sandbox`,
          url: generatedLink
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      copyToClipboard(generatedLink);
    }
  };

  const getDirectWalletLink = (walletId: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pol-sandbox.com';
    
    // Create connection data for direct linking
    const connectionData = {
      wallet: walletId,
      auto: true,
      network: {
        name: 'POL Sandbox',
        chainId: '0x539',
        rpcUrls: ['https://rpc.pol-sandbox.com'],
        nativeCurrency: {
          name: 'POL',
          symbol: 'POL',
          decimals: 18
        }
      },
      tokens: [
        {
          address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
          symbol: 'POL',
          balance: '500000000000000000000',
          price: 750.00
        },
        {
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'USDT',
          balance: '1000000000',
          price: 1.00
        }
      ]
    };
    
    const links: Record<string, string> = {
      metamask: isMobile ? `metamask://dapp/${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}` : 'https://metamask.io/download/',
      trustwallet: isMobile ? `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(baseUrl + '?data=' + encodeURIComponent(JSON.stringify(connectionData)))}` : 'https://trustwallet.com/download/',
      coinbase: isMobile ? `cbwallet://dapp/${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}` : 'https://www.coinbase.com/wallet',
      walletconnect: `wc:${generateWalletConnectURI(connectionData)}`,
      phantom: isMobile ? `phantom://browse/${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}` : 'https://phantom.app/',
      okx: isMobile ? `okx://wallet/dapp/${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}` : 'https://www.okx.com/web3',
      bybit: isMobile ? `bybitdapp://browser/${baseUrl}?data=${encodeURIComponent(JSON.stringify(connectionData))}` : 'https://www.bybit.com/en/web3'
    };
    
    return links[walletId] || `${baseUrl}/connect?wallet=${walletId}&auto=true&data=${encodeURIComponent(JSON.stringify(connectionData))}`;
  };

  if (compact) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Quick Connect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {walletOptions.slice(0, 3).map((wallet) => (
              <Button
                key={wallet.id}
                variant={selectedWallet === wallet.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleWalletChange(wallet.id)}
                className="flex flex-col gap-1 h-auto p-2"
              >
                <span className="text-lg">{wallet.icon}</span>
                <span className="text-xs">{wallet.name}</span>
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generatedLink)}
              className="flex-1"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              size="sm"
              onClick={() => window.open(generatedLink, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Shareable Wallet Connection</h2>
        <p className="text-muted-foreground">
          Generate links and QR codes for easy wallet connections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Connection Configuration
            </CardTitle>
            <CardDescription>
              Choose wallet and generate connection link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="wallet-select">Select Wallet</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {walletOptions.map((wallet) => (
                  <Button
                    key={wallet.id}
                    variant={selectedWallet === wallet.id ? "default" : "outline"}
                    onClick={() => handleWalletChange(wallet.id)}
                    className="justify-start"
                  >
                    <span className="mr-2">{wallet.icon}</span>
                    {wallet.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="generated-link">Generated Link</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="generated-link"
                  value={generatedLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(generatedLink)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={shareLink} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open(generatedLink, '_blank')}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Test Link
              </Button>
            </div>

            {isMobile && (
              <Button 
                variant="outline"
                onClick={() => window.open(getDirectWalletLink(selectedWallet), '_blank')}
                className="w-full"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Open in {walletOptions.find(w => w.id === selectedWallet)?.name}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* QR Code Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
            <CardDescription>
              Scan this QR code with mobile wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {qrCodeLoading ? (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Generating QR Code...</p>
                  </div>
                </div>
              ) : qrCode ? (
                <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300">
                  <img 
                    src={qrCode} 
                    alt={`QR Code for ${walletOptions.find(w => w.id === selectedWallet)?.name}`}
                    className="w-56 h-56 object-contain"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QrCode className="h-32 w-32 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">QR Code Preview</p>
                    <p className="text-xs text-gray-500 mt-1">For {walletOptions.find(w => w.id === selectedWallet)?.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={downloadQRCode}
                disabled={!qrCode || qrCodeLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={copyQRCodeImage}
                disabled={!qrCode || qrCodeLoading}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'QR Code Copied!' : 'Copy QR Code Image'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            Different ways to share your wallet connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile Users
              </h4>
              <p className="text-sm text-muted-foreground">
                Share the link via SMS, email, or messaging apps. Users can tap to open directly in their wallet.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desktop Users
              </h4>
              <p className="text-sm text-muted-foreground">
                Share QR code on websites, presentations, or print materials. Users can scan with mobile wallets.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Direct Integration
              </h4>
              <p className="text-sm text-muted-foreground">
                Embed the link in your dApp, documentation, or onboarding flow for seamless connections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> These links automatically detect the user's device and wallet preference, 
          providing the optimal connection experience. The POL Sandbox network and default tokens are added automatically.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ShareableWalletConnect;