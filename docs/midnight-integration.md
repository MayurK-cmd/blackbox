# Midnight Network Integration — ZkML Marketplace

## What Was Here Before

The project was originally built on the **EVM stack**:
- Wallet: MetaMask / RainbowKit / Wagmi
- Smart contract: `ZkMLMarketplace.sol` (Solidity, deployed on Arbitrum Sepolia)
- ZK proof verification: `zkverifyjs` (separate Substrate-based chain)
- On-chain attestation: Merkle proof via `IZkVerifyAttestation.sol`
- Frontend state: Wagmi hooks (`useAccount`, `useWriteContract`, `useReadContract`)

None of this touched Midnight. The "Midnight types" in the codebase were placeholders with no real SDK calls.

---

## What Is Now on Midnight Network

### 1. Wallet — Lace (Midnight-native)
- Replaced RainbowKit / MetaMask entirely
- Connects via `window.midnight.<walletId>.connect(networkId)` — the Midnight DApp Connector API v4
- Pulls Bech32m addresses (`mn_addr_preprod1...`), NIGHT balance, DUST balance, and `proverServerUri` from wallet config
- Wallet state stored in Zustand (`MidnightWalletState`)
- Route guards in `App.tsx` read from Zustand instead of wagmi hooks

### 2. Smart Contract — Compact (Midnight-native)
- Replaced `ZkMLMarketplace.sol` with `zkml_marketplace.compact` written in Midnight's **Compact** language
- Deployed to **Midnight Preview testnet** at:
  ```
  b29b48553959747cb33fb3e9d9104f2621faf6f466299c034e0e2b9d4e228b09
  ```
- Explorer: https://explorer.1am.xyz/contract/b29b48553959747cb33fb3e9d9104f2621faf6f466299c034e0e2b9d4e228b09?network=preview

**What the contract does:**
- Maintains a public ledger of verified ML inference proofs
- `submit_proof` circuit — records proof hash, pub_inputs hash, image ID, and submitter public key on-chain
- `check_verification` circuit — lets anyone verify a submitter has a recorded proof
- `set_registry_open` circuit — admin gate for the registry
- **Selective disclosure** — each submission independently controls which fields are revealed on the public ledger (`revealModelProvider`, `revealInputData`, `revealOutputResult`, `revealTimestamp`)

### 3. ZK Proof Verification — Midnight Native
- Replaced `zkverifyjs` + Ethereum attestation contracts entirely
- No external attestation chain needed — Midnight verifies ZK proofs natively at the protocol level
- Proof bytes, public inputs, and image ID are hashed and committed to the Midnight ledger
- The Risc0 proof is kept **off-chain** (private) — only its hash goes on-chain

### 4. Backend (`app.js` + `server.js`)
- Removed: `zkverifyjs`, `ethers`, `attestation.json` file, EVM contract calls, mock fallbacks
- Added: full Midnight JS SDK integration
  - `@midnight-ntwrk/midnight-js-contracts` — resolves deployed contract from indexer
  - `@midnight-ntwrk/midnight-js-indexer-public-data-provider` — queries Midnight preview indexer
  - `@midnight-ntwrk/midnight-js-level-private-state-provider` — manages local ZK private state
  - `@midnight-ntwrk/midnight-js-fetch-zk-config-provider` — fetches verifier keys
  - `@midnight-ntwrk/compact-js` — wraps contract with correct internal context for SDK
- Flow: receives proof payload → resolves contract → calls `submit_proof` circuit → returns unbound transaction to frontend

### 5. Frontend Transaction Submission
- Replaced `writeContract` + `waitForTransactionReceipt` (wagmi/viem)
- New flow:
  1. Backend builds unbound transaction (circuit call without proof)
  2. Frontend calls `wallet.connectedAPI.balanceUnsealedTransaction(tx)` — wallet adds fees and generates ZK proof internally using its own prover
  3. Frontend calls `wallet.connectedAPI.submitTransaction(tx)` — submits to Midnight network
  4. Tx hash recorded in Zustand, shown in UI

### 6. Frontend Pages
- `LandingPage.tsx` — removed RainbowKit, connects via `connectWallet()` from Zustand
- `Layout.tsx` — removed wagmi/Cardano connector, shows Bech32m address from Zustand
- `UploadPage.tsx` — removed EVM contract registration, saves models to Zustand store locally
- `ExplorePage.tsx` — removed `useReadContract`, reads from Zustand store
- `ModelDetailsPage.tsx` — removed wagmi hooks, submits proof via `submitProof()` from Zustand
- `App.tsx` / `main.tsx` — removed `WagmiProvider`, `RainbowKitProvider`, `QueryClientProvider` entirely

### 7. Types
- `Model.pricePerPrediction`: `number` (ETH) → `bigint` (raw DUST units)
- `Model.codeHash` → `Model.circuitHash` (references Compact circuit artefact)
- `MidnightWalletState`: `address/network` → `unshieldedAddress/shieldedAddress/networkId/nightBalance/dustBalance/connectedAPI/proverServerUri`
- `MidnightProofPayload`: `proof: string` → `risc0: Risc0ProofData` with proper status values

---

## How the Full Flow Works Now

```
User fills ML inputs (sepal_length, sepal_width, etc.)
          ↓
Frontend POSTs to Express /verify with:
  { risc0: {proof, pub_inputs, image_id}, inputHash, selectiveDisclosure,
    contractAddress, submitterPublicKey, proverServerUri }
          ↓
app.js resolves contract from Midnight indexer
          ↓
app.js calls submit_proof Compact circuit locally
  → builds UnboundTransaction (no proof yet)
          ↓
Returns unbalancedTx to frontend
          ↓
Lace wallet: balanceUnsealedTransaction()
  → adds DUST fees, generates ZK proof via prover server
          ↓
Lace wallet: submitTransaction()
  → broadcasts to Midnight preview network
          ↓
Transaction confirmed on-chain
  → proof hash, selective disclosure flags recorded on Midnight ledger
  → txHash shown in UI
```

---

## What Is Left

### 🔴 Blocking (must fix before end-to-end works)

**Verifier key files missing**
- `findDeployedContract` requires `.verifier` key files for each circuit:
  - `submit_proof.verifier`
  - `check_verification.verifier`
  - `set_registry_open.verifier`
- These are generated by running `compact compile zkml_marketplace.compact` in WSL
- WSL issue: `compact u 0.30.0` reports installed but `compact compile` fails
- Fix: run `~/.local/bin/compact u 0.30.0` then `~/.local/bin/compact compile`
- Once keys exist at `managed/contract/contract/keys/`, switch `app.js` to `NodeZkConfigProvider`

### 🟡 Nice to Have (not blocking demo)

**Risc0 proof generation**
- `ModelDetailsPage` calls `localhost:3000/generate-proof` for real ZK proofs
- Requires Rust + Risc0 toolchain
- For demo: can hardcode valid-looking hex strings in the frontend to demonstrate the Midnight submission flow without real Risc0 proofs

**On-chain model registry**
- Models currently stored only in Zustand (in-memory, lost on refresh)
- A second Compact contract for model registration would make this persistent
- Not needed for hackathon demo — initial model is hardcoded in the store

**`set_registry_open` admin flow**
- Contract has a registry open/close gate but no UI for it yet
- Default state at deploy time needs to be confirmed as `open`

---

## Packages Added (backend)
```
@midnight-ntwrk/compact-js
@midnight-ntwrk/compact-runtime
@midnight-ntwrk/midnight-js-contracts
@midnight-ntwrk/midnight-js-http-client-proof-provider
@midnight-ntwrk/midnight-js-indexer-public-data-provider
@midnight-ntwrk/midnight-js-level-private-state-provider
@midnight-ntwrk/midnight-js-fetch-zk-config-provider
@midnight-ntwrk/midnight-js-network-id
@midnight-ntwrk/midnight-js-node-zk-config-provider
```

## Packages Removed (frontend)
```
wagmi
@rainbow-me/rainbowkit
viem
@tanstack/react-query
@newm.io/cardano-dapp-wallet-connector
zkverifyjs
ethers
```