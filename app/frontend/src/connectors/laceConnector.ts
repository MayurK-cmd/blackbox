import { CardanoDappWalletConnector } from '@newm.io/cardano-dapp-wallet-connector';

export const laceConnector = new CardanoDappWalletConnector({
  supportedWallets: ['lace'],
  walletConnectProjectId: undefined,
});

export type LaceWallet = {
  name: string;
  icon: string;
  connected: boolean;
  stakeKey?: string;
  balance?: string;
  address?: string;
};

export const connectLace = async (): Promise<LaceWallet | null> => {
  try {
    await laceConnector.connect('lace');

    const balance = await laceConnector.getBalance();
    const addresses = await laceConnector.getAddresses();
    const stakeKey = await laceConnector.getChangeAddress();

    return {
      name: 'Lace',
      icon: 'https://www.lace.io/favicon.ico',
      connected: true,
      balance: balance?.lovelace.toString(),
      address: addresses?.[0],
      stakeKey,
    };
  } catch (error) {
    console.error('Failed to connect Lace wallet:', error);
    return null;
  }
};

export const disconnectLace = async () => {
  await laceConnector.disconnect();
};

export const getLaceBalance = async () => {
  const balance = await laceConnector.getBalance();
  return balance?.lovelace.toString() || '0';
};

export const getLaceAddress = async () => {
  const addresses = await laceConnector.getAddresses();
  return addresses?.[0] || null;
};

export const signData = async (data: string) => {
  const signedData = await laceConnector.signData(data);
  return signedData;
};
