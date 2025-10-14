'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Wallet, TrendingUp, ArrowRight, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useQuantityWebSocket } from '@/hooks/use-quantity-websocket';
import { usePollingFallback } from '@/hooks/use-polling-fallback';

interface TokenBalance {
  symbol: string;
  address: string;
  decimals: number;
  balance: string;
  formattedBalance: number;
  usdValue: number;
  lastUpdated: number;
}

interface WalletData {
  address: string;
  tokens: TokenBalance[];
  totalValue: number;
  lastSync: number;
}

const TokenQuantityDemo: React.FC = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState<boolean>(true);
  const [usePolling, setUsePolling] = useState<boolean>(false);
  const [transferData, setTransferData] = useState({
    toWallet: '',
    tokenAddress: '',
    amount: ''
  });
  const [addTokenData, setAddTokenData] = useState({
    symbol: '',
    address: '',
    decimals: 18,
    balance: '',
    price: 0
  });

  // WebSocket integration for real-time updates
  const {
    isConnected: wsConnected,
    connectionError: wsError,
    lastUpdate: wsLastUpdate,
    connect: wsConnect,
    disconnect: wsDisconnect,
    registerWallet,
    simulateTransfer: wsSimulateTransfer,
    updatePrice: wsUpdatePrice
  } = useQuantityWebSocket({
    walletAddress: selectedWallet,
    autoConnect: realTimeUpdates && !usePolling,
    onBalanceUpdate: (data) => {
      console.log('Real-time balance update:', data);
      if (data.data?.balances) {
        setWallets(prev => 
          prev.map(w => w.address === data.walletAddress ? data.data.balances : w)
        );
      }
    },
    onTransfer: (data) => {
      console.log('Real-time transfer update:', data);
      loadWalletData(); // Refresh all wallet data
    },
    onPriceUpdate: (data) => {
      console.log('Real-time price update:', data);
      loadWalletData(); // Refresh to show new values
    },
    onError: (message) => {
      console.error('WebSocket error:', message);
      // Auto-switch to polling if WebSocket fails
      if (message.includes('Connection failed')) {
        setUsePolling(true);
      }
    }
  });

  // Polling fallback for environments without WebSocket support
  const {
    isConnected: pollingConnected,
    connectionError: pollingError,
    lastUpdate: pollingLastUpdate,
    lastSyncTime,
    startPolling,
    stopPolling,
    simulateTransfer: pollingSimulateTransfer,
    updatePrice: pollingUpdatePrice,
    refreshData
  } = usePollingFallback({
    walletAddress: selectedWallet,
    autoConnect: usePolling,
    onBalanceUpdate: (data) => {
      console.log('Polling balance update:', data);
      if (data.data) {
        setWallets(prev => 
          prev.map(w => w.address === data.walletAddress ? data.data : w)
        );
      }
    },
    onTransfer: (data) => {
      console.log('Polling transfer update:', data);
      loadWalletData();
    },
    onPriceUpdate: (data) => {
      console.log('Polling price update:', data);
      loadWalletData();
    },
    onError: (message) => {
      console.error('Polling error:', message);
    }
  });

  // Load initial data and detect environment
  useEffect(() => {
    loadWalletData();
    
    // Auto-detect if we're on Netlify and switch to polling
    if (typeof window !== 'undefined') {
      const isNetlify = window.location.hostname.includes('netlify.app') || 
                       process.env.NEXT_PUBLIC_DEPLOYMENT_PLATFORM === 'netlify';
      
      if (isNetlify) {
        console.log('Netlify environment detected, switching to polling mode');
        setUsePolling(true);
        setRealTimeUpdates(false);
      }
    }
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quantities?action=all');
      const result = await response.json();
      
      if (result.success) {
        setWallets(result.data);
        if (result.data.length > 0 && !selectedWallet) {
          setSelectedWallet(result.data[0].address);
        }
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedWallet || !transferData.toWallet || !transferData.tokenAddress || !transferData.amount) {
      alert('Please fill in all transfer fields');
      return;
    }

    setLoading(true);
    try {
      let success = false;
      
      // Use WebSocket if available and connected
      if (wsConnected) {
        const wsSuccess = wsSimulateTransfer(selectedWallet, transferData.toWallet, transferData.tokenAddress, transferData.amount);
        if (wsSuccess) {
          setTransferData({ toWallet: '', tokenAddress: '', amount: '' });
          setLoading(false);
          return;
        }
      }
      
      // Use polling fallback if WebSocket is not available
      if (usePolling || pollingConnected) {
        success = await pollingSimulateTransfer(selectedWallet, transferData.toWallet, transferData.tokenAddress, transferData.amount);
      } else {
        // Fallback to HTTP API
        const response = await fetch('/api/quantities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'transfer',
            walletAddress: selectedWallet,
            toWallet: transferData.toWallet,
            tokenAddress: transferData.tokenAddress,
            amount: transferData.amount
          })
        });

        const result = await response.json();
        success = result.success;
      }
      
      if (success) {
        alert('Transfer simulated successfully!');
        setTransferData({ toWallet: '', tokenAddress: '', amount: '' });
        loadWalletData();
      } else {
        alert('Transfer failed: Please try again.');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed: Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async () => {
    if (!selectedWallet || !addTokenData.symbol || !addTokenData.address || !addTokenData.balance || !addTokenData.price) {
      alert('Please fill in all token fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/quantities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          walletAddress: selectedWallet,
          tokenAddress: addTokenData.address,
          symbol: addTokenData.symbol,
          decimals: addTokenData.decimals,
          amount: addTokenData.balance,
          price: addTokenData.price
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Token added successfully!');
        setAddTokenData({ symbol: '', address: '', decimals: 18, balance: '', price: 0 });
        loadWalletData();
      } else {
        alert('Failed to add token: ' + result.message);
      }
    } catch (error) {
      console.error('Add token error:', error);
      alert('Failed to add token');
    } finally {
      setLoading(false);
    }
  };

  const simulatePriceUpdate = async () => {
    setLoading(true);
    try {
      // Simulate price changes
      const priceUpdates = {
        '0x4585fe77225b41b697c938b018e2ac67ac5a20c0': 800 + Math.random() * 100, // POL: $800-900
        '0xdAC17F958D2ee523a2206206994597C13D831ec7': 0.99 + Math.random() * 0.02, // USDT-ERC20: $0.99-1.01
        'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t': 0.99 + Math.random() * 0.02, // USDT-TRC20: $0.99-1.01
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 0.99 + Math.random() * 0.02, // USDC: $0.99-1.01
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 2100 + Math.random() * 200, // WETH: $2100-2300
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 52000 + Math.random() * 2000 // WBTC: $52k-54k
      };

      let success = false;
      
      // Use WebSocket if available and connected
      if (wsConnected) {
        let allSuccessful = true;
        Object.entries(priceUpdates).forEach(([address, price]) => {
          const wsSuccess = wsUpdatePrice(address, price);
          if (!wsSuccess) allSuccessful = false;
        });
        
        if (allSuccessful) {
          setLoading(false);
          return;
        }
      }
      
      // Use polling fallback if WebSocket is not available
      if (usePolling || pollingConnected) {
        for (const [address, price] of Object.entries(priceUpdates)) {
          const updateSuccess = await pollingUpdatePrice(address, price);
          if (updateSuccess) success = true;
        }
      } else {
        // Fallback to HTTP API
        const response = await fetch('/api/quantities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update-prices',
            priceUpdates
          })
        });

        const result = await response.json();
        success = result.success;
      }
      
      if (success) {
        loadWalletData();
      }
    } catch (error) {
      console.error('Price update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentWallet = wallets.find(w => w.address === selectedWallet);
  const lastUpdate = wsLastUpdate || pollingLastUpdate;
  const connectionError = wsError || pollingError;
  const isConnected = wsConnected || pollingConnected;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Token Quantity Management</h2>
          <p className="text-muted-foreground">
            Manage token balances and quantities alongside POL price overrides
          </p>
        </div>
        <div className="flex gap-2">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                {wsConnected ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    WebSocket Active
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Polling Active
                  </>
                )}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <WifiOff className="h-3 w-3 mr-1" />
                Real-time Inactive
              </Badge>
            )}
          </div>
          
          <Button onClick={loadWalletData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={simulatePriceUpdate} variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Simulate Prices
          </Button>
          
          {/* Connection Method Toggle */}
          <div className="flex gap-1">
            <Button
              onClick={() => {
                setUsePolling(false);
                setRealTimeUpdates(true);
                wsConnect();
                stopPolling();
              }}
              variant={!usePolling && realTimeUpdates ? "default" : "outline"}
              size="sm"
            >
              WebSocket
            </Button>
            <Button
              onClick={() => {
                setUsePolling(true);
                setRealTimeUpdates(false);
                wsDisconnect();
                startPolling();
              }}
              variant={usePolling ? "default" : "outline"}
              size="sm"
            >
              Polling
            </Button>
          </div>
          
          {/* Real-time toggle */}
          <Button
            onClick={() => {
              if (realTimeUpdates || usePolling) {
                wsDisconnect();
                stopPolling();
                setRealTimeUpdates(false);
                setUsePolling(false);
              } else {
                if (usePolling) {
                  startPolling();
                } else {
                  wsConnect();
                }
                setRealTimeUpdates(true);
              }
            }}
            variant={realTimeUpdates || usePolling ? "default" : "outline"}
            size="sm"
          >
            {realTimeUpdates || usePolling ? 'Disable' : 'Enable'} Real-time
          </Button>
        </div>
      </div>

      {/* Connection Error Display */}
      {connectionError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-800">
                {usePolling ? 'Polling' : 'WebSocket'} Error: {connectionError}
              </p>
              {usePolling && lastSyncTime > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {usePolling ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    stopPolling();
                    setTimeout(() => startPolling(), 1000);
                  }}
                >
                  Restart Polling
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    wsDisconnect();
                    setTimeout(() => wsConnect(), 1000);
                  }}
                >
                  Reconnect
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setUsePolling(!usePolling);
                }}
              >
                Switch to {usePolling ? 'WebSocket' : 'Polling'}
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Last Update Display */}
      {lastUpdate && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">
                  Last Update: {lastUpdate.type.replace('_', ' ')} ({usePolling ? 'Polling' : 'WebSocket'})
                </span>
              </div>
              <span className="text-xs text-blue-600">
                {new Date(lastUpdate.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Polling Status */}
      {usePolling && pollingConnected && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">
                  Auto-sync every 5 seconds
                </span>
              </div>
              <span className="text-xs text-green-600">
                Last sync: {lastSyncTime > 0 ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${wallets.reduce((sum, w) => sum + w.totalValue, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallets.reduce((sum, w) => sum + w.tokens.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Selection and Balances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Balances
            </CardTitle>
            <CardDescription>
              Select a wallet to view and manage token quantities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="wallet-select">Select Wallet</Label>
                <select 
                  id="wallet-select"
                  value={selectedWallet} 
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select a wallet</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.address} value={wallet.address}>
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)} (${wallet.totalValue.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {currentWallet && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Total Value</h4>
                    <Badge variant="secondary">
                      ${currentWallet.totalValue.toLocaleString()}
                    </Badge>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {currentWallet.tokens.map((token, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {token.formattedBalance.toLocaleString()} tokens
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${(token.usdValue).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${(token.usdValue / token.formattedBalance).toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Transfer tokens and add new tokens to wallets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transfer" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transfer">Transfer</TabsTrigger>
                <TabsTrigger value="add">Add Token</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transfer" className="space-y-4">
                <div>
                  <Label htmlFor="to-wallet">To Wallet Address</Label>
                  <Input
                    id="to-wallet"
                    placeholder="0x..."
                    value={transferData.toWallet}
                    onChange={(e) => setTransferData(prev => ({ ...prev, toWallet: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="token-address">Token</Label>
                  <select 
                    id="token-address"
                    value={transferData.tokenAddress} 
                    onChange={(e) => setTransferData(prev => ({ ...prev, tokenAddress: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select token</option>
                    {currentWallet?.tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="transfer-amount">Amount</Label>
                  <Input
                    id="transfer-amount"
                    type="number"
                    placeholder="100"
                    value={transferData.amount}
                    onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                
                <Button onClick={handleTransfer} disabled={loading} className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Transfer Token
                </Button>
              </TabsContent>
              
              <TabsContent value="add" className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="token-symbol">Symbol</Label>
                    <Input
                      id="token-symbol"
                      placeholder="TOKEN"
                      value={addTokenData.symbol}
                      onChange={(e) => setAddTokenData(prev => ({ ...prev, symbol: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="token-decimals">Decimals</Label>
                    <Input
                      id="token-decimals"
                      type="number"
                      value={addTokenData.decimals}
                      onChange={(e) => setAddTokenData(prev => ({ ...prev, decimals: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="new-token-address">Token Address</Label>
                  <Input
                    id="new-token-address"
                    placeholder="0x..."
                    value={addTokenData.address}
                    onChange={(e) => setAddTokenData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="token-balance">Balance</Label>
                    <Input
                      id="token-balance"
                      type="number"
                      placeholder="1000"
                      value={addTokenData.balance}
                      onChange={(e) => setAddTokenData(prev => ({ ...prev, balance: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="token-price">Price (USD)</Label>
                    <Input
                      id="token-price"
                      type="number"
                      step="0.01"
                      placeholder="1.00"
                      value={addTokenData.price}
                      onChange={(e) => setAddTokenData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <Button onClick={handleAddToken} disabled={loading} className="w-full">
                  Add Token to Wallet
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* RPC Response Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced RPC Response</CardTitle>
          <CardDescription>
            See how token quantities are included in RPC responses for wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-sm overflow-x-auto">
{`// Enhanced RPC Response with Quantity Overrides
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "success": true,
    "data": {
      "address": "${selectedWallet || '0x...'}",
      "tokens": [
        {
          "symbol": "POL",
          "address": "0x4585fe77225b41b697c938b018e2ac67ac5a20c0",
          "balance": "1000000000000000000000",
          "formattedBalance": "1000",
          "decimals": 18,
          "usdValue": 750000,
          "price": 750
        }
      ],
      "totalValue": ${currentWallet?.totalValue || 0}
    }
  },
  "meta": {
    "priceOverrides": [...],
    "quantityOverrides": [...],
    "walletAddress": "${selectedWallet || '0x...'}",
    "timestamp": ${Date.now()}
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenQuantityDemo;