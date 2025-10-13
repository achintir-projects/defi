'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Droplets, TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, Settings, Play, Pause, RotateCcw, Zap, Shield, Target } from 'lucide-react';
import { sandboxWalletIntegration, WalletState, SandboxStrategy } from '@/services/SandboxWalletIntegration';
import { autoRebalancing, RebalancingMetrics } from '@/services/AutoRebalancing';
import { enhancedFixedPriceOracle } from '@/services/EnhancedFixedPriceOracle';

interface LiquidityMetrics {
  totalLiquidity: number;
  activePositions: number;
  averageAPY: number;
  impermanentLoss: number;
  volume24h: number;
  feesEarned: number;
}

interface LiquidityPosition {
  id: string;
  poolName: string;
  tokenPair: string;
  liquidityAmount: number;
  currentAPY: number;
  impermanentLoss: number;
  feesEarned: number;
  volume24h: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'pending';
}

interface CompoundingConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  threshold: number;
  autoReinvest: boolean;
}

export function LiquidityProviderDashboard() {
  const [walletData, setWalletData] = useState<WalletState | null>(null);
  const [liquidityMetrics, setLiquidityMetrics] = useState<LiquidityMetrics | null>(null);
  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [rebalancingMetrics, setRebalancingMetrics] = useState<RebalancingMetrics | null>(null);
  const [isAutoCompounding, setIsAutoCompounding] = useState(false);
  const [compoundingConfig, setCompoundingConfig] = useState<CompoundingConfig>({
    enabled: false,
    frequency: 'weekly',
    threshold: 100,
    autoReinvest: true
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    initializeDashboard();
    setupEventListeners();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      // Get wallet data
      const walletState = await sandboxWalletIntegration.getCurrentWalletState();
      setWalletData(walletState);
      
      // Initialize mock liquidity data
      setLiquidityMetrics(getMockLiquidityMetrics());
      setPositions(getMockLiquidityPositions());
      
      // Get rebalancing metrics
      const metrics = autoRebalancing().getMetrics();
      setRebalancingMetrics(metrics);
      
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    }
  };

  const setupEventListeners = () => {
    const handleStrategiesUpdated = (event: CustomEvent) => {
      console.log('Strategies updated:', event.detail);
      // Update liquidity positions based on new strategies
    };

    const handleStrategyExecuted = (event: CustomEvent) => {
      console.log('Strategy executed:', event.detail);
      // Refresh metrics after strategy execution
      initializeDashboard();
    };

    window.addEventListener('strategiesUpdated', handleStrategiesUpdated as EventListener);
    window.addEventListener('strategyExecuted', handleStrategyExecuted as EventListener);
  };

  const cleanup = () => {
    window.removeEventListener('strategiesUpdated', () => {});
    window.removeEventListener('strategyExecuted', () => {});
  };

  const getMockLiquidityMetrics = (): LiquidityMetrics => ({
    totalLiquidity: 250000,
    activePositions: 5,
    averageAPY: 12.5,
    impermanentLoss: -2.3,
    volume24h: 45000,
    feesEarned: 1250
  });

  const getMockLiquidityPositions = (): LiquidityPosition[] => [
    {
      id: 'pos_001',
      poolName: 'Uniswap V3 BTC/USDT',
      tokenPair: 'BTC/USDT',
      liquidityAmount: 100000,
      currentAPY: 15.2,
      impermanentLoss: -1.8,
      feesEarned: 580,
      volume24h: 25000,
      riskLevel: 'medium',
      status: 'active'
    },
    {
      id: 'pos_002',
      poolName: 'Curve 3Pool',
      tokenPair: 'USDT/USDC/DAI',
      liquidityAmount: 75000,
      currentAPY: 8.5,
      impermanentLoss: -0.2,
      feesEarned: 320,
      volume24h: 15000,
      riskLevel: 'low',
      status: 'active'
    },
    {
      id: 'pos_003',
      poolName: 'SushiSwap ETH/USDT',
      tokenPair: 'ETH/USDT',
      liquidityAmount: 50000,
      currentAPY: 18.7,
      impermanentLoss: -3.2,
      feesEarned: 250,
      volume24h: 5000,
      riskLevel: 'high',
      status: 'active'
    },
    {
      id: 'pos_004',
      poolName: 'Balancer BAL/WETH',
      tokenPair: 'BAL/WETH',
      liquidityAmount: 25000,
      currentAPY: 22.1,
      impermanentLoss: -4.5,
      feesEarned: 100,
      volume24h: 0,
      riskLevel: 'high',
      status: 'inactive'
    }
  ];

  const getPerformanceData = () => {
    const dataPoints = selectedTimeframe === '24h' ? 24 : selectedTimeframe === '7d' ? 7 : 30;
    const data = [];
    
    for (let i = dataPoints; i >= 0; i--) {
      const baseValue = 250000;
      const variation = Math.sin(i / 3) * 5000 + Math.random() * 2000;
      data.push({
        period: selectedTimeframe === '24h' ? `${i}h` : selectedTimeframe === '7d' ? `Day ${dataPoints - i}` : `Day ${dataPoints - i}`,
        liquidity: Math.round(baseValue + variation),
        fees: Math.round(50 + Math.random() * 30),
        apy: (12 + Math.random() * 4).toFixed(1)
      });
    }
    
    return data;
  };

  const getRiskReturnData = () => {
    return positions.map(pos => ({
      name: pos.tokenPair,
      apy: pos.currentAPY,
      risk: pos.riskLevel === 'low' ? 20 : pos.riskLevel === 'medium' ? 50 : 80,
      liquidity: pos.liquidityAmount / 1000,
      fees: pos.feesEarned
    }));
  };

  const getPortfolioDistribution = () => {
    return positions.map(pos => ({
      name: pos.tokenPair,
      value: pos.liquidityAmount,
      apy: pos.currentAPY
    }));
  };

  const handleStartAutoCompounding = () => {
    setIsAutoCompounding(true);
    // Start auto-compounding logic
    console.log('Starting auto-compounding...');
  };

  const handleStopAutoCompounding = () => {
    setIsAutoCompounding(false);
    // Stop auto-compounding logic
    console.log('Stopping auto-compounding...');
  };

  const handleRebalancePosition = async (positionId: string) => {
    try {
      console.log(`Rebalancing position: ${positionId}`);
      // Implement position rebalancing logic
      await initializeDashboard();
    } catch (error) {
      console.error('Failed to rebalance position:', error);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (!walletData || !liquidityMetrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading Liquidity Provider Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Droplets className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Liquidity Provider Dashboard</h1>
              <p className="text-muted-foreground">Advanced liquidity management with POL integration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={isAutoCompounding ? handleStopAutoCompounding : handleStartAutoCompounding}
              variant={isAutoCompounding ? "destructive" : "default"}
              size="sm"
            >
              {isAutoCompounding ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Compounding
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Compounding
                </>
              )}
            </Button>
            <Button onClick={initializeDashboard} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Liquidity</p>
                  <p className="text-lg font-bold">${liquidityMetrics.totalLiquidity.toLocaleString()}</p>
                </div>
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Positions</p>
                  <p className="text-lg font-bold">{liquidityMetrics.activePositions}</p>
                </div>
                <Target className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average APY</p>
                  <p className="text-lg font-bold">{liquidityMetrics.averageAPY}%</p>
                </div>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Impermanent Loss</p>
                  <p className={`text-lg font-bold ${liquidityMetrics.impermanentLoss < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {liquidityMetrics.impermanentLoss}%
                  </p>
                </div>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">24h Volume</p>
                  <p className="text-lg font-bold">${liquidityMetrics.volume24h.toLocaleString()}</p>
                </div>
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fees Earned</p>
                  <p className="text-lg font-bold text-green-600">${liquidityMetrics.feesEarned.toLocaleString()}</p>
                </div>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="positions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="compounding">Auto-Compounding</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Positions</CardTitle>
                <CardDescription>Active and inactive liquidity positions across different pools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {positions.map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(position.status)}`} />
                        <div>
                          <p className="font-medium">{position.poolName}</p>
                          <p className="text-sm text-muted-foreground">{position.tokenPair}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{position.riskLevel}</Badge>
                            <span className="text-xs text-muted-foreground capitalize">{position.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${position.liquidityAmount.toLocaleString()}</p>
                        <p className="text-sm text-green-600">{position.currentAPY}% APY</p>
                        <p className="text-xs text-muted-foreground">
                          IL: {position.impermanentLoss}% • Fees: ${position.feesEarned}
                        </p>
                        <Button
                          onClick={() => handleRebalancePosition(position.id)}
                          size="sm"
                          variant="outline"
                          className="mt-2"
                        >
                          Rebalance
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liquidity Performance</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2">
                      <span>Timeframe:</span>
                      <Button
                        variant={selectedTimeframe === '24h' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTimeframe('24h')}
                      >
                        24h
                      </Button>
                      <Button
                        variant={selectedTimeframe === '7d' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTimeframe('7d')}
                      >
                        7d
                      </Button>
                      <Button
                        variant={selectedTimeframe === '30d' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTimeframe('30d')}
                      >
                        30d
                      </Button>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getPerformanceData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="liquidity" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="fees" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Distribution</CardTitle>
                  <CardDescription>Liquidity distribution across pools</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getPortfolioDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPortfolioDistribution().map((entry, index) => (
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

          <TabsContent value="compounding" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Compounding Settings</CardTitle>
                  <CardDescription>Configure automatic fee reinvestment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Enable Auto-Compounding</span>
                    <Button
                      onClick={() => setCompoundingConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                      variant={compoundingConfig.enabled ? 'default' : 'outline'}
                      size="sm"
                    >
                      {compoundingConfig.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Compounding Frequency</label>
                    <div className="flex gap-2">
                      {(['daily', 'weekly', 'monthly'] as const).map(freq => (
                        <Button
                          key={freq}
                          variant={compoundingConfig.frequency === freq ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCompoundingConfig(prev => ({ ...prev, frequency: freq }))}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Minimum Threshold: ${compoundingConfig.threshold}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={compoundingConfig.threshold}
                      onChange={(e) => setCompoundingConfig(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Auto-Reinvest Profits</span>
                    <Button
                      onClick={() => setCompoundingConfig(prev => ({ ...prev, autoReinvest: !prev.autoReinvest }))}
                      variant={compoundingConfig.autoReinvest ? 'default' : 'outline'}
                      size="sm"
                    >
                      {compoundingConfig.autoReinvest ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compounding Performance</CardTitle>
                  <CardDescription>Historical compounding results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Compounded</span>
                      <span className="font-medium">$5,240</span>
                    </div>
                    <div className="flex justify-between">
                      <span>APY Boost</span>
                      <span className="font-medium text-green-600">+2.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Compounding</span>
                      <span className="font-medium">2 hours ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Compounding</span>
                      <span className="font-medium">5 days</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to Threshold</span>
                        <span>$78/$100</span>
                      </div>
                      <Progress value={78} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk vs Return Analysis</CardTitle>
                  <CardDescription>Position performance by risk level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getRiskReturnData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="apy" fill="#3b82f6" name="APY %" />
                      <Bar dataKey="risk" fill="#ef4444" name="Risk Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rebalancing Metrics</CardTitle>
                  <CardDescription>Automated rebalancing performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {rebalancingMetrics ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Executions</span>
                        <span className="font-medium">{rebalancingMetrics.totalExecutions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate</span>
                        <span className="font-medium text-green-600">
                          {(rebalancingMetrics.successRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Profit</span>
                        <span className="font-medium text-green-600">
                          ${rebalancingMetrics.totalProfit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Execution Time</span>
                        <span className="font-medium">
                          {(rebalancingMetrics.averageExecutionTime / 1000).toFixed(1)}s
                        </span>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Success Rate</span>
                          <span>{(rebalancingMetrics.successRate * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={rebalancingMetrics.successRate * 100} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No rebalancing data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>Comprehensive risk assessment across positions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={getRiskReturnData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis />
                    <Radar name="APY" dataKey="apy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Radar name="Risk" dataKey="risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}