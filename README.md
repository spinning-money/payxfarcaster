# PAYx Farcaster - Mini App for Token Sales

🚀 **Farcaster Mini App** + **x402 Protocol** + **Base Mainnet**

Buy PAYX tokens with USDC directly in Farcaster or on the web!

## 🎯 Features

- ✅ **Dual Mode**: Works both as Farcaster Mini App & standalone web app
- 💰 **x402 Payment Protocol**: Seamless USDC payments on Base
- 📱 **Mobile-First**: Native-like experience in Farcaster
- 🎨 **Pixel Art Design**: Retro gaming aesthetic
- 💎 **Multiple Payment Options**: 0.01, 1, 5, 10, 100 USDC
- 🪙 **Coin Rain Animation**: Celebration on successful payment
- 👤 **Farcaster Integration**: Auto-detect users, show welcome messages

## 🏗️ Tech Stack

- **Framework**: Hono (Fast & Lightweight)
- **Protocol**: x402 (HTTP 402 Payment Required)
- **Blockchain**: Base Mainnet
- **Payment**: USDC
- **Facilitator**: Coinbase CDP
- **Mini App**: Farcaster Mini App SDK (@farcaster/miniapp-sdk)

## 📦 Installation

### Requirements

- **Node.js 22.11.0 or higher** (LTS recommended)
  ```bash
  node --version  # Check your version
  ```
  If you're using Node.js < 22.11.0, update to latest LTS from [nodejs.org](https://nodejs.org)

### Setup

1. Clone repository:
```bash
git clone git@github.com:spinning-money/payxfarcaster.git
cd payxfarcaster
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
FACILITATOR_URL=https://x402.org/facilitator
NETWORK=base
ADDRESS=0xda8d766bc482a7953b72283f56c12ce00da6a86a
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

> **⚠️ Important**: Get your Alchemy RPC URL from https://www.alchemy.com/ to avoid rate limits!

4. Run development server:
```bash
npm run dev
```

5. Open in browser:
```
http://localhost:3000
```

## 🎮 How It Works

### As Web App:
1. Visit the website
2. Click payment amount (1, 5, 10, or 100 USDC)
3. x402 paywall appears in modal
4. Connect wallet & pay
5. 🎉 Coin rain celebration!
6. Tokens distributed later

### As Farcaster Mini App:
1. Open in Farcaster mobile app
2. **Auto-detects Farcaster user** → Shows welcome message
3. Same payment flow as web
4. Share your purchase on Farcaster feed
5. Notifications when tokens are distributed

## 📱 Farcaster Features

- **Splash Screen**: Branded loading screen (automatically hidden when ready)
- **User Detection**: Automatically detects Farcaster username
- **Welcome Message**: Personalized greeting for Farcaster users
- **Frame Metadata**: Proper Open Graph tags for casting
- **Mobile Optimized**: Native-like UI in Farcaster app
- **Share Extension**: Easy sharing after purchase
- **Performance**: Calls `sdk.actions.ready()` to optimize loading

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FACILITATOR_URL` | x402 facilitator endpoint | ✅ |
| `NETWORK` | `base` for mainnet | ✅ |
| `ADDRESS` | USDC receiver wallet | ✅ |
| `CDP_API_KEY_ID` | Coinbase API Key ID | ✅ |
| `CDP_API_KEY_SECRET` | Coinbase API Secret | ✅ |
| `BASE_RPC_URL` | Custom RPC (prevents rate limits) | ⚠️ Recommended |

## 🚀 Deployment

### Vercel:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

### Farcaster Mini App Store:

**Prerequisites:**
1. Enable Developer Mode:
   - Visit https://farcaster.xyz/~/settings/developer-tools
   - Toggle on "Developer Mode"
   - Developer tools will appear on desktop

**Submission:**
1. Deploy to Vercel
2. Test with Mini App Debug Tool (requires Developer Mode)
3. Submit manifest for approval
4. Get listed in Mini App Store!

**Testing:**
1. Open [Mini App Debug Tool](https://farcaster.xyz/~/developers/mini-apps)
2. Enter your app URL: `https://payxfarcaster.vercel.app`
3. Click "Preview"
4. Test all features before publishing

## 💎 Token Information

- **Token**: PAYX
- **Total Supply**: 1,000,000,000 PAYX
- **Rate**: 1 USDC = 5,000 PAYX
- **Network**: Base Mainnet
- **Distribution**: Automated via smart contracts

## 🎨 Design

- **Theme**: Pixel art / Retro gaming
- **Colors**: Base Network blue tones
- **Font**: Press Start 2P
- **Animations**: Coin rain, pixel pop effects
- **Responsive**: Works on all screen sizes

## 🔒 Security

- x402 protocol ensures payment before access
- Coinbase CDP facilitator for mainnet
- No direct wallet access required
- All transactions on-chain (Base)

## 📄 License

MIT License - Build freely!

## 🤝 Contributing

Contributions welcome! Open an issue or submit a PR.

## 🔗 Links

- **Website**: https://payxfarcaster.vercel.app
- **GitHub**: https://github.com/spinning-money/payxfarcaster
- **X/Twitter**: https://x.com/Payx402token
- **Farcaster**: [Coming Soon]

---

Built with ❤️ using **x402** + **Farcaster** + **Base**

