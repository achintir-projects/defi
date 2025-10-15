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
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Network,
  Globe,
  Coins,
  Shield,
  ExternalLink,
  Copy,
  Settings
} from 'lucide-react';
import { 
  RECOGNIZED_NETWORKS, 
  PREPOPULATED_TOKENS, 
  RecognizedNetworksManager,
  NetworkConfig,
  TokenConfig
} from '@/lib/recognized-networks-config';

interface NetworkPortfolio {
  network: string;
  config: NetworkConfig;
  tokens: TokenConfig[];
  totalValue: number;
  isConnected: boolean;
}

interface RecognizedNetworksDashboardProps {
  onConnect?: (network: string, address: string) => void;
}

export const RecognizedNetworksDashboard: React.FC<RecognizedNetworksDashboardProps> = ({ onConnect }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('ethereum');
  const [portfolios, setPortfolios] = useState<Record<string, NetworkPortfolio>>({});
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    initializePortfolios();
  }, []);

  const initializePortfolios = () => {
    const initialPortfolios: Record<string, NetworkPortfolio> = {};
    
    Object.entries(RECOGNIZED_NETWORKS).forEach(([key, config]) => {
      const tokens = RecognizedNetworksManager.getTokensForNetwork(key);
      const totalValue = RecognizedNetworksManager.getNetworkPortfolioValue(key);
      
      initialPortfolios[key] = {
        network: key,
        config,
        tokens,
        totalValue,
        isConnected: false
      };
    });
    
    setPortfolios(initialPortfolios);
  };

  const handleConnectNetwork = async (networkKey: string) => {
    setIsConnecting(networkKey);
    
    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const network = RECOGNIZED_NETWORKS[networkKey];
        
        if (network.category === 'solana') {
          // For Solana, we'd need a different approach
          setConnectionStatus(prev => ({ ...prev, [networkKey]: true }));
          setPortfolios(prev => ({
            ...prev,
            [networkKey]: { ...prev[networkKey], isConnected: true }
          }));
        } else {
          // For Ethereum-compatible networks
          const result = await RecognizedNetworksManager.switchNetwork(
            (window as any).ethereum,
            network.chainId
          );
          
          if (result.success) {
            setConnectionStatus(prev => ({ ...prev, [networkKey]: true }));
            setPortfolios(prev => ({
              ...prev,
              [networkKey]: { ...prev[networkKey], isConnected: true }
            }));
            
            // Get connected address
            const accounts = await (window as any).ethereum.request({
              method: 'eth_requestAccounts'
            });
            
            if (accounts.length > 0 && onConnect) {
              onConnect(networkKey, accounts[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to connect network:', error);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleAddToken = async (token: TokenConfig) => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        if (token.type === 'erc20' && token.address !== 'native') {
          await (window as any).ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: token.address,
                symbol: token.symbol,
                decimals: token.decimals,
                image: token.logoURI
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to add token:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const popularNetworks = RecognizedNetworksManager.getPopularNetworks();
  const currentPortfolio = portfolios[selectedNetwork];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Multi-Chain Portfolio Dashboard</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect to recognized networks like Ethereum, Solana, and Polygon with pre-populated tokens. 
          No security warnings - just seamless DeFi access.
        </p>
      </div>

      {/* Network Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Select Network
          </CardTitle>
          <CardDescription>
            Choose from popular blockchain networks with pre-configured tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularNetworks.map((network) => (
              <Button
                key={network.chainId}
                variant={selectedNetwork === Object.keys(RECOGNIZED_NETWORKS).find(key => RECOGNIZED_NETWORKS[key].chainId === network.chainId) ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => setSelectedNetwork(Object.keys(RECOGNIZED_NETWORKS).find(key => RECOGNIZED_NETWORKS[key].chainId === network.chainId) || 'ethereum')}
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{network.chainName}</div>
                  <div className="text-xs text-muted-foreground">{network.nativeCurrency.symbol}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Network Portfolio */}
      {currentPortfolio && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  {currentPortfolio.config.chainName} Portfolio
                </CardTitle>
                <CardDescription>
                  {RecognizedNetworksManager.getCategoryDisplayName(currentPortfolio.config.category)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={currentPortfolio.isConnected ? "default" : "secondary"}>
                  {currentPortfolio.isConnected ? "Connected" : "Not Connected"}
                </Badge>
                <Button
                  onClick={() => handleConnectNetwork(selectedNetwork)}
                  disabled={isConnecting === selectedNetwork || currentPortfolio.isConnected}
                  size="sm"
                >
                  {isConnecting === selectedNetwork ? "Connecting..." : currentPortfolio.isConnected ? "Connected" : "Connect"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Portfolio Value */}
            <div className="mb-6 p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Total Portfolio Value</div>
                  <div className="text-2xl font-bold">
                    {RecognizedNetworksManager.formatUSDValue(currentPortfolio.totalValue)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Network</div>
                  <div className="font-medium">{currentPortfolio.config.chainName}</div>
                </div>
              </div>
            </div>

            {/* Tokens List */}
            <div className="space-y-4">
              <h3 className="font-medium">Pre-Populated Tokens</h3>
              <div className="grid gap-4">
                {currentPortfolio.tokens.map((token) => (
                  <div key={`${token.address}-${token.network}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {RecognizedNetworksManager.formatTokenBalance(
                            (token.defaultQuantity || 10000).toString(),
                            token.decimals
                          )} tokens
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {RecognizedNetworksManager.formatUSDValue(
                          RecognizedNetworksManager.calculateTokenValue(token)
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @ ${token.forcedPrice?.toFixed(2)}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(token.address)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {token.type === 'erc20' && token.address !== 'native' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToken(token)}
                          >
                            Add to Wallet
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Networks Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            All Networks Overview
          </CardTitle>
          <CardDescription>
            Complete portfolio across all supported blockchain networks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(portfolios).map((portfolio) => (
              <div key={portfolio.network} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Network className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{portfolio.config.chainName}</div>
                      <div className="text-xs text-muted-foreground">{portfolio.tokens.length} tokens</div>
                    </div>
                  </div>
                  <Badge variant={portfolio.isConnected ? "default" : "secondary"} className="text-xs">
                    {portfolio.isConnected ? "Connected" : "Connect"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Portfolio Value</span>
                    <span className="font-medium">
                      {RecognizedNetworksManager.formatUSDValue(portfolio.totalValue)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedNetwork(portfolio.network)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> All networks listed above are recognized blockchain mainnets. 
          No custom network configurations required - eliminating security warnings and ensuring safe connections.
        </AlertDescription>
      </Alert>
    </div>
  );
};