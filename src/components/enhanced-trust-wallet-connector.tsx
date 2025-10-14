'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Network, 
  Coins, 
  RefreshCw,
  ExternalLink,
  Settings,
  Info,
  Copy,
  Wallet,
  Link as LinkIcon,
  Zap
} from 'lucide-react';
import { NetworkStatusBanner } from './network-status-banner';

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
    expectedBalance: '500000000000000000000', // 500 POL
    image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x4585fe77225b41b697c938b018e2ac67ac5a20c0/logo.png'
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    decimals: 6,
    expectedBalance: '500000000', // 500 USDC
    image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png'
  },
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    symbol: 'USDT',
    decimals: 6,
    expectedBalance: '1000000000', // 1000 USDT
    image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdac17f958d2ee523a2206206994597c13d831ec7/logo.png'
  }
];

// QR Code formats for different scanners
const QR_FORMATS = {
  complete: {
    name: 'Complete Format',
    description: 'Includes network and all tokens - Best for mobile cameras',
    data: `ethereum:${POL_NETWORK_CONFIG.rpcUrls[0]}?chainId=${POL_NETWORK_CONFIG.chainId}&tokens=${EXPECTED_TOKENS.map(t => t.address).join(',')}`
  },
  simple: {
    name: 'Simple Format',
    description: 'Basic connection info - Compatible with all scanners',
    data: `wc:${btoa(JSON.stringify({
      chainId: POL_NETWORK_CONFIG.chainId,
      rpc: POL_NETWORK_CONFIG.rpcUrls[0],
      tokens: EXPECTED_TOKENS.map(t => ({
        address: t.address,
        symbol: t.symbol,
        decimals: t.decimals
      }))
    }))}`
  },
  direct: {
    name: 'Direct Format',
    description: 'Optimized for Trust Wallet scanner',
    data: `trust://add_network?chainId=${POL_NETWORK_CONFIG.chainId}&rpcUrl=${POL_NETWORK_CONFIG.rpcUrls[0]}&chainName=${encodeURIComponent(POL_NETWORK_CONFIG.chainName)}&symbol=${POL_NETWORK_CONFIG.nativeCurrency.symbol}&decimals=${POL_NETWORK_CONFIG.nativeCurrency.decimals}`
  }
};

interface ConnectionStatus {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  walletType: string | null;
  balance: string;
}

export const EnhancedTrustWalletConnector: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  });
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
  const [selectedFormat, setSelectedFormat] = useState<keyof typeof QR_FORMATS>('complete');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          setConnectionStatus({
            isConnected: true,
            account: accounts[0],
            chainId: chainId,
            walletType: 'Trust Wallet',
            balance: '0'
          });
        }
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const connectTrustWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setConnectionStatus({
          isConnected: true,
          account: accounts[0],
          chainId: chainId,
          walletType: 'Trust Wallet',
          balance: '0'
        });
        
        // Store connection info for verification
        localStorage.setItem('trustWalletConnected', 'true');
        localStorage.setItem('connectionTime', new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to connect Trust Wallet:', error);
    }
  };

  const verifyWalletSetup = async () => {
    setVerificationStatus(prev => ({ ...prev, checking: true }));
    
    try {
      // Check network
      const isCorrectNetwork = connectionStatus.chainId === POL_NETWORK_CONFIG.chainId;
      
      // Check tokens (simulate verification)
      const tokenVerification: {[key: string]: boolean} = {};
      let allTokensFound = true;
      
      for (const token of EXPECTED_TOKENS) {
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
    return new Promise(resolve => {
      setTimeout(() => {
        // Check if token was recently added via localStorage
        const addedTokens = JSON.parse(localStorage.getItem('addedTokens') || '[]');
        resolve(addedTokens.includes(token.address));
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
        
        // Store that network was added
        localStorage.setItem('polNetworkAdded', 'true');
        
        setTimeout(() => {
          checkWalletConnection();
          verifyWalletSetup();
        }, 2000);
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
              image: token.image
            }
          }
        });
        
        // Store that token was added
        const addedTokens = JSON.parse(localStorage.getItem('addedTokens') || '[]');
        addedTokens.push(token.address);
        localStorage.setItem('addedTokens', JSON.stringify(addedTokens));
        
        setTimeout(verifyWalletSetup, 2000);
      }
    } catch (error) {
      console.error('Failed to add token:', error);
    }
  };

  const openTrustWallet = () => {
    const trustWalletUrl = QR_FORMATS[selectedFormat].data;
    window.open(trustWalletUrl, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isAllVerified = verificationStatus.network && verificationStatus.tokens;

  if (connectionStatus.isConnected) {
    return (
      <div className="space-y-6">
        {/* Prominent Network Status Banner */}
        <NetworkStatusBanner />
        
        {/* Connection Status */}
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Trust Wallet Connected
            </CardTitle>
            <CardDescription>
              Your wallet is connected. Check the status above for network and token configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Account</div>
                <div className="font-mono text-sm">{formatAddress(connectionStatus.account!)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Chain ID</div>
                <div className="font-semibold">{connectionStatus.chainId}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common actions to manage your wallet configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => window.open('trust://add_network?chainId=0x15bca&rpcUrl=https://rpc.pol-sandbox.com/&chainName=POL%20Sandbox&symbol=POL&decimals=18', '_blank')}
              >
                <Network className="w-6 h-6" />
                <span>Add Network</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => window.open('trust://add_asset?contract=0x4585fe77225b41b697c938b018e2ac67ac5a20c0', '_blank')}
              >
                <Coins className="w-6 h-6" />
                <span>Add POL Token</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => window.open('trust://add_asset?contract=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '_blank')}
              >
                <Coins className="w-6 h-6" />
                <span>Add USDC Token</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prominent Network Status Banner */}
      <NetworkStatusBanner />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Enhanced Trust Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect your Trust Wallet with automatic network and token configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Connect Button */}
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={connectTrustWallet}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Connect Trust Wallet
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure Trust Wallet is installed and unlocked
            </p>
          </div>

          {/* QR Code Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Alternative: QR Code Connection</h3>
            
            <Tabs value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as keyof typeof QR_FORMATS)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="complete">Complete</TabsTrigger>
                <TabsTrigger value="simple">Simple</TabsTrigger>
                <TabsTrigger value="direct">Direct</TabsTrigger>
              </TabsList>
              
              {Object.entries(QR_FORMATS).map(([key, format]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{format.name}</h4>
                      <Badge variant="outline">
                        {key === 'complete' ? 'Best for mobile cameras' :
                         key === 'simple' ? 'Universal compatibility' : 'Trust Wallet optimized'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {format.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-gray-100 rounded font-mono text-xs break-all">
                        {format.data}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(format.data)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={openTrustWallet}
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open Trust Wallet
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Manual Configuration */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Manual Configuration:</strong>
              <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
                <li>Open Trust Wallet and go to Settings</li>
                <li>Select "Networks" and tap "Add Network"</li>
                <li>Enter POL Sandbox details:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Network Name: POL Sandbox</li>
                    <li>Chain ID: 88888</li>
                    <li>RPC URL: https://rpc.pol-sandbox.com/</li>
                  </ul>
                </li>
                <li>Add tokens using the contract addresses above</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Troubleshooting */}
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Trust Wallet Scanner Tips:</strong>
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li><strong>Complete Format:</strong> Use phone camera or Google Lens</li>
                <li><strong>Simple Format:</strong> Works with any QR scanner</li>
                <li><strong>Direct Format:</strong> Best with Trust Wallet built-in scanner</li>
                <li>If network doesn't appear, try manual configuration above</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTrustWalletConnector;