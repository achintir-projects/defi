'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Smartphone,
  Camera,
  Network,
  Settings,
  ArrowRight
} from 'lucide-react';
import RealisticNetworkSetup from '@/components/realistic-network-setup';
import { POL_SANDBOX_CONFIG } from '@/lib/realistic-network-config';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [networkAdded, setNetworkAdded] = useState<string | null>(null);

  const handleNetworkAdded = (wallet: string) => {
    setNetworkAdded(wallet);
    setTimeout(() => setNetworkAdded(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Network className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">POL Sandbox Network Setup</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Add the POL Sandbox test network to your wallet using real, tested methods. 
            No QR codes - just actual working approaches for your wallet.
          </p>
        </div>

        {/* Success Alert */}
        {networkAdded && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Great! You've successfully added the POL Sandbox network to {networkAdded}. 
              You can now switch to the network and start testing.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="setup">Network Setup</TabsTrigger>
            <TabsTrigger value="troubleshooting">Help</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* How it Works */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">1</div>
                      <p className="text-sm">Select your wallet from the available options</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">2</div>
                      <p className="text-sm">Choose automatic or manual setup method</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">3</div>
                      <p className="text-sm">Follow the instructions to add the network</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supported Wallets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Supported Wallets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: 'MetaMask', icon: '🦊', popular: true },
                      { name: 'Trust Wallet', icon: '🛡️', popular: true },
                      { name: 'Coinbase Wallet', icon: '🔵', popular: true },
                      { name: 'OKX Wallet', icon: '⚫', popular: false },
                      { name: 'Phantom', icon: '👻', popular: false }
                    ].map((wallet) => (
                      <div key={wallet.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{wallet.icon}</span>
                          <span className="text-sm font-medium">{wallet.name}</span>
                        </div>
                        {wallet.popular && (
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Network Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Network Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Network Name</label>
                      <p className="text-sm font-medium">{POL_SANDBOX_CONFIG.chainName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Chain ID</label>
                      <p className="text-sm font-medium">{POL_SANDBOX_CONFIG.chainId} (9191)</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Currency</label>
                      <p className="text-sm font-medium">{POL_SANDBOX_CONFIG.nativeCurrency.symbol}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">RPC URL</label>
                      <p className="text-sm font-medium break-all">{POL_SANDBOX_CONFIG.rpcUrls[0]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Use This Setup?</CardTitle>
                <CardDescription>
                  Benefits of using our realistic network configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Actually Works</h4>
                      <p className="text-sm text-muted-foreground">Real methods that work with wallet limitations</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Error-Free Setup</h4>
                      <p className="text-sm text-muted-foreground">Copy-paste eliminates typos and errors</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Universal Compatibility</h4>
                      <p className="text-sm text-muted-foreground">Works with all major wallet applications</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Secure & Direct</h4>
                      <p className="text-sm text-muted-foreground">No intermediaries, direct wallet configuration</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Setup Tab */}
          <TabsContent value="setup">
            <RealisticNetworkSetup onNetworkAdded={handleNetworkAdded} />
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Need help?</strong> Here are common issues and solutions for network setup problems.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common Issues */}
              <Card>
                <CardHeader>
                  <CardTitle>Common Issues</CardTitle>
                  <CardDescription>
                    Problems you might encounter and how to fix them
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Network not appearing after adding</h4>
                      <p className="text-sm text-muted-foreground">Restart your wallet app and check the network list again.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Invalid Chain ID error</h4>
                      <p className="text-sm text-muted-foreground">Make sure you're using exactly: 0x23E7 (not 9191)</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">RPC URL not working</h4>
                      <p className="text-sm text-muted-foreground">Check your internet connection and try again later.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Currency symbol shows as ETH</h4>
                      <p className="text-sm text-muted-foreground">This is normal - the symbol will update after the first transaction.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Getting Help */}
              <Card>
                <CardHeader>
                  <CardTitle>Get Additional Help</CardTitle>
                  <CardDescription>
                    More resources for troubleshooting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Check Network Status</h4>
                      <p className="text-sm text-muted-foreground">Verify the POL Sandbox network is operational.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Update Your Wallet</h4>
                      <p className="text-sm text-muted-foreground">Ensure you're using the latest version of your wallet.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Clear Wallet Cache</h4>
                      <p className="text-sm text-muted-foreground">Sometimes clearing cache resolves network issues.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Contact Support</h4>
                      <p className="text-sm text-muted-foreground">Reach out if you continue to experience problems.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Network Validation */}
            <Card>
              <CardHeader>
                <CardTitle>Verify Your Configuration</CardTitle>
                <CardDescription>
                  Make sure your network settings match exactly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Network Name</label>
                    <p className="text-sm text-muted-foreground font-mono">{POL_SANDBOX_CONFIG.chainName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Chain ID</label>
                    <p className="text-sm text-muted-foreground font-mono">{POL_SANDBOX_CONFIG.chainId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">RPC URL</label>
                    <p className="text-sm text-muted-foreground font-mono break-all">{POL_SANDBOX_CONFIG.rpcUrls[0]}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Currency Symbol</label>
                    <p className="text-sm text-muted-foreground font-mono">{POL_SANDBOX_CONFIG.nativeCurrency.symbol}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Need help? Contact support or check our documentation for detailed guides.</p>
        </div>
      </div>
    </div>
  );
}