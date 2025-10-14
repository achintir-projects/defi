'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Smartphone,
  Laptop,
  Chrome,
  Firefox,
  Apple,
  Play,
  ArrowRight,
  Copy,
  RefreshCw,
  Shield
} from 'lucide-react';

interface WalletInstallGuideProps {
  onWalletInstalled?: () => void;
}

export const WalletInstallGuide: React.FC<WalletInstallGuideProps> = ({
  onWalletInstalled
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(type);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const walletInstallations = [
    {
      name: 'MetaMask',
      description: 'Most popular wallet with excellent browser support',
      icon: '🦊',
      extension: {
        chrome: 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
        firefox: 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/',
        edge: 'https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm?hl=en-US'
      },
      mobile: {
        ios: 'https://apps.apple.com/app/metamask/id1438144202',
        android: 'https://play.google.com/store/apps/details?id=io.metamask'
      },
      features: ['Browser Extension', 'Mobile App', 'Hardware Wallet Support', 'Multi-Chain']
    },
    {
      name: 'Trust Wallet',
      description: 'Mobile-first wallet with great DApp support',
      icon: '🛡️',
      extension: {
        chrome: 'https://chrome.google.com/webstore/detail/trust-wallet/eajobomcbjdlhfdhnhgjaghkbpdnjdmp'
      },
      mobile: {
        ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
        android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp'
      },
      features: ['Mobile App', 'Browser Extension', 'Staking', 'DApp Browser']
    },
    {
      name: 'Coinbase Wallet',
      description: 'User-friendly wallet from Coinbase exchange',
      icon: '🔵',
      extension: {
        chrome: 'https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad',
        firefox: 'https://addons.mozilla.org/en-US/firefox/addon/coinbase-wallet/'
      },
      mobile: {
        ios: 'https://apps.apple.com/app/coinbase-wallet/id1278383455',
        android: 'https://play.google.com/store/apps/details?id=org.toshi'
      },
      features: ['Mobile App', 'Browser Extension', 'Coinbase Integration', 'Easy Onboarding']
    },
    {
      name: 'SafePal',
      description: 'Comprehensive crypto wallet solution',
      icon: '🔐',
      extension: {
        chrome: 'https://chrome.google.com/webstore/detail/safepal-extension-wallet/lgmpcpglpngogaljlgbincpbmdkefhnc'
      },
      mobile: {
        ios: 'https://apps.apple.com/app/safepal-wallet-crypto/id1566850998',
        android: 'https://play.google.com/store/apps/details?id=com.safepal.wallet'
      },
      features: ['Mobile App', 'Browser Extension', 'Hardware Wallet', 'DeFi Features']
    }
  ];

  const browserExtensions = [
    {
      name: 'Chrome',
      icon: <Chrome className="w-4 h-4" />,
      url: 'https://www.google.com/chrome/'
    },
    {
      name: 'Firefox',
      icon: <Firefox className="w-4 h-4" />,
      url: 'https://www.mozilla.org/firefox/new/'
    },
    {
      name: 'Brave',
      icon: <span className="text-orange-500">🦁</span>,
      url: 'https://brave.com/download/'
    },
    {
      name: 'Edge',
      icon: <span className="text-blue-500">🔷</span>,
      url: 'https://www.microsoft.com/edge'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Wallet Installation Guide
          </CardTitle>
          <CardDescription>
            Choose and install a crypto wallet to connect to POL Sandbox
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="desktop" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="browsers">Browsers</TabsTrigger>
            </TabsList>

            {/* Desktop Wallet Installation */}
            <TabsContent value="desktop" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Laptop className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommended for desktop users:</strong> Install a browser extension wallet for the best experience.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {walletInstallations.map((wallet) => (
                    <Card key={wallet.name} className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">{wallet.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{wallet.name}</h3>
                          <p className="text-sm text-muted-foreground">{wallet.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex flex-wrap gap-1">
                          {wallet.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Browser Extensions:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {wallet.extension.chrome && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={wallet.extension.chrome} target="_blank" rel="noopener noreferrer">
                                <Chrome className="w-3 h-3 mr-1" />
                                Chrome
                              </a>
                            </Button>
                          )}
                          {wallet.extension.firefox && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={wallet.extension.firefox} target="_blank" rel="noopener noreferrer">
                                <Firefox className="w-3 h-3 mr-1" />
                                Firefox
                              </a>
                            </Button>
                          )}
                          {wallet.extension.edge && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={wallet.extension.edge} target="_blank" rel="noopener noreferrer">
                                <span className="text-blue-500 mr-1">🔷</span>
                                Edge
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      After Installation:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Refresh this page to detect your new wallet</li>
                      <li>Create a new wallet or import an existing one</li>
                      <li>Securely store your recovery phrase</li>
                      <li>Return to this page to connect your wallet</li>
                    </ol>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Page
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Mobile Wallet Installation */}
            <TabsContent value="mobile" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommended for mobile users:</strong> Install a mobile wallet app and use the built-in browser.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {walletInstallations.map((wallet) => (
                    <Card key={wallet.name} className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">{wallet.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{wallet.name}</h3>
                          <p className="text-sm text-muted-foreground">{wallet.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex flex-wrap gap-1">
                          {wallet.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Mobile Apps:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {wallet.mobile.ios && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={wallet.mobile.ios} target="_blank" rel="noopener noreferrer">
                                <Apple className="w-3 h-3 mr-1" />
                                iOS
                              </a>
                            </Button>
                          )}
                          {wallet.mobile.android && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={wallet.mobile.android} target="_blank" rel="noopener noreferrer">
                                <Play className="w-3 h-3 mr-1" />
                                Android
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Mobile Setup Steps:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Install your preferred wallet app from App Store or Google Play</li>
                      <li>Open the app and create/import your wallet</li>
                      <li>Find the built-in DApp browser in the app</li>
                      <li>Navigate to this URL in the DApp browser</li>
                    </ol>
                    <div className="mt-3 p-2 bg-white rounded border">
                      <div className="text-xs text-muted-foreground mb-1">DApp URL:</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs">{window.location.href}</code>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(window.location.href, 'mobile')}
                        >
                          {copiedUrl === 'mobile' ? 'Copied!' : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Browser Recommendations */}
            <TabsContent value="browsers" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Browser compatibility:</strong> Some browsers work better with wallet extensions than others.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {browserExtensions.map((browser) => (
                    <Card key={browser.name} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {browser.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{browser.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {browser.name === 'Chrome' && 'Most compatible with wallet extensions'}
                            {browser.name === 'Firefox' && 'Good extension support and privacy'}
                            {browser.name === 'Brave' && 'Built-in crypto wallet support'}
                            {browser.name === 'Edge' && 'Windows default with extension support'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={browser.url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">⚠️ Browser Tips:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Avoid Safari for wallet extensions (limited support)</li>
                      <li>Chrome and Brave offer the best wallet extension experience</li>
                      <li>Make sure your browser is up to date</li>
                      <li>Disable other conflicting wallet extensions</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Start Guide</CardTitle>
          <CardDescription>
            New to crypto wallets? Follow this simple guide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <div className="font-medium">Choose Your Wallet</div>
                <div className="text-sm text-muted-foreground">
                  Select MetaMask for beginners, or Trust Wallet for mobile-first users
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <div className="font-medium">Install & Setup</div>
                <div className="text-sm text-muted-foreground">
                  Download the wallet and create a new wallet with a secure password
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">!</div>
              <div>
                <div className="font-medium">Secure Your Recovery Phrase</div>
                <div className="text-sm text-muted-foreground">
                  Write down your 12-word recovery phrase and store it safely offline
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <div className="font-medium">Fund Your Wallet</div>
                <div className="text-sm text-muted-foreground">
                  Transfer crypto to your wallet or buy through the app
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <div className="font-medium">Connect to POL Sandbox</div>
                <div className="text-sm text-muted-foreground">
                  Return to this page and click "Connect Wallet"
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="font-medium">Security Reminder:</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Never share your recovery phrase or private keys with anyone. 
              POL Sandbox will never ask for these details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletInstallGuide;