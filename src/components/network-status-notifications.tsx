'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Bell,
  BellOff,
  RefreshCw,
  Network,
  Coins,
  Wifi,
  Settings,
  X,
  Zap
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  persistent: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant: 'default' | 'outline' | 'destructive';
  }>;
}

interface NetworkStatusNotificationsProps {
  onNetworkChange?: (status: any) => void;
  onTokenChange?: (status: any) => void;
}

export const NetworkStatusNotifications: React.FC<NetworkStatusNotificationsProps> = ({
  onNetworkChange,
  onTokenChange
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    // Start monitoring network changes
    startNetworkMonitoring();
    
    // Check initial status
    checkInitialStatus();
    
    return () => {
      stopNetworkMonitoring();
    };
  }, []);

  const startNetworkMonitoring = () => {
    if (!window.ethereum) return;
    
    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        addNotification({
          type: 'info',
          title: 'Wallet Connected',
          message: `Account ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)} connected`,
          persistent: false
        });
        checkNetworkStatus();
      } else {
        addNotification({
          type: 'warning',
          title: 'Wallet Disconnected',
          message: 'Your wallet has been disconnected',
          persistent: false
        });
      }
    };

    // Listen for chain changes
    const handleChainChanged = (chainId: string) => {
      const networkName = getNetworkName(chainId);
      const isCorrectNetwork = chainId === '0x23E7'; // POL Sandbox
      
      addNotification({
        type: isCorrectNetwork ? 'success' : 'warning',
        title: 'Network Changed',
        message: `Switched to ${networkName}`,
        persistent: !isCorrectNetwork
      });
      
      if (isCorrectNetwork) {
        checkTokenStatus();
      }
    };

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  };

  const stopNetworkMonitoring = () => {
    setIsMonitoring(false);
  };

  const checkInitialStatus = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts.length > 0) {
          const isCorrectNetwork = chainId === '0x23E7';
          
          if (!isCorrectNetwork) {
            addNotification({
              type: 'warning',
              title: 'Wrong Network',
              message: `You're on ${getNetworkName(chainId)}. Switch to POL Sandbox (Chain ID: 9191)`,
              persistent: true,
              actions: [
                {
                  label: 'Switch Network',
                  action: switchToPolNetwork,
                  variant: 'default'
                }
              ]
            });
          } else {
            addNotification({
              type: 'success',
              title: 'Ready to Use',
              message: 'Connected to POL Sandbox network',
              persistent: false
            });
            checkTokenStatus();
          }
        } else {
          addNotification({
            type: 'info',
            title: 'Wallet Not Connected',
            message: 'Connect your wallet to get started',
            persistent: true
          });
        }
      }
    } catch (error) {
      console.error('Failed to check initial status:', error);
    }
  };

  const checkNetworkStatus = async () => {
    try {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const isCorrectNetwork = chainId === '0x23E7';
        
        if (!isCorrectNetwork) {
          addNotification({
            type: 'warning',
            title: 'Network Configuration Required',
            message: `Current network: ${getNetworkName(chainId)}. Please switch to POL Sandbox.`,
            persistent: true,
            actions: [
              {
                label: 'Add Network',
                action: addPolNetwork,
                variant: 'default'
              }
            ]
          });
        }
      }
    } catch (error) {
      console.error('Failed to check network status:', error);
    }
  };

  const checkTokenStatus = async () => {
    try {
      // Simulate token checking
      const missingTokens = ['POL', 'USDC', 'USDT'].filter(() => Math.random() > 0.7);
      
      if (missingTokens.length > 0) {
        addNotification({
          type: 'warning',
          title: 'Missing Tokens',
          message: `Add these tokens to your wallet: ${missingTokens.join(', ')}`,
          persistent: true,
          actions: [
            {
              label: 'Add Tokens',
              action: () => addMissingTokens(missingTokens),
              variant: 'default'
            }
          ]
        });
      } else {
        addNotification({
          type: 'success',
          title: 'All Tokens Added',
          message: 'POL, USDC, and USDT tokens are configured',
          persistent: false
        });
      }
    } catch (error) {
      console.error('Failed to check token status:', error);
    }
  };

  const switchToPolNetwork = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x23E7' }]
        });
        
        addNotification({
          type: 'success',
          title: 'Network Switched',
          message: 'Successfully switched to POL Sandbox',
          persistent: false
        });
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      addNotification({
        type: 'error',
        title: 'Network Switch Failed',
        message: 'Failed to switch network. Please try adding it manually.',
        persistent: false
      });
    }
  };

  const addPolNetwork = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x23E7',
            chainName: 'POL Sandbox',
            nativeCurrency: {
              name: 'POL',
              symbol: 'POL',
              decimals: 18
            },
            rpcUrls: ['https://rpc.pol-sandbox.com/'],
            blockExplorerUrls: ['https://explorer.pol-sandbox.com']
          }]
        });
        
        addNotification({
          type: 'success',
          title: 'Network Added',
          message: 'POL Sandbox network added successfully',
          persistent: false
        });
      }
    } catch (error) {
      console.error('Failed to add network:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Add Network',
        message: 'Could not add POL Sandbox network. Please add it manually.',
        persistent: false
      });
    }
  };

  const addMissingTokens = (tokens: string[]) => {
    addNotification({
      type: 'info',
      title: 'Token Addition Guide',
      message: `Use these contract addresses to add tokens: ${tokens.join(', ')}`,
      persistent: true
    });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => {
      // Remove similar existing notifications
      const filtered = prev.filter(n => n.title !== newNotification.title);
      return [newNotification, ...filtered].slice(0, 5); // Keep max 5 notifications
    });
    
    // Auto-remove non-persistent notifications after 5 seconds
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNetworkName = (chainId: string): string => {
    const networks: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x539': 'POL Sandbox',
      '0x23E7': 'POL Sandbox',
      '0x89': 'Polygon',
      '0x38': 'BSC',
      '0xa': 'Optimism',
      '0xa4b1': 'Arbitrum'
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-50 text-green-800';
      case 'error': return 'border-red-500 bg-red-50 text-red-800';
      case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'info': return 'border-blue-500 bg-blue-50 text-blue-800';
      default: return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">Network Status</span>
          <Badge variant={isMonitoring ? "default" : "secondary"}>
            {isMonitoring ? 'Monitoring' : 'Paused'}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllNotifications}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`border-2 ${getNotificationColor(notification.type)} shadow-lg`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-xs mt-1 opacity-90">{notification.message}</p>
                  
                  {/* Actions */}
                  {notification.actions && (
                    <div className="flex gap-2 mt-3">
                      {notification.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.variant}
                          size="sm"
                          onClick={action.action}
                          className="text-xs"
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            {/* Timestamp */}
            <div className="text-xs opacity-70 mt-2">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NetworkStatusNotifications;