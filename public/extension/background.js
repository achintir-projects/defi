// POL Sandbox Background Script
class POLSandboxBackground {
  constructor() {
    this.initialize();
  }

  async initialize() {
    console.log('POL Sandbox Extension initialized');
    
    // Set up message listeners
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Set up web request interception
    this.setupRequestInterception();
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getConfig':
          const config = await this.getConfig();
          sendResponse({ success: true, config });
          break;
          
        case 'setConfig':
          await this.setConfig(request.config);
          sendResponse({ success: true });
          break;
          
        case 'toggleOverride':
          await this.toggleOverride(request.enabled);
          sendResponse({ success: true });
          break;
          
        case 'getPrices':
          const prices = await this.getPrices(request.tokens);
          sendResponse({ success: true, prices });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  setupRequestInterception() {
    // Intercept price API calls
    const priceAPIs = [
      '*://api.coingecko.com/*',
      '*://api.dexscreener.com/*',
      '*://api.cryptocompare.com/*',
      '*://api.trustwallet.com/*',
      '*://api.1inch.io/*',
      '*://api.zapper.fi/*'
    ];

    chrome.webRequest.onBeforeRequest.addListener(
      (details) => {
        // Log intercepted requests for debugging
        console.log('Intercepted price API call:', details.url);
        return { cancel: false };
      },
      { urls: priceAPIs },
      ['requestBody']
    );

    chrome.webRequest.onHeadersReceived.addListener(
      (details) => {
        // Modify response headers if needed
        return { cancel: false };
      },
      { urls: priceAPIs },
      ['responseHeaders']
    );
  }

  async getConfig() {
    const result = await chrome.storage.sync.get({
      enabled: true,
      tokens: ['USDT', 'USDC', 'DAI', 'BUSD'],
      adjustmentFactor: 0.05,
      strategy: 'moderate',
      maxDeviation: 0.1
    });
    return result;
  }

  async setConfig(config) {
    await chrome.storage.sync.set(config);
    
    // Notify all content scripts of the config change
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.url?.startsWith('http')) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'configChanged',
          config: config
        }).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      }
    });
  }

  async toggleOverride(enabled) {
    await chrome.storage.sync.set({ enabled });
    
    // Notify all content scripts
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
      if (tab.url?.startsWith('http')) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleOverride',
          enabled: enabled
        }).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      }
    });
  }

  async getPrices(tokens) {
    // Mock price calculation - in production would call POL API
    const prices = {};
    for (const token of tokens) {
      const basePrice = 1.0; // Base price for stablecoins
      const adjustment = 1 + (Math.random() - 0.5) * 0.1; // ±5% adjustment
      prices[token] = {
        basePrice,
        adjustedPrice: basePrice * adjustment,
        adjustment: adjustment - 1,
        confidence: 0.85 + Math.random() * 0.1,
        timestamp: Date.now()
      };
    }
    return prices;
  }
}

// Initialize the background script
new POLSandboxBackground();