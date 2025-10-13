// Enhanced Fixed Price Oracle with sandbox intelligence
import { sandboxWalletIntegration, MarketAnalysis } from './SandboxWalletIntegration';

export interface FixedPriceConfig {
  tokenAddress: string;
  symbol: string;
  baseFixedPrice: number;
  volatilityThreshold: number;
  adjustmentFactor: number;
  lastUpdated: number;
}

export interface PriceAdjustment {
  tokenAddress: string;
  originalPrice: number;
  adjustedPrice: number;
  adjustmentReason: string;
  confidence: number;
  timestamp: number;
}

export interface OracleMetrics {
  totalAdjustments: number;
  averageAdjustment: number;
  accuracyScore: number;
  lastAdjustment: number;
  activeTokens: number;
}

export class EnhancedFixedPriceOracle {
  private fixedPrices: Map<string, FixedPriceConfig> = new Map();
  private priceHistory: Map<string, number[]> = new Map();
  private adjustments: PriceAdjustment[] = [];
  private metrics: OracleMetrics;
  private updateInterval: NodeJS.Timeout | null = null;
  private sandboxIntegration = sandboxWalletIntegration;

  constructor() {
    this.metrics = {
      totalAdjustments: 0,
      averageAdjustment: 0,
      accuracyScore: 0,
      lastAdjustment: 0,
      activeTokens: 0
    };
    this.initializeDefaultTokens();
    this.startRealTimeUpdates();
  }

  private initializeDefaultTokens(): void {
    const defaultTokens = [
      { address: '0x1234...5678', symbol: 'USDT', price: 1.00 },
      { address: '0xabcd...efgh', symbol: 'BTC', price: 45000 },
      { address: '0x5678...9012', symbol: 'ETH', price: 3000 },
      { address: '0xdef0...1234', symbol: 'BNB', price: 300 }
    ];

    defaultTokens.forEach(token => {
      this.fixedPrices.set(token.address, {
        tokenAddress: token.address,
        symbol: token.symbol,
        baseFixedPrice: token.price,
        volatilityThreshold: 0.2,
        adjustmentFactor: 0.05,
        lastUpdated: Date.now()
      });
      this.priceHistory.set(token.address, [token.price]);
    });

    this.metrics.activeTokens = defaultTokens.length;
  }

  private startRealTimeUpdates(): void {
    // Only start updates on client side
    if (typeof window !== 'undefined') {
      // Update prices every 30 seconds
      this.updateInterval = setInterval(async () => {
        await this.updateAllPrices();
      }, 30000);
    }
  }

  // Get dynamic fixed price with sandbox intelligence
  async getDynamicFixedPrice(tokenAddress: string): Promise<number> {
    try {
      const config = this.fixedPrices.get(tokenAddress);
      if (!config) {
        throw new Error(`Token ${tokenAddress} not configured`);
      }

      // Get market conditions from sandbox
      const marketAnalysis = await this.sandboxIntegration.getMarketAnalysis(tokenAddress);
      
      // Adjust fixed price based on sandbox simulations
      if (marketAnalysis.volatility > config.volatilityThreshold) {
        return this.applyVolatilityAdjustment(config.baseFixedPrice, marketAnalysis, config);
      }
      
      return config.baseFixedPrice;
    } catch (error) {
      console.error('Failed to get dynamic fixed price:', error);
      const config = this.fixedPrices.get(tokenAddress);
      return config?.baseFixedPrice || 0;
    }
  }

  private applyVolatilityAdjustment(
    basePrice: number, 
    analysis: MarketAnalysis, 
    config: FixedPriceConfig
  ): number {
    // Use sandbox data to make intelligent price adjustments
    const adjustment = analysis.recommendedStabilityAdjustment;
    const adjustedPrice = basePrice * (1 + adjustment);
    
    // Log the adjustment
    const priceAdjustment: PriceAdjustment = {
      tokenAddress: analysis.tokenAddress,
      originalPrice: basePrice,
      adjustedPrice,
      adjustmentReason: `Volatility adjustment: ${analysis.volatility.toFixed(3)} > ${config.volatilityThreshold}`,
      confidence: analysis.confidence,
      timestamp: Date.now()
    };
    
    this.adjustments.push(priceAdjustment);
    this.updateMetrics(priceAdjustment);
    
    // Update price history
    const history = this.priceHistory.get(analysis.tokenAddress) || [];
    history.push(adjustedPrice);
    if (history.length > 100) history.shift(); // Keep last 100 prices
    this.priceHistory.set(analysis.tokenAddress, history);
    
    return adjustedPrice;
  }

  // Add new token to oracle
  addToken(tokenAddress: string, symbol: string, basePrice: number): void {
    this.fixedPrices.set(tokenAddress, {
      tokenAddress,
      symbol,
      baseFixedPrice: basePrice,
      volatilityThreshold: 0.2,
      adjustmentFactor: 0.05,
      lastUpdated: Date.now()
    });
    
    this.priceHistory.set(tokenAddress, [basePrice]);
    this.metrics.activeTokens++;
  }

  // Update base fixed price
  updateBasePrice(tokenAddress: string, newPrice: number): void {
    const config = this.fixedPrices.get(tokenAddress);
    if (config) {
      config.baseFixedPrice = newPrice;
      config.lastUpdated = Date.now();
      
      // Update price history
      const history = this.priceHistory.get(tokenAddress) || [];
      history.push(newPrice);
      if (history.length > 100) history.shift();
      this.priceHistory.set(tokenAddress, history);
    }
  }

  // Get all current prices
  async getAllPrices(): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};
    
    for (const [address] of this.fixedPrices) {
      prices[address] = await this.getDynamicFixedPrice(address);
    }
    
    return prices;
  }

  // Get price history for a token
  getPriceHistory(tokenAddress: string): number[] {
    return this.priceHistory.get(tokenAddress) || [];
  }

  // Get recent adjustments
  getRecentAdjustments(limit: number = 10): PriceAdjustment[] {
    return this.adjustments.slice(-limit).reverse();
  }

  // Get oracle metrics
  getMetrics(): OracleMetrics {
    return { ...this.metrics };
  }

  private updateMetrics(adjustment: PriceAdjustment): void {
    this.metrics.totalAdjustments++;
    this.metrics.lastAdjustment = adjustment.timestamp;
    
    // Calculate average adjustment
    const totalAdjustment = this.adjustments.reduce((sum, adj) => {
      const percentChange = Math.abs((adj.adjustedPrice - adj.originalPrice) / adj.originalPrice);
      return sum + percentChange;
    }, 0);
    this.metrics.averageAdjustment = totalAdjustment / this.adjustments.length;
    
    // Calculate accuracy score (based on confidence levels)
    const avgConfidence = this.adjustments.reduce((sum, adj) => sum + adj.confidence, 0) / this.adjustments.length;
    this.metrics.accuracyScore = avgConfidence;
  }

  // Update all prices with sandbox intelligence
  private async updateAllPrices(): Promise<void> {
    const tokenAddresses = Array.from(this.fixedPrices.keys());
    
    for (const address of tokenAddresses) {
      try {
        await this.getDynamicFixedPrice(address);
      } catch (error) {
        console.error(`Failed to update price for ${address}:`, error);
      }
    }
  }

  // Set custom volatility threshold for a token
  setVolatilityThreshold(tokenAddress: string, threshold: number): void {
    const config = this.fixedPrices.get(tokenAddress);
    if (config) {
      config.volatilityThreshold = threshold;
    }
  }

  // Set custom adjustment factor
  setAdjustmentFactor(tokenAddress: string, factor: number): void {
    const config = this.fixedPrices.get(tokenAddress);
    if (config) {
      config.adjustmentFactor = factor;
    }
  }

  // Get token configuration
  getTokenConfig(tokenAddress: string): FixedPriceConfig | undefined {
    return this.fixedPrices.get(tokenAddress);
  }

  // Remove token from oracle
  removeToken(tokenAddress: string): void {
    this.fixedPrices.delete(tokenAddress);
    this.priceHistory.delete(tokenAddress);
    this.metrics.activeTokens = Math.max(0, this.metrics.activeTokens - 1);
  }

  // Reset oracle state
  reset(): void {
    this.adjustments = [];
    this.metrics = {
      totalAdjustments: 0,
      averageAdjustment: 0,
      accuracyScore: 0,
      lastAdjustment: 0,
      activeTokens: this.fixedPrices.size
    };
    
    // Reset price histories
    for (const [address, config] of this.fixedPrices) {
      this.priceHistory.set(address, [config.baseFixedPrice]);
    }
  }

  // Export oracle state
  exportState(): {
    fixedPrices: Record<string, FixedPriceConfig>;
    priceHistory: Record<string, number[]>;
    adjustments: PriceAdjustment[];
    metrics: OracleMetrics;
  } {
    return {
      fixedPrices: Object.fromEntries(this.fixedPrices),
      priceHistory: Object.fromEntries(this.priceHistory),
      adjustments: this.adjustments,
      metrics: this.metrics
    };
  }

  // Import oracle state
  importState(state: {
    fixedPrices: Record<string, FixedPriceConfig>;
    priceHistory: Record<string, number[]>;
    adjustments: PriceAdjustment[];
    metrics: OracleMetrics;
  }): void {
    this.fixedPrices = new Map(Object.entries(state.fixedPrices));
    this.priceHistory = new Map(Object.entries(state.priceHistory));
    this.adjustments = state.adjustments;
    this.metrics = state.metrics;
  }

  // Cleanup resources
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// Singleton instance for global access
export const enhancedFixedPriceOracle = new EnhancedFixedPriceOracle();