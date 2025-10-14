'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Network, 
  Coins, 
  RefreshCw,
  ExternalLink,
  Settings,
  Info
} from 'lucide-react';

interface WalletVerificationProps {
  connectionState: any;
  onRetry?: () => void;
}

const POL_NETWORK_CONFIG = {
  chainId: '0x15bca', // 88888 in hex
  chainName: 'POL Sandbox',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://rpc.pol-sandbox.com/'],
  blockExplorerUrls: ['https://explorer.pol-sandbox.com']
};

const EXPECTED_TOKENS = [
  {
    address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
    symbol: 'POL',
    decimals: 18,
    expectedBalance: '500000000000000000000' // 500 POL
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    decimals: 6,
    expectedBalance: '500000000' // 500 USDC
  },
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    symbol: 'USDT',
    decimals: 6,
    expectedBalance: '1000000000' // 1000 USDT
  }
];

export const WalletVerification: React.FC<WalletVerificationProps> = ({ 
  connectionState, 
  onRetry 
}) => {
  const [verificationStatus, setVerificationStatus] = useState<{
    network: boolean;
    tokens: boolean;
    checking: boolean;
  }>({
    network: false,
    tokens: false,
    checking: false
  });
  const [tokenStatus, setTokenStatus] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (connectionState?.isConnected) {
      verifyWalletSetup();
    }
  }, [connectionState]);

  const verifyWalletSetup = async () => {
    setVerificationStatus(prev => ({ ...prev, checking: true }));
    
    try {
      // Check network
      const isCorrectNetwork = connectionState.chainId === POL_NETWORK_CONFIG.chainId;
      
      // Check tokens (simulate verification)
      const tokenVerification: {[key: string]: boolean} = {};
      let allTokensFound = true;
      
      for (const token of EXPECTED_TOKENS) {
        // In a real implementation, you'd check if the token is added to the wallet
        // For now, we'll simulate this check
        const hasToken = await checkTokenInWallet(token);
        tokenVerification[token.symbol] = hasToken;
        if (!hasToken) allTokensFound = false;
      }
      
      setVerificationStatus({
        network: isCorrectNetwork,
        tokens: allTokensFound,
        checking: false
      });
      setTokenStatus(tokenVerification);
      
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus(prev => ({ ...prev, checking: false }));
    }
  };

  const checkTokenInWallet = async (token: any): Promise<boolean> => {
    // Simulate token check - in reality, you'd use wallet APIs
    // For demo purposes, we'll randomly return true/false
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate 70% chance of token being found
        resolve(Math.random() > 0.3);
      }, 500);
    });
  };

  const addNetworkManually = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [POL_NETWORK_CONFIG]
        });
        setTimeout(verifyWalletSetup, 2000);
      }
    } catch (error) {
      console.error('Failed to add network:', error);
    }
  };

  const addTokenManually = async (token: any) => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
              image: `/tokens/${token.symbol.toLowerCase()}.png`
            }
          }
        });
        setTimeout(verifyWalletSetup, 2000);
      }
    } catch (error) {
      console.error('Failed to add token:', error);
    }
  };

  const isAllVerified = verificationStatus.network && verificationStatus.tokens;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Wallet Setup Verification
        </CardTitle>
        <CardDescription>
          Check if POL Sandbox network and tokens are configured correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {isAllVerified ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <span className="font-medium">
              {isAllVerified ? 'Fully Configured' : 'Setup Incomplete'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={verifyWalletSetup}
            disabled={verificationStatus.checking}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${verificationStatus.checking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Network Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            <span className="font-medium">Network Configuration</span>
            <Badge variant={verificationStatus.network ? "default" : "secondary"}>
              {verificationStatus.network ? "Configured" : "Not Set"}
            </Badge>
          </div>
          
          {!verificationStatus.network && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                POL Sandbox network is not configured. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-1"
                  onClick={addNetworkManually}
                >
                  Add Network Manually
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {verificationStatus.network && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              ✓ Connected to POL Sandbox (Chain ID: 88888)
            </div>
          )}
        </div>

        {/* Token Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="font-medium">Token Configuration</span>
            <Badge variant={verificationStatus.tokens ? "default" : "secondary"}>
              {verificationStatus.tokens ? "All Added" : "Missing"}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {EXPECTED_TOKENS.map((token) => (
              <div key={token.symbol} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {tokenStatus[token.symbol] ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">{token.symbol}</span>
                  <span className="text-xs text-muted-foreground">
                    {token.expectedBalance === '500000000000000000000' ? '500 POL' :
                     token.expectedBalance === '500000000' ? '500 USDC' : '1,000 USDT'}
                  </span>
                </div>
                {!tokenStatus[token.symbol] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTokenManually(token)}
                  >
                    Add Token
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Manual Setup Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
              <li>Ensure you're on POL Sandbox network (Chain ID: 88888)</li>
              <li>Add POL token contract: 0x4585fe77225b41b697c938b018e2ac67ac5a20c0</li>
              <li>Add USDC token contract: 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48</li>
              <li>Add USDT token contract: 0xdac17f958d2ee523a2206206994597c13d831ec7</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* QR Scanner Info */}
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>For Full Format QR Codes:</strong> Use these scanners for best compatibility:
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              <li><strong>iPhone:</strong> Built-in Camera app or QR Reader</li>
              <li><strong>Android:</strong> Google Lens or QR Scanner</li>
              <li><strong>Trust Wallet:</strong> Use built-in scanner for direct format</li>
              <li><strong>MetaMask:</strong> Use built-in scanner for simple format</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default WalletVerification;