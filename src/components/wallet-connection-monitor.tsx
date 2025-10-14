'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Activity,
  Network,
  Coins,
  Wallet,
  Settings,
  Info
} from 'lucide-react';

interface ConnectionStatus {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  walletType: string | null;
  balance: string;
  lastConnected: string | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

interface TokenStatus {
  symbol: string;
  address: string;
  balance: string;
  isAdded: boolean;
  lastChecked: string;
}

interface MonitoringData {
  status: ConnectionStatus;
  tokens: TokenStatus[];
  networkLatency: number;
  isMonitoring: boolean;
  lastUpdate: string;
  issues: string[];
}

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

export const WalletConnectionMonitor: React.FC = () => {
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    status: {
      isConnected: false,
      account: null,
      chainId: null,
      walletType: null,
      balance: '0',
      lastConnected: null,
      connectionQuality: 'disconnected'
    },
    tokens: [],
    networkLatency: 0,
    isMonitoring: false,
    lastUpdate: new Date().toISOString(),
    issues: []
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);

  const startMonitoring = () => {
    setMonitoringData(prev => ({ ...prev, isMonitoring: true }));
    
    // Initial check
    checkConnectionStatus();
    
    // Set up periodic monitoring
    const interval = setInterval(() => {
      checkConnectionStatus();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  };

  const stopMonitoring = () => {
    setMonitoringData(prev => ({ ...prev, isMonitoring: false }));
  };

  const checkConnectionStatus = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        const isConnected = accounts.length > 0;
        const connectionQuality = assessConnectionQuality(isConnected, chainId);
        
        const newStatus: ConnectionStatus = {
          isConnected,
          account: accounts[0] || null,
          chainId: chainId || null,
          walletType: 'Trust Wallet',
          balance: '0', // Would fetch actual balance
          lastConnected: isConnected ? new Date().toISOString() : monitoringData.status.lastConnected,
          connectionQuality
        };

        const tokenStatuses = await checkTokenStatuses(accounts[0]);
        const latency = await measureNetworkLatency();
        const issues = detectIssues(newStatus, tokenStatuses);

        setMonitoringData({
          status: newStatus,
          tokens: tokenStatuses,
          networkLatency: latency,
          isMonitoring: true,
          lastUpdate: new Date().toISOString(),
          issues
        });
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setMonitoringData(prev => ({
        ...prev,
        status: {
          ...prev.status,
          isConnected: false,
          connectionQuality: 'disconnected'
        },
        issues: [...prev.issues, 'Connection check failed']
      }));
    }
  };

  const assessConnectionQuality = (isConnected: boolean, chainId: string | null): 'excellent' | 'good' | 'poor' | 'disconnected' => {
    if (!isConnected) return 'disconnected';
    if (chainId === '0x15bca') return 'excellent'; // POL Sandbox
    if (chainId) return 'good';
    return 'poor';
  };

  const checkTokenStatuses = async (account: string | null): Promise<TokenStatus[]> => {
    if (!account) return [];

    return EXPECTED_TOKENS.map(token => ({
      symbol: token.symbol,
      address: token.address,
      balance: token.expectedBalance, // Would fetch actual balance
      isAdded: Math.random() > 0.3, // Simulate token detection
      lastChecked: new Date().toISOString()
    }));
  };

  const measureNetworkLatency = async (): Promise<number> => {
    const start = Date.now();
    try {
      await window.ethereum?.request({ method: 'eth_blockNumber' });
      return Date.now() - start;
    } catch (error) {
      return 9999; // High latency indicates issues
    }
  };

  const detectIssues = (status: ConnectionStatus, tokens: TokenStatus[]): string[] => {
    const issues: string[] = [];
    
    if (!status.isConnected) {
      issues.push('Wallet not connected');
    }
    
    if (status.chainId !== '0x15bca') {
      issues.push('Not on POL Sandbox network');
    }
    
    const missingTokens = tokens.filter(t => !t.isAdded);
    if (missingTokens.length > 0) {
      issues.push(`Missing tokens: ${missingTokens.map(t => t.symbol).join(', ')}`);
    }
    
    if (monitoringData.networkLatency > 3000) {
      issues.push('High network latency');
    }
    
    return issues;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkConnectionStatus();
    setIsRefreshing(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'poor': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <Wifi className="w-4 h-4" />;
      case 'poor': return <AlertCircle className="w-4 h-4" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 500) return 'text-green-600';
    if (latency < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Wallet Connection Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={monitoringData.isMonitoring ? "default" : "secondary"}>
                {monitoringData.isMonitoring ? 'Monitoring' : 'Stopped'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          <CardDescription>
            Real-time monitoring of your Trust Wallet connection and token status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Connection</p>
                    <p className={`text-lg font-semibold ${getConnectionQualityColor(monitoringData.status.connectionQuality)}`}>
                      {monitoringData.status.connectionQuality.charAt(0).toUpperCase() + monitoringData.status.connectionQuality.slice(1)}
                    </p>
                  </div>
                  <div className={getConnectionQualityColor(monitoringData.status.connectionQuality)}>
                    {getConnectionQualityIcon(monitoringData.status.connectionQuality)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Network Latency</p>
                    <p className={`text-lg font-semibold ${getLatencyColor(monitoringData.networkLatency)}`}>
                      {monitoringData.networkLatency}ms
                    </p>
                  </div>
                  <Network className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                    <p className="text-lg font-semibold">
                      {formatTime(monitoringData.lastUpdate)}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connection Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Wallet Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Connected</span>
                    <Badge variant={monitoringData.status.isConnected ? "default" : "secondary"}>
                      {monitoringData.status.isConnected ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {monitoringData.status.account && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Account</span>
                      <span className="text-sm font-mono">{formatAddress(monitoringData.status.account)}</span>
                    </div>
                  )}
                  {monitoringData.status.chainId && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Chain ID</span>
                      <span className="text-sm">{monitoringData.status.chainId}</span>
                    </div>
                  )}
                  {monitoringData.status.lastConnected && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Connected</span>
                      <span className="text-sm">{formatTime(monitoringData.status.lastConnected)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Token Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {monitoringData.tokens.map((token) => (
                    <div key={token.symbol} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{token.symbol}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={token.isAdded ? "default" : "secondary"}>
                          {token.isAdded ? 'Added' : 'Missing'}
                        </Badge>
                        {token.isAdded && (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Issues and Alerts */}
          {monitoringData.issues.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Issues Detected</h3>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    {monitoringData.issues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm">{issue}</span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Monitoring Controls */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Auto-monitoring</span>
              <Badge variant={monitoringData.isMonitoring ? "default" : "secondary"}>
                {monitoringData.isMonitoring ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={monitoringData.isMonitoring ? stopMonitoring : startMonitoring}
              >
                {monitoringData.isMonitoring ? 'Stop' : 'Start'} Monitoring
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Connection Health</span>
              <span>{monitoringData.status.connectionQuality === 'excellent' ? '100%' : 
                       monitoringData.status.connectionQuality === 'good' ? '75%' :
                       monitoringData.status.connectionQuality === 'poor' ? '25%' : '0%'}</span>
            </div>
            <Progress 
              value={monitoringData.status.connectionQuality === 'excellent' ? 100 : 
                     monitoringData.status.connectionQuality === 'good' ? 75 :
                     monitoringData.status.connectionQuality === 'poor' ? 25 : 0}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnectionMonitor;