import { serve } from '@hono/node-server';
import { config } from 'dotenv';

// Load environment variables
config();

// Import the app
const module = await import('./api/index.ts');
const app = module.default;

console.log('🚀 PAYx Farcaster - Starting local test server...');
console.log('');
console.log('📱 Farcaster Mini App Mode');
console.log('📝 Environment variables:');
console.log('   ADDRESS:', process.env.ADDRESS || '❌ Not set');
console.log('   NETWORK:', process.env.NETWORK || '❌ Not set');
console.log('   CDP_API_KEY_ID:', process.env.CDP_API_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('   CDP_API_KEY_SECRET:', process.env.CDP_API_KEY_SECRET ? '✅ Set' : '❌ Not set');
console.log('   BASE_RPC_URL:', process.env.BASE_RPC_URL ? '✅ Set' : '❌ Not set');
console.log('');

serve({
  fetch: app.fetch,
  port: 3002
}, (info) => {
  console.log(`✅ Server running on http://localhost:${info.port}`);
  console.log('');
  console.log('🎮 Test URLs:');
  console.log('   Main: http://localhost:3002');
  console.log('   Payment: http://localhost:3002/payment/1usdc');
  console.log('');
  console.log('🎯 Features:');
  console.log('   • Farcaster SDK integration');
  console.log('   • Auto-detect users');
  console.log('   • Welcome messages');
  console.log('   • Coin rain animation');
  console.log('');
});
