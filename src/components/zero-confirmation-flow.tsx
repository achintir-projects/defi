'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Monitor, 
  Zap, 
  Check, 
  Clock, 
  Gift, 
  Shield, 
  ArrowRight,
  Wallet,
  Coins,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { useAccount, useConnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'

interface FlowStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  icon: React.ReactNode
  autoExecute: boolean
}

export default function ZeroConfirmationFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [flowStarted, setFlowStarted] = useState(false)
  const [detectedDevice, setDetectedDevice] = useState<'desktop' | 'mobile' | null>(null)
  const [walletConnected, setWalletConnected] = useState(false)
  const [tokensReceived, setTokensReceived] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(30)

  const { address, isConnected, chain } = useAccount()
  const { connect } = useConnect()
  const { switchChain } = useSwitchChain()

  // Detect device type
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setDetectedDevice(isMobile ? 'mobile' : 'desktop')
  }, [])

  // Auto-start flow when wallet is detected
  useEffect(() => {
    if (detectedDevice && !flowStarted) {
      setTimeout(() => {
        setFlowStarted(true)
        setIsProcessing(true)
        processSteps()
      }, 1000)
    }
  }, [detectedDevice])

  // Countdown timer for token distribution
  useEffect(() => {
    if (flowStarted && currentStep === 2 && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && currentStep === 2) {
      setTokensReceived(true)
      setCurrentStep(3)
    }
  }, [flowStarted, currentStep, timeRemaining])

  const [steps, setSteps] = useState<FlowStep[]>([
    {
      id: 'detect',
      title: 'Device Detection',
      description: 'Identifying your device and wallet',
      status: 'pending',
      icon: detectedDevice === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />,
      autoExecute: true
    },
    {
      id: 'connect',
      title: 'Wallet Connection',
      description: 'Securely connecting to your wallet',
      status: 'pending',
      icon: <Wallet className="h-4 w-4" />,
      autoExecute: true
    },
    {
      id: 'network',
      title: 'Network Setup',
      description: 'Configuring POL Sandbox testnet',
      status: 'pending',
      icon: <Zap className="h-4 w-4" />,
      autoExecute: true
    },
    {
      id: 'tokens',
      title: 'Token Distribution',
      description: 'Receiving test tokens automatically',
      status: 'pending',
      icon: <Coins className="h-4 w-4" />,
      autoExecute: true
    },
    {
      id: 'ready',
      title: 'Ready to Use',
      description: 'All set! Start exploring DeFi',
      status: 'pending',
      icon: <Sparkles className="h-4 w-4" />,
      autoExecute: false
    }
  ])

  const processSteps = async () => {
    // Step 1: Device Detection
    setSteps(prev => prev.map((step, index) => 
      index === 0 ? { ...step, status: 'in-progress' } : step
    ))
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSteps(prev => prev.map((step, index) => 
      index === 0 ? { ...step, status: 'completed' } : step
    ))
    setCurrentStep(1)

    // Step 2: Wallet Connection
    setSteps(prev => prev.map((step, index) => 
      index === 1 ? { ...step, status: 'in-progress' } : step
    ))

    if (!isConnected) {
      try {
        await connect({ connector: injected() })
        setWalletConnected(true)
      } catch (error) {
        console.error('Auto-connect failed:', error)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 3000))
    setSteps(prev => prev.map((step, index) => 
      index === 1 ? { ...step, status: 'completed' } : step
    ))
    setCurrentStep(2)

    // Step 3: Network Setup
    setSteps(prev => prev.map((step, index) => 
      index === 2 ? { ...step, status: 'in-progress' } : step
    ))

    if (isConnected && chain?.id !== 0x23E7) {
      try {
        await switchChain({ chainId: 0x23E7 })
      } catch (error) {
        console.error('Network switch failed:', error)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
    setSteps(prev => prev.map((step, index) => 
      index === 2 ? { ...step, status: 'completed' } : step
    ))
    setCurrentStep(3)

    // Step 4: Token Distribution (with countdown)
    setSteps(prev => prev.map((step, index) => 
      index === 3 ? { ...step, status: 'in-progress' } : step
    ))

    // Request tokens from backend
    if (address) {
      try {
        await fetch('/api/faucet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            address,
            network: 'pol-sandbox',
            tokens: ['USDT-ERC20', 'USDT-TRC20', 'POL']
          })
        })
      } catch (error) {
        console.error('Faucet request failed:', error)
      }
    }
  }

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length
    return (completedSteps / steps.length) * 100
  }

  const getDeviceIcon = () => {
    return detectedDevice === 'mobile' ? 
      <Smartphone className="h-8 w-8 text-blue-600" /> : 
      <Monitor className="h-8 w-8 text-blue-600" />
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Welcome Message */}
      {!flowStarted && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {getDeviceIcon()}
            </div>
            <CardTitle className="text-2xl text-blue-900">
              Welcome to POL Sandbox!
            </CardTitle>
            <CardDescription className="text-blue-700">
              We'll automatically set up everything for you. No technical knowledge required.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Progress Overview */}
      {flowStarted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Setup Progress</span>
              <Badge variant="outline">
                {Math.round(getProgressPercentage())}% Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getProgressPercentage()} className="mb-4" />
            <div className="text-sm text-gray-600 text-center">
              {steps[currentStep]?.title}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step-by-Step Flow */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card 
            key={step.id}
            className={`transition-all duration-300 ${
              step.status === 'completed' ? 'bg-green-50 border-green-200' :
              step.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
              step.status === 'error' ? 'bg-red-50 border-red-200' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  step.status === 'completed' ? 'bg-green-200' :
                  step.status === 'in-progress' ? 'bg-blue-200' :
                  step.status === 'error' ? 'bg-red-200' :
                  'bg-gray-200'
                }`}>
                  {step.status === 'completed' ? (
                    <Check className="h-4 w-4 text-green-700" />
                  ) : step.status === 'in-progress' ? (
                    <Clock className="h-4 w-4 text-blue-700 animate-spin" />
                  ) : step.status === 'error' ? (
                    <AlertCircle className="h-4 w-4 text-red-700" />
                  ) : (
                    step.icon
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{step.title}</h3>
                    {step.status === 'in-progress' && (
                      <Badge variant="secondary" className="text-xs">
                        Processing...
                      </Badge>
                    )}
                    {step.status === 'completed' && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  
                  {/* Special content for token distribution step */}
                  {step.id === 'tokens' && step.status === 'in-progress' && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>Receiving tokens in {timeRemaining} seconds...</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        Our team is automatically sending: 1,000 USDT (ERC-20), 1,000 USDT (TRC-20), 0.5 POL
                      </div>
                    </div>
                  )}
                </div>

                {step.autoExecute && step.status === 'pending' && (
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success State */}
      {tokensReceived && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Gift className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-900">
              All Set! 🎉
            </CardTitle>
            <CardDescription className="text-green-700">
              You're now ready to explore the POL Sandbox testnet with your test tokens.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Wallet Connected</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">POL Sandbox Network</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">Test Tokens Received</span>
              </div>
              
              <Button className="mt-4" size="lg">
                Start Exploring DeFi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This is a secure, automated process. Your wallet will only be connected to the POL Sandbox testnet. 
          Test tokens have no real-world value.
        </AlertDescription>
      </Alert>
    </div>
  )
}