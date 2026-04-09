export interface Model {
  id: string;
  provider: string;
  name: string;
  description: string;
  inputFormat: string;
  pricePerPrediction: bigint;
  circuitHash: string;
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
  proof: string;
  pub_inputs: string;
  image_id: string;
}

export interface ProofData {
  modelResponse: unknown;
  risc0: Risc0ProofData;
}

export interface MidnightConnectedAPI {
  getConfiguration(): Promise<MidnightServiceConfig>;
  getUnshieldedAddress(): Promise<string | { unshieldedAddress: string }>;
  getShieldedAddresses(): Promise<{ shieldedAddress: string; shieldedCoinPublicKey: string; shieldedEncryptionPublicKey: string }>;
  getUnshieldedBalances(): Promise<Record<string, bigint>>;
  getDustBalance(): Promise<bigint>;
  balanceUnsealedTransaction(tx: unknown): Promise<{ tx: unknown }>;
  submitTransaction(tx: unknown): Promise<{ txHash: string } | string>;
}

export interface MidnightServiceConfig {
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
  substrateNodeUri?: string;
  networkId: string;
}

export interface MidnightWalletState {
  isConnected: boolean;
  unshieldedAddress: string | null;
  shieldedAddress: string | null;
  networkId: 'mainnet' | 'preview' | 'preprod' | 'undeployed' | 'devnet';
  nightBalance: bigint;
  dustBalance: bigint;
  connectedAPI: MidnightConnectedAPI | null;
  proverServerUri: string | null;
}

export interface SelectiveDisclosureConfig {
  revealModelProvider: boolean;
  revealInputData: boolean;
  revealOutputResult: boolean;
  revealTimestamp: boolean;
}

export interface MidnightProofPayload {
  risc0: Risc0ProofData;
  inputHash: string;
  selectiveDisclosure: SelectiveDisclosureConfig;
  contractAddress: string;
  txHash?: string;
  error?: string;
  status: 'pending' | 'proving' | 'submitting' | 'confirmed' | 'failed';
}