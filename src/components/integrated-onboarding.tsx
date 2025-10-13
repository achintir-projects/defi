'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Activity, Droplets, Settings, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Shield, TrendingUp, Globe } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  icon: React.ComponentType<any>;
  required: boolean;
}

interface UserPreferences {
  riskTolerance: 'low' | 'medium' | 'high';
  investmentGoal: 'growth' | 'stability' | 'balanced';
  experience: 'beginner' | 'intermediate' | 'advanced';
  preferredChains: string[];
  autoRebalancing: boolean;
  notifications: boolean;
}

interface WalletSetup {
  address: string;
  network: string;
  tokens: Array<{
    symbol: string;
    address: string;
    decimals: number;
  }>;
}

export function IntegratedOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    riskTolerance: 'medium',
    investmentGoal: 'balanced',
    experience: 'beginner',
    preferredChains: ['ethereum'],
    autoRebalancing: true,
    notifications: true
  });
  const [walletSetup, setWalletSetup] = useState<WalletSetup>({
    address: '',
    network: 'ethereum',
    tokens: []
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DeFi Ecosystem',
      description: 'Get started with your integrated Fixed Value Wallet and POL Sandbox',
      component: WelcomeStep,
      icon: Globe,
      required: true
    },
    {
      id: 'wallet',
      title: 'Wallet Setup',
      description: 'Configure your fixed value wallet',
      component: WalletSetupStep,
      icon: Wallet,
      required: true
    },
    {
      id: 'sandbox',
      title: 'POL Sandbox Tutorial',
      description: 'Learn how to use the simulation environment',
      component: SandboxTutorialStep,
      icon: Activity,
      required: true
    },
    {
      id: 'preferences',
      title: 'Strategy Preferences',
      description: 'Set your investment preferences and risk tolerance',
      component: StrategyPreferencesStep,
      icon: Settings,
      required: true
    },
    {
      id: 'risk',
      title: 'Risk Assessment',
      description: 'Understand the risks and confirm your understanding',
      component: RiskAssessmentStep,
      icon: Shield,
      required: true
    },
    {
      id: 'dashboard',
      title: 'Dashboard Tour',
      description: 'Explore your integrated dashboard',
      component: DashboardTourStep,
      icon: TrendingUp,
      required: false
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const handleComplete = () => {
    // Save user preferences and setup
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    localStorage.setItem('walletSetup', JSON.stringify(walletSetup));
    localStorage.setItem('onboardingCompleted', 'true');
    
    // Redirect to main dashboard
    window.location.href = '/';
  };

  const progress = ((completedSteps.size + (currentStep + 1)) / steps.length) * 100;

  const CurrentStepComponent = steps[currentStep].component;
  const CurrentStepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CurrentStepIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">{steps[currentStep].title}</h1>
          </div>
          <p className="text-muted-foreground">{steps[currentStep].description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <StepIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center max-w-20">
                    {step.title.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <CurrentStepComponent
              onComplete={() => handleStepComplete(steps[currentStep].id)}
              userPreferences={userPreferences}
              setUserPreferences={setUserPreferences}
              walletSetup={walletSetup}
              setWalletSetup={setWalletSetup}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {steps[currentStep].required && (
              <Badge variant="secondary">Required</Badge>
            )}
            {!steps[currentStep].required && (
              <Badge variant="outline">Optional</Badge>
            )}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete}>
              Complete Setup
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function WelcomeStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Welcome to Your DeFi Powerhouse</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This integrated ecosystem combines a Fixed Value Wallet with advanced POL (Protocol-Owned Liquidity) 
          simulation capabilities, giving you unprecedented control over your digital assets.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Wallet className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Fixed Value Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Manage your tokens with fixed-price stability and intelligent rebalancing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">POL Sandbox</h3>
            <p className="text-sm text-muted-foreground">
              Test liquidity strategies in a risk-free simulation environment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Droplets className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Liquidity Provider</h3>
            <p className="text-sm text-muted-foreground">
              Optimize your liquidity positions with auto-compounding and analytics
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Button onClick={onComplete} size="lg" className="mt-8">
        Get Started
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

function WalletSetupStep({ 
  onComplete, 
  walletSetup, 
  setWalletSetup 
}: {
  onComplete: () => void;
  walletSetup: WalletSetup;
  setWalletSetup: React.Dispatch<React.SetStateAction<WalletSetup>>;
}) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    // Simulate wallet connection
    setTimeout(() => {
      setWalletSetup(prev => ({
        ...prev,
        address: '0x1234...5678',
        tokens: [
          { symbol: 'USDT', address: '0x1234...5678', decimals: 6 },
          { symbol: 'BTC', address: '0xabcd...efgh', decimals: 8 },
          { symbol: 'ETH', address: '0x5678...9012', decimals: 18 }
        ]
      }));
      setIsConnecting(false);
      onComplete();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
        <p className="text-muted-foreground">
          Connect your wallet to enable fixed-value token management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ethereum">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                <TabsTrigger value="polygon">Polygon</TabsTrigger>
                <TabsTrigger value="bsc">BSC</TabsTrigger>
              </TabsList>
              <TabsContent value="ethereum" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Main Ethereum network with full DeFi ecosystem support
                </p>
              </TabsContent>
              <TabsContent value="polygon" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Fast and low-cost transactions on Polygon
                </p>
              </TabsContent>
              <TabsContent value="bsc" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Binance Smart Chain with high throughput
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
          </CardHeader>
          <CardContent>
            {walletSetup.address ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Connected: {walletSetup.address}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Detected Tokens:</p>
                  {walletSetup.tokens.map((token, index) => (
                    <Badge key={index} variant="outline" className="mr-2">
                      {token.symbol}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <Button 
                onClick={handleConnectWallet} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {walletSetup.address && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Wallet successfully connected! You can now proceed to the next step.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function SandboxTutorialStep({ onComplete }: { onComplete: () => void }) {
  const [currentTutorial, setCurrentTutorial] = useState(0);

  const tutorials = [
    {
      title: "Understanding POL",
      description: "Protocol-Owned Liquidity allows protocols to own and manage their liquidity pools, reducing dependency on external liquidity providers.",
      keyPoints: ["Reduced fees", "Better capital efficiency", "Protocol control"]
    },
    {
      title: "Simulation Environment",
      description: "Test your strategies in a risk-free environment before deploying real capital.",
      keyPoints: ["Real-time market data", "Multiple scenarios", "Performance metrics"]
    },
    {
      title: "Strategy Optimization",
      description: "Use AI-powered recommendations to optimize your liquidity provision strategies.",
      keyPoints: ["Automated rebalancing", "Risk assessment", "Profit optimization"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">POL Sandbox Tutorial</h2>
        <p className="text-muted-foreground">
          Learn how to use the simulation environment effectively
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tutorials[currentTutorial].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {tutorials[currentTutorial].description}
          </p>
          <div className="space-y-2">
            <p className="font-medium">Key Points:</p>
            <ul className="list-disc list-inside space-y-1">
              {tutorials[currentTutorial].keyPoints.map((point, index) => (
                <li key={index} className="text-sm text-muted-foreground">{point}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        {tutorials.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentTutorial ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentTutorial(Math.max(0, currentTutorial - 1))}
          disabled={currentTutorial === 0}
        >
          Previous
        </Button>
        {currentTutorial < tutorials.length - 1 ? (
          <Button onClick={() => setCurrentTutorial(currentTutorial + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={onComplete}>
            Complete Tutorial
          </Button>
        )}
      </div>
    </div>
  );
}

function StrategyPreferencesStep({ 
  onComplete, 
  userPreferences, 
  setUserPreferences 
}: {
  onComplete: () => void;
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Set Your Preferences</h2>
        <p className="text-muted-foreground">
          Customize your experience based on your investment goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Tolerance</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={userPreferences.riskTolerance} 
              onValueChange={(value) => setUserPreferences(prev => ({ ...prev, riskTolerance: value as any }))}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="low">Low</TabsTrigger>
                <TabsTrigger value="medium">Medium</TabsTrigger>
                <TabsTrigger value="high">High</TabsTrigger>
              </TabsList>
              <TabsContent value="low" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Conservative approach with stable returns and lower risk
                </p>
              </TabsContent>
              <TabsContent value="medium" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Balanced approach with moderate risk and returns
                </p>
              </TabsContent>
              <TabsContent value="high" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Aggressive approach with higher risk and potential returns
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={userPreferences.investmentGoal} 
              onValueChange={(value) => setUserPreferences(prev => ({ ...prev, investmentGoal: value as any }))}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="stability">Stability</TabsTrigger>
                <TabsTrigger value="balanced">Balanced</TabsTrigger>
                <TabsTrigger value="growth">Growth</TabsTrigger>
              </TabsList>
              <TabsContent value="stability" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Focus on preserving capital and generating stable returns
                </p>
              </TabsContent>
              <TabsContent value="balanced" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Mix of stability and growth for balanced portfolio
                </p>
              </TabsContent>
              <TabsContent value="growth" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Focus on maximizing returns with higher risk tolerance
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={userPreferences.experience} 
              onValueChange={(value) => setUserPreferences(prev => ({ ...prev, experience: value as any }))}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="beginner">Beginner</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="beginner" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  New to DeFi, prefer guided experiences and lower risk
                </p>
              </TabsContent>
              <TabsContent value="intermediate" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Some experience, comfortable with moderate complexity
                </p>
              </TabsContent>
              <TabsContent value="advanced" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Experienced user, prefer advanced features and control
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Auto-Rebalancing</span>
                <Button
                  variant={userPreferences.autoRebalancing ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUserPreferences(prev => ({ ...prev, autoRebalancing: !prev.autoRebalancing }))}
                >
                  {userPreferences.autoRebalancing ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>Notifications</span>
                <Button
                  variant={userPreferences.notifications ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUserPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                >
                  {userPreferences.notifications ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={onComplete} className="w-full">
        Save Preferences
      </Button>
    </div>
  );
}

function RiskAssessmentStep({ onComplete }: { onComplete: () => void }) {
  const [acknowledged, setAcknowledged] = useState(false);

  const risks = [
    {
      title: "Market Volatility",
      description: "Cryptocurrency markets are highly volatile and prices can change rapidly.",
      level: "high"
    },
    {
      title: "Smart Contract Risk",
      description: "Smart contracts may have vulnerabilities that could lead to loss of funds.",
      level: "medium"
    },
    {
      title: "Impermanent Loss",
      description: "Providing liquidity can result in impermanent loss compared to holding assets.",
      level: "medium"
    },
    {
      title: "Regulatory Risk",
      description: "Regulatory changes may affect the availability and legality of certain services.",
      level: "low"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Risk Assessment</h2>
        <p className="text-muted-foreground">
          Please read and acknowledge the following risks
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is important information that helps you understand the risks involved in DeFi investing.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {risks.map((risk, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Badge variant={risk.level === 'high' ? 'destructive' : risk.level === 'medium' ? 'default' : 'secondary'}>
                  {risk.level}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{risk.title}</h4>
                  <p className="text-sm text-muted-foreground">{risk.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="acknowledge" className="text-sm">
              I have read and understood the risks involved. I acknowledge that I am investing at my own risk 
              and I am responsible for my own investment decisions. I should never invest more than I can afford to lose.
            </label>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onComplete} disabled={!acknowledged} className="w-full">
        Complete Risk Assessment
      </Button>
    </div>
  );
}

function DashboardTourStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Dashboard Tour</h2>
        <p className="text-muted-foreground">
          Explore your integrated dashboard features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview Tab</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get a bird's eye view of your entire DeFi ecosystem with key metrics and system health.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fixed Value Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage your tokens with fixed-price stability and intelligent rebalancing strategies.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>POL Sandbox</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Test and optimize liquidity strategies in a risk-free simulation environment.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liquidity Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Optimize your liquidity positions with auto-compounding and advanced analytics.
            </p>
          </CardContent>
        </Card>
      </div>

      <Button onClick={onComplete} className="w-full">
        Start Using Dashboard
      </Button>
    </div>
  );
}