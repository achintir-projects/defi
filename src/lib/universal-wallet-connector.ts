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
  icon?: string;
}

export interface WalletConnectionState {
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  walletType: string | null;
  balance: string;
  network?: NetworkConfig;
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
    },
    phantom: {
      name: 'Phantom',
      id: 'phantom',
      icon: '/wallets/phantom.svg',
      mobile: true,
      extension: true,
      inject: 'phantom',
      deeplink: 'phantom://browse/'
    },
    rabby: {
      name: 'Rabby',
      id: 'rabby',
      icon: '/wallets/rabby.svg',
      mobile: false,
      extension: true,
      inject: 'rabby'
    },
    okx: {
      name: 'OKX Wallet',
      id: 'okx',
      icon: '/wallets/okx.svg',
      mobile: true,
      extension: true,
      inject: 'okxwallet',
      deeplink: 'okx://wallet/dapp/'
    },
    binance: {
      name: 'Binance Wallet',
      id: 'binance',
      icon: '/wallets/binance.svg',
      mobile: true,
      extension: true,
      inject: 'BinanceChain',
      deeplink: 'bnbapp://dapp/'
    },
    cryptocom: {
      name: 'Crypto.com DeFi Wallet',
      id: 'cryptocom',
      icon: '/wallets/cryptocom.svg',
      mobile: true,
      extension: true,
      inject: 'deficonnector',
      deeplink: 'cryptodefimobile://dapp/'
    },
    exodus: {
      name: 'Exodus',
      id: 'exodus',
      icon: '/wallets/exodus.svg',
      mobile: true,
      extension: true,
      inject: 'exodus'
    },
    brave: {
      name: 'Brave Wallet',
      id: 'brave',
      icon: '/wallets/brave.svg',
      mobile: false,
      extension: true,
      inject: 'braveWallet'
    },
    xdefi: {
      name: 'XDEFI Wallet',
      id: 'xdefi',
      icon: '/wallets/xdefi.svg',
      mobile: true,
      extension: true,
      inject: 'xfi',
      deeplink: 'xdefi://dapp/'
    },
    mathwallet: {
      name: 'MathWallet',
      id: 'mathwallet',
      icon: '/wallets/mathwallet.svg',
      mobile: true,
      extension: true,
      inject: 'mathwallet',
      deeplink: 'mathwallet://dapp/'
    },
    tokenpocket: {
      name: 'TokenPocket',
      id: 'tokenpocket',
      icon: '/wallets/tokenpocket.svg',
      mobile: true,
      extension: true,
      inject: 'tokenpocket',
      deeplink: 'tpoutside://open?param='
    },
    imtoken: {
      name: 'imToken',
      id: 'imtoken',
      icon: '/wallets/imtoken.svg',
      mobile: true,
      extension: false,
      deeplink: 'imtokenv2://dapp/'
    },
    zerion: {
      name: 'Zerion',
      id: 'zerion',
      icon: '/wallets/zerion.svg',
      mobile: true,
      extension: true,
      inject: 'zerion',
      deeplink: 'zerion://dapp/'
    },
    frame: {
      name: 'Frame',
      id: 'frame',
      icon: '/wallets/frame.svg',
      mobile: false,
      extension: true,
      inject: 'frame'
    },
    tally: {
      name: 'Tally',
      id: 'tally',
      icon: '/wallets/tally.svg',
      mobile: false,
      extension: true,
      inject: 'tally'
    }
  };

  private supportedNetworks: Record<string, NetworkConfig> = {
    ethereum: {
      chainId: '1',
      chainName: 'Ethereum Mainnet',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['https://mainnet.infura.io/v3/'],
      blockExplorerUrls: ['https://etherscan.io'],
      icon: '/networks/ethereum.svg'
    },
    polygon: {
      chainId: '137',
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
      },
      rpcUrls: ['https://polygon-rpc.com/'],
      blockExplorerUrls: ['https://polygonscan.com'],
      icon: '/networks/polygon.svg'
    },
    bsc: {
      chainId: '56',
      chainName: 'BNB Smart Chain',
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18
      },
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
      blockExplorerUrls: ['https://bscscan.com'],
      icon: '/networks/bsc.svg'
    },
    arbitrum: {
      chainId: '42161',
      chainName: 'Arbitrum One',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io'],
      icon: '/networks/arbitrum.svg'
    },
    optimism: {
      chainId: '10',
      chainName: 'Optimism',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['https://mainnet.optimism.io/'],
      blockExplorerUrls: ['https://optimistic.etherscan.io'],
      icon: '/networks/optimism.svg'
    },
    avalanche: {
      chainId: '43114',
      chainName: 'Avalanche C-Chain',
      nativeCurrency: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18
      },
      rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
      blockExplorerUrls: ['https://snowtrace.io'],
      icon: '/networks/avalanche.svg'
    },
    fantom: {
      chainId: '250',
      chainName: 'Fantom Opera',
      nativeCurrency: {
        name: 'Fantom',
        symbol: 'FTM',
        decimals: 18
      },
      rpcUrls: ['https://rpc.ftm.tools/'],
      blockExplorerUrls: ['https://ftmscan.com'],
      icon: '/networks/fantom.svg'
    },
    base: {
      chainId: '8453',
      chainName: 'Base',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['https://mainnet.base.org/'],
      blockExplorerUrls: ['https://basescan.org'],
      icon: '/networks/base.svg'
    },
    // Custom POL Sandbox Network
    pol: {
      chainId: '88888',
      chainName: 'POL Sandbox',
      nativeCurrency: {
        name: 'POL',
        symbol: 'POL',
        decimals: 18
      },
      rpcUrls: ['https://rpc.pol-sandbox.com/'],
      blockExplorerUrls: ['https://explorer.pol-sandbox.com'],
      icon: '/networks/pol.svg'
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
    this.adapters.set('safepal', new SafePalAdapter());
    this.adapters.set('walletconnect', new WalletConnectAdapter());
    this.adapters.set('phantom', new PhantomAdapter());
    this.adapters.set('rabby', new RabbyAdapter());
    this.adapters.set('okx', new OKXAdapter());
    this.adapters.set('binance', new BinanceAdapter());
    this.adapters.set('cryptocom', new CryptoComAdapter());
    this.adapters.set('exodus', new ExodusAdapter());
    this.adapters.set('brave', new BraveAdapter());
    this.adapters.set('xdefi', new XDEFIAdapter());
    this.adapters.set('mathwallet', new MathWalletAdapter());
    this.adapters.set('tokenpocket', new TokenPocketAdapter());
    this.adapters.set('imtoken', new ImTokenAdapter());
    this.adapters.set('zerion', new ZerionAdapter());
    this.adapters.set('frame', new FrameAdapter());
    this.adapters.set('tally', new TallyAdapter());
  }

  async detectWallet(): Promise<string[]> {
    const detected: string[] = [];

    // Check for injected wallets
    if (typeof window !== 'undefined') {
      // MetaMask detection - multiple methods
      if (window.ethereum?.isMetaMask) detected.push('metamask');
      if (window.ethereum?.providers?.some((p: any) => p.isMetaMask)) detected.push('metamask');
      if (window.metaMask) detected.push('metamask');
      
      // Trust Wallet detection - enhanced
      if (window.ethereum?.isTrust) detected.push('trustwallet');
      if (window.trustwallet) detected.push('trustwallet');
      if (window._trustwallet) detected.push('trustwallet');
      if (window.ethereum?.providers?.some((p: any) => p.isTrust)) detected.push('trustwallet');
      
      // Coinbase Wallet detection - enhanced
      if (window.ethereum?.isCoinbaseWallet) detected.push('coinbase');
      if (window.coinbaseWallet) detected.push('coinbase');
      if (window.coinbaseWalletExtension) detected.push('coinbase');
      if (window.ethereum?.providers?.some((p: any) => p.isCoinbaseWallet)) detected.push('coinbase');
      
      // SafePal detection - comprehensive methods
      if (window.safepal) detected.push('safepal');
      if (window.ethereum?.isSafePal) detected.push('safepal');
      if (window.ethereum?.isSafePalWallet) detected.push('safepal');
      if (window.ethereum?.providerName?.toLowerCase().includes('safepal')) detected.push('safepal');
      if (window.sp) detected.push('safepal'); // SafePal alternative
      
      // Phantom Wallet (Solana) detection
      if (window.phantom?.solana?.isPhantom) detected.push('phantom');
      if (window.solana?.isPhantom) detected.push('phantom');
      
      // Rabby Wallet detection
      if (window.ethereum?.isRabby) detected.push('rabby');
      if (window.rabby) detected.push('rabby');
      
      // OKX Wallet detection
      if (window.okxwallet) detected.push('okx');
      if (window.ethereum?.isOkxWallet) detected.push('okx');
      if (window.okexchain) detected.push('okx');
      
      // Binance Wallet detection
      if (window.BinanceChain) detected.push('binance');
      if (window.ethereum?.isBinance) detected.push('binance');
      
      // Crypto.com DeFi Wallet detection
      if (window.deficonnector) detected.push('cryptocom');
      if (window.ethereum?.isDeficonnect) detected.push('cryptocom');
      
      // Exodus Wallet detection
      if (window.exodus) detected.push('exodus');
      if (window.ethereum?.isExodus) detected.push('exodus');
      
      // Brave Wallet detection
      if (window.ethereum?.isBraveWallet) detected.push('brave');
      if (window.braveWallet) detected.push('brave');
      
      // XDEFI Wallet detection
      if (window.xfi) detected.push('xdefi');
      if (window.ethereum?.isXDEFI) detected.push('xdefi');
      
      // MathWallet detection
      if (window.ethereum?.isMathWallet) detected.push('mathwallet');
      if (window.mathwallet) detected.push('mathwallet');
      
      // TokenPocket detection
      if (window.ethereum?.isTokenPocket) detected.push('tokenpocket');
      if (window.tokenpocket) detected.push('tokenpocket');
      
      // imToken detection
      if (window.ethereum?.isImToken) detected.push('imtoken');
      if (window.imToken) detected.push('imtoken');
      
      // Zerion detection
      if (window.ethereum?.isZerion) detected.push('zerion');
      if (window.zerion) detected.push('zerion');
      
      // Frame detection
      if (window.ethereum?.isFrame) detected.push('frame');
      if (window.frame) detected.push('frame');
      
      // Tally detection
      if (window.ethereum?.isTally) detected.push('tally');
      if (window.tally) detected.push('tally');
      
      // Check for multiple providers (common in browser extensions)
      if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
        window.ethereum.providers.forEach((provider: any) => {
          if (provider.isMetaMask && !detected.includes('metamask')) detected.push('metamask');
          if (provider.isTrust && !detected.includes('trustwallet')) detected.push('trustwallet');
          if (provider.isCoinbaseWallet && !detected.includes('coinbase')) detected.push('coinbase');
          if (provider.isSafePal && !detected.includes('safepal')) detected.push('safepal');
          if (provider.isRabby && !detected.includes('rabby')) detected.push('rabby');
          if (provider.isOkxWallet && !detected.includes('okx')) detected.push('okx');
          if (provider.isBraveWallet && !detected.includes('brave')) detected.push('brave');
        });
      }
    }

    // Always include WalletConnect as fallback
    detected.push('walletconnect');

    return [...new Set(detected)]; // Remove duplicates
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
      const networkConfig = this.getNetworkByChainId(chainId);
      if (!networkConfig) {
        throw new Error(`Network with chainId ${chainId} not supported`);
      }

      // Try to switch to the network
      await this.addOrSwitchNetwork(networkConfig);
      
      // Update connection state
      this.connectionState.chainId = chainId;
      this.connectionState.network = networkConfig;
      
    } catch (error) {
      console.error('Failed to switch chain:', error);
      throw error;
    }
  }

  async addOrSwitchNetwork(networkConfig: NetworkConfig): Promise<void> {
    if (!this.connectionState.walletType) {
      throw new Error('Wallet not connected');
    }

    const params = {
      chainId: `0x${parseInt(networkConfig.chainId).toString(16)}`,
      chainName: networkConfig.chainName,
      nativeCurrency: networkConfig.nativeCurrency,
      rpcUrls: networkConfig.rpcUrls,
      blockExplorerUrls: networkConfig.blockExplorerUrls
    };

    try {
      // Try to switch to the network first
      await this.sendWalletRequest('wallet_switchEthereumChain', [{ chainId: params.chainId }]);
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to the wallet
      if (switchError.code === 4902) {
        try {
          // Try to add the network
          await this.sendWalletRequest('wallet_addEthereumChain', [params]);
        } catch (addError) {
          console.error('Failed to add network:', addError);
          throw addError;
        }
      } else {
        console.error('Failed to switch network:', switchError);
        throw switchError;
      }
    }
  }

  private async sendWalletRequest(method: string, params: any[]): Promise<any> {
    const walletType = this.connectionState.walletType!;
    
    switch (walletType) {
      case 'metamask':
      case 'trustwallet':
      case 'coinbase':
      case 'rabby':
      case 'okx':
      case 'binance':
      case 'exodus':
      case 'brave':
      case 'xdefi':
      case 'mathwallet':
      case 'tokenpocket':
      case 'zerion':
      case 'frame':
      case 'tally':
        if (window.ethereum) {
          return await window.ethereum.request({ method, params });
        }
        break;
      case 'safepal':
        if (window.safepal) {
          return await window.safepal.request({ method, params });
        }
        // Fallback: try to connect via ethereum if SafePal injects there
        if (window.ethereum && window.ethereum.isSafePal) {
          return await window.ethereum.request({ method, params });
        }
        break;
      case 'cryptocom':
        if (window.deficonnector) {
          return await window.deficonnector.request({ method, params });
        }
        break;
      default:
        throw new Error(`Network switching not supported for ${walletType}`);
    }
    
    throw new Error(`${walletType} not available`);
  }

  getSupportedNetworks(): NetworkConfig[] {
    return Object.values(this.supportedNetworks);
  }

  getNetworkByChainId(chainId: string): NetworkConfig | undefined {
    return Object.values(this.supportedNetworks).find(network => network.chainId === chainId);
  }

  getCurrentNetwork(): NetworkConfig | undefined {
    if (!this.connectionState.chainId) return undefined;
    return this.getNetworkByChainId(this.connectionState.chainId);
  }

  async addCustomNetwork(networkConfig: NetworkConfig): Promise<void> {
    // Validate network config
    if (!networkConfig.chainId || !networkConfig.chainName || !networkConfig.rpcUrls.length) {
      throw new Error('Invalid network configuration');
    }

    // Add to supported networks
    this.supportedNetworks[`custom_${networkConfig.chainId}`] = networkConfig;
    
    // Try to add to wallet
    await this.addOrSwitchNetwork(networkConfig);
  }

  private async requestAccounts(walletType: string): Promise<string[]> {
    switch (walletType) {
      case 'metamask':
      case 'trustwallet':
      case 'coinbase':
      case 'rabby':
      case 'okx':
      case 'binance':
      case 'exodus':
      case 'brave':
      case 'xdefi':
      case 'mathwallet':
      case 'tokenpocket':
      case 'zerion':
      case 'frame':
      case 'tally':
        if (window.ethereum) {
          return await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        break;
      case 'safepal':
        if (window.safepal) {
          return await window.safepal.request({ method: 'eth_requestAccounts' });
        }
        // Fallback: try to connect via ethereum if SafePal injects there
        if (window.ethereum && window.ethereum.isSafePal) {
          return await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        break;
      case 'cryptocom':
        if (window.deficonnector) {
          return await window.deficonnector.request({ method: 'eth_requestAccounts' });
        }
        break;
      case 'phantom':
        if (window.phantom?.solana?.isPhantom) {
          return await window.phantom.solana.connect();
        }
        if (window.solana?.isPhantom) {
          return await window.solana.connect();
        }
        break;
      case 'walletconnect':
        // Implement WalletConnect v2 logic
        return await this.connectWalletConnect();
      case 'imtoken':
        // imToken typically uses deep links for mobile
        window.open('imtokenv2://dapp/', '_blank');
        return [];
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
      case 'rabby':
      case 'okx':
      case 'binance':
      case 'exodus':
      case 'brave':
      case 'xdefi':
      case 'mathwallet':
      case 'tokenpocket':
      case 'zerion':
      case 'frame':
      case 'tally':
        if (window.ethereum) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          return parseInt(chainId, 16).toString();
        }
        break;
      case 'safepal':
        if (window.safepal) {
          const chainId = await window.safepal.request({ method: 'eth_chainId' });
          return parseInt(chainId, 16).toString();
        }
        // Fallback: try to get chainId via ethereum if SafePal injects there
        if (window.ethereum && window.ethereum.isSafePal) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          return parseInt(chainId, 16).toString();
        }
        break;
      case 'cryptocom':
        if (window.deficonnector) {
          const chainId = await window.deficonnector.request({ method: 'eth_chainId' });
          return parseInt(chainId, 16).toString();
        }
        break;
      case 'phantom':
        // Phantom is Solana-focused, return a default for compatibility
        return '1'; // Ethereum mainnet as fallback
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
      case 'rabby':
      case 'okx':
      case 'binance':
      case 'exodus':
      case 'brave':
      case 'xdefi':
      case 'mathwallet':
      case 'tokenpocket':
      case 'zerion':
      case 'frame':
      case 'tally':
        if (window.ethereum) {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          return (parseInt(balance, 16) / 1e18).toString();
        }
        break;
      case 'safepal':
        if (window.safepal) {
          const balance = await window.safepal.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          return (parseInt(balance, 16) / 1e18).toString();
        }
        // Fallback: try to get balance via ethereum if SafePal injects there
        if (window.ethereum && window.ethereum.isSafePal) {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          return (parseInt(balance, 16) / 1e18).toString();
        }
        break;
      case 'cryptocom':
        if (window.deficonnector) {
          const balance = await window.deficonnector.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          return (parseInt(balance, 16) / 1e18).toString();
        }
        break;
      case 'phantom':
        // Phantom is Solana-focused, return 0 for ETH balance
        return '0';
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

// SafePal Adapter Implementation
class SafePalAdapter implements WalletAPIAdapter {
  private readonly SAFEPAL_API_ENDPOINTS = {
    PORTFOLIO: 'https://www.safepal.io/sfp-api/portfolio/',
    PRICES: 'https://www.safepal.io/sfp-api/prices/'
  };

  async getPortfolio(address: string): Promise<PortfolioData> {
    try {
      // SafePal specific portfolio API
      const response = await fetch(`${this.SAFEPAL_API_ENDPOINTS.PORTFOLIO}${address}`);
      const data = await response.json();
      
      return this.normalizePortfolio(data);
    } catch (error) {
      console.error('Failed to get SafePal portfolio:', error);
      // Fallback to mock data
      return this.getMockPortfolio();
    }
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    try {
      const response = await fetch(
        `${this.SAFEPAL_API_ENDPOINTS.PRICES}?tokens=${tokens.join(',')}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to get SafePal prices:', error);
      return {};
    }
  }

  async submitTransaction(tx: any): Promise<string> {
    // SafePal specific transaction submission
    if (window.safepal) {
      return await window.safepal.request({
        method: 'eth_sendTransaction',
        params: [tx]
      });
    }
    // Fallback: try to submit via ethereum if SafePal injects there
    if (window.ethereum && window.ethereum.isSafePal) {
      return await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx]
      });
    }
    throw new Error('SafePal not available');
  }

  async signMessage(message: string): Promise<string> {
    if (window.safepal) {
      return await window.safepal.request({
        method: 'personal_sign',
        params: [message, await this.getCurrentAccount()]
      });
    }
    // Fallback: try to sign via ethereum if SafePal injects there
    if (window.ethereum && window.ethereum.isSafePal) {
      return await window.ethereum.request({
        method: 'personal_sign',
        params: [message, await this.getCurrentAccount()]
      });
    }
    throw new Error('SafePal not available');
  }

  private normalizePortfolio(data: any): PortfolioData {
    // Normalize SafePal API response to our format
    return {
      totalValue: data.totalValue || 0,
      tokens: data.tokens || [],
      nfts: data.nfts || [],
      history: data.history || []
    };
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 3200.50,
      tokens: [
        {
          address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
          symbol: 'POL',
          name: 'Polygon',
          balance: '1000.00',
          decimals: 18,
          price: 0.85,
          value: 850.00,
          icon: '/tokens/pol.svg'
        },
        {
          address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '2350.50',
          decimals: 6,
          price: 1.00,
          value: 2350.50,
          icon: '/tokens/usdc.svg'
        }
      ],
      nfts: [],
      history: []
    };
  }

  private async getCurrentAccount(): Promise<string> {
    if (window.safepal) {
      const accounts = await window.safepal.request({ method: 'eth_accounts' });
      return accounts[0];
    }
    // Fallback: try to get account via ethereum if SafePal injects there
    if (window.ethereum && window.ethereum.isSafePal) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
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

// Placeholder adapter classes for new wallets
class PhantomAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('Phantom transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('Phantom message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class RabbyAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('Rabby transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('Rabby message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class OKXAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('OKX transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('OKX message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class BinanceAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('Binance transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('Binance message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class CryptoComAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('Crypto.com transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('Crypto.com message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class ExodusAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('Exodus transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('Exodus message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class BraveAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('Brave transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('Brave message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class XDEFIAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('XDEFI transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('XDEFI message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class MathWalletAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('MathWallet transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('MathWallet message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class TokenPocketAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('TokenPocket transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('TokenPocket message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class ImTokenAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('imToken transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('imToken message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class ZerionAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('Zerion transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('Zerion message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class FrameAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('Frame transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('Frame message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
      tokens: [],
      nfts: [],
      history: []
    };
  }
}

class TallyAdapter implements WalletAPIAdapter {
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.getMockPortfolio();
  }

  async getTokenPrices(tokens: string[]): Promise<Record<string, number>> {
    return {};
  }

  async submitTransaction(tx: any): Promise<string> {
    throw new Error('Tally transactions not implemented');
  }

  async signMessage(message: string): Promise<string> {
    throw new Error('Tally message signing not implemented');
  }

  private getMockPortfolio(): PortfolioData {
    return {
      totalValue: 1000,
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
    metaMask?: any;
    _trustwallet?: any;
  }
}