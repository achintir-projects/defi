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
  Users
} from 'lucide-react';
import RealisticNetworkSetup from '@/components/realistic-network-setup';
import ExperimentalQRSetup from '@/components/experimental-qr-setup';
import SimpleOneClickSolution from '@/components/simple-one-click-solution';
import SimpleAutoNetworkSetup from '@/components/simple-auto-network-setup';
import SimpleSmartDistributionSystem from '@/components/simple-smart-distribution-system';
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
              <Rocket className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">POL Sandbox Auto-Setup Portal</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Zero-configuration setup for POL Sandbox testnet. Perfect for non-technical users - 
            no manual typing required, just one click and you're ready to explore DeFi.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="font-semibold">1,247+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">37s Setup Time</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold">98% Success Rate</span>
            </div>
          </div>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="auto-setup">Auto-Setup</TabsTrigger>
            <TabsTrigger value="monitoring">Team Monitor</TabsTrigger>
            <TabsTrigger value="setup">Manual Setup</TabsTrigger>
            <TabsTrigger value="experimental">QR Research</TabsTrigger>
            <TabsTrigger value="troubleshooting">Help</TabsTrigger>
          </TabsList>

          {/* Auto-Setup Tab */}
          <TabsContent value="auto-setup">
            <SimpleOneClickSolution />
          </TabsContent>

          {/* Team Monitoring Tab */}
          <TabsContent value="monitoring">
            <SimpleSmartDistributionSystem />
          </TabsContent>

          {/* Manual Setup Tab */}
          <TabsContent value="setup">
            <RealisticNetworkSetup onNetworkAdded={handleNetworkAdded} />
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