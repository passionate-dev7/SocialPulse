# SocialPulse - Social Trading Platform for Hyperliquid

## 🚀 Overview

SocialPulse is a revolutionary social trading platform built specifically for the Hyperliquid ecosystem. It enables users to discover, follow, and automatically copy trades from top-performing traders, democratizing access to professional trading strategies.

## 🎯 Key Features

### For Followers
- **Discover Top Traders**: Browse leaderboards with comprehensive performance metrics
- **One-Click Copy Trading**: Automatically replicate trades from successful traders
- **Risk Management**: Set custom position sizing and stop-loss parameters
- **Performance Tracking**: Monitor your portfolio and copied trades in real-time
- **Social Features**: Follow traders, view trade ideas, and engage with the community

### For Traders
- **Monetize Your Skills**: Earn commission from followers who copy your trades
- **Build Your Reputation**: Showcase verified trading performance
- **Share Insights**: Post trade ideas and market analysis
- **Privacy Controls**: Choose what information to share publicly

## 🏗️ Technical Architecture

### Frontend
- **Next.js 14**: React framework with server-side rendering
- **TypeScript**: Type-safe development
- **TanStack Query**: Efficient data fetching and caching
- **Zustand**: State management
- **Recharts**: Advanced charting capabilities

### Backend Integration
- **Hyperliquid API**: Direct integration for trading and market data
- **WebSocket**: Real-time price feeds and trade updates
- **Ethers.js**: Wallet connectivity and transaction signing

### Smart Features
- **Automated Copy Trading**: Mirror trades with customizable parameters
- **Risk Scoring**: AI-powered trader evaluation
- **Performance Analytics**: Comprehensive statistics and metrics
- **Social Graph**: Follow relationships and reputation system

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Hyperliquid account

### Installation

```bash
# Clone the repository
git clone https://github.com/socialpulse-hyperliquid.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_HYPERLIQUID_API_URL=https://api.hyperliquid.xyz
NEXT_PUBLIC_HYPERLIQUID_WS_URL=wss://api.hyperliquid.xyz/ws
NEXT_PUBLIC_CHAIN_ID=1337
HYPERLIQUID_PRIVATE_KEY=your_private_key_here
```

## 📱 Usage

### Connect Wallet
1. Click "Connect Wallet" in the top navigation
2. Sign the connection message
3. Your trading history will be automatically imported

### Follow a Trader
1. Browse the leaderboard or search for specific traders
2. View detailed performance metrics and trade history
3. Click "Follow" and set your allocation percentage
4. Trades will be automatically copied based on your settings

### Manage Risk
1. Set maximum position sizes
2. Configure stop-loss levels
3. Enable/disable copy trading for specific assets
4. Set daily loss limits

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📊 Performance Metrics

- **Response Time**: <100ms for API calls
- **WebSocket Latency**: <50ms for real-time updates
- **Copy Trade Execution**: <1 second from signal to execution
- **Uptime Target**: 99.9%

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Documentation](https://docs.socialpulse.io)
- [API Reference](https://api.socialpulse.io/docs)
- [Discord Community](https://discord.gg/socialpulse)
- [Twitter](https://twitter.com/socialpulse_io)

## 🏆 Hackathon Submission

This project is submitted for the Hyperliquid Frontier Track Hackathon.

### Team
- [Your Name] - Full Stack Developer

### Contact
- Email: contact@socialpulse.io
- Telegram: @socialpulse_support

---

Built with ❤️ for the Hyperliquid ecosystem