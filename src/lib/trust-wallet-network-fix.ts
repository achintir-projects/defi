// Trust Wallet Network Configuration Fix
// This module addresses the specific issues with Trust Wallet network configuration
// Now using centralized NetworkManager for consistency

import { networkManager, NetworkConfig } from './network-manager';

export const POL_NETWORK_CONFIG: NetworkConfig = networkManager.getNetworkConfig();

export class TrustWalletNetworkFix {
  private static instance: TrustWalletNetworkFix;
  
  static getInstance(): TrustWalletNetworkFix {
    if (!TrustWalletNetworkFix.instance) {
      TrustWalletNetworkFix.instance = new TrustWalletNetworkFix();
    }
    return TrustWalletNetworkFix.instance;
  }

  // Enhanced Trust Wallet provider detection (using NetworkManager)
  detectTrustWalletProvider(): any {
    return networkManager.detectProvider('trustwallet');
  }

  // Check if Trust Wallet is on the correct network (using NetworkManager)
  async checkNetworkStatus(provider: any): Promise<{
    isCorrectNetwork: boolean;
    currentChainId: string;
    needsSwitch: boolean;
  }> {
    try {
      const result = await networkManager.getCurrentNetwork(provider);
      
      console.log(`🌐 Network check - Current: ${result.chainId}, Expected: ${POL_NETWORK_CONFIG.chainId}, Correct: ${result.isCorrectNetwork}`);

      return {
        isCorrectNetwork: result.isCorrectNetwork,
        currentChainId: result.chainId,
        needsSwitch: !result.isCorrectNetwork
      };
    } catch (error) {
      console.error('❌ Failed to check network status:', error);
      return {
        isCorrectNetwork: false,
        currentChainId: 'unknown',
        needsSwitch: true
      };
    }
  }

  // Enhanced network setup with better error handling (using NetworkManager)
  async setupPOLNetworkEnhanced(provider: any, forceRetry: boolean = false): Promise<{
    success: boolean;
    action: 'switched' | 'added' | 'failed';
    error?: string;
  }> {
    if (!provider) {
      return { success: false, action: 'failed', error: 'Provider not available' };
    }

    try {
      console.log('🌐 Starting enhanced POL network setup...');

      // First check current network
      const networkStatus = await this.checkNetworkStatus(provider);
      
      if (networkStatus.isCorrectNetwork && !forceRetry) {
        console.log('✅ Already on correct network');
        return { success: true, action: 'switched' };
      }

      // Use NetworkManager for the actual setup
      const switchResult = await networkManager.switchToNetwork(provider);
      
      if (switchResult.success) {
        console.log('✅ Successfully switched to POL network');
        return { success: true, action: 'switched' };
      }

      if (switchResult.action === 'needs_add') {
        console.log('⚠️ Network switch failed, attempting to add network...');
        const addResult = await networkManager.addNetwork(provider);
        
        if (addResult.success) {
          console.log('✅ Successfully added POL network');
          return { success: true, action: 'added' };
        } else {
          return { success: false, action: 'failed', error: addResult.error };
        }
      }

      return { success: false, action: 'failed', error: switchResult.error };

    } catch (error: any) {
      console.error('❌ Enhanced network setup failed:', error);
      return { success: false, action: 'failed', error: error.message || 'Setup failed' };
    }
  }

  // Enhanced token addition with better error handling (using NetworkManager)
  async addTokenEnhanced(provider: any, token: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!provider) {
      return { success: false, error: 'Provider not available' };
    }

    try {
      console.log(`🪙 Adding ${token.symbol} token...`);
      
      const result = await networkManager.addToken('trustwallet', token, (message) => {
        console.log(`Token addition progress: ${message}`);
      });
      
      if (result.success) {
        console.log(`✅ Successfully added ${token.symbol}`);
      }
      
      return result;
      
    } catch (error: any) {
      console.error(`❌ Failed to add ${token.symbol}:`, error);
      return { success: false, error: error.message || 'Token addition failed' };
    }
  }

  // Complete Trust Wallet setup flow (using NetworkManager)
  async completeTrustWalletSetup(): Promise<{
    success: boolean;
    steps: {
      providerDetection: boolean;
      networkSetup: boolean;
      tokenSetup: boolean;
    };
    errors: string[];
  }> {
    const errors: string[] = [];
    const steps = {
      providerDetection: false,
      networkSetup: false,
      tokenSetup: false
    };

    try {
      console.log('🚀 Starting complete Trust Wallet setup...');

      // Step 1: Provider Detection
      const provider = this.detectTrustWalletProvider();
      if (!provider) {
        errors.push('Trust Wallet provider not detected');
        return { success: false, steps, errors };
      }
      steps.providerDetection = true;

      // Step 2: Network Setup (using NetworkManager)
      const networkResult = await networkManager.setupNetwork('trustwallet', (message) => {
        console.log(`Network setup progress: ${message}`);
      });
      
      if (networkResult.success) {
        steps.networkSetup = true;
      } else {
        errors.push(networkResult.error || 'Network setup failed');
        return { success: false, steps, errors };
      }

      // Step 3: Token Setup (using NetworkManager)
      const defaultTokens = [
        {
          address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
          symbol: 'POL',
          decimals: 18,
          image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x4585fe77225b41b697c938b018e2ac67ac5a20c0/logo.png'
        },
        {
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          symbol: 'USDC',
          decimals: 6,
          image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png'
        },
        {
          address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
          symbol: 'USDT',
          decimals: 6,
          image: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdac17f958d2ee523a2206206994597c13d831ec7/logo.png'
        }
      ];

      let tokenSuccessCount = 0;
      for (const token of defaultTokens) {
        const tokenResult = await this.addTokenEnhanced(provider, token);
        if (tokenResult.success) {
          tokenSuccessCount++;
        } else {
          console.warn(`Token ${token.symbol} failed: ${tokenResult.error}`);
        }
      }

      steps.tokenSetup = tokenSuccessCount > 0;

      console.log(`🎉 Trust Wallet setup complete! Tokens added: ${tokenSuccessCount}/${defaultTokens.length}`);
      
      return {
        success: steps.providerDetection && steps.networkSetup,
        steps,
        errors
      };

    } catch (error: any) {
      console.error('❌ Complete Trust Wallet setup failed:', error);
      errors.push(error.message || 'Setup failed');
      return { success: false, steps, errors };
    }
  }

  // Manual network setup trigger for debugging (using NetworkManager)
  async manualNetworkSetup(): Promise<void> {
    console.log('🔧 Manual network setup triggered...');
    
    const provider = this.detectTrustWalletProvider();
    if (!provider) {
      console.error('❌ No Trust Wallet provider found');
      return;
    }

    const result = await this.setupPOLNetworkEnhanced(provider, true);
    console.log('🔧 Manual setup result:', result);
  }
}

// Export singleton instance
export const trustWalletNetworkFix = TrustWalletNetworkFix.getInstance();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).trustWalletNetworkFix = trustWalletNetworkFix;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    trustwallet?: any;
    _trustwallet?: any;
    ethereum?: any;
    trustWalletNetworkFix?: TrustWalletNetworkFix;
  }
}