'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  RefreshCw,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface WebSocketStatusProps {
  isConnected: boolean;
  connectionError: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting?: boolean;
}

export function WebSocketStatus({ 
  isConnected, 
  connectionError, 
  onConnect, 
  onDisconnect,
  isConnecting = false
}: WebSocketStatusProps) {
  const getStatusColor = () => {
    if (isConnecting) return 'bg-yellow-500';
    if (isConnected) return 'bg-green-500';
    if (connectionError) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    if (connectionError) return 'Connection Error';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (isConnecting) return <Loader2 className="h-3 w-3 animate-spin" />;
    if (isConnected) return <CheckCircle className="h-3 w-3" />;
    if (connectionError) return <AlertCircle className="h-3 w-3" />;
    return <WifiOff className="h-3 w-3" />;
  };

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={`${getStatusColor()} text-white border-none`}
        >
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <span className="text-xs">{getStatusText()}</span>
          </div>
        </Badge>
        <span className="text-sm text-muted-foreground">
          Real-time Updates
        </span>
      </div>

      {/* Connection Error Alert */}
      {connectionError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {connectionError}
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Controls */}
      <div className="flex gap-2">
        {!isConnected && !isConnecting && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onConnect}
            className="h-8"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reconnect
          </Button>
        )}
        
        {isConnected && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onDisconnect}
            className="h-8"
          >
            <WifiOff className="h-3 w-3 mr-1" />
            Disconnect
          </Button>
        )}
      </div>

      {/* Connection Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>• Real-time token balance updates</div>
        <div>• Live price changes</div>
        <div>• Instant transfer notifications</div>
        {isConnected && (
          <div className="text-green-600 font-medium">
            ✓ All real-time features active
          </div>
        )}
      </div>
    </div>
  );
}