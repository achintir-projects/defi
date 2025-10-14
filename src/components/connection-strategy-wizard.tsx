'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Globe, 
  Code, 
  Download, 
  QrCode, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  Smartphone,
  Monitor
} from 'lucide-react';
import { polRpcEndpoint } from '@/lib/price-influence-strategies';

interface Strategy {
  id: string;
  name: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  control: 'low' | 'medium' | 'full';
  icon: React.ReactNode;
  features: string[];
  requirements: string[];
  setupTime: string;
}

interface StrategyCardProps {
  strategy: Strategy;
  selected: boolean;
  onSelect: (id: string) => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, selected, onSelect }) => {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getControlColor = (control: string) => {
    switch (control) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-purple-100 text-purple-800';
      case 'full': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        selected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary'
      }`}
      onClick={() => onSelect(strategy.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              {strategy.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{strategy.name}</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge className={getComplexityColor(strategy.complexity)}>
                  {strategy.complexity} complexity
                </Badge>
                <Badge className={getControlColor(strategy.control)}>
                  {strategy.control} control
                </Badge>
              </div>
            </div>
          </div>
          {selected && (
            <CheckCircle className="w-6 h-6 text-primary" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {strategy.description}
        </CardDescription>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">Key Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {strategy.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2">Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {strategy.requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-muted rounded-full" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Setup time</span>
            <Badge variant="outline">{strategy.setupTime}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BrowserExtensionSetup: React.FC = () => {
  const [isInstalling, setIsInstalling] = useState(false);

  const handleDownload = async () => {
    setIsInstalling(true);
    try {
      // Download the actual extension
      await new Promise(resolve => setTimeout(resolve, 1000));
      const link = document.createElement('a');
      link.href = '/pol-sandbox-extension.tar.gz';
      link.download = 'pol-sandbox-extension.tar.gz';
      link.click();
      
      // Show success message
      alert('Extension downloaded! Extract the files and load the extension in Chrome using Developer Mode.');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Browser Extension Setup
        </CardTitle>
        <CardDescription>
          Install our Chrome extension to override prices across all dApps automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>Most powerful option:</strong> Automatically overrides prices in all your dApps without any manual configuration.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="font-semibold">Installation Steps:</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <div className="font-medium">Download the Extension</div>
                <div className="text-sm text-muted-foreground">
                  Click the button below to download the POL Sandbox extension
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <div className="font-medium">Install in Chrome</div>
                <div className="text-sm text-muted-foreground">
                  Open Chrome Extensions page, enable Developer mode, and load the extension
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <div className="font-medium">Configure Override Settings</div>
                <div className="text-sm text-muted-foreground">
                  Click the extension icon to configure which tokens to override and adjustment strength
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
              <div>
                <div className="font-medium">Start Using</div>
                <div className="text-sm text-muted-foreground">
                  Visit any dApp and see POL-adjusted prices automatically!
                </div>
              </div>
            </li>
          </ol>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleDownload} 
            disabled={isInstalling}
            className="flex-1"
          >
            {isInstalling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Extension
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <a 
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Chrome Web Store
            </a>
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> This is a development version. Production version will be available on Chrome Web Store.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

const CustomRpcSetup: React.FC = () => {
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const rpcConfig = polRpcEndpoint.getRpcConfig();

  const handleAddNetwork = async () => {
    setIsAddingNetwork(true);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${rpcConfig.chainId.toString(16)}`,
            chainName: rpcConfig.networkName,
            nativeCurrency: rpcConfig.nativeCurrency,
            rpcUrls: [rpcConfig.rpcUrl],
            blockExplorerUrls: [rpcConfig.blockExplorer]
          }]
        });
      }
    } catch (error) {
      console.error('Failed to add network:', error);
    } finally {
      setIsAddingNetwork(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Custom RPC Network Setup
        </CardTitle>
        <CardDescription>
          Add our custom network to your wallet for POL-adjusted prices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Easy setup:</strong> Add our custom RPC network to get POL prices in any compatible wallet.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Network Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Network Name</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">{rpcConfig.networkName}</code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(rpcConfig.networkName)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">RPC URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">{rpcConfig.rpcUrl}</code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(rpcConfig.rpcUrl)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Chain ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">{rpcConfig.chainId}</code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(rpcConfig.chainId.toString())}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Currency Symbol</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">{rpcConfig.symbol}</code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(rpcConfig.symbol)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">QR Code</CardTitle>
              <CardDescription>
                Scan this QR code with your mobile wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                QR code contains network configuration
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Manual Setup Steps:</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <div className="font-medium">Open your wallet</div>
                <div className="text-sm text-muted-foreground">
                  Go to network settings in MetaMask, Trust Wallet, or other compatible wallet
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <div className="font-medium">Add custom network</div>
                <div className="text-sm text-muted-foreground">
                  Click "Add Network" or "Add Custom Network"
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <div className="font-medium">Enter network details</div>
                <div className="text-sm text-muted-foreground">
                  Copy and paste the configuration from above
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
              <div>
                <div className="font-medium">Switch to POL network</div>
                <div className="text-sm text-muted-foreground">
                  Select the POL Sandbox network from your wallet's network list
                </div>
              </div>
            </li>
          </ol>
        </div>

        <Button 
          onClick={handleAddNetwork} 
          disabled={isAddingNetwork}
          className="w-full"
        >
          {isAddingNetwork ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Adding Network...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 mr-2" />
              Add Network to Wallet
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const ApiProxySetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  const generateApiKey = async () => {
    setIsGeneratingKey(true);
    try {
      // Simulate API key generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      const key = 'pol_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setApiKey(key);
    } catch (error) {
      console.error('Failed to generate API key:', error);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          API Proxy Setup
        </CardTitle>
        <CardDescription>
          Use our API endpoint for price data in your dApp or application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Code className="h-4 w-4" />
          <AlertDescription>
            <strong>Developer option:</strong> Integrate POL prices directly into your dApp using our REST API.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="font-semibold">API Endpoints:</h3>
          <div className="space-y-3">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Get Token Prices</div>
                    <code className="text-sm text-muted-foreground">GET /api/v1/prices/{'{addresses}'}</code>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Batch Price Request</div>
                    <code className="text-sm text-muted-foreground">POST /api/v1/prices/batch</code>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Real-time Price Stream</div>
                    <code className="text-sm text-muted-foreground">WebSocket /ws/prices</code>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">API Key</h3>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-muted rounded font-mono text-sm">
              {apiKey || 'No API key generated'}
            </div>
            <Button 
              variant="outline"
              onClick={() => copyToClipboard(apiKey)}
              disabled={!apiKey}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={generateApiKey} 
            disabled={isGeneratingKey}
            className="w-full"
          >
            {isGeneratingKey ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Code className="w-4 h-4 mr-2" />
                Generate API Key
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Code Example:</h3>
          <Card>
            <CardContent className="pt-4">
              <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`const response = await fetch(
  'https://api.pol-sandbox.com/v1/prices/0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
  {
    headers: {
      'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}',
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log('POL Price:', data.finalPrice);`}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" asChild>
            <a href="/docs" target="_blank">
              <Code className="w-4 h-4 mr-2" />
              View Documentation
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/examples" target="_blank">
              <Code className="w-4 h-4 mr-2" />
              Code Examples
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ConnectionStrategyWizard: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const strategies: Strategy[] = [
    {
      id: 'browser-extension',
      name: 'Browser Extension',
      description: 'Install our extension to override prices across all dApps automatically',
      complexity: 'medium',
      control: 'high',
      icon: <Monitor className="w-6 h-6" />,
      features: [
        'Automatic price override in all dApps',
        'Real-time price adjustments',
        'Customizable token selection',
        'No code required'
      ],
      requirements: [
        'Chrome/Edge browser',
        'Extension installation permissions',
        '5 minutes setup time'
      ],
      setupTime: '5 minutes'
    },
    {
      id: 'custom-rpc',
      name: 'Custom RPC Network',
      description: 'Add our custom network to your wallet for POL-adjusted prices',
      complexity: 'low',
      control: 'medium',
      icon: <Globe className="w-6 h-6" />,
      features: [
        'Works with any Web3 wallet',
        'Simple network configuration',
        'Reliable price feeds',
        'Mobile and desktop support'
      ],
      requirements: [
        'Web3 wallet (MetaMask, Trust, etc.)',
        'Network configuration permissions',
        '2 minutes setup time'
      ],
      setupTime: '2 minutes'
    },
    {
      id: 'api-proxy',
      name: 'API Proxy',
      description: 'Use our API endpoint for price data in your dApp or application',
      complexity: 'high',
      control: 'full',
      icon: <Code className="w-6 h-6" />,
      features: [
        'Full API access',
        'Real-time WebSocket streams',
        'Custom price calculations',
        'Advanced configuration options'
      ],
      requirements: [
        'Development experience',
        'API key generation',
        '15 minutes setup time'
      ],
      setupTime: '15 minutes'
    }
  ];

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    setIsSetupComplete(false);
  };

  const handleSetupComplete = () => {
    setIsSetupComplete(true);
  };

  if (isSetupComplete) {
    return (
      <Card className="border-green-500 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-6 h-6" />
            Setup Complete!
          </CardTitle>
          <CardDescription className="text-green-600">
            Your POL Sandbox integration is now configured and ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              You can now use POL Sandbox prices across your connected applications. 
              The system will automatically calculate and apply price adjustments based on your chosen strategy.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-3">
            <Button onClick={() => setIsSetupComplete(false)}>
              <Settings className="w-4 h-4 mr-2" />
              Configure Another Strategy
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard">
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Dashboard
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Choose Your POL Integration Method
          </CardTitle>
          <CardDescription>
            Select how you want to integrate POL Sandbox price adjustments into your workflow. 
            Each method offers different levels of control and complexity.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {strategies.map(strategy => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            selected={selectedStrategy === strategy.id}
            onSelect={handleStrategySelect}
          />
        ))}
      </div>

      {selectedStrategy && (
        <Tabs value={selectedStrategy} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browser-extension" disabled>
              Browser Extension
            </TabsTrigger>
            <TabsTrigger value="custom-rpc" disabled>
              Custom RPC
            </TabsTrigger>
            <TabsTrigger value="api-proxy" disabled>
              API Proxy
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browser-extension">
            <BrowserExtensionSetup />
          </TabsContent>
          
          <TabsContent value="custom-rpc">
            <CustomRpcSetup />
          </TabsContent>
          
          <TabsContent value="api-proxy">
            <ApiProxySetup />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};