import { NextRequest } from 'next/server';
import { initializeSocketIO } from '@/lib/quantity-websocket';

// Socket.IO API route for real-time token quantity updates
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextRequest,
  res: any
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // Initialize Socket.IO if not already done
    const io = initializeSocketIO(req as any, res);
    
    return new Response('Socket.IO server initialized', { status: 200 });
  } catch (error) {
    console.error('Socket.IO initialization error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// For Next.js 13+ App Router, we need to handle WebSocket upgrade
export async function GET(req: NextRequest) {
  return new Response('WebSocket endpoint for quantity updates', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}