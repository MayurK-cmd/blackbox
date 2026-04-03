import { create } from 'zustand';
import { Model, User, MidnightWalletState, MidnightProofPayload } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001';

interface AppState {
  user: User | null;
  models: Model[];
  wallet: MidnightWalletState;
  lastProof: MidnightProofPayload | null;
  setUser: (user: User | null) => void;
  setModels: (models: Model[]) => void;
  setWallet: (wallet: Partial<MidnightWalletState>) => void;
  setLastProof: (proof: MidnightProofPayload | null) => void;
  connectWallet: (networkId?: 'mainnet' | 'preprod' | 'devnet') => Promise<void>;
  disconnectWallet: () => void;
  submitProof: (proof: MidnightProofPayload) => Promise<void>;
}

const initialModels: Model[] = [
  {
    id: '1',
    provider: 'mn_addr1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5zxujb2jml8lnmhaes02ygzx',
    name: 'Advanced Neural Analysis Tree',
    description: 'High-performance neural analysis model optimized for geometric computations and spatial analysis. Provides accurate predictions for dimensional data processing.',
    inputFormat: 'JSON with dimensional parameters (sepal_length, sepal_width, petal_length, petal_width)',
    pricePerPrediction: 50_000n,   // raw DUST units
    circuitHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    isActive: true,
    createdAt: '2024-03-15T08:30:00Z',
    updatedAt: '2024-03-15T12:45:00Z',
  }
];

export const useStore = create<AppState>((set, get) => ({
  user: null,
  models: initialModels,
  wallet: {
    isConnected: false,
    unshieldedAddress: null,
    shieldedAddress: null,
    networkId: 'preprod',
    nightBalance: 0n,
    dustBalance: 0n,
    connectedAPI: null,
  },
  lastProof: null,

  setUser: (user) => set({ user }),
  setModels: (models) => set({ models }),
  setWallet: (wallet) => set((state) => ({ wallet: { ...state.wallet, ...wallet } })),
  setLastProof: (proof) => set({ lastProof: proof }),

  // ── connectWallet ──────────────────────────────────────────────────────────
  connectWallet: async (networkId = 'preprod') => {
    const injected = (window as any).midnight ?? {};
    const wallets = Object.values(injected) as any[];

    if (wallets.length === 0) {
      throw new Error('No Midnight wallet detected. Please install Lace wallet.');
    }

    const connectedAPI = await wallets[0].connect(networkId);

    const [
      unshieldedAddress,
      { shieldedAddress },
      unshieldedBalances,
      dustBalance,
    ] = await Promise.all([
      connectedAPI.getUnshieldedAddress(),
      connectedAPI.getShieldedAddresses(),
      connectedAPI.getUnshieldedBalances(),
      connectedAPI.getDustBalance(),
    ]);

    const nightBalance = Object.values(unshieldedBalances)[0] as bigint ?? 0n;

    set({
      wallet: {
        isConnected: true,
        unshieldedAddress,
        shieldedAddress,
        networkId,
        nightBalance,
        dustBalance,
        connectedAPI,
      },
    });
  },

  // ── disconnectWallet ───────────────────────────────────────────────────────
  disconnectWallet: () => {
    set({
      wallet: {
        isConnected: false,
        unshieldedAddress: null,
        shieldedAddress: null,
        networkId: 'preprod',
        nightBalance: 0n,
        dustBalance: 0n,
        connectedAPI: null,
      },
    });
  },

  // ── submitProof ────────────────────────────────────────────────────────────
  submitProof: async (proof) => {
    const { wallet } = get();

    if (!wallet.isConnected || !wallet.connectedAPI) {
      throw new Error('Wallet not connected.');
    }

    set({ lastProof: { ...proof, status: 'pending' } });

    try {
      // Step 1 – POST to Express backend, get proved unbalanced tx back
      const response = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof:               proof.risc0,
          selectiveDisclosure: proof.selectiveDisclosure,
          contractAddress:     proof.contractAddress,
          inputHash:           proof.inputHash,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(err.message ?? 'Backend /verify failed');
      }

      const data = await response.json();

      // Mock mode – no SDK configured yet
      if (data.status === 'mock') {
        set({ lastProof: { ...proof, status: 'confirmed', txHash: data.txHash } });
        return;
      }

      set({ lastProof: { ...proof, status: 'proving' } });

      // Step 2 – balance + submit via Lace wallet
      const { tx: balancedTx } = await wallet.connectedAPI.balanceUnsealedTransaction(data.unbalancedTx);
      const { txHash }         = await wallet.connectedAPI.submitTransaction(balancedTx);

      set({ lastProof: { ...proof, status: 'confirmed', txHash } });

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ lastProof: { ...proof, status: 'failed', error: message } });
      throw error;
    }
  },
}));