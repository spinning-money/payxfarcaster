import { serve } from '@hono/node-server';

// Import the app
const module = await import('./api/index.ts');
const app = module.default;

console.log('🚀 Starting local test server...');
console.log('📝 Environment variables:');
console.log('   ADDRESS:', process.env.ADDRESS);
console.log('   NETWORK:', process.env.NETWORK);
console.log('   CDP_API_KEY_ID:', process.env.CDP_API_KEY_ID ? '✅ Set' : '❌ Not set');
console.log('   CDP_API_KEY_SECRET:', process.env.CDP_API_KEY_SECRET ? '✅ Set' : '❌ Not set');

serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`\n✅ Server running on http://localhost:${info.port}`);
  console.log('📍 Test: http://localhost:3001/payment/1usdc');
});

