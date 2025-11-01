import React, { useState, useEffect } from 'react'
import { WagmiProvider, createConfig, http, useWalletClient, useAccount } from 'wagmi'
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected, walletConnect } from 'wagmi/connectors'
import PaymentButtons from './PaymentButtons'

// Check if we're in Farcaster
function isInFarcaster(): boolean {
  return typeof window !== 'undefined' && 
         (window.location.href.includes('farcaster') || 
          window.location.href.includes('warpcast') ||
          !!document.querySelector('[data-farcaster]'))
}

// Wagmi configuration
const config = createConfig({
  chains: [base],
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [base.id]: http(),
  },
})

const queryClient = new QueryClient()

function App() {
  const [isFarcasterEnv, setIsFarcasterEnv] = useState(false)

  useEffect(() => {
    setIsFarcasterEnv(isInFarcaster())
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="container">
          <h1>PAYx Farcaster</h1>
          <p className="subtitle">Buy PAYX Tokens with USDC</p>
          
          {isFarcasterEnv && (
            <div style={{ 
              position: 'fixed', 
              top: '10px', 
              right: '10px', 
              background: '#0052FF', 
              color: 'white', 
              padding: '10px 20px', 
              borderRadius: '8px', 
              fontSize: '10px', 
              zIndex: 99999 
            }}>
              🎉 Farcaster Mode
            </div>
          )}
          
          <PaymentButtons />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

