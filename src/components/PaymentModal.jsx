import { useState } from 'react'
import { X, CreditCard, Download, Check } from 'lucide-react'

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, transactionCount }) => {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      // Initialize Razorpay
      const options = {
        key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay test key
        amount: 9900, // ₹99.00 in paise
        currency: 'INR',
        name: 'Bank Statement Analyzer',
        description: `Export ${transactionCount} transactions`,
        image: 'https://your-logo-url.com/logo.png',
        handler: function (response) {
          console.log('Payment successful:', response)
          onPaymentSuccess(response)
          onClose()
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3b82f6'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Export Transactions</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">₹99</div>
            <div className="text-gray-600">One-time payment</div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Export all {transactionCount} transactions</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">CSV and Excel formats</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Complete transaction details</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">No recurring charges</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full btn-primary py-3 text-lg font-medium flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Pay ₹99 & Download</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full btn-secondary py-3"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal 