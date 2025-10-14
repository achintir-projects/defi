'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Globe, 
  Shield, 
  Zap,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';

// Ensure we're on client side
const isClient = typeof window !== 'undefined';

interface SettingsConfig {
  // General Settings
  systemEnabled: boolean;
  autoStart: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  // Price Override Settings
  priceOverrideEnabled: boolean;
  adjustmentFactor: number;
  strategy: 'conservative' | 'moderate' | 'aggressive';
  maxDeviation: number;
  targetTokens: string[];
  
  // RPC Settings
  customRpcEnabled: boolean;
  rpcUrl: string;
  chainId: number;
  
  // API Settings
  apiKey: string;
  apiEndpoint: string;
  webhookUrl: string;
  
  // Extension Settings
  extensionEnabled: boolean;
  autoInject: boolean;
  overrideApis: string[];
}

const defaultConfig: SettingsConfig = {
  systemEnabled: true,
  autoStart: false,
  logLevel: 'info',
  priceOverrideEnabled: false,
  adjustmentFactor: 0.05,
  strategy: 'moderate',
  maxDeviation: 0.1,
  targetTokens: ['USDT-ERC20', 'USDT-TRC20', 'USDC', 'DAI'],
  customRpcEnabled: false,
  rpcUrl: 'https://defi-tw.netlify.app/api/rpc',
  chainId: 9191,
  apiKey: '',
  apiEndpoint: 'https://defi-tw.netlify.app/api',
  webhookUrl: '',
  extensionEnabled: false,
  autoInject: true,
  overrideApis: ['coingecko', 'dexscreener', 'cryptocompare']
};

const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<SettingsConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!isClient) return;
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!isClient) return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        // Store debug info and remove it from config
        if (data._debug) {
          setDebugInfo(data._debug);
          delete data._debug;
        }
        setConfig({ ...defaultConfig, ...data });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!isClient) return;
    try {
      setSaveStatus('saving');
      setErrorMessage('');
      setDebugInfo(null);
      
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSaveStatus('saved');
        // Store debug info
        if (data._debug) {
          setDebugInfo(data._debug);
        }
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setErrorMessage(data.error || 'Failed to save settings');
        if (data._debug) {
          setDebugInfo(data._debug);
        }
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setErrorMessage('Network error. Please check your connection.');
    }
  };

  const resetSettings = () => {
    if (!isClient) return;
    setConfig(defaultConfig);
    setSaveStatus('idle');
  };

  const testConnection = async (type: string) => {
    if (!isClient) return;
    try {
      let url = '';
      switch (type) {
        case 'rpc':
          url = config.rpcUrl;
          break;
        case 'api':
          url = `${config.apiEndpoint}/health`;
          break;
        case 'webhook':
          if (!config.webhookUrl) return;
          url = config.webhookUrl;
          break;
      }

      const response = await fetch(url);
      setTestResults(prev => ({ ...prev, [type]: response.ok }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [type]: false }));
    }
  };

  const copyToClipboard = (text: string) => {
    if (!isClient) return;
    navigator.clipboard.writeText(text);
  };

  const updateConfig = (key: keyof SettingsConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your POL Sandbox environment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus === 'saved' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div>
              <p className="font-medium">{errorMessage || 'Failed to save settings. Please try again.'}</p>
              {debugInfo && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">Debug Information</summary>
                  <pre className="text-xs mt-2 bg-black/10 p-2 rounded overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="prices">Price Override</TabsTrigger>
          <TabsTrigger value="rpc">RPC Network</TabsTrigger>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="extension">Extension</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Basic system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable POL Sandbox</Label>
                  <p className="text-sm text-muted-foreground">
                    Master switch for the entire system
                  </p>
                </div>
                <Switch
                  checked={config.systemEnabled}
                  onCheckedChange={(checked) => updateConfig('systemEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-start System</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically start POL Sandbox on page load
                  </p>
                </div>
                <Switch
                  checked={config.autoStart}
                  onCheckedChange={(checked) => updateConfig('autoStart', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Log Level</Label>
                <Select 
                  value={config.logLevel} 
                  onValueChange={(value: any) => updateConfig('logLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Override Settings */}
        <TabsContent value="prices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Price Override Configuration</CardTitle>
              <CardDescription>
                Configure how prices are adjusted by POL Sandbox
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Price Override</Label>
                  <p className="text-sm text-muted-foreground">
                    Override prices in connected applications
                  </p>
                </div>
                <Switch
                  checked={config.priceOverrideEnabled}
                  onCheckedChange={(checked) => updateConfig('priceOverrideEnabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Adjustment Factor: {(config.adjustmentFactor * 100).toFixed(1)}%</Label>
                <Slider
                  value={[config.adjustmentFactor * 100]}
                  onValueChange={([value]) => updateConfig('adjustmentFactor', value / 100)}
                  max={20}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum price adjustment percentage
                </p>
              </div>

              <div className="space-y-2">
                <Label>Strategy</Label>
                <Select 
                  value={config.strategy} 
                  onValueChange={(value: any) => updateConfig('strategy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative (±5%)</SelectItem>
                    <SelectItem value="moderate">Moderate (±10%)</SelectItem>
                    <SelectItem value="aggressive">Aggressive (±20%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Tokens</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['USDT-ERC20', 'USDT-TRC20', 'USDC', 'DAI', 'BUSD', 'FRAX', 'LUSD'].map(token => (
                    <div key={token} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`token-${token}`}
                        checked={config.targetTokens.includes(token)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateConfig('targetTokens', [...config.targetTokens, token]);
                          } else {
                            updateConfig('targetTokens', config.targetTokens.filter(t => t !== token));
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`token-${token}`}>{token}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RPC Settings */}
        <TabsContent value="rpc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RPC Network Configuration</CardTitle>
              <CardDescription>
                Configure the custom RPC endpoint for price overrides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Custom RPC</Label>
                  <p className="text-sm text-muted-foreground">
                    Use custom RPC endpoint for blockchain interactions
                  </p>
                </div>
                <Switch
                  checked={config.customRpcEnabled}
                  onCheckedChange={(checked) => updateConfig('customRpcEnabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>RPC URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.rpcUrl}
                    onChange={(e) => updateConfig('rpcUrl', e.target.value)}
                    placeholder="https://defi-tw.netlify.app/api/rpc"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => testConnection('rpc')}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                {testResults.rpc !== undefined && (
                  <Badge variant={testResults.rpc ? 'default' : 'destructive'}>
                    {testResults.rpc ? 'Connected' : 'Failed'}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Chain ID</Label>
                <Input
                  type="number"
                  value={config.chainId}
                  onChange={(e) => updateConfig('chainId', parseInt(e.target.value))}
                  placeholder="9191"
                />
              </div>

              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Custom RPC allows POL Sandbox to intercept price oracle calls and return adjusted prices.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure API endpoints and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.apiEndpoint}
                    onChange={(e) => updateConfig('apiEndpoint', e.target.value)}
                    placeholder="https://defi-tw.netlify.app/api"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => testConnection('api')}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                {testResults.api !== undefined && (
                  <Badge variant={testResults.api ? 'default' : 'destructive'}>
                    {testResults.api ? 'Connected' : 'Failed'}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => updateConfig('apiKey', e.target.value)}
                  placeholder="Enter your API key"
                />
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.webhookUrl}
                    onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                    placeholder="https://your-webhook-url.com"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => testConnection('webhook')}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                {testResults.webhook !== undefined && (
                  <Badge variant={testResults.webhook ? 'default' : 'destructive'}>
                    {testResults.webhook ? 'Connected' : 'Failed'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extension Settings */}
        <TabsContent value="extension" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Browser Extension</CardTitle>
              <CardDescription>
                Configure browser extension behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Extension</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable browser extension for price overrides
                  </p>
                </div>
                <Switch
                  checked={config.extensionEnabled}
                  onCheckedChange={(checked) => updateConfig('extensionEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-inject</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically inject price override scripts
                  </p>
                </div>
                <Switch
                  checked={config.autoInject}
                  onCheckedChange={(checked) => updateConfig('autoInject', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Override APIs</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { api: 'coingecko', desc: 'Primary price data source' },
                    { api: 'dexscreener', desc: 'DEX price aggregations' },
                    { api: 'cryptocompare', desc: 'Market data provider' },
                    { api: 'trustwallet', desc: 'Trust Wallet dApp browser & swaps' },
                    { api: '1inch', desc: 'DEX aggregator prices' }
                  ].map(({ api, desc }) => (
                    <div key={api} className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id={`api-${api}`}
                        checked={config.overrideApis.includes(api)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateConfig('overrideApis', [...config.overrideApis, api]);
                          } else {
                            updateConfig('overrideApis', config.overrideApis.filter(a => a !== api));
                          }
                        }}
                        className="rounded mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={`api-${api}`} className="font-medium">
                          {api.charAt(0).toUpperCase() + api.slice(1)}
                        </Label>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                        {api === 'trustwallet' && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              <strong>Trust Wallet users:</strong> Enable this to override prices in Trust Wallet's 
                              built-in dApp browser, swap interface, and portfolio valuations for consistent POL adjustments.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Extension settings require browser restart to take effect.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;