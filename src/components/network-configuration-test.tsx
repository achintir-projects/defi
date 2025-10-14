'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  RefreshCw, 
  Wallet,
  Link,
  Shield,
  Zap,
  Info,
  ArrowRight
} from 'lucide-react';
import { networkManager, NetworkConfig } from '@/lib/network-manager';
import { robustNetworkSetup } from '@/lib/robust-network-setup';
import { trustWalletNetworkFix } from '@/lib/trust-wallet-network-fix';

interface WalletTestResult {
  walletType: string;
  detected: boolean;
  provider: any;
  currentNetwork: {
    chainId: string;
    isCorrectNetwork: boolean;
    networkName?: string;
  };
  networkSetupResult?: {
    success: boolean;
    action: 'switched' | 'added' | 'failed';
    error?: string;
  };
  tokenSetupResult?: {
    success: boolean;
    tokensAdded: number;
    errors: string[];
  };
  errors: string[];
}

const NetworkConfigurationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<WalletTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig | null>(null);
  const [validationResults, setValidationResults] = useState<{ isValid: boolean; errors: string[] } | null>(null);

  const supportedWallets = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊' },
    { id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵' },
    { id: 'okx', name: 'OKX Wallet', icon: '⚡' },
    { id: 'phantom', name: 'Phantom', icon: '👻' }
  ];

  useEffect(() => {
    // Load network configuration
    const config = networkManager.getNetworkConfig();
    setNetworkConfig(config);

    // Validate network configuration
    const validation = networkManager.validateNetworkConfig(config);
    setValidationResults(validation);
  }, []);

  const runComprehensiveTest = async () => {
    setIsRunningTests(true);
    const results: WalletTestResult[] = [];

    for (const wallet of supportedWallets) {
      const result = await testWallet(wallet.id, wallet.name);
      results.push(result);
      
      // Small delay between wallet tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  const testWallet = async (walletType: string, walletName: string): Promise<WalletTestResult> => {
    const result: WalletTestResult = {
      walletType,
      detected: false,
      provider: null,
      currentNetwork: {
        chainId: 'unknown',
        isCorrectNetwork: false,
        networkName: 'Unknown'
      },
      errors: []
    };

    try {
      console.log(`🔍 Testing ${walletName}...`);

      // Step 1: Provider Detection
      const provider = networkManager.detectProvider(walletType);
      if (provider) {
        result.detected = true;
        result.provider = provider;
        console.log(`✅ ${walletName} provider detected`);
      } else {
        result.errors.push(`${walletName} provider not detected`);
        console.log(`❌ ${walletName} provider not detected`);
        return result;
      }

      // Step 2: Current Network Check
      try {
        const networkStatus = await networkManager.getCurrentNetwork(provider);
        result.currentNetwork = networkStatus;
        console.log(`📡 ${walletName} current network: ${networkStatus.chainId} (${networkStatus.networkName})`);
      } catch (error) {
        result.errors.push(`Failed to get current network: ${error}`);
        console.error(`❌ ${walletName} network check failed:`, error);
      }

      // Step 3: Network Setup Test
      try {
        const setupResult = await networkManager.setupNetwork(walletType, (message) => {
          console.log(`${walletName} setup: ${message}`);
        });
        result.networkSetupResult = setupResult;
        
        if (setupResult.success) {
          console.log(`✅ ${walletName} network setup successful: ${setupResult.action}`);
        } else {
          result.errors.push(`Network setup failed: ${setupResult.error}`);
          console.error(`❌ ${walletName} network setup failed:`, setupResult.error);
        }
      } catch (error) {
        result.errors.push(`Network setup error: ${error}`);
        console.error(`❌ ${walletName} network setup error:`, error);
      }

      // Step 4: Token Setup Test (only if network setup succeeded)
      if (result.networkSetupResult?.success) {
        try {
          const testToken = {
            address: '0x4585fe77225b41b697c938b018e2ac67ac5a20c0',
            symbol: 'POL',
            decimals: 18,
            name: 'POL Token'
          };

          const tokenResult = await networkManager.addToken(walletType, testToken, (message) => {
            console.log(`${walletName} token: ${message}`);
          });

          result.tokenSetupResult = {
            success: tokenResult.success,
            tokensAdded: tokenResult.success ? 1 : 0,
            errors: tokenResult.error ? [tokenResult.error] : []
          };

          if (tokenResult.success) {
            console.log(`✅ ${walletName} token setup successful`);
          } else {
            console.warn(`⚠️ ${walletName} token setup failed:`, tokenResult.error);
          }
        } catch (error) {
          result.errors.push(`Token setup error: ${error}`);
          console.error(`❌ ${walletName} token setup error:`, error);
        }
      }

    } catch (error) {
      result.errors.push(`Test failed: ${error}`);
      console.error(`❌ ${walletName} test failed:`, error);
    }

    return result;
  };

  const runSingleWalletTest = async (walletType: string) => {
    const wallet = supportedWallets.find(w => w.id === walletType);
    if (!wallet) return;

    setIsRunningTests(true);
    const result = await testWallet(walletType, wallet.name);
    
    setTestResults(prev => {
      const filtered = prev.filter(r => r.walletType !== walletType);
      return [...filtered, result];
    });
    
    setIsRunningTests(false);
  };

  const getWalletStatus = (result: WalletTestResult): {
    status: 'success' | 'warning' | 'error';
    icon: React.ReactNode;
    message: string;
  } => {
    if (!result.detected) {
      return {
        status: 'error',
        icon: <AlertCircle className="w-4 h-4" />,
        message: 'Not detected'
      };
    }

    if (!result.currentNetwork.isCorrectNetwork) {
      return {
        status: 'warning',
        icon: <AlertCircle className="w-4 h-4" />,
        message: 'Wrong network'
      };
    }

    if (result.networkSetupResult?.success) {
      return {
        status: 'success',
        icon: <CheckCircle className="w-4 h-4" />,
        message: 'Configured'
      };
    }

    return {
      status: 'warning',
      icon: <Settings className="w-4 h-4" />,
      message: 'Needs setup'
    };
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Network className="w-6 h-6" />
          Network Configuration Test
        </h2>
        <p className="text-muted-foreground">
          Comprehensive testing of wallet network configurations
        </p>
      </div>

      {/* Network Configuration Display */}
      {networkConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              POL Network Configuration
            </CardTitle>
            <CardDescription>
              Current network settings used across all wallets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Chain ID</div>
                <div className="font-mono text-sm">
                  {networkConfig.chainId} ({networkManager.getChainIdDecimal()})
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Chain Name</div>
                <div className="font-semibold">{networkConfig.chainName}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Native Currency</div>
                <div className="font-semibold">{networkConfig.nativeCurrency.symbol}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">RPC URL</div>
                <div className="text-xs font-mono truncate">{networkConfig.rpcUrls[0]}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Explorer</div>
                <div className="text-xs font-mono truncate">{networkConfig.blockExplorerUrls[0]}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Validation</div>
                <div>
                  {validationResults?.isValid ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {validationResults && !validationResults.isValid && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Configuration Errors:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {validationResults.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Test Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={runComprehensiveTest}
              disabled={isRunningTests}
              className="flex items-center gap-2"
            >
              {isRunningTests ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Run All Tests
                </>
              )}
            </Button>

            {supportedWallets.map(wallet => (
              <Button
                key={wallet.id}
                variant="outline"
                size="sm"
                onClick={() => runSingleWalletTest(wallet.id)}
                disabled={isRunningTests}
              >
                {wallet.icon} {wallet.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Test Results
            </CardTitle>
            <CardDescription>
              Results from wallet network configuration tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map(result => {
                const wallet = supportedWallets.find(w => w.id === result.walletType);
                const status = getWalletStatus(result);

                return (
                  <Card key={result.walletType} className={`border-l-4 ${
                    status.status === 'success' ? 'border-l-green-500' :
                    status.status === 'warning' ? 'border-l-yellow-500' :
                    'border-l-red-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{wallet?.icon}</span>
                          <h3 className="font-semibold">{wallet?.name}</h3>
                          <Badge variant={status.status === 'success' ? 'default' : 'secondary'}>
                            {status.icon}
                            {status.message}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground">Provider Detection</div>
                          <div className={result.detected ? 'text-green-600' : 'text-red-600'}>
                            {result.detected ? '✅ Detected' : '❌ Not detected'}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-muted-foreground">Current Network</div>
                          <div className="font-mono">
                            {result.currentNetwork.chainId} 
                            {result.currentNetwork.networkName && ` (${result.currentNetwork.networkName})`}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-muted-foreground">Network Setup</div>
                          <div>
                            {result.networkSetupResult ? (
                              result.networkSetupResult.success ? (
                                <span className="text-green-600">
                                  ✅ {result.networkSetupResult.action}
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  ❌ {result.networkSetupResult.error}
                                </span>
                              )
                            ) : (
                              <span className="text-muted-foreground">Not tested</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-muted-foreground">Token Setup</div>
                          <div>
                            {result.tokenSetupResult ? (
                              result.tokenSetupResult.success ? (
                                <span className="text-green-600">
                                  ✅ {result.tokenSetupResult.tokensAdded} token(s)
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  ❌ {result.tokenSetupResult.errors.join(', ')}
                                </span>
                              )
                            ) : (
                              <span className="text-muted-foreground">Not tested</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {result.errors.length > 0 && (
                        <Alert className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Errors:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {result.errors.map((error, index) => (
                                <li key={index} className="text-sm">{error}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Setup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Manual Setup
          </CardTitle>
          <CardDescription>
            Manually trigger network setup for specific wallets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {supportedWallets.map(wallet => (
                <Button
                  key={wallet.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWallet(wallet.id)}
                  className={selectedWallet === wallet.id ? 'bg-primary text-primary-foreground' : ''}
                >
                  {wallet.icon} {wallet.name}
                </Button>
              ))}
            </div>

            {selectedWallet && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={() => networkManager.setupNetwork(selectedWallet, console.log)}
                    className="flex items-center gap-2"
                  >
                    <Link className="w-4 h-4" />
                    Setup Network
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => networkManager.completeSetup(selectedWallet, console.log)}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Complete Setup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkConfigurationTest;