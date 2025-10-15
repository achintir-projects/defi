'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  FlaskConical,
  AlertTriangle,
  Lightbulb,
  TestTube,
  Copy,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import QRCodeGenerator from './qr-code-generator';
import { 
  AdvancedQRResearch, 
  ExperimentalQRImplementation,
  WalletQRMethod 
} from '@/lib/advanced-qr-research';
import { POL_SANDBOX_CONFIG } from '@/lib/realistic-network-config';

interface ExperimentalQRSetupProps {
  onMethodTested?: (method: string, result: boolean) => void;
}

export default function ExperimentalQRSetup({ onMethodTested }: ExperimentalQRSetupProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('walletconnect');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [showExperimental, setShowExperimental] = useState(false);

  // Get all QR methods
  const allMethods = AdvancedQRResearch.getAllQRMethods();
  const testQRs = AdvancedQRResearch.createTestQRs(POL_SANDBOX_CONFIG);
  const hybridSystem = ExperimentalQRImplementation.createHybridSystem(POL_SANDBOX_CONFIG);

  // Group methods by viability
  const promisingMethods = allMethods.filter(m => m.viability === 'medium' || m.viability === 'high');
  const experimentalMethods = allMethods.filter(m => m.viability === 'low' || m.viability === 'experimental');

  const testMethod = async (method: string) => {
    // In a real implementation, this would guide users through testing
    const result = await ExperimentalQRImplementation.testQRMethod(
      testQRs[method]?.qr || '', 
      method
    );
    
    setTestResults(prev => ({ ...prev, [method]: result.works }));
    
    if (onMethodTested) {
      onMethodTested(method, result.works);
    }
  };

  const getViabilityColor = (viability: string) => {
    switch (viability) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'experimental': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getViabilityIcon = (viability: string) => {
    switch (viability) {
      case 'high': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Lightbulb className="h-4 w-4" />;
      case 'low': return <AlertTriangle className="h-4 w-4" />;
      case 'experimental': return <FlaskConical className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FlaskConical className="h-6 w-6" />
          Experimental QR Research
        </h2>
        <p className="text-muted-foreground">
          Testing advanced QR methods that might work with wallet app logic
        </p>
      </div>

      {/* Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Experimental Research:</strong> These QR methods are theoretical and may not work with current wallet versions. 
          Help us test by scanning these codes with your wallet apps!
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs defaultValue="promising" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="promising">Promising Methods</TabsTrigger>
          <TabsTrigger value="experimental">Experimental</TabsTrigger>
          <TabsTrigger value="test-results">Test Results</TabsTrigger>
        </TabsList>

        {/* Promising Methods */}
        <TabsContent value="promising" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {promisingMethods.map((method) => {
              const qrData = testQRs[method.wallet]?.qr;
              const hasTested = testResults[method.wallet] !== undefined;
              const testResult = testResults[method.wallet];

              return (
                <Card key={method.wallet} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{method.wallet}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getViabilityColor(method.viability)}>
                          {getViabilityIcon(method.viability)}
                          <span className="ml-1">{method.viability}</span>
                        </Badge>
                        {hasTested && (
                          testResult ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )
                        )}
                      </div>
                    </div>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* QR Code */}
                    {qrData ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Test QR Code:</p>
                        <div className="bg-white p-4 rounded-lg border">
                          <QRCodeGenerator 
                            value={qrData}
                            title={`${method.wallet} Test`}
                            size={200}
                            showDownload={false}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <QrCode className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">QR code not implemented</p>
                      </div>
                    )}

                    {/* Method Details */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Method:</p>
                      <p className="text-sm text-muted-foreground">{method.method}</p>
                      <p className="text-sm text-muted-foreground">{method.notes}</p>
                    </div>

                    {/* URI Scheme */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">URI Scheme:</p>
                      <code className="text-xs bg-muted p-2 rounded block break-all">
                        {method.uriScheme}
                      </code>
                    </div>

                    {/* Test Button */}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => testMethod(method.wallet)}
                      disabled={hasTested}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      {hasTested ? (testResult ? 'Tested - Works!' : 'Tested - Failed') : 'Test This Method'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Experimental Methods */}
        <TabsContent value="experimental" className="space-y-6">
          <Alert>
            <FlaskConical className="h-4 w-4" />
            <AlertDescription>
              These methods are highly experimental and based on theoretical wallet app logic. 
              Success probability is low but worth testing!
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experimentalMethods.map((method) => (
              <Card key={method.wallet} className="opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{method.wallet}</CardTitle>
                    <Badge className={getViabilityColor(method.viability)}>
                      {getViabilityIcon(method.viability)}
                      <span className="ml-1">{method.viability}</span>
                    </Badge>
                  </div>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Method:</p>
                      <p className="text-sm text-muted-foreground">{method.method}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Notes:</p>
                      <p className="text-sm text-muted-foreground">{method.notes}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">URI Scheme:</p>
                      <code className="text-xs bg-muted p-2 rounded block break-all">
                        {method.uriScheme}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Test Results */}
        <TabsContent value="test-results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Test Results</CardTitle>
              <CardDescription>
                Help us test these QR methods and contribute to the research
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Hybrid System Overview */}
                <div>
                  <h4 className="font-medium mb-2">Recommended Approach:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{hybridSystem.primaryMethod}</span>
                    </div>
                    {hybridSystem.fallbackMethods.map((method, index) => (
                      <div key={index} className="flex items-center gap-2 ml-6">
                        <Lightbulb className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">{method}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Results Summary */}
                <div>
                  <h4 className="font-medium mb-2">Test Results:</h4>
                  {Object.keys(testResults).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tests completed yet. Be the first to test!</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(testResults).map(([method, result]) => (
                        <div key={method} className="flex items-center gap-2">
                          {result ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">{method}: {result ? 'Works!' : 'Failed'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Call to Action */}
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Help the community!</strong> Test these QR methods with different wallets 
                    and share your results. Your feedback helps improve wallet network configuration for everyone.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Research Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Research Notes</CardTitle>
          <CardDescription>
            Technical details about QR code network configuration research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">Why QR Codes Don't Usually Work for Networks:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Most wallets only support QR codes for addresses and dApp connections</li>
                <li>Network configuration is considered a security-sensitive operation</li>
                <li>Wallet apps prefer manual network addition for user control</li>
                <li>URI schemes for network addition are not standardized</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">Potential Workarounds Being Tested:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>WalletConnect sessions with embedded network requests</li>
                <li>Custom deep links that open network settings</li>
                <li>Ethereum URIs with network parameters</li>
                <li>Clipboard integration for mobile devices</li>
                <li>Form prefill via URL parameters</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium">How You Can Help:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Test QR codes with different wallet apps</li>
                <li>Report which methods work (if any)</li>
                <li>Share screenshots of successful network addition via QR</li>
                <li>Document wallet app behavior when scanning these codes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}