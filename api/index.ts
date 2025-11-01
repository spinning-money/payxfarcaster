import { Hono } from "hono";
import { readFileSync } from "fs";
import { join } from "path";

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
        config: {
          description: "🧪 TEST: Pay 0.01 USDC → Get 50 PAYX tokens. Tokens will be sent to your wallet later.",
        }
      },
      "GET /payment/5usdc": {
        price: "$5",
        network: network,
        config: {
          description: "💎 Pay 5 USDC → Get 100,000 PAYX tokens. Tokens will be sent to your wallet later.",
        }
      },
      "GET /payment/10usdc": {
        price: "$10",
        network: network,
        config: {
          description: "🚀 Pay 10 USDC → Get 200,000 PAYX tokens. Tokens will be sent to your wallet later.",
        }
      },
      "GET /payment/100usdc": {
        price: "$100",
        network: network,
        config: {
          description: "🌟 Pay 100 USDC → Get 2,000,000 PAYX tokens (Best Value!). Tokens will be sent to your wallet later.",
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


app.get("/payment/5usdc", (c) => {
  return c.json({
    success: true,
    message: "Payment confirmed! Your PAYX tokens will be sent to your wallet soon.",
    payment: {
      amount: "5 USDC",
      tokens: "100,000 PAYX",
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
      tokens: "200,000 PAYX",
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
      tokens: "2,000,000 PAYX",
      status: "Payment recorded - Tokens will be distributed later"
    }
  });
});

// Serve Farcaster manifest
app.get("/.well-known/farcaster.json", (c) => {
  return c.json({
    "accountAssociation": {
      "header": "eyJmaWQiOjE0MDIzMDUsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhCQTE4N2ZGMzE1OWY1NjE2Yjk0Y2E2MWFBQzI5NDdhZWY0QzIwODUxIn0",
      "payload": "eyJkb21haW4iOiJ4NDAycGF5eC52ZXJjZWwuYXBwIn0",
      "signature": "G/swvmmSdA3TW2fY0PSZpRZdGSGqUtZkhHicCmT4a+tw3rtcGn6TVxuUayWJgj74EQ8RnmCLe+3ODTqCWoet7Rs="
    },
    "frame": {
      "version": "1",
      "name": "PAYx Farcaster",
      "iconUrl": "https://x402payx.vercel.app/PAYX-Logo.png",
      "splashImageUrl": "https://x402payx.vercel.app/PAYX-Logo.png",
      "splashBackgroundColor": "#20B2AA",
      "homeUrl": "https://x402payx.vercel.app",
      "webhookUrl": "https://x402payx.vercel.app/api/webhook"
    }
  });
});

// Serve static files (PAYX logo)
app.get("/PAYX-Logo.png", (c) => {
  return c.redirect("/public/PAYX-Logo.png");
});

app.get("/public/PAYX-Logo.png", async (c) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'PAYX-Logo.png');
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
  
  // Read React app HTML from public folder
  try {
    const htmlPath = join(process.cwd(), 'public', 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    return c.html(htmlContent);
  } catch (error) {
    return c.text('React app not built. Run "npm run build" first.', 500);
  }
});


// Export for Vercel - NO app.listen() needed!
export default app;
