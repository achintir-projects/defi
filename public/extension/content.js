// POL Sandbox Content Script
class POLSandboxContent {
  constructor() {
    this.isEnabled = false;
    this.config = null;
    this.originalFetch = window.fetch;
    this.originalXMLHttpRequest = window.XMLHttpRequest;
    this.initialize();
  }

  async initialize() {
    console.log('POL Sandbox Content Script loaded');
    
    // Get current configuration
    await this.loadConfig();
    
    // Set up message listener for background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });

    // Inject price override if enabled
    if (this.isEnabled) {
      this.injectPriceOverride();
    }
  }

  async loadConfig() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
      if (response.success) {
        this.config = response.config;
        this.isEnabled = this.config.enabled;
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'configChanged':
          this.config = request.config;
          this.isEnabled = this.config.enabled;
          if (this.isEnabled) {
            this.injectPriceOverride();
          } else {
            this.removePriceOverride();
          }
          sendResponse({ success: true });
          break;
          
        case 'toggleOverride':
          this.isEnabled = request.enabled;
          if (this.isEnabled) {
            this.injectPriceOverride();
          } else {
            this.removePriceOverride();
          }
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Content script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  injectPriceOverride() {
    console.log('Injecting POL Sandbox price override');
    
    // Override fetch API
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      
      if (this.isPriceAPI(url)) {
        try {
          const response = await this.originalFetch.call(window, input, init);
          const originalData = await response.clone().json();
          const overriddenData = await this.overridePrices(originalData, url);
          
          return new Response(JSON.stringify(overriddenData), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        } catch (error) {
          console.error('Price override failed:', error);
          return this.originalFetch.call(window, input, init);
        }
      }
      
      return this.originalFetch.call(window, input, init);
    };

    // Override XMLHttpRequest
    this.overrideXMLHttpRequest();
  }

  removePriceOverride() {
    console.log('Removing POL Sandbox price override');
    window.fetch = this.originalFetch;
    window.XMLHttpRequest = this.originalXMLHttpRequest;
  }

  overrideXMLHttpRequest() {
    const self = this;
    
    class POLXMLHttpRequest extends window.XMLHttpRequest {
      constructor() {
        super();
        const originalOpen = this.open;
        const originalSend = this.send;
        
        this.open = function(method, url, ...args) {
          this._polUrl = url;
          return originalOpen.call(this, method, url, ...args);
        };
        
        this.send = function(body) {
          if (self.isPriceAPI(this._polUrl)) {
            const originalOnReadyStateChange = this.onreadystatechange;
            
            this.onreadystatechange = function() {
              if (this.readyState === 4 && this.status === 200) {
                try {
                  const originalData = JSON.parse(this.responseText);
                  const overriddenData = self.overridePrices(originalData, this._polUrl);
                  Object.defineProperty(this, 'responseText', {
                    value: JSON.stringify(overriddenData),
                    writable: false
                  });
                } catch (error) {
                  console.error('XHR price override failed:', error);
                }
              }
              
              if (originalOnReadyStateChange) {
                originalOnReadyStateChange.call(this);
              }
            };
          }
          
          return originalSend.call(this, body);
        };
      }
    }
    
    window.XMLHttpRequest = POLXMLHttpRequest;
  }

  isPriceAPI(url) {
    const priceAPIs = [
      'api.coingecko.com',
      'api.dexscreener.com',
      'api.cryptocompare.com',
      'api.trustwallet.com',
      'api.1inch.io',
      'api.zapper.fi',
      'api.uniswap.org',
      'api.sushi.com',
      'api.curve.fi',
      'api.yearn.finance'
    ];
    
    return priceAPIs.some(api => url.includes(api));
  }

  async overridePrices(originalData, url) {
    try {
      if (!this.config || !this.config.tokens.length) {
        return originalData;
      }

      // Handle different API response formats
      if (url.includes('coingecko.com')) {
        return this.overrideCoinGeckoPrices(originalData);
      } else if (url.includes('dexscreener.com')) {
        return this.overrideDexScreenerPrices(originalData);
      } else if (url.includes('cryptocompare.com')) {
        return this.overrideCryptoComparePrices(originalData);
      }
      
      // Generic price override
      return this.overrideGenericPrices(originalData);
    } catch (error) {
      console.error('Price override error:', error);
      return originalData;
    }
  }

  overrideCoinGeckoPrices(data) {
    if (data && typeof data === 'object') {
      // Handle single coin data
      if (data.market_data?.current_price) {
        Object.keys(data.market_data.current_price).forEach(currency => {
          data.market_data.current_price[currency] = this.applyPriceAdjustment(
            data.market_data.current_price[currency]
          );
        });
      }
      
      // Handle coin list
      if (Array.isArray(data)) {
        data.forEach(coin => {
          if (coin.current_price) {
            coin.current_price = this.applyPriceAdjustment(coin.current_price);
          }
        });
      }
    }
    return data;
  }

  overrideDexScreenerPrices(data) {
    if (data && data.pairs && Array.isArray(data.pairs)) {
      data.pairs.forEach(pair => {
        if (pair.priceUsd) {
          pair.priceUsd = this.applyPriceAdjustment(pair.priceUsd);
        }
        if (pair.priceNative) {
          pair.priceNative = this.applyPriceAdjustment(pair.priceNative);
        }
      });
    }
    return data;
  }

  overrideCryptoComparePrices(data) {
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(symbol => {
        if (data[symbol]?.USD) {
          data[symbol].USD = this.applyPriceAdjustment(data[symbol].USD);
        }
      });
    }
    return data;
  }

  overrideGenericPrices(data) {
    // Generic override for unknown API formats
    if (typeof data === 'object' && data !== null) {
      this.traverseAndAdjust(data);
    }
    return data;
  }

  traverseAndAdjust(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.traverseAndAdjust(item));
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'number' && 
            (key.toLowerCase().includes('price') || 
             key.toLowerCase().includes('rate'))) {
          obj[key] = this.applyPriceAdjustment(obj[key]);
        } else if (typeof obj[key] === 'object') {
          this.traverseAndAdjust(obj[key]);
        }
      });
    }
  }

  applyPriceAdjustment(originalPrice) {
    if (!this.isEnabled || !this.config) {
      return originalPrice;
    }

    const adjustment = 1 + (Math.random() - 0.5) * 2 * this.config.adjustmentFactor;
    const maxDeviation = 1 + this.config.maxDeviation;
    const minDeviation = 1 - this.config.maxDeviation;
    
    // Clamp adjustment to max deviation
    const clampedAdjustment = Math.max(minDeviation, Math.min(maxDeviation, adjustment));
    
    return originalPrice * clampedAdjustment;
  }
}

// Initialize the content script
new POLSandboxContent();