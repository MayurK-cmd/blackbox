import { create } from 'zustand';
import { Model, User, MidnightWalletState, MidnightProofPayload } from '../types';

interface AppState {
  user: User | null;
  models: Model[];
  wallet: MidnightWalletState;
  lastProof: MidnightProofPayload | null;
  setUser: (user: User | null) => void;
  setModels: (models: Model[]) => void;
  setWallet: (wallet: Partial<MidnightWalletState>) => void;
  setLastProof: (proof: MidnightProofPayload | null) => void;
  submitProof: (proof: MidnightProofPayload) => Promise<void>;
}

// Initial model data
const initialModels: Model[] = [
  {
    id: '1',
    provider: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    name: 'Advanced Neural Analysis Tree',
    description: 'High-performance neural analysis model optimized for geometric computations and spatial analysis. Provides accurate predictions for dimensional data processing.',
    inputFormat: 'JSON with dimensional parameters (length, breadth, height, width)',
    pricePerPrediction: 0.05,
    codeHash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    isActive: true,
    createdAt: '2024-03-15T08:30:00Z',
    updatedAt: '2024-03-15T12:45:00Z',
  }
];

export const useStore = create<AppState>((set) => ({
  user: null,
  models: initialModels,
  wallet: {
    isConnected: false,
    address: null,
    network: 'testnet',
  },
  lastProof: null,
  setUser: (user) => set({ user }),
  setModels: (models) => set({ models }),
  setWallet: (wallet) => set((state) => ({ wallet: { ...state.wallet, ...wallet } })),
  setLastProof: (proof) => set({ lastProof: proof }),
  submitProof: async (proof) => {
    set({ lastProof: { ...proof, status: 'pending' } });
    try {
      // Integrate with Midnight dApp Connector API here
      // const response = await midnightConnector.submitProof(proof);
      set({ lastProof: { ...proof, status: 'verified' } });
    } catch (error) {
      set({ lastProof: { ...proof, status: 'failed' } });
      console.error('Proof submission failed:', error);
    }
  },
}));
