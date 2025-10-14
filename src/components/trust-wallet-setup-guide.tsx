'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SetupProgressTracker } from './setup-progress-tracker';
import { 
  Smartphone, 
  Settings, 
  Plus, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  QrCode,
  Network,
  Coins,
  ArrowRight,
  StepForward,
  Camera,
  Link as LinkIcon
} from 'lucide-react';

const POL_NETWORK_CONFIG = {
  chainId: '88888',
  chainName: 'POL Sandbox',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://rpc.pol-sandbox.com/'],
  blockExplorerUrls: ['https://explorer.pol-sandbox.com']
};

const TOKENS = [
  {
    address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
    symbol: 'POL',
    decimals: 18,
    balance: '500'
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    decimals: 6,
    balance: '500'
  },
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    symbol: 'USDT',
    decimals: 6,
    balance: '1000'
  }
];

export const TrustWalletSetupGuide: React.FC = () => {
  const [copied, setCopied] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => 
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  const isStepCompleted = (step: number) => completedSteps.includes(step);

  return (
    <div className="space-y-6">
      {/* Progress Tracker */}
      <SetupProgressTracker />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Trust Wallet Complete Setup Guide
          </CardTitle>
          <CardDescription>
            Step-by-step instructions to configure Trust Wallet for POL Sandbox
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manual">Manual Setup</TabsTrigger>
              <TabsTrigger value="qr">QR Code Setup</TabsTrigger>
              <TabsTrigger value="troubleshoot">Troubleshooting</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-6">
              {/* Step 1: Add Network */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isStepCompleted(1) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isStepCompleted(1) ? <CheckCircle className="w-4 h-4" /> : '1'}
                      </div>
                      Add POL Sandbox Network
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markStepComplete(1)}
                    >
                      {isStepCompleted(1) ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Open Trust Wallet</p>
                        <p className="text-sm text-muted-foreground">Launch the Trust Wallet app on your device</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Go to Settings</p>
                        <p className="text-sm text-muted-foreground">Tap the gear icon in the bottom-right corner</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Select "Networks"</p>
                        <p className="text-sm text-muted-foreground">Find and tap on "Networks" in the settings menu</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Tap "Add Network"</p>
                        <p className="text-sm text-muted-foreground">In the top-right corner, tap the "+" button</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        5
                      </div>
                      <div>
                        <p className="font-medium">Enter Network Details</p>
                        <p className="text-sm text-muted-foreground">Fill in the following information:</p>
                      </div>
                    </div>
                  </div>

                  {/* Network Configuration Details */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-semibold">Network Configuration</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Network Name</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-2 bg-white border rounded font-mono text-sm">
                            POL Sandbox
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard('POL Sandbox', 'name')}
                          >
                            {copied === 'name' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Chain ID</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-2 bg-white border rounded font-mono text-sm">
                            88888
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard('88888', 'chainid')}
                          >
                            {copied === 'chainid' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">RPC URL</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-2 bg-white border rounded font-mono text-xs break-all">
                            https://rpc.pol-sandbox.com/
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard('https://rpc.pol-sandbox.com/', 'rpc')}
                          >
                            {copied === 'rpc' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Symbol</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-2 bg-white border rounded font-mono text-sm">
                            POL
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard('POL', 'symbol')}
                          >
                            {copied === 'symbol' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full" onClick={() => copyToClipboard(JSON.stringify(POL_NETWORK_CONFIG, null, 2), 'full')}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Full Configuration
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Add Tokens */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isStepCompleted(2) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isStepCompleted(2) ? <CheckCircle className="w-4 h-4" /> : '2'}
                      </div>
                      Add Tokens to Wallet
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markStepComplete(2)}
                    >
                      {isStepCompleted(2) ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Switch to POL Sandbox Network</p>
                        <p className="text-sm text-muted-foreground">Make sure you're on the POL Sandbox network</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Go to Wallet Tab</p>
                        <p className="text-sm text-muted-foreground">Tap the wallet icon at the bottom</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Tap "Add Token"</p>
                        <p className="text-sm text-muted-foreground">In the top-right corner, tap the "+" button</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Select "Custom Token"</p>
                        <p className="text-sm text-muted-foreground">Choose the custom token option</p>
                      </div>
                    </div>
                  </div>

                  {/* Token Configuration Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Token Contract Addresses</h4>
                    
                    {TOKENS.map((token, index) => (
                      <div key={token.symbol} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium flex items-center gap-2">
                            <Coins className="w-4 h-4" />
                            {token.symbol} ({token.balance} tokens)
                          </h5>
                          <Badge variant="outline">Token {index + 1}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium w-20">Address:</label>
                            <div className="flex-1 p-2 bg-white border rounded font-mono text-xs break-all">
                              {token.address}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(token.address, token.symbol)}
                            >
                              {copied === token.symbol ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium w-20">Symbol:</label>
                            <div className="flex-1 p-2 bg-white border rounded font-mono text-sm">
                              {token.symbol}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium w-20">Decimals:</label>
                            <div className="flex-1 p-2 bg-white border rounded font-mono text-sm">
                              {token.decimals}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Verification */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isStepCompleted(3) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {isStepCompleted(3) ? <CheckCircle className="w-4 h-4" /> : '3'}
                      </div>
                      Verify Setup
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markStepComplete(3)}
                    >
                      {isStepCompleted(3) ? 'Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Check Network</p>
                        <p className="text-sm text-muted-foreground">Ensure POL Sandbox is selected as the active network</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Check Tokens</p>
                        <p className="text-sm text-muted-foreground">Verify POL, USDC, and USDT appear in your wallet</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Check Balances</p>
                        <p className="text-sm text-muted-foreground">Confirm the expected token amounts are showing</p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Setup Complete!</strong> Your Trust Wallet is now configured for POL Sandbox. 
                      You can now connect to dApps and use your tokens.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    QR Code Setup Options
                  </CardTitle>
                  <CardDescription>
                    Choose the QR code format that works best with your scanner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Camera className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Trust Wallet's built-in scanner may not automatically add networks and tokens. 
                      Use the manual setup above for guaranteed results.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Complete Format</CardTitle>
                        <Badge variant="outline">Best for mobile cameras</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Includes network and all tokens in one QR code
                        </p>
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                          <QrCode className="w-16 h-16 text-gray-400" />
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Generate QR
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Simple Format</CardTitle>
                        <Badge variant="outline">Universal compatibility</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Basic connection info compatible with all scanners
                        </p>
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                          <QrCode className="w-16 h-16 text-gray-400" />
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Generate QR
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Direct Format</CardTitle>
                        <Badge variant="outline">Trust Wallet optimized</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Direct link format for Trust Wallet app
                        </p>
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                          <LinkIcon className="w-16 h-16 text-gray-400" />
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Open Direct Link
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="troubleshoot" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Troubleshooting Common Issues
                  </CardTitle>
                  <CardDescription>
                    Solutions for common Trust Wallet setup problems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        Network Not Appearing
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        The POL Sandbox network doesn't show in the network list.
                      </p>
                      <div className="text-sm space-y-1">
                        <p><strong>Solution:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Double-check the Chain ID (88888)</li>
                          <li>Ensure RPC URL is correct: https://rpc.pol-sandbox.com/</li>
                          <li>Try restarting Trust Wallet</li>
                          <li>Check for typos in network name</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        Tokens Not Showing
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Added tokens but they don't appear in the wallet.
                      </p>
                      <div className="text-sm space-y-1">
                        <p><strong>Solution:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Verify you're on POL Sandbox network</li>
                          <li>Check contract address for typos</li>
                          <li>Ensure correct decimal places</li>
                          <li>Refresh wallet by pulling down</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        QR Code Not Working
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        QR code scanner doesn't recognize the code.
                      </p>
                      <div className="text-sm space-y-1">
                        <p><strong>Solution:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Try different QR code format</li>
                          <li>Use phone's built-in camera app</li>
                          <li>Ensure good lighting and focus</li>
                          <li>Try manual setup as fallback</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        Connection Issues
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Can't connect to dApps or having transaction issues.
                      </p>
                      <div className="text-sm space-y-1">
                        <p><strong>Solution:</strong></p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Check network connectivity</li>
                          <li>Verify RPC server is accessible</li>
                          <li>Clear Trust Wallet cache</li>
                          <li>Re-add network if necessary</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <ExternalLink className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Still having issues?</strong> Contact Trust Wallet support or visit our 
                      <Button variant="link" className="p-0 h-auto ml-1">
                        help center
                      </Button>
                      for additional assistance.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustWalletSetupGuide;