# POL Sandbox - Protocol-Owned Liquidity Platform

🚀 **A comprehensive DeFi platform that enables universal wallet connectivity and advanced price influence strategies for Protocol-Owned Liquidity (POL) management.**

## 🎯 Project Overview

POL Sandbox is a production-ready DeFi ecosystem that provides developers and users with multiple pathways to integrate with and influence token prices through strategic liquidity management. The platform supports universal wallet connectivity, multiple price influence strategies, and enterprise-grade features.

## ✨ Key Features

### 🔗 Universal Wallet Connectivity
- **Multi-Wallet Support**: MetaMask, Trust Wallet, Coinbase Wallet, SafePal, and 10+ others
- **WalletConnect v2**: Mobile wallet compatibility with QR code scanning
- **Auto-Detection**: Automatically detects available wallets
- **Deep Integrations**: Wallet-specific features and optimizations

### 💰 Price Influence Strategies
- **Browser Extension**: Automatic price override across all dApps
- **Custom RPC Network**: Add POL network to any Web3 wallet
- **API Proxy**: RESTful API for custom integrations
- **Real-time Adjustments**: Dynamic price calculations with confidence scoring

### 🎛️ Advanced Features
- **Real-time Dashboard**: Comprehensive monitoring and control interface
- **Portfolio Management**: Enhanced portfolio data with POL adjustments
- **Strategy Wizard**: Step-by-step setup for different integration methods
- **API Documentation**: Complete developer documentation with examples
- **Production Deployment**: Docker, Kubernetes, and CI/CD ready

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   Infrastructure│
│   Next.js 15    │◄──►│   Node.js        │◄──►│   Docker/K8s    │
│   TypeScript    │    │   Socket.IO      │    │   Nginx         │
│   Tailwind CSS  │    │   PostgreSQL     │    │   Prometheus    │
│   shadcn/ui     │    │   Redis          │    │   Grafana       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/pol-sandbox.git
cd pol-sandbox
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Initialize the database**
```bash
npm run db:push
npm run db:seed
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage Guide

### Connecting a Wallet

1. **Navigate to the Wallet tab**
2. **Select your preferred wallet** (MetaMask, Trust Wallet, etc.)
3. **Approve the connection** in your wallet
4. **View your portfolio** with POL-enhanced data

### Setting Up Price Influence

1. **Go to the Strategies tab**
2. **Choose your integration method**:
   - **Browser Extension**: Download and install for automatic overrides
   - **Custom RPC**: Add POL network to your wallet
   - **API Proxy**: Use our REST API for custom integrations
3. **Configure your settings** and start influencing prices

### Monitoring Performance

1. **Overview Dashboard**: Real-time metrics and system health
2. **Price Analysis**: Detailed price adjustment data
3. **Portfolio Tracking**: Enhanced portfolio with POL insights
4. **System Logs**: Comprehensive monitoring and alerting

## 🔧 Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── universal-wallet-connection.tsx
│   ├── connection-strategy-wizard.tsx
│   ├── unified-dashboard.tsx
│   └── api-documentation.tsx
├── lib/                  # Core libraries
│   ├── universal-wallet-connector.ts
│   ├── walletconnect.ts
│   ├── price-influence-strategies.ts
│   └── wallet-specific-integrations.ts
├── services/             # Business logic
└── hooks/               # React hooks
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks

# Database
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database with sample data

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

### Environment Variables

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pol_sandbox

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Features
ENABLE_BROWSER_EXTENSION=true
ENABLE_CUSTOM_RPC=true
ENABLE_API_PROXY=true
```

## 🐳 Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
# Build the image
docker build -t pol-sandbox .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## ☸️ Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment
kubectl get pods -l app=pol-sandbox

# View logs
kubectl logs -f deployment/pol-sandbox
```

## 📊 Monitoring

### Metrics
- **System Health**: Overall platform status
- **Price Adjustments**: Real-time price influence data
- **Wallet Connections**: Active connections and usage
- **API Performance**: Response times and error rates

### Alerts
- **System Health**: Critical system notifications
- **Price Deviations**: Unusual price movements
- **Connection Issues**: Wallet connectivity problems
- **Performance**: API performance degradation

## 🔒 Security

### Implemented Measures
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Cross-origin request security
- **Input Validation**: Comprehensive input sanitization
- **SSL/TLS**: Encrypted communication
- **Security Headers**: OWASP recommended headers

### Best Practices
- **Environment Variables**: Sensitive data protection
- **Database Security**: Encrypted connections
- **API Keys**: Secure key management
- **Regular Audits**: Security assessments

## 📚 API Documentation

### REST API

#### Get Token Prices
```http
GET /api/v1/prices/{address}
```

#### Batch Price Request
```http
POST /api/v1/prices/batch
Content-Type: application/json

{
  "addresses": ["0x...", "0x..."],
  "strategy": "moderate"
}
```

#### Wallet Portfolio
```http
GET /api/v1/wallet/{address}/portfolio
```

### WebSocket API

#### Real-time Price Stream
```javascript
const ws = new WebSocket('wss://api.pol-sandbox.com/ws/prices');

ws.send(JSON.stringify({
  action: 'subscribe',
  tokens: ['0x...']
}));

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Price update:', data);
};
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```
3. **Commit your changes**
```bash
git commit -m 'Add amazing feature'
```
4. **Push to the branch**
```bash
git push origin feature/amazing-feature
```
5. **Open a Pull Request**

### Development Guidelines
- **Code Style**: Follow ESLint configuration
- **TypeScript**: Strict typing required
- **Testing**: Unit tests for new features
- **Documentation**: Update docs for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WalletConnect** - For wallet connectivity protocol
- **CoinGecko** - For price data APIs
- **shadcn/ui** - For beautiful UI components
- **Next.js** - For the React framework
- **Prisma** - For the database ORM

## 📞 Support

- **Documentation**: [https://docs.pol-sandbox.com](https://docs.pol-sandbox.com)
- **GitHub Issues**: [https://github.com/your-org/pol-sandbox/issues](https://github.com/your-org/pol-sandbox/issues)
- **Discord**: [https://discord.gg/pol-sandbox](https://discord.gg/pol-sandbox)
- **Twitter**: [@pol_sandbox](https://twitter.com/pol_sandbox)

---

🎯 **POL Sandbox** - *Empowering Protocol-Owned Liquidity through Universal Connectivity and Advanced Price Influence*

Built with ❤️ by the POL Sandbox team