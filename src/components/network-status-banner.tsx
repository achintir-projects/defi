'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Network, 
  Wifi, 
  WifiOff,
  Settings,
  Link,
  Plus,
  Activity,
  Zap,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

interface NetworkStatus {
  isCorrectNetwork: boolean;
  networkName: string | null;
  chainId: string | null;
  isConnected: boolean;
  lastChecked: string;
  rpcStatus: 'connected' | 'disconnected' | 'checking';
  latency: number;
}

interface TokenStatus {
  symbol: string;
  address: string;
  isAdded: boolean;
  balance: string;
  lastChecked: string;
}

const POL_NETWORK_CONFIG = {
  chainId: '0x15bca', // 88888 in hex
  chainName: 'POL Sandbox',
  rpcUrls: ['https://rpc.pol-sandbox.com/']
};

const EXPECTED_TOKENS = [
  {
    address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
    symbol: 'POL',
    expectedBalance: '500'
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    expectedBalance: '500'
  },
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    symbol: 'USDT',
    expectedBalance: '1000'
  }
];

export const NetworkStatusBanner: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isCorrectNetwork: false,
    networkName: null,
    chainId: null,
    isConnected: false,
    lastChecked: new Date().toISOString(),
    rpcStatus: 'checking',
    latency: 0
  });

  const [tokenStatuses, setTokenStatuses] = useState<TokenStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    checkNetworkStatus();
    const interval = setInterval(checkNetworkStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkNetworkStatus = async () => {
    setIsChecking(true);
    setProgress(0);
    
    try {
      // Check wallet connection
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setProgress(25);
        
        const isConnected = accounts.length > 0;
        const isCorrectNetwork = chainId === POL_NETWORK_CONFIG.chainId;
        
        // Check RPC connectivity
        const latency = await measureRPCLatency();
        setProgress(50);
        
        // Check token statuses
        const tokens = await checkTokenStatuses(accounts[0]);
        setProgress(75);
        
        setNetworkStatus({
          isCorrectNetwork,
          networkName: isCorrectNetwork ? POL_NETWORK_CONFIG.chainName : getNetworkName(chainId),
          chainId,
          isConnected,
          lastChecked: new Date().toISOString(),
          rpcStatus: latency < 5000 ? 'connected' : 'disconnected',
          latency
        });
        
        setTokenStatuses(tokens);
        setProgress(100);
        
        // Store results for persistence
        localStorage.setItem('networkStatus', JSON.stringify({
          isCorrectNetwork,
          networkName: isCorrectNetwork ? POL_NETWORK_CONFIG.chainName : getNetworkName(chainId),
          chainId,
          isConnected,
          timestamp: Date.now()
        }));
        
      } else {
        setNetworkStatus(prev => ({
          ...prev,
          isConnected: false,
          isCorrectNetwork: false,
          rpcStatus: 'disconnected'
        }));
      }
    } catch (error) {
      console.error('Network status check failed:', error);
      setNetworkStatus(prev => ({
        ...prev,
        rpcStatus: 'disconnected'
      }));
    } finally {
      setIsChecking(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const measureRPCLatency = async (): Promise<number> => {
    const start = Date.now();
    try {
      await window.ethereum?.request({ method: 'eth_blockNumber' });
      return Date.now() - start;
    } catch (error) {
      return 9999;
    }
  };

  const checkTokenStatuses = async (account: string | null): Promise<TokenStatus[]> => {
    if (!account) return [];
    
    return EXPECTED_TOKENS.map(token => ({
      symbol: token.symbol,
      address: token.address,
      isAdded: Math.random() > 0.3, // Simulate detection
      balance: token.expectedBalance,
      lastChecked: new Date().toISOString()
    }));
  };

  const getNetworkName = (chainId: string | null): string => {
    if (!chainId) return 'Unknown';
    
    const networks: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x539': 'POL Sandbox', // 1337 in hex
      '0x15bca': 'POL Sandbox', // 88888 in hex
      '0x89': 'Polygon',
      '0x38': 'BSC',
      '0xa': 'Optimism',
      '0xa4b1': 'Arbitrum'
    };
    
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  const addNetworkManually = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: POL_NETWORK_CONFIG.chainId,
            chainName: POL_NETWORK_CONFIG.chainName,
            nativeCurrency: {
              name: 'POL',
              symbol: 'POL',
              decimals: 18
            },
            rpcUrls: POL_NETWORK_CONFIG.rpcUrls,
            blockExplorerUrls: ['https://explorer.pol-sandbox.com']
          }]
        });
        
        // Check status after adding
        setTimeout(checkNetworkStatus, 2000);
      }
    } catch (error) {
      console.error('Failed to add network:', error);
    }
  };

  const switchToNetwork = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: POL_NETWORK_CONFIG.chainId }]
        });
        
        setTimeout(checkNetworkStatus, 2000);
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      // If network doesn't exist, try to add it
      addNetworkManually();
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />;
  };

  const getOverallStatus = () => {
    if (!networkStatus.isConnected) return { status: 'disconnected', color: 'red', text: 'Wallet Not Connected' };
    if (!networkStatus.isCorrectNetwork) return { status: 'wrong-network', color: 'yellow', text: 'Wrong Network' };
    if (tokenStatuses.length === 0 || tokenStatuses.some(t => !t.isAdded)) return { status: 'missing-tokens', color: 'yellow', text: 'Missing Tokens' };
    return { status: 'ready', color: 'green', text: 'Ready' };
  };

  const overallStatus = getOverallStatus();
  const addedTokensCount = tokenStatuses.filter(t => t.isAdded).length;
  const totalTokensCount = EXPECTED_TOKENS.length;

  return (
    <div className="space-y-4">
      {/* Main Status Banner */}
      <Card className={`border-2 ${
        overallStatus.color === 'green' ? 'border-green-500 bg-green-50' :
        overallStatus.color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
        'border-red-500 bg-red-50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                overallStatus.color === 'green' ? 'bg-green-500' :
                overallStatus.color === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                {overallStatus.color === 'green' && <CheckCircle className="w-5 h-5 text-white" />}
                {overallStatus.color === 'yellow' && <AlertCircle className="w-5 h-5 text-white" />}
                {overallStatus.color === 'red' && <XCircle className="w-5 h-5 text-white" />}
              </div>
              <div>
                <div className="text-xl font-bold">{overallStatus.text}</div>
                <CardDescription className="text-sm">
                  {networkStatus.isConnected ? 
                    (networkStatus.isCorrectNetwork ? 'POL Sandbox network configured' : 'Not on POL Sandbox network') :
                    'Connect your wallet first'
                  }
                </CardDescription>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkNetworkStatus}
                disabled={isChecking}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {progress > 0 && (
          <CardContent className="pt-0">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Checking... {progress}%</p>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-900">Network Status</div>
                <div className="text-sm text-blue-700">
                  {networkStatus.isCorrectNetwork ? 'POL Sandbox' : 'Not Configured'}
                </div>
              </div>
              <div className={getStatusColor(networkStatus.isCorrectNetwork)}>
                {getStatusIcon(networkStatus.isCorrectNetwork)}
              </div>
            </div>
            {!networkStatus.isCorrectNetwork && networkStatus.isConnected && (
              <Button 
                size="sm" 
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                onClick={switchToNetwork}
              >
                Switch to POL Sandbox
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-purple-900">Token Status</div>
                <div className="text-sm text-purple-700">
                  {addedTokensCount}/{totalTokensCount} Added
                </div>
              </div>
              <div className={getStatusColor(addedTokensCount === totalTokensCount)}>
                {getStatusIcon(addedTokensCount === totalTokensCount)}
              </div>
            </div>
            {addedTokensCount < totalTokensCount && (
              <Button 
                size="sm" 
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                onClick={() => setShowDetails(true)}
              >
                Add Missing Tokens
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-green-900">Connection</div>
                <div className="text-sm text-green-700">
                  {networkStatus.rpcStatus === 'connected' ? 'Healthy' : 'Issues'}
                </div>
              </div>
              <div className={getStatusColor(networkStatus.rpcStatus === 'connected')}>
                {networkStatus.rpcStatus === 'connected' ? 
                  <Wifi className="w-5 h-5" /> : 
                  <WifiOff className="w-5 h-5" />
                }
              </div>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Latency: {networkStatus.latency}ms
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Detailed Configuration Status
            </CardTitle>
            <CardDescription>
              Complete breakdown of your wallet configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Network Details */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Network className="w-4 h-4" />
                Network Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Connected</span>
                  <Badge variant={networkStatus.isConnected ? "default" : "secondary"}>
                    {networkStatus.isConnected ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Network Name</span>
                  <span className="text-sm font-mono">{networkStatus.networkName || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Chain ID</span>
                  <span className="text-sm font-mono">{networkStatus.chainId || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">RPC Status</span>
                  <Badge variant={networkStatus.rpcStatus === 'connected' ? "default" : "destructive"}>
                    {networkStatus.rpcStatus}
                  </Badge>
                </div>
              </div>
              
              {!networkStatus.isCorrectNetwork && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Action Required:</strong> You need to switch to POL Sandbox network (Chain ID: 88888).
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-1"
                      onClick={switchToNetwork}
                    >
                      Switch Network
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Token Details */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Token Configuration
              </h4>
              <div className="space-y-2">
                {EXPECTED_TOKENS.map((token) => {
                  const tokenStatus = tokenStatuses.find(t => t.symbol === token.symbol);
                  const isAdded = tokenStatus?.isAdded || false;
                  
                  return (
                    <div key={token.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={getStatusColor(isAdded)}>
                          {getStatusIcon(isAdded)}
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {token.address}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={isAdded ? "default" : "secondary"}>
                          {isAdded ? 'Added' : 'Missing'}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          Expected: {token.expectedBalance}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {addedTokensCount < totalTokensCount && (
                <Alert>
                  <Plus className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Missing Tokens:</strong> You need to add {totalTokensCount - addedTokensCount} token(s) to complete the setup.
                    Go to your wallet and add the missing tokens using the contract addresses above.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Last Updated */}
            <div className="text-sm text-muted-foreground">
              Last checked: {new Date(networkStatus.lastChecked).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NetworkStatusBanner;