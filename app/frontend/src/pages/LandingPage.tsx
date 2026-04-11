import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader, Shield, Cpu, Lock, Eye, Box, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { useStore } from '../store';

const Step = ({ number, icon: Icon, title, description, delay }: {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  delay: string;
}) => (
  <div
    className={`relative group opacity-0 animate-fade-in-up ${delay}`}
    style={{ animationFillMode: 'forwards' }}
  >
    <div className="absolute -left-4 top-0 bottom-0 w-px bg-[var(--color-border)] hidden lg:block" />
    <div className="relative">
      <div className="absolute -inset-4 bg-[var(--color-accent-dim)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
      <div className="relative flex items-start gap-6 p-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center">
          <span className="text-[var(--color-accent)] font-mono text-sm">{number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Icon className="w-5 h-5 text-[var(--color-accent)]" />
            <h3 className="text-lg font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)', fontSize: '14px' }}>{title}</h3>
          </div>
          <p className="text-[var(--color-text-dim)] text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  </div>
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, connectWallet } = useStore();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [connectError, setConnectError] = React.useState('');

  React.useEffect(() => {
    if (wallet.isConnected) {
      navigate('/dashboard');
    }
  }, [wallet.isConnected, navigate]);

  const handleConnect = async () => {
    setConnectError('');
    setIsConnecting(true);
    try {
      await connectWallet('preprod');
    } catch (err) {
      setConnectError(
        err instanceof Error ? err.message : 'Failed to connect wallet.'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Verify Integrity',
      description: 'Generate cryptographic zk-proofs that prove your AI model works without exposing weights or architecture.'
    },
    {
      icon: Lock,
      title: 'Selective Disclosure',
      description: 'Choose exactly what to reveal. Keep your trade secrets safe while proving model capabilities.'
    },
    {
      icon: Cpu,
      title: 'RISC Zero zkVM',
      description: 'Built on cutting-edge zero-knowledge virtual machine for provable computation.'
    },
    {
      icon: Eye,
      title: 'Trustless Verification',
      description: 'Anyone can verify your proofs on-chain without needing to trust you or download your model.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)] flex items-center justify-center animate-glow">
                <Box className="w-5 h-5 text-[var(--color-bg)]" />
              </div>
              <span className="text-xl font-bold tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                BlackBox
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/explore"
                className="text-sm text-[var(--color-text-dim)] hover:text-[var(--color-text)] transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Explore
              </Link>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn-primary"
              >
                {isConnecting ? (
                  <>
                    <Loader className="animate-spin w-4 h-4 mr-2" />
                    Connecting
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background elements */}
        <div className="grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]" />

        {/* Animated accent lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-20" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-30" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-20" />

        {/* Floating boxes */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 border border-[var(--color-accent)] opacity-10 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border border-[var(--color-accent)] opacity-10 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/3 w-16 h-16 border border-[var(--color-accent)] opacity-10 animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 opacity-0 animate-fade-in-up animation-delay-100" style={{ animationFillMode: 'forwards' }}>
            <Shield className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="text-xs text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono)' }}>Zero-Knowledge Verification</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight opacity-0 animate-fade-in-up animation-delay-200" style={{ animationFillMode: 'forwards' }}>
            <span className="block text-[var(--color-text)]">Secure AI</span>
            <span className="block text-gradient">Model Trading</span>
            <span className="block text-[var(--color-text-dim)] text-3xl md:text-5xl lg:text-6xl mt-4">with zk-Proofs</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-[var(--color-text-dim)] max-w-2xl mx-auto mb-12 leading-relaxed opacity-0 animate-fade-in-up animation-delay-300" style={{ animationFillMode: 'forwards' }}>
            Upload your trained AI models, generate zero-knowledge proofs, and verify
            model integrity without exposing sensitive details.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0 animate-fade-in-up animation-delay-400" style={{ animationFillMode: 'forwards' }}>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="btn-primary group"
            >
              {isConnecting ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <Link to="/explore" className="btn-secondary group">
              Explore Models
              <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {connectError && (
            <p className="text-sm text-red-400 opacity-0 animate-fade-in-up animation-delay-500" style={{ animationFillMode: 'forwards' }}>
              {connectError}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16 pt-16 border-t border-[var(--color-border)] opacity-0 animate-fade-in-up animation-delay-600" style={{ animationFillMode: 'forwards' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>500+</div>
              <div className="text-xs text-[var(--color-text-dim)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>Verified Models</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>2K+</div>
              <div className="text-xs text-[var(--color-text-dim)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>99.9%</div>
              <div className="text-xs text-[var(--color-text-dim)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>Verification Rate</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in-up animation-delay-800" style={{ animationFillMode: 'forwards' }}>
          <span className="text-xs text-[var(--color-text-dim)]" style={{ fontFamily: 'var(--font-mono)' }}>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[var(--color-accent)] to-transparent" />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="grid-bg" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">
              <span className="text-[var(--color-text)]">How It </span>
              <span className="text-gradient">Works</span>
            </h2>
            <p className="text-[var(--color-text-dim)] max-w-md mx-auto">
              Four simple steps to secure your AI models with cryptographic proofs
            </p>
          </div>

          <div className="space-y-0">
            <Step
              number="01"
              icon={Upload}
              title="Upload Your Model"
              description="Upload your trained AI model files. We support PyTorch, TensorFlow, and ONNX formats."
              delay="animation-delay-100"
            />
            <Step
              number="02"
              icon={Cpu}
              title="Generate zk-Proof"
              description="Our RISC Zero zkVM generates a cryptographic proof that your model produces specific outputs without revealing weights."
              delay="animation-delay-200"
            />
            <Step
              number="03"
              icon={Shield}
              title="Mint Verification NFT"
              description="Your proof is minted as an NFT containing metadata about model capabilities, verification status, and disclosure rules."
              delay="animation-delay-300"
            />
            <Step
              number="04"
              icon={Lock}
              title="List & Earn"
              description="List your verified model on the marketplace. Buyers can verify authenticity on-chain without downloading your model."
              delay="animation-delay-400"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-[var(--color-bg-secondary)]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl mb-4">
              <span className="text-[var(--color-text)]">Why </span>
              <span className="text-gradient">BlackBox</span>
            </h2>
            <p className="text-[var(--color-text-dim)] max-w-md mx-auto">
              The future of AI model trading is provable, private, and secure
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-300 opacity-0 animate-fade-in-up"
                style={{
                  animationFillMode: 'forwards',
                  animationDelay: `${index * 100 + 100}ms`
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-accent-dim)] transition-all">
                    <feature.icon className="w-5 h-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: '14px' }}>{feature.title}</h3>
                    <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="grid-bg" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-secondary)] via-transparent to-[var(--color-bg)]" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl mb-6">
            <span className="text-[var(--color-text)]">Ready to </span>
            <span className="text-gradient">Secure Your Models</span>
            <span className="text-[var(--color-text)]">?</span>
          </h2>
          <p className="text-lg text-[var(--color-text-dim)] mb-10 max-w-lg mx-auto">
            Join the next generation of AI model trading. Prove your work, protect your secrets.
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn-primary group"
          >
            {isConnecting ? (
              <>
                <Loader className="animate-spin w-4 h-4 mr-2" />
                Connecting...
              </>
            ) : (
              <>
                Connect Wallet
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[var(--color-accent)] flex items-center justify-center">
              <Box className="w-4 h-4 text-[var(--color-bg)]" />
            </div>
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: '12px' }}>BlackBox</span>
          </div>
          <p className="text-xs text-[var(--color-text-dim)]" style={{ fontFamily: 'var(--font-mono)' }}>
            Powered by RISC Zero • Midnight Network
          </p>
        </div>
      </footer>
    </div>
  );
};

function Upload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}