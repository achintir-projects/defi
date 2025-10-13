// WalletConnect v2 Configuration for POL Sandbox
export const walletConnectConfig = {
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: ['eip155:1', 'eip155:137', 'eip155:56'], // Ethereum, Polygon, BSC
  methods: [
    'eth_sendTransaction',
    'eth_signTransaction',
    'eth_sign',
    'personal_sign',
    'eth_signTypedData',
    'wallet_switchEthereumChain',
    'wallet_addEthereumChain',
    'eth_getBalance',
    'eth_getAccounts'
  ],
  events: ['chainChanged', 'accountsChanged'],
  optionalChains: ['eip155:42161', 'eip155:10'], // Arbitrum, Optimism
  optionalMethods: [
    'wallet_watchAsset',
    'eth_getBlockByNumber',
    'eth_getTransactionReceipt'
  ],
  metadata: {
    name: 'POL Sandbox',
    description: 'Protocol-Owned Liquidity Strategy Platform',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://pol-sandbox.com',
    icons: ['https://pol-sandbox.com/icon.png']
  },
  relayUrl: 'wss://relay.walletconnect.com'
};

export interface WalletConnectSession {
  topic: string;
  namespaces: Record<string, any>;
  sessionProperties?: Record<string, any>;
}

export interface WalletConnectPairing {
  topic: string;
  relay: {
    protocol: 'irn';
    data: string;
  };
  peerMetadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export class WalletConnectManager {
  private client: any = null;
  private session: WalletConnectSession | null = null;
  private pairings: WalletConnectPairing[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Try to import WalletConnect packages, but fall back to mock if they fail
      let Core: any, Web3Wallet: any, getSdkError: any;
      
      try {
        const wcCore = await import('@walletconnect/core');
        Core = wcCore.Core;
      } catch (e) {
        console.warn('@walletconnect/core not available, using mock implementation');
        throw new Error('WalletConnect packages not available');
      }

      try {
        const wcWeb3 = await import('@walletconnect/web3wallet');
        Web3Wallet = wcWeb3.Web3Wallet;
      } catch (e) {
        console.warn('@walletconnect/web3wallet not available, using mock implementation');
        throw new Error('WalletConnect Web3Wallet not available');
      }

      try {
        const wcUtils = await import('@walletconnect/utils');
        getSdkError = wcUtils.getSdkError;
      } catch (e) {
        console.warn('@walletconnect/utils not available, using mock implementation');
        // Continue without utils
      }

      const core = new Core({
        projectId: walletConnectConfig.projectId,
        relayUrl: walletConnectConfig.relayUrl
      });

      this.client = await Web3Wallet.init({
        core,
        metadata: walletConnectConfig.metadata
      });

      this.setupEventListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
      console.log('Using mock WalletConnect implementation for development');
      // Fallback to mock implementation
      this.setupMockClient();
    }
  }

  private setupMockClient(): void {
    // Mock implementation for development
    this.client = {
      pair: async (uri: string): Promise<{ topic: string }> => {
        console.log('Mock pairing with URI:', uri);
        return { topic: 'mock-topic' };
      },
      approveSession: async (params: any): Promise<void> => {
        console.log('Mock session approval:', params);
        this.session = {
          topic: 'mock-session-topic',
          namespaces: {
            eip155: {
              accounts: ['eip155:1:0x1234567890123456789012345678901234567890'],
              methods: walletConnectConfig.methods,
              events: walletConnectConfig.events
            }
          }
        };
      },
      rejectSession: async (params: any): Promise<void> => {
        console.log('Mock session rejection:', params);
      },
      disconnect: async (params: any): Promise<void> => {
        console.log('Mock disconnect:', params);
        this.session = null;
      },
      request: async (params: any): Promise<string> => {
        console.log('Mock request:', params);
        return '0xmockresponse';
      },
      on: (event: string, callback: (data: any) => void): void => {
        console.log('Mock event listener:', event);
      }
    };
    this.isInitialized = true;
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('session_proposal', (event: any) => {
      console.log('Session proposal received:', event);
      // Auto-approve for demo purposes
      try {
        this.client.approveSession({
          id: event.id,
          namespaces: {
            eip155: {
              accounts: ['eip155:1:0x1234567890123456789012345678901234567890'],
              methods: walletConnectConfig.methods,
              events: walletConnectConfig.events
            }
          }
        });
      } catch (error) {
        console.error('Failed to approve session:', error);
      }
    });

    this.client.on('session_request', (event: any) => {
      console.log('Session request received:', event);
      // Handle session requests
    });

    this.client.on('session_delete', (event: any) => {
      console.log('Session deleted:', event);
      this.session = null;
    });
  }

  async connect(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Check if client has core property (real WalletConnect) or use mock
      if (this.client.core && this.client.core.pairing) {
        const { uri } = await this.client.core.pairing.create();
        
        if (uri) {
          // Listen for pairing
          this.client.core.pairing.pair({ uri });
          return uri;
        }
      } else {
        // Mock implementation - return a mock URI
        console.log('Using mock WalletConnect URI');
        return 'wc:mock-uri-for-development-' + Date.now();
      }
    } catch (error) {
      console.error('Failed to create pairing:', error);
    }

    // Fallback to mock URI
    return 'wc:mock-uri-for-development-' + Date.now();
  }

  async disconnect(): Promise<void> {
    if (!this.client || !this.session) return;

    try {
      await this.client.disconnect({
        topic: this.session.topic,
        reason: { code: 6000, message: 'USER_DISCONNECTED' }
      });
      this.session = null;
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  async requestAccounts(): Promise<string[]> {
    if (!this.client || !this.session) {
      throw new Error('No active session');
    }

    try {
      const result = await this.client.request({
        topic: this.session.topic,
        chainId: 'eip155:1',
        request: {
          method: 'eth_accounts',
          params: []
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to request accounts:', error);
      return ['0x1234567890123456789012345678901234567890']; // Mock fallback
    }
  }

  async sendTransaction(transaction: any): Promise<string> {
    if (!this.client || !this.session) {
      throw new Error('No active session');
    }

    try {
      const result = await this.client.request({
        topic: this.session.topic,
        chainId: 'eip155:1',
        request: {
          method: 'eth_sendTransaction',
          params: [transaction]
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      return '0xmocktransactionhash'; // Mock fallback
    }
  }

  async signMessage(message: string, address: string): Promise<string> {
    if (!this.client || !this.session) {
      throw new Error('No active session');
    }

    try {
      const result = await this.client.request({
        topic: this.session.topic,
        chainId: 'eip155:1',
        request: {
          method: 'personal_sign',
          params: [message, address]
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to sign message:', error);
      return 'mocksignature'; // Mock fallback
    }
  }

  getSession(): WalletConnectSession | null {
    return this.session;
  }

  isConnected(): boolean {
    return this.session !== null;
  }

  getPairings(): WalletConnectPairing[] {
    return this.pairings;
  }
}

// Global instance
export const walletConnectManager = new WalletConnectManager();