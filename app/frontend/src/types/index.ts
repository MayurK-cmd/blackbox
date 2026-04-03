export interface Model {
  id: string;
  provider: string;
  name: string;
  description: string;
  inputFormat: string;
  pricePerPrediction: number;
  codeHash: string;
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

export interface ProofData {
  modelResponse: any;
  proofData: {
    proof: string;
    pub_inputs: string;
    image_id: string;
  };
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

// Midnight Network Specific Types
export interface MidnightWalletState {
  isConnected: boolean;
  address: string | null;
  network: 'mainnet' | 'testnet' | 'devnet';
  balance?: string;
}

export interface SelectiveDisclosureConfig {
  revealModelProvider: boolean;
  revealInputData: boolean;
  revealOutputResult: boolean;
  revealTimestamp: boolean;
}

export interface MidnightProofPayload {
  proof: string;
  publicInputs: string[];
  selectiveDisclosure: SelectiveDisclosureConfig;
  attestationId?: string;
  txHash?: string;
  status: 'pending' | 'verified' | 'failed';
}
