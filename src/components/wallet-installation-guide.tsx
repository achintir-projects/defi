'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  QrCode, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Copy,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import PlanBConnectionOptions from './plan-b-connection-options';

interface WalletGuide {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'popular' | 'mobile' | 'desktop' | 'hardware';
  platforms: {
    extension?: {
      url: string;
      browsers: string[];
    };
    mobile?: {
      ios: string;
      android: string;
      deepLink: string;
    };
    desktop?: {
      url: string;
      platforms: string[];
    };
  };
  features: string[];
  setupSteps: string[];
  security: string;
  supportedChains: string[];
}

const walletGuides: WalletGuide[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Most popular Ethereum wallet with browser extension',
    category: 'popular',
    platforms: {
      extension: {
        url: 'https://metamask.io/download/',
        browsers: ['Chrome', 'Firefox', 'Brave', 'Edge']
      },
      mobile: {
        ios: 'https://apps.apple.com/app/metamask/id1438144202',
        android: 'https://play.google.com/store/apps/details?id=io.metamask',
        deepLink: 'metamask://dapp/'
      }
    },
    features: ['Multi-chain support', 'Hardware wallet integration', 'Built-in swap', 'NFT gallery'],
    setupSteps: [
      'Install MetaMask extension from the official website',
      'Create a new wallet or import existing one',
      'Securely store your seed phrase offline',
      'Set a strong password for the extension',
      'Connect to POL Sandbox network (Chain ID: 88888)'
    ],
    security: 'Industry standard with seed phrase backup and password protection',
    supportedChains: ['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'POL Sandbox']
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    icon: '🛡️',
    description: 'Secure mobile-first multi-coin wallet',
    category: 'mobile',
    platforms: {
      mobile: {
        ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
        android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
        deepLink: 'trust://dapp/'
      },
      extension: {
        url: 'https://trustwallet.com/browser-extension/',
        browsers: ['Chrome', 'Brave']
      }
    },
    features: ['Mobile-first design', 'Staking support', 'DApp browser', 'Multi-coin support'],
    setupSteps: [
      'Download Trust Wallet from App Store or Google Play',
      'Create new wallet or import existing',
      'Write down your recovery phrase securely',
      'Enable biometric authentication',
      'Add POL Sandbox network manually'
    ],
    security: 'Your keys never leave your device, encrypted local storage',
    supportedChains: ['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'POL Sandbox']
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'User-friendly wallet from Coinbase exchange',
    category: 'popular',
    platforms: {
      extension: {
        url: 'https://www.coinbase.com/wallet',
        browsers: ['Chrome', 'Firefox']
      },
      mobile: {
        ios: 'https://apps.apple.com/app/coinbase-wallet/id1278383455',
        android: 'https://play.google.com/store/apps/details?id=org.toshi',
        deepLink: 'cbwallet://dapp/'
      }
    },
    features: ['Easy setup', 'Coinbase integration', 'Multi-chain support', 'Simple recovery'],
    setupSteps: [
      'Download Coinbase Wallet or install browser extension',
      'Create a new wallet with cloud backup',
      'Set up additional security (Face ID, biometrics)',
      'Test with small amounts first',
      'Connect to POL Sandbox'
    ],
    security: 'Cloud backup option with multiple recovery methods',
    supportedChains: ['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'POL Sandbox']
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Solana ecosystem wallet with expanding chain support',
    category: 'desktop',
    platforms: {
      extension: {
        url: 'https://phantom.app/',
        browsers: ['Chrome', 'Firefox', 'Brave', 'Edge']
      },
      mobile: {
        ios: 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977',
        android: 'https://play.google.com/store/apps/details?id=app.phantom',
        deepLink: 'phantom://browse/'
      }
    },
    features: ['Solana native', 'NFT support', 'Built-in swap', 'Staking'],
    setupSteps: [
      'Install Phantom browser extension',
      'Create new wallet or import existing',
      'Save your seed phrase securely',
      'Set a strong password',
      'Add Ethereum chains for POL Sandbox'
    ],
    security: 'Standard seed phrase security with password protection',
    supportedChains: ['Solana', 'Ethereum', 'Polygon', 'BSC', 'POL Sandbox']
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: '⚡',
    description: 'Exchange-backed multi-chain wallet',
    category: 'desktop',
    platforms: {
      extension: {
        url: 'https://www.okx.com/web3',
        browsers: ['Chrome', 'Firefox']
      },
      mobile: {
        ios: 'https://apps.apple.com/app/okx-crypto-exchange-app/id1327268471',
        android: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
        deepLink: 'okx://wallet/dapp/'
      }
    },
    features: ['Exchange integration', 'DeFi earning', 'Multi-chain', 'Advanced trading'],
    setupSteps: [
      'Download OKX Wallet or install extension',
      'Create or import wallet',
      'Set up additional security features',
      'Verify your identity for advanced features',
      'Connect to POL Sandbox network'
    ],
    security: 'Multiple security layers including 2FA and biometrics',
    supportedChains: ['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'POL Sandbox']
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Protocol to connect any wallet via QR code',
    category: 'popular',
    platforms: {
      mobile: {
        ios: 'https://apps.apple.com/app/walletconnect-3/id1455110189',
        android: 'https://play.google.com/store/apps/details?id=com.walletconnect',
        deepLink: 'wc:'
      }
    },
    features: ['Universal connection', 'QR code support', 'Hardware wallet compatible', 'Open source'],
    setupSteps: [
      'Install any WalletConnect-compatible wallet',
      'Scan QR code on POL Sandbox',
      'Approve connection on your wallet',
      'Confirm transactions on mobile device',
      'Maintain connection across sessions'
    ],
    security: 'End-to-end encrypted connection between wallet and dApp',
    supportedChains: ['All major chains including POL Sandbox']
  }
];

const WalletInstallationGuide: React.FC = () => {
  const [selectedWallet, setSelectedWallet] = useState<WalletGuide | null>(null);
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const popularWallets = walletGuides.filter(w => w.category === 'popular');
  const mobileWallets = walletGuides.filter(w => w.platforms.mobile);
  const desktopWallets = walletGuides.filter(w => w.platforms.extension || w.platforms.desktop);

  const WalletCard: React.FC<{ wallet: WalletGuide }> = ({ wallet }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedWallet(wallet)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{wallet.icon}</span>
          <div className="flex-1">
            <CardTitle className="text-lg">{wallet.name}</CardTitle>
            <CardDescription className="text-sm">{wallet.description}</CardDescription>
          </div>
          <Badge variant={wallet.category === 'popular' ? 'default' : 'secondary'}>
            {wallet.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {wallet.features.slice(0, 3).map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            {wallet.platforms.extension && (
              <Button size="sm" variant="outline" className="flex-1">
                <Monitor className="h-3 w-3 mr-1" />
                Extension
              </Button>
            )}
            {wallet.platforms.mobile && (
              <Button size="sm" variant="outline" className="flex-1">
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const WalletDetail: React.FC<{ wallet: WalletGuide }> = ({ wallet }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="text-4xl">{wallet.icon}</span>
        <div>
          <h2 className="text-2xl font-bold">{wallet.name}</h2>
          <p className="text-muted-foreground">{wallet.description}</p>
        </div>
        <Badge variant={wallet.category === 'popular' ? 'default' : 'secondary'} className="ml-auto">
          {wallet.category}
        </Badge>
      </div>

      <Tabs defaultValue="install" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="install">Install</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="troubleshoot">Plan B</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="chains">Networks</TabsTrigger>
        </TabsList>

        <TabsContent value="install" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallet.platforms.extension && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Browser Extension
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Supported browsers: {wallet.platforms.extension.browsers.join(', ')}
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => window.open(wallet.platforms.extension!.url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Extension
                  </Button>
                </CardContent>
              </Card>
            )}

            {wallet.platforms.mobile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobile App
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(wallet.platforms.mobile!.ios, '_blank')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      iOS
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(wallet.platforms.mobile!.android, '_blank')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Android
                    </Button>
                  </div>
                  {wallet.platforms.mobile.deepLink && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => copyToClipboard(wallet.platforms.mobile!.deepLink)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedText === wallet.platforms.mobile.deepLink ? 'Copied!' : 'Copy Deep Link'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Setup Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {wallet.setupSteps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshoot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Plan B - Connection Troubleshooting
              </CardTitle>
              <CardDescription>
                Alternative connection methods when standard installation doesn't work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Can't install browser extensions?</strong> Use these Plan B options to connect your wallet without installation.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Common Issues & Solutions:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <strong>Browser not supported:</strong> Use mobile deep links or manual URL connection
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <strong>Extension blocked by IT policy:</strong> Try mobile app or manual connection methods
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <strong>QR code scanner not working:</strong> Use direct deep links or copy-paste URLs
                      </div>
                    </div>
                  </div>
                </div>

                <PlanBConnectionOptions 
                  compact={false}
                  onConnectionSuccess={(state) => {
                    console.log('Plan B connection successful:', state);
                  }}
                  onConnectionError={(error) => {
                    console.error('Plan B connection error:', error);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{wallet.security}</p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Always keep your seed phrase private and never share it with anyone. Store it offline in a secure location.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Supported Networks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {wallet.supportedChains.map((chain, index) => (
                  <Badge 
                    key={index} 
                    variant={chain === 'POL Sandbox' ? 'default' : 'outline'}
                    className="justify-center"
                  >
                    {chain === 'POL Sandbox' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {chain}
                  </Badge>
                ))}
              </div>
              {wallet.supportedChains.includes('POL Sandbox') && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    This wallet supports POL Sandbox network! You can connect directly without manual network setup.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setSelectedWallet(null)}>
          Back to Wallets
        </Button>
        <Button 
          onClick={() => {
            const url = wallet.platforms.extension?.url || wallet.platforms.mobile?.ios || '#';
            window.open(url, '_blank');
          }}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Get {wallet.name}
        </Button>
      </div>
    </div>
  );

  if (selectedWallet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <WalletDetail wallet={selectedWallet} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Wallet Installation Guide</h1>
        <p className="text-muted-foreground">
          Choose and install a wallet to connect to POL Sandbox
        </p>
      </div>

      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile First
          </TabsTrigger>
          <TabsTrigger value="desktop" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Desktop
          </TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularWallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mobileWallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="desktop" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {desktopWallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Alert>
        <QrCode className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> You can also connect any wallet using WalletConnect QR codes. 
          Just scan the QR code with your mobile wallet app!
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default WalletInstallationGuide;