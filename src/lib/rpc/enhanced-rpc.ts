// Enhanced RPC System with Price AND Quantity Overrides
import { tokenQuantityManager, QuantityOverride } from '@/lib/token-quantity-manager';

export interface PriceOverride {
  tokenAddress: string;
  symbol: string;
  price: number;
  timestamp: number;
}

export interface EnhancedRPCResponse {
  id: number;
  jsonrpc: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  meta?: {
    priceOverrides?: PriceOverride[];
    quantityOverrides?: QuantityOverride[];
    walletAddress?: string;
    timestamp: number;
  };
}

class EnhancedRPCSystem {
  private priceOverrides: Map<string, PriceOverride> = new Map();
  private connectedWallets: Set<string> = new Set();
  private interceptMethods: Set<string> = new Set([
    'eth_call',
    'eth_getBalance',
    'eth_getTokenBalance',
    'token_balances',
    'wallet_getAssets',
    'wallet_getPortfolio'
  ]);

  constructor() {
    this.initializePriceOverrides();
  }

  private initializePriceOverrides(): void {
    // Initialize with POL-adjusted prices
    const polPrices: PriceOverride[] = [
      {
        tokenAddress: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
        symbol: 'POL',
        price: 750.00, // POL-adjusted price
        timestamp: Date.now()
      },
      {
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        symbol: 'USDC',
        price: 1.00,
        timestamp: Date.now()
      },
      {
        tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        symbol: 'WETH',
        price: 2000.00,
        timestamp: Date.now()
      },
      {
        tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        symbol: 'WBTC',
        price: 50000.00,
        timestamp: Date.now()
      }
    ];

    polPrices.forEach(price => {
      this.priceOverrides.set(price.tokenAddress.toLowerCase(), price);
    });
  }

  // Register wallet for enhanced data
  public registerWallet(walletAddress: string): void {
    this.connectedWallets.add(walletAddress.toLowerCase());
    console.log(`Wallet ${walletAddress} registered for enhanced RPC`);
  }

  // Unregister wallet
  public unregisterWallet(walletAddress: string): void {
    this.connectedWallets.delete(walletAddress.toLowerCase());
  }

  // Intercept and enhance RPC calls
  public interceptRPC(request: any, walletAddress?: string): EnhancedRPCResponse {
    const method = request.method;
    const params = request.params || [];
    const id = request.id;

    try {
      let result = null;
      let meta: EnhancedRPCResponse['meta'] = {
        timestamp: Date.now()
      };

      // Handle different RPC methods
      switch (method) {
        case 'eth_call':
          result = this.handleEthCall(params[0], params[1]);
          break;

        case 'eth_getBalance':
          result = this.handleGetBalance(params[0], params[1]);
          break;

        case 'token_balances':
        case 'wallet_getAssets':
          result = this.handleTokenBalances(walletAddress);
          meta.quantityOverrides = walletAddress ? 
            tokenQuantityManager.getQuantityOverrides(walletAddress) : undefined;
          break;

        case 'wallet_getPortfolio':
          result = this.handleGetPortfolio(walletAddress);
          meta.quantityOverrides = walletAddress ? 
            tokenQuantityManager.getQuantityOverrides(walletAddress) : undefined;
          break;

        case 'eth_getTokenBalance':
          result = this.handleGetTokenBalance(params[0], params[1], walletAddress);
          break;

        default:
          // For non-intercepted methods, return original response
          result = this.createDefaultResponse(method, params);
      }

      // Add price overrides for token-related calls
      if (this.interceptMethods.has(method)) {
        meta.priceOverrides = Array.from(this.priceOverrides.values());
        meta.walletAddress = walletAddress;
      }

      return {
        id,
        jsonrpc: '2.0',
        result,
        meta
      };

    } catch (error) {
      return {
        id,
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private handleEthCall(txData: any, blockNumber: string): string {
    // Handle contract calls (e.g., balanceOf, totalSupply)
    const data = txData.data;
    const to = txData.to?.toLowerCase();

    if (data && data.startsWith('0x70a08231')) { // balanceOf(address)
      // Return mock balance
      return '0x00000000000000000000000000000000000000000000000de0b6b3a7640000'; // 1000 tokens
    }

    if (data && data.startsWith('0x18160ddd')) { // totalSupply()
      return '0x000000000000000000000000000000000000000000000152d02c7e14af6800000'; // 100000 tokens
    }

    return '0x'; // Default empty response
  }

  private handleGetBalance(address: string, blockNumber: string): string {
    // Return mock ETH balance
    return '0x56bc75e2d630e8000'; // 100 ETH in hex
  }

  private handleTokenBalances(walletAddress?: string): any {
    if (!walletAddress) {
      return {
        success: false,
        error: 'Wallet address required'
      };
    }

    const balances = tokenQuantityManager.getWalletBalances(walletAddress);
    if (!balances) {
      return {
        success: false,
        error: 'Wallet not found'
      };
    }

    return {
      success: true,
      data: {
        address: walletAddress,
        tokens: balances.tokens.map(token => ({
          symbol: token.symbol,
          address: token.address,
          balance: token.balance,
          formattedBalance: token.formattedBalance.toString(),
          decimals: token.decimals,
          usdValue: token.usdValue,
          price: token.usdValue / token.formattedBalance
        })),
        totalValue: balances.totalValue,
        lastUpdated: balances.lastSync
      }
    };
  }

  private handleGetPortfolio(walletAddress?: string): any {
    if (!walletAddress) {
      return {
        success: false,
        error: 'Wallet address required'
      };
    }

    const summary = tokenQuantityManager.getPortfolioSummary(walletAddress);
    if (!summary) {
      return {
        success: false,
        error: 'Portfolio not found'
      };
    }

    return {
      success: true,
      data: {
        address: walletAddress,
        ...summary,
        lastUpdated: Date.now()
      }
    };
  }

  private handleGetTokenBalance(tokenAddress: string, walletAddress: string, connectedWallet?: string): any {
    const balances = tokenQuantityManager.getWalletBalances(connectedWallet || walletAddress);
    if (!balances) {
      return {
        success: false,
        error: 'Wallet not found'
      };
    }

    const token = balances.tokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    if (!token) {
      return {
        success: false,
        error: 'Token not found in wallet'
      };
    }

    return {
      success: true,
      data: {
        symbol: token.symbol,
        address: token.address,
        balance: token.balance,
        formattedBalance: token.formattedBalance.toString(),
        decimals: token.decimals,
        usdValue: token.usdValue,
        price: token.usdValue / token.formattedBalance,
        lastUpdated: token.lastUpdated
      }
    };
  }

  private createDefaultResponse(method: string, params: any[]): any {
    // Create appropriate default response based on method
    switch (method) {
      case 'eth_blockNumber':
        return '0x1234567'; // Mock block number
      case 'eth_chainId':
        return '0x1'; // Ethereum mainnet
      case 'net_version':
        return '1';
      case 'eth_gasPrice':
        return '0x3b9aca00'; // 10000000000 wei (10 gwei)
      default:
        return null;
    }
  }

  // Update price overrides
  public updatePriceOverrides(updates: { [tokenAddress: string]: number }): void {
    Object.entries(updates).forEach(([address, price]) => {
      const override: PriceOverride = {
        tokenAddress: address.toLowerCase(),
        symbol: this.getSymbolForAddress(address),
        price,
        timestamp: Date.now()
      };
      this.priceOverrides.set(address.toLowerCase(), override);
    });

    // Also update token quantities with new prices
    tokenQuantityManager.updatePrices(updates);
  }

  private getSymbolForAddress(address: string): string {
    const symbolMap: { [key: string]: string } = {
      '0x4585fe77225b41b697c938b018e2ac67ac5a20c0': 'POL',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'WBTC'
    };
    return symbolMap[address.toLowerCase()] || 'UNKNOWN';
  }

  // Get current price overrides
  public getPriceOverrides(): PriceOverride[] {
    return Array.from(this.priceOverrides.values());
  }

  // Simulate token transfer with quantity updates
  public simulateTransfer(
    fromWallet: string,
    toWallet: string,
    tokenAddress: string,
    amount: string
  ): boolean {
    return tokenQuantityManager.simulateTransfer(fromWallet, toWallet, tokenAddress, amount);
  }

  // Add token to wallet
  public addTokenToWallet(
    walletAddress: string,
    tokenAddress: string,
    symbol: string,
    decimals: number,
    balance: string,
    price: number
  ): void {
    tokenQuantityManager.addTokenToWallet(walletAddress, {
      symbol,
      address: tokenAddress,
      decimals,
      balance,
      formattedBalance: parseFloat(balance) / Math.pow(10, decimals),
      usdValue: (parseFloat(balance) / Math.pow(10, decimals)) * price
    });
  }

  // Get enhanced response for Trust Wallet
  public getTrustWalletResponse(walletAddress: string): EnhancedRPCResponse {
    return this.interceptRPC({
      id: 1,
      jsonrpc: '2.0',
      method: 'wallet_getAssets',
      params: []
    }, walletAddress);
  }

  // Clear all overrides
  public clear(): void {
    this.priceOverrides.clear();
    this.connectedWallets.clear();
    tokenQuantityManager.clear();
  }
}

// Singleton instance
export const enhancedRPC = new EnhancedRPCSystem();

// Export for use in API routes
export type { EnhancedRPCSystem };