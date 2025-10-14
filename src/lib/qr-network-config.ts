/**
 * QR Code Network Configuration System
 * 
 * This module generates QR codes for wallet network configuration.
 * Users can scan these QR codes with their wallet apps to automatically
 * add the POL Sandbox network configuration.
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
 * Wallet QR Code Formats
 * Different wallets support different QR code formats for network configuration
 */
export class WalletQRGenerator {
  
  /**
   * Generate QR code for MetaMask
   * Format: ethereum:{chainId}?rpc={rpcUrl}&chainName={name}&nativeCurrency={symbol}&blockExplorerUrls={explorerUrl}
   */
  static generateMetaMaskQR(config: NetworkConfig): string {
    const params = new URLSearchParams({
      rpc: config.rpcUrls[0],
      chainName: config.chainName,
      nativeCurrency: `${config.nativeCurrency.name},${config.nativeCurrency.symbol},${config.nativeCurrency.decimals}`,
      blockExplorerUrls: config.blockExplorerUrls?.[0] || ''
    });
    
    return `ethereum:${config.chainId}?${params.toString()}`;
  }

  /**
   * Generate QR code for Trust Wallet
   * Format: https://link.trustwallet.com/add_network?chainId={chainId}&rpcUrl={rpcUrl}&chainName={name}&symbol={symbol}&decimals={decimals}&explorerUrl={explorerUrl}
   */
  static generateTrustWalletQR(config: NetworkConfig): string {
    const params = new URLSearchParams({
      chainId: config.chainId,
      rpcUrl: config.rpcUrls[0],
      chainName: config.chainName,
      symbol: config.nativeCurrency.symbol,
      decimals: config.nativeCurrency.decimals.toString(),
      explorerUrl: config.blockExplorerUrls?.[0] || ''
    });
    
    return `https://link.trustwallet.com/add_network?${params.toString()}`;
  }

  /**
   * Generate QR code for Coinbase Wallet
   * Format: https://go.cb-w.com/add_network?chainId={chainId}&rpcUrl={rpcUrl}&chainName={name}&symbol={symbol}&decimals={decimals}&explorerUrl={explorerUrl}
   */
  static generateCoinbaseQR(config: NetworkConfig): string {
    const params = new URLSearchParams({
      chainId: config.chainId,
      rpcUrl: config.rpcUrls[0],
      chainName: config.chainName,
      symbol: config.nativeCurrency.symbol,
      decimals: config.nativeCurrency.decimals.toString(),
      explorerUrl: config.blockExplorerUrls?.[0] || ''
    });
    
    return `https://go.cb-w.com/add_network?${params.toString()}`;
  }

  /**
   * Generate QR code for OKX Wallet
   * Format: okexchain://add_network?chainId={chainId}&rpcUrl={rpcUrl}&chainName={name}&symbol={symbol}&decimals={decimals}&explorerUrl={explorerUrl}
   */
  static generateOKXQR(config: NetworkConfig): string {
    const params = new URLSearchParams({
      chainId: config.chainId,
      rpcUrl: config.rpcUrls[0],
      chainName: config.chainName,
      symbol: config.nativeCurrency.symbol,
      decimals: config.nativeCurrency.decimals.toString(),
      explorerUrl: config.blockExplorerUrls?.[0] || ''
    });
    
    return `okexchain://add_network?${params.toString()}`;
  }

  /**
   * Generate QR code for Phantom Wallet
   * Format: phantom://add_network?chainId={chainId}&rpcUrl={rpcUrl}&chainName={name}&symbol={symbol}&decimals={decimals}&explorerUrl={explorerUrl}
   */
  static generatePhantomQR(config: NetworkConfig): string {
    const params = new URLSearchParams({
      chainId: config.chainId,
      rpcUrl: config.rpcUrls[0],
      chainName: config.chainName,
      symbol: config.nativeCurrency.symbol,
      decimals: config.nativeCurrency.decimals.toString(),
      explorerUrl: config.blockExplorerUrls?.[0] || ''
    });
    
    return `phantom://add_network?${params.toString()}`;
  }

  /**
   * Generate universal QR code (WalletConnect format)
   * This format is supported by most modern wallets
   */
  static generateUniversalQR(config: NetworkConfig): string {
    const networkData = {
      chainId: config.chainId,
      chainName: config.chainName,
      nativeCurrency: config.nativeCurrency,
      rpcUrls: config.rpcUrls,
      blockExplorerUrls: config.blockExplorerUrls,
      iconUrls: config.iconUrls
    };
    
    // Encode as base64 for QR code
    const jsonStr = JSON.stringify(networkData);
    return `data:application/json;base64,${btoa(jsonStr)}`;
  }

  /**
   * Generate QR code data for all supported wallets
   */
  static generateAllWalletQRs(config: NetworkConfig): Record<string, string> {
    return {
      metamask: this.generateMetaMaskQR(config),
      trustwallet: this.generateTrustWalletQR(config),
      coinbase: this.generateCoinbaseQR(config),
      okx: this.generateOKXQR(config),
      phantom: this.generatePhantomQR(config),
      universal: this.generateUniversalQR(config)
    };
  }
}

/**
 * QR Code Display Instructions
 */
export const WALLET_QR_INSTRUCTIONS = {
  metamask: {
    title: "MetaMask QR Code Setup",
    steps: [
      "Open MetaMask mobile app",
      "Tap the QR code scanner icon",
      "Scan this QR code",
      "Confirm network addition when prompted",
      "Switch to POL Sandbox network"
    ]
  },
  trustwallet: {
    title: "Trust Wallet QR Code Setup", 
    steps: [
      "Open Trust Wallet app",
      "Go to Settings > Networks",
      "Tap 'Add Network' or the QR icon",
      "Scan this QR code",
      "Confirm network addition"
    ]
  },
  coinbase: {
    title: "Coinbase Wallet QR Code Setup",
    steps: [
      "Open Coinbase Wallet app",
      "Tap the QR code scanner",
      "Scan this QR code", 
      "Approve network addition",
      "Select POL Sandbox network"
    ]
  },
  okx: {
    title: "OKX Wallet QR Code Setup",
    steps: [
      "Open OKX Wallet app",
      "Find the QR scanner in the app",
      "Scan this QR code",
      "Confirm network configuration",
      "Switch to POL Sandbox"
    ]
  },
  phantom: {
    title: "Phantom Wallet QR Code Setup",
    steps: [
      "Open Phantom wallet app",
      "Go to Settings > Networks",
      "Tap 'Add Network' and select QR option",
      "Scan this QR code",
      "Confirm and switch to POL Sandbox"
    ]
  },
  universal: {
    title: "Universal QR Code Setup",
    steps: [
      "Open your wallet app",
      "Find the QR code scanner",
      "Scan this QR code",
      "Follow your wallet's specific instructions",
      "Confirm network addition"
    ]
  }
};

/**
 * Network Configuration Validation
 */
export class NetworkConfigValidator {
  
  static validateConfig(config: NetworkConfig): boolean {
    // Check required fields
    if (!config.chainId || !config.chainName || !config.nativeCurrency) {
      return false;
    }
    
    // Check chainId format (should be hex)
    if (!config.chainId.startsWith('0x') || !/^[0-9a-fA-F]+$/.test(config.chainId.slice(2))) {
      return false;
    }
    
    // Check RPC URLs
    if (!config.rpcUrls || config.rpcUrls.length === 0) {
      return false;
    }
    
    // Check native currency
    if (!config.nativeCurrency.name || !config.nativeCurrency.symbol || 
        typeof config.nativeCurrency.decimals !== 'number') {
      return false;
    }
    
    return true;
  }
  
  static getChainIdDecimal(chainId: string): number {
    return parseInt(chainId, 16);
  }
  
  static formatChainId(chainId: string): string {
    return `Chain ID: ${chainId} (${this.getChainIdDecimal(chainId)} in decimal)`;
  }
}