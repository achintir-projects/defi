import { NextRequest, NextResponse } from 'next/server';
import { enhancedRPC } from '@/lib/rpc/enhanced-rpc';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params, id, walletAddress } = body;

    // Validate request
    if (!method || !id) {
      return NextResponse.json({
        id: id || 0,
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request'
        }
      }, { status: 400 });
    }

    // Register wallet if provided
    if (walletAddress) {
      enhancedRPC.registerWallet(walletAddress);
    }

    // Intercept and enhance the RPC call
    const response = enhancedRPC.interceptRPC({ method, params, id }, walletAddress);

    // Return enhanced response
    return NextResponse.json(response);

  } catch (error) {
    console.error('Enhanced RPC Error:', error);
    
    return NextResponse.json({
      id: 0,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

// Handle GET requests for wallet registration and data retrieval
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');
  const action = searchParams.get('action');

  if (!walletAddress) {
    return NextResponse.json({
      error: 'Wallet address required'
    }, { status: 400 });
  }

  switch (action) {
    case 'register':
      enhancedRPC.registerWallet(walletAddress);
      return NextResponse.json({
        success: true,
        message: `Wallet ${walletAddress} registered for enhanced RPC`
      });

    case 'unregister':
      enhancedRPC.unregisterWallet(walletAddress);
      return NextResponse.json({
        success: true,
        message: `Wallet ${walletAddress} unregistered`
      });

    case 'balances':
      const response = enhancedRPC.getTrustWalletResponse(walletAddress);
      return NextResponse.json(response);

    case 'portfolio':
      const portfolioResponse = enhancedRPC.interceptRPC({
        id: 1,
        jsonrpc: '2.0',
        method: 'wallet_getPortfolio',
        params: []
      }, walletAddress);
      return NextResponse.json(portfolioResponse);

    default:
      return NextResponse.json({
        error: 'Invalid action. Use: register, unregister, balances, or portfolio'
      }, { status: 400 });
  }
}