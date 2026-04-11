import React from 'react';
import { Link } from 'react-router-dom';
import { Box, LogOut, Menu, X } from 'lucide-react';
import { useStore } from '../store';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { wallet, disconnectWallet } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const shortAddress = wallet.unshieldedAddress
    ? `${wallet.unshieldedAddress.slice(0, 10)}…${wallet.unshieldedAddress.slice(-6)}`
    : '';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/explore', label: 'Explore' },
    { to: '/upload', label: 'Upload' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
                <Box className="w-5 h-5 text-[var(--color-bg)]" />
              </div>
              <span className="text-xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                BlackBox
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center gap-3">
              {wallet.isConnected && (
                <div className="hidden sm:flex items-center gap-2 bg-[var(--color-bg-tertiary)] rounded-full px-4 py-2 border border-[var(--color-border)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  <span className="text-sm font-medium text-[var(--color-text)]" style={{ fontFamily: 'var(--font-mono)' }}>
                    {shortAddress}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="ml-2 text-[var(--color-text-dim)] hover:text-red-400 transition-colors"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[var(--color-border)] py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block py-2 text-sm text-[var(--color-text-dim)] hover:text-[var(--color-accent)]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {wallet.isConnected && (
                <button
                  onClick={() => {
                    disconnectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm text-red-400"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Disconnect Wallet
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};