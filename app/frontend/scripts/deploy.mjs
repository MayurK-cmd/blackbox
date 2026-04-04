import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { WalletBuilder } from '@midnight-ntwrk/wallet-sdk-hd';
import { createRequire } from 'module';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const require = createRequire(import.meta.url);
const { ZkMLMarketplaceContract, witnesses } =
  require('../contract/managed/zkml_marketplace/contract/index.cjs');

setNetworkId('undeployed');

const INDEXER_HTTP = 'http://localhost:8088/api/v4/graphql';
const INDEXER_WS   = 'ws://localhost:8088/api/v4/graphql/ws';
const PROVER_URI   = 'http://localhost:6300';
const ARTEFACTS    = path.resolve('./contract/managed/zkml_marketplace');

// Build a headless wallet from seed phrase in .env
const wallet = await WalletBuilder.buildFromSeed(
  INDEXER_HTTP, INDEXER_WS, PROVER_URI,
  'http://localhost:9944',
  process.env.DEPLOY_SEED_PHRASE,
  'undeployed',
);

await wallet.start();

const provider = {
  publicDataProvider:  indexerPublicDataProvider(INDEXER_HTTP, INDEXER_WS),
  zkConfigProvider:    new NodeZkConfigProvider(ARTEFACTS),
  proofProvider:       httpClientProofProvider(PROVER_URI),
  walletProvider:      wallet,
  midnightProvider:    wallet,
};

console.log('Deploying ZkML Marketplace contract...');
const deployed = await deployContract(provider, {
  contract: ZkMLMarketplaceContract,
  witnesses,
  privateStateId: 'zkml-private-state',
  initialPrivateState: {},
});

const address = deployed.deployTxData.public.contractAddress;
console.log('\n✅ Contract deployed!');
console.log('CONTRACT_ADDRESS=' + address);
console.log('\nAdd this to your .env file.');