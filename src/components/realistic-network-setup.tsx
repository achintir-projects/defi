'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Smartphone,
  Settings,
  Link,
  Download,
  Shield
} from 'lucide-react';
import { 
  RealisticWalletConfig, 
  POL_SANDBOX_CONFIG, 
  WALLET_INSTRUCTIONS,
  ConfigHelper 
} from '@/lib/realistic-network-config';

interface RealisticNetworkSetupProps {
  onNetworkAdded?: (method: string) => void;
  walletProvider?: any;
}

export default function RealisticNetworkSetup({ 
  onNetworkAdded, 
  walletProvider 
}: RealisticNetworkSetupProps) {
  const [selectedWallet, setSelectedWallet] = useState<string>('metamask');
  const [copiedField, setCopiedField] = useState<string>('');
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [addResult, setAddResult] = useState<{ success: boolean; message: string; error?: string } | null>(null);

  const clipboardConfig = RealisticWalletConfig.getClipboardConfig();
  const currentInstructions = WALLET_INSTRUCTIONS[selectedWallet as keyof typeof WALLET_INSTRUCTIONS];
  const isWalletInstalled = ConfigHelper.isWalletInstalled(selectedWallet);

  const copyToClipboard = async (field: string, value: string) => {
    const success = await ConfigHelper.copyToClipboard(value);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    }
  };

  const addNetworkProgrammatically = async () => {
    if (!walletProvider) {
      setAddResult({
        success: false,
        error: 'Please connect your wallet first to use one-click network addition.'
      });
      return;
    }

    setIsAddingNetwork(true);
    try {
      const result = await RealisticWalletConfig.addNetworkProgrammatic(walletProvider);
      setAddResult(result);
      
      if (result.success && onNetworkAdded) {
        onNetworkAdded('programmatic');
      }
    } catch (error) {
      setAddResult({
        success: false,
        error: 'Failed to add network. Please use manual setup.'
      });
    } finally {
      setIsAddingNetwork(false);
    }
  };

  const openWalletDeepLink = () => {
    const deepLinks = RealisticWalletConfig.getWalletDeepLinks();
    const link = deepLinks[selectedWallet];
    if (link) {
      window.location.href = link.url;
    }
  };

  const downloadWallet = () => {
    const link = ConfigHelper.getWalletDownloadLink(selectedWallet);
    window.open(link, '_blank');
  };

  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', popular: true },
    { id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️', popular: true },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', popular: true },
    { id: 'okx', name: 'OKX Wallet', icon: '⚫', popular: false },
    { id: 'phantom', name: 'Phantom', icon: '👻', popular: false }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Add POL Sandbox Network</h2>
        <p className="text-muted-foreground">
          Real methods that actually work with your wallet
        </p>
      </div>

      {/* Wallet Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Select Your Wallet
          </CardTitle>
          <CardDescription>
            Choose your wallet to get the correct setup instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {wallets.map((wallet) => (
              <Button
                key={wallet.id}
                variant={selectedWallet === wallet.id ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => setSelectedWallet(wallet.id)}
              >
                <span className="text-2xl">{wallet.icon}</span>
                <span className="text-sm font-medium">{wallet.name}</span>
                {wallet.popular && (
                  <Badge variant="secondary" className="text-xs">
                    Popular
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isWalletInstalled && wallet.id === selectedWallet ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-muted-foreground">
                    {isWalletInstalled && wallet.id === selectedWallet ? 'Installed' : 'Not detected'}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Methods */}
      <Tabs defaultValue="automatic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automatic">Automatic</TabsTrigger>
          <TabsTrigger value="manual">Manual Setup</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>

        {/* Automatic Setup */}
        <TabsContent value="automatic" className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Automatic setup</strong> works when your wallet is connected to this website. 
              If you haven't connected your wallet yet, please use the manual setup method.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                One-Click Network Addition
              </CardTitle>
              <CardDescription>
                Add POL Sandbox network automatically (requires connected wallet)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Wallet Status</p>
                  <p className="text-sm text-muted-foreground">
                    {isWalletInstalled ? 
                      `${wallets.find(w => w.id === selectedWallet)?.name} is installed` : 
                      `${wallets.find(w => w.id === selectedWallet)?.name} not detected`
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isWalletInstalled && (
                    <Button variant="outline" onClick={downloadWallet}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {isWalletInstalled && !walletProvider && (
                    <Button variant="outline" onClick={openWalletDeepLink}>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Open Wallet
                    </Button>
                  )}
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={addNetworkProgrammatically}
                disabled={!walletProvider || isAddingNetwork}
              >
                {isAddingNetwork ? 'Adding Network...' : 'Add POL Sandbox Network'}
              </Button>

              {addResult && (
                <Alert className={addResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {addResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={addResult.success ? 'text-green-800' : 'text-red-800'}>
                    {addResult.success ? addResult.message : addResult.error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Setup */}
        <TabsContent value="manual" className="space-y-4">
          <Alert>
            <Copy className="h-4 w-4" />
            <AlertDescription>
              <strong>Manual setup</strong> - Click each copy button to copy the value, 
              then paste it into the corresponding field in your wallet.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Network Configuration Details
              </CardTitle>
              <CardDescription>
                Copy each value and paste it into your wallet's network setup form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(clipboardConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <label className="text-sm font-medium">{config.label}</label>
                      <p className="text-sm text-muted-foreground font-mono break-all">
                        {config.value}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(key, config.value)}
                      className="ml-2"
                    >
                      {copiedField === key ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Complete Configuration</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Copy all values at once (for advanced users):
                </p>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard('complete', RealisticWalletConfig.getCompleteConfigText())}
                  className="w-full"
                >
                  {copiedField === 'complete' ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copiedField === 'complete' ? 'Copied!' : 'Copy Complete Config'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instructions */}
        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {currentInstructions.title}
              </CardTitle>
              <CardDescription>
                Step-by-step instructions for {wallets.find(w => w.id === selectedWallet)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Steps */}
                <div>
                  <h4 className="font-medium mb-3">Setup Steps</h4>
                  <div className="space-y-3">
                    {currentInstructions.steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm text-muted-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="font-medium mb-3">Pro Tips</h4>
                  <div className="space-y-2">
                    {currentInstructions.tips.map((tip, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                        <p className="text-sm text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={openWalletDeepLink}>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Open Wallet
                    </Button>
                    <Button variant="outline" onClick={downloadWallet}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Wallet
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Network Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Network Verification
          </CardTitle>
          <CardDescription>
            Verify your network configuration is correct
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Expected Chain ID</label>
              <p className="text-sm text-muted-foreground">
                {ConfigHelper.formatChainId(POL_SANDBOX_CONFIG.chainId)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Expected Network Name</label>
              <p className="text-sm text-muted-foreground">{POL_SANDBOX_CONFIG.chainName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Expected Currency</label>
              <p className="text-sm text-muted-foreground">{POL_SANDBOX_CONFIG.nativeCurrency.symbol}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Expected RPC URL</label>
              <p className="text-sm text-muted-foreground break-all">
                {POL_SANDBOX_CONFIG.rpcUrls[0]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}