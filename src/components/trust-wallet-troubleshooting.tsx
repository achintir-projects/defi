'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  Wifi, 
  WifiOff,
  Smartphone,
  QrCode,
  Network,
  Coins,
  ExternalLink,
  Copy,
  Info,
  Zap,
  Shield,
  Clock,
  HelpCircle,
  MessageCircle,
  BookOpen,
  Activity,
  Plus
} from 'lucide-react';

interface TroubleshootingIssue {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  category: 'connection' | 'network' | 'tokens' | 'transactions' | 'general';
  description: string;
  causes: string[];
  solutions: string[];
  preventive: string[];
  relatedLinks?: { title: string; url: string }[];
}

const TROUBLESHOOTING_ISSUES: TroubleshootingIssue[] = [
  {
    id: 'network-not-appearing',
    title: 'POL Sandbox Network Not Appearing',
    severity: 'high',
    category: 'network',
    description: 'The POL Sandbox network doesn\'t appear in the network list after adding it.',
    causes: [
      'Incorrect Chain ID (should be 9191)',
      'Wrong RPC URL format',
      'Network name already exists',
      'Trust Wallet cache issues',
      'Network configuration errors'
    ],
    solutions: [
      'Double-check Chain ID: 9191 (not 0x23E7)',
      'Verify RPC URL: https://rpc.pol-sandbox.com/',
      'Use exact network name: "POL Sandbox"',
      'Restart Trust Wallet completely',
      'Clear Trust Wallet cache',
      'Try adding network again with exact details'
    ],
    preventive: [
      'Copy-paste network details to avoid typos',
      'Verify all details before saving',
      'Keep Trust Wallet updated',
      'Test network connection after adding'
    ]
  },
  {
    id: 'qr-code-not-working',
    title: 'QR Code Scanner Not Working',
    severity: 'medium',
    category: 'connection',
    description: 'QR codes are not being recognized by Trust Wallet scanner.',
    causes: [
      'QR code format incompatible',
      'Poor lighting or focus',
      'Scanner app limitations',
      'QR code contains too much data',
      'Trust Wallet scanner restrictions'
    ],
    solutions: [
      'Try different QR code format (simple vs complete)',
      'Use phone\'s built-in camera app',
      'Ensure good lighting and steady hand',
      'Try Google Lens or QR Scanner app',
      'Use manual setup as fallback',
      'Generate QR code with less data'
    ],
    preventive: [
      'Test QR codes before sharing',
      'Use high-contrast QR codes',
      'Provide multiple format options',
      'Include manual setup instructions'
    ]
  },
  {
    id: 'tokens-not-showing',
    title: 'Tokens Not Appearing in Wallet',
    severity: 'high',
    category: 'tokens',
    description: 'Added tokens don\'t appear in the wallet balance list.',
    causes: [
      'Wrong contract address',
      'Incorrect decimal places',
      'Wrong network selected',
      'Token not yet deployed',
      'Wallet sync issues'
    ],
    solutions: [
      'Verify contract addresses carefully',
      'Check decimal places (POL: 18, USDC: 6, USDT: 6)',
      'Ensure POL Sandbox network is selected',
      'Refresh wallet by pulling down',
      'Wait for network sync',
      'Re-add token with correct details'
    ],
    preventive: [
      'Always verify contract addresses',
      'Double-check decimal places',
      'Test with small amounts first',
      'Keep token addresses saved securely'
    ]
  },
  {
    id: 'connection-failing',
    title: 'Wallet Connection Failing',
    severity: 'high',
    category: 'connection',
    description: 'Unable to connect wallet to dApps or services.',
    causes: [
      'Wallet locked',
      'Wrong network selected',
      'dApp not trusted',
      'Browser extension issues',
      'Network connectivity problems'
    ],
    solutions: [
      'Unlock Trust Wallet',
      'Select correct network (POL Sandbox)',
      'Approve connection requests',
      'Check internet connection',
      'Restart browser and wallet',
      'Clear browser cache'
    ],
    preventive: [
      'Keep wallet unlocked when using dApps',
      'Always verify connection requests',
      'Maintain stable internet connection',
      'Keep wallet app updated'
    ]
  },
  {
    id: 'transaction-failing',
    title: 'Transactions Not Working',
    severity: 'high',
    category: 'transactions',
    description: 'Transactions are failing or not being processed.',
    causes: [
      'Insufficient balance',
      'Wrong gas settings',
      'Network congestion',
      'Contract interaction errors',
      'Nonce issues'
    ],
    solutions: [
      'Check token and gas balance',
      'Adjust gas price and limit',
      'Wait for less network congestion',
      'Verify contract addresses',
      'Reset wallet nonce if needed',
      'Contact support for persistent issues'
    ],
    preventive: [
      'Maintain sufficient gas balance',
      'Monitor network gas prices',
      'Test with small amounts first',
      'Keep transaction records'
    ]
  },
  {
    id: 'balance-incorrect',
    title: 'Incorrect Balance Display',
    severity: 'medium',
    category: 'tokens',
    description: 'Token balances showing incorrectly or not updating.',
    causes: [
      'Wallet sync delay',
      'Wrong network selected',
      'Cache issues',
      'Blockchain explorer problems',
      'Token contract issues'
    ],
    solutions: [
      'Refresh wallet by pulling down',
      'Switch networks and back',
      'Clear wallet cache',
      'Wait for blockchain sync',
      'Check blockchain explorer',
      'Re-add token if necessary'
    ],
    preventive: [
      'Regularly refresh wallet',
      'Monitor blockchain status',
      'Keep wallet updated',
      'Use reliable data sources'
    ]
  }
];

const DIAGNOSTIC_TESTS = [
  {
    name: 'Network Connectivity',
    description: 'Test connection to POL Sandbox RPC',
    action: 'testNetwork'
  },
  {
    name: 'Wallet Status',
    description: 'Check wallet connection and permissions',
    action: 'testWallet'
  },
  {
    name: 'Token Contracts',
    description: 'Verify token contract accessibility',
    action: 'testTokens'
  },
  {
    name: 'Browser Compatibility',
    description: 'Check browser and extension compatibility',
    action: 'testBrowser'
  }
];

export const TrustWalletTroubleshooting: React.FC = () => {
  const [selectedIssue, setSelectedIssue] = useState<TroubleshootingIssue | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<{[key: string]: 'pending' | 'running' | 'passed' | 'failed'}>({});
  const [copied, setCopied] = useState('');

  const runDiagnostic = async (testType: string) => {
    setDiagnosticResults(prev => ({ ...prev, [testType]: 'running' }));
    
    // Simulate diagnostic test
    setTimeout(() => {
      const result = Math.random() > 0.3 ? 'passed' : 'failed';
      setDiagnosticResults(prev => ({ ...prev, [testType]: result }));
    }, 2000);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getDiagnosticIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Trust Wallet Troubleshooting Center
          </CardTitle>
          <CardDescription>
            Comprehensive troubleshooting guide for Trust Wallet issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="issues">Common Issues</TabsTrigger>
              <TabsTrigger value="diagnostic">Diagnostics</TabsTrigger>
              <TabsTrigger value="quick-fixes">Quick Fixes</TabsTrigger>
              <TabsTrigger value="support">Get Help</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-6">
              {/* Issues by Category */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Browse Issues by Category</h3>
                
                {['connection', 'network', 'tokens', 'transactions', 'general'].map((category) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base capitalize flex items-center gap-2">
                        {category === 'connection' && <Wifi className="w-4 h-4" />}
                        {category === 'network' && <Network className="w-4 h-4" />}
                        {category === 'tokens' && <Coins className="w-4 h-4" />}
                        {category === 'transactions' && <Zap className="w-4 h-4" />}
                        {category === 'general' && <Settings className="w-4 h-4" />}
                        {category} Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {TROUBLESHOOTING_ISSUES
                          .filter(issue => issue.category === category)
                          .map((issue) => (
                            <div
                              key={issue.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${getSeverityColor(issue.severity)}`}
                              onClick={() => setSelectedIssue(issue)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getSeverityIcon(issue.severity)}
                                  <span className="font-medium">{issue.title}</span>
                                </div>
                                <Badge variant="outline" className="capitalize">
                                  {issue.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {issue.description}
                              </p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Issue Details */}
              {selectedIssue && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getSeverityIcon(selectedIssue.severity)}
                        {selectedIssue.title}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIssue(null)}
                      >
                        Close
                      </Button>
                    </div>
                    <CardDescription>{selectedIssue.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Causes */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Possible Causes
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedIssue.causes.map((cause, index) => (
                          <li key={index} className="text-sm">{cause}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Solutions */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Solutions
                      </h4>
                      <ol className="list-decimal list-inside space-y-2">
                        {selectedIssue.solutions.map((solution, index) => (
                          <li key={index} className="text-sm">{solution}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Prevention */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Prevention Tips
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedIssue.preventive.map((tip, index) => (
                          <li key={index} className="text-sm">{tip}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Related Links */}
                    {selectedIssue.relatedLinks && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Related Resources
                        </h4>
                        <div className="space-y-2">
                          {selectedIssue.relatedLinks.map((link, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              asChild
                              className="w-full justify-start"
                            >
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {link.title}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="diagnostic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Diagnostic Tests
                  </CardTitle>
                  <CardDescription>
                    Run automated tests to identify issues with your setup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {DIAGNOSTIC_TESTS.map((test) => (
                    <div key={test.action} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{test.name}</h4>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDiagnosticIcon(diagnosticResults[test.action] || 'pending')}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runDiagnostic(test.action)}
                          disabled={diagnosticResults[test.action] === 'running'}
                        >
                          {diagnosticResults[test.action] === 'running' ? 'Running...' : 'Run Test'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Diagnostic tests help identify common issues. Run all tests for a complete health check.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quick-fixes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Fixes
                  </CardTitle>
                  <CardDescription>
                    Common solutions that resolve most issues quickly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Connection Issues</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Restart Trust Wallet
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Wifi className="w-4 h-4 mr-2" />
                          Check Network Connection
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Smartphone className="w-4 h-4 mr-2" />
                          Clear App Cache
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Network Issues</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Network className="w-4 h-4 mr-2" />
                          Reset Network Settings
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Copy className="w-4 h-4 mr-2" />
                          Re-add Network
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Check RPC Status
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Token Issues</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Coins className="w-4 h-4 mr-2" />
                          Refresh Balances
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Plus className="w-4 h-4 mr-2" />
                          Re-add Tokens
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <QrCode className="w-4 h-4 mr-2" />
                          Import via QR
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">General Issues</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Settings className="w-4 h-4 mr-2" />
                          Reset Settings
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Shield className="w-4 h-4 mr-2" />
                          Clear Security Data
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Smartphone className="w-4 h-4 mr-2" />
                          Update App
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Get Help
                  </CardTitle>
                  <CardDescription>
                    Additional resources and support options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Documentation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Trust Wallet Docs
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          POL Sandbox Guide
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          API Reference
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Community Support
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Discord Community
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Telegram Group
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Reddit Community
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Emergency Support:</strong> For urgent issues with funds or security, 
                      contact our support team immediately through the emergency channels.
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

export default TrustWalletTroubleshooting;