// Enhanced Wallet Connector for Better Mobile Support
import { universalWalletConnector } from './universal-wallet-connector';
import { trustWalletNetworkFix, POL_NETWORK_CONFIG } from './trust-wallet-network-fix';

declare global {
  interface Window {
    ethereum?: any;
    trustwallet?: any;
    _trustwallet?: any;
    metaMask?: any;
    coinbaseWallet?: any;
    coinbaseWalletExtension?: any;
    safepal?: any;
    sp?: any;
    phantom?: any;
    solana?: any;
    rabby?: any;
    okxwallet?: any;
    okexchain?: any;
    BinanceChain?: any;
    deficonnector?: any;
    exodus?: any;
    braveWallet?: any;
    xfi?: any;
    mathwallet?: any;
    tokenpocket?: any;
    imToken?: any;
    zerion?: any;
    frame?: any;
    tally?: any;
  }
}

export interface EnhancedWalletConfig {
  id: string;
  name: string;
  icon: string;
  deepLink: string;
  universalLink: string;
  installUrl: string;
  color: string;
  mobileOnly: boolean;
  detectionMethods: string[];
}

export const ENHANCED_WALLET_CONFIGS: Record<string, EnhancedWalletConfig> = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    deepLink: 'metamask://dapp/',
    universalLink: 'https://metamask.app.link/dapp/',
    installUrl: 'https://metamask.app.link/dapp/',
    color: 'bg-orange-500',
    mobileOnly: false,
    detectionMethods: [
      'window.ethereum?.isMetaMask',
      'window.metaMask',
      'window.ethereum?.providerName?.includes("metamask")',
      'navigator.userAgent.includes("MetaMask")'
    ]
  },
  trustwallet: {
    id: 'trustwallet',
    name: 'Trust Wallet',
    icon: '🛡️',
    deepLink: 'trust://dapp/',
    universalLink: 'https://link.trustwallet.com/open_url?coin_id=60&url=',
    installUrl: 'https://link.trustwallet.com/open_url?coin_id=60&url=',
    color: 'bg-blue-500',
    mobileOnly: false,
    detectionMethods: [
      'window.trustwallet?.isTrust',
      'window.trustwallet',
      'window._trustwallet',
      'window.ethereum?.isTrust',
      'window.ethereum?.isTrustWallet',
      'navigator.userAgent.includes("TrustWallet")'
    ]
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    deepLink: 'cbwallet://dapp/',
    universalLink: 'https://go.cb-w.com/dapp',
    installUrl: 'https://go.cb-w.com/dapp',
    color: 'bg-blue-600',
    mobileOnly: false,
    detectionMethods: [
      'window.ethereum?.isCoinbaseWallet',
      'window.coinbaseWallet',
      'window.coinbaseWalletExtension',
      'window.ethereum?.providerName?.includes("coinbase")'
    ]
  }
};

export class EnhancedWalletConnector {
  private static instance: EnhancedWalletConnector;
  private connectionCallbacks: Map<string, (state: any) => void> = new Map();
  private detectionInterval: NodeJS.Timeout | null = null;

  static getInstance(): EnhancedWalletConnector {
    if (!EnhancedWalletConnector.instance) {
      EnhancedWalletConnector.instance = new EnhancedWalletConnector();
    }
    return EnhancedWalletConnector.instance;
  }

  constructor() {
    this.startContinuousDetection();
  }

  private startContinuousDetection() {
    // Check for wallet injections every 2 seconds
    this.detectionInterval = setInterval(() => {
      this.detectAllWallets();
    }, 2000);
  }

  async detectAllWallets(): Promise<string[]> {
    const detected: string[] = [];
    
    if (typeof window === 'undefined') return detected;

    console.log('🔍 Enhanced wallet detection starting...');

    // Enhanced Trust Wallet detection with multiple methods
    const trustMethods = [
      () => !!window.trustwallet?.isTrust,
      () => !!window.trustwallet,
      () => !!window._trustwallet,
      () => !!window.ethereum?.isTrust,
      () => !!window.ethereum?.isTrustWallet,
      () => window.ethereum?.providerName?.toLowerCase().includes('trust'),
      () => navigator.userAgent.includes('TrustWallet'),
      () => window.ethereum?.providers?.some((p: any) => p.isTrust)
    ];

    if (trustMethods.some(method => method())) {
      detected.push('trustwallet');
      console.log('✅ Trust Wallet detected with enhanced methods');
    }

    // Enhanced MetaMask detection
    const metaMaskMethods = [
      () => !!window.ethereum?.isMetaMask,
      () => !!window.metaMask,
      () => window.ethereum?.providerName?.toLowerCase().includes('metamask'),
      () => navigator.userAgent.includes('MetaMask'),
      () => window.ethereum?.providers?.some((p: any) => p.isMetaMask)
    ];

    if (metaMaskMethods.some(method => method())) {
      detected.push('metamask');
      console.log('✅ MetaMask detected with enhanced methods');
    }

    // Enhanced Coinbase detection
    const coinbaseMethods = [
      () => !!window.ethereum?.isCoinbaseWallet,
      () => !!window.coinbaseWallet,
      () => !!window.coinbaseWalletExtension,
      () => window.ethereum?.providerName?.toLowerCase().includes('coinbase'),
      () => window.ethereum?.providers?.some((p: any) => p.isCoinbaseWallet)
    ];

    if (coinbaseMethods.some(method => method())) {
      detected.push('coinbase');
      console.log('✅ Coinbase Wallet detected with enhanced methods');
    }

    // Trigger detection callbacks
    detected.forEach(walletId => {
      const callback = this.connectionCallbacks.get(walletId);
      if (callback) {
        callback({ detected: true, walletId });
      }
    });

    console.log('🎯 Enhanced detection result:', detected);
    return [...new Set(detected)];
  }

  getProviderForWallet(walletType: string): any {
    if (typeof window === 'undefined') return null;

    switch (walletType) {
      case 'metamask':
        return window.metaMask || this.findProviderInArray((p: any) => p.isMetaMask) || window.ethereum;
      case 'trustwallet':
        return window.trustwallet || window._trustwallet || this.findProviderInArray((p: any) => p.isTrust) || window.ethereum;
      case 'coinbase':
        return window.coinbaseWalletExtension || window.coinbaseWallet || this.findProviderInArray((p: any) => p.isCoinbaseWallet) || window.ethereum;
      default:
        return window.ethereum;
    }
  }

  private findProviderInArray(predicate: (provider: any) => boolean): any {
    if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
      return window.ethereum.providers.find(predicate);
    }
    return null;
  }

  async connectWallet(walletType: string): Promise<any> {
    console.log(`🔗 Enhanced connection attempt for ${walletType}`);
    
    const provider = this.getProviderForWallet(walletType);
    if (!provider) {
      throw new Error(`${walletType} not available. Please install it first.`);
    }

    try {
      // Request accounts with enhanced error handling
      let accounts: string[] = [];
      
      try {
        accounts = await provider.request({ method: 'eth_requestAccounts' });
      } catch (error: any) {
        console.error(`Primary connection method failed for ${walletType}:`, error);
        
        // Try alternative methods
        if (walletType === 'trustwallet' && window.trustwallet) {
          accounts = await window.trustwallet.request({ method: 'eth_requestAccounts' });
        } else if (walletType === 'metamask' && window.metaMask) {
          accounts = await window.metaMask.request({ method: 'eth_requestAccounts' });
        } else if (walletType === 'coinbase' && window.coinbaseWalletExtension) {
          accounts = await window.coinbaseWalletExtension.request({ method: 'eth_requestAccounts' });
        } else {
          throw error;
        }
      }

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      const chainId = await provider.request({ method: 'eth_chainId' });
      
      const balanceHex = await provider.request({ 
        method: 'eth_getBalance', 
        params: [account, 'latest'] 
      });
      const balance = parseInt(balanceHex, 16).toString();

      const connectionState = {
        isConnected: true,
        account,
        chainId,
        walletType,
        balance,
        provider
      };

      console.log(`✅ Successfully connected to ${walletType}:`, connectionState);
      
      // Store connection info
      localStorage.setItem(`${walletType}Connected`, 'true');
      localStorage.setItem(`${walletType}Account`, account);
      localStorage.setItem(`${walletType}ConnectionTime`, new Date().toISOString());

      return connectionState;
    } catch (error: any) {
      console.error(`❌ Failed to connect to ${walletType}:`, error);
      
      // Provide better error messages
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      } else if (error.code === -32002) {
        throw new Error('Please check your wallet for pending connection requests');
      } else if (error.message?.includes('not implemented')) {
        throw new Error(`${walletType} is not available in this context. Please try the mobile app.`);
      }
      
      throw error;
    }
  }

  async setupPOLNetwork(walletType: string): Promise<boolean> {
    const provider = this.getProviderForWallet(walletType);
    if (!provider) {
      throw new Error(`${walletType} not available`);
    }

    // Use enhanced network setup for Trust Wallet
    if (walletType === 'trustwallet') {
      console.log('🌐 Using enhanced Trust Wallet network setup...');
      const result = await trustWalletNetworkFix.setupPOLNetworkEnhanced(provider);
      return result.success;
    }

    // Standard setup for other wallets
    try {
      console.log(`🌐 Adding POL network to ${walletType}`);
      
      // Try to switch first (in case it's already added)
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: POL_NETWORK_CONFIG.chainId }]
        });
        console.log(`✅ Switched to POL network on ${walletType}`);
        return true;
      } catch (switchError: any) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [POL_NETWORK_CONFIG]
          });
          console.log(`✅ Added POL network to ${walletType}`);
          return true;
        } else {
          throw switchError;
        }
      }
    } catch (error: any) {
      console.error(`❌ Failed to setup POL network on ${walletType}:`, error);
      
      if (error.code === 4001) {
        throw new Error('User rejected network addition');
      } else if (error.code === -32602) {
        throw new Error('Invalid network parameters');
      }
      
      return false;
    }
  }

  async addTokens(walletType: string, tokens: any[]): Promise<boolean[]> {
    const provider = this.getProviderForWallet(walletType);
    if (!provider) {
      throw new Error(`${walletType} not available`);
    }

    const results: boolean[] = [];
    
    for (const token of tokens) {
      try {
        console.log(`🪙 Adding ${token.symbol} to ${walletType}`);
        
        const success = await provider.request({
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
        console.log(`✅ Added ${token.symbol} to ${walletType}`);
      } catch (error) {
        console.error(`❌ Failed to add ${token.symbol} to ${walletType}:`, error);
        results.push(false);
      }
    }
    
    return results;
  }

  openMobileWallet(walletType: string, url?: string): void {
    const config = ENHANCED_WALLET_CONFIGS[walletType];
    if (!config) {
      console.error(`No configuration found for ${walletType}`);
      return;
    }

    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const encodedUrl = encodeURIComponent(currentUrl);

    // Try universal link first (better user experience)
    if (config.universalLink) {
      const universalLink = config.universalLink + encodedUrl;
      console.log(`🔗 Opening ${walletType} with universal link: ${universalLink}`);
      window.open(universalLink, '_blank');
    }

    // Fallback to deep link after a short delay
    setTimeout(() => {
      const deepLink = config.deepLink + encodedUrl;
      console.log(`🔗 Opening ${walletType} with deep link: ${deepLink}`);
      window.location.href = deepLink;
    }, 1000);
  }

  onWalletDetected(walletId: string, callback: (state: any) => void): void {
    this.connectionCallbacks.set(walletId, callback);
  }

  removeDetectionCallback(walletId: string): void {
    this.connectionCallbacks.delete(walletId);
  }

  isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  getConnectionStatus(walletType: string): {
    isConnected: boolean;
    account?: string;
    lastConnected?: string;
  } {
    const isConnected = localStorage.getItem(`${walletType}Connected`) === 'true';
    const account = localStorage.getItem(`${walletType}Account`);
    const lastConnected = localStorage.getItem(`${walletType}ConnectionTime`);

    return {
      isConnected,
      account: account || undefined,
      lastConnected: lastConnected || undefined
    };
  }

  clearConnection(walletType: string): void {
    localStorage.removeItem(`${walletType}Connected`);
    localStorage.removeItem(`${walletType}Account`);
    localStorage.removeItem(`${walletType}ConnectionTime`);
  }

  destroy(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    this.connectionCallbacks.clear();
  }
}

export const enhancedWalletConnector = EnhancedWalletConnector.getInstance();