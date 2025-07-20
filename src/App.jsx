import { useState } from 'react'
import FileUpload from './components/FileUpload'
import StatementAnalyzer from './components/StatementAnalyzer'
import PaymentModal from './components/PaymentModal'
import AuthModal from './components/AuthModal'
import Header from './components/Header'

function App() {
  const [analyzedData, setAnalyzedData] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [user, setUser] = useState(null)
  const [pendingExport, setPendingExport] = useState(null)

  const FREE_LIMIT = 3

  const handleFileProcessed = (data) => {
    if (usageCount >= FREE_LIMIT && !isPremium) {
      setShowPaymentModal(true)
      return
    }
    
    setAnalyzedData(data)
    setUsageCount(prev => prev + 1)
  }

  const handleExport = () => {
    if (!user) {
      setShowAuthModal(true)
      setPendingExport('export')
      return
    }
    
    if (analyzedData.transactions.length > 100) {
      setShowPaymentModal(true)
      return
    }
    
    // Proceed with export
    handleDirectExport()
  }

  const handleDirectExport = () => {
    // Export logic will be handled by StatementAnalyzer
    console.log('Exporting data...')
  }

  const handlePaymentSuccess = (response) => {
    console.log('Payment successful:', response)
    setIsPremium(true)
    if (pendingExport === 'export') {
      handleDirectExport()
    }
    setPendingExport(null)
  }

  const handleLogin = (userData) => {
    // In a real app, you'd validate with backend
    setUser({ name: userData.name || userData.email, email: userData.email })
    setShowAuthModal(false)
    
    if (pendingExport === 'export') {
      handleDirectExport()
      setPendingExport(null)
    }
  }

  const handleRegister = (userData) => {
    // In a real app, you'd register with backend
    setUser({ name: userData.name, email: userData.email })
    setShowAuthModal(false)
    
    if (pendingExport === 'export') {
      handleDirectExport()
      setPendingExport(null)
    }
  }

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        isPremium={isPremium} 
        usageCount={usageCount} 
        freeLimit={FREE_LIMIT}
        user={user}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bank Statement Analyzer
            </h1>
            <p className="text-lg text-gray-600">
              Upload your bank statement and get easy-to-understand insights with exportable reports
            </p>
          </div>

          {!analyzedData ? (
            <FileUpload onFileProcessed={handleFileProcessed} />
          ) : (
            <StatementAnalyzer 
              data={analyzedData} 
              onReset={() => setAnalyzedData(null)}
              onExport={handleExport}
              user={user}
            />
          )}
        </div>
      </main>

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        transactionCount={analyzedData?.transactions?.length || 0}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  )
}

export default App
