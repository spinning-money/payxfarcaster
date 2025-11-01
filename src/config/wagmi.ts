import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Check if we're in Farcaster environment
export function isInFarcaster(): boolean {
  return typeof window !== 'undefined' && 
         (window.location.href.includes('farcaster') || 
          window.location.href.includes('warpcast') ||
          !!document.querySelector('[data-farcaster]'))
}

// Wagmi configuration with Farcaster connector
export const config = createConfig({
  chains: [base],
  connectors: [
    farcasterMiniApp()
  ],
  transports: {
    [base.id]: http(),
  },
})

