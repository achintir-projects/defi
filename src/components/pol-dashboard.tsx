'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Settings } from 'lucide-react';
import { POLSimulation, SimulationState, simulationScenarios, ScenarioType } from '@/lib/pol-simulation';

export function POLDashboard() {
  const [simulation] = useState(() => new POLSimulation({
    initialCapital: 1000000,
    tokenPrice: 100,
    volatility: 0.15,
    drift: 0.01,
    periods: 100
  }));

  const [state, setState] = useState<SimulationState>(simulation.getState());
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('stableMarket');
  const [liquidityRange, setLiquidityRange] = useState([90, 110]);

  useEffect(() => {
    simulation.onStateChange(setState);
  }, [simulation]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        simulation.simulateMarketMovement(1);
      }, speed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, speed, simulation]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    simulation.reset();
    setState(simulation.getState());
  };

  const handleScenarioChange = (scenario: ScenarioType) => {
    setSelectedScenario(scenario);
    const config = simulationScenarios[scenario];
    // Update simulation parameters
    handleReset();
  };

  const handleLiquidityRangeChange = (value: number[]) => {
    setLiquidityRange(value);
    const lowerBound = (value[0] / 100) * state.tokenPrice;
    const upperBound = (value[1] / 100) * state.tokenPrice;
    simulation.updateLiquidityRange(lowerBound, upperBound);
  };

  // Prepare chart data
  const priceChartData = state.priceHistory.map((price, index) => ({
    period: index,
    price: parseFloat(price.toFixed(2)),
    timestamp: new Date(Date.now() - (state.priceHistory.length - index) * 1000).toLocaleTimeString()
  }));

  const interventionChartData = state.interventions.map((intervention, index) => ({
    period: state.priceHistory.findIndex(p => p === intervention.price),
    price: intervention.price,
    type: intervention.type,
    amount: intervention.amount,
    effectiveness: intervention.effectiveness * 100
  }));

  const metricsCards = [
    {
      title: 'Treasury Balance',
      value: `$${state.treasury.toLocaleString()}`,
      change: `${state.metrics.treasuryGrowth.toFixed(2)}%`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Current Price',
      value: `$${state.tokenPrice.toFixed(2)}`,
      change: `${((state.tokenPrice - 100) / 100 * 100).toFixed(2)}%`,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Price Stability',
      value: `${state.metrics.priceStability.toFixed(1)}%`,
      change: 'Stable',
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'Total Interventions',
      value: state.metrics.totalInterventions.toString(),
      change: `${state.metrics.successRate.toFixed(1)}% success`,
      icon: BarChart3,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">POL Simulation Sandbox</h1>
            <p className="text-muted-foreground">Protocol-Owned Liquidity Strategy Testing Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleStart}
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
            <Button
              onClick={handlePause}
              disabled={!isRunning}
              variant="outline"
              size="sm"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsCards.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className={`text-xs ${metric.color}`}>{metric.change}</p>
                  </div>
                  <metric.icon className={`w-8 h-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">Price Charts</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Price Movement</CardTitle>
                  <CardDescription>Token price over time with protocol interventions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={priceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                      />
                      <ReferenceLine y={liquidityRange[0]} stroke="#ef4444" strokeDasharray="5 5" />
                      <ReferenceLine y={liquidityRange[1]} stroke="#ef4444" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volume & Activity</CardTitle>
                  <CardDescription>24h trading volume and intervention activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>24h Volume</span>
                        <span>${state.metrics.volume24h.toLocaleString()}</span>
                      </div>
                      <Progress value={(state.metrics.volume24h / 100000) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Liquidity Depth</span>
                        <span>${state.metrics.liquidityDepth.toLocaleString()}</span>
                      </div>
                      <Progress value={(state.metrics.liquidityDepth / 1000000) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Success Rate</span>
                        <span>{(state.metrics.successRate * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={state.metrics.successRate * 100} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interventions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Intervention History</CardTitle>
                <CardDescription>Protocol interventions and their effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {state.interventions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No interventions yet</p>
                  ) : (
                    state.interventions.slice().reverse().map((intervention, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${
                            intervention.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium capitalize">{intervention.type} Order</p>
                            <p className="text-sm text-muted-foreground">{intervention.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${intervention.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            ${(intervention.amount / intervention.price).toFixed(2)} tokens @ ${intervention.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Effectiveness: {(intervention.effectiveness * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="liquidity" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liquidity Range Settings</CardTitle>
                  <CardDescription>Configure concentrated liquidity bounds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-4 block">
                      Liquidity Range: {liquidityRange[0]}% - {liquidityRange[1]}%
                    </label>
                    <Slider
                      value={liquidityRange}
                      onValueChange={handleLiquidityRangeChange}
                      max={150}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => setLiquidityRange([80, 120])}>
                      Conservative
                    </Button>
                    <Button variant="outline" onClick={() => setLiquidityRange([90, 110])}>
                      Balanced
                    </Button>
                    <Button variant="outline" onClick={() => setLiquidityRange([95, 105])}>
                      Tight
                    </Button>
                    <Button variant="outline" onClick={() => setLiquidityRange([70, 130])}>
                      Wide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Liquidity Pools</CardTitle>
                  <CardDescription>Active liquidity pools and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.values(state.liquidityPools).map((pool) => (
                      <div key={pool.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{pool.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{pool.type}</p>
                          </div>
                          <span className="text-sm font-medium">
                            ${(pool.liquidity).toLocaleString()}
                          </span>
                        </div>
                        {pool.lowerBound && pool.upperBound && (
                          <div className="text-xs text-muted-foreground">
                            Range: ${pool.lowerBound.toFixed(2)} - ${pool.upperBound.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Interventions</span>
                      <span className="font-medium">{state.metrics.totalInterventions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-medium">{(state.metrics.successRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Treasury Growth</span>
                      <span className={`font-medium ${
                        state.metrics.treasuryGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {state.metrics.treasuryGrowth >= 0 ? '+' : ''}{state.metrics.treasuryGrowth.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price Stability</span>
                      <span className="font-medium">{state.metrics.priceStability.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Intervention Effectiveness</CardTitle>
                  <CardDescription>Success rate by intervention type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { type: 'Buy', value: state.interventions.filter(i => i.type === 'buy' && i.effectiveness > 0.5).length },
                      { type: 'Sell', value: state.interventions.filter(i => i.type === 'sell' && i.effectiveness > 0.5).length }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Simulation Settings</CardTitle>
                  <CardDescription>Configure simulation parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Market Scenario</label>
                    <Select value={selectedScenario} onValueChange={(value: ScenarioType) => handleScenarioChange(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(simulationScenarios).map(([key, scenario]) => (
                          <SelectItem key={key} value={key}>
                            {scenario.name} - {scenario.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Simulation Speed: {speed}ms
                    </label>
                    <Slider
                      value={[speed]}
                      onValueChange={(value) => setSpeed(value[0])}
                      max={3000}
                      min={100}
                      step={100}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Scenario</CardTitle>
                  <CardDescription>Active market conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Scenario</span>
                      <span className="font-medium">{simulationScenarios[selectedScenario].name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Volatility</span>
                      <span className="font-medium">{(simulationScenarios[selectedScenario].volatility * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Drift</span>
                      <span className="font-medium">{(simulationScenarios[selectedScenario].drift * 100).toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      {simulationScenarios[selectedScenario].description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}