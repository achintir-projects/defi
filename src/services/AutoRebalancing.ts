// AutoRebalancing System with sandbox strategies
import { sandboxWalletIntegration, SandboxStrategy, WalletState } from './SandboxWalletIntegration';
import { enhancedFixedPriceOracle } from './EnhancedFixedPriceOracle';

export interface TradingStrategy {
  id: string;
  name: string;
  tokenPair: string;
  amount: number;
  expectedProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  parameters: Record<string, any>;
  executionTime: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface RebalancingConfig {
  enabled: boolean;
  riskTolerance: 'low' | 'medium' | 'high';
  maxTradeSize: number;
  minProfitThreshold: number;
  rebalanceInterval: number; // in minutes
  targetAllocation: Record<string, number>;
  maxSlippage: number;
}

export interface RebalancingMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  totalProfit: number;
  averageExecutionTime: number;
  lastExecution: number;
  successRate: number;
}

export interface ExecutionResult {
  strategyId: string;
  success: boolean;
  profit?: number;
  executionTime: number;
  error?: string;
  timestamp: number;
}

export class AutoRebalancing {
  private config: RebalancingConfig;
  private metrics: RebalancingMetrics;
  private executionHistory: ExecutionResult[] = [];
  private isRunning: boolean = false;
  private rebalanceInterval: NodeJS.Timeout | null = null;
  private pendingStrategies: TradingStrategy[] = [];
  private sandboxIntegration = sandboxWalletIntegration;

  constructor(config?: Partial<RebalancingConfig>) {
    this.config = {
      enabled: true,
      riskTolerance: 'medium',
      maxTradeSize: 10000,
      minProfitThreshold: 0.01,
      rebalanceInterval: 5, // 5 minutes
      targetAllocation: {
        'BTC': 0.4,
        'ETH': 0.3,
        'USDT': 0.3
      },
      maxSlippage: 0.005,
      ...config
    };

    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      totalProfit: 0,
      averageExecutionTime: 0,
      lastExecution: 0,
      successRate: 0
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Only set up event listeners on client side
    if (typeof window !== 'undefined') {
      // Listen for strategy updates from sandbox
      window.addEventListener('strategiesUpdated', (event: CustomEvent) => {
        const strategies = event.detail as SandboxStrategy[];
        this.processNewStrategies(strategies);
      });

      // Listen for market alerts
      window.addEventListener('marketAlert', (event: CustomEvent) => {
        console.log('Market alert received:', event.detail);
        this.triggerEmergencyRebalancing();
      });
    }
  }

  private processNewStrategies(strategies: SandboxStrategy[]): void {
    strategies.forEach(strategy => {
      if (this.shouldExecuteStrategy(strategy)) {
        const tradingStrategy: TradingStrategy = {
          id: strategy.id,
          name: strategy.name,
          tokenPair: strategy.tokenPair,
          amount: this.calculateTradeAmount(strategy),
          expectedProfit: strategy.expectedProfit,
          riskLevel: strategy.riskLevel,
          parameters: strategy.parameters,
          executionTime: strategy.executionTime,
          status: 'pending'
        };
        this.pendingStrategies.push(tradingStrategy);
      }
    });

    // Execute pending strategies if auto-rebalancing is enabled
    if (this.config.enabled && this.isRunning) {
      this.executePendingStrategies();
    }
  }

  private shouldExecuteStrategy(strategy: SandboxStrategy): boolean {
    // Check if strategy meets our criteria
    if (strategy.expectedProfit < this.config.minProfitThreshold) {
      return false;
    }

    // Check risk tolerance
    if (strategy.riskLevel === 'high' && this.config.riskTolerance === 'low') {
      return false;
    }

    // Check trade size
    const tradeAmount = this.calculateTradeAmount(strategy);
    if (tradeAmount > this.config.maxTradeSize) {
      return false;
    }

    // Check confidence score
    if (strategy.confidenceScore < 0.7) {
      return false;
    }

    return true;
  }

  private calculateTradeAmount(strategy: SandboxStrategy): number {
    // Calculate trade amount based on strategy parameters and risk
    const baseAmount = strategy.parameters.amount || 1000;
    const riskMultiplier = strategy.riskLevel === 'low' ? 0.5 : 
                           strategy.riskLevel === 'medium' ? 1 : 1.5;
    
    return Math.min(baseAmount * riskMultiplier, this.config.maxTradeSize);
  }

  // Start auto-rebalancing
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Auto-rebalancing is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting auto-rebalancing system');

    // Set up periodic rebalancing
    this.rebalanceInterval = setInterval(async () => {
      await this.performRebalancing();
    }, this.config.rebalanceInterval * 60 * 1000);

    // Perform initial rebalancing
    await this.performRebalancing();
  }

  // Stop auto-rebalancing
  stop(): void {
    if (!this.isRunning) {
      console.log('Auto-rebalancing is not running');
      return;
    }

    this.isRunning = false;
    console.log('Stopping auto-rebalancing system');

    if (this.rebalanceInterval) {
      clearInterval(this.rebalanceInterval);
      this.rebalanceInterval = null;
    }
  }

  // Perform rebalancing based on current portfolio
  private async performRebalancing(): Promise<void> {
    try {
      console.log('Performing portfolio rebalancing...');
      
      // Get current wallet state
      const walletState = await this.sandboxIntegration.getCurrentWalletState();
      
      // Calculate target allocation vs current allocation
      const currentAllocation = this.calculateCurrentAllocation(walletState);
      const rebalancingNeeds = this.calculateRebalancingNeeds(currentAllocation);
      
      // Execute rebalancing trades
      for (const need of rebalancingNeeds) {
        if (Math.abs(need.difference) > 0.05) { // 5% threshold
          await this.executeRebalancingTrade(need);
        }
      }

      // Execute pending strategies
      await this.executePendingStrategies();
      
    } catch (error) {
      console.error('Error during rebalancing:', error);
    }
  }

  private calculateCurrentAllocation(walletState: WalletState): Record<string, number> {
    const allocation: Record<string, number> = {};
    const totalValue = walletState.totalValue;

    walletState.holdings.forEach(holding => {
      allocation[holding.symbol] = holding.marketValue / totalValue;
    });

    return allocation;
  }

  private calculateRebalancingNeeds(currentAllocation: Record<string, number>): Array<{
    symbol: string;
    current: number;
    target: number;
    difference: number;
  }> {
    const needs = [];

    for (const [symbol, target] of Object.entries(this.config.targetAllocation)) {
      const current = currentAllocation[symbol] || 0;
      const difference = target - current;
      
      needs.push({
        symbol,
        current,
        target,
        difference
      });
    }

    return needs;
  }

  private async executeRebalancingTrade(need: {
    symbol: string;
    current: number;
    target: number;
    difference: number;
  }): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create a rebalancing strategy
      const strategy: TradingStrategy = {
        id: `rebalance_${need.symbol}_${Date.now()}`,
        name: `Rebalance ${need.symbol}`,
        tokenPair: `${need.symbol}/USDT`,
        amount: Math.abs(need.difference) * 100000, // Assume $100k portfolio
        expectedProfit: 0.005, // 0.5% expected profit from rebalancing
        riskLevel: 'low',
        parameters: {
          targetAllocation: need.target,
          currentAllocation: need.current,
          rebalanceType: need.difference > 0 ? 'buy' : 'sell'
        },
        executionTime: Date.now(),
        status: 'executing'
      };

      // Execute the trade
      const success = await this.executeStrategy(strategy);
      
      const executionTime = Date.now() - startTime;
      this.recordExecution(strategy.id, success, 0, executionTime);
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.recordExecution(`rebalance_${need.symbol}_${Date.now()}`, false, 0, executionTime, error as string);
    }
  }

  // Execute pending strategies
  private async executePendingStrategies(): Promise<void> {
    const strategiesToExecute = [...this.pendingStrategies];
    this.pendingStrategies = [];

    for (const strategy of strategiesToExecute) {
      await this.executeStrategy(strategy);
    }
  }

  // Execute a single strategy
  async executeSmartRebalancing(): Promise<void> {
    try {
      console.log('Executing smart rebalancing...');
      
      // Get optimal strategies from sandbox
      const strategies = await this.sandboxIntegration.getOptimalStrategies();
      
      // Filter and execute high-confidence strategies
      const highConfidenceStrategies = strategies.filter(s => s.confidenceScore > 0.8);
      
      for (const strategy of highConfidenceStrategies) {
        const tradingStrategy: TradingStrategy = {
          id: strategy.id,
          name: strategy.name,
          tokenPair: strategy.tokenPair,
          amount: this.calculateTradeAmount(strategy),
          expectedProfit: strategy.expectedProfit,
          riskLevel: strategy.riskLevel,
          parameters: strategy.parameters,
          executionTime: strategy.executionTime,
          status: 'pending'
        };
        
        await this.executeStrategy(tradingStrategy);
      }
      
    } catch (error) {
      console.error('Error in smart rebalancing:', error);
    }
  }

  private async executeStrategy(strategy: TradingStrategy): Promise<boolean> {
    const startTime = Date.now();
    strategy.status = 'executing';

    try {
      // Simulate strategy execution
      console.log(`Executing strategy: ${strategy.name}`);
      
      // In a real implementation, this would interact with DEX contracts
      const success = await this.simulateStrategyExecution(strategy);
      
      const executionTime = Date.now() - startTime;
      const profit = success ? strategy.expectedProfit * strategy.amount : 0;
      
      this.recordExecution(strategy.id, success, profit, executionTime);
      strategy.status = success ? 'completed' : 'failed';
      
      return success;
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.recordExecution(strategy.id, false, 0, executionTime, error as string);
      strategy.status = 'failed';
      return false;
    }
  }

  private async simulateStrategyExecution(strategy: TradingStrategy): Promise<boolean> {
    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate success rate based on confidence
    const successRate = strategy.riskLevel === 'low' ? 0.9 :
                       strategy.riskLevel === 'medium' ? 0.75 : 0.6;
    
    return Math.random() < successRate;
  }

  private recordExecution(
    strategyId: string, 
    success: boolean, 
    profit: number, 
    executionTime: number, 
    error?: string
  ): void {
    const result: ExecutionResult = {
      strategyId,
      success,
      profit,
      executionTime,
      error,
      timestamp: Date.now()
    };

    this.executionHistory.push(result);
    this.updateMetrics(result);
  }

  private updateMetrics(result: ExecutionResult): void {
    this.metrics.totalExecutions++;
    
    if (result.success) {
      this.metrics.successfulExecutions++;
      this.metrics.totalProfit += result.profit || 0;
    }
    
    this.metrics.lastExecution = result.timestamp;
    this.metrics.successRate = this.metrics.successfulExecutions / this.metrics.totalExecutions;
    
    // Calculate average execution time
    const totalTime = this.executionHistory.reduce((sum, r) => sum + r.executionTime, 0);
    this.metrics.averageExecutionTime = totalTime / this.executionHistory.length;
  }

  // Emergency rebalancing triggered by market alerts
  private async triggerEmergencyRebalancing(): Promise<void> {
    console.log('Triggering emergency rebalancing due to market alert...');
    
    // Execute conservative strategies only
    const conservativeStrategies = this.pendingStrategies.filter(s => s.riskLevel === 'low');
    
    for (const strategy of conservativeStrategies) {
      await this.executeStrategy(strategy);
    }
  }

  // Get current metrics
  getMetrics(): RebalancingMetrics {
    return { ...this.metrics };
  }

  // Get execution history
  getExecutionHistory(limit: number = 10): ExecutionResult[] {
    return this.executionHistory.slice(-limit).reverse();
  }

  // Get pending strategies
  getPendingStrategies(): TradingStrategy[] {
    return [...this.pendingStrategies];
  }

  // Update configuration
  updateConfig(newConfig: Partial<RebalancingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart if interval changed
    if (newConfig.rebalanceInterval && this.isRunning) {
      this.stop();
      this.start();
    }
  }

  // Get current configuration
  getConfig(): RebalancingConfig {
    return { ...this.config };
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      totalProfit: 0,
      averageExecutionTime: 0,
      lastExecution: 0,
      successRate: 0
    };
    this.executionHistory = [];
  }

  // Cleanup resources
  destroy(): void {
    this.stop();
    if (typeof window !== 'undefined') {
      window.removeEventListener('strategiesUpdated', () => {});
      window.removeEventListener('marketAlert', () => {});
    }
  }
}

// Singleton instance for global access - lazy loaded
let autoRebalancingInstance: AutoRebalancing | null = null;

export const autoRebalancing = (): AutoRebalancing => {
  if (!autoRebalancingInstance) {
    autoRebalancingInstance = new AutoRebalancing();
  }
  return autoRebalancingInstance;
};