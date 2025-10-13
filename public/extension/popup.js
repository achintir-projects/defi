// POL Sandbox Popup Script
class POLSandboxPopup {
  constructor() {
    this.config = null;
    this.initialize();
  }

  async initialize() {
    console.log('POL Sandbox Popup loaded');
    
    // Load current configuration
    await this.loadConfig();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI
    this.updateUI();
  }

  async loadConfig() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
      if (response.success) {
        this.config = response.config;
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      this.config = {
        enabled: false,
        tokens: ['USDT', 'USDC', 'DAI'],
        adjustmentFactor: 0.05,
        strategy: 'moderate',
        maxDeviation: 0.1
      };
    }
  }

  setupEventListeners() {
    // Toggle switch
    const toggle = document.getElementById('toggle');
    toggle.addEventListener('click', () => this.toggleOverride());
    
    // Save button
    const saveButton = document.getElementById('saveButton');
    saveButton.addEventListener('click', () => this.saveConfig());
  }

  updateUI() {
    if (!this.config) return;
    
    // Update toggle state
    const toggle = document.getElementById('toggle');
    const status = document.getElementById('status');
    
    if (this.config.enabled) {
      toggle.classList.add('active');
      status.textContent = 'Active';
    } else {
      toggle.classList.remove('active');
      status.textContent = 'Inactive';
    }
    
    // Update configuration values
    document.getElementById('adjustmentFactor').value = this.config.adjustmentFactor * 100;
    document.getElementById('strategy').value = this.config.strategy;
    
    // Update token checkboxes
    const tokens = ['USDT', 'USDC', 'DAI', 'BUSD'];
    tokens.forEach(token => {
      const checkbox = document.getElementById(`token-${token}`);
      if (checkbox) {
        checkbox.checked = this.config.tokens.includes(token);
      }
    });
  }

  async toggleOverride() {
    const newState = !this.config.enabled;
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'toggleOverride',
        enabled: newState
      });
      
      if (response.success) {
        this.config.enabled = newState;
        this.updateUI();
        this.showNotification(newState ? 'Price override enabled' : 'Price override disabled');
      }
    } catch (error) {
      console.error('Failed to toggle override:', error);
      this.showNotification('Failed to toggle override', 'error');
    }
  }

  async saveConfig() {
    // Collect form values
    const adjustmentFactor = parseFloat(document.getElementById('adjustmentFactor').value) / 100;
    const strategy = document.getElementById('strategy').value;
    
    // Collect selected tokens
    const tokens = [];
    const tokenCheckboxes = ['USDT', 'USDC', 'DAI', 'BUSD'];
    tokenCheckboxes.forEach(token => {
      const checkbox = document.getElementById(`token-${token}`);
      if (checkbox && checkbox.checked) {
        tokens.push(token);
      }
    });
    
    // Update config
    const newConfig = {
      ...this.config,
      adjustmentFactor,
      strategy,
      tokens,
      maxDeviation: strategy === 'conservative' ? 0.05 : strategy === 'moderate' ? 0.1 : 0.2
    };
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'setConfig',
        config: newConfig
      });
      
      if (response.success) {
        this.config = newConfig;
        this.showNotification('Configuration saved successfully');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      this.showNotification('Failed to save configuration', 'error');
    }
  }

  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      left: 20px;
      background: ${type === 'success' ? '#4ade80' : '#f87171'};
      color: white;
      padding: 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 300);
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new POLSandboxPopup();
});