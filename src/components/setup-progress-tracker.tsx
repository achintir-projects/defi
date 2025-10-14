'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  Wallet,
  Network,
  Coins,
  Settings,
  RefreshCw,
  Play,
  Pause,
  ArrowRight,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  required: boolean;
  action?: () => void;
  estimatedTime: string;
  icon: React.ReactNode;
}

interface SetupProgressTrackerProps {
  onComplete?: () => void;
  onStepChange?: (step: string, status: string) => void;
}

export const SetupProgressTracker: React.FC<SetupProgressTrackerProps> = ({
  onComplete,
  onStepChange
}) => {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'wallet-connect',
      title: 'Connect Wallet',
      description: 'Connect your Trust Wallet to the platform',
      status: 'pending',
      required: true,
      estimatedTime: '30 seconds',
      icon: <Wallet className="w-5 h-5" />
    },
    {
      id: 'network-config',
      title: 'Configure Network',
      description: 'Add POL Sandbox network (Chain ID: 88888)',
      status: 'pending',
      required: true,
      estimatedTime: '1 minute',
      icon: <Network className="w-5 h-5" />
    },
    {
      id: 'add-pol-token',
      title: 'Add POL Token',
      description: 'Add POL token contract to your wallet',
      status: 'pending',
      required: true,
      estimatedTime: '30 seconds',
      icon: <Coins className="w-5 h-5" />
    },
    {
      id: 'add-usdc-token',
      title: 'Add USDC Token',
      description: 'Add USDC token contract to your wallet',
      status: 'pending',
      required: true,
      estimatedTime: '30 seconds',
      icon: <Coins className="w-5 h-5" />
    },
    {
      id: 'add-usdt-token',
      title: 'Add USDT Token',
      description: 'Add USDT token contract to your wallet',
      status: 'pending',
      required: true,
      estimatedTime: '30 seconds',
      icon: <Coins className="w-5 h-5" />
    },
    {
      id: 'verification',
      title: 'Final Verification',
      description: 'Verify all configurations are correct',
      status: 'pending',
      required: true,
      estimatedTime: '15 seconds',
      icon: <Shield className="w-5 h-5" />
    }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoProgress, setIsAutoProgress] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    // Check initial status
    checkInitialStatus();
    
    // Auto-check status every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate overall progress
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const totalSteps = steps.length;
    setOverallProgress((completedSteps / totalSteps) * 100);
    
    // Find current step index
    const currentIndex = steps.findIndex(step => step.status !== 'completed');
    setCurrentStepIndex(currentIndex >= 0 ? currentIndex : totalSteps - 1);
    
    // Check if all steps are completed
    if (completedSteps === totalSteps && totalSteps > 0) {
      onComplete?.();
    }
  }, [steps]);

  const checkInitialStatus = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        updateStepStatus('wallet-connect', accounts.length > 0 ? 'completed' : 'pending');
        updateStepStatus('network-config', chainId === '0x15bca' ? 'completed' : 'pending');
        
        if (chainId === '0x15bca') {
          // Simulate token checking
          updateStepStatus('add-pol-token', Math.random() > 0.5 ? 'completed' : 'pending');
          updateStepStatus('add-usdc-token', Math.random() > 0.5 ? 'completed' : 'pending');
          updateStepStatus('add-usdt-token', Math.random() > 0.5 ? 'completed' : 'pending');
          updateStepStatus('verification', 'pending');
        }
      }
    } catch (error) {
      console.error('Failed to check initial status:', error);
    }
  };

  const checkStatus = async () => {
    if (!isAutoProgress) return;
    
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        // Update wallet connection status
        if (accounts.length > 0 && steps[0].status !== 'completed') {
          updateStepStatus('wallet-connect', 'completed');
        }
        
        // Update network status
        if (chainId === '0x15bca' && steps[1].status !== 'completed') {
          updateStepStatus('network-config', 'completed');
          
          // Simulate token additions after network is configured
          setTimeout(() => {
            updateStepStatus('add-pol-token', 'completed');
            setTimeout(() => {
              updateStepStatus('add-usdc-token', 'completed');
              setTimeout(() => {
                updateStepStatus('add-usdt-token', 'completed');
                setTimeout(() => {
                  updateStepStatus('verification', 'completed');
                }, 1000);
              }, 1000);
            }, 1000);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const updateStepStatus = (stepId: string, status: SetupStep['status']) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const updatedStep = { ...step, status };
        onStepChange?.(stepId, status);
        return updatedStep;
      }
      return step;
    }));
  };

  const executeStepAction = async (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    
    updateStepStatus(stepId, 'in-progress');
    
    try {
      switch (stepId) {
        case 'wallet-connect':
          await connectWallet();
          break;
        case 'network-config':
          await addNetwork();
          break;
        case 'add-pol-token':
          await addToken('0x4585fe77225b41b697c938b018e2ac67ac5a20c0', 'POL');
          break;
        case 'add-usdc-token':
          await addToken('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 'USDC');
          break;
        case 'add-usdt-token':
          await addToken('0xdac17f958d2ee523a2206206994597c13d831ec7', 'USDT');
          break;
        case 'verification':
          await verifySetup();
          break;
      }
      
      updateStepStatus(stepId, 'completed');
    } catch (error) {
      console.error(`Failed to execute step ${stepId}:`, error);
      updateStepStatus(stepId, 'error');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  };

  const addNetwork = async () => {
    if (window.ethereum) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x15bca',
          chainName: 'POL Sandbox',
          nativeCurrency: {
            name: 'POL',
            symbol: 'POL',
            decimals: 18
          },
          rpcUrls: ['https://rpc.pol-sandbox.com/'],
          blockExplorerUrls: ['https://explorer.pol-sandbox.com']
        }]
      });
    }
  };

  const addToken = async (address: string, symbol: string) => {
    if (window.ethereum) {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol,
            decimals: symbol === 'POL' ? 18 : 6,
            image: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
          }
        }
      });
    }
  };

  const verifySetup = async () => {
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const getStepIcon = (step: SetupStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStepColor = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-50';
      case 'in-progress': return 'border-blue-500 bg-blue-50';
      case 'error': return 'border-red-500 bg-red-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const canExecuteStep = (step: SetupStep, index: number) => {
    if (step.status === 'completed' || step.status === 'in-progress') return false;
    if (index === 0) return true; // First step is always executable
    
    // Check if previous required steps are completed
    const previousSteps = steps.slice(0, index);
    return previousSteps.every(prev => !prev.required || prev.status === 'completed');
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const isAllCompleted = completedSteps === totalSteps;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Setup Progress Tracker
            </CardTitle>
            <CardDescription>
              Follow these steps to configure your Trust Wallet for POL Sandbox
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {completedSteps}/{totalSteps} Completed
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoProgress(!isAutoProgress)}
            >
              {isAutoProgress ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Status Summary */}
        {isAllCompleted && (
          <div className="p-4 border-2 border-green-500 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Setup Complete!</h3>
                <p className="text-sm text-green-700">
                  Your Trust Wallet is fully configured for POL Sandbox
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 border-2 rounded-lg transition-all duration-300 ${getStepColor(step.status)} ${
                currentStepIndex === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {step.icon}
                        {step.title}
                        {step.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs text-muted-foreground">
                          Est. {step.estimatedTime}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {step.status === 'error' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => executeStepAction(step.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                      )}
                      
                      {canExecuteStep(step, index) && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => executeStepAction(step.id)}
                        >
                          {step.status === 'in-progress' ? (
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 mr-1" />
                          )}
                          {step.status === 'in-progress' ? 'Processing...' : 'Start'}
                        </Button>
                      )}
                      
                      {step.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress indicator for current step */}
              {step.status === 'in-progress' && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={checkInitialStatus}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
          
          {!isAllCompleted && (
            <Button
              variant="default"
              onClick={() => {
                const nextStep = steps.find((step, index) => canExecuteStep(step, index));
                if (nextStep) {
                  executeStepAction(nextStep.id);
                }
              }}
              className="flex-1"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue Setup
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SetupProgressTracker;