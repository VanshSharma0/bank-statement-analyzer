import { Crown, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

const Header = ({ isPremium, usageCount, freeLimit, homeLink, user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {homeLink ? (
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <BarChart3 className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Statement Analyzer</h1>
            </Link>
          ) : (
            <>
              <BarChart3 className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Statement Analyzer</h1>
            </>
          )}
          {isPremium && (
            <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
              <Crown className="w-4 h-4" />
              <span>Premium</span>
            </div>
          )}
        </div>
        <nav className="flex items-center space-x-6">
          <Link to="/pricing" className="text-gray-700 hover:text-primary-600 font-medium">Pricing</Link>
          {!user && (
            <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">Login/Register</Link>
          )}
          <Link to="/contact" className="text-gray-700 hover:text-primary-600 font-medium">Contact</Link>
          {user && (
            <div className="flex items-center space-x-2 ml-4">
              {user.picture && <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-gray-200" />}
              <span className="text-gray-700 font-medium">{user.name || user.email}</span>
              <button onClick={onLogout} className="ml-2 text-sm text-red-600 hover:underline">Logout</button>
            </div>
          )}
        </nav>
        <div className="text-sm text-gray-600 ml-6">
          {isPremium ? (
            <span className="text-green-600 font-medium">Unlimited Analysis</span>
          ) : (
            <span>
              {usageCount}/{freeLimit} free analyses
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 