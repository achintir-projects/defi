'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Wallet, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Gift, 
  ArrowRight,
  QrCode,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react'

interface WalletInfo {
  id: string
  name: string
  type: 'mobile' | 'browser'
  icon: string
  isInstalled: boolean
  deepLink?: string
  universalLink?: string
}

interface TokenConfig {
  symbol: string
  name: string
  decimals: number
  contractAddress?: string
  quantity: string
  forcedPrice: string
}

interface ConnectionResult {
  success: boolean
  walletAddress: string
  networkAdded: boolean
  tokensReceived: boolean
  error?: string
}

const POL_SANDBOX_CONFIG = {
  chainId: '0x23E7',
  chainName: 'POL Sandbox',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.ankr.com/polygon_amoy'],
  blockExplorerUrls: ['https://www.oklink.com/amoy'],
}

export default function RealWalletConnector() {
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionResult, setConnectionResult] = useState<ConnectionResult | null>(null)
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const [showTokenDialog, setShowTokenDialog] = useState(false)
  const [tokenConfigs, setTokenConfigs] = useState<TokenConfig[]>([
    {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      quantity: '10000',
      forcedPrice: '1.00'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      contractAddress: '0xA0b86a33E6441b8e8C7C7b0b8e8e8e8e8e8e8e8e',
      quantity: '5000',
      forcedPrice: '1.00'
    },
    {
      symbol: 'POL',
      name: 'Polygon',
      decimals: 18,
      quantity: '5',
      forcedPrice: '0.50'
    }
  ])

  useEffect(() => {
    detectAvailableWallets()
  }, [])

  const detectAvailableWallets = () => {
    const wallets: WalletInfo[] = []

    // Check for browser wallets
    if (typeof window !== 'undefined') {
      // MetaMask
      if (window.ethereum?.isMetaMask) {
        wallets.push({
          id: 'metamask',
          name: 'MetaMask',
          type: 'browser',
          icon: '🦊',
          isInstalled: true
        })
      } else {
        wallets.push({
          id: 'metamask',
          name: 'MetaMask',
          type: 'browser',
          icon: '🦊',
          isInstalled: false,
          universalLink: 'https://metamask.app/dapp/'
        })
      }

      // Coinbase Wallet
      if (window.ethereum?.isCoinbaseWallet) {
        wallets.push({
          id: 'coinbase',
          name: 'Coinbase Wallet',
          type: 'browser',
          icon: '🔵',
          isInstalled: true
        })
      } else {
        wallets.push({
          id: 'coinbase',
          name: 'Coinbase Wallet',
          type: 'browser',
          icon: '🔵',
          isInstalled: false,
          universalLink: 'https://go.cb-w.com/dapp/'
        })
      }

      // Trust Wallet (browser extension)
      if (window.ethereum?.isTrust) {
        wallets.push({
          id: 'trust-browser',
          name: 'Trust Wallet',
          type: 'browser',
          icon: '🛡️',
          isInstalled: true
        })
      }
    }

    // Mobile wallets (always available as options)
    wallets.push({
      id: 'trust-mobile',
      name: 'Trust Wallet (Mobile)',
      type: 'mobile',
      icon: '📱',
      isInstalled: true,
      deepLink: 'trust://',
      universalLink: 'https://link.trustwallet.com/open_url?coin_id=60&url='
    })

    wallets.push({
      id: 'metamask-mobile',
      name: 'MetaMask (Mobile)',
      type: 'mobile',
      icon: '📱',
      isInstalled: true,
      deepLink: 'metamask://dapp/',
      universalLink: 'https://metamask.app/dapp/'
    })

    setAvailableWallets(wallets)
  }

  const handleWalletSelection = (wallet: WalletInfo) => {
    setSelectedWallet(wallet)
    setShowWalletDialog(false)
    
    if (wallet.type === 'mobile') {
      // For mobile wallets, we need to deep link
      handleMobileWalletConnection(wallet)
    } else {
      // For browser wallets, connect directly
      handleBrowserWalletConnection(wallet)
    }
  }

  const handleMobileWalletConnection = async (wallet: WalletInfo) => {
    setIsConnecting(true)
    
    try {
      // Create a deep link with network configuration
      const currentUrl = window.location.href
      const deepLinkUrl = `${wallet.universalLink}${encodeURIComponent(currentUrl)}`
      
      // Show QR code for mobile scanning
      const qrData = JSON.stringify({
        action: 'connect-wallet',
        network: POL_SANDBOX_CONFIG,
        returnUrl: currentUrl,
        timestamp: Date.now()
      })
      
      // Open deep link
      window.open(deepLinkUrl, '_blank')
      
      // Wait for connection (polling)
      await waitForMobileConnection()
      
    } catch (error) {
      console.error('Mobile wallet connection failed:', error)
      setConnectionResult({
        success: false,
        walletAddress: '',
        networkAdded: false,
        tokensReceived: false,
        error: 'Failed to connect to mobile wallet'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleBrowserWalletConnection = async (wallet: WalletInfo) => {
    setIsConnecting(true)
    
    try {
      if (!wallet.isInstalled) {
        // Redirect to installation
        window.open(wallet.universalLink, '_blank')
        return
      }

      // Connect to wallet
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts'
      })
      
      const walletAddress = accounts[0]
      
      // Add POL Sandbox network
      await window.ethereum!.request({
        method: 'wallet_addEthereumChain',
        params: [POL_SANDBOX_CONFIG]
      })
      
      // Switch to POL Sandbox
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POL_SANDBOX_CONFIG.chainId }]
      })
      
      setConnectionResult({
        success: true,
        walletAddress,
        networkAdded: true,
        tokensReceived: false
      })
      
      // Show token configuration dialog
      setShowTokenDialog(true)
      
    } catch (error) {
      console.error('Browser wallet connection failed:', error)
      setConnectionResult({
        success: false,
        walletAddress: '',
        networkAdded: false,
        tokensReceived: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const waitForMobileConnection = async () => {
    // Poll for connection status from mobile wallet
    const maxAttempts = 30
    let attempts = 0
    
    const pollInterval = setInterval(async () => {
      attempts++
      
      try {
        // Check if wallet has connected via deep link callback
        const response = await fetch('/api/wallet/check-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'mobile',
            walletId: selectedWallet?.id,
            timestamp: Date.now()
          })
        })
        
        const result = await response.json()
        
        if (result.connected) {
          clearInterval(pollInterval)
          setConnectionResult({
            success: true,
            walletAddress: result.address,
            networkAdded: result.networkAdded,
            tokensReceived: false
          })
          setShowTokenDialog(true)
        }
        
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          setConnectionResult({
            success: false,
            walletAddress: '',
            networkAdded: false,
            tokensReceived: false,
            error: 'Connection timeout. Please try again.'
          })
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)
  }

  const handleTokenInjection = async () => {
    if (!connectionResult?.walletAddress) return
    
    setIsConnecting(true)
    
    try {
      const response = await fetch('/api/faucet/inject-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: connectionResult.walletAddress,
          tokens: tokenConfigs,
          network: 'pol-sandbox'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setConnectionResult(prev => prev ? {
          ...prev,
          tokensReceived: true
        } : null)
        setShowTokenDialog(false)
      } else {
        throw new Error(result.error || 'Token injection failed')
      }
      
    } catch (error) {
      console.error('Token injection failed:', error)
      alert('Token injection failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsConnecting(false)
    }
  }

  const updateTokenConfig = (index: number, field: keyof TokenConfig, value: string) => {
    const updated = [...tokenConfigs]
    updated[index] = { ...updated[index], [field]: value }
    setTokenConfigs(updated)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6" />
            Real Wallet Connection
          </CardTitle>
          <CardDescription>
            Connect your actual wallet (Trust Wallet, MetaMask, etc.) and receive real tokens on POL Sandbox
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Wallet Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Available Wallets</CardTitle>
          <CardDescription>
            Select your wallet to connect. Mobile wallets will open via deep link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableWallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedWallet?.id === wallet.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => wallet.isInstalled && handleWalletSelection(wallet)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div>
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-gray-500">
                        {wallet.type === 'mobile' ? 'Mobile App' : 'Browser Extension'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {wallet.isInstalled ? (
                      <Badge variant="default" className="bg-green-600">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Not Installed
                      </Badge>
                    )}
                    {wallet.type === 'mobile' && (
                      <Smartphone className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>
                
                {!wallet.isInstalled && wallet.universalLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(wallet.universalLink, '_blank')
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Install {wallet.name}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      {connectionResult && (
        <Card className={connectionResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {connectionResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Wallet Address:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-white px-2 py-1 rounded">
                    {connectionResult.walletAddress || 'Not connected'}
                  </code>
                  {connectionResult.walletAddress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(connectionResult.walletAddress)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Network Added:</span>
                <Badge variant={connectionResult.networkAdded ? "default" : "secondary"}>
                  {connectionResult.networkAdded ? 'POL Sandbox' : 'Not Added'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Tokens Received:</span>
                <Badge variant={connectionResult.tokensReceived ? "default" : "secondary"}>
                  {connectionResult.tokensReceived ? 'Received' : 'Pending'}
                </Badge>
              </div>
              
              {connectionResult.error && (
                <Alert className="border-red-200 bg-red-100">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {connectionResult.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Configuration Dialog */}
      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Token Injection</DialogTitle>
            <DialogDescription>
              Set custom quantities and forced prices for tokens to be sent to your wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {tokenConfigs.map((token, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      value={token.quantity}
                      onChange={(e) => updateTokenConfig(index, 'quantity', e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`price-${index}`}>Forced Price (USD)</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      value={token.forcedPrice}
                      onChange={(e) => updateTokenConfig(index, 'forcedPrice', e.target.value)}
                      placeholder="Enter forced price"
                    />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <strong>{token.symbol}</strong> - {token.name} (Decimals: {token.decimals})
                </div>
              </div>
            ))}
            
            <div className="flex gap-3">
              <Button
                onClick={handleTokenInjection}
                disabled={isConnecting}
                className="flex-1"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Injecting Tokens...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Inject Tokens to Wallet
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTokenDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">1</div>
              <div>
                <div className="font-medium">Select Your Wallet</div>
                <div className="text-sm text-gray-600">Choose from available wallets. Mobile wallets will open via deep link.</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">2</div>
              <div>
                <div className="font-medium">Connect & Add Network</div>
                <div className="text-sm text-gray-600">Approve connection and POL Sandbox network will be added automatically.</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">3</div>
              <div>
                <div className="font-medium">Configure Tokens</div>
                <div className="text-sm text-gray-600">Set custom quantities and forced prices for each token.</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">4</div>
              <div>
                <div className="font-medium">Receive Tokens</div>
                <div className="text-sm text-gray-600">Tokens are injected directly to your wallet with custom values.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}