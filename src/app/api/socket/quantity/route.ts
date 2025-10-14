import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';
import { tokenQuantityManager } from '@/lib/token-quantity-manager';
import { enhancedRPC } from '@/lib/rpc/enhanced-rpc';

interface SocketWithIO extends NetServer {
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

const SocketHandler = (req: NextRequest, res: any) => {
  if (res.socket.server.io) {
    console.log('Quantity Socket is already running');
  } else {
    console.log('Initializing Quantity Socket.IO server');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/quantity',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    res.socket.server.io = io;

    const registeredWallets: Set<string> = new Set();
    let updateInterval: NodeJS.Timeout | null = null;

    // Helper functions
    const getCurrentPrice = (tokenAddress: string): number => {
      const overrides = enhancedRPC.getPriceOverrides();
      const override = overrides.find(o => o.tokenAddress === tokenAddress.toLowerCase());
      return override?.price || 1;
    };

    const notifyWalletUpdate = (walletAddress: string, type: string, data: any, socket: any) => {
      if (!registeredWallets.has(walletAddress.toLowerCase())) return;

      const balances = tokenQuantityManager.getWalletBalances(walletAddress);
      if (balances) {
        socket.emit('balance_updated', {
          type: type as any,
          data: { ...data, balances },
          timestamp: Date.now(),
          walletAddress
        });
      }
    };

    const broadcastPriceUpdate = (tokenAddress: string, newPrice: number) => {
      io.emit('price_updated', {
        type: 'price_update',
        data: {
          tokenAddress,
          newPrice,
          oldPrice: getCurrentPrice(tokenAddress)
        },
        timestamp: Date.now()
      });
    };

    const startRealTimeUpdates = () => {
      if (updateInterval) return;
      
      updateInterval = setInterval(() => {
        if (registeredWallets.size === 0) return;

        const tokens = [
          '0x4585fe77225b41b697c938b018e2ac67ac5a20c0', // POL
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
          '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'  // WBTC
        ];

        const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
        const currentPrice = getCurrentPrice(randomToken);
        const priceChange = (Math.random() - 0.5) * 0.1;
        const newPrice = currentPrice * (1 + priceChange);

        broadcastPriceUpdate(randomToken, newPrice);
      }, 30000);
    };

    io.on('connection', (socket) => {
      console.log(`Quantity client connected: ${socket.id}`);

      // Handle wallet registration
      socket.on('register_wallet', (walletAddress: string) => {
        try {
          registeredWallets.add(walletAddress.toLowerCase());
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

          // Start real-time updates if this is the first wallet
          if (registeredWallets.size === 1) {
            startRealTimeUpdates();
          }
        } catch (error) {
          console.error('Error registering wallet:', error);
          socket.emit('error', 'Failed to register wallet');
        }
      });

      // Handle wallet unregistration
      socket.on('unregister_wallet', (walletAddress: string) => {
        try {
          registeredWallets.delete(walletAddress.toLowerCase());
          enhancedRPC.unregisterWallet(walletAddress);

          // Stop updates if no wallets are registered
          if (registeredWallets.size === 0 && updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
          }
        } catch (error) {
          console.error('Error unregistering wallet:', error);
          socket.emit('error', 'Failed to unregister wallet');
        }
      });

      // Handle balance requests
      socket.on('request_balances', (walletAddress: string) => {
        try {
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
        } catch (error) {
          console.error('Error requesting balances:', error);
          socket.emit('error', 'Failed to get balances');
        }
      });

      // Handle transfer simulation
      socket.on('simulate_transfer', (data) => {
        try {
          const success = tokenQuantityManager.simulateTransfer(
            data.fromWallet,
            data.toWallet,
            data.tokenAddress,
            data.amount
          );

          if (success) {
            // Notify both wallets if they're registered
            notifyWalletUpdate(data.fromWallet, 'transfer', {
              from: data.fromWallet,
              to: data.toWallet,
              tokenAddress: data.tokenAddress,
              amount: data.amount,
              direction: 'sent'
            }, socket);

            notifyWalletUpdate(data.toWallet, 'transfer', {
              from: data.fromWallet,
              to: data.toWallet,
              tokenAddress: data.tokenAddress,
              amount: data.amount,
              direction: 'received'
            }, socket);
          } else {
            socket.emit('error', 'Transfer failed - insufficient balance or invalid data');
          }
        } catch (error) {
          console.error('Error simulating transfer:', error);
          socket.emit('error', 'Failed to process transfer');
        }
      });

      // Handle price updates
      socket.on('update_price', (data) => {
        try {
          const priceUpdates = {
            [data.tokenAddress]: data.newPrice
          };

          tokenQuantityManager.updatePrices(priceUpdates);
          enhancedRPC.updatePriceOverrides(priceUpdates);

          broadcastPriceUpdate(data.tokenAddress, data.newPrice);
        } catch (error) {
          console.error('Error updating price:', error);
          socket.emit('error', 'Failed to update price');
        }
      });

      socket.on('disconnect', () => {
        console.log(`Quantity client disconnected: ${socket.id}`);
      });

      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }
};

export default SocketHandler;