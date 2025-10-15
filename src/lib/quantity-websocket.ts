// WebSocket integration for real-time token quantity updates
import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { tokenQuantityManager } from './token-quantity-manager';
import { enhancedRPC } from './rpc/enhanced-rpc';

export interface SocketWithIO extends NetServer {
  io?: ServerIO;
}

interface QuantityUpdateEvent {
  type: 'balance_update' | 'transfer' | 'price_update' | 'new_token';
  data: any;
  timestamp: number;
  walletAddress?: string;
}

interface ClientToServerEvents {
  'register_wallet': (walletAddress: string) => void;
  'unregister_wallet': (walletAddress: string) => void;
  'request_balances': (walletAddress: string) => void;
  'simulate_transfer': (data: {
    fromWallet: string;
    toWallet: string;
    tokenAddress: string;
    amount: string;
  }) => void;
  'update_price': (data: {
    tokenAddress: string;
    newPrice: number;
  }) => void;
}

interface ServerToClientEvents {
  'balance_updated': (data: QuantityUpdateEvent) => void;
  'transfer_completed': (data: QuantityUpdateEvent) => void;
  'price_updated': (data: QuantityUpdateEvent) => void;
  'token_added': (data: QuantityUpdateEvent) => void;
  'wallet_registered': (walletAddress: string) => void;
  'error': (message: string) => void;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

class QuantityWebSocketManager {
  private io: ServerIO<ClientToServerEvents, ServerToClientEvents> | null = null;
  private registeredWallets: Set<string> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    // This will be initialized in the API route
  }

  public setSocketIO(io: ServerIO<ClientToServerEvents, ServerToClientEvents>): void {
    this.io = io;
    this.setupEventHandlers();
    this.startRealTimeUpdates();
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Set up heartbeat for this client
      let heartbeatInterval: NodeJS.Timeout;
      
      const startHeartbeat = () => {
        heartbeatInterval = setInterval(() => {
          if (socket.connected) {
            socket.emit('ping');
          } else {
            clearInterval(heartbeatInterval);
          }
        }, 30000); // Send ping every 30 seconds
      };

      // Handle pong response
      socket.on('pong', () => {
        console.log(`Heartbeat received from ${socket.id}`);
      });

      // Start heartbeat when client connects
      startHeartbeat();

      // Handle wallet registration
      socket.on('register_wallet', (walletAddress: string) => {
        this.registeredWallets.add(walletAddress.toLowerCase());
        enhancedRPC.registerWallet(walletAddress);
        
        socket.emit('wallet_registered', walletAddress);
        
        // Send current balances
        const balances = tokenQuantityManager.getWalletBalances(walletAddress);
        if (balances) {
          socket.emit('balance_updated', {
            type: 'balance_update',
            data: balances,
            timestamp: Date.now(),
            walletAddress
          });
        }
      });

      // Handle wallet unregistration
      socket.on('unregister_wallet', (walletAddress: string) => {
        this.registeredWallets.delete(walletAddress.toLowerCase());
        enhancedRPC.unregisterWallet(walletAddress);
      });

      // Handle balance requests
      socket.on('request_balances', (walletAddress: string) => {
        const balances = tokenQuantityManager.getWalletBalances(walletAddress);
        if (balances) {
          socket.emit('balance_updated', {
            type: 'balance_update',
            data: balances,
            timestamp: Date.now(),
            walletAddress
          });
        } else {
          socket.emit('error', `Wallet ${walletAddress} not found`);
        }
      });

      // Handle transfer simulation
      socket.on('simulate_transfer', (data) => {
        const success = tokenQuantityManager.simulateTransfer(
          data.fromWallet,
          data.toWallet,
          data.tokenAddress,
          data.amount
        );

        if (success) {
          // Notify both wallets if they're registered
          this.notifyWalletUpdate(data.fromWallet, 'transfer', {
            from: data.fromWallet,
            to: data.toWallet,
            tokenAddress: data.tokenAddress,
            amount: data.amount,
            direction: 'sent'
          });

          this.notifyWalletUpdate(data.toWallet, 'transfer', {
            from: data.fromWallet,
            to: data.toWallet,
            tokenAddress: data.tokenAddress,
            amount: data.amount,
            direction: 'received'
          });
        } else {
          socket.emit('error', 'Transfer failed - insufficient balance or invalid data');
        }
      });

      // Handle price updates
      socket.on('update_price', (data) => {
        const priceUpdates = {
          [data.tokenAddress]: data.newPrice
        };

        tokenQuantityManager.updatePrices(priceUpdates);
        enhancedRPC.updatePriceOverrides(priceUpdates);

        // Notify all registered wallets about price update
        this.broadcastPriceUpdate(data.tokenAddress, data.newPrice);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        clearInterval(heartbeatInterval);
      });
    });
  }

  private startRealTimeUpdates(): void {
    // Simulate real-time price updates every 30 seconds
    this.updateInterval = setInterval(() => {
      if (this.registeredWallets.size === 0) return;

      // Simulate price changes for random tokens
      const tokens = [
        '0x4585fe77225b41b697c938b018e2ac67ac5a20c0', // POL
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'  // WBTC
      ];

      const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
      const currentPrice = this.getCurrentPrice(randomToken);
      const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
      const newPrice = currentPrice * (1 + priceChange);

      this.broadcastPriceUpdate(randomToken, newPrice);
    }, 30000); // Every 30 seconds
  }

  private getCurrentPrice(tokenAddress: string): number {
    // Get current price from the enhanced RPC system
    const overrides = enhancedRPC.getPriceOverrides();
    const override = overrides.find(o => o.tokenAddress === tokenAddress.toLowerCase());
    return override?.price || 1;
  }

  private notifyWalletUpdate(walletAddress: string, type: string, data: any): void {
    if (!this.io || !this.registeredWallets.has(walletAddress.toLowerCase())) return;

    const balances = tokenQuantityManager.getWalletBalances(walletAddress);
    if (balances) {
      this.io.emit('balance_updated', {
        type: type as any,
        data: { ...data, balances },
        timestamp: Date.now(),
        walletAddress
      });
    }
  }

  private broadcastPriceUpdate(tokenAddress: string, newPrice: number): void {
    if (!this.io) return;

    this.io.emit('price_updated', {
      type: 'price_update',
      data: {
        tokenAddress,
        newPrice,
        oldPrice: this.getCurrentPrice(tokenAddress)
      },
      timestamp: Date.now()
    });
  }

  public stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public getRegisteredWallets(): string[] {
    return Array.from(this.registeredWallets);
  }

  public notifyTokenAdded(walletAddress: string, tokenData: any): void {
    if (!this.io) return;

    this.io.emit('token_added', {
      type: 'new_token',
      data: tokenData,
      timestamp: Date.now(),
      walletAddress
    });
  }
}

// Singleton instance
export const quantityWebSocketManager = new QuantityWebSocketManager();

// Helper function to initialize Socket.IO in Next.js API route
export const initializeSocketIO = (
  req: NextApiRequest,
  res: NextApiResponse & SocketWithIO
): ServerIO<ClientToServerEvents, ServerToClientEvents> => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/quantity',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      pingTimeout: 60000, // 60 seconds
      pingInterval: 25000, // 25 seconds
      connectTimeout: 45000, // 45 seconds
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    res.socket.server.io = io;
    quantityWebSocketManager.setSocketIO(io);
  }

  return res.socket.server.io;
};