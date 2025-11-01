import React, { useEffect } from 'react'
import { useConnect, useAccount } from 'wagmi'
import { useX402Payment } from './hooks/useX402Payment'

const PaymentButtons = () => {
  const { connect, connectors } = useConnect()
  const { isConnected } = useAccount()
  const { makePayment, isLoading, error } = useX402Payment()
  const [selectedPayment, setSelectedPayment] = React.useState<string | null>(null)

  // Auto-connect if in Farcaster and not connected
  useEffect(() => {
    if (!isConnected && connectors.length > 0) {
      const farcasterConnector = connectors.find(c => c.id === 'farcaster')
      if (farcasterConnector) {
        connect({ connector: farcasterConnector })
      }
    }
  }, [isConnected, connectors, connect])

  const handlePayment = async (endpoint: string) => {
    try {
      setSelectedPayment(endpoint)
      await makePayment(endpoint)
      alert('Payment successful! Your PAYX tokens will be sent to your wallet soon.')
    } catch (err) {
      alert(`Payment failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSelectedPayment(null)
    }
  }

  return (
    <>
      {!isConnected && (
        <div style={{ 
          background: '#fff3cd', 
          border: '2px solid #ffc107', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          ⚠️ Please connect your wallet first to make payments
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          border: '2px solid #dc3545', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          color: '#721c24'
        }}>
          ❌ {error}
        </div>
      )}

      <div className="payment-buttons">
        <button
          onClick={() => handlePayment('/payment/test')}
          disabled={!isConnected || isLoading}
          className="payment-button test"
        >
          {isLoading && selectedPayment === '/payment/test' ? 'Processing...' : '🧪 Test: 0.01 USDC → 50 PAYX'}
        </button>

        <button
          onClick={() => handlePayment('/payment/5usdc')}
          disabled={!isConnected || isLoading}
          className="payment-button"
        >
          {isLoading && selectedPayment === '/payment/5usdc' ? 'Processing...' : '💎 5 USDC → 100,000 PAYX'}
        </button>

        <button
          onClick={() => handlePayment('/payment/10usdc')}
          disabled={!isConnected || isLoading}
          className="payment-button"
        >
          {isLoading && selectedPayment === '/payment/10usdc' ? 'Processing...' : '🚀 10 USDC → 200,000 PAYX'}
        </button>

        <button
          onClick={() => handlePayment('/payment/100usdc')}
          disabled={!isConnected || isLoading}
          className="payment-button premium"
        >
          {isLoading && selectedPayment === '/payment/100usdc' ? 'Processing...' : '🌟 100 USDC → 2,000,000 PAYX (Best Value!)'}
        </button>
      </div>
    </>
  )
}

export default PaymentButtons

