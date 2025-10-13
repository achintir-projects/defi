'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Code, 
  Copy, 
  CheckCircle, 
  ExternalLink, 
  Terminal, 
  Database, 
  Globe, 
  Shield,
  BookOpen,
  Zap,
  ArrowRight
} from 'lucide-react';
import { walletIntegrationManager } from '@/lib/wallet-specific-integrations';

interface CodeExample {
  title: string;
  description: string;
  language: string;
  code: string;
}

interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  response: any;
}

const CodeBlock: React.FC<{ code: string; language: string; title?: string }> = ({ 
  code, 
  language, 
  title 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code className={`language-${language}`}>{code}</code>
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={copyToClipboard}
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const EndpointCard: React.FC<{ endpoint: APIEndpoint }> = ({ endpoint }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
            {endpoint.method}
          </Badge>
          <code className="bg-muted px-2 py-1 rounded text-sm">{endpoint.path}</code>
        </div>
        <CardDescription>{endpoint.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {endpoint.parameters.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Parameters:</h4>
            <div className="space-y-2">
              {endpoint.parameters.map((param, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <code className="bg-muted px-2 py-1 rounded">{param.name}</code>
                  <Badge variant="outline">{param.type}</Badge>
                  {!param.required && <span className="text-muted-foreground">optional</span>}
                  <span className="text-muted-foreground">{param.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h4 className="font-medium mb-2">Response:</h4>
          <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
            <code>{JSON.stringify(endpoint.response, null, 2)}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export const APIDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const quickStartExamples: CodeExample[] = [
    {
      title: 'Basic Wallet Connection',
      description: 'Connect to any supported wallet',
      language: 'typescript',
      code: `import { universalWalletConnector } from '@/lib/universal-wallet-connector';

// Connect to MetaMask
const connectionState = await universalWalletConnector.connect('metamask');
console.log('Connected account:', connectionState.account);

// Connect to Trust Wallet
const trustConnection = await universalWalletConnector.connect('trustwallet');

// Connect with WalletConnect
const wcConnection = await universalWalletConnector.connect('walletconnect');`
    },
    {
      title: 'Get Portfolio Data',
      description: 'Retrieve wallet portfolio with POL adjustments',
      language: 'typescript',
      code: `import { universalWalletConnector } from '@/lib/universal-wallet-connector';

// Get connected wallet portfolio
const portfolio = await universalWalletConnector.getPortfolio();

console.log('Total Value:', portfolio.totalValue);
console.log('Tokens:', portfolio.tokens);

// Example token data
portfolio.tokens.forEach(token => {
  console.log(\`\${token.symbol}: \${token.balance} (\$\${token.value})\`);
});`
    },
    {
      title: 'Price Influence Strategy',
      description: 'Implement custom price override logic',
      language: 'typescript',
      code: `import { priceOracleProxy } from '@/lib/price-influence-strategies';

// Configure price override
await priceOracleProxy.setPriceOverride({
  enabled: true,
  tokens: ['USDC', 'USDT-ERC20', 'USDT-TRC20', 'DAI'],
  adjustmentFactor: 0.05, // 5% adjustment
  strategy: 'moderate',
  maxDeviation: 0.02 // Max 2% deviation
});

// Get POL-adjusted prices
const tokenAddresses = [
  '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e'
];
const prices = await priceOracleProxy.getTokenPrices(tokenAddresses);

console.log('POL Prices:', prices);`
    }
  ];

  const apiEndpoints: APIEndpoint[] = [
    {
      method: 'GET',
      path: '/api/v1/prices/{address}',
      description: 'Get POL-adjusted price for a specific token',
      parameters: [
        {
          name: 'address',
          type: 'string',
          required: true,
          description: 'Token contract address'
        }
      ],
      response: {
        address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
        symbol: 'USDC',
        basePrice: 1.00,
        polAdjustment: 0.02,
        finalPrice: 1.02,
        confidence: 0.87,
        factors: {
          marketDepth: 2500000,
          volatility: 0.15,
          liquidityScore: 0.92,
          userBehavior: 0.05
        }
      }
    },
    {
      method: 'POST',
      path: '/api/v1/prices/batch',
      description: 'Get POL-adjusted prices for multiple tokens',
      parameters: [
        {
          name: 'addresses',
          type: 'string[]',
          required: true,
          description: 'Array of token contract addresses'
        },
        {
          name: 'strategy',
          type: 'string',
          required: false,
          description: 'Pricing strategy (conservative, moderate, aggressive)'
        }
      ],
      response: {
        '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e': {
          address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
          finalPrice: 1.02,
          confidence: 0.87
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v1/wallet/{address}/portfolio',
      description: 'Get wallet portfolio with POL enhancements',
      parameters: [
        {
          name: 'address',
          type: 'string',
          required: true,
          description: 'Wallet address'
        }
      ],
      response: {
        address: '0x1234567890123456789012345678901234567890',
        totalValue: 5250.75,
        tokens: [
          {
            address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
            symbol: 'USDC',
            balance: '2500.00',
            value: 2550.00,
            polAdjusted: true
          }
        ]
      }
    }
  ];

  const walletIntegrationExamples: CodeExample[] = [
    {
      title: 'MetaMask Integration',
      description: 'Deep MetaMask-specific features',
      language: 'typescript',
      code: `import { MetaMaskIntegration } from '@/lib/wallet-specific-integrations';

const metaMask = new MetaMaskIntegration();

// Add POL network to MetaMask
const networkAdded = await metaMask.addPOLNetwork();

// Switch to POL network
await metaMask.switchToPOLNetwork();

// Suggest POL tokens
const tokens = [
  {
    address: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6
  }
];
const results = await metaMask.suggestPOLTokens(tokens);

// Sign transaction with POL data
const txHash = await metaMask.signPOLTransaction({
  to: '0x...',
  value: '0x16345785d8a0000', // 0.1 ETH
  data: '0x...'
});`
    },
    {
      title: 'Trust Wallet Integration',
      description: 'Mobile-optimized Trust Wallet features',
      language: 'typescript',
      code: `import { TrustWalletIntegration } from '@/lib/wallet-specific-integrations';

const trustWallet = new TrustWalletIntegration();

// Detect Trust Wallet
const isTrust = await trustWallet.detectTrustWallet();

// Open dApp in Trust Wallet mobile
await trustWallet.openInTrustWallet('https://pol-sandbox.com');

// Get enhanced portfolio
const portfolio = await trustWallet.getTrustPortfolio(address);
console.log('POL Enhanced:', portfolio.polEnhanced);

// Add network and tokens
await trustWallet.addTrustNetwork();
await trustWallet.addTrustTokens(tokens);`
    },
    {
      title: 'Coinbase Wallet Integration',
      description: 'Coinbase Wallet SDK integration',
      language: 'typescript',
      code: `import { CoinbaseWalletIntegration } from '@/lib/wallet-specific-integrations';

const coinbase = new CoinbaseWalletIntegration();

// Connect with scoped permissions
const accounts = await coinbase.connectCoinbaseWallet();
await coinbase.requestCoinbaseScopes(['read_accounts', 'write_transactions']);

// Get Coinbase-specific portfolio
const portfolio = await coinbase.getCoinbasePortfolio(address);
console.log('Smart Wallet:', portfolio.coinbaseSpecific.isSmartWallet);

// Sign transaction
const txHash = await coinbase.signCoinbaseTransaction(transaction);`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">POL Sandbox API Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete documentation for integrating with the POL Sandbox Protocol-Owned Liquidity platform
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <a href="#quick-start">
              <BookOpen className="w-4 h-4 mr-2" />
              Quick Start
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="https://github.com/pol-sandbox" target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              GitHub
            </a>
          </Button>
        </div>
      </div>

      {/* Main Documentation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6" />
                What is POL Sandbox?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                POL Sandbox is a Protocol-Owned Liquidity platform that enables developers and users 
                to influence token prices through strategic liquidity management and advanced pricing algorithms.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Universal Wallet Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with MetaMask, Trust Wallet, Coinbase Wallet, and 10+ other wallets
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Database className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Price Influence Strategies</h3>
                    <p className="text-sm text-muted-foreground">
                      Multiple implementation methods from browser extensions to custom RPC endpoints
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Enterprise-Grade Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Built with security best practices and comprehensive audit processes
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Concepts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Protocol-Owned Liquidity (POL)</h3>
                  <p className="text-sm text-muted-foreground">
                    A strategic approach where protocols own and control their liquidity assets 
                    rather than relying on external providers.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Price Influence Mechanisms</h3>
                  <p className="text-sm text-muted-foreground">
                    Various methods to influence token prices, including liquidity depth management, 
                    automated market making, and strategic trading.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Multi-Strategy Approach</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from browser extensions, custom RPC networks, or API proxies 
                    based on your technical requirements and control preferences.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Real-Time Adjustments</h3>
                  <p className="text-sm text-muted-foreground">
                    Dynamic price calculations based on market conditions, user behavior, 
                    and liquidity metrics with confidence scoring.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Start Tab */}
        <TabsContent value="quick-start" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>
                Get up and running with POL Sandbox in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {quickStartExamples.map((example, index) => (
                  <CodeBlock
                    key={index}
                    title={example.title}
                    code={example.code}
                    language={example.language}
                  />
                ))}
              </div>
              
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <strong>Next Steps:</strong> After setting up basic connectivity, 
                  explore the API reference and wallet-specific integrations to unlock advanced features.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>REST API Endpoints</CardTitle>
              <CardDescription>
                Complete API reference for the POL Sandbox platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {apiEndpoints.map((endpoint, index) => (
                <EndpointCard key={index} endpoint={endpoint} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>WebSocket API</CardTitle>
              <CardDescription>
                Real-time price streams and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                title="Real-time Price Stream"
                language="javascript"
                code={`// Connect to WebSocket
const ws = new WebSocket('wss://defi-tw.netlify.app/api/socketio');

// Subscribe to price updates
ws.send(JSON.stringify({
  action: 'subscribe',
  tokens: ['0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e']
}));

// Handle price updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Price Update:', data);
  
  // Example response:
  // {
  //   token: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
  //   price: 1.02,
  //   confidence: 0.87,
  //   timestamp: 1640995200000
  // }
};`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wallet-Specific Integrations</CardTitle>
              <CardDescription>
                Deep integrations with major wallet providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {walletIntegrationExamples.map((example, index) => (
                <CodeBlock
                  key={index}
                  title={example.title}
                  code={example.code}
                  language={example.language}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Features by Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(walletIntegrationManager.getAllSupportedFeatures()).map(([wallet, features]) => (
                  <div key={wallet} className="p-4 border rounded-lg">
                    <h3 className="font-semibold capitalize mb-2">{wallet}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="flex items-center gap-2">
                        {features.watchAsset ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className="text-sm">Watch Asset</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {features.addNetwork ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className="text-sm">Add Network</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {features.signTypedData ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className="text-sm">Typed Data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {features.batchRequests ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className="text-sm">Batch Requests</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Integration Examples</CardTitle>
              <CardDescription>
                Full-featured examples for common use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CodeBlock
                title="Complete dApp Integration"
                language="typescript"
                code={`import React, { useState, useEffect } from 'react';
import { universalWalletConnector } from '@/lib/universal-wallet-connector';
import { priceOracleProxy } from '@/lib/price-influence-strategies';

export function MyDApp() {
  const [connectionState, setConnectionState] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    // Initialize price influence
    priceOracleProxy.setPriceOverride({
      enabled: true,
      tokens: ['USDC', 'USDT-ERC20', 'USDT-TRC20'],
      strategy: 'moderate'
    });

    // Start price streaming
    const stopStream = priceOracleProxy.startPriceStream((newPrices) => {
      setPrices(newPrices);
    });

    return () => stopStream();
  }, []);

  const connectWallet = async (walletType) => {
    try {
      const state = await universalWalletConnector.connect(walletType);
      setConnectionState(state);
      
      const portfolioData = await universalWalletConnector.getPortfolio();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div>
      <h1>My POL-Enhanced dApp</h1>
      {!connectionState ? (
        <button onClick={() => connectWallet('metamask')}>
          Connect MetaMask
        </button>
      ) : (
        <div>
          <p>Connected: {connectionState.account}</p>
          <p>Portfolio Value: \${portfolio?.totalValue}</p>
          <div>
            {Object.entries(prices).map(([address, price]) => (
              <div key={address}>
                {address}: \${price.finalPrice} (Confidence: {price.confidence})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`}
              />

              <CodeBlock
                title="Browser Extension Content Script"
                language="javascript"
                code={`// content.js - POL Sandbox Price Override Extension
class POLPriceOverride {
  constructor() {
    this.POL_API = 'https://api.pol-sandbox.com/v1/prices';
    this.initialize();
  }

  initialize() {
    this.interceptFetch();
    this.interceptXHR();
    this.setupMessageListener();
  }

  interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      
      if (this.isPriceAPI(url)) {
        const response = await originalFetch.call(window, input, init);
        const originalData = await response.clone().json();
        const polData = await this.getPOLPrices(originalData);
        
        return new Response(JSON.stringify(polData), {
          status: response.status,
          headers: response.headers
        });
      }
      
      return originalFetch.call(window, input, init);
    };
  }

  async getPOLPrices(originalData) {
    try {
      // Extract token addresses from original request
      const tokens = this.extractTokens(originalData);
      
      // Get POL-adjusted prices
      const response = await fetch(\`\${this.POL_API}/batch\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: tokens })
      });
      
      const polPrices = await response.json();
      
      // Merge POL prices with original data
      return this.mergePrices(originalData, polPrices);
    } catch (error) {
      console.error('POL price override failed:', error);
      return originalData;
    }
  }

  isPriceAPI(url) {
    const priceAPIs = [
      'api.coingecko.com',
      'api.dexscreener.com',
      'api.cryptocompare.com'
    ];
    return priceAPIs.some(api => url.includes(api));
  }
}

// Initialize the override
new POLPriceOverride();`}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};