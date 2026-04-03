import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia, arbitrumSepolia } from 'wagmi/chains';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import App from './App.tsx';
import './index.css';
import { createPublicClient, http } from 'viem';

const config = getDefaultConfig({
  appName: 'zkProof Marketplace',
  projectId: '9671caea98d5aa1bb322958678c935e9',
  chains: [mainnet, sepolia, arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(''),
  },
});

const queryClient = new QueryClient();

export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />   {/* ← No Cardano provider needed at root level */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);