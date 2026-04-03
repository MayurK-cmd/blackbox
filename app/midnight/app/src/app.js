"use strict";

/**
 * ZkML Marketplace – Midnight verification core
 *
 * Replaces zkverifyjs + ethers with the real Midnight stack:
 *
 *   @midnight-ntwrk/midnight-js-contracts                ^4.0.0
 *   @midnight-ntwrk/midnight-js-http-client-proof-provider ^4.0.0
 *   @midnight-ntwrk/midnight-js-indexer-public-data-provider ^4.0.0
 *   @midnight-ntwrk/midnight-js-node-zk-config-provider   ^4.0.0
 *   @midnight-ntwrk/midnight-js-network-id                ^4.0.0
 *   @midnight-ntwrk/compact-runtime                       ^0.15.0
 *
 * Flow:
 *  1. Resolve the deployed Compact contract via the Midnight indexer
 *  2. Call the `verifyInference` circuit locally → builds an UnboundTransaction
 *  3. Prove the transaction via the Midnight proof server
 *  4. Return the proved (but still unbalanced) tx to server.js
 *     → the user's Lace wallet balances it, signs it, and submits it
 *
 * Prerequisites:
 *  - Compact contract compiled:  compact compile zkml_marketplace.compact
 *    Artefacts must live at CONTRACT_ARTEFACTS_DIR (see .env)
 *  - Midnight proof server running:
 *    docker run -p 6300:6300 midnightnetwork/proof-server \
 *      -- 'midnight-proof-server --network testnet'
 *  - CONTRACT_ADDRESS set in .env (Bech32m address after first deploy)
 */

const path = require("path");
require("dotenv").config();

// ── Lazy-load Midnight SDK (graceful fallback when not installed) ─────────────
let findDeployedContract,
  httpClientProofProvider,
  indexerPublicDataProvider,
  NodeZkConfigProvider,
  setNetworkId,
  sdkLoaded = false;

try {
  ({ findDeployedContract } = require("@midnight-ntwrk/midnight-js-contracts"));
  ({ httpClientProofProvider } = require("@midnight-ntwrk/midnight-js-http-client-proof-provider"));
  ({ indexerPublicDataProvider } = require("@midnight-ntwrk/midnight-js-indexer-public-data-provider"));
  ({ NodeZkConfigProvider } = require("@midnight-ntwrk/midnight-js-node-zk-config-provider"));
  ({ setNetworkId } = require("@midnight-ntwrk/midnight-js-network-id"));
  sdkLoaded = true;
} catch (e) {
  console.warn("[app.js] Midnight SDK not found – will run in mock mode:", e.message);
}

// ── Lazy-load compiled Compact contract artefacts ────────────────────────────
let ZkMLMarketplaceContract, witnesses, contractLoaded = false;
try {
  const artefactsDir = process.env.CONTRACT_ARTEFACTS_DIR
    ?? path.join(__dirname, "contract", "managed", "zkml_marketplace");
  ({ ZkMLMarketplaceContract, witnesses } =
    require(path.join(artefactsDir, "contract", "index.cjs")));
  contractLoaded = true;
} catch (e) {
  console.warn("[app.js] Compact contract artefacts not found – will run in mock mode:", e.message);
}

// ── Network configuration (from .env) ────────────────────────────────────────
const NETWORK_ID    = process.env.MIDNIGHT_NETWORK      ?? "preprod";
const INDEXER_HTTP  = process.env.MIDNIGHT_INDEXER_HTTP ?? "https://indexer.preprod.midnight.network/api/v4/graphql";
const INDEXER_WS    = process.env.MIDNIGHT_INDEXER_WS   ?? "wss://indexer.preprod.midnight.network/api/v4/graphql/ws";
const PROVER_URI    = process.env.MIDNIGHT_PROVER_URI   ?? "http://localhost:6300";
const ARTEFACTS_DIR = process.env.CONTRACT_ARTEFACTS_DIR
  ?? path.join(__dirname, "contract", "managed", "zkml_marketplace");

// ── Singleton providers (initialised once, reused across requests) ───────────
let _proofProvider = null;
let _publicDataProvider = null;
let _zkConfigProvider = null;

function getProviders() {
  if (!sdkLoaded) throw new Error("Midnight SDK not loaded");

  if (!_proofProvider) {
    setNetworkId(NETWORK_ID);
    _proofProvider       = httpClientProofProvider(PROVER_URI);
    _publicDataProvider  = indexerPublicDataProvider(INDEXER_HTTP, INDEXER_WS);
    _zkConfigProvider    = new NodeZkConfigProvider(ARTEFACTS_DIR);
  }
  return {
    proofProvider:      _proofProvider,
    publicDataProvider: _publicDataProvider,
    zkConfigProvider:   _zkConfigProvider,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// run()  –  called by server.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} proofData          - { proof: string, pub_inputs: string, image_id: string }
 * @param {string[]} publicInputs     - legacy param (unused – pub_inputs is inside proofData)
 * @param {object} selectiveDisclosure - { revealModelProvider, revealInputHash,
 *                                         revealOutputResult, revealTimestamp }
 * @param {string} contractAddress    - Bech32m address of the deployed Compact contract
 * @param {string} inputHash          - hex-encoded sha256 of the inference inputs
 *
 * @returns {{ unbalancedTx, status, message }}  on success
 *          or a mock object when SDK/env is not configured
 */
async function run(proofData, publicInputs, selectiveDisclosure, contractAddress, inputHash) {
  console.log("[app.js] Starting Midnight verification...");
  console.log("[app.js] Network:", NETWORK_ID);
  console.log("[app.js] Selective disclosure config:", selectiveDisclosure);

  // ── Graceful mock fallback ─────────────────────────────────────────────────
  const missingConfig = !contractAddress || !inputHash;
  const missingSDK    = !sdkLoaded || !contractLoaded;

  if (missingSDK || missingConfig) {
    const reason = missingSDK
      ? "Midnight SDK or contract artefacts not installed"
      : "CONTRACT_ADDRESS or inputHash missing";
    console.warn(`[app.js] Mock mode – ${reason}`);
    return mockResponse(reason);
  }

  // ── Real Midnight flow ─────────────────────────────────────────────────────
  try {
    const { proofProvider, publicDataProvider, zkConfigProvider } = getProviders();

    // 1. Resolve the deployed contract from the Midnight indexer
    console.log("[app.js] Resolving contract at:", contractAddress);
    const deployedContract = await findDeployedContract(
      {
        // MidnightProvider shape expected by midnight-js-contracts
        publicDataProvider,
        zkConfigProvider,
        proofProvider,
      },
      {
        contract:     ZkMLMarketplaceContract,
        witnesses,
        privateStateId: "zkml-private-state",
      },
      contractAddress,   // Bech32m contract address
    );

    // 2. Build the unbound transaction by calling the Compact circuit locally.
    //
    //    Expected Compact circuit signature (zkml_marketplace.compact):
    //
    //      circuit verifyInference(
    //        proofBytes:      Bytes,
    //        pubInputs:       Bytes,
    //        imageId:         Bytes,
    //        inputHash:       Field,
    //        revealProvider:  Boolean,
    //        revealInput:     Boolean,
    //        revealOutput:    Boolean,
    //        revealTimestamp: Boolean,
    //      ): []
    //
    console.log("[app.js] Calling verifyInference circuit...");
    const unboundTx = await deployedContract.callTx.verifyInference(
      Buffer.from(proofData.proof,      "hex"),
      Buffer.from(proofData.pub_inputs, "hex"),
      Buffer.from(proofData.image_id,   "hex"),
      BigInt("0x" + inputHash.replace(/^0x/, "")),
      Boolean(selectiveDisclosure.revealModelProvider),
      Boolean(selectiveDisclosure.revealInputHash ?? selectiveDisclosure.revealInputData),
      Boolean(selectiveDisclosure.revealOutputResult),
      Boolean(selectiveDisclosure.revealTimestamp),
    );

    // 3. Prove the transaction using the Midnight proof server.
    //    This is the expensive step – the proof server generates the ZK proof.
    console.log("[app.js] Proving transaction via proof server at", PROVER_URI, "...");
    const provedTx = await unboundTx.prove(proofProvider, zkConfigProvider);

    console.log("[app.js] Transaction proved successfully.");

    // 4. Return proved-but-unbalanced tx to server.js.
    //    server.js sends it to the frontend; the user's Lace wallet calls
    //    balanceUnsealedTransaction() + submitTransaction().
    return {
      status:       "pending",
      message:      "Transaction proved. Awaiting wallet balance + submit.",
      unbalancedTx: provedTx,
      isValid:      true,
    };

  } catch (error) {
    console.error("[app.js] Midnight verification error:", error);

    // Surface the real error – don't silently swallow it like the old code did
    throw error;
  }
}

// ── Mock helper ───────────────────────────────────────────────────────────────

function mockResponse(reason) {
  return {
    status:       "mock",
    message:      `Mock verification active – ${reason}`,
    isValid:      true,
    unbalancedTx: null,
    txHash:       `mock-tx-${Date.now()}`,
    attestationId: Math.floor(Math.random() * 100000),
    note:         "Swap CONTRACT_ARTEFACTS_DIR + CONTRACT_ADDRESS in .env for real Midnight flow",
  };
}

module.exports = { run };