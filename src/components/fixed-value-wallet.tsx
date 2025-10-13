'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, Settings, ArrowUpDown, Plus, Minus } from 'lucide-react';
import { sandboxWalletIntegration, WalletState, TokenHolding, SandboxStrategy } from '@/services/SandboxWalletIntegration';
import { enhancedFixedPriceOracle } from '@/services/EnhancedFixedPriceOracle';

export function FixedValueWallet() {
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [strategies, setStrategies] = useState<SandboxStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [priceAdjustments, setPriceAdjustments] = useState<any[]>([]);

  useEffect(() => {
    initializeWallet();
    setupEventListeners();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeWallet = async () => {
    try {
      setIsLoading(true);
      
      // Get current wallet state
      const state = await sandboxWalletIntegration.getCurrentWalletState();
      setWalletState(state);
      
      // Get optimal strategies
      const optimalStrategies = await sandboxWalletIntegration.getOptimalStrategies();
      setStrategies(optimalStrategies);
      
      // Get recent price adjustments
      const adjustments = enhancedFixedPriceOracle.getRecentAdjustments(5);
      setPriceAdjustments(adjustments);
      
      // Sync with sandbox
      await sandboxWalletIntegration.syncWalletStateToSandbox(state);
      
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    const handleStrategiesUpdated = (event: CustomEvent) => {
      setStrategies(event.detail);
    };

    const handleMarketAlert = (event: CustomEvent) => {
      console.log('Market alert:', event.detail);
      // Could show toast notification here
    };

    const handleInterventionRecommended = (event: CustomEvent) => {
      console.log('Intervention recommended:', event.detail);
      // Could show modal here
    };

    window.addEventListener('strategiesUpdated', handleStrategiesUpdated as EventListener);
    window.addEventListener('marketAlert', handleMarketAlert as EventListener);
    window.addEventListener('interventionRecommended', handleInterventionRecommended as EventListener);
  };

  const cleanup = () => {
    window.removeEventListener('strategiesUpdated', () => {});
    window.removeEventListener('marketAlert', () => {});
    window.removeEventListener('interventionRecommended', () => {});
  };

  const handleExecuteStrategy = async (strategyId: string) => {
    try {
      const success = await sandboxWalletIntegration.executeStrategy(strategyId);
      if (success) {
        // Refresh wallet state
        await initializeWallet();
      }
    } catch (error) {
      console.error('Failed to execute strategy:', error);
    }
  };

  const handleRefreshPrices = async () => {
    try {
      const allPrices = await enhancedFixedPriceOracle.getAllPrices();
      console.log('Updated prices:', allPrices);
      
      // Refresh price adjustments
      const adjustments = enhancedFixedPriceOracle.getRecentAdjustments(5);
      setPriceAdjustments(adjustments);
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    }
  };

  const getPortfolioChartData = () => {
    if (!walletState) return [];
    
    return walletState.holdings.map(holding => ({
      name: holding.symbol,
      value: holding.marketValue,
      balance: holding.balance,
      price: holding.fixedPrice
    }));
  };

  const getPriceHistoryData = () => {
    if (!walletState) return [];
    
    // Generate mock price history for demonstration
    const data = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000); // Daily data for 30 days
      const value = walletState.totalValue * (1 + (Math.random() - 0.5) * 0.1); // ±5% variation
      data.push({
        date: new Date(timestamp).toLocaleDateString(),
        value: Math.round(value),
        timestamp
      });
    }
    return data;
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading Fixed Value Wallet...</p>
        </div>
      </div>
    );
  }

  if (!walletState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load wallet state. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Wallet className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Fixed Value Wallet</h1>
              <p className="text-muted-foreground">Intelligent token management with POL integration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleRefreshPrices} variant="outline" size="sm">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Refresh Prices
            </Button>
            <Button onClick={initializeWallet} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Sync
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${walletState.totalValue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Fixed value portfolio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Active Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{strategies.length}</div>
              <p className="text-sm text-muted-foreground">Optimized strategies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Price Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{priceAdjustments.length}</div>
              <p className="text-sm text-muted-foreground">Recent adjustments</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="holdings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="oracle">Oracle</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Token Holdings</CardTitle>
                  <CardDescription>Your fixed-value token portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {walletState.holdings.map((holding) => (
                      <div key={holding.tokenAddress} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">{holding.symbol}</span>
                          </div>
                          <div>
                            <p className="font-medium">{holding.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                              {holding.balance.toFixed(4)} tokens
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${holding.marketValue.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Fixed: ${holding.fixedPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Distribution</CardTitle>
                  <CardDescription>Value distribution across tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getPortfolioChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPortfolioChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Optimized Strategies</CardTitle>
                <CardDescription>AI-powered strategies from POL sandbox</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {strategies.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No strategies available</p>
                  ) : (
                    strategies.map((strategy) => (
                      <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(strategy.riskLevel)}`} />
                          <div>
                            <p className="font-medium">{strategy.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {strategy.type} • {strategy.tokenPair}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{strategy.riskLevel}</Badge>
                              <span className={`text-xs ${getConfidenceColor(strategy.confidenceScore)}`}>
                                {(strategy.confidenceScore * 100).toFixed(0)}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            +{(strategy.expectedProfit * 100).toFixed(2)}%
                          </p>
                          <Button
                            onClick={() => handleExecuteStrategy(strategy.id)}
                            size="sm"
                            className="mt-2"
                          >
                            Execute
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>30-day performance history</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getPriceHistoryData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Recent wallet activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {walletState.recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-2 border-b">
                        <div className="flex items-center gap-2">
                          {tx.type === 'buy' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className="capitalize text-sm">{tx.type}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${tx.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="oracle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fixed Price Oracle</CardTitle>
                <CardDescription>Enhanced oracle with sandbox intelligence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Oracle Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Adjustments</span>
                          <span>{enhancedFixedPriceOracle.getMetrics().totalAdjustments}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Accuracy Score</span>
                          <span>{(enhancedFixedPriceOracle.getMetrics().accuracyScore * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Active Tokens</span>
                          <span>{enhancedFixedPriceOracle.getMetrics().activeTokens}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Recent Adjustments</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {priceAdjustments.map((adj, index) => (
                          <div key={index} className="text-xs p-2 bg-muted rounded">
                            <p className="font-medium">{adj.adjustmentReason}</p>
                            <p className="text-muted-foreground">
                              ${adj.originalPrice.toFixed(2)} → ${adj.adjustedPrice.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Settings</CardTitle>
                <CardDescription>Configure your fixed value wallet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Quick Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Token
                      </Button>
                      <Button variant="outline" size="sm">
                        <Minus className="w-4 h-4 mr-2" />
                        Remove Token
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Advanced Settings
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Integration Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">POL Sandbox Connected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">Price Oracle Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-sm">Real-time Sync Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}