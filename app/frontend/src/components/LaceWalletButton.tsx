import { useState } from 'react';
import { useConnectWallet } from '@newm.io/cardano-dapp-wallet-connector';
import { Wallet } from 'lucide-react';

export function LaceWalletButton() {
  const { wallet, connect, disconnect, isConnected } = useConnectWallet('lace');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect Lace wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect Lace wallet:', error);
    }
  };

  if (isConnected && wallet) {
    return (
      <button
        onClick={handleDisconnect}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span>Lace Connected</span>
        {wallet.balance && (
          <span className="text-xs opacity-80">
            {(parseInt(wallet.balance) / 1000000).toFixed(2)} ADA
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg text-white text-sm font-medium transition-colors"
    >
      <Wallet className="w-4 h-4" />
      <span>{isConnecting ? 'Connecting...' : 'Connect Lace'}</span>
    </button>
  );
}
