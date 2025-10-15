'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Wallet,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuantityWebSocket } from '@/hooks/use-quantity-websocket';
import { WebSocketStatus } from '@/components/websocket/WebSocketStatus';
import { WalletConnectionState } from '@/lib/universal-wallet-connector';

interface Token {
  symbol: string;
  chain: string;
  balance: number;
  price: number;
  value: number;
  address: string;
  decimals: number;
}

interface TokenBalanceProps {
  walletAddress?: string;
  onTokenUpdate?: () => void;
  connectionState?: WalletConnectionState;
}

export function TokenBalance({ walletAddress, onTokenUpdate, connectionState }: TokenBalanceProps) {
  // Use connected wallet address if available, otherwise use the provided address
  const effectiveWalletAddress = connectionState?.isConnected && connectionState.account 
    ? connectionState.account 
    : walletAddress || '0x1234567890123456789012345678901234567890';
  const [tokens, setTokens] = useState<Token[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddToken, setShowAddToken] = useState(false);
  const [newTokenAmount, setNewTokenAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT-ethereum');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  // WebSocket integration for real-time updates
  const {
    isConnected: wsConnected,
    connectionError: wsError,
    lastUpdate,
    isWebSocketSupported,
    connect: wsConnect,
    disconnect: wsDisconnect
  } = useQuantityWebSocket({
    walletAddress: effectiveWalletAddress,
    onBalanceUpdate: (data) => {
      console.log('Real-time balance update:', data);
      fetchTokenBalances(); // Refresh balances when WebSocket updates arrive
    },
    onError: (message) => {
      console.error('WebSocket error:', message);
      toast({
        title: "WebSocket Error",
        description: message,
        variant: "destructive"
      });
    }
  });

  const availableTokens = [
    { key: 'USDT-ethereum', symbol: 'USDT', chain: 'Ethereum', price: 1.00 },
    { key: 'USDC-ethereum', symbol: 'USDC', chain: 'Ethereum', price: 1.00 },
    { key: 'POL-polygon', symbol: 'POL', chain: 'Polygon', price: 0.85 }
  ];

  useEffect(() => {
    if (effectiveWalletAddress) {
      fetchTokenBalances();
    }
  }, [effectiveWalletAddress, connectionState?.account]);

  const fetchTokenBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wallet/balance?address=${effectiveWalletAddress}`);
      const data = await response.json();
      
      if (data.balances) {
        setTokens(data.balances);
        setTotalValue(data.totalValue);
      }
    } catch (error) {
      console.error('Error fetching token balances:', error);
      toast({
        title: "Error",
        description: "Failed to fetch token balances",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async () => {
    if (!newTokenAmount || parseFloat(newTokenAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid token amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdating(true);
      const [symbol, chain] = selectedToken.split('-');
      const tokenInfo = availableTokens.find(t => t.key === selectedToken);
      
      const response = await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: effectiveWalletAddress,
          symbol,
          chain,
          balance: parseFloat(newTokenAmount),
          price: tokenInfo?.price || 1.00,
          action: 'add'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTokens(data.balances);
        setTotalValue(data.totalValue);
        setNewTokenAmount('');
        setShowAddToken(false);
        toast({
          title: "Success",
          description: `Added ${newTokenAmount} ${symbol} to your wallet`
        });
        onTokenUpdate?.();
      } else {
        throw new Error('Failed to add token');
      }
    } catch (error) {
      console.error('Error adding token:', error);
      toast({
        title: "Error",
        description: "Failed to add token to wallet",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveToken = async (token: Token) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: effectiveWalletAddress,
          symbol: token.symbol,
          chain: token.chain,
          balance: token.balance,
          price: token.price,
          action: 'remove'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTokens(data.balances);
        setTotalValue(data.totalValue);
        toast({
          title: "Success",
          description: `Removed ${token.symbol} from your wallet`
        });
        onTokenUpdate?.();
      } else {
        throw new Error('Failed to remove token');
      }
    } catch (error) {
      console.error('Error removing token:', error);
      toast({
        title: "Error",
        description: "Failed to remove token from wallet",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatBalance = (balance: number, decimals: number) => {
    return balance.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: Math.min(6, decimals)
    });
  };

  const formatValue = (value: number) => {
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
            <Wallet className="h-5 w-5" />
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading token balances...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Token Balances
            </CardTitle>
            <CardDescription>
              Total Portfolio Value: {formatValue(totalValue)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTokenBalances}
              disabled={updating}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddToken(!showAddToken)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* WebSocket Status */}
        <div className="mt-4">
          <WebSocketStatus
            isConnected={wsConnected}
            connectionError={wsError}
            onConnect={wsConnect}
            onDisconnect={wsDisconnect}
            isWebSocketSupported={isWebSocketSupported}
          />
        </div>
      </CardHeader>
      <CardContent>
        {showAddToken && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-3">Add Token to Wallet</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="token-select">Token</Label>
                <select
                  id="token-select"
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {availableTokens.map(token => (
                    <option key={token.key} value={token.key}>
                      {token.symbol} ({token.chain}) - ${token.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="token-amount">Amount</Label>
                <Input
                  id="token-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={newTokenAmount}
                  onChange={(e) => setNewTokenAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddToken} disabled={updating}>
                  {updating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Token
                </Button>
                <Button variant="outline" onClick={() => setShowAddToken(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {tokens.length === 0 ? (
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              No tokens found in your wallet. Add some tokens to get started!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {tokens.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold">{token.symbol}</span>
                  </div>
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatBalance(token.balance, token.decimals)} tokens
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {token.chain}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatValue(token.value)}</div>
                  <div className="text-sm text-muted-foreground">
                    @ ${token.price.toFixed(4)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveToken(token)}
                    disabled={updating}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}