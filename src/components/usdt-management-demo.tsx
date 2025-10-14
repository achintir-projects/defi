'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  RefreshCw,
  Wallet,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuantityWebSocket } from '@/hooks/use-quantity-websocket';
import { WebSocketStatus } from '@/components/websocket/WebSocketStatus';

interface TokenData {
  symbol: string;
  chain: string;
  balance: number;
  price: number;
  value: number;
  address: string;
  decimals: number;
}

const USDT_WALLET_ADDRESS = '0x1234567890123456789012345678901234567890';
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

export function USDTManagementDemo() {
  const [usdtData, setUsdtData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAmount, setNewAmount] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  // WebSocket for real-time updates
  const {
    isConnected: wsConnected,
    connectionError: wsError,
    lastUpdate,
    connect: wsConnect,
    disconnect: wsDisconnect
  } = useQuantityWebSocket({
    walletAddress: USDT_WALLET_ADDRESS,
    onBalanceUpdate: (data) => {
      console.log('USDT balance updated:', data);
      fetchUSDTData();
    },
    onPriceUpdate: (data) => {
      console.log('USDT price updated:', data);
      fetchUSDTData();
    },
    onError: (message) => {
      toast({
        title: "WebSocket Error",
        description: message,
        variant: "destructive"
      });
    }
  });

  const fetchUSDTData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wallet/balance?address=${USDT_WALLET_ADDRESS}`);
      const data = await response.json();
      
      if (data.balances) {
        const usdtToken = data.balances.find((token: TokenData) => 
          token.symbol === 'USDT' && token.chain === 'ethereum'
        );
        setUsdtData(usdtToken || null);
      }
    } catch (error) {
      console.error('Error fetching USDT data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch USDT data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUSDTBalance = async (amount: number, action: 'add' | 'remove' | 'update') => {
    try {
      setUpdating(true);
      const response = await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: USDT_WALLET_ADDRESS,
          symbol: 'USDT',
          chain: 'ethereum',
          balance: amount,
          price: usdtData?.price || 1.00,
          action
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUsdtData(data.balances.find((token: TokenData) => 
          token.symbol === 'USDT' && token.chain === 'ethereum'
        ));
        toast({
          title: "Success",
          description: `USDT balance ${action}d successfully`
        });
      } else {
        throw new Error('Failed to update USDT balance');
      }
    } catch (error) {
      console.error('Error updating USDT balance:', error);
      toast({
        title: "Error",
        description: "Failed to update USDT balance",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const updateUSDTPrice = async (newPriceValue: number) => {
    try {
      setUpdating(true);
      
      // Update via WebSocket if available, otherwise fallback to HTTP
      const wsSuccess = wsConnected && 
        (window as any).updatePrice?.(USDT_CONTRACT_ADDRESS, newPriceValue);

      if (!wsSuccess) {
        // Fallback to HTTP API
        const currentBalance = usdtData?.balance || 0;
        await updateUSDTBalance(currentBalance, 'update');
        
        // Simulate price update
        if (usdtData) {
          setUsdtData({
            ...usdtData,
            price: newPriceValue,
            value: currentBalance * newPriceValue
          });
        }
      }

      toast({
        title: "Price Updated",
        description: `USDT price updated to $${newPriceValue.toFixed(4)}`
      });
    } catch (error) {
      console.error('Error updating USDT price:', error);
      toast({
        title: "Error",
        description: "Failed to update USDT price",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddUSDT = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid USDT amount",
        variant: "destructive"
      });
      return;
    }

    const currentBalance = usdtData?.balance || 0;
    updateUSDTBalance(currentBalance + amount, 'add');
    setNewAmount('');
  };

  const handleRemoveUSDT = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid USDT amount",
        variant: "destructive"
      });
      return;
    }

    const currentBalance = usdtData?.balance || 0;
    if (amount > currentBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Cannot remove more USDT than available",
        variant: "destructive"
      });
      return;
    }

    updateUSDTBalance(currentBalance - amount, 'remove');
    setNewAmount('');
  };

  const handlePriceUpdate = () => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid USDT price",
        variant: "destructive"
      });
      return;
    }

    updateUSDTPrice(price);
    setNewPrice('');
  };

  useEffect(() => {
    fetchUSDTData();
  }, []);

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            USDT (Ethereum) Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading USDT data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                USDT (Ethereum) Management
              </CardTitle>
              <CardDescription>
                Manage USDT token quantities and prices with real-time updates
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Ethereum Mainnet
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* WebSocket Status */}
          <div className="mb-6">
            <WebSocketStatus
              isConnected={wsConnected}
              connectionError={wsError}
              onConnect={wsConnect}
              onDisconnect={wsDisconnect}
            />
          </div>

          {/* Current USDT Status */}
          {usdtData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Balance</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatNumber(usdtData.balance, 2)} USDT
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatNumber(usdtData.balance, 6)} tokens
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Price</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(usdtData.price)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    per USDT token
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Total Value</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(usdtData.value)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    current portfolio value
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No USDT found in the wallet. Add some USDT to get started!
              </AlertDescription>
            </Alert>
          )}

          {/* Contract Information */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Contract Information</h4>
            <div className="space-y-1 text-sm">
              <div><strong>Contract Address:</strong> {USDT_CONTRACT_ADDRESS}</div>
              <div><strong>Wallet Address:</strong> {USDT_WALLET_ADDRESS}</div>
              <div><strong>Network:</strong> Ethereum Mainnet</div>
              <div><strong>Decimals:</strong> 6</div>
            </div>
          </div>

          {/* Management Controls */}
          <Tabs defaultValue="balance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="balance">Balance Management</TabsTrigger>
              <TabsTrigger value="price">Price Management</TabsTrigger>
            </TabsList>

            <TabsContent value="balance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update USDT Balance</CardTitle>
                  <CardDescription>
                    Add or remove USDT tokens from the wallet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="usdt-amount">USDT Amount</Label>
                    <Input
                      id="usdt-amount"
                      type="number"
                      placeholder="Enter USDT amount"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddUSDT} 
                      disabled={updating || !newAmount}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add USDT
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleRemoveUSDT} 
                      disabled={updating || !newAmount}
                      className="flex-1"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Remove USDT
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="price" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update USDT Price</CardTitle>
                  <CardDescription>
                    Simulate price changes for USDT (normally $1.00)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="usdt-price">New USDT Price (USD)</Label>
                    <Input
                      id="usdt-price"
                      type="number"
                      placeholder="Enter new price"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      step="0.0001"
                      min="0"
                    />
                  </div>
                  <Button 
                    onClick={handlePriceUpdate} 
                    disabled={updating || !newPrice}
                    className="w-full"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Update Price
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    💡 Note: In reality, USDT is a stablecoin designed to maintain a $1.00 peg.
                    This feature is for demonstration purposes.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Real-time Updates */}
          {lastUpdate && (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                Last update: {new Date(lastUpdate.timestamp).toLocaleTimeString()} - 
                {lastUpdate.type === 'balance_update' && ' Balance updated'}
                {lastUpdate.type === 'price_update' && ' Price updated'}
                {lastUpdate.type === 'transfer' && ' Transfer completed'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}