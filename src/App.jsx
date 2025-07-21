import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import FileUpload from './components/FileUpload'
import StatementAnalyzer from './components/StatementAnalyzer'
import PaymentModal from './components/PaymentModal'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import { Building, Sparkles, ShieldCheck } from 'lucide-react'

function Home() {
  const navigate = useNavigate()
  const handleFileProcessed = (data) => {
    navigate('/analyze', { state: { analysis: data } })
  }
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-5xl font-extrabold text-center text-primary-600 mb-4 tracking-tight">Bank Statement Analyzer</h1>
      <p className="text-xl text-center text-gray-700 mb-12">With years of experience in banking, we comply with strict standards when handling your files.</p>
      {/* Drag & Drop Section */}
      <div className="mb-14">
        <FileUpload onFileProcessed={handleFileProcessed} />
      </div>
      <div className="grid md:grid-cols-3 gap-8 mb-14">
        <div className="card text-center py-8 flex flex-col items-center">
          <div className="mb-4 p-4 rounded-full bg-blue-100 flex items-center justify-center">
            <Building className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-blue-700">Institutional</h2>
          <p className="text-gray-600">We've provided our services to thousands of reputable financial, accounting and legal firms.</p>
        </div>
        <div className="card text-center py-8 flex flex-col items-center">
          <div className="mb-4 p-4 rounded-full bg-green-100 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-green-700">Accurate</h2>
          <p className="text-gray-600">We're continually improving our algorithms. If a file doesn't convert to your expectations, email us and we'll fix it.</p>
        </div>
        <div className="card text-center py-8 flex flex-col items-center">
          <div className="mb-4 p-4 rounded-full bg-purple-100 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-purple-700">Anonymous</h2>
          <p className="text-gray-600">Anonymous conversions with no need to sign up</p>
        </div>
      </div>
      <div className="card mb-14">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary-700">Plans</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-50 rounded-lg p-8 text-center flex flex-col items-center">
            <h3 className="font-bold text-lg mb-2">Free Tier</h3>
            <div className="text-green-600 font-semibold mb-1 text-xl">$0</div>
            <div className="mb-2">5 documents per month</div>
            <Link to="/pricing" className="btn-primary inline-block mt-4">See Pricing</Link>
          </div>
          <div className="bg-slate-50 rounded-lg p-8 text-center flex flex-col items-center">
            <h3 className="font-bold text-lg mb-2">Basic</h3>
            <div className="text-purple-600 font-semibold mb-1 text-xl">$6/mo</div>
            <div className="mb-2">300 documents per month</div>
            <Link to="/pricing" className="btn-primary inline-block mt-4">See Pricing</Link>
          </div>
          <div className="bg-slate-50 rounded-lg p-8 text-center flex flex-col items-center">
            <h3 className="font-bold text-lg mb-2">Standard</h3>
            <div className="text-yellow-600 font-semibold mb-1 text-xl">$15/mo</div>
            <div className="mb-2">Unlimited documents per month</div>
            <Link to="/pricing" className="btn-primary inline-block mt-4">See Pricing</Link>
          </div>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-primary-700">Need more?</h2>
        <p className="mb-4 text-gray-700">We provide bespoke services for clients who have other document formats to process. Let us know how we can help!</p>
        <Link to="/contact" className="btn-secondary inline-block">Contact Us</Link>
      </div>
    </div>
  )
}

function AnalyzePage({ user, isPremium, usageCount, freeLimit }) {
  const location = useLocation()
  const [analyzedData, setAnalyzedData] = useState(location.state?.analysis || null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleFileProcessed = (data) => {
    if (usageCount >= freeLimit && !isPremium) {
      setShowPaymentModal(true)
      return
    }
    setAnalyzedData(data)
  }

  const handleExport = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    if (analyzedData.transactions.length > 100) {
      setShowPaymentModal(true)
      return
    }
    // Proceed with export
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bank Statement Analyzer</h1>
          <p className="text-lg text-gray-600">Upload your bank statement and get easy-to-understand insights with exportable reports</p>
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
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={() => {}}
        transactionCount={analyzedData?.transactions?.length || 0}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {}}
        onRegister={() => {}}
      />
    </main>
  )
}

function RegisterPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-6">Register</h1>
      <p className="text-center text-gray-600 mb-6">Registration is free and lets you convert up to 5 pages every 24 hours.</p>
      {/* You can use AuthModal here or a simple form */}
      <div className="card">
        <p className="text-center">Registration form coming soon.</p>
      </div>
    </div>
  )
}

function SubscribePage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-6">Subscribe</h1>
      <div className="card">
        <p className="mb-4">Subscribe to convert more documents and unlock premium features.</p>
        <button className="btn-primary w-full">Subscribe Now</button>
      </div>
    </div>
  )
}

function ContactPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-6">Contact Us</h1>
      <div className="card">
        <p className="mb-4">For bespoke services or support, email us at <a href="mailto:support@bankanalyzer.com" className="text-primary-600 underline">support@bankanalyzer.com</a></p>
        <form className="space-y-4">
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Your email" />
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="How can we help?" rows={4} />
          <button className="btn-primary w-full">Send</button>
        </form>
      </div>
    </div>
  )
}

function PricingPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-6">Pricing</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card text-center">
          <h2 className="text-xl font-semibold mb-2">Free Tier</h2>
          <div className="text-2xl font-bold text-green-600 mb-2">$0</div>
          <div className="mb-2">5 documents per month</div>
        </div>
        <div className="card text-center">
          <h2 className="text-xl font-semibold mb-2">Basic</h2>
          <div className="text-2xl font-bold text-purple-600 mb-2">$6<span className="text-base font-normal">/month</span></div>
          <div className="mb-2">300 documents per month</div>
        </div>
        <div className="card text-center">
          <h2 className="text-xl font-semibold mb-2">Standard</h2>
          <div className="text-2xl font-bold text-yellow-600 mb-2">$15<span className="text-base font-normal">/month</span></div>
          <div className="mb-2">Unlimited documents per month</div>
        </div>
      </div>
    </div>
  )
}

function LoginRegisterPage({ onLogin, onRegister, user }) {
  if (user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user.name || user.email}!</h1>
        <p className="mb-4">You are logged in.</p>
      </div>
    )
  }
  return (
    <div className="max-w-md mx-auto py-12">
      <AuthModal isOpen={true} onClose={() => {}} onLogin={onLogin} onRegister={onRegister} />
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const usageCount = 0
  const isPremium = false
  const FREE_LIMIT = 3

  const handleLogin = (userData) => {
    setUser({
      name: userData.name || userData.email,
      email: userData.email,
      picture: userData.picture
    })
  }
  const handleRegister = (userData) => {
    setUser({
      name: userData.name,
      email: userData.email
    })
  }
  const handleLogout = () => setUser(null)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          isPremium={isPremium} 
          usageCount={usageCount} 
          freeLimit={FREE_LIMIT}
          homeLink
          user={user}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<AnalyzePage user={user} isPremium={isPremium} usageCount={usageCount} freeLimit={FREE_LIMIT} />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginRegisterPage onLogin={handleLogin} onRegister={handleRegister} user={user} />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
