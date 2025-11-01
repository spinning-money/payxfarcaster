import { useState, useEffect } from 'react'
import { useWalletClient, useAccount } from 'wagmi'
import { wrapFetchWithPayment } from 'x402-fetch'

// Check if we're in Farcaster
function isInFarcaster(): boolean {
  return typeof window !== 'undefined' && 
         (window.location.href.includes('farcaster') || 
          window.location.href.includes('warpcast') ||
          !!document.querySelector('[data-farcaster]'))
}

export const useX402Payment = () => {
  const { data: walletClient } = useWalletClient()
  const { isConnected, address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFarcaster, setIsFarcaster] = useState(false)

  // Check if we're in Farcaster environment
  useEffect(() => {
    setIsFarcaster(isInFarcaster())
  }, [])

  // Make x402 payment - x402-fetch handles wallet UI automatically
  const makePayment = async (endpoint: string) => {
    // In Farcaster, check if wallet is connected via wagmi
    if (isFarcaster) {
      if (!isConnected || !address) {
        const err = new Error('Please connect your wallet in Farcaster first.')
        setError(err.message)
        throw err
      }
      if (!walletClient) {
        const err = new Error('Wallet client not available. Please ensure your wallet is properly connected in Farcaster.')
        setError(err.message)
        throw err
      }
    } else {
      // Web environment
      if (!walletClient) {
        const err = new Error('Wallet not connected. Please connect your wallet first.')
        setError(err.message)
        throw err
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🚀 Starting x402 payment flow...')
      console.log('Environment:', isFarcaster ? 'Farcaster' : 'Web')
      console.log('Wallet connected:', isConnected)
      console.log('Wallet address:', address)
      console.log('Wallet client available:', !!walletClient)
      
      // MAX_PAYMENT_AMOUNT = 100 USDC (6000000 base units with 6 decimals)
      const MAX_PAYMENT_AMOUNT = BigInt(6000000) // 100 USDC max
      
      console.log('💰 Payment config:', {
        maxAmount: MAX_PAYMENT_AMOUNT.toString(),
        note: 'Token address and network are read from 402 response',
      })
      
      // wrapFetchWithPayment signature: (fetch, walletClient, maxValue?)
      const fetchWithPayment = wrapFetchWithPayment(
        fetch,
        walletClient,
        MAX_PAYMENT_AMOUNT // Max allowed payment amount (safety check)
      )

      console.log(`📡 Making payment request to ${endpoint}...`)
      
      let response
      let transactionHash = null
      
      try {
        response = await fetchWithPayment(endpoint, {
          method: 'GET',
        })
        
        // Try to extract transaction hash from response headers
        const txHashHeader = response.headers.get('X-TRANSACTION-HASH') || 
                            response.headers.get('x-transaction-hash')
        if (txHashHeader) {
          transactionHash = txHashHeader
          console.log('📋 Transaction hash from response:', transactionHash)
        }
      } catch (fetchError) {
        console.error('❌ Fetch error:', fetchError)
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to reach server'}`)
      }

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (!response.ok) {
        let errorData: any = {}
        let errorText = ''
        
        try {
          const contentType = response.headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            errorData = await response.json()
          } else {
            errorText = await response.text()
            errorData = { message: errorText }
          }
        } catch (parseError) {
          console.error('❌ Error parsing response:', parseError)
          errorText = `Status ${response.status}: ${response.statusText}`
        }
        
        console.error('❌ Payment failed - Full details:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorText,
          isFarcaster,
          transactionHash,
        })
        
        let errorMessage = 'Payment failed'
        
        // Handle 402 Payment Required with specific error types
        if (response.status === 402) {
          let errorText = errorData.error
          
          if (errorText && typeof errorText === 'object') {
            errorText = errorText.message || 
                       errorText.error || 
                       errorText.reason ||
                       JSON.stringify(errorText, null, 2) ||
                       'Payment settlement failed'
          } else if (typeof errorText !== 'string') {
            errorText = String(errorText || '')
          }
          
          if (!errorText) {
            errorText = ''
          }
          
          if (errorText === 'insufficient_funds' || errorText.includes('insufficient_funds')) {
            errorMessage = 'Insufficient USDC balance. Please ensure you have enough USDC in your wallet on Base network.'
          } else if (errorText === 'X-PAYMENT header is required' || errorText.includes('X-PAYMENT')) {
            errorMessage = 'Payment required. Please complete the payment in your wallet.'
          } else if (errorText.trim()) {
            errorMessage = `Payment error: ${errorText}. Please check your wallet and try again.`
          } else {
            if (isFarcaster) {
              errorMessage = 'Payment transaction is being processed. In Farcaster, transactions may take a bit longer to confirm. Please wait a moment and check your wallet.'
            } else {
              errorMessage = 'Payment settlement failed. The transaction may still be processing. Please wait a moment and check your wallet.'
            }
          }
        } else if (response.status === 404) {
          errorMessage = 'Payment endpoint not found (404). Please check server configuration.'
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorText) {
          errorMessage = errorText
        } else {
          errorMessage = `Payment failed with status ${response.status}`
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('✅ Payment successful:', result)
      console.log('✅ Transaction hash (if available):', transactionHash)
      
      if (isFarcaster && transactionHash) {
        console.log('📋 Farcaster payment transaction:', transactionHash)
      }
      
      return result

    } catch (err) {
      console.error('❌ x402 Payment error:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : String(err),
      })
      
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    makePayment,
    isLoading,
    error,
    isConnected: isConnected && !!walletClient,
  }
}

