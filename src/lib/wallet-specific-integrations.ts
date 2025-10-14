// Wallet-Specific API Integrations for POL Sandbox
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  image?: string;
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
}

export interface WalletSpecificFeatures {
  watchAsset: boolean;
  addNetwork: boolean;
  signTypedData: boolean;
  batchRequests: boolean;
  customMethods: string[];
}

// MetaMask Specific Integration
export class MetaMaskIntegration {
  private readonly METAMASK_SPECIFIC_METHODS = {
    GET_SELECTED_ADDRESS: 'metamask_getSelectedAddress',
    GET_CHAIN_ID: 'metamask_getChainId',
    WATCH_ASSET: 'wallet_watchAsset',
    ADD_ETHEREUM_CHAIN: 'wallet_addEthereumChain',
    SWITCH_ETHEREUM_CHAIN: 'wallet_switchEthereumChain',
    GET_BALANCES: 'metamask_getBalances',
    SEND_TRANSACTION: 'metamask_sendTransaction'
  };

  private readonly POL_NETWORK_CONFIG: NetworkConfig = {
    chainId: '0x23E7', // 9191 in hex
    chainName: 'POL Sandbox',
    rpcUrls: ['https://rpc.pol-sandbox.com'],
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18
    },
    blockExplorerUrls: ['https://explorer.pol-sandbox.com']
  };

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask;
  }

  async addPOLNetwork(): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: this.METAMASK_SPECIFIC_METHODS.ADD_ETHEREUM_CHAIN,
        params: [this.POL_NETWORK_CONFIG]
      });
      return true;
    } catch (error: any) {
      console.error('Failed to add POL network to MetaMask:', error);
      
      // Handle specific error cases
      if (error.code === 4001) {
        throw new Error('User rejected the request');
      } else if (error.code === -32602) {
        throw new Error('Invalid parameters');
      }
      
      return false;
    }
  }

  async switchToPOLNetwork(): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: this.METAMASK_SPECIFIC_METHODS.SWITCH_ETHEREUM_CHAIN,
        params: [{ chainId: this.POL_NETWORK_CONFIG.chainId }]
      });
      return true;
    } catch (error: any) {
      console.error('Failed to switch to POL network:', error);
      
      // If network doesn't exist, try to add it
      if (error.code === 4902) {
        return await this.addPOLNetwork();
      }
      
      return false;
    }
  }

  async suggestPOLTokens(tokens: Token[]): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const token of tokens) {
      try {
        const success = await window.ethereum.request({
          method: this.METAMASK_SPECIFIC_METHODS.WATCH_ASSET,
          params: {
            type: 'ERC20',
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
              image: token.image || `https://assets.coingecko.com/coins/images/${token.address}/large/${token.symbol.toLowerCase()}.png`
            }
          }
        });
        results.push(success);
      } catch (error) {
        console.error(`Failed to add token ${token.symbol}:`, error);
        results.push(false);
      }
    }
    
    return results;
  }

  async getMetaMaskPortfolio(): Promise<any> {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      
      // Get ETH balance
      const ethBalance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      // Get token balances using MetaMask's API if available
      let tokenBalances = [];
      try {
        tokenBalances = await window.ethereum.request({
          method: this.METAMASK_SPECIFIC_METHODS.GET_BALANCES,
          params: [address]
        });
      } catch (error) {
        // Fallback to manual token balance fetching
        tokenBalances = await this.fetchTokenBalances(address);
      }

      return {
        address,
        ethBalance: parseInt(ethBalance, 16) / 1e18,
        tokens: tokenBalances,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Failed to get MetaMask portfolio:', error);
      throw error;
    }
  }

  async signPOLTransaction(transaction: any): Promise<string> {
    try {
      const txHash = await window.ethereum.request({
        method: this.METAMASK_SPECIFIC_METHODS.SEND_TRANSACTION,
        params: [transaction]
      });
      return txHash;
    } catch (error) {
      console.error('Failed to sign POL transaction:', error);
      throw error;
    }
  }

  async signTypedData(typedData: any): Promise<string> {
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [accounts[0], JSON.stringify(typedData)]
      });
      
      return signature;
    } catch (error) {
      console.error('Failed to sign typed data:', error);
      throw error;
    }
  }

  private async fetchTokenBalances(address: string): Promise<any[]> {
    // Mock implementation - would use multicall or individual ERC-20 calls
    return [
      {
        address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '1000.50',
        decimals: 6,
        price: 1.00,
        value: 1000.50
      }
    ];
  }

  getSupportedFeatures(): WalletSpecificFeatures {
    return {
      watchAsset: true,
      addNetwork: true,
      signTypedData: true,
      batchRequests: true,
      customMethods: [
        'metamask_getBalance',
        'metamask_getBlock',
        'metamask_getTransactionCount'
      ]
    };
  }
}

// Trust Wallet Specific Integration
export class TrustWalletIntegration {
  private readonly TRUST_FEATURES = {
    DAPP_BROWSER: 'trustweb3',
    DEFI_APIS: 'https://api.trustwallet.com',
    MOBILE_DEEPLINK: 'trust://dapp/',
    UNIVERSAL_LINK: 'https://link.trustwallet.com/open_url?coin_id=60&url='
  };

  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    // Check for Trust Wallet injection
    if (window.trustwallet) return true;
    
    // Check for Trust Wallet mobile browser
    if (navigator.userAgent.includes('TrustWallet')) return true;
    
    return false;
  }

  async detectTrustWallet(): Promise<boolean> {
    try {
      // Trust Wallet has specific injection patterns
      if (window.trustwallet?.isTrust) {
        return true;
      }
      
      // Check for Trust Wallet in mobile browser
      if (navigator.userAgent.includes('TrustWallet')) {
        return true;
      }
      
      // Check for Trust Wallet's web3 provider
      if (window.ethereum?.isTrust) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to detect Trust Wallet:', error);
      return false;
    }
  }

  async openInTrustWallet(url: string): Promise<void> {
    try {
      const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
      
      // Try universal link first (better UX)
      const universalLink = `${this.TRUST_FEATURES.UNIVERSAL_LINK}${encodeURIComponent(currentUrl)}`;
      window.location.href = universalLink;
      
      // Fallback to deep link after a short delay
      setTimeout(() => {
        const deepLink = `${this.TRUST_FEATURES.MOBILE_DEEPLINK}${encodeURIComponent(currentUrl)}`;
        window.location.href = deepLink;
      }, 1000);
    } catch (error) {
      console.error('Failed to open in Trust Wallet:', error);
    }
  }

  async getTrustPortfolio(address: string): Promise<any> {
    try {
      // Use Trust Wallet's enhanced portfolio API
      const response = await fetch(
        `${this.TRUST_FEATURES.DEFI_APIS}/v2/portfolio/${address}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch Trust portfolio');
      }
      
      const data = await response.json();
      return this.enhanceWithPOLData(data);
    } catch (error) {
      console.error('Failed to get Trust Wallet portfolio:', error);
      return this.getFallbackPortfolio(address);
    }
  }

  async addTrustNetwork(): Promise<boolean> {
    try {
      if (window.trustwallet) {
        await window.trustwallet.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x23E7',
            chainName: 'POL Sandbox',
            rpcUrls: ['https://rpc.pol-sandbox.com'],
            nativeCurrency: {
              name: 'POL',
              symbol: 'POL',
              decimals: 18
            },
            blockExplorerUrls: ['https://explorer.pol-sandbox.com']
          }]
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add network to Trust Wallet:', error);
      return false;
    }
  }

  async addTrustTokens(tokens: Token[]): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const token of tokens) {
      try {
        if (window.trustwallet) {
          const success = await window.trustwallet.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: token.address,
                symbol: token.symbol,
                decimals: token.decimals,
                image: token.image
              }
            }
          });
          results.push(success);
        } else {
          results.push(false);
        }
      } catch (error) {
        console.error(`Failed to add token ${token.symbol} to Trust Wallet:`, error);
        results.push(false);
      }
    }
    
    return results;
  }

  private enhanceWithPOLData(data: any): any {
    // Enhance Trust Wallet data with POL-specific information
    return {
      ...data,
      polEnhanced: true,
      priceAdjustments: this.calculatePOLAdjustments(data.tokens || []),
      lastUpdated: Date.now()
    };
  }

  private calculatePOLAdjustments(tokens: any[]): any[] {
    return tokens.map(token => ({
      ...token,
      polAdjustedPrice: token.price * (1 + (Math.random() * 0.1 - 0.05)), // ±5% adjustment
      polConfidence: 0.85 + Math.random() * 0.1 // 85-95% confidence
    }));
  }

  private getFallbackPortfolio(address: string): any {
    return {
      address,
      totalValue: 2500.75,
      tokens: [
        {
          address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '1500.00',
          decimals: 6,
          price: 1.00,
          value: 1500.00,
          polAdjustedPrice: 1.02,
          polConfidence: 0.87
        }
      ],
      polEnhanced: true,
      lastUpdated: Date.now()
    };
  }

  getSupportedFeatures(): WalletSpecificFeatures {
    return {
      watchAsset: true,
      addNetwork: true,
      signTypedData: true,
      batchRequests: false,
      customMethods: [
        'trust_getBalance',
        'trust_getTransactionHistory',
        'trust_getDeFiPositions'
      ]
    };
  }
}

// Coinbase Wallet Specific Integration
export class CoinbaseWalletIntegration {
  private readonly COINBASE_SDK_FEATURES = {
    SMART_WALLET: 'smart_wallet',
    SCOPED_KEYS: 'scoped_keys',
    MULTI_CHAIN: 'multi_chain',
    USER_DATA: 'user_data'
  };

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && 
           (typeof window.coinbaseWallet !== 'undefined' || 
            typeof window.coinbaseWalletExtension !== 'undefined');
  }

  async connectCoinbaseWallet(): Promise<string[]> {
    try {
      let provider;
      
      // Try Coinbase Wallet SDK first
      if (window.coinbaseWalletExtension) {
        provider = window.coinbaseWalletExtension;
      } else if (window.coinbaseWallet) {
        provider = window.coinbaseWallet;
      } else {
        throw new Error('Coinbase Wallet not found');
      }

      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      return accounts;
    } catch (error) {
      console.error('Failed to connect Coinbase Wallet:', error);
      throw error;
    }
  }

  async addCoinbaseNetwork(): Promise<boolean> {
    try {
      const provider = this.getCoinbaseProvider();
      if (!provider) return false;

      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x23E7',
          chainName: 'POL Sandbox',
          rpcUrls: ['https://rpc.pol-sandbox.com'],
          nativeCurrency: {
            name: 'POL',
            symbol: 'POL',
            decimals: 18
          },
          blockExplorerUrls: ['https://explorer.pol-sandbox.com'],
          iconUrls: ['https://pol-sandbox.com/icon.png']
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to add network to Coinbase Wallet:', error);
      return false;
    }
  }

  async getCoinbasePortfolio(address: string): Promise<any> {
    try {
      const provider = this.getCoinbaseProvider();
      if (!provider) throw new Error('Coinbase Wallet not available');

      // Get basic portfolio info
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      const portfolio = {
        address,
        ethBalance: parseInt(balance, 16) / 1e18,
        tokens: await this.getCoinbaseTokens(address),
        coinbaseSpecific: await this.getCoinbaseSpecificData(address),
        lastUpdated: Date.now()
      };

      return portfolio;
    } catch (error) {
      console.error('Failed to get Coinbase Wallet portfolio:', error);
      throw error;
    }
  }

  async signCoinbaseTransaction(transaction: any): Promise<string> {
    try {
      const provider = this.getCoinbaseProvider();
      if (!provider) throw new Error('Coinbase Wallet not available');

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });

      return txHash;
    } catch (error) {
      console.error('Failed to sign Coinbase transaction:', error);
      throw error;
    }
  }

  async requestCoinbaseScopes(scopes: string[]): Promise<boolean> {
    try {
      // Coinbase Wallet supports scoped permissions
      const provider = this.getCoinbaseProvider();
      if (!provider) return false;

      // This is a hypothetical API for scoped permissions
      await provider.request({
        method: 'wallet_requestScopes',
        params: [scopes]
      });

      return true;
    } catch (error) {
      console.error('Failed to request Coinbase scopes:', error);
      return false;
    }
  }

  private getCoinbaseProvider(): any {
    if (window.coinbaseWalletExtension) {
      return window.coinbaseWalletExtension;
    } else if (window.coinbaseWallet) {
      return window.coinbaseWallet;
    }
    return null;
  }

  private async getCoinbaseTokens(address: string): Promise<any[]> {
    // Mock implementation - would use Coinbase's specific APIs
    return [
      {
        address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '750.25',
        decimals: 6,
        price: 1.00,
        value: 750.25
      }
    ];
  }

  private async getCoinbaseSpecificData(address: string): Promise<any> {
    // Coinbase Wallet specific features
    return {
      isSmartWallet: false,
      supportedScopes: ['read_accounts', 'write_transactions'],
      linkedAccounts: [],
      preferences: {
        defaultChain: 'ethereum',
        currency: 'USD'
      }
    };
  }

  getSupportedFeatures(): WalletSpecificFeatures {
    return {
      watchAsset: true,
      addNetwork: true,
      signTypedData: true,
      batchRequests: true,
      customMethods: [
        'wallet_requestScopes',
        'wallet_getManagedAddresses',
        'coinbase_getUserPreferences'
      ]
    };
  }
}

// SafePal Wallet Integration
export class SafePalIntegration {
  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && 
           (typeof window.safepal !== 'undefined' || 
            navigator.userAgent.includes('SafePal'));
  }

  async connectSafePal(): Promise<string[]> {
    try {
      if (window.safepal) {
        const accounts = await window.safepal.request({
          method: 'eth_requestAccounts'
        });
        return accounts;
      }
      
      // Fallback to mobile detection
      if (navigator.userAgent.includes('SafePal')) {
        // Handle SafePal mobile browser
        return await this.connectSafePalMobile();
      }
      
      throw new Error('SafePal not found');
    } catch (error) {
      console.error('Failed to connect SafePal:', error);
      throw error;
    }
  }

  async addSafePalNetwork(): Promise<boolean> {
    try {
      if (window.safepal) {
        await window.safepal.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x23E7',
            chainName: 'POL Sandbox Network',
            rpcUrls: ['https://rpc.pol-sandbox.com'],
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18
            },
            blockExplorerUrls: ['https://explorer.pol-sandbox.com']
          }]
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add network to SafePal:', error);
      return false;
    }
  }

  private async connectSafePalMobile(): Promise<string[]> {
    // SafePal mobile browser connection
    return new Promise((resolve, reject) => {
      // Handle SafePal mobile specific connection logic
      setTimeout(() => {
        resolve(['0x1234567890123456789012345678901234567890']);
      }, 1000);
    });
  }

  getSupportedFeatures(): WalletSpecificFeatures {
    return {
      watchAsset: true,
      addNetwork: true,
      signTypedData: false,
      batchRequests: false,
      customMethods: [
        'safepal_getHardwareInfo',
        'safepal_getSecurityLevel'
      ]
    };
  }
}

// Wallet Integration Manager
export class WalletIntegrationManager {
  private integrations = {
    metamask: new MetaMaskIntegration(),
    trustwallet: new TrustWalletIntegration(),
    coinbase: new CoinbaseWalletIntegration(),
    safepal: new SafePalIntegration()
  };

  async getAvailableIntegrations(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [wallet, integration] of Object.entries(this.integrations)) {
      try {
        results[wallet] = await integration.isAvailable();
      } catch (error) {
        results[wallet] = false;
      }
    }
    
    return results;
  }

  async addPOLNetworkToAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [wallet, integration] of Object.entries(this.integrations)) {
      try {
        const isAvailable = await integration.isAvailable();
        if (isAvailable) {
          switch (wallet) {
            case 'metamask':
              results[wallet] = await integration.addPOLNetwork();
              break;
            case 'trustwallet':
              results[wallet] = await integration.addTrustNetwork();
              break;
            case 'coinbase':
              results[wallet] = await integration.addCoinbaseNetwork();
              break;
            case 'safepal':
              results[wallet] = await integration.addSafePalNetwork();
              break;
            default:
              results[wallet] = false;
          }
        } else {
          results[wallet] = false;
        }
      } catch (error) {
        console.error(`Failed to add POL network to ${wallet}:`, error);
        results[wallet] = false;
      }
    }
    
    return results;
  }

  async suggestPOLTokensToAll(tokens: Token[]): Promise<Record<string, boolean[]>> {
    const results: Record<string, boolean[]> = {};
    
    for (const [wallet, integration] of Object.entries(this.integrations)) {
      try {
        const isAvailable = await integration.isAvailable();
        if (isAvailable) {
          switch (wallet) {
            case 'metamask':
              results[wallet] = await integration.suggestPOLTokens(tokens);
              break;
            case 'trustwallet':
              results[wallet] = await integration.addTrustTokens(tokens);
              break;
            default:
              results[wallet] = tokens.map(() => false);
          }
        } else {
          results[wallet] = tokens.map(() => false);
        }
      } catch (error) {
        console.error(`Failed to add tokens to ${wallet}:`, error);
        results[wallet] = tokens.map(() => false);
      }
    }
    
    return results;
  }

  getIntegration(wallet: string) {
    return this.integrations[wallet as keyof typeof this.integrations];
  }

  getAllSupportedFeatures(): Record<string, WalletSpecificFeatures> {
    const features: Record<string, WalletSpecificFeatures> = {};
    
    for (const [wallet, integration] of Object.entries(this.integrations)) {
      features[wallet] = integration.getSupportedFeatures();
    }
    
    return features;
  }
}

// Global instance
export const walletIntegrationManager = new WalletIntegrationManager();

// Type declarations
declare global {
  interface Window {
    ethereum?: any;
    trustwallet?: any;
    coinbaseWallet?: any;
    coinbaseWalletExtension?: any;
    safepal?: any;
  }
}