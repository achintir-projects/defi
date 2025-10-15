// SandboxWalletIntegration - Real-time data flow between wallet and POL sandbox
export interface WalletState {
  holdings: TokenHolding[];
  fixedPrices: Map<string, number>;
  recentTransactions: Transaction[];
  totalValue: number;
  lastUpdated: number;
}

export interface TokenHolding {
  tokenAddress: string;
  symbol: string;
  balance: number;
  fixedPrice: number;
  marketValue: number;
  decimals: number;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer' | 'bridge';
  tokenAddress: string;
  amount: number;
  price: number;
  timestamp: number;
  hash: string;
  fromChain?: string;
  toChain?: string;
}

export interface UserBehavior {
  avgHoldTime: number;
  tradingFrequency: number;
  riskTolerance: 'low' | 'medium' | 'high';
  preferredTokens: string[];
  lastActivity: number;
}

export interface MarketAnalysis {
  tokenAddress: string;
  volatility: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  liquidityDepth: number;
  recommendedStabilityAdjustment: number;
  confidence: number;
}

export interface SandboxStrategy {
  id: string;
  name: string;
  type: 'arbitrage' | 'rebalancing' | 'liquidity_provision' | 'market_making';
  tokenPair: string;
  confidenceScore: number;
  expectedProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  parameters: Record<string, any>;
  executionTime: number;
}

export interface SimulationData {
  currentHoldings: TokenHolding[];
  fixedPrices: Record<string, number>;
  transactionHistory: Transaction[];
  userBehavior: UserBehavior;
  marketConditions: MarketAnalysis[];
}

export class SandboxWalletIntegration {
  private walletApi: string;
  private sandboxApi: string;
  private wsConnection: WebSocket | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private strategies: SandboxStrategy[] = [];

  constructor(walletApi: string = 'https://defi-tw.netlify.app/api', sandboxApi: string = 'https://defi-tw.netlify.app/api') {
    this.walletApi = walletApi;
    this.sandboxApi = sandboxApi;
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    // Only initialize WebSocket on client side
    if (typeof window !== 'undefined') {
      try {
        this.wsConnection = new WebSocket('wss://defi-tw.netlify.app/api/socketio');
        
        this.wsConnection.onopen = () => {
          console.log('WebSocket connection established for wallet integration');
          this.startRealTimeSync();
        };

        this.wsConnection.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleSandboxUpdate(data);
        };

        this.wsConnection.onerror = (error) => {
          console.error('WebSocket error:', error);
          // Fallback to polling if WebSocket fails
          this.startPollingSync();
        };

        this.wsConnection.onclose = () => {
          console.log('WebSocket connection closed');
          setTimeout(() => this.initializeWebSocket(), 5000);
        };
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        // Fallback to polling
        this.startPollingSync();
      }
    }
  }

  private startRealTimeSync(): void {
    // Only start sync on client side
    if (typeof window !== 'undefined') {
      // Sync wallet state every 5 seconds
      this.syncInterval = setInterval(async () => {
        await this.syncWalletStateToSandbox();
      }, 5000);
    }
  }

  private startPollingSync(): void {
    // Fallback polling mechanism
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      this.syncWalletStateToSandbox();
    }, 5000); // Sync every 5 seconds
    
    console.log('Started polling sync as fallback');
  }

  private handleSandboxUpdate(data: any): void {
    switch (data.type) {
      case 'strategy_update':
        this.strategies = data.strategies;
        this.notifyStrategyUpdate(data.strategies);
        break;
      case 'market_alert':
        this.handleMarketAlert(data.alert);
        break;
      case 'intervention_recommended':
        this.handleInterventionRecommendation(data.recommendation);
        break;
    }
  }

  private notifyStrategyUpdate(strategies: SandboxStrategy[]): void {
    // Emit custom event for UI components (client side only)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('strategiesUpdated', { 
        detail: strategies 
      }));
    }
  }

  private handleMarketAlert(alert: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('marketAlert', { 
        detail: alert 
      }));
    }
  }

  private handleInterventionRecommendation(recommendation: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('interventionRecommended', { 
        detail: recommendation 
      }));
    }
  }

  // Sync wallet state to sandbox for real-time simulation
  async syncWalletStateToSandbox(walletData?: WalletState): Promise<any> {
    try {
      const data = walletData || await this.getCurrentWalletState();
      
      const simulationData: SimulationData = {
        currentHoldings: data.holdings,
        fixedPrices: Object.fromEntries(data.fixedPrices),
        transactionHistory: data.recentTransactions,
        userBehavior: this.analyzeUserPatterns(data),
        marketConditions: await this.getMarketConditions(data.holdings.map(h => h.tokenAddress))
      };

      const response = await fetch(`${this.sandboxApi}/simulate/real-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulationData)
      });

      if (!response.ok) {
        console.warn(`Sandbox API not available (${response.status}), using mock data`);
        // Return mock strategies when API is not available
        this.strategies = this.getMockStrategies();
        this.notifyStrategyUpdate(this.strategies);
        return;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to sync wallet state to sandbox:', error);
      // Use mock strategies as fallback
      this.strategies = this.getMockStrategies();
      this.notifyStrategyUpdate(this.strategies);
    }
  }

  private getMockStrategies(): SandboxStrategy[] {
    return [
      {
        id: 'mock-stable-1',
        name: 'Stable Pool Strategy',
        type: 'stable',
        description: 'Mock stable pool strategy for demonstration',
        expectedYield: 0.05,
        riskLevel: 'low',
        parameters: {
          targetPrice: 1.0,
          rebalanceThreshold: 0.02
        },
        executionTime: Date.now()
      },
      {
        id: 'mock-volatile-1',
        name: 'Volatile Market Strategy',
        type: 'volatile',
        description: 'Mock volatile market strategy for demonstration',
        expectedYield: 0.15,
        riskLevel: 'high',
        parameters: {
          volatilityThreshold: 0.2,
          maxPositionSize: 0.3
        },
        executionTime: Date.now()
      }
    ];
  }

  private async getCurrentWalletState(): Promise<WalletState> {
    try {
      const response = await fetch(`${this.walletApi}/wallet/state`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallet state');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get current wallet state:', error);
      // Return mock data for development
      return this.getMockWalletState();
    }
  }

  private getMockWalletState(): WalletState {
    return {
      holdings: [
        {
          tokenAddress: '0x1234...5678',
          symbol: 'USDT',
          balance: 1000,
          fixedPrice: 1.00,
          marketValue: 1000,
          decimals: 6
        },
        {
          tokenAddress: '0xabcd...efgh',
          symbol: 'BTC',
          balance: 0.05,
          fixedPrice: 45000,
          marketValue: 2250,
          decimals: 8
        }
      ],
      fixedPrices: new Map([
        ['0x1234...5678', 1.00],
        ['0xabcd...efgh', 45000]
      ]),
      recentTransactions: [
        {
          id: 'tx_001',
          type: 'buy',
          tokenAddress: '0xabcd...efgh',
          amount: 0.01,
          price: 45000,
          timestamp: Date.now() - 3600000,
          hash: '0xabc123...'
        }
      ],
      totalValue: 3250,
      lastUpdated: Date.now()
    };
  }

  private analyzeUserPatterns(walletData: WalletState): UserBehavior {
    const transactions = walletData.recentTransactions;
    const now = Date.now();
    
    // Calculate average hold time
    const holdTimes = transactions
      .filter(tx => tx.type === 'buy')
      .map(tx => now - tx.timestamp);
    const avgHoldTime = holdTimes.length > 0 
      ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length 
      : 0;

    // Calculate trading frequency (transactions per day)
    const dayMs = 24 * 60 * 60 * 1000;
    const recentTransactions = transactions.filter(tx => now - tx.timestamp < 7 * dayMs);
    const tradingFrequency = recentTransactions.length / 7;

    // Determine risk tolerance based on holdings diversity
    const uniqueTokens = new Set(walletData.holdings.map(h => h.tokenAddress)).size;
    let riskTolerance: 'low' | 'medium' | 'high' = 'low';
    if (uniqueTokens > 5) riskTolerance = 'high';
    else if (uniqueTokens > 2) riskTolerance = 'medium';

    // Get preferred tokens (most frequently traded)
    const tokenFrequency = transactions.reduce((acc, tx) => {
      acc[tx.tokenAddress] = (acc[tx.tokenAddress] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const preferredTokens = Object.entries(tokenFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([token]) => token);

    return {
      avgHoldTime,
      tradingFrequency,
      riskTolerance,
      preferredTokens,
      lastActivity: transactions.length > 0 ? Math.max(...transactions.map(tx => tx.timestamp)) : now
    };
  }

  private async getMarketConditions(tokenAddresses: string[]): Promise<MarketAnalysis[]> {
    try {
      const response = await fetch(`${this.sandboxApi}/market/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: tokenAddresses })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get market conditions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get market conditions:', error);
      // Return mock data
      return tokenAddresses.map(address => ({
        tokenAddress: address,
        volatility: 0.15,
        trend: 'sideways' as const,
        liquidityDepth: 100000,
        recommendedStabilityAdjustment: 0,
        confidence: 0.8
      }));
    }
  }

  // Get optimized strategies from sandbox
  async getOptimalStrategies(): Promise<SandboxStrategy[]> {
    try {
      const response = await fetch(`${this.sandboxApi}/strategies/optimized`);
      if (!response.ok) {
        console.warn(`Sandbox API not available (${response.status}), using mock strategies`);
        return this.getMockStrategies();
      }
      
      const strategies = await response.json();
      this.strategies = strategies;
      
      // Apply strategies to wallet
      return this.applyStrategiesToWallet(strategies);
    } catch (error) {
      console.error('Failed to get optimal strategies:', error);
      return this.getMockStrategies();
    }
  }

  private getMockStrategies(): SandboxStrategy[] {
    return [
      {
        id: 'strategy_001',
        name: 'BTC-USDT Arbitrage',
        type: 'arbitrage',
        tokenPair: 'BTC/USDT',
        confidenceScore: 0.85,
        expectedProfit: 0.02,
        riskLevel: 'low',
        parameters: {
          minProfitThreshold: 0.01,
          maxSlippage: 0.005
        },
        executionTime: Date.now() + 60000
      },
      {
        id: 'strategy_002',
        name: 'Portfolio Rebalancing',
        type: 'rebalancing',
        tokenPair: 'MULTI',
        confidenceScore: 0.72,
        expectedProfit: 0.015,
        riskLevel: 'medium',
        parameters: {
          targetAllocation: { BTC: 0.4, USDT: 0.6 },
          rebalanceThreshold: 0.1
        },
        executionTime: Date.now() + 300000
      }
    ];
  }

  private async applyStrategiesToWallet(strategies: SandboxStrategy[]): Promise<SandboxStrategy[]> {
    // Filter strategies based on user behavior and risk tolerance
    const walletState = await this.getCurrentWalletState();
    const userBehavior = this.analyzeUserPatterns(walletState);
    
    return strategies.filter(strategy => {
      // Filter by risk tolerance
      if (userBehavior.riskTolerance === 'low' && strategy.riskLevel !== 'low') {
        return false;
      }
      
      // Filter by confidence score
      if (strategy.confidenceScore < 0.7) {
        return false;
      }
      
      // Filter by preferred tokens
      if (strategy.tokenPair !== 'MULTI') {
        const [token1, token2] = strategy.tokenPair.split('/');
        const hasPreferredToken = userBehavior.preferredTokens.some(pref => 
          strategy.tokenPair.includes(pref)
        );
        if (!hasPreferredToken && userBehavior.preferredTokens.length > 0) {
          return false;
        }
      }
      
      return true;
    });
  }

  // Execute a specific strategy
  async executeStrategy(strategyId: string): Promise<boolean> {
    try {
      const strategy = this.strategies.find(s => s.id === strategyId);
      if (!strategy) {
        throw new Error(`Strategy ${strategyId} not found`);
      }

      const response = await fetch(`${this.walletApi}/strategy/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategy)
      });

      if (!response.ok) {
        throw new Error(`Failed to execute strategy: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Notify about execution
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('strategyExecuted', { 
          detail: { strategy, result } 
        }));
      }

      return true;
    } catch (error) {
      console.error('Failed to execute strategy:', error);
      return false;
    }
  }

  // Get real-time market analysis for a specific token
  async getMarketAnalysis(tokenAddress: string): Promise<MarketAnalysis> {
    try {
      const response = await fetch(`${this.sandboxApi}/market/analysis/${tokenAddress}`);
      if (!response.ok) {
        throw new Error('Failed to get market analysis');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get market analysis:', error);
      return {
        tokenAddress,
        volatility: 0.15,
        trend: 'sideways',
        liquidityDepth: 100000,
        recommendedStabilityAdjustment: 0,
        confidence: 0.8
      };
    }
  }

  // Update fixed prices based on sandbox recommendations
  async updateFixedPrices(updates: Record<string, number>): Promise<void> {
    try {
      await fetch(`${this.walletApi}/wallet/fixed-prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: updates })
      });

      // Sync updated state to sandbox
      await this.syncWalletStateToSandbox();
    } catch (error) {
      console.error('Failed to update fixed prices:', error);
    }
  }

  // Cleanup resources
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }
}

// Singleton instance for global access
export const sandboxWalletIntegration = new SandboxWalletIntegration();