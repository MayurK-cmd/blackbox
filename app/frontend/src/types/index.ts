export interface Model {
  id: string;
  provider: string;           // Bech32m address (mn_addr1…)
  name: string;
  description: string;
  inputFormat: string;
  pricePerPrediction: bigint; // raw DUST units, not ETH float
  circuitHash: string;        // was codeHash – references Compact circuit artefact
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ProofInput {
  sepal_length: number;
  sepal_width: number;
  petal_length: number;
  petal_width: number;
}

export interface Risc0ProofData {
  proof: string;      // hex-encoded Groth16 proof bytes
  pub_inputs: string; // hex-encoded public inputs
  image_id: string;   // Risc0 guest image ID
}

export interface ProofData {
  modelResponse: unknown;
  risc0: Risc0ProofData;
}

export interface VerificationData {
  isValid: boolean;
  verificationHash: string;
  timestamp: string;
  details: {
    modelName: string;
    inputParameters: ProofInput;
    computationTime: string;
    confidence: number;
  };
}

// ── Midnight wallet ───────────────────────────────────────────────────────────

export interface MidnightConnectedAPI {
  getConfiguration(): Promise<MidnightServiceConfig>;
  getUnshieldedAddress(): Promise<string>;
  getShieldedAddresses(): Promise<{ shieldedAddress: string }>;
  getUnshieldedBalances(): Promise<Record<string, bigint>>;
  getDustBalance(): Promise<bigint>;
  balanceUnsealedTransaction(tx: unknown): Promise<{ tx: unknown }>;
  submitTransaction(tx: unknown): Promise<{ txHash: string }>;
}

export interface MidnightServiceConfig {
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
  substrateNodeUri: string;
  networkId: string;
}

export interface MidnightWalletState {
  isConnected: boolean;
  unshieldedAddress: string | null;  // Bech32m (mn_addr1…)
  shieldedAddress: string | null;
  networkId: 'mainnet' | 'preprod' | 'devnet';
  nightBalance: bigint;
  dustBalance: bigint;
  connectedAPI: MidnightConnectedAPI | null;
}

// ── Selective disclosure ──────────────────────────────────────────────────────

export interface SelectiveDisclosureConfig {
  revealModelProvider: boolean;
  revealInputData: boolean;      // maps to revealInputHash in Compact circuit
  revealOutputResult: boolean;
  revealTimestamp: boolean;
}

// ── Proof payload ─────────────────────────────────────────────────────────────

export interface MidnightProofPayload {
  risc0: Risc0ProofData;
  inputHash: string;             // hex sha256 of inference inputs
  selectiveDisclosure: SelectiveDisclosureConfig;
  contractAddress: string;       // Bech32m address of deployed Compact contract
  txHash?: string;
  error?: string;
  status: 'pending' | 'proving' | 'submitting' | 'confirmed' | 'failed';
}