'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import { robustNetworkSetup } from '@/lib/robust-network-setup';
import { POL_NETWORK_CONFIG } from '@/lib/trust-wallet-network-fix';

interface NetworkStatusProps {
  chainId: string | null;
  walletType: string | null;
  onNetworkChange?: (isCorrect: boolean) => void;
}

interface NetworkInfo {
  chainId: string;
  chainName: string;
  isCorrectNetwork: boolean;
  nativeCurrency: {
    symbol: string;
    name: string;
  };
}

const POL_SANDBOX_CONFIG = {
  chainId: POL_NETWORK_CONFIG.chainId, // Use the same config as robust network setup
  chainName: POL_NETWORK_CONFIG.chainName,
  nativeCurrency: POL_NETWORK_CONFIG.nativeCurrency
};

export const NetworkStatusIndicator: React.FC<NetworkStatusProps> = ({ 
  chainId, 
  walletType, 
  onNetworkChange 
}) => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (chainId) {
      checkNetworkStatus(chainId);
    }
  }, [chainId]);

  const checkNetworkStatus = async (currentChainId: string) => {
    setIsChecking(true);
    setError('');

    try {
      // Normalize chain ID (handle both hex and decimal)
      const normalizedChainId = currentChainId.startsWith('0x') 
        ? currentChainId.toLowerCase() 
        : `0x${parseInt(currentChainId).toString(16)}`;

      const isCorrect = normalizedChainId === POL_SANDBOX_CONFIG.chainId;
      
      const info: NetworkInfo = {
        chainId: normalizedChainId,
        chainName: isCorrect ? POL_SANDBOX_CONFIG.chainName : getNetworkName(normalizedChainId),
        isCorrectNetwork: isCorrect,
        nativeCurrency: isCorrect ? POL_SANDBOX_CONFIG.nativeCurrency : { symbol: 'ETH', name: 'Ethereum' }
      };

      setNetworkInfo(info);
      onNetworkChange?.(isCorrect);

    } catch (error) {
      console.error('Failed to check network status:', error);
      setError('Failed to check network status');
    } finally {
      setIsChecking(false);
    }
  };

  const getNetworkName = (chainId: string): string => {
    const networks: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x89': 'Polygon Mainnet',
      '0x38': 'BSC Mainnet',
      '0xa4b1': 'Arbitrum One',
      '0xa': 'Optimism',
      '0x86': 'Avalanche C-Chain',
      '0xfa': 'Fantom Opera',
      '0x2105': 'Base',
      '0x23E7': 'POL Sandbox' // Add POL Sandbox network
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  };

  const handleSetupNetwork = async () => {
    if (!walletType) {
      setError('No wallet connected');
      return;
    }

    setIsSettingUp(true);
    setSetupMessage('');
    setError('');

    try {
      const result = await robustNetworkSetup.setupNetwork(walletType, (message) => {
        setSetupMessage(message);
      });

      if (result.success) {
        setSetupMessage(`✅ Successfully ${result.action === 'switched' ? 'switched to' : 'added'} POL network!`);
        // Re-check network status after setup
        setTimeout(async () => {
          if (window.ethereum) {
            const newChainId = await window.ethereum.request({ method: 'eth_chainId' });
            checkNetworkStatus(newChainId);
          }
        }, 2000);
      } else {
        setError(result.error || 'Network setup failed');
      }
    } catch (error: any) {
      console.error('Network setup failed:', error);
      setError(error.message || 'Network setup failed');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleRefresh = async () => {
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      checkNetworkStatus(currentChainId);
    }
  };

  if (!networkInfo) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Checking network status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={networkInfo.isCorrectNetwork ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {networkInfo.isCorrectNetwork ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
          Network Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Network</div>
            <div className="font-semibold">{networkInfo.chainName}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Chain ID</div>
            <div className="font-mono text-sm">{networkInfo.chainId}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={networkInfo.isCorrectNetwork ? "default" : "destructive"}>
            {networkInfo.isCorrectNetwork ? 'Correct Network' : 'Wrong Network'}
          </Badge>
          <Badge variant="outline">
            {networkInfo.nativeCurrency.symbol}
          </Badge>
        </div>

        {!networkInfo.isCorrectNetwork && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're not on the POL Sandbox network. Please switch to the POL network to use all features.
            </AlertDescription>
          </Alert>
        )}

        {setupMessage && (
          <Alert>
            <RefreshCw className={`h-4 w-4 ${isSettingUp ? 'animate-spin' : ''}`} />
            <AlertDescription>{setupMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isChecking}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {!networkInfo.isCorrectNetwork && walletType && (
            <Button 
              size="sm" 
              onClick={handleSetupNetwork}
              disabled={isSettingUp}
            >
              <Settings className={`w-4 h-4 mr-1 ${isSettingUp ? 'animate-spin' : ''}`} />
              {isSettingUp ? 'Setting up...' : 'Switch to POL'}
            </Button>
          )}

          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://pol-sandbox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              About POL Sandbox
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkStatusIndicator;