'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface QuantityUpdateEvent {
  type: 'balance_update' | 'transfer' | 'price_update' | 'new_token';
  data: any;
  timestamp: number;
  walletAddress?: string;
}

interface UseQuantityWebSocketOptions {
  walletAddress?: string;
  autoConnect?: boolean;
  onBalanceUpdate?: (data: QuantityUpdateEvent) => void;
  onTransfer?: (data: QuantityUpdateEvent) => void;
  onPriceUpdate?: (data: QuantityUpdateEvent) => void;
  onTokenAdded?: (data: QuantityUpdateEvent) => void;
  onError?: (message: string) => void;
}

export const useQuantityWebSocket = (options: UseQuantityWebSocketOptions = {}) => {
  const {
    walletAddress,
    autoConnect = true,
    onBalanceUpdate,
    onTransfer,
    onPriceUpdate,
    onTokenAdded,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<QuantityUpdateEvent | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      const socket = io('/api/socket/quantity', {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to quantity WebSocket');
        setIsConnected(true);
        setConnectionError(null);

        // Register wallet if provided
        if (walletAddress) {
          socket.emit('register_wallet', walletAddress);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from quantity WebSocket:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      // Handle balance updates
      socket.on('balance_updated', (data: QuantityUpdateEvent) => {
        setLastUpdate(data);
        onBalanceUpdate?.(data);
      });

      // Handle transfer events
      socket.on('transfer_completed', (data: QuantityUpdateEvent) => {
        setLastUpdate(data);
        onTransfer?.(data);
      });

      // Handle price updates
      socket.on('price_updated', (data: QuantityUpdateEvent) => {
        setLastUpdate(data);
        onPriceUpdate?.(data);
      });

      // Handle new token events
      socket.on('token_added', (data: QuantityUpdateEvent) => {
        setLastUpdate(data);
        onTokenAdded?.(data);
      });

      // Handle wallet registration confirmation
      socket.on('wallet_registered', (registeredAddress: string) => {
        console.log(`Wallet ${registeredAddress} registered for real-time updates`);
      });

      // Handle errors
      socket.on('error', (message: string) => {
        console.error('WebSocket error:', message);
        setConnectionError(message);
        onError?.(message);
      });

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection');
    }
  }, [walletAddress, onBalanceUpdate, onTransfer, onPriceUpdate, onTokenAdded, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const registerWallet = useCallback((address: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('register_wallet', address);
    }
  }, []);

  const unregisterWallet = useCallback((address: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unregister_wallet', address);
    }
  }, []);

  const requestBalances = useCallback((address: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('request_balances', address);
    }
  }, []);

  const simulateTransfer = useCallback((
    fromWallet: string,
    toWallet: string,
    tokenAddress: string,
    amount: string
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('simulate_transfer', {
        fromWallet,
        toWallet,
        tokenAddress,
        amount
      });
    }
  }, []);

  const updatePrice = useCallback((tokenAddress: string, newPrice: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('update_price', {
        tokenAddress,
        newPrice
      });
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Handle wallet address changes
  useEffect(() => {
    if (isConnected && walletAddress) {
      registerWallet(walletAddress);
    }
  }, [walletAddress, isConnected, registerWallet]);

  return {
    isConnected,
    connectionError,
    lastUpdate,
    connect,
    disconnect,
    registerWallet,
    unregisterWallet,
    requestBalances,
    simulateTransfer,
    updatePrice
  };
};