/**
 * Realistic Network Configuration System
 * 
 * This module provides ACTUAL working methods for adding networks to wallets.
 * No QR codes - just real, tested approaches that work with wallet limitations.
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
}

export const POL_SANDBOX_CONFIG: NetworkConfig = {
  chainId: '0x23E7', // 9191 in decimal
  chainName: 'POL Sandbox',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://defi-tw.netlify.app/api/rpc'],
  blockExplorerUrls: ['https://defi-tw.netlify.app/explorer'],
  iconUrls: ['https://defi-tw.netlify.app/icon.png']
};

/**
 * Realistic Wallet Configuration Methods
 * These are the ACTUAL ways users can add networks to their wallets
 */
export class RealisticWalletConfig {
  
  /**
   * Method 1: One-Click Network Addition (Programmatic)
   * This works when the wallet is connected to our dApp
   */
  static async addNetworkProgrammatic(walletProvider: any): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    try {
      if (!walletProvider || !walletProvider.request) {
        return { 
          success: false, 
          error: 'Wallet not connected. Please connect your wallet first.' 
        };
      }

      const params = {
        chainId: POL_SANDBOX_CONFIG.chainId,
        chainName: POL_SANDBOX_CONFIG.chainName,
        nativeCurrency: POL_SANDBOX_CONFIG.nativeCurrency,
        rpcUrls: POL_SANDBOX_CONFIG.rpcUrls,
        blockExplorerUrls: POL_SANDBOX_CONFIG.blockExplorerUrls,
        iconUrls: POL_SANDBOX_CONFIG.iconUrls
      };

      await walletProvider.request({
        method: 'wallet_addEthereumChain',
        params: [params]
      });

      return { 
        success: true, 
        message: 'POL Sandbox network added successfully! You can now switch to it.' 
      };

    } catch (error: any) {
      console.error('Failed to add network:', error);
      
      if (error.code === 4001) {
        return { 
          success: false, 
          error: 'User rejected the request. Please try again and approve the network addition.' 
        };
      } else if (error.message?.includes('already exists')) {
        return { 
          success: true, 
          message: 'POL Sandbox network already exists in your wallet!' 
        };
      } else {
        return { 
          success: false, 
          error: error.message || 'Failed to add network. Please use manual setup.' 
        };
      }
    }
  }

  /**
   * Method 2: Copy-to-Clipboard Configuration
   * This allows users to easily copy each field and paste it into their wallet
   */
  static getClipboardConfig(): {
    chainId: { value: string; label: string };
    chainName: { value: string; label: string };
    rpcUrl: { value: string; label: string };
    blockExplorerUrl: { value: string; label: string };
    currencyName: { value: string; label: string };
    currencySymbol: { value: string; label: string };
    decimals: { value: string; label: string };
  } {
    return {
      chainId: {
        value: POL_SANDBOX_CONFIG.chainId,
        label: 'Chain ID'
      },
      chainName: {
        value: POL_SANDBOX_CONFIG.chainName,
        label: 'Network Name'
      },
      rpcUrl: {
        value: POL_SANDBOX_CONFIG.rpcUrls[0],
        label: 'RPC URL'
      },
      blockExplorerUrl: {
        value: POL_SANDBOX_CONFIG.blockExplorerUrls?.[0] || '',
        label: 'Block Explorer URL'
      },
      currencyName: {
        value: POL_SANDBOX_CONFIG.nativeCurrency.name,
        label: 'Currency Name'
      },
      currencySymbol: {
        value: POL_SANDBOX_CONFIG.nativeCurrency.symbol,
        label: 'Currency Symbol'
      },
      decimals: {
        value: POL_SANDBOX_CONFIG.nativeCurrency.decimals.toString(),
        label: 'Decimals'
      }
    };
  }

  /**
   * Method 3: Deep Links to Wallet Network Settings
   * These deep links take users directly to the network settings in their wallet
   */
  static getWalletDeepLinks(): Record<string, { url: string; instructions: string }> {
    return {
      metamask: {
        url: 'metamask://',
        instructions: 'Open MetaMask, go to Settings > Networks > Add Network'
      },
      trustwallet: {
        url: 'trust://',
        instructions: 'Open Trust Wallet, go to Settings > Networks > Add Network'
      },
      coinbase: {
        url: 'cbwallet://',
        instructions: 'Open Coinbase Wallet, go to Settings > Networks > Add Network'
      },
      okx: {
        url: 'okxwallet://',
        instructions: 'Open OKX Wallet, go to Settings > Networks > Add Network'
      },
      phantom: {
        url: 'phantom://',
        instructions: 'Open Phantom, go to Settings > Networks > Add Network'
      }
    };
  }

  /**
   * Method 4: Configuration URL for WalletConnect
   * Some wallets support adding networks via special URLs
   */
  static getConfigurationURL(wallet: string): string {
    const config = POL_SANDBOX_CONFIG;
    
    switch (wallet) {
      case 'metamask':
        // MetaMask doesn't support URL-based network addition
        return '';
      
      case 'trustwallet':
        // Trust Wallet network addition URL (if supported)
        return `https://link.trustwallet.com/add_network?chainId=${config.chainId}&rpcUrl=${encodeURIComponent(config.rpcUrls[0])}&chainName=${encodeURIComponent(config.chainName)}&symbol=${config.nativeCurrency.symbol}&decimals=${config.nativeCurrency.decimals}&explorerUrl=${encodeURIComponent(config.blockExplorerUrls?.[0] || '')}`;
      
      case 'coinbase':
        // Coinbase Wallet network addition URL (if supported)
        return `https://go.cb-w.com/add_network?chainId=${config.chainId}&rpcUrl=${encodeURIComponent(config.rpcUrls[0])}&chainName=${encodeURIComponent(config.chainName)}&symbol=${config.nativeCurrency.symbol}&decimals=${config.nativeCurrency.decimals}&explorerUrl=${encodeURIComponent(config.blockExplorerUrls?.[0] || '')}`;
      
      default:
        return '';
    }
  }

  /**
   * Method 5: Generate complete configuration text
   * Users can copy this entire block and some wallets might parse it
   */
  static getCompleteConfigText(): string {
    const config = POL_SANDBOX_CONFIG;
    return `POL Sandbox Network Configuration:
Network Name: ${config.chainName}
Chain ID: ${config.chainId} (9191)
RPC URL: ${config.rpcUrls[0]}
Block Explorer URL: ${config.blockExplorerUrls?.[0]}
Currency Name: ${config.nativeCurrency.name}
Currency Symbol: ${config.nativeCurrency.symbol}
Decimals: ${config.nativeCurrency.decimals}`;
  }

  /**
   * Method 6: Network validation
   * Check if the provided configuration matches our expected values
   */
  static validateNetworkConfig(userConfig: Partial<NetworkConfig>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (userConfig.chainId !== POL_SANDBOX_CONFIG.chainId) {
      errors.push(`Chain ID should be ${POL_SANDBOX_CONFIG.chainId} (9191)`);
    }
    
    if (userConfig.chainName !== POL_SANDBOX_CONFIG.chainName) {
      errors.push(`Network name should be "${POL_SANDBOX_CONFIG.chainName}"`);
    }
    
    if (userConfig.rpcUrls?.[0] !== POL_SANDBOX_CONFIG.rpcUrls[0]) {
      errors.push(`RPC URL should be ${POL_SANDBOX_CONFIG.rpcUrls[0]}`);
    }
    
    if (userConfig.nativeCurrency?.symbol !== POL_SANDBOX_CONFIG.nativeCurrency.symbol) {
      errors.push(`Currency symbol should be ${POL_SANDBOX_CONFIG.nativeCurrency.symbol}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Wallet-Specific Instructions
 * Clear, accurate instructions for each wallet
 */
export const WALLET_INSTRUCTIONS = {
  metamask: {
    title: "MetaMask Setup",
    steps: [
      "Click the network dropdown in MetaMask",
      "Click 'Add Network' at the bottom",
      "Click 'Add a network manually'",
      "Fill in the network details using the copy buttons below",
      "Click 'Save' to add the network",
      "Switch to POL Sandbox network"
    ],
    tips: [
      "Make sure you're on the latest MetaMask version",
      "Double-check all values before saving",
      "The network will appear in your network list after adding"
    ]
  },
  
  trustwallet: {
    title: "Trust Wallet Setup",
    steps: [
      "Go to Settings (gear icon)",
      "Select 'Networks'",
      "Tap the '+' button in the top-right",
      "Choose 'Custom RPC'",
      "Fill in the network details using the copy buttons below",
      "Tap the checkmark to save",
      "Switch to POL Sandbox network"
    ],
    tips: [
      "Trust Wallet calls it 'Custom RPC' instead of 'Add Network'",
      "Make sure your internet connection is stable",
      "Restart Trust Wallet if the network doesn't appear"
    ]
  },
  
  coinbase: {
    title: "Coinbase Wallet Setup",
    steps: [
      "Tap the network name at the top",
      "Tap 'Add network'",
      "Select 'Custom network'",
      "Fill in the network details using the copy buttons below",
      "Tap 'Add network' to save",
      "Select POL Sandbox from the network list"
    ],
    tips: [
      "Coinbase Wallet has a slightly different interface",
      "The network name must match exactly",
      "Wait a few seconds for the network to sync"
    ]
  },
  
  okx: {
    title: "OKX Wallet Setup",
    steps: [
      "Go to Settings > Network",
      "Tap 'Add Network'",
      "Select 'Custom RPC'",
      "Fill in the network details using the copy buttons below",
      "Confirm to add the network",
      "Switch to POL Sandbox network"
    ],
    tips: [
      "OKX Wallet supports multiple networks",
      "Make sure to select 'Ethereum-compatible' networks",
      "Check the network status after adding"
    ]
  },
  
  phantom: {
    title: "Phantom Wallet Setup",
    steps: [
      "Go to Settings > Networks",
      "Click 'Add Network'",
      "Select 'EVM Network'",
      "Fill in the network details using the copy buttons below",
      "Click 'Add' to save",
      "Switch to POL Sandbox network"
    ],
    tips: [
      "Phantom supports both Solana and EVM networks",
      "Make sure to select EVM network type",
      "The network will appear in your EVM networks list"
    ]
  }
};

/**
 * Configuration Helper Functions
 */
export class ConfigHelper {
  
  /**
   * Copy text to clipboard with fallback
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }

  /**
   * Format chain ID for display
   */
  static formatChainId(chainId: string): string {
    const decimal = parseInt(chainId, 16);
    return `${chainId} (${decimal})`;
  }

  /**
   * Check if wallet is installed
   */
  static isWalletInstalled(wallet: string): boolean {
    switch (wallet) {
      case 'metamask':
        return typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask;
      case 'trustwallet':
        return typeof window !== 'undefined' && !!(window as any).trustwallet;
      case 'coinbase':
        return typeof window !== 'undefined' && !!(window as any).coinbaseWalletExtension;
      default:
        return false;
    }
  }

  /**
   * Get wallet download link
   */
  static getWalletDownloadLink(wallet: string): string {
    const links: Record<string, string> = {
      metamask: 'https://metamask.io/download/',
      trustwallet: 'https://trustwallet.com/download/',
      coinbase: 'https://www.coinbase.com/wallet/downloads',
      okx: 'https://www.okx.com/web3',
      phantom: 'https://phantom.app/'
    };
    
    return links[wallet] || '#';
  }
}