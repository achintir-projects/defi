'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw,
  Activity,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';

// Ensure we're on client side
const isClient = typeof window !== 'undefined';

interface TokenPrice {
  symbol: string;
  address: string;
  basePrice: number;
  finalPrice: number;
  adjustment: number;
  confidence: number;
  timestamp: number;
  factors: {
    marketDepth: number;
    volatility: number;
    liquidityScore: number;
    userBehavior: number;
  };
  marketData: {
    marketCap: number;
    volume24h: number;
    change24h: number;
  };
  enabled: boolean;
}

interface PriceOverride {
  symbol: string;
  targetPrice: number;
  adjustmentFactor: number;
  strategy: 'conservative' | 'moderate' | 'aggressive';
  enabled: boolean;
}

const TokenPriceManager: React.FC = () => {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [overrides, setOverrides] = useState<PriceOverride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<TokenPrice | null>(null);
  const [isEditingOverride, setIsEditingOverride] = useState(false);
  const [newOverride, setNewOverride] = useState<PriceOverride>({
    symbol: '',
    targetPrice: 1.0,
    adjustmentFactor: 0.05,
    strategy: 'moderate',
    enabled: true
  });

  useEffect(() => {
    if (!isClient) return;
    loadTokenPrices();
    loadPriceOverrides();
    
    // Set up real-time updates
    const interval = setInterval(loadTokenPrices, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTokenPrices = async () => {
    if (!isClient) return;
    try {
      const response = await fetch('/api/prices');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const tokenList = Object.entries(data.data).map(([symbol, priceData]: [string, any]) => ({
            ...priceData,
            enabled: overrides.find(o => o.symbol === symbol)?.enabled ?? true
          }));
          setTokens(tokenList);
        }
      }
    } catch (error) {
      console.error('Failed to load token prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPriceOverrides = async () => {
    if (!isClient) return;
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const config = await response.json();
        // Convert config targetTokens to overrides format
        const tokenOverrides = config.targetTokens.map((symbol: string) => ({
          symbol,
          targetPrice: 1.0,
          adjustmentFactor: config.adjustmentFactor,
          strategy: config.strategy,
          enabled: config.priceOverrideEnabled
        }));
        setOverrides(tokenOverrides);
      }
    } catch (error) {
      console.error('Failed to load price overrides:', error);
    }
  };

  const savePriceOverride = async (override: PriceOverride) => {
    if (!isClient) return;
    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateTokenPrice',
          ...override
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Price override saved:', result);
        loadTokenPrices();
      }
    } catch (error) {
      console.error('Failed to save price override:', error);
    }
  };

  const deletePriceOverride = async (symbol: string) => {
    if (!isClient) return;
    try {
      setOverrides(prev => prev.filter(o => o.symbol !== symbol));
      // Update config to remove token
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetTokens: overrides.filter(o => o.symbol !== symbol).map(o => o.symbol)
        }),
      });
    } catch (error) {
      console.error('Failed to delete price override:', error);
    }
  };

  const toggleTokenOverride = async (symbol: string, enabled: boolean) => {
    if (!isClient) return;
    setOverrides(prev => 
      prev.map(o => o.symbol === symbol ? { ...o, enabled } : o)
    );
    
    const override = overrides.find(o => o.symbol === symbol);
    if (override) {
      await savePriceOverride({ ...override, enabled });
    }
  };

  const addNewOverride = async () => {
    if (!isClient || !newOverride.symbol) return;
    
    try {
      await savePriceOverride(newOverride);
      setOverrides(prev => [...prev, newOverride]);
      setNewOverride({
        symbol: '',
        targetPrice: 1.0,
        adjustmentFactor: 0.05,
        strategy: 'moderate',
        enabled: true
      });
      setIsEditingOverride(false);
    } catch (error) {
      console.error('Failed to add price override:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(1)}K`;
    return `$${marketCap.toFixed(0)}`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAdjustmentColor = (adjustment: number) => {
    if (adjustment > 0) return 'text-green-600';
    if (adjustment < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading token prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Token Price Management</h1>
          <p className="text-muted-foreground">
            Manage price overrides and adjustments for supported tokens
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadTokenPrices}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isEditingOverride} onOpenChange={setIsEditingOverride}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Override
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Price Override</DialogTitle>
                <DialogDescription>
                  Configure a new price override for a token
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Token Symbol</Label>
                  <Select 
                    value={newOverride.symbol} 
                    onValueChange={(value) => setNewOverride(prev => ({ ...prev, symbol: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="DAI">DAI</SelectItem>
                      <SelectItem value="BUSD">BUSD</SelectItem>
                      <SelectItem value="FRAX">FRAX</SelectItem>
                      <SelectItem value="LUSD">LUSD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Target Price: ${newOverride.targetPrice.toFixed(4)}</Label>
                  <Slider
                    value={[newOverride.targetPrice]}
                    onValueChange={([value]) => setNewOverride(prev => ({ ...prev, targetPrice: value }))}
                    max={2.0}
                    min={0.5}
                    step={0.0001}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Adjustment Factor: {(newOverride.adjustmentFactor * 100).toFixed(1)}%</Label>
                  <Slider
                    value={[newOverride.adjustmentFactor * 100]}
                    onValueChange={([value]) => setNewOverride(prev => ({ ...prev, adjustmentFactor: value / 100 }))}
                    max={20}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Strategy</Label>
                  <Select 
                    value={newOverride.strategy} 
                    onValueChange={(value: any) => setNewOverride(prev => ({ ...prev, strategy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="new-override-enabled"
                    checked={newOverride.enabled}
                    onChange={(e) => setNewOverride(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="new-override-enabled">Enable Override</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditingOverride(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addNewOverride}>
                    <Save className="w-4 h-4 mr-2" />
                    Add Override
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prices">Live Prices</TabsTrigger>
          <TabsTrigger value="overrides">Price Overrides</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Live Prices Tab */}
        <TabsContent value="prices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Token Prices
              </CardTitle>
              <CardDescription>
                Real-time prices with POL Sandbox adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Final Price</TableHead>
                    <TableHead>Adjustment</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Volume 24h</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token.symbol}>
                      <TableCell className="font-medium">{token.symbol}</TableCell>
                      <TableCell>{formatPrice(token.basePrice)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(token.finalPrice)}
                      </TableCell>
                      <TableCell className={getAdjustmentColor(token.adjustment)}>
                        <div className="flex items-center gap-1">
                          {token.adjustment > 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : token.adjustment < 0 ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : null}
                          {(token.adjustment * 100).toFixed(2)}%
                        </div>
                      </TableCell>
                      <TableCell className={getConfidenceColor(token.confidence)}>
                        {(token.confidence * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell>{formatMarketCap(token.marketData.volume24h)}</TableCell>
                      <TableCell>
                        <Badge variant={token.enabled ? 'default' : 'secondary'}>
                          {token.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedToken(token)}
                          >
                            <BarChart3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTokenOverride(token.symbol, !token.enabled)}
                          >
                            {token.enabled ? (
                              <Zap className="w-3 h-3" />
                            ) : (
                              <Target className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Overrides Tab */}
        <TabsContent value="overrides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Price Override Configuration
              </CardTitle>
              <CardDescription>
                Manage custom price overrides for specific tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overrides.map((override) => (
                  <div key={override.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">{override.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          Target: {formatPrice(override.targetPrice)} • 
                          Adjustment: {(override.adjustmentFactor * 100).toFixed(1)}% • 
                          Strategy: {override.strategy}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={override.enabled ? 'default' : 'secondary'}>
                        {override.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleTokenOverride(override.symbol, !override.enabled)}
                      >
                        {override.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePriceOverride(override.symbol)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Total Adjustments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tokens.filter(t => Math.abs(t.adjustment) > 0.01).length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Tokens with active adjustments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Average Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(tokens.reduce((sum, t) => sum + t.confidence, 0) / tokens.length * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Across all tokens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Update Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5s</div>
                <p className="text-sm text-muted-foreground">
                  Real-time updates
                </p>
              </CardContent>
            </Card>
          </div>

          {selectedToken && (
            <Card>
              <CardHeader>
                <CardTitle>Token Details: {selectedToken.symbol}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Market Depth</Label>
                    <div className="text-lg font-semibold">
                      {formatMarketCap(selectedToken.factors.marketDepth)}
                    </div>
                  </div>
                  <div>
                    <Label>Volatility</Label>
                    <div className="text-lg font-semibold">
                      {(selectedToken.factors.volatility * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <Label>Liquidity Score</Label>
                    <div className="text-lg font-semibold">
                      {(selectedToken.factors.liquidityScore * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <Label>User Behavior</Label>
                    <div className="text-lg font-semibold">
                      {selectedToken.factors.userBehavior > 0 ? '+' : ''}{(selectedToken.factors.userBehavior * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenPriceManager;