import { NextRequest, NextResponse } from 'next/server';
import { tokenQuantityManager } from '@/lib/token-quantity-manager';
import { enhancedRPC } from '@/lib/rpc/enhanced-rpc';

// GET - Retrieve token quantities
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'all':
        const allBalances = tokenQuantityManager.getAllBalances();
        return NextResponse.json({
          success: true,
          data: allBalances
        });

      case 'wallet':
        if (!walletAddress) {
          return NextResponse.json({
            error: 'Wallet address required'
          }, { status: 400 });
        }

        const walletBalances = tokenQuantityManager.getWalletBalances(walletAddress);
        if (!walletBalances) {
          return NextResponse.json({
            error: 'Wallet not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: walletBalances
        });

      case 'portfolio':
        if (!walletAddress) {
          return NextResponse.json({
            error: 'Wallet address required'
          }, { status: 400 });
        }

        const portfolio = tokenQuantityManager.getPortfolioSummary(walletAddress);
        if (!portfolio) {
          return NextResponse.json({
            error: 'Portfolio not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: portfolio
        });

      case 'overrides':
        if (!walletAddress) {
          return NextResponse.json({
            error: 'Wallet address required'
          }, { status: 400 });
        }

        const overrides = tokenQuantityManager.getQuantityOverrides(walletAddress);
        return NextResponse.json({
          success: true,
          data: overrides
        });

      default:
        return NextResponse.json({
          error: 'Invalid action. Use: all, wallet, portfolio, or overrides'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Quantities API Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Update token quantities
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, walletAddress, tokenAddress, amount, symbol, decimals, price } = body;

    switch (action) {
      case 'update':
        if (!walletAddress || !tokenAddress || amount === undefined) {
          return NextResponse.json({
            error: 'walletAddress, tokenAddress, and amount are required'
          }, { status: 400 });
        }

        tokenQuantityManager.updateTokenBalance(
          walletAddress,
          tokenAddress,
          amount.toString(),
          price
        );

        return NextResponse.json({
          success: true,
          message: 'Token balance updated successfully'
        });

      case 'add':
        if (!walletAddress || !tokenAddress || !symbol || decimals === undefined || !amount || !price) {
          return NextResponse.json({
            error: 'walletAddress, tokenAddress, symbol, decimals, amount, and price are required'
          }, { status: 400 });
        }

        tokenQuantityManager.addTokenToWallet(
          walletAddress,
          tokenAddress,
          symbol,
          decimals,
          amount.toString(),
          price
        );

        return NextResponse.json({
          success: true,
          message: 'Token added to wallet successfully'
        });

      case 'transfer':
        if (!walletAddress || !body.toWallet || !tokenAddress || !amount) {
          return NextResponse.json({
            error: 'fromWallet, toWallet, tokenAddress, and amount are required'
          }, { status: 400 });
        }

        const success = tokenQuantityManager.simulateTransfer(
          walletAddress,
          body.toWallet,
          tokenAddress,
          amount.toString()
        );

        return NextResponse.json({
          success,
          message: success ? 'Transfer simulated successfully' : 'Transfer failed'
        });

      case 'update-prices':
        if (!body.priceUpdates) {
          return NextResponse.json({
            error: 'priceUpdates object is required'
          }, { status: 400 });
        }

        tokenQuantityManager.updatePrices(body.priceUpdates);
        enhancedRPC.updatePriceOverrides(body.priceUpdates);

        return NextResponse.json({
          success: true,
          message: 'Prices updated successfully'
        });

      default:
        return NextResponse.json({
          error: 'Invalid action. Use: update, add, transfer, or update-prices'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Quantities POST Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Clear data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'clear':
        tokenQuantityManager.clear();
        enhancedRPC.clear();
        return NextResponse.json({
          success: true,
          message: 'All token quantity data cleared'
        });

      case 'wallet':
        const walletAddress = searchParams.get('wallet');
        if (!walletAddress) {
          return NextResponse.json({
            error: 'Wallet address required'
          }, { status: 400 });
        }

        // Note: This would need to be implemented in the TokenQuantityManager
        return NextResponse.json({
          success: false,
          message: 'Wallet deletion not implemented yet'
        });

      default:
        return NextResponse.json({
          error: 'Invalid action. Use: clear or wallet'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Quantities DELETE Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}