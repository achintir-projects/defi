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
  ArrowRight,
  Zap,
  Rocket,
  Users,
  Shield,
  Globe,
  Coins
} from 'lucide-react';
import RealisticNetworkSetup from '@/components/realistic-network-setup';
import ExperimentalQRSetup from '@/components/experimental-qr-setup';
import SimpleOneClickSolution from '@/components/simple-one-click-solution';
import SimpleAutoNetworkSetup from '@/components/simple-auto-network-setup';
import SimpleSmartDistributionSystem from '@/components/simple-smart-distribution-system';
import RealWalletConnector from '@/components/real-wallet-connector';
import { RecognizedNetworksDashboard } from '@/components/recognized-networks-dashboard';
import { RECOGNIZED_NETWORKS, RecognizedNetworksManager } from '@/lib/recognized-networks-config';

export default function Home() {
  const [activeTab, setActiveTab] = useState('recognized-networks');
  const [networkAdded, setNetworkAdded] = useState<string | null>(null);

  const handleNetworkAdded = (wallet: string) => {
    setNetworkAdded(wallet);
    setTimeout(() => setNetworkAdded(null), 5000);
  };

  const handleWalletConnect = (network: string, address: string) => {
    console.log(`Connected to ${network} with address ${address}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Multi-Chain DeFi Dashboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect to recognized blockchain networks (Ethereum, Solana, Polygon, BSC) with pre-populated tokens. 
            No security warnings - just seamless access to 10,000+ tokens across multiple chains.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="font-semibold">7+ Networks</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">10,000+ Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-semibold">100% Secure</span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {networkAdded && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Great! You've successfully connected to the network. 
              Your tokens are now available in your wallet.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="recognized-networks" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Networks
            </TabsTrigger>
            <TabsTrigger value="auto-setup">Auto-Setup</TabsTrigger>
            <TabsTrigger value="real-wallet">Real Wallet</TabsTrigger>
            <TabsTrigger value="monitoring">Team Monitor</TabsTrigger>
            <TabsTrigger value="experimental">QR Research</TabsTrigger>
            <TabsTrigger value="troubleshooting">Help</TabsTrigger>
          </TabsList>

          {/* Recognized Networks Tab */}
          <TabsContent value="recognized-networks">
            <RecognizedNetworksDashboard onConnect={handleWalletConnect} />
          </TabsContent>

          {/* Auto-Setup Tab */}
          <TabsContent value="auto-setup">
            <SimpleOneClickSolution />
          </TabsContent>

          {/* Real Wallet Connection Tab */}
          <TabsContent value="real-wallet">
            <RealWalletConnector />
          </TabsContent>

          {/* Team Monitoring Tab */}
          <TabsContent value="monitoring">
            <SimpleSmartDistributionSystem />
          </TabsContent>

          {/* Experimental QR Research Tab */}
          <TabsContent value="experimental">
            <ExperimentalQRSetup onMethodTested={(method, result) => {
              console.log(`QR method ${method} test result: ${result}`);
            }} />
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Why Recognized Networks?</strong> We use established blockchain mainnets to eliminate security warnings and provide the safest user experience.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supported Networks */}
              <Card>
                <CardHeader>
                  <CardTitle>Supported Networks</CardTitle>
                  <CardDescription>
                    All networks are recognized mainnets with full security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.values(RECOGNIZED_NETWORKS).map((network) => (
                      <div key={network.chainId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Network className="w-4 h-4" />
                          <div>
                            <div className="font-medium text-sm">{network.chainName}</div>
                            <div className="text-xs text-muted-foreground">{network.nativeCurrency.symbol}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {RecognizedNetworksManager.getCategoryDisplayName(network.category)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pre-Populated Tokens */}
              <Card>
                <CardHeader>
                  <CardTitle>Pre-Populated Tokens</CardTitle>
                  <CardDescription>
                    Popular tokens with forced pricing for demo purposes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-sm">ETH, USDT, USDC, WBTC</div>
                          <div className="text-xs text-muted-foreground">Ethereum Network</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">10,000 each</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-sm">SOL, USDT</div>
                          <div className="text-xs text-muted-foreground">Solana Network</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">10,000 each</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-sm">MATIC, USDT</div>
                          <div className="text-xs text-muted-foreground">Polygon Network</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">10,000 each</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        <div>
                          <div className="font-medium text-sm">BNB, USDT</div>
                          <div className="text-xs text-muted-foreground">BSC Network</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">10,000 each</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Security Benefits</CardTitle>
                <CardDescription>
                  Why recognized networks are safer than custom networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium mb-1">No Security Warnings</h3>
                    <p className="text-sm text-muted-foreground">
                      MetaMask and other wallets recognize these networks by default
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium mb-1">Verified Infrastructure</h3>
                    <p className="text-sm text-muted-foreground">
                      All RPC endpoints and block explorers are officially verified
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-medium mb-1">Mainnet Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Full mainnet security with established validator networks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Connecting to recognized networks ensures the highest security standards for your DeFi experience.</p>
        </div>
      </div>
    </div>
  );
}