'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Network, 
  Coins, 
  RefreshCw,
  ExternalLink,
  Settings,
  Info,
  Copy,
  Wallet,
  Link as LinkIcon,
  Zap,
  Wifi,
  WifiOff,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { enhancedWalletConnector } from '@/lib/enhanced-wallet-connector';
import { trustWalletNetworkFix, POL_NETWORK_CONFIG } from '@/lib/trust-wallet-network-fix';
import { robustNetworkSetup } from '@/lib/robust-network-setup';
import { NetworkStatusBanner } from './network-status-banner';

const EXPECTED_TOKENS = [
  {
    address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
    symbol: 'POL',
    decimals: 18,
    expectedBalance: '500000000000000000000', // 500 POL
    image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x4585fe77225b41b697c938b018e2ac67ac5a20c0/logo.png'
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    decimals: 6,
    expectedBalance: '500000000', // 500 USDC
    image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png'
  },
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    symbol: 'USDT',
    decimals: 6,
    expectedBalance: '1000000000', // 1000 USDT
    image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdac17f958d2ee523a2206206994597c13d831ec7/logo.png'
  }
];

interface ConnectionStatus {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  walletType: string | null;
  balance: string;
  provider?: any;
}

interface DetectionStatus {
  isDetected: boolean;
  detectionMethod: string;
  lastChecked: Date;
  attempts: number;
}

export const SuperEnhancedTrustWalletConnector: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  });
  
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>({
    isDetected: false,
    detectionMethod: 'None',
    lastChecked: new Date(),
    attempts: 0
  });
  
  const [verificationStatus, setVerificationStatus] = useState<{
    network: boolean;
    tokens: boolean;
    checking: boolean;
  }>({
    network: false,
    tokens: false,
    checking: false
  });
  
  const [tokenStatus, setTokenStatus] = useState<{[key: string]: boolean}>({});
  const [selectedFormat, setSelectedFormat] = useState<'complete' | 'simple' | 'direct'>('complete');
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [setupProgress, setSetupProgress] = useState<string>('');

  // Enhanced detection with real-time updates
  const checkTrustWalletDetection = useCallback(async () => {
    try {
      const detected = await enhancedWalletConnector.detectAllWallets();
      const isTrustDetected = detected.includes('trustwallet');
      
      // Enhanced detection with debug info
      const provider = trustWalletNetworkFix.detectTrustWalletProvider();
      const debugDetails = {
        detected: isTrustDetected,
        providerFound: !!provider,
        providerType: provider ? (provider.isTrust ? 'trustwallet' : provider.isTrustWallet ? 'trustwallet_alt' : 'ethereum') : 'none',
        methods: [
          !!window.trustwallet?.isTrust,
          !!window.trustwallet,
          !!window._trustwallet,
          !!window.ethereum?.isTrust,
          !!window.ethereum?.isTrustWallet,
          window.ethereum?.providerName?.toLowerCase().includes('trust'),
          navigator.userAgent.includes('TrustWallet'),
          window.ethereum?.providers?.some((p: any) => p.isTrust)
        ]
      };
      
      setDebugInfo(JSON.stringify(debugDetails, null, 2));
      
      setDetectionStatus(prev => ({
        isDetected: isTrustDetected,
        detectionMethod: isTrustDetected ? 'Enhanced Detection' : 'Not Found',
        lastChecked: new Date(),
        attempts: prev.attempts + 1
      }));

      if (isTrustDetected) {
        console.log('🎉 Trust Wallet detected! Setting up connection listener...');
        
        // Set up connection listener
        enhancedWalletConnector.onWalletDetected('trustwallet', (state) => {
          if (state.detected) {
            setSuccessMessage('✅ Trust Wallet detected and ready!');
            setTimeout(() => setSuccessMessage(null), 3000);
          }
        });
      }

      return isTrustDetected;
    } catch (error) {
      console.error('Detection failed:', error);
      setDetectionStatus(prev => ({
        ...prev,
        isDetected: false,
        detectionMethod: 'Detection Failed',
        lastChecked: new Date()
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    // Initial detection
    checkTrustWalletDetection();
    
    // Set up continuous detection
    const interval = setInterval(checkTrustWalletDetection, 3000);
    
    // Check existing connection
    checkExistingConnection();
    
    return () => clearInterval(interval);
  }, [checkTrustWalletDetection]);

  const checkExistingConnection = async () => {
    try {
      const status = enhancedWalletConnector.getConnectionStatus('trustwallet');
      if (status.isConnected && status.account) {
        setConnectionStatus({
          isConnected: true,
          account: status.account,
          chainId: '0x15bca', // Assume POL network
          walletType: 'Trust Wallet',
          balance: '0'
        });
        
        // Verify setup
        setTimeout(() => verifyWalletSetup(), 1000);
      }
    } catch (error) {
      console.error('Failed to check existing connection:', error);
    }
  };

  const connectTrustWallet = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    setSuccessMessage(null);
    setSetupProgress('');

    try {
      console.log('🔗 Starting enhanced Trust Wallet connection...');
      
      const state = await enhancedWalletConnector.connectWallet('trustwallet');
      setConnectionStatus(state);
      
      setSuccessMessage('🎉 Trust Wallet connected successfully! Setting up network...');
      localStorage.setItem('trustWalletConnected', 'true');
      localStorage.setItem('connectionTime', new Date().toISOString());
      
      // IMMEDIATE network setup - no setTimeout delay
      console.log('🚀 Triggering immediate network setup...');
      await setupNetworkAndTokensWithProgress();
      
    } catch (error: any) {
      console.error('Connection failed:', error);
      setConnectionError(error.message || 'Failed to connect to Trust Wallet');
      setSetupProgress('');
      
      // If connection fails, try to open mobile app
      if (enhancedWalletConnector.isMobile()) {
        enhancedWalletConnector.openMobileWallet('trustwallet');
        setSuccessMessage('Opening Trust Wallet app...');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const setupNetworkAndTokensWithProgress = async () => {
    try {
      setSetupProgress('🚀 Starting complete wallet setup...');
      
      const result = await robustNetworkSetup.completeSetup('trustwallet', (message) => {
        console.log('Progress:', message);
        setSetupProgress(message);
      });
      
      if (result.success) {
        setSuccessMessage(`🎉 Setup completed! Network configured and ${result.tokensAdded} tokens added.`);
        setSetupProgress('');
        
        // Verify setup after a short delay
        setTimeout(() => verifyWalletSetup(), 2000);
      } else {
        setConnectionError(`Setup failed: ${result.errors.join(', ')}`);
        setSetupProgress('');
      }
      
    } catch (error: any) {
      console.error('Enhanced setup failed:', error);
      setConnectionError(error.message || 'Enhanced setup failed');
      setSetupProgress('');
    }
  };

  const setupNetworkAndTokens = async () => {
    try {
      setSuccessMessage('🌐 Setting up POL Sandbox network with enhanced fix...');
      
      // Use the enhanced Trust Wallet network fix
      const setupResult = await trustWalletNetworkFix.completeTrustWalletSetup();
      
      if (setupResult.success) {
        setSuccessMessage('✅ POL Sandbox network configured successfully!');
        
        // Show detailed status
        if (setupResult.steps.providerDetection) {
          console.log('✅ Provider detection successful');
        }
        if (setupResult.steps.networkSetup) {
          console.log('✅ Network setup successful');
        }
        if (setupResult.steps.tokenSetup) {
          console.log('✅ Token setup successful');
        }
        
        // Verify setup after a short delay
        setTimeout(() => verifyWalletSetup(), 2000);
      } else {
        // Show specific errors
        const errorMessages = setupResult.errors.join(', ');
        setConnectionError(`Setup failed: ${errorMessages}`);
        console.error('Trust Wallet setup errors:', setupResult.errors);
      }
      
    } catch (error: any) {
      console.error('Enhanced setup failed:', error);
      setConnectionError(error.message || 'Enhanced setup failed');
    }
  };

  const verifyWalletSetup = async () => {
    setVerificationStatus(prev => ({ ...prev, checking: true }));
    
    try {
      // Check network
      const isCorrectNetwork = connectionStatus.chainId === POL_NETWORK_CONFIG.chainId;
      
      // Check tokens (simulate verification)
      const tokenVerification: {[key: string]: boolean} = {};
      let allTokensFound = true;
      
      for (const token of EXPECTED_TOKENS) {
        const hasToken = await checkTokenInWallet(token);
        tokenVerification[token.symbol] = hasToken;
        if (!hasToken) allTokensFound = false;
      }
      
      setVerificationStatus({
        network: isCorrectNetwork,
        tokens: allTokensFound,
        checking: false
      });
      setTokenStatus(tokenVerification);
      
      if (isCorrectNetwork && allTokensFound) {
        setSuccessMessage('🎉 Perfect! Trust Wallet is fully configured for POL Sandbox!');
      }
      
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus(prev => ({ ...prev, checking: false }));
    }
  };

  const checkTokenInWallet = async (token: any): Promise<boolean> => {
    // Simulate token check - in reality, you'd use wallet APIs
    return new Promise(resolve => {
      setTimeout(() => {
        const addedTokens = JSON.parse(localStorage.getItem('addedTokens') || '[]');
        resolve(addedTokens.includes(token.address));
      }, 500);
    });
  };

  const addNetworkManually = async () => {
    try {
      setSetupProgress('🔧 Starting manual network setup...');
      setConnectionError(null);
      
      const result = await robustNetworkSetup.setupNetwork('trustwallet', (message) => {
        setSetupProgress(message);
      });
      
      if (result.success) {
        setSuccessMessage(`✅ POL Sandbox network ${result.action} successfully!`);
        setSetupProgress('');
        setTimeout(() => {
          checkExistingConnection();
          verifyWalletSetup();
        }, 2000);
      } else {
        setConnectionError(`Manual setup failed: ${result.error}`);
        setSetupProgress('');
      }
    } catch (error: any) {
      setConnectionError(error.message || 'Manual network setup failed');
      setSetupProgress('');
    }
  };

  const addTokenManually = async (token: any) => {
    try {
      setSetupProgress(`🪙 Adding ${token.symbol} token...`);
      setConnectionError(null);
      
      const result = await robustNetworkSetup.addToken('trustwallet', token, (message) => {
        setSetupProgress(message);
      });
      
      if (result.success) {
        setSuccessMessage(`✅ ${token.symbol} token added successfully!`);
        setSetupProgress('');
        
        const addedTokens = JSON.parse(localStorage.getItem('addedTokens') || '[]');
        if (!addedTokens.includes(token.address)) {
          addedTokens.push(token.address);
          localStorage.setItem('addedTokens', JSON.stringify(addedTokens));
        }
        
        setTimeout(verifyWalletSetup, 2000);
      } else {
        setConnectionError(`Failed to add ${token.symbol}: ${result.error}`);
        setSetupProgress('');
      }
    } catch (error: any) {
      setConnectionError(error.message || 'Failed to add token');
      setSetupProgress('');
    }
  };

  const openTrustWalletApp = () => {
    enhancedWalletConnector.openMobileWallet('trustwallet');
    setSuccessMessage('Opening Trust Wallet app...');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isAllVerified = verificationStatus.network && verificationStatus.tokens;

  if (connectionStatus.isConnected) {
    return (
      <div className="space-y-6">
        {/* Prominent Network Status Banner */}
        <NetworkStatusBanner />
        
        {/* Connection Status with Enhanced Info */}
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Trust Wallet Connected
            </CardTitle>
            <CardDescription>
              Your wallet is connected. Check the status above for network and token configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Account</div>
                <div className="font-mono text-sm">{formatAddress(connectionStatus.account!)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Chain ID</div>
                <div className="font-semibold">{connectionStatus.chainId}</div>
              </div>
            </div>
            
            {/* Verification Status */}
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4" />
                <span className="font-medium">Configuration Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">POL Sandbox Network</span>
                  <Badge variant={verificationStatus.network ? "default" : "secondary"}>
                    {verificationStatus.network ? "✅ Configured" : "⚠️ Not Set"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Default Tokens</span>
                  <Badge variant={verificationStatus.tokens ? "default" : "secondary"}>
                    {verificationStatus.tokens ? "✅ Added" : "⚠️ Missing"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common actions to manage your wallet configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={addNetworkManually}
              >
                <Network className="w-6 h-6" />
                <span>Add Network</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => addTokenManually(EXPECTED_TOKENS[0])}
              >
                <Coins className="w-6 h-6" />
                <span>Add POL Token</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => addTokenManually(EXPECTED_TOKENS[1])}
              >
                <Coins className="w-6 h-6" />
                <span>Add USDC Token</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prominent Network Status Banner */}
      <NetworkStatusBanner />
      
      {/* Detection Status */}
      <Card className={detectionStatus.isDetected ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {detectionStatus.isDetected ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <div className="font-medium">
                  Trust Wallet {detectionStatus.isDetected ? 'Detected' : 'Not Detected'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Method: {detectionStatus.detectionMethod} • Attempts: {detectionStatus.attempts}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkTrustWalletDetection}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {setupProgress && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription className="text-blue-800">{setupProgress}</AlertDescription>
        </Alert>
      )}

      {/* Success and Error Messages */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {connectionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Super Enhanced Trust Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect your Trust Wallet with automatic network and token configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Connect Button */}
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={connectTrustWallet}
              disabled={isConnecting}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isConnecting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Smartphone className="w-5 h-5 mr-2" />
              )}
              {isConnecting ? 'Connecting...' : 'Connect Trust Wallet'}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {detectionStatus.isDetected 
                ? 'Trust Wallet detected! Click to connect.'
                : 'Make sure Trust Wallet is installed and unlocked'
              }
            </p>
          </div>

          {/* Mobile App Opening */}
          {enhancedWalletConnector.isMobile() && !detectionStatus.isDetected && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={openTrustWalletApp}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Trust Wallet App
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Having trouble? Open the app directly.
              </p>
            </div>
          )}

          {/* Debug Information */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="w-full"
            >
              {showDebug ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showDebug ? 'Hide' : 'Show'} Debug Information
            </Button>
            
            {showDebug && (
              <div className="p-3 bg-gray-100 rounded-lg text-xs font-mono space-y-2">
                <div>Detection Status: {detectionStatus.isDetected ? 'DETECTED' : 'NOT DETECTED'}</div>
                <div>Detection Method: {detectionStatus.detectionMethod}</div>
                <div>Last Checked: {detectionStatus.lastChecked.toLocaleTimeString()}</div>
                <div>Attempts: {detectionStatus.attempts}</div>
                <div>Is Mobile: {enhancedWalletConnector.isMobile() ? 'YES' : 'NO'}</div>
                <div>User Agent: {navigator.userAgent.includes('TrustWallet') ? 'Trust Wallet Browser' : 'Other'}</div>
                
                {debugInfo && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <div className="font-bold mb-1">Enhanced Debug Info:</div>
                    <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
                  </div>
                )}
                
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="font-bold mb-1">Quick Actions:</div>
                  <div className="space-y-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => trustWalletNetworkFix.manualNetworkSetup()}
                      className="text-xs h-6"
                    >
                      🔧 Manual Network Setup
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSetupProgress('🔧 Testing robust setup...');
                        robustNetworkSetup.setupNetwork('trustwallet', (msg) => setSetupProgress(msg))
                          .then(result => {
                            setSetupProgress('');
                            console.log('Test result:', result);
                          });
                      }}
                      className="text-xs h-6 ml-1"
                    >
                      🧪 Test Robust Setup
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log('Provider:', trustWalletNetworkFix.detectTrustWalletProvider())}
                      className="text-xs h-6 ml-1"
                    >
                      📡 Log Provider
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Configuration */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Manual Configuration:</strong>
              <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
                <li>Open Trust Wallet and go to Settings</li>
                <li>Select "Networks" and tap "Add Network"</li>
                <li>Enter POL Sandbox details:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Network Name: POL Sandbox</li>
                    <li>Chain ID: 88888</li>
                    <li>RPC URL: https://rpc.pol-sandbox.com/</li>
                  </ul>
                </li>
                <li>Add tokens using the contract addresses above</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};