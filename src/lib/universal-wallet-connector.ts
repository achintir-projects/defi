// Universal Wallet Connector for POL Sandbox
export interface WalletConfig {
  name: string;
  id: string;
  icon: string;
  mobile: boolean;
  extension: boolean;
  inject?: string;
  deeplink?: string;
}

export interface WalletConnectionState {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  walletType: string | null;
  balance: string;
}

export interface PortfolioData {
  totalValue: number;
  tokens: TokenHolding[];
  nfts: any[];
  history: Transaction[];
}

export interface TokenHolding {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  price: number;
  value: number;
  icon?: string;
}

export interface Transaction {
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'approve';
  token: string;
  amount: string;
  timestamp: number;
  from: string;
  to: string;
}

export interface WalletAPIAdapter {
  getPortfolio(address: string): Promise<PortfolioData>;
  getTokenPrices(tokens: string[]): Promise<Record<string, number>>;
  submitTransaction(tx: any): Promise<string>;
  signMessage(message: string): Promise<string>;
}

export class UniversalWalletConnector {
  private supportedWallets: Record<string, WalletConfig> = {
    metamask: {
      name: 'MetaMask',
      id: 'metamask',
      icon: '/wallets/metamask.svg',
      mobile: true,
      extension: true,
      inject: 'ethereum',
      deeplink: 'metamask://dapp/'
    },
    trustwallet: {
      name: 'Trust Wallet',
      id: 'trustwallet',
      icon: '/wallets/trust.svg',
      mobile: true,
      extension: true,
      inject: 'trustwallet',
      deeplink: 'trust://dapp/'
    },
    coinbase: {
      name: 'Coinbase Wallet',
      id: 'coinbase',
      icon: '/wallets/coinbase.svg',
      mobile: true,
      extension: true,
      inject: 'coinbaseWallet',
      deeplink: 'cbwallet://dapp/'
    },
    safepal: {
      name: 'SafePal',
      id: 'safepal',
      icon: '/wallets/safepal.svg',
      mobile: true,
      extension: false,
      inject: 'safepal',
      deeplink: 'safepal://dapp/'
    },
    walletconnect: {
      name: 'WalletConnect',
      id: 'walletconnect',
      icon: '/wallets/walletconnect.svg',
      mobile: true,
      extension: false
    }
  };

  private adapters: Map<string, WalletAPIAdapter> = new Map();
  private connectionState: WalletConnectionState = {
    isConnected: false,
    account: null,
    chainId: null,
    walletType: null,
    balance: '0'
  };

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters(): void {
    this.adapters.set('metamask', new MetaMaskAdapter());
    this.adapters.set('trustwallet', new TrustWalletAdapter());
    this.adapters.set('coinbase', new CoinbaseAdapter());
    this.adapters.set('walletconnect', new WalletConnectAdapter());
  }

  async detectWallet(): Promise<string[]> {
    const detected: string[] = [];

    // Check for injected wallets
    if (typeof window !== 'undefined') {
      if (window.ethereum?.isMetaMask) detected.push('metamask');
      if (window.ethereum?.isTrust) detected.push('trustwallet');
      if (window.ethereum?.isCoinbaseWallet) detected.push('coinbase');
      if (window.trustwallet) detected.push('trustwallet');
      if (window.safepal) detected.push('safepal');
    }

    // Always include WalletConnect as fallback
    detected.push('walletconnect');

    return detected;
  }

  getSupportedWallets(): WalletConfig[] {
    return Object.values(this.supportedWallets);
  }

  async connect(walletType: string): Promise<WalletConnectionState> {
    const adapter = this.adapters.get(walletType);
    if (!adapter) {
      throw new Error(`Wallet ${walletType} not supported`);
    }

    try {
      // Connect to wallet
      const accounts = await this.requestAccounts(walletType);
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      const chainId = await this.getChainId(walletType);
      const balance = await this.getBalance(walletType, account);

      this.connectionState = {
        isConnected: true,
        account,
        chainId,
        walletType,
        balance
      };

      return this.connectionState;
    } catch (error) {
      console.error(`Failed to connect to ${walletType}:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connectionState = {
      isConnected: false,
      account: null,
      chainId: null,
      walletType: null,
      balance: '0'
    };
  }

  async getPortfolio(): Promise<PortfolioData> {
    if (!this.connectionState.isConnected || !this.connectionState.walletType) {
      throw new Error('Wallet not connected');
    }

    const adapter = this.adapters.get(this.connectionState.walletType);
    if (!adapter) {
      throw new Error('Adapter not found');
    }

    return await adapter.getPortfolio(this.connectionState.account!);
  }

  async switchChain(chainId: string): Promise<void> {
    if (!this.connectionState.walletType) {
      throw new Error('Wallet not connected');
    }

    try {
      if (this.connectionState.walletType === 'metamask' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }]
        });
      }
    } catch (error) {
      console.error('Failed to switch chain:', error);
      throw error;
    }
  }

  private async requestAccounts(walletType: string): Promise<string[]> {
    switch (walletType) {
      case 'metamask':
      case 'trustwallet':
      case 'coinbase':
        if (window.ethereum) {
          return await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        break;
      case 'walletconnect':
        // Implement WalletConnect v2 logic
        return await this.connectWalletConnect();
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }
    return [];
  }

  private async getChainId(walletType: string): Promise<string> {
    switch (walletType) {
      case 'metamask':
      case 'trustwallet':
      case 'coinbase':
        if (window.ethereum) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          return parseInt(chainId, 16).toString();
        }
        break;
      default:
        return '1'; // Default to Ethereum mainnet
    }
    return '1';
  }

  private async getBalance(walletType: string, address: string): Promise<string> {
    switch (walletType) {
      case 'metamask':
      case 'trustwallet':
      case 'coinbase':
        if (window.ethereum) {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          return (parseInt(balance, 16) / 1e18).toString();
        }
        break;
      default:
        return '0';
    }
    return '0';
  }

  private async connectWalletConnect(): Promise<string[]> {
    // WalletConnect v2 implementation would go here
    // For now, return mock data
    return ['0x1234567890123456789012345678901234567890'];
  }

  getConnectionState(): WalletConnectionState {
    return { ...this.connectionState };
  }
}

// MetaMask Adapter Implementation
class MetaMaskAdapter implements WalletAPIAdapter {
  private readonly RPC_METHODS = {
    GET_BALANCE: 'eth_getBalance',
    GET_TOKEN_BALANCES: 'eth_getTokenBalances',
    GET_PRICE: 'metamask_getPrice'
  };

  async getPortfolio(address: string): Promise<PortfolioData> {
    try {
      // Get ETH balance
      const ethBalance = await window.ethereum!.request({
        method: this.RPC_METHODS.GET_BALANCE,
        params: [address, 'latest']
      });

      // Get token balances (simplified - in production would use a token API)
      const tokens = await this.getTokenBalances(address);
      
      const totalValue = tokens.reduce((sum, token) => sum + token.value, 0) + 
                        (parseInt(ethBalance, 16) / 1e18) * 2000; // Assuming ETH price = $2000

      return {
        totalValue,
        tokens,
        nfts: [],
        history: await this.getTransactionHistory(address)
      };
    } catch (error) {
      console.error('Failed to get MetaMask portfolio:', error);
      throw error;
    }
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    // Mock implementation - would use CoinGecko or other price API
    const prices: Record<string, number> = {};
    tokens.forEach(token => {
      prices[token] = Math.random() * 1000; // Mock price
    });
    return prices;
  }

  async submitTransaction(tx: any): Promise<string> {
    try {
      const txHash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [tx]
      });
      return txHash;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      const signature = await window.ethereum!.request({
        method: 'personal_sign',
        params: [message, await this.getCurrentAccount()]
      });
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  private async getTokenBalances(address: string): Promise<TokenHolding[]> {
    // Mock implementation - would use ERC-20 calls
    return [
      {
        address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '1000.50',
        decimals: 6,
        price: 1.00,
        value: 1000.50,
        icon: '/tokens/usdc.svg'
      },
      {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        name: 'Tether USD',
        balance: '500.25',
        decimals: 6,
        price: 1.00,
        value: 500.25,
        icon: '/tokens/usdt.svg'
      }
    ];
  }

  private async getTransactionHistory(address: string): Promise<Transaction[]> {
    // Mock implementation
    return [
      {
        hash: '0x1234567890abcdef',
        type: 'swap',
        token: 'USDC',
        amount: '100',
        timestamp: Date.now() - 3600000,
        from: address,
        to: '0x9876543210fedcba'
      }
    ];
  }

  private async getCurrentAccount(): Promise<string> {
    const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
    return accounts[0];
  }
}

// Trust Wallet Adapter Implementation
class TrustWalletAdapter implements WalletAPIAdapter {
  private readonly TRUST_API_ENDPOINTS = {
    PORTFOLIO: 'https://api.trustwallet.com/portfolio/',
    PRICES: 'https://api.trustwallet.com/prices/',
    TOKENS: 'https://api.trustwallet.com/tokens/'
  };

  async getPortfolio(address: string): Promise<PortfolioData> {
    try {
      // Use Trust Wallet's portfolio API
      const response = await fetch(`${this.TRUST_API_ENDPOINTS.PORTFOLIO}${address}`);
      const data = await response.json();
      
      return this.normalizePortfolio(data);
    } catch (error) {
      console.error('Failed to get Trust Wallet portfolio:', error);
      // Fallback to mock data
      return this.getMockPortfolio();
    }
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    try {
      const response = await fetch(
        `${this.TRUST_API_ENDPOINTS.PRICES}?tokens=${tokens.join(',')}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to get Trust Wallet prices:', error);
      return {};
    }
  }

  async submitTransaction(tx: any): Promise<string> {
    // Trust Wallet specific transaction submission
    if (window.trustwallet) {
      return await window.trustwallet.request({
        method: 'eth_sendTransaction',
        params: [tx]
      });
    }
    throw new Error('Trust Wallet not available');
  }

  async signMessage(message: string): Promise<string> {
    if (window.trustwallet) {
      return await window.trustwallet.request({
        method: 'personal_sign',
        params: [message, await this.getCurrentAccount()]
      });
    }
    throw new Error('Trust Wallet not available');
  }

  private normalizePortfolio(data: any): PortfolioData {
    // Normalize Trust Wallet API response to our format
    return {
      totalValue: data.totalValue || 0,
      tokens: data.tokens || [],
      nfts: data.nfts || [],
      history: data.history || []
    };
  }

  private getMockPortfolio(): PortfolioData {
    return {
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
          icon: '/tokens/usdc.svg'
        }
      ],
      nfts: [],
      history: []
    };
  }

  private async getCurrentAccount(): Promise<string> {
    if (window.trustwallet) {
      const accounts = await window.trustwallet.request({ method: 'eth_accounts' });
      return accounts[0];
    }
    return '';
  }
}

// Coinbase Wallet Adapter Implementation
class CoinbaseAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    // Coinbase Wallet specific implementation
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    // Coinbase Wallet specific price API
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    if (window.coinbaseWallet) {
      return await window.coinbaseWallet.request({
        method: 'eth_sendTransaction',
        params: [tx]
      });
    }
    throw new Error('Coinbase Wallet not available');
  }

  async signMessage(message: string): Promise<string> {
    if (window.coinbaseWallet) {
      return await window.coinbaseWallet.request({
        method: 'personal_sign',
        params: [message, await this.getCurrentAccount()]
      });
    }
    throw new Error('Coinbase Wallet not available');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000.00,
      tokens: [],
      nfts: [],
      history: []
    };
  }

  private async getCurrentAccount(): Promise<string> {
    if (window.coinbaseWallet) {
      const accounts = await window.coinbaseWallet.request({ method: 'eth_accounts' });
      return accounts[0];
    }
    return '';
  }
}

// WalletConnect Adapter Implementation
class WalletConnectAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    // WalletConnect v2 implementation
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    // WalletConnect transaction submission
    return '0xmockhash';
  }

  async signMessage(message: string): Promise<string> {
    // WalletConnect message signing
    return 'mocksignature';
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 500.00,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

// Global instance
export const universalWalletConnector = new UniversalWalletConnector();

// Type declarations for window object
declare global {
  interface Window {
    ethereum?: any;
    trustwallet?: any;
    coinbaseWallet?: any;
    safepal?: any;
  }
}