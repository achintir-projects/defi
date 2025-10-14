'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Zap, 
  TrendingUp, 
  Activity, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  Link,
  Globe,
  Code,
  Monitor,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  BarChart3,
  Shield,
  Network
} from 'lucide-react';
import QuickConnect from './quick-connect';
import { ConnectionStrategyWizard } from './connection-strategy-wizard';
import SettingsPage from './settings';
import TokenPriceManager from './token-price-manager';
import TokenQuantityDemo from './token-quantity-demo';
import { 
  universalWalletConnector, 
  WalletConnectionState,
  PortfolioData 
} from '@/lib/universal-wallet-connector';
import { priceOracleProxy } from '@/lib/price-influence-strategies';

interface UnifiedDashboardProps {
  initialTab?: string;
}

interface SystemMetrics {
  totalValueLocked: number;
  activeStrategies: number;
  priceAdjustments: number;
  connectedWallets: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdate: number;
}

interface PriceInfluenceMetrics {
  strategy: string;
  isActive: boolean;
  adjustmentStrength: number;
  tokensAffected: number;
  lastPriceUpdate: number;
  confidence: number;
}

const SystemHealthIndicator: React.FC<{ health: string }> = ({ health }) => {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Badge className={getHealthColor(health)}>
      {getHealthIcon(health)}
      <span className="ml-1">{health.charAt(0).toUpperCase() + health.slice(1)}</span>
    </Badge>
  );
};

const MetricsCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}> = ({ title, value, change, icon, description }) => {
  const isPositive = change && change > 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="w-4 h-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-1 text-red-600" />
            )}
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(change)}%
            </span>
            <span className="ml-1">from last hour</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const PriceInfluenceStatus: React.FC<{ metrics: PriceInfluenceMetrics[] }> = ({ metrics }) => {
  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'browser-extension': return <Monitor className="w-4 h-4" />;
      case 'custom-rpc': return <Globe className="w-4 h-4" />;
      case 'api-proxy': return <Code className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Price Influence Strategies
        </CardTitle>
        <CardDescription>
          Status of your active price influence methods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  {getStrategyIcon(metric.strategy)}
                </div>
                <div>
                  <div className="font-medium capitalize">
                    {metric.strategy.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.tokensAffected} tokens affected
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {(metric.adjustmentStrength * 100).toFixed(1)}% strength
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(metric.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
                <Badge variant={metric.isActive ? 'default' : 'secondary'}>
                  {metric.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActions: React.FC<{
  isConnected: boolean;
  onStartSystem: () => void;
  onStopSystem: () => void;
  onRefreshData: () => void;
}> = ({ isConnected, onStartSystem, onStopSystem, onRefreshData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and system controls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onStartSystem} 
          disabled={!isConnected}
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          Start POL System
        </Button>
        
        <Button 
          onClick={onStopSystem} 
          variant="outline"
          disabled={!isConnected}
          className="w-full"
        >
          <Pause className="w-4 h-4 mr-2" />
          Stop POL System
        </Button>
        
        <Button 
          onClick={onRefreshData} 
          variant="outline"
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/settings">
              <Settings className="w-3 h-3 mr-1" />
              Settings
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/docs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Docs
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  });
  const [portfolio, setPortfolio] = useState<PortfolioData | undefined>();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalValueLocked: 0,
    activeStrategies: 0,
    priceAdjustments: 0,
    connectedWallets: 0,
    systemHealth: 'good',
    lastUpdate: Date.now()
  });
  const [priceInfluenceMetrics, setPriceInfluenceMetrics] = useState<PriceInfluenceMetrics[]>([
    {
      strategy: 'browser-extension',
      isActive: false,
      adjustmentStrength: 0.05,
      tokensAffected: 0,
      lastPriceUpdate: Date.now(),
      confidence: 0.85
    },
    {
      strategy: 'custom-rpc',
      isActive: false,
      adjustmentStrength: 0.03,
      tokensAffected: 0,
      lastPriceUpdate: Date.now(),
      confidence: 0.92
    },
    {
      strategy: 'api-proxy',
      isActive: false,
      adjustmentStrength: 0.08,
      tokensAffected: 0,
      lastPriceUpdate: Date.now(),
      confidence: 0.78
    }
  ]);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDashboard();
    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      
      // Check wallet connection status
      const state = universalWalletConnector.getConnectionState();
      setConnectionState(state);
      
      if (state.isConnected) {
        const portfolioData = await universalWalletConnector.getPortfolio();
        setPortfolio(portfolioData);
      }
      
      // Load system metrics
      await updateMetrics();
      
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetrics = async () => {
    try {
      // Mock metrics updates - in production would fetch from backend
      setSystemMetrics(prev => ({
        ...prev,
        totalValueLocked: portfolio?.totalValue || prev.totalValueLocked,
        activeStrategies: priceInfluenceMetrics.filter(m => m.isActive).length,
        priceAdjustments: Math.floor(Math.random() * 100) + 50,
        connectedWallets: connectionState.isConnected ? 1 : 0,
        systemHealth: isSystemActive ? 'excellent' : 'good',
        lastUpdate: Date.now()
      }));
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  };

  const handleStartSystem = async () => {
    try {
      setIsSystemActive(true);
      // Activate first available strategy
      setPriceInfluenceMetrics(prev => 
        prev.map((metric, index) => ({
          ...metric,
          isActive: index === 0 // Activate first strategy
        }))
      );
      await updateMetrics();
    } catch (error) {
      console.error('Failed to start system:', error);
    }
  };

  const handleStopSystem = async () => {
    try {
      setIsSystemActive(false);
      setPriceInfluenceMetrics(prev => 
        prev.map(metric => ({
          ...metric,
          isActive: false
        }))
      );
      await updateMetrics();
    } catch (error) {
      console.error('Failed to stop system:', error);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    await initializeDashboard();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading POL Sandbox Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">POL Sandbox Dashboard</h1>
          <p className="text-muted-foreground">
            Protocol-Owned Liquidity Strategy Platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <QuickConnect 
            compact={true}
            onConnect={(state) => {
              setConnectionState(state);
              if (state.isConnected) {
                universalWalletConnector.getPortfolio().then(setPortfolio);
              }
            }}
            onDisconnect={() => {
              setConnectionState({
                isConnected: false,
                account: null,
                chainId: null,
                walletType: null,
                balance: '0'
              });
              setPortfolio(undefined);
            }}
          />
          <SystemHealthIndicator health={systemMetrics.systemHealth} />
          <Badge variant={isSystemActive ? 'default' : 'secondary'}>
            {isSystemActive ? 'System Active' : 'System Inactive'}
          </Badge>
        </div>
      </div>

      {/* Main Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Strategies
          </TabsTrigger>
          <TabsTrigger value="prices" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Prices
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="Total Value Locked"
              value={`$${systemMetrics.totalValueLocked.toLocaleString()}`}
              change={5.2}
              icon={<DollarSign className="w-4 h-4" />}
              description="Across all strategies"
            />
            <MetricsCard
              title="Active Strategies"
              value={systemMetrics.activeStrategies}
              change={1}
              icon={<Zap className="w-4 h-4" />}
              description="Currently running"
            />
            <MetricsCard
              title="Price Adjustments"
              value={systemMetrics.priceAdjustments}
              change={12}
              icon={<TrendingUp className="w-4 h-4" />}
              description="Last 24 hours"
            />
            <MetricsCard
              title="Connected Wallets"
              value={systemMetrics.connectedWallets}
              icon={<Wallet className="w-4 h-4" />}
              description="Active connections"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price Influence Status */}
            <div className="lg:col-span-2">
              <PriceInfluenceStatus metrics={priceInfluenceMetrics} />
            </div>
            
            {/* Quick Actions */}
            <QuickActions
              isConnected={connectionState.isConnected}
              onStartSystem={handleStartSystem}
              onStopSystem={handleStopSystem}
              onRefreshData={handleRefreshData}
            />
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Operational</div>
                  <div className="text-sm text-muted-foreground">Core System</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Synced</div>
                  <div className="text-sm text-muted-foreground">Price Feeds</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">Ready</div>
                  <div className="text-sm text-muted-foreground">Strategies</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6">
          <QuickConnect 
            onConnect={(state) => {
              setConnectionState(state);
              if (state.isConnected) {
                universalWalletConnector.getPortfolio().then(setPortfolio);
              }
            }}
            onDisconnect={() => {
              setConnectionState({
                isConnected: false,
                account: null,
                chainId: null,
                walletType: null,
                balance: '0'
              });
              setPortfolio(undefined);
            }}
          />
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-6">
          <ConnectionStrategyWizard />
        </TabsContent>

        {/* Prices Tab */}
        <TabsContent value="prices" className="space-y-6">
          <TokenPriceManager />
          <TokenQuantityDemo />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <SettingsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};