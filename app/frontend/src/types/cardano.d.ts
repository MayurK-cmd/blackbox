import { Cardano } from '@cardano-sdk/core';

declare global {
  interface Window {
    cardano?: {
      lace?: {
        name: string;
        icon: string;
        apiVersion: string;
        enable(): Promise<CardanoWalletApi>;
      };
    };
  }
}

export interface CardanoWalletApi {
  getUsedAddresses(): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getChangeAddress(): Promise<string>;
  getBalance(): Promise<string>;
  getUtxos(): Promise<string>;
  getCollateral(): Promise<string>;
  sendTransaction(transaction: string): Promise<string>;
  signData(data: string): Promise<{ signature: string; key: string }>;
}
