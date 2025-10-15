'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, AlertCircle, Wallet, Zap, Clock, Gift, Smartphone, Monitor } from 'lucide-react'
import { useAccount, useConnect, useDisconnect, useSwitchChain, useBalance } from 'wagmi'
import { injected, metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors'

const POL_SANDBOX_CHAIN = {
  id: 0x23E7,
  name: 'POL Sandbox',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.ankr.com/polygon_amoy'] },
  },
  blockExplorers: {
    default: { name: 'POL Explorer', url: 'https://www.oklink.com/amoy' },
  },
  testnet: true,
}

export default function AutoNetworkSetup() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStep, setConnectionStep] = useState('')
  const [isFaucetRequested, setIsFaucetRequested] = useState(false)
  const [faucetStatus, setFaucetStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle')
  const [detectedWallet, setDetectedWallet] = useState<string>('')
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false)

  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { data: balance } = useBalance({ address })

  // Auto-detect wallet on mount
  useEffect(() => {
    detectWallet()
  }, [])

  // Auto-connect if wallet detected and not connected
  useEffect(() => {
    if (detectedWallet && !isConnected && !autoConnectAttempted) {
      setAutoConnectAttempted(true)
      handleAutoConnect()
    }
  }, [detectedWallet, isConnected, autoConnectAttempted])

  // Auto-switch to POL Sandbox when connected
  useEffect(() => {
    if (isConnected && chain?.id !== POL_SANDBOX_CHAIN.id) {
      switchToPOLNetwork()
    }
  }, [isConnected, chain])

  const detectWallet = () => {
    if (typeof window !== 'undefined') {
      if (window.ethereum?.isMetaMask) {
        setDetectedWallet('metamask')
      } else if (window.ethereum?.isCoinbaseWallet) {
        setDetectedWallet('coinbase')
      } else if (window.ethereum?.isTrust) {
        setDetectedWallet('trust')
      } else if (window.trustWeb3) {
        setDetectedWallet('trust-mobile')
      } else if (window.ethereum) {
        setDetectedWallet('generic')
      }
    }
  }

  const handleAutoConnect = async () => {
    if (!detectedWallet) return

    setIsConnecting(true)
    setConnectionStep('Connecting to wallet...')

    try {
      const connector = connectors.find(c => 
        (detectedWallet === 'metamask' && c.type === 'injected') ||
        (detectedWallet === 'coinbase' && c.type === 'coinbaseWallet') ||
        (detectedWallet === 'generic' && c.type === 'injected')
      )

      if (connector) {
        await connect({ connector })
        setConnectionStep('Wallet connected successfully!')
      }
    } catch (error) {
      console.error('Auto-connect failed:', error)
      setConnectionStep('Auto-connect failed, please connect manually')
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToPOLNetwork = async () => {
    try {
      setConnectionStep('Switching to POL Sandbox network...')
      await switchChain({ chainId: POL_SANDBOX_CHAIN.id })
      setConnectionStep('Successfully switched to POL Sandbox!')
    } catch (error) {
      console.error('Network switch failed:', error)
      setConnectionStep('Please switch to POL Sandbox manually')
    }
  }

  const requestTestTokens = async () => {
    if (!address) return

    setFaucetStatus('requesting')
    setIsFaucetRequested(true)

    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address,
          network: 'pol-sandbox',
          tokens: ['USDT-ERC20', 'USDT-TRC20', 'POL']
        })
      })

      if (response.ok) {
        setFaucetStatus('success')
      } else {
        setFaucetStatus('error')
      }
    } catch (error) {
      console.error('Faucet request failed:', error)
      setFaucetStatus('error')
    }
  }

  const getWalletIcon = (wallet: string) => {
    switch (wallet) {
      case 'metamask': return '🦊'
      case 'coinbase': return '🔵'
      case 'trust': return '🛡️'
      case 'trust-mobile': return '📱'
      default: return '💼'
    }
  }

  const getConnectionStatusColor = () => {
    if (!isConnected) return 'bg-gray-100'
    if (chain?.id === POL_SANDBOX_CHAIN.id) return 'bg-green-100'
    return 'bg-yellow-100'
  }

  const getConnectionStatusText = () => {
    if (!isConnected) return 'Not Connected'
    if (chain?.id === POL_SANDBOX_CHAIN.id) return 'Connected to POL Sandbox'
    return 'Connected to Wrong Network'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Auto-Detection Banner */}
      {detectedWallet && !isConnected && (
        <Alert className="bg-blue-50 border-blue-200">
          <Smartphone className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <span className="font-semibold">{getWalletIcon(detectedWallet)} {detectedWallet.charAt(0).toUpperCase() + detectedWallet.slice(1)} detected!</span> 
            {' '}We can automatically connect you to POL Sandbox.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            One-click setup for POL Sandbox testnet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Display */}
            <div className={`p-4 rounded-lg ${getConnectionStatusColor()}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                  )}
                  <span className="font-medium">{getConnectionStatusText()}</span>
                </div>
                {isConnected && (
                  <Badge variant={chain?.id === POL_SANDBOX_CHAIN.id ? "default" : "secondary"}>
                    {chain?.name || 'Unknown Network'}
                  </Badge>
                )}
              </div>
              
              {address && (
                <div className="mt-2 text-sm text-gray-600">
                  Address: {address.slice(0, 6)}...{address.slice(-4)}
                  {balance && (
                    <span className="ml-4">
                      Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Progress Steps */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  detectedWallet ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {detectedWallet && <Check className="h-3 w-3 text-white" />}
                </div>
                <span>Wallet Detected</span>
                {detectedWallet && (
                  <span className="text-gray-500">({getWalletIcon(detectedWallet)} {detectedWallet})</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  isConnected ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {isConnected && <Check className="h-3 w-3 text-white" />}
                </div>
                <span>Wallet Connected</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  chain?.id === POL_SANDBOX_CHAIN.id ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {chain?.id === POL_SANDBOX_CHAIN.id && <Check className="h-3 w-3 text-white" />}
                </div>
                <span>POL Sandbox Network</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  faucetStatus === 'success' ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {faucetStatus === 'success' && <Check className="h-3 w-3 text-white" />}
                </div>
                <span>Test Tokens Received</span>
              </div>
            </div>

            {/* Action Buttons */}
            {!isConnected ? (
              <Button 
                onClick={handleAutoConnect}
                disabled={isConnecting || !detectedWallet}
                className="w-full"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    {connectionStep}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Auto-Connect Wallet
                  </>
                )}
              </Button>
            ) : chain?.id !== POL_SANDBOX_CHAIN.id ? (
              <Button 
                onClick={switchToPOLNetwork}
                className="w-full"
                size="lg"
              >
                Switch to POL Sandbox
              </Button>
            ) : (
              <Button 
                onClick={requestTestTokens}
                disabled={faucetStatus === 'requesting' || faucetStatus === 'success'}
                className="w-full"
                size="lg"
              >
                {faucetStatus === 'requesting' ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Requesting Test Tokens...
                  </>
                ) : faucetStatus === 'success' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Tokens Requested Successfully!
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Get Test Tokens (USDT + POL)
                  </>
                )}
              </Button>
            )}

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Token Distribution Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Automatic Token Distribution
          </CardTitle>
          <CardDescription>
            Once connected, you'll receive test tokens automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="schedule">Distribution Schedule</TabsTrigger>
              <TabsTrigger value="tokens">Token Types</TabsTrigger>
              <TabsTrigger value="usage">How to Use</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Immediate Distribution</div>
                    <div className="text-sm text-gray-600">Tokens sent within 30 seconds of connection</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Team Monitoring</div>
                    <div className="text-sm text-gray-600">Our team detects new connections and processes requests</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">24/7 Automation</div>
                    <div className="text-sm text-gray-600">Automated system handles requests round the clock</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tokens" className="space-y-4">
              <div className="grid gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">USDT (ERC-20)</div>
                      <div className="text-sm text-gray-600">Ethereum-compatible token</div>
                    </div>
                    <Badge>1,000 USDT</Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">USDT (TRC-20)</div>
                      <div className="text-sm text-gray-600">TRON network token</div>
                    </div>
                    <Badge>1,000 USDT</Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">POL</div>
                      <div className="text-sm text-gray-600">Native gas token</div>
                    </div>
                    <Badge>0.5 POL</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="space-y-4">
              <div className="space-y-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Test tokens have no real value and can only be used on the POL Sandbox testnet.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Test DeFi protocols</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Practice trading</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Learn blockchain interactions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Build and test dApps</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}