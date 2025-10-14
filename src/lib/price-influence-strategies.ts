// Price Oracle Proxy for POL Sandbox
export interface PriceData {
  symbol: string;
  address: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  lastUpdated: number;
}

export interface POLPriceModel {
  basePrice: number;
  polAdjustment: number;
  finalPrice: number;
  confidence: number;
  factors: {
    marketDepth: number;
    volatility: number;
    liquidityScore: number;
    userBehavior: number;
  };
}

export interface PriceOverrideConfig {
  enabled: boolean;
  tokens: string[];
  adjustmentFactor: number;
  strategy: 'conservative' | 'moderate' | 'aggressive';
  maxDeviation: number;
}

class PriceOracleProxy {
  private readonly UPSTREAM_ORACLES = [
    {
      name: 'CoinGecko',
      baseUrl: 'https://api.coingecko.com/api/v3',
      priority: 1
    },
    {
      name: 'CryptoCompare',
      baseUrl: 'https://min-api.cryptocompare.com/data',
      priority: 2
    },
    {
      name: 'DexScreener',
      baseUrl: 'https://api.dexscreener.com/latest/dex',
      priority: 3
    }
  ];

  private readonly POL_TOKENS = [
    'USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FRAX', 'LUSD', 'MIM'
  ];

  private cache: Map<string, { data: PriceData; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30000; // 30 seconds

  async getTokenPrices(tokenAddresses: string[]): Promise<Record<string, POLPriceModel>> {
    const results: Record<string, POLPriceModel> = {};

    try {
      // Get prices from multiple sources
      const [coingeckoPrices, cryptocomparePrices, dexscreenerPrices] = 
        await Promise.allSettled([
          this.fetchCoinGeckoPrices(tokenAddresses),
          this.fetchCryptoComparePrices(tokenAddresses),
          this.fetchDexScreenerPrices(tokenAddresses)
        ]);

      const marketPrices = {
        coingecko: coingeckoPrices.status === 'fulfilled' ? coingeckoPrices.value : {},
        cryptocompare: cryptocomparePrices.status === 'fulfilled' ? cryptocomparePrices.value : {},
        dexscreener: dexscreenerPrices.status === 'fulfilled' ? dexscreenerPrices.value : {}
      };

      // Apply POL sandbox price calculations
      for (const address of tokenAddresses) {
        const polModel = await this.applyPOLPriceModel(address, marketPrices);
        results[address] = polModel;
      }

      return results;
    } catch (error) {
      console.error('Failed to get token prices:', error);
      return this.getFallbackPrices(tokenAddresses);
    }
  }

  private async applyPOLPriceModel(
    tokenAddress: string, 
    marketPrices: Record<string, any>
  ): Promise<POLPriceModel> {
    const marketAvg = this.calculateMarketAverage(marketPrices, tokenAddress);
    const polAdjustedPrice = await this.calculatePOLAdjustedPrice(tokenAddress, marketAvg);

    return {
      basePrice: marketAvg,
      polAdjustment: polAdjustedPrice.adjustment,
      finalPrice: polAdjustedPrice.price,
      confidence: polAdjustedPrice.confidence,
      factors: {
        marketDepth: polAdjustedPrice.marketDepth,
        volatility: polAdjustedPrice.volatility,
        liquidityScore: polAdjustedPrice.liquidityScore,
        userBehavior: polAdjustedPrice.userBehavior
      }
    };
  }

  private calculateMarketAverage(marketPrices: Record<string, any>, tokenAddress: string): number {
    const prices: number[] = [];
    
    Object.values(marketPrices).forEach(source => {
      if (source[tokenAddress]) {
        prices.push(source[tokenAddress].price);
      }
    });

    if (prices.length === 0) {
      return 1.0; // Default to $1 for stablecoins
    }

    // Weighted average based on source priority
    const weights = [0.5, 0.3, 0.2]; // CoinGecko, CryptoCompare, DexScreener
    return prices.reduce((sum, price, index) => sum + price * weights[index], 0);
  }

  private async calculatePOLAdjustedPrice(
    tokenAddress: string, 
    marketPrice: number
  ): Promise<{
    price: number;
    adjustment: number;
    confidence: number;
    marketDepth: number;
    volatility: number;
    liquidityScore: number;
    userBehavior: number;
  }> {
    // POL Sandbox pricing algorithm
    const marketDepth = await this.getMarketDepth(tokenAddress);
    const volatility = await this.getVolatility(tokenAddress);
    const liquidityScore = await this.getLiquidityScore(tokenAddress);
    const userBehavior = await this.getUserBehaviorScore(tokenAddress);

    // Calculate adjustment factors
    const depthFactor = Math.max(0.1, Math.min(2.0, 1.0 / (1.0 + marketDepth / 1000000)));
    const volatilityFactor = Math.max(0.8, Math.min(1.2, 1.0 + volatility * 0.1));
    const liquidityFactor = Math.max(0.9, Math.min(1.1, 1.0 + liquidityScore * 0.05));
    const behaviorFactor = Math.max(0.95, Math.min(1.05, 1.0 + userBehavior * 0.02));

    // Combined adjustment
    const totalAdjustment = depthFactor * volatilityFactor * liquidityFactor * behaviorFactor;
    const adjustedPrice = marketPrice * totalAdjustment;

    // Calculate confidence based on data quality
    const confidence = Math.min(0.95, 
      (1.0 - volatility) * 0.4 + 
      liquidityScore * 0.3 + 
      (1.0 - Math.abs(totalAdjustment - 1.0)) * 0.3
    );

    return {
      price: adjustedPrice,
      adjustment: totalAdjustment - 1.0,
      confidence,
      marketDepth,
      volatility,
      liquidityScore,
      userBehavior
    };
  }

  private async fetchCoinGeckoPrices(tokenAddresses: string[]): Promise<Record<string, PriceData>> {
    try {
      // Mock implementation - would use real CoinGecko API
      const prices: Record<string, PriceData> = {};
      
      for (const address of tokenAddresses) {
        prices[address] = {
          symbol: 'USDC',
          address,
          price: 1.00 + Math.random() * 0.01,
          marketCap: 50000000000,
          volume24h: 1000000000,
          change24h: (Math.random() - 0.5) * 2,
          lastUpdated: Date.now()
        };
      }
      
      return prices;
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return {};
    }
  }

  private async fetchCryptoComparePrices(tokenAddresses: string[]): Promise<Record<string, PriceData>> {
    try {
      // Mock implementation
      const prices: Record<string, PriceData> = {};
      
      for (const address of tokenAddresses) {
        prices[address] = {
          symbol: 'USDC',
          address,
          price: 1.00 + Math.random() * 0.01,
          marketCap: 48000000000,
          volume24h: 950000000,
          change24h: (Math.random() - 0.5) * 2,
          lastUpdated: Date.now()
        };
      }
      
      return prices;
    } catch (error) {
      console.error('CryptoCompare API error:', error);
      return {};
    }
  }

  private async fetchDexScreenerPrices(tokenAddresses: string[]): Promise<Record<string, PriceData>> {
    try {
      // Mock implementation
      const prices: Record<string, PriceData> = {};
      
      for (const address of tokenAddresses) {
        prices[address] = {
          symbol: 'USDC',
          address,
          price: 1.00 + Math.random() * 0.01,
          marketCap: 49000000000,
          volume24h: 980000000,
          change24h: (Math.random() - 0.5) * 2,
          lastUpdated: Date.now()
        };
      }
      
      return prices;
    } catch (error) {
      console.error('DexScreener API error:', error);
      return {};
    }
  }

  private async getMarketDepth(tokenAddress: string): Promise<number> {
    // Mock market depth calculation
    return Math.random() * 5000000; // $0-5M depth
  }

  private async getVolatility(tokenAddress: string): Promise<number> {
    // Mock volatility calculation (0-1, where 1 is highest volatility)
    return Math.random() * 0.3; // 0-30% daily volatility
  }

  private async getLiquidityScore(tokenAddress: string): Promise<number> {
    // Mock liquidity score (0-1, where 1 is highest liquidity)
    return 0.5 + Math.random() * 0.5; // 0.5-1.0 score
  }

  private async getUserBehaviorScore(tokenAddress: string): Promise<number> {
    // Mock user behavior score based on POL sandbox data
    return Math.random() * 2 - 1; // -1 to 1
  }

  private getFallbackPrices(tokenAddresses: string[]): Record<string, POLPriceModel> {
    const fallback: Record<string, POLPriceModel> = {};
    
    for (const address of tokenAddresses) {
      fallback[address] = {
        basePrice: 1.00,
        polAdjustment: 0.0,
        finalPrice: 1.00,
        confidence: 0.5,
        factors: {
          marketDepth: 1000000,
          volatility: 0.1,
          liquidityScore: 0.8,
          userBehavior: 0.0
        }
      };
    }
    
    return fallback;
  }

  // Price override configuration
  async setPriceOverride(config: PriceOverrideConfig): Promise<void> {
    // Store configuration for use in price calculations
    localStorage.setItem('pol-price-override', JSON.stringify(config));
  }

  async getPriceOverride(): Promise<PriceOverrideConfig> {
    try {
      const stored = localStorage.getItem('pol-price-override');
      return stored ? JSON.parse(stored) : {
        enabled: false,
        tokens: [],
        adjustmentFactor: 0.0,
        strategy: 'moderate',
        maxDeviation: 0.05
      };
    } catch {
      return {
        enabled: false,
        tokens: [],
        adjustmentFactor: 0.0,
        strategy: 'moderate',
        maxDeviation: 0.05
      };
    }
  }

  // Real-time price streaming
  startPriceStream(callback: (prices: Record<string, POLPriceModel>) => void): () => void {
    const interval = setInterval(async () => {
      try {
        const tokens = await this.getWatchedTokens();
        const prices = await this.getTokenPrices(tokens);
        callback(prices);
      } catch (error) {
        console.error('Price stream error:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }

  private async getWatchedTokens(): Promise<string[]> {
    // Get tokens from connected wallets and POL strategies
    const config = await this.getPriceOverride();
    return config.tokens;
  }
}

// Custom RPC Endpoint for POL Price Oracle
export class POLRpcEndpoint {
  private polSandbox: any;
  private readonly POL_CHAIN_ID = 9191;

  constructor(polSandbox: any) {
    this.polSandbox = polSandbox;
  }

  async handleRequest(method: string, params: any[]): Promise<any> {
    switch (method) {
      case 'eth_call':
        return this.handleEthCall(params);
      case 'eth_getBalance':
        return this.handleEthGetBalance(params);
      case 'pol_getPrice':
        return this.handlePolGetPrice(params);
      case 'pol_getBatchPrices':
        return this.handlePolGetBatchPrices(params);
      case 'pol_setPriceOverride':
        return this.handlePolSetPriceOverride(params);
      default:
        throw new Error(`Method ${method} not supported`);
    }
  }

  private async handleEthCall(params: any[]): Promise<string> {
    const [transaction, block] = params;
    
    // Intercept price oracle calls
    if (this.isPriceOracleCall(transaction)) {
      return this.overrideOracleResponse(transaction);
    }
    
    // Forward to standard RPC
    return await this.forwardToStandardRPC('eth_call', params);
  }

  private async handleEthGetBalance(params: any[]): Promise<string> {
    const [address, block] = params;
    // Mock balance with POL adjustments
    return '0x56BC75E2D630E8000'; // 100 ETH in hex
  }

  private async handlePolGetPrice(params: any[]): Promise<POLPriceModel> {
    const [tokenAddress] = params;
    return await this.polSandbox.calculateTokenPrice(tokenAddress);
  }

  private async handlePolGetBatchPrices(params: any[]): Promise<Record<string, POLPriceModel>> {
    const [tokenAddresses] = params;
    const results: Record<string, POLPriceModel> = {};
    
    for (const address of tokenAddresses) {
      results[address] = await this.polSandbox.calculateTokenPrice(address);
    }
    
    return results;
  }

  private async handlePolSetPriceOverride(params: any[]): Promise<boolean> {
    const [config] = params;
    await this.polSandbox.setPriceOverride(config);
    return true;
  }

  private isPriceOracleCall(transaction: any): boolean {
    // Check if transaction is calling a known price oracle
    const priceOracles = [
      '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', // Chainlink ETH/USD
      '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e', // Mock USDC oracle
    ];
    
    return priceOracles.includes(transaction.to.toLowerCase());
  }

  private async overrideOracleResponse(transaction: any): Promise<string> {
    // Return POL-adjusted price in the format expected by the oracle
    const tokenAddress = transaction.to;
    const polPrice = await this.polSandbox.calculateTokenPrice(tokenAddress);
    
    // Convert price to oracle format ( Chainlink uses 8 decimals )
    const priceInWei = Math.floor(polPrice.finalPrice * 1e8);
    return '0x' + priceInWei.toString(16);
  }

  private async forwardToStandardRPC(method: string, params: any[]): Promise<any> {
    // Forward to actual Ethereum RPC
    // This would connect to a real Ethereum node in production
    console.log(`Forwarding ${method} to standard RPC:`, params);
    return '0x0';
  }

  getRpcConfig() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://defi-tw.netlify.app';
    return {
      networkName: "Ethereum",
      rpcUrl: `${baseUrl}/api/rpc`,
      chainId: this.POL_CHAIN_ID,
      symbol: "ETH",
      blockExplorer: `${baseUrl}/explorer`,
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18
      }
    };
  }
}

// Browser Extension Price Override
export class PriceOverrideExtension {
  private POL_SANDBOX_API: string;
  private OVERRIDE_TOKENS = ['USDT', 'USDC', 'DAI', 'POL_TOKEN'];
  private isEnabled = false;
  private originalFetch: typeof fetch | null = null;

  constructor() {
    this.POL_SANDBOX_API = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://defi-tw.netlify.app'}/api/prices`;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Check if extension is enabled
    const config = await this.getExtensionConfig();
    this.isEnabled = config.enabled;

    if (this.isEnabled) {
      this.injectPriceOverride();
      this.setupMessageListener();
    }
  }

  private injectPriceOverride(): void {
    if (!this.originalFetch) {
      this.originalFetch = window.fetch;
    }

    // Intercept price API calls
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      
      if (this.isPriceAPI(url)) {
        const response = await this.originalFetch!.call(window, input, init);
        const originalData = await response.clone().json();
        const overriddenData = await this.overridePrices(originalData);
        
        return new Response(JSON.stringify(overriddenData), {
          status: response.status,
          headers: response.headers
        });
      }
      
      return this.originalFetch!.call(window, input, init);
    };
  }

  private setupMessageListener(): void {
    // Listen for messages from extension popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'togglePriceOverride') {
        this.togglePriceOverride(request.enabled);
        sendResponse({ success: true });
      } else if (request.action === 'getConfig') {
        this.getExtensionConfig().then(config => {
          sendResponse(config);
        });
        return true; // Keep message channel open for async response
      }
    });
  }

  private isPriceAPI(url: string): boolean {
    const priceAPIs = [
      'api.coingecko.com',
      'api.dexscreener.com',
      'api.trustwallet.com',
      'api.cryptocompare.com',
      'api.1inch.io',
      'api.zapper.fi'
    ];
    
    return priceAPIs.some(api => url.includes(api));
  }

  private async overridePrices(originalData: any): Promise<any> {
    try {
      // Get POL-calculated prices
      const polPrices = await this.fetchPOLPrices();
      
      if (Array.isArray(originalData)) {
        return originalData.map(item => this.overrideItemPrice(item, polPrices));
      } else if (originalData.data && Array.isArray(originalData.data)) {
        return {
          ...originalData,
          data: originalData.data.map(item => this.overrideItemPrice(item, polPrices))
        };
      }
      
      return originalData;
    } catch (error) {
      console.error('Failed to override prices:', error);
      return originalData;
    }
  }

  private overrideItemPrice(item: any, polPrices: Record<string, number>): any {
    const symbol = item.symbol || item.id || item.coin_id;
    if (symbol && polPrices[symbol.toUpperCase()]) {
      return {
        ...item,
        current_price: polPrices[symbol.toUpperCase()],
        price: polPrices[symbol.toUpperCase()],
        // Preserve original price for reference
        original_price: item.current_price || item.price,
        pol_override: true
      };
    }
    return item;
  }

  private async fetchPOLPrices(): Promise<Record<string, number>> {
    try {
      const response = await fetch(this.POL_SANDBOX_API);
      const data = await response.json();
      return data.prices || {};
    } catch (error) {
      console.error('Failed to fetch POL prices:', error);
      return {};
    }
  }

  private async getExtensionConfig(): Promise<{ enabled: boolean; tokens: string[] }> {
    try {
      const result = await chrome.storage.sync.get(['priceOverrideEnabled', 'overrideTokens']);
      return {
        enabled: result.priceOverrideEnabled || false,
        tokens: result.overrideTokens || this.OVERRIDE_TOKENS
      };
    } catch {
      return { enabled: false, tokens: this.OVERRIDE_TOKENS };
    }
  }

  async togglePriceOverride(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    
    try {
      await chrome.storage.sync.set({ priceOverrideEnabled: enabled });
      
      if (enabled) {
        this.injectPriceOverride();
      } else if (this.originalFetch) {
        window.fetch = this.originalFetch;
      }
    } catch (error) {
      console.error('Failed to toggle price override:', error);
    }
  }

  // Extension manifest generation
  static getManifest() {
    return {
      manifest_version: 3,
      name: "POL Sandbox Price Override",
      version: "1.0.0",
      description: "Override price APIs with POL Sandbox calculated prices",
      permissions: [
        "activeTab", 
        "storage", 
        "webRequest",
        "declarativeNetRequest"
      ],
      host_permissions: [
        "https://api.coingecko.com/*",
        "https://api.dexscreener.com/*",
        "https://api.trustwallet.com/*",
        "https://api.cryptocompare.com/*"
      ],
      content_scripts: [{
        matches: ["<all_urls>"],
        js: ["content.js"],
        run_at: "document_start",
        all_frames: true
      }],
      background: {
        service_worker: "background.js"
      },
      action: {
        default_popup: "popup.html",
        default_title: "POL Sandbox Price Override"
      },
      icons: {
        16: "icons/icon16.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png"
      }
    };
  }
}

// Global instances
export const priceOracleProxy = new PriceOracleProxy();
export const polRpcEndpoint = new POLRpcEndpoint(priceOracleProxy);
export const priceOverrideExtension = new PriceOverrideExtension();