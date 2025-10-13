'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, Droplets, TrendingUp, Activity, Zap, Shield, Globe, Settings, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';
import { POLDashboard } from './pol-dashboard';
import { FixedValueWallet } from './fixed-value-wallet';
import { LiquidityProviderDashboard } from './liquidity-provider-dashboard';
import { sandboxWalletIntegration } from '@/services/SandboxWalletIntegration';
import { autoRebalancing } from '@/services/AutoRebalancing';
import { enhancedFixedPriceOracle } from '@/services/EnhancedFixedPriceOracle';

interface IntegratedMetrics {
  totalValue: number;
  activeStrategies: number;
  successRate: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  lastSync: number;
  connectedSystems: string[];
}

export function IntegratedDashboard() {
  const [metrics, setMetrics] = useState<IntegratedMetrics | null>(null);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'wallet' | 'pol' | 'liquidity'>('overview');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      initializeIntegratedSystem();
      setupEventListeners();
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        cleanup();
      }
    };
  }, []);

  const initializeIntegratedSystem = async () => {
    try {
      setIsInitializing(true);
      // Initialize all systems
      await Promise.all([
        sandboxWalletIntegration.syncWalletStateToSandbox(),
        enhancedFixedPriceOracle.getAllPrices(),
        autoRebalancing().start()
      ]);

      // Calculate integrated metrics
      const integratedMetrics = await calculateIntegratedMetrics();
      setMetrics(integratedMetrics);
      
      setIsSystemActive(true);
      
    } catch (error) {
      console.error('Failed to initialize integrated system:', error);
      setAlerts([{
        type: 'error',
        message: 'Failed to initialize integrated system',
        timestamp: Date.now()
      }]);
    } finally {
      setIsInitializing(false);
    }
  };

  const setupEventListeners = () => {
    const handleStrategiesUpdated = (event: CustomEvent) => {
      console.log('Strategies updated in integrated system');
      updateMetrics();
    };

    const handleMarketAlert = (event: CustomEvent) => {
      setAlerts(prev => [...prev, {
        type: 'warning',
        message: `Market alert: ${event.detail.message}`,
        timestamp: Date.now()
      }]);
    };

    const handleInterventionRecommended = (event: CustomEvent) => {
      setAlerts(prev => [...prev, {
        type: 'info',
        message: `Intervention recommended: ${event.detail.reason}`,
        timestamp: Date.now()
      }]);
    };

    window.addEventListener('strategiesUpdated', handleStrategiesUpdated as EventListener);
    window.addEventListener('marketAlert', handleMarketAlert as EventListener);
    window.addEventListener('interventionRecommended', handleInterventionRecommended as EventListener);
  };

  const cleanup = () => {
    window.removeEventListener('strategiesUpdated', () => {});
    window.removeEventListener('marketAlert', () => {});
    window.removeEventListener('interventionRecommended', () => {});
    autoRebalancing().destroy();
    sandboxWalletIntegration.destroy();
  };

  const calculateIntegratedMetrics = async (): Promise<IntegratedMetrics> => {
    try {
      const walletState = await sandboxWalletIntegration.getCurrentWalletState();
      const strategies = await sandboxWalletIntegration.getOptimalStrategies();
      const rebalancingMetrics = autoRebalancing().getMetrics();
      const oracleMetrics = enhancedFixedPriceOracle.getMetrics();

      const totalValue = walletState?.totalValue || 0;
      const activeStrategies = strategies.length;
      const successRate = rebalancingMetrics.successRate;
      
      // Determine system health
      let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
      if (successRate < 0.5) systemHealth = 'critical';
      else if (successRate < 0.7) systemHealth = 'warning';
      else if (successRate < 0.9) systemHealth = 'good';

      return {
        totalValue,
        activeStrategies,
        successRate,
        systemHealth,
        lastSync: Date.now(),
        connectedSystems: ['Wallet', 'POL Sandbox', 'Price Oracle', 'Auto-Rebalancing']
      };
    } catch (error) {
      console.error('Failed to calculate metrics:', error);
      return {
        totalValue: 0,
        activeStrategies: 0,
        successRate: 0,
        systemHealth: 'critical',
        lastSync: Date.now(),
        connectedSystems: []
      };
    }
  };

  const updateMetrics = async () => {
    const newMetrics = await calculateIntegratedMetrics();
    setMetrics(newMetrics);
  };

  const handleStartSystem = async () => {
    try {
      await autoRebalancing().start();
      setIsSystemActive(true);
      await updateMetrics();
    } catch (error) {
      console.error('Failed to start system:', error);
    }
  };

  const handleStopSystem = async () => {
    try {
      autoRebalancing().stop();
      setIsSystemActive(false);
      await updateMetrics();
    } catch (error) {
      console.error('Failed to stop system:', error);
    }
  };

  const handleRefreshSystem = async () => {
    await initializeIntegratedSystem();
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <Shield className="w-4 h-4" />;
      case 'good': return <Activity className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getPerformanceData = () => {
    const data = [];
    for (let i = 24; i >= 0; i--) {
      data.push({
        time: `${i}h`,
        value: 250000 + Math.sin(i / 4) * 10000 + Math.random() * 5000,
        strategies: Math.floor(5 + Math.random() * 3),
        successRate: 0.8 + Math.random() * 0.2
      });
    }
    return data;
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Initializing Integrated System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">Integrated DeFi Ecosystem</h1>
                  <p className="text-sm text-muted-foreground">
                    Fixed Value Wallet + POL Sandbox + Advanced Analytics
                  </p>
                </div>
              </div>
              <Badge variant={isSystemActive ? 'default' : 'secondary'}>
                {isSystemActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={isSystemActive ? handleStopSystem : handleStartSystem}
                variant={isSystemActive ? 'destructive' : 'default'}
                size="sm"
              >
                {isSystemActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop System
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start System
                  </>
                )}
              </Button>
              <Button onClick={handleRefreshSystem} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="space-y-2">
            {alerts.slice(-3).map((alert, index) => (
              <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="border-b bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Fixed Value Wallet
              </TabsTrigger>
              <TabsTrigger value="pol" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                POL Sandbox
              </TabsTrigger>
              <TabsTrigger value="liquidity" className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Liquidity Provider
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isInitializing ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Initializing Integrated System...</p>
            </div>
          </div>
        ) : (
          <>
            {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics?.totalValue?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all systems</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.activeStrategies || 0}</div>
                  <p className="text-xs text-muted-foreground">Optimized strategies</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold flex items-center gap-2 ${getSystemHealthColor(metrics?.systemHealth || 'unknown')}`}>
                    {getSystemHealthIcon(metrics?.systemHealth || 'unknown')}
                    {(metrics?.systemHealth || 'unknown').charAt(0).toUpperCase() + (metrics?.systemHealth || 'unknown').slice(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">Overall system status</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{((metrics?.successRate || 0) * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Strategy execution</p>
                </CardContent>
              </Card>
            </div>

            {/* System Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>24-hour performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getPerformanceData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connected Systems</CardTitle>
                  <CardDescription>Active system components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(metrics?.connectedSystems || []).map((system, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="font-medium">{system}</span>
                        </div>
                        <Badge variant="outline">Connected</Badge>
                      </div>
                    ))}
                    <div className="text-sm text-muted-foreground">
                      Last sync: {new Date(metrics?.lastSync || Date.now()).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and system controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => setSelectedView('wallet')} className="h-20 flex-col">
                    <Wallet className="w-6 h-6 mb-2" />
                    Manage Wallet
                  </Button>
                  <Button onClick={() => setSelectedView('pol')} variant="outline" className="h-20 flex-col">
                    <Activity className="w-6 h-6 mb-2" />
                    POL Sandbox
                  </Button>
                  <Button onClick={() => setSelectedView('liquidity')} variant="outline" className="h-20 flex-col">
                    <Droplets className="w-6 h-6 mb-2" />
                    Liquidity Provider
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'wallet' && <FixedValueWallet />}
        {selectedView === 'pol' && <POLDashboard />}
        {selectedView === 'liquidity' && <LiquidityProviderDashboard />}
          </>
        )}
      </div>
    </div>
  );
}