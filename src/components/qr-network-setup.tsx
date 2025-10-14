'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  QrCode,
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Smartphone,
  Camera
} from 'lucide-react';
import { 
  WalletQRGenerator, 
  POL_SANDBOX_CONFIG, 
  WALLET_QR_INSTRUCTIONS,
  NetworkConfigValidator 
} from '@/lib/qr-network-config';
import QRCodeGenerator from './qr-code-generator';

interface WalletQRDisplayProps {
  onNetworkAdded?: (wallet: string) => void;
}

export default function WalletQRDisplay({ onNetworkAdded }: WalletQRDisplayProps) {
  const [selectedWallet, setSelectedWallet] = useState<string>('universal');
  const [copiedUrl, setCopiedUrl] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  // Generate QR codes for all wallets
  const qrCodes = WalletQRGenerator.generateAllWalletQRs(POL_SANDBOX_CONFIG);
  
  // Wallet information
  const wallets = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', popular: true },
    { id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️', popular: true },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', popular: true },
    { id: 'okx', name: 'OKX Wallet', icon: '⚫', popular: false },
    { id: 'phantom', name: 'Phantom', icon: '👻', popular: false },
    { id: 'universal', name: 'Universal', icon: '🌐', popular: true }
  ];

  const currentQR = qrCodes[selectedWallet as keyof typeof qrCodes];
  const currentInstructions = WALLET_QR_INSTRUCTIONS[selectedWallet as keyof typeof WALLET_QR_INSTRUCTIONS];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openWalletApp = (walletId: string) => {
    const deepLinks: Record<string, string> = {
      metamask: 'metamask://',
      trustwallet: 'trust://',
      coinbase: 'cbwallet://',
      okx: 'okxwallet://',
      phantom: 'phantom://'
    };
    
    const deepLink = deepLinks[walletId];
    if (deepLink) {
      window.location.href = deepLink;
    }
  };

  const handleNetworkAdded = () => {
    if (onNetworkAdded) {
      onNetworkAdded(selectedWallet);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Add POL Sandbox Network</h2>
        <p className="text-muted-foreground">
          Scan the QR code with your wallet app to automatically add the network
        </p>
      </div>

      {/* Network Configuration Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Network Configuration
          </CardTitle>
          <CardDescription>
            POL Sandbox Test Network Configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Network Name</label>
              <p className="text-sm text-muted-foreground">{POL_SANDBOX_CONFIG.chainName}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Chain ID</label>
              <p className="text-sm text-muted-foreground">
                {NetworkConfigValidator.formatChainId(POL_SANDBOX_CONFIG.chainId)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Native Currency</label>
              <p className="text-sm text-muted-foreground">
                {POL_SANDBOX_CONFIG.nativeCurrency.symbol} ({POL_SANDBOX_CONFIG.nativeCurrency.name})
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">RPC URL</label>
              <p className="text-sm text-muted-foreground break-all">
                {POL_SANDBOX_CONFIG.rpcUrls[0]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Select Your Wallet
          </CardTitle>
          <CardDescription>
            Choose your wallet to get the correct QR code format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {wallets.map((wallet) => (
              <Button
                key={wallet.id}
                variant={selectedWallet === wallet.id ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => setSelectedWallet(wallet.id)}
              >
                <span className="text-2xl">{wallet.icon}</span>
                <span className="text-sm font-medium">{wallet.name}</span>
                {wallet.popular && (
                  <Badge variant="secondary" className="text-xs">
                    Popular
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code for {wallets.find(w => w.id === selectedWallet)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QRCodeGenerator 
              value={currentQR}
              title={`${wallets.find(w => w.id === selectedWallet)?.name} Network Setup`}
              size={256}
              showDownload={true}
            />
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => copyToClipboard(currentQR)}
              >
                {copiedUrl === currentQR ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                {copiedUrl === currentQR ? 'Copied!' : 'Copy URL'}
              </Button>
              
              {selectedWallet !== 'universal' && (
                <Button 
                  variant="outline"
                  onClick={() => openWalletApp(selectedWallet)}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Open App
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Setup Instructions
            </CardTitle>
            <CardDescription>
              Follow these steps to add the network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentInstructions.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Button 
                className="w-full"
                onClick={handleNetworkAdded}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                I've Added the Network
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Make sure your wallet app is updated to the latest version 
          for the best QR code scanning experience. If the QR code doesn't work, try the 
          "Universal" option or manually add the network using the configuration details above.
        </AlertDescription>
      </Alert>
    </div>
  );
}