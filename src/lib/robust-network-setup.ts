// Robust Network Setup - Ensures network configuration works properly
// Now using centralized NetworkManager for consistency
import { networkManager, NetworkConfig } from './network-manager';

declare global {
  interface Window {
    ethereum?: any;
    trustwallet?: any;
    _trustwallet?: any;
  }
}

export class RobustNetworkSetup {
  private static instance: RobustNetworkSetup;

  static getInstance(): RobustNetworkSetup {
    if (!RobustNetworkSetup.instance) {
      RobustNetworkSetup.instance = new RobustNetworkSetup();
    }
    return RobustNetworkSetup.instance;
  }

  // Get the appropriate provider for wallet type (using NetworkManager)
  getProvider(walletType: string): any {
    return networkManager.detectProvider(walletType);
  }

  // Check current network (using NetworkManager)
  async getCurrentNetwork(provider: any): Promise<{
    chainId: string;
    isCorrectNetwork: boolean;
  }> {
    try {
      const result = await networkManager.getCurrentNetwork(provider);
      return {
        chainId: result.chainId,
        isCorrectNetwork: result.isCorrectNetwork
      };
    } catch (error) {
      console.error('Failed to get current network:', error);
      return {
        chainId: 'unknown',
        isCorrectNetwork: false
      };
    }
  }

  // Request network switch (using NetworkManager)
  async requestNetworkSwitch(provider: any): Promise<{
    success: boolean;
    action: 'switched' | 'needs_add' | 'failed';
    error?: string;
  }> {
    return await networkManager.switchToNetwork(provider);
  }

  // Add network (using NetworkManager)
  async addNetwork(provider: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    return await networkManager.addNetwork(provider);
  }

  // Complete network setup with user feedback (using NetworkManager)
  async setupNetwork(walletType: string, onProgress?: (message: string) => void): Promise<{
    success: boolean;
    action: 'switched' | 'added' | 'failed';
    error?: string;
  }> {
    return await networkManager.setupNetwork(walletType, onProgress);
  }

  // Add token with user feedback (using NetworkManager)
  async addToken(walletType: string, token: any, onProgress?: (message: string) => void): Promise<{
    success: boolean;
    error?: string;
  }> {
    return await networkManager.addToken(walletType, token, onProgress);
  }

  // Complete setup flow with progress feedback (using NetworkManager)
  async completeSetup(walletType: string, onProgress?: (message: string) => void): Promise<{
    success: boolean;
    networkSetup: boolean;
    tokensAdded: number;
    errors: string[];
  }> {
    return await networkManager.completeSetup(walletType, onProgress);
  }

  // Get network configuration for external use
  getNetworkConfig(): NetworkConfig {
    return networkManager.getNetworkConfig();
  }

  // Validate network configuration
  validateNetworkConfig(config: Partial<NetworkConfig>): {
    isValid: boolean;
    errors: string[];
  } {
    return networkManager.validateNetworkConfig(config);
  }
}

// Export singleton instance
export const robustNetworkSetup = RobustNetworkSetup.getInstance();