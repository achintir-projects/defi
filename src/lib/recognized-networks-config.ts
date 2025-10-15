/**
 * Recognized Networks Configuration System
 * 
 * Uses well-known networks (Ethereum, Solana, etc.) to eliminate security warnings
 * and provides pre-populated tokens with forced pricing for demo purposes.
 */

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
  isTestnet?: boolean;
  category: 'ethereum' | 'solana' | 'layer2' | 'alternative';
}

export interface TokenConfig {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  forcedPrice?: number; // USD price for demo purposes
  defaultQuantity?: number; // Default quantity for demo
  network: string;
  type: 'native' | 'erc20' | 'spl' | 'trc20';
}

/**
 * Recognized Network Configurations
 * These are well-known networks that won't trigger security warnings
 */
export const RECOGNIZED_NETWORKS: Record<string, NetworkConfig> = {
  // Ethereum Mainnet
  ethereum: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://etherscan.io'],
    iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg'],
    category: 'ethereum'
  },

  // Solana Mainnet
  solana: {
    chainId: '0x539', // 1337 in decimal (placeholder for Solana)
    chainName: 'Solana Mainnet',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9
    },
    rpcUrls: ['https://api.mainnet-beta.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com'],
    iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_solana.jpg'],
    category: 'solana'
  },

  // Polygon Mainnet
  polygon: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_polygon.jpg'],
    category: 'layer2'
  },

  // BSC Mainnet
  bsc: {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
    iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_bnb.jpg'],
    category: 'alternative'
  },

  // Arbitrum One
  arbitrum: {
    chainId: '0xA4B1',
    chainName: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
    iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg'],
    category: 'layer2'
  },

  // Optimism
  optimism: {
    chainId: '0xA',
    chainName: 'Optimism',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_optimism.jpg'],
    category: 'layer2'
  },

  // Base
  base: {
    chainId: '0x2105',
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
    iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_base.jpg'],
    category: 'layer2'
  }
};

/**
 * Pre-populated Token Configuration
 * Popular tokens with forced pricing and default quantities for demo
 */
export const PREPOPULATED_TOKENS: TokenConfig[] = [
  // Ethereum Network Tokens
  {
    address: 'native',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    forcedPrice: 2500.00,
    defaultQuantity: 10000,
    network: 'ethereum',
    type: 'native',
    logoURI: 'https://icons.llamao.fi/icons/tokens/eth.png'
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    forcedPrice: 1.00,
    defaultQuantity: 10000,
    network: 'ethereum',
    type: 'erc20',
    logoURI: 'https://icons.llamao.fi/icons/tokens/usdt.png'
  },
  {
    address: '0xA0b86a33E6441b6e8A8A0A0A4B9A5c8e4e4e4e4e',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    forcedPrice: 1.00,
    defaultQuantity: 10000,
    network: 'ethereum',
    type: 'erc20',
    logoURI: 'https://icons.llamao.fi/icons/tokens/usdc.png'
  },
  {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    forcedPrice: 45000.00,
    defaultQuantity: 10000,
    network: 'ethereum',
    type: 'erc20',
    logoURI: 'https://icons.llamao.fi/icons/tokens/wbtc.png'
  },

  // Solana Network Tokens
  {
    address: 'native',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    forcedPrice: 100.00,
    defaultQuantity: 10000,
    network: 'solana',
    type: 'native',
    logoURI: 'https://icons.llamao.fi/icons/tokens/sol.png'
  },
  {
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    forcedPrice: 1.00,
    defaultQuantity: 10000,
    network: 'solana',
    type: 'spl',
    logoURI: 'https://icons.llamao.fi/icons/tokens/usdt.png'
  },

  // Polygon Network Tokens
  {
    address: 'native',
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    forcedPrice: 0.85,
    defaultQuantity: 10000,
    network: 'polygon',
    type: 'native',
    logoURI: 'https://icons.llamao.fi/icons/tokens/matic.png'
  },
  {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    forcedPrice: 1.00,
    defaultQuantity: 10000,
    network: 'polygon',
    type: 'erc20',
    logoURI: 'https://icons.llamao.fi/icons/tokens/usdt.png'
  },

  // BSC Network Tokens
  {
    address: 'native',
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    forcedPrice: 300.00,
    defaultQuantity: 10000,
    network: 'bsc',
    type: 'native',
    logoURI: 'https://icons.llamao.fi/icons/tokens/bnb.png'
  },
  {
    address: '0x55d398326f99059fF775485246999027B3197955',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
    forcedPrice: 1.00,
    defaultQuantity: 10000,
    network: 'bsc',
    type: 'erc20',
    logoURI: 'https://icons.llamao.fi/icons/tokens/usdt.png'
  }
];

/**
 * Recognized Networks Manager
 */
export class RecognizedNetworksManager {
  
  /**
   * Get all available networks
   */
  static getAllNetworks(): NetworkConfig[] {
    return Object.values(RECOGNIZED_NETWORKS);
  }

  /**
   * Get network by chain ID
   */
  static getNetworkByChainId(chainId: string): NetworkConfig | null {
    const normalizedChainId = chainId.toLowerCase();
    return Object.values(RECOGNIZED_NETWORKS).find(
      network => network.chainId.toLowerCase() === normalizedChainId
    ) || null;
  }

  /**
   * Get network by name
   */
  static getNetworkByName(name: string): NetworkConfig | null {
    const normalizedName = name.toLowerCase();
    return Object.values(RECOGNIZED_NETWORKS).find(
      network => network.chainName.toLowerCase().includes(normalizedName)
    ) || null;
  }

  /**
   * Get tokens for a specific network
   */
  static getTokensForNetwork(networkName: string): TokenConfig[] {
    return PREPOPULATED_TOKENS.filter(token => token.network === networkName);
  }

  /**
   * Get all tokens grouped by network
   */
  static getAllTokensByNetwork(): Record<string, TokenConfig[]> {
    const tokensByNetwork: Record<string, TokenConfig[]> = {};
    
    PREPOPULATED_TOKENS.forEach(token => {
      if (!tokensByNetwork[token.network]) {
        tokensByNetwork[token.network] = [];
      }
      tokensByNetwork[token.network].push(token);
    });
    
    return tokensByNetwork;
  }

  /**
   * Get popular networks (top 4)
   */
  static getPopularNetworks(): NetworkConfig[] {
    return [
      RECOGNIZED_NETWORKS.ethereum,
      RECOGNIZED_NETWORKS.solana,
      RECOGNIZED_NETWORKS.polygon,
      RECOGNIZED_NETWORKS.bsc
    ];
  }

  /**
   * Get token by symbol and network
   */
  static getToken(symbol: string, network: string): TokenConfig | null {
    return PREPOPULATED_TOKENS.find(
      token => token.symbol === symbol && token.network === network
    ) || null;
  }

  /**
   * Calculate token value in USD
   */
  static calculateTokenValue(token: TokenConfig, quantity?: number): number {
    const actualQuantity = quantity || token.defaultQuantity || 0;
    const price = token.forcedPrice || 0;
    const decimals = token.decimals;
    
    // Convert from token decimals to standard units
    const adjustedQuantity = actualQuantity / Math.pow(10, decimals);
    return adjustedQuantity * price;
  }

  /**
   * Get total portfolio value for a network
   */
  static getNetworkPortfolioValue(networkName: string): number {
    const tokens = this.getTokensForNetwork(networkName);
    return tokens.reduce((total, token) => {
      return total + this.calculateTokenValue(token);
    }, 0);
  }

  /**
   * Switch network in wallet (Ethereum-compatible networks only)
   */
  static async switchNetwork(walletProvider: any, chainId: string): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      if (!walletProvider || !walletProvider.request) {
        return { 
          success: false, 
          error: 'Wallet not connected' 
        };
      }

      await walletProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }]
      });

      return { 
        success: true, 
        message: 'Network switched successfully' 
      };

    } catch (error: any) {
      console.error('Failed to switch network:', error);
      
      if (error.code === 4902) {
        // Network doesn't exist, try to add it
        return await this.addNetwork(walletProvider, chainId);
      } else if (error.code === 4001) {
        return { 
          success: false, 
          error: 'User rejected the request' 
        };
      } else {
        return { 
          success: false, 
          error: error.message || 'Failed to switch network' 
        };
      }
    }
  }

  /**
   * Add network to wallet (Ethereum-compatible networks only)
   */
  static async addNetwork(walletProvider: any, chainId: string): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      const network = this.getNetworkByChainId(chainId);
      if (!network) {
        return { 
          success: false, 
          error: 'Unknown network' 
        };
      }

      if (network.category === 'solana') {
        return { 
          success: false, 
          error: 'Solana networks require manual setup in Solana wallets' 
        };
      }

      await walletProvider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: network.chainId,
          chainName: network.chainName,
          nativeCurrency: network.nativeCurrency,
          rpcUrls: network.rpcUrls,
          blockExplorerUrls: network.blockExplorerUrls,
          iconUrls: network.iconUrls
        }]
      });

      return { 
        success: true, 
        message: `${network.chainName} added successfully` 
      };

    } catch (error: any) {
      console.error('Failed to add network:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to add network' 
      };
    }
  }

  /**
   * Get network category display name
   */
  static getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      'ethereum': 'Ethereum Ecosystem',
      'solana': 'Solana Ecosystem',
      'layer2': 'Layer 2 Solutions',
      'alternative': 'Alternative Chains'
    };
    return categoryNames[category] || category;
  }

  /**
   * Format token balance for display
   */
  static formatTokenBalance(balance: string, decimals: number): string {
    const value = parseFloat(balance) / Math.pow(10, decimals);
    if (value === 0) return '0';
    if (value < 0.001) return '< 0.001';
    if (value < 1) return value.toFixed(4);
    if (value < 1000) return value.toFixed(2);
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  /**
   * Format USD value for display
   */
  static formatUSDValue(value: number): string {
    if (value === 0) return '$0.00';
    if (value < 0.01) return '< $0.01';
    if (value < 1) return `$${value.toFixed(4)}`;
    if (value < 1000) return `$${value.toFixed(2)}`;
    if (value < 1000000) return `$${(value / 1000).toFixed(1)}K`;
    if (value < 1000000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${(value / 1000000000).toFixed(1)}B`;
  }
}