import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowRight } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from '../components/Button';
import { HowItWorks } from '../components/HowItWorks';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  React.useEffect(() => {
    if (isConnected) {
      navigate('/dashboard');
    }
  }, [isConnected, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">ShadowML</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/explore"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Explore
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-16 pb-20 lg:pt-24 lg:pb-28">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Secure AI Model</span>
                <span className="block text-blue-600">Marketplace with zk-Proofs</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Upload your trained AI models, generate zero-knowledge proofs, and verify model integrity without exposing sensitive details. Powered by RISC Zero zkVM.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button onClick={openConnectModal} size="lg" className="w-full">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    )}
                  </ConnectButton.Custom>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link to="/explore">
                    <Button variant="outline" size="lg" className="w-full">
                      Explore Models
                      <Brain className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Community Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Join Our Community</h2>
            <p className="mt-4 text-lg text-gray-600">
              Connect with AI researchers and developers who value privacy and security
            </p>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-4xl font-bold text-blue-600">100+</div>
                <div className="mt-2 text-gray-600">Verified Models</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-4xl font-bold text-blue-600">500+</div>
                <div className="mt-2 text-gray-600">Active Users</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-4xl font-bold text-blue-600">99.9%</div>
                <div className="mt-2 text-gray-600">Verification Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};