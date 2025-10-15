'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Book, 
  Code, 
  Zap, 
  Shield, 
  Globe, 
  Settings, 
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Copy,
  Terminal,
  FileText,
  Github,
  MessageCircle
} from 'lucide-react';

const DocsPage: React.FC = () => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, commandId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(commandId);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const CodeBlock: React.FC<{ code: string; language?: string; commandId?: string }> = ({ 
    code, 
    language = 'bash', 
    commandId 
  }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      {commandId && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2"
          onClick={() => copyToClipboard(code, commandId)}
        >
          {copiedCommand === commandId ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">POL Sandbox Documentation</h1>
          <p className="text-muted-foreground">
            Complete guide to integrating and using the POL Sandbox platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="https://github.com/achintir-projects/defi" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://discord.gg/polsandbox" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              Discord
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="getting-started" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="browser-extension">Extension</TabsTrigger>
          <TabsTrigger value="rpc">RPC Network</TabsTrigger>
          <TabsTrigger value="wallets">Wallet Integration</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        {/* Getting Started */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Get up and running with POL Sandbox in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">1. Installation</h3>
                <p className="text-muted-foreground mb-4">
                  Install the browser extension or configure the RPC endpoint to start using POL Sandbox.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Browser Extension (Recommended)</h4>
                    <CodeBlock 
                      commandId="extension-download"
                      code="Download: https://your-domain.com/pol-sandbox-extension.tar.gz"
                    />
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Download the extension file</li>
                      <li>Extract to a folder</li>
                      <li>Open Chrome Extensions page</li>
                      <li>Enable Developer Mode</li>
                      <li>Click "Load unpacked" and select the folder</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">RPC Network Configuration</h4>
                    <CodeBlock 
                      commandId="rpc-config"
                      code="RPC URL: https://your-domain.com/api/rpc
Chain ID: 9191
Network Name: POL Sandbox Network"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">2. Connect Your Wallet</h3>
                <p className="text-muted-foreground mb-4">
                  POL Sandbox supports 10+ major wallets including MetaMask, Trust Wallet, and more.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['MetaMask', 'Trust Wallet', 'Coinbase Wallet', 'SafePal'].map(wallet => (
                    <Badge key={wallet} variant="outline" className="justify-center">
                      {wallet}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">3. Configure Price Overrides</h3>
                <p className="text-muted-foreground mb-4">
                  Set up which tokens to override and adjustment strategies.
                </p>
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    Start with conservative settings (±5% adjustment) to test the system.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Reference */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                API Endpoints
              </CardTitle>
              <CardDescription>
                Complete API reference for POL Sandbox services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Price API</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Get Token Prices</h4>
                    <CodeBlock 
                      commandId="get-prices"
                      language="bash"
                      code="GET /api/prices?tokens=USDT-ERC20,USDT-TRC20,USDC,DAI"
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Update Price Override</h4>
                    <CodeBlock 
                      commandId="update-price"
                      language="bash"
                      code="POST /api/prices
Content-Type: application/json

{
  action: updateTokenPrice,
  symbol: USDT,
  targetPrice: 1.05,
  adjustmentFactor: 0.05,
  strategy: moderate
}"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Configuration API</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Get Configuration</h4>
                    <CodeBlock 
                      commandId="get-config"
                      language="bash"
                      code="GET /api/config"
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Update Configuration</h4>
                    <CodeBlock 
                      commandId="update-config"
                      language="bash"
                      code="POST /api/config
Content-Type: application/json

{
  systemEnabled: true,
  priceOverrideEnabled: true,
  adjustmentFactor: 0.05,
  targetTokens: [USDT-ERC20, USDT-TRC20, USDC, DAI]
}"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Integration */}
        <TabsContent value="wallets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Wallet Integration Guide
              </CardTitle>
              <CardDescription>
                How POL Sandbox integrates with different wallet providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Trust Wallet Integration</h3>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Trust Wallet API Override:</strong> When Trust Wallet is checked in the extension settings, 
                    POL Sandbox will override price data specifically for Trust Wallet's built-in dApp browser and swap interfaces.
                    This ensures consistent price adjustments across all Trust Wallet features.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">What gets overridden:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Trust Wallet swap prices</li>
                    <li>• dApp browser price feeds</li>
                    <li>• Portfolio valuations</li>
                    <li>• Token discovery prices</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Supported Wallets</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'MetaMask', 'Trust Wallet', 'Coinbase Wallet', 'SafePal',
                    'WalletConnect', 'Rainbow', 'Phantom', 'Argent'
                  ].map(wallet => (
                    <Badge key={wallet} variant="outline" className="justify-center">
                      {wallet}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Integration Methods</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Browser Extension</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically overrides prices in wallet dApp browsers
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Custom RPC</h4>
                    <p className="text-sm text-muted-foreground">
                      Network-level price interception for wallet connections
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">API Proxy</h4>
                    <p className="text-sm text-muted-foreground">
                      RESTful API integration for custom wallet implementations
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add other tabs as needed */}
        <TabsContent value="browser-extension">
          <Card>
            <CardHeader>
              <CardTitle>Browser Extension</CardTitle>
              <CardDescription>Extension documentation coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Complete browser extension guide will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rpc">
          <Card>
            <CardHeader>
              <CardTitle>RPC Network</CardTitle>
              <CardDescription>RPC configuration documentation coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Complete RPC network guide will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>Code examples documentation coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Complete code examples will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocsPage;