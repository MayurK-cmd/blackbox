import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, LogOut } from 'lucide-react';
import { useStore } from '../store';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { wallet, disconnectWallet } = useStore();

  const shortAddress = wallet.unshieldedAddress
    ? `${wallet.unshieldedAddress.slice(0, 10)}…${wallet.unshieldedAddress.slice(-6)}`
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">ShadowML</span>
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/explore" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Explore
                </Link>
                <Link to="/upload" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Upload
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {wallet.isConnected && (
                <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {shortAddress}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="ml-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Disconnect Lace"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};