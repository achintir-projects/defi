// Protocol-Owned Liquidity Simulation Engine
export interface SimulationConfig {
  initialCapital: number;
  tokenPrice: number;
  volatility: number;
  drift: number;
  periods: number;
}

export interface LiquidityPool {
  id: string;
  name: string;
  type: 'uniswap_v2' | 'uniswap_v3' | 'curve';
  lowerBound?: number;
  upperBound?: number;
  liquidity: number;
  feeRate: number;
}

export interface SimulationState {
  treasury: number;
  tokenPrice: number;
  priceHistory: number[];
  timestamp: number;
  liquidityPools: Record<string, LiquidityPool>;
  interventions: Intervention[];
  metrics: SimulationMetrics;
}

export interface Intervention {
  timestamp: number;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  reason: string;
  effectiveness: number;
}

export interface SimulationMetrics {
  totalInterventions: number;
  successRate: number;
  treasuryGrowth: number;
  priceStability: number;
  liquidityDepth: number;
  volume24h: number;
}

export class POLSimulation {
  private config: SimulationConfig;
  private state: SimulationState;
  private onStateUpdate?: (state: SimulationState) => void;

  constructor(config: SimulationConfig) {
    this.config = config;
    this.state = this.initializeState();
  }

  private initializeState(): SimulationState {
    return {
      treasury: this.config.initialCapital,
      tokenPrice: this.config.tokenPrice,
      priceHistory: [this.config.tokenPrice],
      timestamp: Date.now(),
      liquidityPools: {
        main: {
          id: 'main',
          name: 'Primary Pool',
          type: 'uniswap_v3',
          lowerBound: this.config.tokenPrice * 0.9,
          upperBound: this.config.tokenPrice * 1.1,
          liquidity: this.config.initialCapital * 0.5,
          feeRate: 0.003
        }
      },
      interventions: [],
      metrics: this.calculateInitialMetrics()
    };
  }

  private calculateInitialMetrics(): SimulationMetrics {
    return {
      totalInterventions: 0,
      successRate: 0,
      treasuryGrowth: 0,
      priceStability: 100,
      liquidityDepth: this.config.initialCapital * 0.5,
      volume24h: 0
    };
  }

  simulateMarketMovement(periods: number = 1): void {
    for (let i = 0; i < periods; i++) {
      const currentPrice = this.state.priceHistory[this.state.priceHistory.length - 1];
      
      // Geometric Brownian Motion
      const drift = this.config.drift;
      const shock = this.gaussianRandom() * this.config.volatility;
      const newPrice = currentPrice * Math.exp(drift + shock);
      
      this.state.priceHistory.push(newPrice);
      this.state.tokenPrice = newPrice;
      this.state.timestamp = Date.now();
      
      // Check for intervention opportunities
      this.checkAndExecuteInterventions();
      
      // Update metrics
      this.updateMetrics();
      
      // Notify listeners
      if (this.onStateUpdate) {
        this.onStateUpdate({ ...this.state });
      }
    }
  }

  private gaussianRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  private checkAndExecuteInterventions(): void {
    const mainPool = this.state.liquidityPools.main;
    if (!mainPool.lowerBound || !mainPool.upperBound) return;

    const currentPrice = this.state.tokenPrice;
    
    if (currentPrice < mainPool.lowerBound) {
      this.executeBuy(currentPrice, 'Price below lower bound');
    } else if (currentPrice > mainPool.upperBound) {
      this.executeSell(currentPrice, 'Price above upper bound');
    }
  }

  private executeBuy(price: number, reason: string): void {
    const amount = Math.min(this.state.treasury * 0.1, 10000); // Max 10% of treasury or $10k
    if (amount > 0) {
      this.state.treasury -= amount;
      const tokens = amount / price;
      
      const intervention: Intervention = {
        timestamp: Date.now(),
        type: 'buy',
        amount,
        price,
        reason,
        effectiveness: this.calculateInterventionEffectiveness('buy', price)
      };
      
      this.state.interventions.push(intervention);
    }
  }

  private executeSell(price: number, reason: string): void {
    // For simplicity, assume we have tokens to sell
    const tokensToSell = 1000; // Fixed amount for demo
    const amount = tokensToSell * price;
    
    this.state.treasury += amount;
    
    const intervention: Intervention = {
      timestamp: Date.now(),
      type: 'sell',
      amount,
      price,
      reason,
      effectiveness: this.calculateInterventionEffectiveness('sell', price)
    };
    
    this.state.interventions.push(intervention);
  }

  private calculateInterventionEffectiveness(type: 'buy' | 'sell', price: number): number {
    // Simple effectiveness calculation based on price movement after intervention
    if (this.state.priceHistory.length < 2) return 0;
    
    const previousPrice = this.state.priceHistory[this.state.priceHistory.length - 2];
    const expectedDirection = type === 'buy' ? 1 : -1;
    const actualDirection = price > previousPrice ? 1 : -1;
    
    return expectedDirection === actualDirection ? 0.8 : 0.2;
  }

  private updateMetrics(): void {
    const initialPrice = this.config.tokenPrice;
    const currentPrice = this.state.tokenPrice;
    const initialTreasury = this.config.initialCapital;
    const currentTreasury = this.state.treasury;
    
    // Calculate price stability (inverse of volatility)
    const prices = this.state.priceHistory.slice(-20); // Last 20 periods
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const priceStability = Math.max(0, 100 - Math.sqrt(variance) / mean * 100);
    
    // Calculate success rate
    const successfulInterventions = this.state.interventions.filter(i => i.effectiveness > 0.5).length;
    const successRate = this.state.interventions.length > 0 
      ? successfulInterventions / this.state.interventions.length 
      : 0;
    
    this.state.metrics = {
      totalInterventions: this.state.interventions.length,
      successRate,
      treasuryGrowth: ((currentTreasury - initialTreasury) / initialTreasury) * 100,
      priceStability,
      liquidityDepth: Object.values(this.state.liquidityPools)
        .reduce((sum, pool) => sum + pool.liquidity, 0),
      volume24h: this.state.interventions
        .filter(i => Date.now() - i.timestamp < 86400000)
        .reduce((sum, i) => sum + i.amount, 0)
    };
  }

  public getState(): SimulationState {
    return { ...this.state };
  }

  public onStateChange(callback: (state: SimulationState) => void): void {
    this.onStateUpdate = callback;
  }

  public reset(): void {
    this.state = this.initializeState();
    if (this.onStateUpdate) {
      this.onStateUpdate({ ...this.state });
    }
  }

  public updateLiquidityRange(lowerBound: number, upperBound: number): void {
    const mainPool = this.state.liquidityPools.main;
    if (mainPool.type === 'uniswap_v3') {
      mainPool.lowerBound = lowerBound;
      mainPool.upperBound = upperBound;
    }
  }

  public addLiquidity(poolId: string, amount: number): void {
    if (this.state.liquidityPools[poolId]) {
      this.state.liquidityPools[poolId].liquidity += amount;
      this.state.treasury -= amount;
    }
  }

  public removeLiquidity(poolId: string, amount: number): void {
    if (this.state.liquidityPools[poolId]) {
      this.state.liquidityPools[poolId].liquidity = Math.max(0, 
        this.state.liquidityPools[poolId].liquidity - amount);
      this.state.treasury += amount;
    }
  }
}

// Predefined simulation scenarios
export const simulationScenarios = {
  bullMarket: {
    name: 'Bull Market',
    volatility: 0.15,
    drift: 0.02,
    description: 'Upward trending market with moderate volatility'
  },
  bearMarket: {
    name: 'Bear Market',
    volatility: 0.25,
    drift: -0.01,
    description: 'Downward trending market with high volatility'
  },
  stableMarket: {
    name: 'Stable Market',
    volatility: 0.05,
    drift: 0.001,
    description: 'Sideways market with low volatility'
  },
  volatileMarket: {
    name: 'Volatile Market',
    volatility: 0.35,
    drift: 0,
    description: 'Highly volatile market with no clear trend'
  }
} as const;

export type ScenarioType = keyof typeof simulationScenarios;