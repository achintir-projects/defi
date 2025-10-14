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
  isWebSocketSupported?: boolean;
}

export function WebSocketStatus({ 
  isConnected, 
  connectionError, 
  onConnect, 
  onDisconnect,
  isConnecting = false,
  isWebSocketSupported = true
}: WebSocketStatusProps) {
  const getStatusColor = () => {
    if (!isWebSocketSupported) return 'bg-yellow-500';
    if (isConnecting) return 'bg-yellow-500';
    if (isConnected) return 'bg-green-500';
    if (connectionError) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (!isWebSocketSupported) return 'HTTP Only';
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'Connected';
    if (connectionError) return 'Connection Error';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (!isWebSocketSupported) return <AlertCircle className="h-3 w-3" />;
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

      {/* WebSocket Not Supported Message */}
      {!isWebSocketSupported && (
        <Alert variant="default" className="py-2 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-800">
            Real-time features not available on this hosting platform. Using HTTP APIs for full functionality.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Controls */}
      {isWebSocketSupported && (
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
      )}

      {/* Connection Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>• Token balance management</div>
        <div>• Price updates and calculations</div>
        <div>• Add/remove tokens functionality</div>
        {isWebSocketSupported && isConnected ? (
          <div className="text-green-600 font-medium">
            ✓ Real-time updates active
          </div>
        ) : !isWebSocketSupported ? (
          <div className="text-yellow-600 font-medium">
            ⚡ HTTP APIs active (manual refresh required)
          </div>
        ) : (
          <div className="text-gray-600 font-medium">
            ⚠ Real-time features unavailable
          </div>
        )}
      </div>
    </div>
  );
}