import { Hono } from "hono";

// Vercel optimization
const isVercel = process.env.VERCEL === '1';

const facilitatorUrl: string = process.env.FACILITATOR_URL || 'https://x402.org/facilitator';
const payTo = (process.env.ADDRESS || '0xda8d766bc482a7953b72283f56c12ce00da6a86a') as `0x${string}`;
const network = 'base'; // Always use Base network
const rpcUrl = process.env.BASE_RPC_URL || 'https://base-mainnet.g.alchemy.com/v2/demo'; // Custom RPC to avoid rate limits

const app = new Hono();

// Load x402 immediately - not lazy
const { paymentMiddleware: x402Middleware, facilitator: cdpFacilitator } = await (async () => {
  const x402Hono = await import("x402-hono");
  const coinbaseX402 = await import("@coinbase/x402");
  return {
    paymentMiddleware: x402Hono.paymentMiddleware,
    facilitator: coinbaseX402.facilitator
  };
})();

// For Base Mainnet: CDP facilitator is REQUIRED
// For testnet: use { url: "https://x402.org/facilitator" }
const facilitatorConfig = cdpFacilitator;

// x402 Payment Middleware - MUST be before route definitions
app.use(
  x402Middleware(
    payTo,
    {
      "GET /payment/test": {
        price: "$0.01",
        network: network,
        rpcUrl: rpcUrl,
        config: {
          description: "🧪 TEST: Pay 0.01 USDC → Get 50 PAYX tokens. Tokens will be sent to your wallet later.",
        }
      },
      "GET /payment/1usdc": {
        price: "$1",
        network: network,
        rpcUrl: rpcUrl,
        config: {
          description: "💰 Pay 1 USDC → Get 5,000 PAYX tokens. Tokens will be sent to your wallet later.",
        }
      },
      "GET /payment/5usdc": {
        price: "$5",
        network: network,
        rpcUrl: rpcUrl,
        config: {
          description: "💎 Pay 5 USDC → Get 25,000 PAYX tokens. Tokens will be sent to your wallet later.",
        }
      },
      "GET /payment/10usdc": {
        price: "$10",
        network: network,
        rpcUrl: rpcUrl,
        config: {
          description: "🚀 Pay 10 USDC → Get 50,000 PAYX tokens. Tokens will be sent to your wallet later.",
        }
      },
      "GET /payment/100usdc": {
        price: "$100",
        network: network,
        rpcUrl: rpcUrl,
        config: {
          description: "🌟 Pay 100 USDC → Get 500,000 PAYX tokens (Best Value!). Tokens will be sent to your wallet later.",
        }
      }
    },
    facilitatorConfig
  )
);

// Protected endpoints - Only accessible after payment
app.get("/payment/test", (c) => {
  return c.json({
    success: true,
    message: "Test payment confirmed! Your PAYX tokens will be sent to your wallet soon.",
    payment: {
      amount: "0.01 USDC",
      tokens: "50 PAYX",
      status: "Payment recorded - Tokens will be distributed later"
    }
  });
});

app.get("/payment/1usdc", (c) => {
  return c.json({
    success: true,
    message: "Payment confirmed! Your PAYX tokens will be sent to your wallet soon.",
    payment: {
      amount: "1 USDC",
      tokens: "5,000 PAYX",
      status: "Payment recorded - Tokens will be distributed later"
    }
  });
});

app.get("/payment/5usdc", (c) => {
  return c.json({
    success: true,
    message: "Payment confirmed! Your PAYX tokens will be sent to your wallet soon.",
    payment: {
      amount: "5 USDC",
      tokens: "25,000 PAYX",
      status: "Payment recorded - Tokens will be distributed later"
    }
  });
});

app.get("/payment/10usdc", (c) => {
  return c.json({
    success: true,
    message: "Payment confirmed! Your PAYX tokens will be sent to your wallet soon.",
    payment: {
      amount: "10 USDC",
      tokens: "50,000 PAYX",
      status: "Payment recorded - Tokens will be distributed later"
    }
  });
});

app.get("/payment/100usdc", (c) => {
  return c.json({
    success: true,
    message: "Payment confirmed! Your PAYX tokens will be sent to your wallet soon.",
    payment: {
      amount: "100 USDC",
      tokens: "500,000 PAYX",
      status: "Payment recorded - Tokens will be distributed later"
    }
  });
});

// Serve Farcaster manifest
app.get("/.well-known/farcaster.json", (c) => {
  return c.json({
    "accountAssociation": {
      "header": "eyJmaWQiOjEyMzQ1LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4MTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3OCJ9",
      "payload": "eyJkb21haW4iOiJ4NDAycGF5eC52ZXJjZWwuYXBwIn0",
      "signature": "MHhh..."
    },
    "frame": {
      "version": "1",
      "name": "PAYx Farcaster",
      "iconUrl": "https://x402payx.vercel.app/PAYX Logoo.png",
      "splashImageUrl": "https://x402payx.vercel.app/PAYX Logoo.png",
      "splashBackgroundColor": "#20B2AA",
      "homeUrl": "https://x402payx.vercel.app",
      "webhookUrl": "https://x402payx.vercel.app/api/webhook"
    }
  });
});

// Serve static files (PAYX logo)
app.get("/PAYX Logoo.png", (c) => {
  return c.redirect("/public/PAYX Logoo.png");
});

app.get("/public/PAYX Logoo.png", async (c) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'PAYX Logoo.png');
    const fileBuffer = fs.readFileSync(filePath);
    
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000"
      }
    });
  } catch (error) {
    return c.text("Logo not found", 404);
  }
});

// Simple info page with links to protected endpoints
app.get("/", (c) => {
  // Vercel optimization - faster response
  if (isVercel) {
    c.header('Cache-Control', 'public, max-age=60');
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PAYx402 - x402 Payment</title>
      <link rel="icon" type="image/png" href="/favicon.png">
      <link rel="shortcut icon" type="image/png" href="/favicon.png">
      <link rel="apple-touch-icon" href="/favicon.png">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box;
          image-rendering: pixelated;
        }
        body {
          font-family: 'Press Start 2P', monospace;
          background: #000814;
          min-height: 100vh;
          padding: 40px 20px;
          color: #0052FF;
        }
        .container {
          background: #001d3d;
          max-width: 700px;
          margin: 0 auto;
          padding: 30px;
          border: 4px solid #0052FF;
          box-shadow: 0 0 20px rgba(0, 82, 255, 0.3);
        }
        h1 {
          font-size: 32px;
          color: #0052FF;
          margin-bottom: 20px;
          text-shadow: 2px 2px 0px #001845;
          letter-spacing: 2px;
        }
        .subtitle {
          color: #4d94ff;
          font-size: 12px;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        a {
          display: block;
          background: #001845;
          color: #0052FF;
          text-decoration: none;
          padding: 16px 20px;
          font-size: 11px;
          margin-bottom: 16px;
          border: 3px solid #0052FF;
          cursor: pointer;
          transition: all 0.1s;
          text-align: center;
          letter-spacing: 1px;
        }
        a:hover {
          background: #0052FF;
          color: #fff;
          box-shadow: 0 0 10px rgba(0, 82, 255, 0.8);
        }
        a:active {
          transform: scale(0.98);
        }
        .info {
          margin-top: 30px;
          padding: 20px;
          background: #000814;
          border: 3px solid #003d99;
          font-size: 10px;
          line-height: 2;
        }
        .info strong {
          color: #0052FF;
        }
        .info p {
          margin-bottom: 10px;
          color: #4d94ff;
        }
        .social-links {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          justify-content: center;
        }
        .social-links a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          padding: 0;
          margin: 0;
          background: #001845;
          border: 3px solid #0052FF;
          font-size: 24px;
          text-decoration: none;
        }
        .social-links a:hover {
          background: #0052FF;
          color: #fff;
          transform: scale(1.1);
        }
        .test-button {
          background: #1a472a !important; /* Dark green */
          border-color: #2ecc71 !important; /* Light green */
          color: #2ecc71 !important;
          font-size: 10px !important;
          margin-top: 25px !important;
          position: relative;
        }
        .test-button::before {
          content: '🧪 TEST';
          position: absolute;
          top: -20px;
        }
        .web-alternative {
          margin: 20px 0;
          display: flex;
          justify-content: center;
        }
        .web-link {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px 30px;
          background: #001845;
          border: 3px solid #0052FF;
          border-radius: 8px;
          text-decoration: none;
          color: #4d94ff;
          font-family: 'Press Start 2P', monospace;
          transition: all 0.2s;
          box-shadow: 0 4px 0px #003d99;
        }
        .web-link:hover {
          background: #0052FF;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 0px #003d99, 0 0 15px rgba(0, 82, 255, 0.6);
        }
        .web-icon {
          font-size: 32px;
          line-height: 1;
        }
        .web-text {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .web-title {
          font-size: 14px;
          font-weight: bold;
          color: inherit;
        }
        .web-subtitle {
          font-size: 10px;
          opacity: 0.8;
          color: inherit;
        }
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          color: #2ecc71;
        }
        .test-button:hover {
          background: #2ecc71 !important;
          color: #000 !important;
        }
        
        /* Pixel Art Modal */
        .modal-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          z-index: 9999;
          animation: fadeIn 0.2s;
        }
        .modal-overlay.active {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background: #001d3d;
          border: 4px solid #0052FF;
          box-shadow: 0 0 40px rgba(0, 82, 255, 0.8), 8px 8px 0px #000;
          max-width: 90%;
          max-height: 90%;
          width: 800px;
          height: 600px;
          position: relative;
          animation: pixelPop 0.3s;
        }
        .modal-content.test {
          border-color: #2ecc71;
          box-shadow: 0 0 40px rgba(46, 204, 113, 0.8), 8px 8px 0px #000;
        }
        .modal-content.premium {
          border-color: #FFD700;
          box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 8px 8px 0px #000;
        }
        .modal-header {
          background: #000814;
          border-bottom: 4px solid #0052FF;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-content.test .modal-header {
          border-bottom-color: #2ecc71;
        }
        .modal-content.premium .modal-header {
          border-bottom-color: #FFD700;
        }
        .modal-title {
          font-size: 16px;
          color: #0052FF;
          text-shadow: 2px 2px 0px #000;
        }
        .modal-content.test .modal-title {
          color: #2ecc71;
        }
        .modal-content.premium .modal-title {
          color: #FFD700;
        }
        .modal-close {
          background: #ff4d4d;
          border: 3px solid #000;
          color: #fff;
          cursor: pointer;
          padding: 8px 16px;
          font-size: 12px;
          box-shadow: 3px 3px 0px #000;
          transition: all 0.1s;
        }
        .modal-close:hover {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px #000;
        }
        .modal-body {
          width: 100%;
          height: calc(100% - 68px);
        }
        .modal-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pixelPop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        /* Coin Rain Animation */
        .coin-rain {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 99999;
        }
        .coin {
          position: absolute;
          font-size: 32px;
          animation: coinFall 3s linear forwards;
          text-shadow: 2px 2px 0px #000;
        }
        @keyframes coinFall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes coinRotate {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(180deg); }
        }
        
        /* Success Message */
        .success-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          z-index: 100000;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s;
        }
        .success-overlay.active {
          display: flex;
        }
        .success-box {
          background: #001d3d;
          border: 4px solid #2ecc71;
          box-shadow: 0 0 50px rgba(46, 204, 113, 1), 8px 8px 0px #000;
          padding: 40px;
          text-align: center;
          max-width: 500px;
          animation: pixelPop 0.5s;
        }
        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
          animation: coinRotate 2s infinite;
        }
        .success-title {
          font-size: 24px;
          color: #2ecc71;
          text-shadow: 3px 3px 0px #000;
          margin-bottom: 15px;
        }
        .success-text {
          font-size: 12px;
          color: #4d94ff;
          line-height: 1.8;
          margin-bottom: 25px;
        }
        .success-button {
          background: #2ecc71;
          border: 4px solid #000;
          color: #000;
          padding: 12px 32px;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 4px 4px 0px #000;
          transition: all 0.1s;
          font-weight: bold;
        }
        .success-button:hover {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #000;
        }
      </style>
    </head>
    <body>
      <div class="container">
               <div class="social-links">
                 <a href="https://x.com/Payx402token" title="X (Twitter)" target="_blank" rel="noopener noreferrer">𝕏</a>
                 <a href="#" title="Telegram">✈</a>
               </div>
        
        <h1>PAYx Farcaster</h1>
        <p class="subtitle">Buy PAYX Tokens with USDC</p>
        
        <!-- Web Alternative Link -->
        <div class="web-alternative">
          <a href="https://payx402.fun/" target="_blank" class="web-link">
            <div class="web-icon">🌐</div>
            <div class="web-text">
              <div class="web-title">Web Version</div>
              <div class="web-subtitle">Full x402 Support</div>
            </div>
          </a>
        </div>
        
        <a href="#" onclick="openPaymentModal('/payment/1usdc', '💰 1 USDC Payment'); return false;">1 USDC → 5,000 PAYX</a>
        <a href="#" onclick="openPaymentModal('/payment/5usdc', '💎 5 USDC Payment'); return false;">5 USDC → 25,000 PAYX</a>
        <a href="#" onclick="openPaymentModal('/payment/10usdc', '🚀 10 USDC Payment'); return false;">10 USDC → 50,000 PAYX</a>
        <a href="#" onclick="openPaymentModal('/payment/100usdc', '🌟 100 USDC Payment', 'premium'); return false;">100 USDC → 500,000 PAYX</a>
        
        <a href="#" onclick="openPaymentModal('/payment/test', '🧪 Test Payment', 'test'); return false;" class="test-button">0.01 USDC → 50 PAYX</a>
        
        <div class="info">
          <p><strong>Token Information:</strong></p>
          <p>• Token: PAYX</p>
          <p>• Total Supply: 1,000,000,000 PAYX</p>
          <p>• Rate: 1 USDC = 5,000 PAYX</p>
          <p>• Network: Base Mainnet</p>
          
          <p style="margin-top: 15px;"><strong>Payment Options:</strong></p>
          <p>• 0.01 USDC = 50 PAYX (Test)</p>
          <p>• 1 USDC = 5,000 PAYX</p>
          <p>• 5 USDC = 25,000 PAYX</p>
          <p>• 10 USDC = 50,000 PAYX</p>
          <p>• 100 USDC = 500,000 PAYX</p>
          
          <p style="margin-top: 15px;"><strong>How it works:</strong></p>
          <p>1. Choose your payment amount</p>
          <p>2. x402 paywall will appear</p>
          <p>3. Connect your wallet</p>
          <p>4. Complete USDC payment on Base</p>
          <p>5. Payment will be recorded</p>
          
          <p style="margin-top: 15px; color: #4d94ff;">
            <strong>✅ PAYX tokens will be distributed to your wallet later</strong>
          </p>
          
          <p style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #003d99; font-size: 0.85rem; color: #4d94ff;">
            <strong>About PAYx402:</strong><br>
            This is an experimental project testing x402 protocol for automated token distribution. 
            PAYX is a meme token created for demonstration purposes.
          </p>
          
          <p style="margin-top: 10px; font-size: 0.85rem; color: #ff4d4d;">
            <strong>⚠️ DISCLAIMER:</strong><br>
            Use at your own risk. This is not financial advice. 
            PAYX is an experimental meme token with no intrinsic value. 
            Only participate with funds you can afford to lose.
          </p>
        </div>
      </div>
      
      <!-- Pixel Art Modal -->
      <div id="paymentModal" class="modal-overlay">
        <div id="modalContent" class="modal-content">
          <div class="modal-header">
            <div class="modal-title" id="modalTitle">Payment</div>
            <button class="modal-close" onclick="closePaymentModal()">✕ CLOSE</button>
          </div>
          <div class="modal-body">
            <iframe id="paymentIframe" class="modal-iframe" src="about:blank"></iframe>
          </div>
        </div>
      </div>
      
      <!-- Success Overlay with Coin Rain -->
      <div id="successOverlay" class="success-overlay">
        <div class="success-box">
          <div class="success-icon">💰</div>
          <div class="success-title">PAYMENT SUCCESSFUL!</div>
          <div class="success-text">
            Your payment has been confirmed!<br>
            PAYX tokens will be sent to your wallet soon.<br><br>
            <strong>Thank you for your purchase! 🎉</strong>
          </div>
          <button class="success-button" onclick="closeSuccessOverlay()">AWESOME!</button>
        </div>
      </div>
      
      <!-- Coin Rain Container -->
      <div id="coinRain" class="coin-rain"></div>
      
      <script>
        function openPaymentModal(url, title, type) {
          const modal = document.getElementById('paymentModal');
          const modalContent = document.getElementById('modalContent');
          const modalTitle = document.getElementById('modalTitle');
          const iframe = document.getElementById('paymentIframe');
          
          // Set title
          modalTitle.textContent = title;
          
          // Set modal class based on type
          modalContent.className = 'modal-content';
          if (type === 'test') {
            modalContent.classList.add('test');
          } else if (type === 'premium') {
            modalContent.classList.add('premium');
          }
          
          // Load payment iframe
          iframe.src = url;
          
          // Show modal
          modal.classList.add('active');
          
          // Prevent body scroll
          document.body.style.overflow = 'hidden';
          
          // Start monitoring for payment success
          setTimeout(() => startPaymentMonitoring(), 1000);
        }
        
        function closePaymentModal() {
          const modal = document.getElementById('paymentModal');
          const iframe = document.getElementById('paymentIframe');
          
          // Stop monitoring
          if (checkInterval) {
            clearInterval(checkInterval);
          }
          
          // Hide modal
          modal.classList.remove('active');
          
          // Clear iframe
          iframe.src = 'about:blank';
          
          // Restore body scroll
          document.body.style.overflow = '';
        }
        
        // Close modal on overlay click
        document.getElementById('paymentModal').addEventListener('click', function(e) {
          if (e.target === this) {
            closePaymentModal();
          }
        });
        
        // Close modal on ESC key
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            closePaymentModal();
          }
        });
        
        // Coin Rain Animation
        function createCoinRain(duration = 5000) {
          const coinRain = document.getElementById('coinRain');
          const coins = ['💰', '🪙', '💎', '⭐', '✨'];
          const coinsToCreate = 50; // Number of coins
          
          for (let i = 0; i < coinsToCreate; i++) {
            setTimeout(() => {
              const coin = document.createElement('div');
              coin.className = 'coin';
              coin.textContent = coins[Math.floor(Math.random() * coins.length)];
              coin.style.left = Math.random() * 100 + '%';
              coin.style.animationDuration = (Math.random() * 2 + 2) + 's';
              coin.style.animationDelay = (Math.random() * 0.5) + 's';
              
              coinRain.appendChild(coin);
              
              // Remove coin after animation
              setTimeout(() => {
                coin.remove();
              }, 4000);
            }, i * 100);
          }
        }
        
        // Show success overlay with coin rain
        function showPaymentSuccess() {
          // Close payment modal
          closePaymentModal();
          
          // Show success overlay
          const successOverlay = document.getElementById('successOverlay');
          successOverlay.classList.add('active');
          
          // Start coin rain
          createCoinRain();
          
          // Auto close after 8 seconds
          setTimeout(() => {
            closeSuccessOverlay();
          }, 8000);
        }
        
        // Close success overlay
        function closeSuccessOverlay() {
          const successOverlay = document.getElementById('successOverlay');
          successOverlay.classList.remove('active');
          
          // Clear any remaining coins
          const coinRain = document.getElementById('coinRain');
          coinRain.innerHTML = '';
        }
        
        // Listen for iframe navigation (payment success detection)
        let checkInterval;
        function startPaymentMonitoring() {
          const iframe = document.getElementById('paymentIframe');
          if (!iframe) return;
          
          checkInterval = setInterval(() => {
            try {
              // Check if iframe URL changed or if we can detect success
              const iframeSrc = iframe.src;
              
              // If iframe shows JSON response or success page
              if (iframeSrc.includes('/payment/') && iframe.contentDocument) {
                try {
                  const body = iframe.contentDocument.body;
                  const text = body.innerText || body.textContent;
                  
                  // Check for success indicators in response
                  if (text.includes('"success":true') || 
                      text.includes('Payment confirmed') ||
                      text.includes('PAYX tokens will be sent')) {
                    clearInterval(checkInterval);
                    showPaymentSuccess();
                  }
                } catch (e) {
                  // Cross-origin restriction - that's ok
                }
              }
            } catch (e) {
              // Ignore errors
            }
          }, 500);
        }
        
        // Also listen for postMessage from iframe
        window.addEventListener('message', function(event) {
          // Check if message is from payment iframe
          if (event.data && (event.data.type === 'payment_success' || event.data.success === true)) {
            clearInterval(checkInterval);
            showPaymentSuccess();
          }
        });
        
        // Simulate payment success for testing (remove in production)
        // Uncomment to test coin rain: setTimeout(() => showPaymentSuccess(), 3000);
        
        // Test button for coin rain (temporary - remove before production)
        document.addEventListener('keydown', function(e) {
          if (e.key === 'c' && e.ctrlKey) {
            showPaymentSuccess();
          }
        });
      </script>
      
      <!-- Farcaster Mini App SDK + Wallet -->
      <script type="module">
        import { sdk } from "https://esm.sh/@farcaster/miniapp-sdk";
        import { createConfig, http } from "https://esm.sh/wagmi";
        import { base } from "https://esm.sh/wagmi/chains";
        import { farcasterMiniApp } from "https://esm.sh/@farcaster/miniapp-wagmi-connector";
        
        window.farcasterSDK = sdk;
        
        // Wagmi configuration for Farcaster wallet
        const config = createConfig({
          chains: [base],
          transports: {
            [base.id]: http(),
          },
          connectors: [
            farcasterMiniApp()
          ]
        });
        
        window.wagmiConfig = config;
        
        // Initialize SDK when page loads
        window.addEventListener('DOMContentLoaded', async () => {
          try {
            // Check if we're in Farcaster Mini App
            const context = await sdk.context;
            
            if (context) {
              console.log('🎉 Running in Farcaster Mini App!');
              console.log('User:', context.user);
              
              // Show welcome message with Farcaster username
              if (context.user && context.user.displayName) {
                const welcomeMsg = document.createElement('div');
                welcomeMsg.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #0052FF; color: white; padding: 10px 20px; border-radius: 8px; font-size: 10px; z-index: 99999; box-shadow: 0 4px 8px rgba(0,0,0,0.3);';
                welcomeMsg.textContent = '👋 Welcome ' + context.user.displayName + '!';
                document.body.appendChild(welcomeMsg);
                
                // Remove after 5 seconds
                setTimeout(() => welcomeMsg.remove(), 5000);
              }
              
              // Hide splash screen - app is ready to be displayed
              sdk.actions.ready();
              
              // Initialize Farcaster wallet connection
              await initializeFarcasterWallet();
            } else {
              console.log('📱 Running as regular web app');
            }
          } catch (e) {
            console.log('Not in Farcaster context:', e.message);
          }
        });
        
        // Also call ready when all resources are fully loaded
        window.addEventListener('load', () => {
          if (window.farcasterSDK) {
            window.farcasterSDK.actions.ready();
          }
        });
        
        // Farcaster wallet initialization
        async function initializeFarcasterWallet() {
          try {
            // Get Ethereum provider from Farcaster SDK
            const provider = await sdk.wallet.getEthereumProvider();
            
            if (provider) {
              console.log('🔗 Farcaster wallet connected!');
              
              // Get wallet address
              const accounts = await provider.request({ method: 'eth_accounts' });
              if (accounts && accounts.length > 0) {
                const address = accounts[0];
                console.log('💰 Wallet address:', address);
                
                // Show wallet status
                showWalletStatus(address);
                
                // Store provider globally for x402 integration
                window.farcasterProvider = provider;
                window.farcasterAddress = address;
                
                // Override x402 wallet selection with Farcaster wallet
                overrideX402WalletSelection();
              }
            } else {
              console.log('❌ No Farcaster wallet available');
            }
          } catch (error) {
            console.log('❌ Wallet connection failed:', error);
          }
        }
        
        // Override x402 wallet selection to use Farcaster wallet
        function overrideX402WalletSelection() {
          // Wait for x402 iframe to load, then inject Farcaster wallet
          const checkForX402 = setInterval(() => {
            const iframe = document.getElementById('paymentIframe');
            if (iframe && iframe.contentDocument) {
              try {
                // Check if x402 paywall is loaded
                const x402Doc = iframe.contentDocument;
                const walletButtons = x402Doc.querySelectorAll('button, [role="button"]');
                
                if (walletButtons.length > 0) {
                  console.log('🎯 x402 paywall detected, injecting Farcaster wallet...');
                  
                  // Inject Farcaster wallet into x402 iframe
                  injectFarcasterWalletIntoX402(x402Doc);
                  
                  clearInterval(checkForX402);
                }
              } catch (e) {
                // Cross-origin restriction - that's expected
                console.log('⏳ Waiting for x402 iframe to load...');
              }
            }
          }, 500);
          
          // Stop checking after 10 seconds
          setTimeout(() => clearInterval(checkForX402), 10000);
        }
        
        // Inject Farcaster wallet into x402 iframe
        function injectFarcasterWalletIntoX402(x402Doc) {
          try {
            // Create Farcaster wallet button
            const farcasterButton = x402Doc.createElement('div');
            farcasterButton.innerHTML = \`
              <div style="
                background: #0052FF;
                color: white;
                padding: 15px;
                margin: 10px;
                border-radius: 8px;
                cursor: pointer;
                text-align: center;
                font-family: 'Press Start 2P', monospace;
                font-size: 12px;
                border: 2px solid #000;
                box-shadow: 4px 4px 0px #000;
              " onclick="window.parent.connectFarcasterWallet()">
                🔗 Connect Farcaster Wallet
              </div>
            \`;
            
            // Insert at the top of wallet selection
            const walletContainer = x402Doc.querySelector('[class*="wallet"], [class*="connect"], [class*="button"]') || x402Doc.body;
            if (walletContainer) {
              walletContainer.insertBefore(farcasterButton.firstChild, walletContainer.firstChild);
            }
            
            console.log('✅ Farcaster wallet button injected into x402');
          } catch (error) {
            console.log('❌ Failed to inject Farcaster wallet:', error);
          }
        }
        
        // Connect Farcaster wallet (called from x402 iframe)
        window.connectFarcasterWallet = async function() {
          try {
            if (!window.farcasterProvider) {
              throw new Error('Farcaster wallet not available');
            }
            
            // Set the provider in the x402 iframe
            const iframe = document.getElementById('paymentIframe');
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.ethereum = window.farcasterProvider;
              iframe.contentWindow.web3 = { currentProvider: window.farcasterProvider };
            }
            
            console.log('🔗 Farcaster wallet connected to x402');
            
            // Trigger x402 payment flow
            const iframeDoc = iframe.contentDocument;
            if (iframeDoc) {
              // Find and click the first wallet button to proceed
              const proceedButton = iframeDoc.querySelector('button, [role="button"]');
              if (proceedButton) {
                proceedButton.click();
              }
            }
            
          } catch (error) {
            console.error('❌ Farcaster wallet connection failed:', error);
            alert('Failed to connect Farcaster wallet: ' + error.message);
          }
        };
        
        // Show wallet connection status
        function showWalletStatus(address) {
          const walletStatus = document.createElement('div');
          walletStatus.style.cssText = 'position: fixed; top: 10px; left: 10px; background: #2ecc71; color: white; padding: 8px 16px; border-radius: 8px; font-size: 10px; z-index: 99999; box-shadow: 0 4px 8px rgba(0,0,0,0.3);';
          walletStatus.textContent = '🔗 Wallet: ' + address.slice(0, 6) + '...' + address.slice(-4);
          document.body.appendChild(walletStatus);
          
          // Remove after 5 seconds
          setTimeout(() => walletStatus.remove(), 5000);
        }
      </script>
    </body>
    </html>
  `);
});

// Export for Vercel - NO app.listen() needed!
export default app;
