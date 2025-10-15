'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface TokenInfo {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
}

interface Distribution {
  id: string;
  walletAddress: string;
  token: string;
  amount: number;
  chainId: number;
  status: string;
  txHash?: string;
  tokenInfo?: TokenInfo;
  createdAt: string;
}

const TokenDistribution: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [supportedTokens, setSupportedTokens] = useState<Record<string, TokenInfo>>({});
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadSupportedTokens();
    loadDistributions();
  }, []);

  const loadSupportedTokens = async () => {
    try {
      const response = await fetch('/api/distribute', { method: 'PUT' });
      if (response.ok) {
        const data = await response.json();
        setSupportedTokens(data.tokens);
      }
    } catch (error) {
      console.error('Failed to load supported tokens:', error);
    }
  };

  const loadDistributions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/distribute');
      if (response.ok) {
        const data = await response.json();
        setDistributions(data.distributions);
      }
    } catch (error) {
      console.error('Failed to load distributions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistribute = async () => {
    if (!walletAddress || !selectedToken || !amount) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    try {
      setIsDistributing(true);
      setMessage(null);

      const response = await fetch('/api/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          token: selectedToken,
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: data.message });
        setWalletAddress('');
        setAmount('');
        setSelectedToken('');
        loadDistributions(); // Refresh distributions
      } else {
        setMessage({ type: 'error', text: data.error || 'Distribution failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsDistributing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getExplorerUrl = (txHash: string) => {
    return `https://defi-tw.netlify.app/explorer/tx/${txHash}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Token Distribution</h1>
        <p className="text-muted-foreground">
          Send tokens to SafePal wallet addresses
        </p>
      </div>

      {/* Message */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' && <CheckCircle className="h-4 w-4" />}
          {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Distribution Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Tokens</CardTitle>
          <CardDescription>
            Distribute tokens to any wallet address on the Ethereum network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(supportedTokens).map(([symbol, info]) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol} - {info.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <Button 
            onClick={handleDistribute}
            disabled={isDistributing || !walletAddress || !selectedToken || !amount}
            className="w-full"
          >
            {isDistributing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Tokens
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Distributions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Distributions</CardTitle>
              <CardDescription>
                Track your token distribution history
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadDistributions} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No distributions yet</p>
              <p className="text-sm">Send your first token distribution above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {distributions.map((dist) => (
                <div key={dist.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">
                        {dist.amount} {dist.token}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        to {formatAddress(dist.walletAddress)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(dist.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(dist.status)}
                    {dist.txHash && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={getExplorerUrl(dist.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenDistribution;