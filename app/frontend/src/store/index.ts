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
  connectWallet: (networkId?: 'mainnet' | 'preview' | 'preprod' | 'undeployed' | 'devnet') => Promise<void>;
  disconnectWallet: () => void;
  submitProof: (proof: MidnightProofPayload) => Promise<void>;
}

const initialModels: Model[] = [
  {
    id: '1',
    provider: 'mn_addr1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5zxujb2jml8lnmhaes02ygzx',
    name: 'Advanced Neural Analysis Tree',
    description: 'High-performance neural analysis model optimized for geometric computations and spatial analysis.',
    inputFormat: 'JSON with dimensional parameters (sepal_length, sepal_width, petal_length, petal_width)',
    pricePerPrediction: 50_000n,
    circuitHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    isActive: true,
    createdAt: '2024-03-15T08:30:00Z',
    updatedAt: '2024-03-15T12:45:00Z',
  }
];

const emptyWallet: MidnightWalletState = {
  isConnected: false,
  unshieldedAddress: null,
  shieldedAddress: null,
  networkId: 'preview',
  nightBalance: 0n,
  dustBalance: 0n,
  connectedAPI: null,
  proverServerUri: null,
};

export const useStore = create<AppState>((set, get) => ({
  user: null,
  models: initialModels,
  wallet: emptyWallet,
  lastProof: null,

  setUser: (user) => set({ user }),
  setModels: (models) => set({ models }),
  setWallet: (wallet) => set((state) => ({ wallet: { ...state.wallet, ...wallet } })),
  setLastProof: (proof) => set({ lastProof: proof }),

  // ── connectWallet ──────────────────────────────────────────────────────────
  connectWallet: async (networkId = 'preview') => {
    const injected = (window as any).midnight ?? {};
    const wallets = Object.values(injected) as any[];

    if (wallets.length === 0) {
      throw new Error('No Midnight wallet detected. Please install Lace or 1AM wallet.');
    }

    const wallet = wallets[0];
    console.log('Connecting to wallet:', wallet.name, 'apiVersion:', wallet.apiVersion);

    const connectedAPI = await wallet.connect(networkId);

    // Get config to extract proverServerUri
    const config = await connectedAPI.getConfiguration();
    console.log('Wallet config:', config);

    const [
      unshieldedAddressResult,
      shieldedAddressResult,
      unshieldedBalances,
      dustBalance,
    ] = await Promise.all([
      connectedAPI.getUnshieldedAddress(),
      connectedAPI.getShieldedAddresses(),
      connectedAPI.getUnshieldedBalances(),
      connectedAPI.getDustBalance(),
    ]);

    // Lace v4 returns { unshieldedAddress: '...' } not a plain string
    const unshieldedAddress = typeof unshieldedAddressResult === 'string'
      ? unshieldedAddressResult
      : (unshieldedAddressResult as any).unshieldedAddress;

    const shieldedAddress = typeof shieldedAddressResult === 'string'
      ? shieldedAddressResult
      : (shieldedAddressResult as any).shieldedAddress;

    const nightBalance = Object.values(unshieldedBalances)[0] as bigint ?? 0n;

    set({
      wallet: {
        isConnected: true,
        unshieldedAddress,
        shieldedAddress,
        networkId: config.networkId as any ?? networkId,
        nightBalance,
        dustBalance,
        connectedAPI,
        proverServerUri: config.proverServerUri ?? null,
      },
    });
  },

  // ── disconnectWallet ───────────────────────────────────────────────────────
  disconnectWallet: () => set({ wallet: emptyWallet }),

  // ── submitProof ────────────────────────────────────────────────────────────
  submitProof: async (proof) => {
    const { wallet } = get();

    if (!wallet.isConnected || !wallet.connectedAPI) {
      throw new Error('Wallet not connected.');
    }

    set({ lastProof: { ...proof, status: 'pending' } });

    try {
      // Step 1 — POST to backend, get unbound tx back
      const response = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof:             proof.risc0,
          selectiveDisclosure: proof.selectiveDisclosure,
          contractAddress:   proof.contractAddress,
          inputHash:         proof.inputHash,
          submitterPublicKey: wallet.unshieldedAddress,
          proverServerUri:   wallet.proverServerUri,  // ← from wallet config
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(err.message ?? 'Backend /verify failed');
      }

      const data = await response.json();

      // Pre-verified bypass mode
      if (data.status === 'verified') {
        set({ lastProof: { ...proof, status: 'confirmed', txHash: data.txHash } });
        return;
      }

      set({ lastProof: { ...proof, status: 'proving' } });

      // Step 2 — wallet balances + submits (wallet handles proving internally)
      const balanceResult = await wallet.connectedAPI.balanceUnsealedTransaction(data.unbalancedTx);
      const balancedTx = (balanceResult as any).tx ?? balanceResult;

      set({ lastProof: { ...proof, status: 'submitting' } });

      const submitResult = await wallet.connectedAPI.submitTransaction(balancedTx);
      const txHash = typeof submitResult === 'string'
        ? submitResult
        : (submitResult as any).txHash;

      set({ lastProof: { ...proof, status: 'confirmed', txHash } });

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ lastProof: { ...proof, status: 'failed', error: message } });
      throw error;
    }
  },
}));