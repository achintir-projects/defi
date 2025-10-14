// Token Quantity Manager for POL Sandbox
// Manages token balances and quantities alongside price overrides

export interface TokenBalance {
  symbol: string;
  address: string;
  decimals: number;
  balance: string;
  formattedBalance: number;
  usdValue: number;
  lastUpdated: number;
}

export interface WalletTokenData {
  address: string;
  tokens: TokenBalance[];
  totalValue: number;
  lastSync: number;
}

export interface QuantityOverride {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  balance: string;
  formattedBalance: number;
  usdValue: number;
  walletAddress: string;
}

class TokenQuantityManager {
  private balances: Map<string, WalletTokenData> = new Map();
  private priceCache: Map<string, number> = new Map();
  private updateCallbacks: Set<(data: WalletTokenData) => void> = new Set();

  // Initialize with mock data for demonstration
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock wallet addresses for demonstration
    const mockWallets = [
      '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      '0x8ba1f109551bD432803012645Hac136c22C57B',
      '0x1234567890123456789012345678901234567890'
    ];

    mockWallets.forEach(walletAddress => {
      const mockTokens: TokenBalance[] = [
        {
          symbol: 'POL',
          address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
          decimals: 18,
          balance: '1000000000000000000000', // 1000 POL
          formattedBalance: 1000,
          usdValue: 750000, // $750 per POL
          lastUpdated: Date.now()
        },
        {
          symbol: 'USDT-ERC20',
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          decimals: 6,
          balance: '1000000000', // 1000 USDT ERC20
          formattedBalance: 1000,
          usdValue: 1000,
          lastUpdated: Date.now()
        },
        {
          symbol: 'USDT-TRC20',
          address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          decimals: 6,
          balance: '2000000000', // 2000 USDT TRC20
          formattedBalance: 2000,
          usdValue: 2000,
          lastUpdated: Date.now()
        },
        {
          symbol: 'USDC',
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          decimals: 6,
          balance: '500000000', // 500 USDC
          formattedBalance: 500,
          usdValue: 500,
          lastUpdated: Date.now()
        },
        {
          symbol: 'WETH',
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          decimals: 18,
          balance: '200000000000000000000', // 200 WETH
          formattedBalance: 200,
          usdValue: 400000, // $2000 per WETH
          lastUpdated: Date.now()
        },
        {
          symbol: 'WBTC',
          address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
          decimals: 8,
          balance: '5000000', // 0.05 WBTC
          formattedBalance: 0.05,
          usdValue: 2500, // $50,000 per WBTC
          lastUpdated: Date.now()
        }
      ];

      const totalValue = mockTokens.reduce((sum, token) => sum + token.usdValue, 0);

      this.balances.set(walletAddress, {
        address: walletAddress,
        tokens: mockTokens,
        totalValue,
        lastSync: Date.now()
      });
    });
  }

  // Get token balances for a specific wallet
  public getWalletBalances(walletAddress: string): WalletTokenData | null {
    return this.balances.get(walletAddress) || null;
  }

  // Get all wallet balances
  public getAllBalances(): WalletTokenData[] {
    return Array.from(this.balances.values());
  }

  // Update token balance for a wallet
  public updateTokenBalance(
    walletAddress: string, 
    tokenAddress: string, 
    newBalance: string,
    newPrice?: number
  ): void {
    let walletData = this.balances.get(walletAddress);
    
    if (!walletData) {
      // Create new wallet data if it doesn't exist
      walletData = {
        address: walletAddress,
        tokens: [],
        totalValue: 0,
        lastSync: Date.now()
      };
      this.balances.set(walletAddress, walletData);
    }

    const tokenIndex = walletData.tokens.findIndex(t => t.address === tokenAddress);
    
    if (tokenIndex >= 0) {
      // Update existing token
      const token = walletData.tokens[tokenIndex];
      token.balance = newBalance;
      token.formattedBalance = parseFloat(newBalance) / Math.pow(10, token.decimals);
      
      if (newPrice) {
        token.usdValue = token.formattedBalance * newPrice;
        this.priceCache.set(tokenAddress, newPrice);
      } else {
        const cachedPrice = this.priceCache.get(tokenAddress);
        if (cachedPrice) {
          token.usdValue = token.formattedBalance * cachedPrice;
        }
      }
      
      token.lastUpdated = Date.now();
    } else {
      // Add new token (need additional info)
      console.warn(`Token ${tokenAddress} not found in wallet ${walletAddress}`);
    }

    // Recalculate total value
    walletData.totalValue = walletData.tokens.reduce((sum, token) => sum + token.usdValue, 0);
    walletData.lastSync = Date.now();

    // Notify callbacks
    this.notifyCallbacks(walletData);
  }

  // Add new token to wallet
  public addTokenToWallet(
    walletAddress: string,
    tokenAddress: string,
    symbol: string,
    decimals: number,
    balance: string,
    price: number
  ): void {
    let walletData = this.balances.get(walletAddress);
    
    if (!walletData) {
      walletData = {
        address: walletAddress,
        tokens: [],
        totalValue: 0,
        lastSync: Date.now()
      };
      this.balances.set(walletAddress, walletData);
    }

    const formattedBalance = parseFloat(balance) / Math.pow(10, decimals);
    const usdValue = formattedBalance * price;

    const newToken: TokenBalance = {
      symbol,
      address: tokenAddress,
      decimals,
      balance,
      formattedBalance,
      usdValue,
      lastUpdated: Date.now()
    };

    const existingTokenIndex = walletData.tokens.findIndex(t => t.address === tokenAddress);
    
    if (existingTokenIndex >= 0) {
      // Update existing token
      walletData.tokens[existingTokenIndex] = newToken;
    } else {
      // Add new token
      walletData.tokens.push(newToken);
    }

    // Recalculate total value
    walletData.totalValue = walletData.tokens.reduce((sum, token) => sum + token.usdValue, 0);
    walletData.lastSync = Date.now();

    // Notify callbacks
    this.notifyCallbacks(walletData);
  }

  // Legacy method for backward compatibility
  public addTokenObjectToWallet(
    walletAddress: string,
    token: Omit<TokenBalance, 'lastUpdated'>
  ): void {
    let walletData = this.balances.get(walletAddress);
    
    if (!walletData) {
      walletData = {
        address: walletAddress,
        tokens: [],
        totalValue: 0,
        lastSync: Date.now()
      };
      this.balances.set(walletAddress, walletData);
    }

    const existingTokenIndex = walletData.tokens.findIndex(t => t.address === token.address);
    
    if (existingTokenIndex >= 0) {
      // Update existing token
      walletData.tokens[existingTokenIndex] = { ...token, lastUpdated: Date.now() };
    } else {
      // Add new token
      walletData.tokens.push({ ...token, lastUpdated: Date.now() });
    }

    // Recalculate total value
    walletData.totalValue = walletData.tokens.reduce((sum, token) => sum + token.usdValue, 0);
    walletData.lastSync = Date.now();

    // Notify callbacks
    this.notifyCallbacks(walletData);
  }

  // Get quantity overrides for RPC responses
  public getQuantityOverrides(walletAddress: string): QuantityOverride[] {
    const walletData = this.balances.get(walletAddress);
    if (!walletData) return [];

    return walletData.tokens.map(token => ({
      tokenAddress: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      balance: token.balance,
      formattedBalance: token.formattedBalance,
      usdValue: token.usdValue,
      walletAddress
    }));
  }

  // Update prices for all tokens
  public updatePrices(priceUpdates: { [tokenAddress: string]: number }): void {
    this.balances.forEach(walletData => {
      let totalValueChanged = false;
      
      walletData.tokens.forEach(token => {
        const newPrice = priceUpdates[token.address];
        if (newPrice !== undefined) {
          token.usdValue = token.formattedBalance * newPrice;
          token.lastUpdated = Date.now();
          this.priceCache.set(token.address, newPrice);
          totalValueChanged = true;
        }
      });

      if (totalValueChanged) {
        walletData.totalValue = walletData.tokens.reduce((sum, token) => sum + token.usdValue, 0);
        walletData.lastSync = Date.now();
        this.notifyCallbacks(walletData);
      }
    });
  }

  // Subscribe to balance updates
  public onBalanceUpdate(callback: (data: WalletTokenData) => void): () => void {
    this.updateCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  private notifyCallbacks(walletData: WalletTokenData): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(walletData);
      } catch (error) {
        console.error('Error in balance update callback:', error);
      }
    });
  }

  // Simulate token transfer
  public simulateTransfer(
    fromWallet: string,
    toWallet: string,
    tokenAddress: string,
    amount: string
  ): boolean {
    const fromData = this.balances.get(fromWallet);
    const toData = this.balances.get(toWallet);

    if (!fromData || !toData) return false;

    const fromToken = fromData.tokens.find(t => t.address === tokenAddress);
    if (!fromToken) return false;

    const fromBalance = BigInt(fromToken.balance);
    const transferAmount = BigInt(amount);

    if (fromBalance < transferAmount) return false;

    // Update from wallet
    this.updateTokenBalance(
      fromWallet,
      tokenAddress,
      (fromBalance - transferAmount).toString()
    );

    // Update to wallet
    const toToken = toData.tokens.find(t => t.address === tokenAddress);
    if (toToken) {
      const toBalance = BigInt(toToken.balance);
      this.updateTokenBalance(
        toWallet,
        tokenAddress,
        (toBalance + transferAmount).toString()
      );
    }

    return true;
  }

  // Get portfolio summary
  public getPortfolioSummary(walletAddress: string): {
    totalValue: number;
    tokenCount: number;
    largestHolding: { symbol: string; value: number; percentage: number } | null;
    topTokens: Array<{ symbol: string; value: number; percentage: number }>;
  } | null {
    const walletData = this.balances.get(walletAddress);
    if (!walletData) return null;

    const sortedTokens = [...walletData.tokens].sort((a, b) => b.usdValue - a.usdValue);
    const largestHolding = sortedTokens[0] ? {
      symbol: sortedTokens[0].symbol,
      value: sortedTokens[0].usdValue,
      percentage: (sortedTokens[0].usdValue / walletData.totalValue) * 100
    } : null;

    const topTokens = sortedTokens.slice(0, 5).map(token => ({
      symbol: token.symbol,
      value: token.usdValue,
      percentage: (token.usdValue / walletData.totalValue) * 100
    }));

    return {
      totalValue: walletData.totalValue,
      tokenCount: walletData.tokens.length,
      largestHolding,
      topTokens
    };
  }

  // Clear all data
  public clear(): void {
    this.balances.clear();
    this.priceCache.clear();
  }
}

// Singleton instance
export const tokenQuantityManager = new TokenQuantityManager();

// Export types for use in other modules
export type { TokenQuantityManager };