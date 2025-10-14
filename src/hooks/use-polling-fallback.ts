'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PollingUpdateEvent {
  type: 'balance_update' | 'transfer' | 'price_update' | 'new_token';
  data: any;
  timestamp: number;
  walletAddress?: string;
}

interface UsePollingOptions {
  walletAddress?: string;
  autoConnect?: boolean;
  interval?: number;
  onBalanceUpdate?: (data: PollingUpdateEvent) => void;
  onTransfer?: (data: PollingUpdateEvent) => void;
  onPriceUpdate?: (data: PollingUpdateEvent) => void;
  onTokenAdded?: (data: PollingUpdateEvent) => void;
  onError?: (message: string) => void;
}

export const usePollingFallback = (options: UsePollingOptions = {}) => {
  const {
    walletAddress,
    autoConnect = true,
    interval = 5000, // 5 seconds polling
    onBalanceUpdate,
    onTransfer,
    onPriceUpdate,
    onTokenAdded,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<PollingUpdateEvent | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/quantities?action=all');
      
      // Check if response is OK and content type is JSON
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Received non-JSON response:', text.substring(0, 200));
        throw new Error('Received HTML response instead of JSON');
      }
      
      const result = await response.json();
      
      if (result.success) {
        const currentData = JSON.stringify(result.data);
        const previousData = JSON.stringify(lastDataRef.current);
        
        // Check if data has changed
        if (currentData !== previousData && lastDataRef.current !== null) {
          // Find what changed
          const changes = detectChanges(lastDataRef.current, result.data);
          
          if (changes.length > 0) {
            const updateEvent: PollingUpdateEvent = {
              type: changes[0].type, // Use the first detected change
              data: changes[0].data,
              timestamp: Date.now(),
              walletAddress: changes[0].walletAddress
            };
            
            setLastUpdate(updateEvent);
            
            // Trigger appropriate callback
            switch (changes[0].type) {
              case 'balance_update':
                onBalanceUpdate?.(updateEvent);
                break;
              case 'transfer':
                onTransfer?.(updateEvent);
                break;
              case 'price_update':
                onPriceUpdate?.(updateEvent);
                break;
              case 'new_token':
                onTokenAdded?.(updateEvent);
                break;
            }
          }
        }
        
        lastDataRef.current = result.data;
        setLastSyncTime(Date.now());
        setConnectionError(null);
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Polling error:', errorMessage);
      setConnectionError(`Polling failed: ${errorMessage}`);
      onError?.(errorMessage);
      return null;
    }
  }, [onBalanceUpdate, onTransfer, onPriceUpdate, onTokenAdded, onError]);

  const detectChanges = (oldData: any, newData: any): Array<{type: string, data: any, walletAddress?: string}> => {
    const changes = [];
    
    if (!oldData || !newData) return changes;
    
    // Check for balance changes
    for (const newWallet of newData) {
      const oldWallet = oldData.find((w: any) => w.address === newWallet.address);
      if (!oldWallet) continue;
      
      // Check total value change
      if (Math.abs(oldWallet.totalValue - newWallet.totalValue) > 0.01) {
        changes.push({
          type: 'balance_update',
          data: newWallet,
          walletAddress: newWallet.address
        });
      }
      
      // Check for token changes
      for (const newToken of newWallet.tokens) {
        const oldToken = oldWallet.tokens?.find((t: any) => t.address === newToken.address);
        if (!oldToken) {
          changes.push({
            type: 'new_token',
            data: { wallet: newWallet, token: newToken },
            walletAddress: newWallet.address
          });
        } else if (Math.abs(oldToken.usdValue - newToken.usdValue) > 0.01) {
          changes.push({
            type: 'price_update',
            data: { token: newToken, oldPrice: oldToken.usdValue / oldToken.formattedBalance, newPrice: newToken.usdValue / newToken.formattedBalance }
          });
        }
      }
    }
    
    return changes;
  };

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    
    setIsConnected(true);
    setConnectionError(null);
    
    // Initial fetch
    fetchData();
    
    // Set up regular polling
    pollingIntervalRef.current = setInterval(() => {
      fetchData();
    }, interval);
  }, [fetchData, interval]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const simulateTransfer = useCallback(async (
    fromWallet: string,
    toWallet: string,
    tokenAddress: string,
    amount: string
  ) => {
    try {
      const response = await fetch('/api/quantities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          walletAddress: fromWallet,
          toWallet,
          tokenAddress,
          amount
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Trigger a data refresh after successful transfer
        setTimeout(() => fetchData(), 500);
        return true;
      } else {
        throw new Error(result.message || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      onError?.(error instanceof Error ? error.message : 'Transfer failed');
      return false;
    }
  }, [fetchData, onError]);

  const updatePrice = useCallback(async (tokenAddress: string, newPrice: number) => {
    try {
      const response = await fetch('/api/quantities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-prices',
          priceUpdates: { [tokenAddress]: newPrice }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Trigger a data refresh after successful price update
        setTimeout(() => fetchData(), 500);
        return true;
      } else {
        throw new Error(result.message || 'Price update failed');
      }
    } catch (error) {
      console.error('Price update error:', error);
      onError?.(error instanceof Error ? error.message : 'Price update failed');
      return false;
    }
  }, [fetchData, onError]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoConnect, startPolling, stopPolling]);

  // Handle wallet address changes
  useEffect(() => {
    if (isConnected && walletAddress) {
      // Refresh data when wallet changes
      fetchData();
    }
  }, [walletAddress, isConnected, fetchData]);

  return {
    isConnected,
    connectionError,
    lastUpdate,
    lastSyncTime,
    startPolling,
    stopPolling,
    simulateTransfer,
    updatePrice,
    refreshData: fetchData
  };
};