'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { universalWalletConnector, WalletConnectionState } from '@/lib/universal-wallet-connector';

interface QuickConnectProps {
  onConnect?: (state: WalletConnectionState) => void;
  onDisconnect?: () => void;
  showBalance?: boolean;
  compact?: boolean;
}

const QuickConnect: React.FC<QuickConnectProps> = ({ 
  onConnect, 
  onDisconnect, 
  showBalance = true,
  compact = false 
}) => {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  });
  const [detectedWallets, setDetectedWallets] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectWallets();
    checkExistingConnection();
  }, []);

  const detectWallets = async () => {
    try {
      const wallets = await universalWalletConnector.detectWallet();
      setDetectedWallets(wallets);
    } catch (error) {
      console.error('Failed to detect wallets:', error);
    }
  };

  const checkExistingConnection = async () => {
    try {
      // Check if there's already a connected wallet
      const state = universalWalletConnector.getConnectionState();
      if (state.isConnected) {
        setConnectionState(state);
        onConnect?.(state);
      }
    } catch (error) {
      console.error('Failed to check existing connection:', error);
    }
  };

  const connectWallet = async (walletType: string) => {
    setLoading(walletType);
    setError(null);

    try {
      const state = await universalWalletConnector.connect(walletType);
      setConnectionState(state);
      onConnect?.(state);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error(`Failed to connect to ${walletType}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const disconnectWallet = async () => {
    try {
      await universalWalletConnector.disconnect();
      setConnectionState({
        isConnected: false,
        account: null,
        chainId: null,
        walletType: null,
        balance: '0'
      });
      onDisconnect?.();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const getWalletIcon = (walletId: string) => {
    const icons: Record<string, string> = {
      metamask: '🦊',
      trustwallet: '🛡️',
      coinbase: '🔵',
      safepal: '🔒',
      walletconnect: '🔗',
      phantom: '👻',
      rabby: '🐰',
      okx: '⚡',
      binance: '🟡',
      cryptocom: '💎',
      exodus: '📱',
      brave: '🦁',
      xdefi: '❌',
      mathwallet: '🧮',
      tokenpocket: '🅿️',
      imtoken: '💎',
      zerion: '🌟',
      frame: '🖼️',
      tally: '📊'
    };
    return icons[walletId] || '💼';
  };

  const getWalletName = (walletId: string) => {
    const names: Record<string, string> = {
      metamask: 'MetaMask',
      trustwallet: 'Trust Wallet',
      coinbase: 'Coinbase Wallet',
      safepal: 'SafePal',
      walletconnect: 'WalletConnect',
      phantom: 'Phantom',
      rabby: 'Rabby',
      okx: 'OKX Wallet',
      binance: 'Binance Wallet',
      cryptocom: 'Crypto.com DeFi Wallet',
      exodus: 'Exodus',
      brave: 'Brave Wallet',
      xdefi: 'XDEFI Wallet',
      mathwallet: 'MathWallet',
      tokenpocket: 'TokenPocket',
      imtoken: 'imToken',
      zerion: 'Zerion',
      frame: 'Frame',
      tally: 'Tally'
    };
    return names[walletId] || walletId;
  };

  const getWalletInstallUrl = (walletId: string): string => {
    const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const urls: Record<string, string> = {
      metamask: isMobile ? 'https://metamask.app.link/dapp/' : 'https://metamask.io/download/',
      trustwallet: isMobile ? 'https://link.trustwallet.com/open_url?coin_id=60&url=' : 'https://trustwallet.com/download/',
      coinbase: isMobile ? 'https://go.cb-w.com/dapp' : 'https://www.coinbase.com/wallet',
      safepal: isMobile ? 'safepal://dapp/' : 'https://www.safepal.io/download',
      walletconnect: 'https://walletconnect.com/',
      phantom: 'https://phantom.app/',
      rabby: 'https://rabby.io/',
      okx: isMobile ? 'okx://wallet/dapp/' : 'https://www.okx.com/web3',
      binance: isMobile ? 'bnbapp://dapp/' : 'https://www.binance.com/en/web3',
      cryptocom: isMobile ? 'cryptodefimobile://dapp/' : 'https://crypto.com/defi-wallet',
      exodus: 'https://www.exodus.com/download/',
      brave: 'https://brave.com/wallet/',
      xdefi: isMobile ? 'xdefi://dapp/' : 'https://www.xdefi.io/',
      mathwallet: isMobile ? 'mathwallet://dapp/' : 'https://mathwallet.org/en-us/',
      tokenpocket: isMobile ? 'tpoutside://open?param=' : 'https://www.tokenpocket.pro/en/download/app',
      imtoken: isMobile ? 'imtokenv2://dapp/' : 'https://token.im/download',
      zerion: isMobile ? 'zerion://dapp/' : 'https://zerion.io/download',
      frame: 'https://frame.sh/',
      tally: 'https://tally.xyz/'
    };
    return urls[walletId] || '#';
  };

  if (connectionState.isConnected) {
    if (compact) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {getWalletIcon(connectionState.walletType!)} {connectionState.account?.slice(0, 6)}...{connectionState.account?.slice(-4)}
          </Badge>
          <Button size="sm" variant="ghost" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      );
    }

    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-lg">{getWalletIcon(connectionState.walletType!)}</span>
              </div>
              <div>
                <div className="font-medium">{getWalletName(connectionState.walletType!)}</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {connectionState.account?.slice(0, 6)}...{connectionState.account?.slice(-4)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {showBalance && (
                <div className="text-right">
                  <div className="text-sm font-medium">{parseFloat(connectionState.balance).toFixed(4)} ETH</div>
                  <div className="text-xs text-muted-foreground">Chain {connectionState.chainId}</div>
                </div>
              )}
              <Button size="sm" variant="outline" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {detectedWallets.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full" size={compact ? "sm" : "default"}>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                Detected Wallets
              </div>
            </div>
            <DropdownMenuSeparator />
            {detectedWallets.map((walletId) => (
              <DropdownMenuItem
                key={walletId}
                onClick={() => connectWallet(walletId)}
                disabled={loading === walletId}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span>{getWalletIcon(walletId)}</span>
                  <span>{getWalletName(walletId)}</span>
                  {loading === walletId && (
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-auto" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open('https://metamask.io/download/', '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Install MetaMask
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          className="w-full" 
          onClick={() => window.open('https://metamask.io/download/', '_blank')}
          variant="outline"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Install Wallet to Connect
        </Button>
      )}
    </div>
  );
};

export default QuickConnect;