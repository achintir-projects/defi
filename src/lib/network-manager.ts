// Centralized Network Manager for POL Sandbox
// Ensures consistent network configuration across all wallet types

export interface NetworkConfig {
  chainId: string;
  chainName: string  ;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
  iconUrls?: string[];
}

export interface WalletProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isMetaMask?: boolean;
  isTrust?: boolean;
  isTrustWallet?: boolean;
  isCoinbaseWallet?: boolean;
}

export class NetworkManager {
  private static instance: NetworkManager;
  
  // CONSISTENT NETWORK CONFIGURATION FOR ALL WALLETS
  private readonly POL_NETWORK_CONFIG: NetworkConfig = {
    chainId: '0x23E7', // 9191 in decimal - CONSISTENT ACROSS ALL SYSTEMS
    chainName: 'POL Sandbox',
    rpcUrls: ['https://defi-tw.netlify.app/api/rpc'],
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18
    },
    blockExplorerUrls: ['https://defi-tw.netlify.app/explorer'],
    iconUrls: ['https://defi-tw.netlify.app/icon.png']
  };

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  getNetworkConfig(): NetworkConfig {
    return { ...this.POL_NETWORK_CONFIG };
  }

  getChainId(): string {
    return this.POL_NETWORK_CONFIG.chainId;
  }

  getChainIdDecimal(): number {
    return parseInt(this.POL_NETWORK_CONFIG.chainId, 16);
  }

  // Provider detection for different wallet types
  detectProvider(walletType: string): WalletProvider | null {
    if (typeof window === 'undefined') return null;

    switch (walletType.toLowerCase()) {
      case 'metamask':
        return this.getMetaMaskProvider();
      case 'trustwallet':
      case 'trust':
        return this.getTrustWalletProvider();
      case 'coinbase':
      case 'coinbasewallet':
        return this.getCoinbaseProvider();
      case 'okx':
        return this.getOKXProvider();
      case 'phantom':
        return this.getPhantomProvider();
      default:
        return window.ethereum || null;
    }
  }

  private getMetaMaskProvider(): WalletProvider | null {
    // MetaMask detection
    if (window.ethereum?.isMetaMask) return window.ethereum;
    
    // Check in providers array
    if (window.ethereum?.providers) {
      return window.ethereum.providers.find((p: any) => p.isMetaMask) || null;
    }
    
    return window.ethereum || null;
  }

  private getTrustWalletProvider(): WalletProvider | null {
    // Direct Trust Wallet detection
    if (window.trustwallet?.isTrust) return window.trustwallet;
    if (window._trustwallet) return window._trustwallet;
    
    // Ethereum provider with Trust flag
    if (window.ethereum?.isTrust) return window.ethereum;
    if (window.ethereum?.isTrustWallet) return window.ethereum;
    
    // Check in providers array
    if (window.ethereum?.providers) {
      return window.ethereum.providers.find((p: any) => p.isTrust || p.isTrustWallet) || null;
    }
    
    return null;
  }

  private getCoinbaseProvider(): WalletProvider | null {
    // Coinbase Wallet detection
    if (window.coinbaseWalletExtension) return window.coinbaseWalletExtension;
    if (window.coinbaseWallet) return window.coinbaseWallet;
    
    // Ethereum provider with Coinbase flag
    if (window.ethereum?.isCoinbaseWallet) return window.ethereum;
    
    // Check in providers array
    if (window.ethereum?.providers) {
      return window.ethereum.providers.find((p: any) => p.isCoinbaseWallet) || null;
    }
    
    return null;
  }

  private getOKXProvider(): WalletProvider | null {
    if (window.okxwallet) return window.okxwallet;
    if (window.ethereum?.isOkxWallet) return window.ethereum;
    return null;
  }

  private getPhantomProvider(): WalletProvider | null {
    if (window.phantom?.ethereum) return window.phantom.ethereum;
    if (window.solana?.isPhantom) return window.solana;
    return null;
  }

  // Check current network status
  async getCurrentNetwork(provider: WalletProvider): Promise<{
    chainId: string;
    isCorrectNetwork: boolean;
    networkName?: string;
  }> {
    try {
      const chainId = await provider.request({ method: 'eth_chainId' });
      const isCorrectNetwork = chainId === this.POL_NETWORK_CONFIG.chainId;
      
      return {
        chainId,
        isCorrectNetwork,
        networkName: isCorrectNetwork ? this.POL_NETWORK_CONFIG.chainName : `Unknown (${chainId})`
      };
    } catch (error) {
      console.error('Failed to get current network:', error);
      return {
        chainId: 'unknown',
        isCorrectNetwork: false,
        networkName: 'Unknown'
      };
    }
  }

  // Switch to POL network
  async switchToNetwork(provider: WalletProvider): Promise<{
    success: boolean;
    action: 'switched' | 'needs_add' | 'failed';
    error?: string;
  }> {
    try {
      console.log(`🔄 Switching to ${this.POL_NETWORK_CONFIG.chainName}...`);
      
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.POL_NETWORK_CONFIG.chainId }]
      });

      console.log(`✅ Successfully switched to ${this.POL_NETWORK_CONFIG.chainName}`);
      return { success: true, action: 'switched' };

    } catch (error: any) {
      console.log('⚠️ Network switch failed:', error);

      if (error.code === 4902) {
        console.log('📝 Network not found, needs to be added');
        return { success: false, action: 'needs_add', error: 'Network needs to be added' };
      } else if (error.code === 4001) {
        return { success: false, action: 'failed', error: 'User rejected network switch' };
      } else {
        return { success: false, action: 'failed', error: error.message || 'Switch failed' };
      }
    }
  }

  // Add POL network to wallet
  async addNetwork(provider: WalletProvider): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log(`➕ Adding ${this.POL_NETWORK_CONFIG.chainName}...`);
      console.log('Network config:', this.POL_NETWORK_CONFIG);

      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [this.POL_NETWORK_CONFIG]
      });

      console.log(`✅ Successfully added ${this.POL_NETWORK_CONFIG.chainName}`);
      return { success: true };

    } catch (error: any) {
      console.error('❌ Failed to add network:', error);

      if (error.code === 4001) {
        return { 
          success: false, 
          error: 'User rejected network addition. Please approve the network addition in your wallet.' 
        };
      } else if (error.code === -32602) {
        return { 
          success: false, 
          error: 'Invalid network parameters. The network configuration might be incorrect.' 
        };
      } else if (error.message?.includes('already exists')) {
        console.log('ℹ️ Network already exists, trying to switch...');
        const switchResult = await this.switchToNetwork(provider);
        if (switchResult.success) {
          return { success: true };
        } else {
          return { success: false, error: 'Network exists but failed to switch: ' + switchResult.error };
        }
      } else {
        return { success: false, error: error.message || 'Failed to add network' };
      }
    }
  }

  // Complete network setup with progress feedback
  async setupNetwork(
    walletType: string, 
    onProgress?: (message: string) => void
  ): Promise<{
    success: boolean;
    action: 'switched' | 'added' | 'failed';
    error?: string;
  }> {
    const provider = this.detectProvider(walletType);
    if (!provider) {
      return { 
        success: false, 
        action: 'failed', 
        error: `${walletType} provider not found. Please ensure your wallet is installed and unlocked.` 
      };
    }

    try {
      onProgress?.('🔍 Checking current network...');
      const currentNetwork = await this.getCurrentNetwork(provider);
      
      if (currentNetwork.isCorrectNetwork) {
        onProgress?.(`✅ Already on ${this.POL_NETWORK_CONFIG.chainName}!`);
        return { success: true, action: 'switched' };
      }

      onProgress?.(`🔄 Attempting to switch to ${this.POL_NETWORK_CONFIG.chainName}...`);
      const switchResult = await this.switchToNetwork(provider);
      
      if (switchResult.success) {
        onProgress?.(`✅ Successfully switched to ${this.POL_NETWORK_CONFIG.chainName}!`);
        return { success: true, action: 'switched' };
      }

      if (switchResult.action === 'needs_add') {
        onProgress?.(`📝 Adding ${this.POL_NETWORK_CONFIG.chainName}... Please approve in your wallet.`);
        const addResult = await this.addNetwork(provider);
        
        if (addResult.success) {
          onProgress?.(`✅ ${this.POL_NETWORK_CONFIG.chainName} added successfully!`);
          return { success: true, action: 'added' };
        } else {
          return { success: false, action: 'failed', error: addResult.error };
        }
      }

      return { success: false, action: 'failed', error: switchResult.error };

    } catch (error: any) {
      console.error('❌ Network setup failed:', error);
      return { success: false, action: 'failed', error: error.message || 'Network setup failed' };
    }
  }

  // Add tokens to wallet
  async addToken(
    walletType: string,
    token: {
      address: string;
      symbol: string;
      decimals: number;
      name?: string;
      image?: string;
    },
    onProgress?: (message: string) => void
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    const provider = this.detectProvider(walletType);
    if (!provider) {
      return { success: false, error: `${walletType} provider not found` };
    }

    try {
      onProgress?.(`🪙 Adding ${token.symbol} token...`);
      
      const result = await provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.image || undefined
          }
        }
      });

      if (result) {
        onProgress?.(`✅ ${token.symbol} token added successfully!`);
        return { success: true };
      } else {
        onProgress?.(`⚠️ ${token.symbol} token addition was cancelled`);
        return { success: false, error: 'Token addition was cancelled' };
      }

    } catch (error: any) {
      console.error(`❌ Failed to add ${token.symbol}:`, error);
      
      if (error.code === 4001) {
        onProgress?.(`⚠️ ${token.symbol} token addition was rejected`);
        return { success: false, error: 'User rejected token addition' };
      } else if (error.message?.includes('already been added')) {
        onProgress?.(`✅ ${token.symbol} token already exists`);
        return { success: true };
      } else {
        return { success: false, error: error.message || 'Token addition failed' };
      }
    }
  }

  // Complete setup with network and default tokens
  async completeSetup(
    walletType: string,
    onProgress?: (message: string) => void
  ): Promise<{
    success: boolean;
    networkSetup: boolean;
    tokensAdded: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let networkSetup = false;
    let tokensAdded = 0;

    try {
      onProgress?.('🚀 Starting complete wallet setup...');

      // Step 1: Network Setup
      onProgress?.('📡 Step 1/2: Configuring network...');
      const networkResult = await this.setupNetwork(walletType, onProgress);
      
      if (networkResult.success) {
        networkSetup = true;
        onProgress?.('✅ Network setup completed!');
      } else {
        errors.push(`Network setup failed: ${networkResult.error}`);
        onProgress?.(`❌ Network setup failed: ${networkResult.error}`);
        return { success: false, networkSetup, tokensAdded, errors };
      }

      // Step 2: Token Setup
      onProgress?.('🪙 Step 2/2: Adding default tokens...');
      
      const defaultTokens = [
        {
          address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
          symbol: 'POL',
          decimals: 18,
          name: 'POL Token',
          image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x4585fe77225b41b697c938b018e2ac67ac5a20c0/logo.png'
        },
        {
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          symbol: 'USDC',
          decimals: 6,
          name: 'USD Coin',
          image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png'
        },
        {
          address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          symbol: 'USDT',
          decimals: 6,
          name: 'Tether USD',
          image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdac17f958d2ee523a2206206994597c13d831ec7/logo.png'
        }
      ];

      for (const token of defaultTokens) {
        const tokenResult = await this.addToken(walletType, token, onProgress);
        if (tokenResult.success) {
          tokensAdded++;
        } else {
          console.warn(`Token ${token.symbol} failed:`, tokenResult.error);
          // Don't fail the entire setup for token errors
        }
      }

      onProgress?.(`🎉 Setup completed! Added ${tokensAdded}/${defaultTokens.length} tokens`);

      return {
        success: networkSetup,
        networkSetup,
        tokensAdded,
        errors
      };

    } catch (error: any) {
      console.error('❌ Complete setup failed:', error);
      errors.push(error.message || 'Setup failed');
      return { success: false, networkSetup, tokensAdded, errors };
    }
  }

  // Validate network configuration
  validateNetworkConfig(config: Partial<NetworkConfig>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.chainId) {
      errors.push('Chain ID is required');
    } else if (config.chainId !== this.POL_NETWORK_CONFIG.chainId) {
      errors.push(`Chain ID mismatch. Expected: ${this.POL_NETWORK_CONFIG.chainId}, Got: ${config.chainId}`);
    }

    if (!config.chainName) {
      errors.push('Chain name is required');
    } else if (config.chainName !== this.POL_NETWORK_CONFIG.chainName) {
      errors.push(`Chain name mismatch. Expected: ${this.POL_NETWORK_CONFIG.chainName}, Got: ${config.chainName}`);
    }

    if (!config.rpcUrls || config.rpcUrls.length === 0) {
      errors.push('RPC URLs are required');
    }

    if (!config.nativeCurrency) {
      errors.push('Native currency configuration is required');
    } else {
      if (config.nativeCurrency.symbol !== this.POL_NETWORK_CONFIG.nativeCurrency.symbol) {
        errors.push(`Native currency symbol mismatch. Expected: ${this.POL_NETWORK_CONFIG.nativeCurrency.symbol}, Got: ${config.nativeCurrency.symbol}`);
      }
      if (config.nativeCurrency.decimals !== this.POL_NETWORK_CONFIG.nativeCurrency.decimals) {
        errors.push(`Native currency decimals mismatch. Expected: ${this.POL_NETWORK_CONFIG.nativeCurrency.decimals}, Got: ${config.nativeCurrency.decimals}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const networkManager = NetworkManager.getInstance();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: WalletProvider;
    trustwallet?: WalletProvider;
    _trustwallet?: WalletProvider;
    coinbaseWallet?: WalletProvider;
    coinbaseWalletExtension?: WalletProvider;
    okxwallet?: WalletProvider;
    phantom?: { ethereum?: WalletProvider; solana?: any };
  }
}