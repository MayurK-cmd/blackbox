import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import crypto from "crypto";
import dotenv from "dotenv";

// ── Static SDK imports ────────────────────────────────────────────────────────
import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const zkConfigPath = process.env.CONTRACT_ARTEFACTS_DIR
  ? path.dirname(process.env.CONTRACT_ARTEFACTS_DIR)  // goes up one level
  : path.join(__dirname, "managed", "contract");

const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

console.log("[app.js] CONTRACT_ARTEFACTS_DIR:", process.env.CONTRACT_ARTEFACTS_DIR);
console.log("[app.js] Midnight SDK loaded successfully.");

// ── Load contract artefacts ───────────────────────────────────────────────────
let MidnightContract, witnesses, contractLoaded = false;

try {
  const artefactsDir = process.env.CONTRACT_ARTEFACTS_DIR
    ?? path.join(__dirname, "managed", "contract", "contract");
  const require = createRequire(import.meta.url);
  const artefacts = require(path.join(artefactsDir, "index.js"));
  MidnightContract = artefacts.Contract;
  witnesses = {};
  contractLoaded = true;
  console.log("[app.js] Contract artefacts loaded successfully.");
} catch (e) {
  console.warn("[app.js] Contract artefacts not found – mock mode:", e.message);
}

// ── Network config ────────────────────────────────────────────────────────────
const NETWORK_ID   = process.env.MIDNIGHT_NETWORK      ?? "preview";
const INDEXER_HTTP = process.env.MIDNIGHT_INDEXER_HTTP ?? "https://indexer.preview.midnight.network/api/v4/graphql";
const INDEXER_WS   = process.env.MIDNIGHT_INDEXER_WS   ?? "wss://indexer.preview.midnight.network/api/v4/graphql/ws";

// ── Singleton public data provider ───────────────────────────────────────────
let _publicDataProvider = null;

function getPublicDataProvider() {
  if (!_publicDataProvider) {
    setNetworkId(NETWORK_ID);
    _publicDataProvider = indexerPublicDataProvider(INDEXER_HTTP, INDEXER_WS);
  }
  return _publicDataProvider;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function hexToBytes(hex) {
  return Buffer.from(hex.replace(/^0x/, '').padEnd(64, '0'), 'hex');
}

function hashToField(hex) {
  return BigInt('0x' + hex.replace(/^0x/, '').padStart(64, '0').slice(0, 64));
}

// ── run() ─────────────────────────────────────────────────────────────────────
export async function run(proofData, publicInputs, selectiveDisclosure, contractAddress, inputHash, submitterPublicKey, proverServerUri) {
  console.log("[app.js] Starting Midnight verification...");
  console.log("[app.js] Network:", NETWORK_ID);
  console.log("[app.js] Prover URI:", proverServerUri ?? process.env.MIDNIGHT_ZK_CONFIG_URL ?? "(not set)");

  if (!contractLoaded) {
    console.warn("[app.js] Mock mode – contract artefacts not loaded");
    return mockResponse("Contract artefacts not loaded");
  }

  if (!contractAddress) {
    console.warn("[app.js] Mock mode – CONTRACT_ADDRESS missing");
    return mockResponse("CONTRACT_ADDRESS missing");
  }

  try {
    const publicDataProvider = getPublicDataProvider();

    // zkConfigProvider uses proverServerUri from wallet config
    const zkConfigUrl = proverServerUri
      ?? process.env.MIDNIGHT_ZK_CONFIG_URL
      ?? "http://localhost:6300";
    
    const zkConfigProvider = new FetchZkConfigProvider(zkConfigUrl);

    // CompiledContract.make() sets correct internal Symbol for findDeployedContract
    const base = CompiledContract.make('zkml-marketplace', MidnightContract);
    const compiledContract = CompiledContract.withWitnesses(base, witnesses);

    const privateStateProvider = levelPrivateStateProvider({
      privateStateStoreName: 'zkml-private-state',
      privateStoragePasswordProvider: () => process.env.PRIVATE_STATE_PASSWORD ?? 'zkml-marketplace-secret-password-2024',
      accountId: submitterPublicKey ?? 'zkml-server-account',
    });

    const bareAddress = contractAddress.replace(/^0x/, '');
    console.log("[app.js] Resolving contract:", bareAddress);

    const deployedContract = await findDeployedContract(
      {
        publicDataProvider,
        zkConfigProvider,
        privateStateProvider,
      },
      {
        compiledContract,
        contractAddress: bareAddress,
      },
    );

    // ── Prepare circuit arguments ─────────────────────────────────────────────
    const proofBytes     = Buffer.from(proofData.proof,      "hex");
    const pubInputsBytes = Buffer.from(proofData.pub_inputs, "hex");
    const imageIdBytes   = Buffer.from(proofData.image_id,   "hex");

    const proofHash     = Buffer.from(crypto.createHash('sha256').update(proofBytes).digest());
    const pubInputsHash = Buffer.from(crypto.createHash('sha256').update(pubInputsBytes).digest());

    const submitterPk  = submitterPublicKey ? hexToBytes(submitterPublicKey) : Buffer.alloc(32, 0);
    const providerCode = hashToField(submitterPublicKey ?? '00');
    const inputCode    = hashToField(inputHash ?? '00');
    const outputCode   = 0n;
    const timestamp    = BigInt(Math.floor(Date.now() / 1000));

    console.log("[app.js] Calling submit_proof circuit...");
    const unboundTx = await deployedContract.callTx.submit_proof(
      submitterPk,
      proofHash,
      pubInputsHash,
      imageIdBytes,
      Boolean(selectiveDisclosure.revealModelProvider),
      providerCode,
      Boolean(selectiveDisclosure.revealInputData ?? selectiveDisclosure.revealInputHash),
      inputCode,
      Boolean(selectiveDisclosure.revealOutputResult),
      outputCode,
      Boolean(selectiveDisclosure.revealTimestamp),
      timestamp,
    );

    console.log("[app.js] Unbound transaction built. Returning to frontend for wallet proving.");

    return {
      status:       "pending",
      message:      "Transaction built. Wallet will prove and submit.",
      unbalancedTx: unboundTx,
      isValid:      true,
    };

  } catch (error) {
    console.error("[app.js] Midnight verification error:", error);
    throw error;
  }
}

function mockResponse(reason) {
  return {
    status:        "mock",
    message:       `Mock verification active – ${reason}`,
    isValid:       true,
    unbalancedTx:  null,
    txHash:        `mock-tx-${Date.now()}`,
    attestationId: Math.floor(Math.random() * 100000),
    note:          "Set CONTRACT_ARTEFACTS_DIR and CONTRACT_ADDRESS in .env to enable real flow",
  };
}