import { Crown, BarChart3, User, LogOut } from 'lucide-react'

const Header = ({ isPremium, usageCount, freeLimit, user, onLogin, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">Statement Analyzer</h1>
            {isPremium && (
              <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {isPremium ? (
                <span className="text-green-600 font-medium">Unlimited Analysis</span>
              ) : (
                <span>
                  {usageCount}/{freeLimit} free analyses
                </span>
              )}
            </div>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <div className="text-sm text-gray-700">
                    Hi, {user.name}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-1 btn-primary text-sm"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 