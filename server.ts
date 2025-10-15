// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = 3000;
const hostname = '0.0.0.0';

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    // Create Next.js app with minimal configuration
    const nextApp = next({ 
      dev,
      hostname,
      port: currentPort,
      dir: process.cwd()
    });

    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // Create HTTP server
    const server = createServer(async (req, res) => {
      // Handle socket.io requests
      if (req.url?.startsWith('/api/socketio')) {
        // Let Socket.IO handle these requests
        return;
      }
      
      // Handle all other requests with Next.js
      handle(req, res);
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      pingTimeout: 60000, // 60 seconds
      pingInterval: 25000, // 25 seconds
      connectTimeout: 45000, // 45 seconds
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    setupSocket(io);

    // Start the server
    server.listen(currentPort, hostname, () => {
      console.log(`> Ready on http://${hostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${hostname}:${currentPort}/api/socketio`);
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
