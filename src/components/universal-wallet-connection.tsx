'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Smartphone, Laptop, Link, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { 
  universalWalletConnector, 
  WalletConfig, 
  WalletConnectionState,
  PortfolioData 
} from '@/lib/universal-wallet-connector';
import { walletConnectManager } from '@/lib/walletconnect';
import NetworkStatusIndicator from '@/components/network-status-indicator';

declare global {
  interface Window {
    ethereum?: any;
    trustwallet?: any;
    _trustwallet?: any;
  }
}

interface WalletButtonProps {
  wallet: WalletConfig;
  onConnect: (walletId: string) => void;
  isConnecting: boolean;
  isDetected: boolean;
}

const WalletButton: React.FC<WalletButtonProps> = ({ 
  wallet, 
  onConnect, 
  isConnecting, 
  isDetected 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect(wallet.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isDetected ? "default" : "outline"}
      className={`h-16 flex items-center gap-3 justify-start px-4 ${
        isDetected ? 'border-green-500 bg-green-50' : ''
      }`}
      onClick={handleConnect}
      disabled={isLoading || isConnecting}
    >
      <div className="w-8 h-8 relative">
        <img 
          src={wallet.icon} 
          alt={wallet.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to a default icon
            (e.target as HTMLImageElement).src = '/wallets/default.svg';
          }}
        />
        {isDetected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium">{wallet.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          {wallet.mobile && <Smartphone className="w-3 h-3" />}
          {wallet.extension && <Laptop className="w-3 h-3" />}
          {isDetected ? 'Detected' : 'Available'}
        </div>
      </div>
      {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />}
    </Button>
  );
};

interface ConnectionStatusProps {
  state: WalletConnectionState;
  onDisconnect: () => void;
  portfolio?: PortfolioData;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  state, 
  onDisconnect, 
  portfolio 
}) => {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-500 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Connected to {state.walletType}
          </CardTitle>
          <CardDescription>
            Your wallet is successfully connected to POL Sandbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Account</div>
              <div className="font-mono text-sm">{formatAddress(state.account!)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Balance</div>
              <div className="font-semibold">{formatBalance(state.balance)} ETH</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Chain</div>
              <div className="font-semibold">Chain ID: {state.chainId}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Portfolio Value</div>
              <div className="font-semibold text-green-600">
                ${portfolio?.totalValue.toLocaleString() || '0.00'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDisconnect}>
              Disconnect
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://etherscan.io/address/${state.account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View on Etherscan
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Network Status Indicator */}
      <NetworkStatusIndicator 
        chainId={state.chainId}
        walletType={state.walletType}
        onNetworkChange={setIsCorrectNetwork}
      />

      {/* Network Status Banner */}
      {isCorrectNetwork && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Perfect! You're on the POL Sandbox network</div>
                <div className="text-sm text-green-600">
                  All features are now available. You can use the POL Sandbox features.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface WalletConnectQRProps {
  uri: string;
  onClose: () => void;
}

const WalletConnectQR: React.FC<WalletConnectQRProps> = ({ uri, onClose }) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Scan with WalletConnect
        </CardTitle>
        <CardDescription>
          Use any WalletConnect-compatible wallet to connect to POL Sandbox
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg">
          {/* QR Code would go here - for now showing a placeholder */}
          <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <QrCode className="w-24 h-24 text-gray-400" />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Or click the button below to open your wallet
          </p>
          <Button variant="outline" asChild>
            <a href={`wc:${uri.replace('wc://', '')}`}>
              Open Wallet
            </a>
          </Button>
        </div>
        
        <Button variant="ghost" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
};

export const UniversalWalletConnection: React.FC = () => {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<string[]>([]);
  const [walletConnectURI, setWalletConnectURI] = useState<string>('');
  const [showWalletConnectQR, setShowWalletConnectQR] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioData | undefined>();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    detectWallets();
    initializeWalletConnect();
    setupNetworkMonitoring();
  }, []);

  const setupNetworkMonitoring = () => {
    if (window.ethereum) {
      // Listen for chain changes
      const handleChainChanged = (chainId: string) => {
        console.log('Chain changed to:', chainId);
        setConnectionState(prev => ({ ...prev, chainId }));
      };

      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          // User disconnected
          handleDisconnect();
        } else {
          setConnectionState(prev => ({ ...prev, account: accounts[0] }));
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Cleanup
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  };

  const detectWallets = async () => {
    try {
      const detected = await universalWalletConnector.detectWallet();
      setDetectedWallets(detected);
    } catch (error) {
      console.error('Failed to detect wallets:', error);
    }
  };

  const initializeWalletConnect = async () => {
    try {
      await walletConnectManager.initialize();
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
    }
  };

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true);
    setError('');

    try {
      if (walletId === 'walletconnect') {
        // Handle WalletConnect connection
        const uri = await walletConnectManager.connect();
        setWalletConnectURI(uri);
        setShowWalletConnectQR(true);
      } else {
        // Handle direct wallet connection
        const state = await universalWalletConnector.connect(walletId);
        setConnectionState(state);
        
        // Load portfolio data
        const portfolioData = await universalWalletConnector.getPortfolio();
        setPortfolio(portfolioData);

        // Setup network monitoring after connection
        setupNetworkMonitoring();
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await universalWalletConnector.disconnect();
      await walletConnectManager.disconnect();
      
      setConnectionState({
        isConnected: false,
        account: null,
        chainId: null,
        walletType: null,
        balance: '0'
      });
      setPortfolio(undefined);
      setShowWalletConnectQR(false);
      setWalletConnectURI('');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const handleWalletConnectConnect = async () => {
    try {
      const accounts = await walletConnectManager.requestAccounts();
      if (accounts.length > 0) {
        setConnectionState({
          isConnected: true,
          account: accounts[0],
          chainId: '1',
          walletType: 'walletconnect',
          balance: '0'
        });
        setShowWalletConnectQR(false);
      }
    } catch (error) {
      console.error('WalletConnect connection failed:', error);
      setError('Failed to connect with WalletConnect');
    }
  };

  const supportedWallets = universalWalletConnector.getSupportedWallets();

  if (connectionState.isConnected) {
    return (
      <div className="space-y-6">
        <ConnectionStatus 
          state={connectionState} 
          onDisconnect={handleDisconnect}
          portfolio={portfolio}
        />
        
        {portfolio && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>Your current token holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.tokens.map((token, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{token.balance}</div>
                      <div className="text-sm text-muted-foreground">${token.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Connect Your Wallet to POL Sandbox
          </CardTitle>
          <CardDescription>
            Choose your preferred wallet to connect and start using our Protocol-Owned Liquidity strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">Detected Wallets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {supportedWallets
                .filter(wallet => detectedWallets.includes(wallet.id) && wallet.id !== 'walletconnect')
                .map(wallet => (
                  <WalletButton
                    key={wallet.id}
                    wallet={wallet}
                    onConnect={handleConnect}
                    isConnecting={isConnecting}
                    isDetected={true}
                  />
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Other Wallets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {supportedWallets
                .filter(wallet => !detectedWallets.includes(wallet.id) || wallet.id === 'walletconnect')
                .map(wallet => (
                  <WalletButton
                    key={wallet.id}
                    wallet={wallet}
                    onConnect={handleConnect}
                    isConnecting={isConnecting}
                    isDetected={false}
                  />
                ))}
            </div>
          </div>

          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              <AlertCircle className="w-3 h-3 mr-1" />
              Make sure your wallet is unlocked and ready to connect
            </Badge>
          </div>
        </CardContent>
      </Card>

      {showWalletConnectQR && (
        <WalletConnectQR 
          uri={walletConnectURI} 
          onClose={() => setShowWalletConnectQR(false)}
        />
      )}
    </div>
  );
};