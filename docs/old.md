## Video Tutorial
https://youtu.be/AfbtoJ8n_EQ

## Overview
This Marketplace is a decentralized platform that enables machine learning model providers to offer privacy-preserving predictions. Powered by **ZkVerify and Arbitrum**, our solution generates zero-knowledge proofs (zk-proofs) that validate prediction correctness without exposing the underlying model logic or sensitive input data.
Our initial proof-of-concept uses the classic Iris model—a decision tree trained on the well-known Iris dataset—to demonstrate how sensitive ML models can deliver accurate predictions while keeping proprietary details confidential.



## Directory Structure
It is possible to organize the files for these components in various ways.
However, in this starter template we use a standard directory structure for zkVM applications, which we think is a good starting point for your applications.

```text
project_name
├── Cargo.toml
├── host
│   ├── Cargo.toml
│   └── src
│       └── main.rs                    <-- [Host code goes here]
└── methods
    ├── Cargo.toml
    ├── build.rs
    ├── guest
    │   ├── Cargo.toml
    │   └── src
    │       └── method_name.rs         <-- [Guest code goes here]
    └── src
        └── lib.rs
```



[bonsai access]: https://bonsai.xyz/apply
[cargo-risczero]: https://docs.rs/cargo-risczero
[crates]: https://github.com/risc0/risc0/blob/main/README.md#rust-binaries
[dev-docs]: https://dev.risczero.com
[dev-mode]: https://dev.risczero.com/api/generating-proofs/dev-mode
[discord]: https://discord.gg/risczero
[docs.rs]: https://docs.rs/releases/search?query=risc0
[examples]: https://github.com/risc0/risc0/tree/main/examples
[risc0-build]: https://docs.rs/risc0-build
[risc0-repo]: https://www.github.com/risc0/risc0
[risc0-zkvm]: https://docs.rs/risc0-zkvm
[rust-toolchain]: rust-toolchain.toml
[rustup]: https://rustup.rs
[twitter]: https://twitter.com/risczero
[zkhack-iii]: https://www.youtube.com/watch?v=Yg_BGqj_6lg&list=PLcPzhUaCxlCgig7ofeARMPwQ8vbuD6hC5&index=5
[zkvm-overview]: https://dev.risczero.com/zkvm

# zkVerify - Zero-Knowledge Proof Verification System

## Key Components

### 1. Proof Generation (Rust)
- Generates zk proofs using RISC Zero zkVM
- Handles iris flower classification as example workload
- Outputs proof data to JSON files

### 2. Verification Server (Node.js)
- Integration with zkVerify smart contract
- REST API for proof verification
- Event-driven architecture for attestation confirmation


### 3. Smart Contracts
- `ZkMLMarketplace.sol`: Main verification contract
- Proof verification with merkle tree validation
- Event emission for successful verifications

### 4. Frontend Integration
- React interface for proof submission
- Real-time verification status tracking
- Ethereum transaction management

## Environment Setup

1. **Required Variables** (`.env`):
```env
ETH_SECRET_KEY= # Ethereum private key
ETH_RPC_URL= #RPC_URL
ZKV_RPC_URL=wss://testnet-rpc.zkverify.io 
ETH_ZKVERIFY_CONTRACT_ADDRESS= # Deployed contract address
ETH_APP_CONTRACT_ADDRESS= # Your dApp contract address
ZKV_SEED_PHRASE= #SEED_PHRASE
```


## Running the Project

### 1. Start Verification Server
```bash
cd zkVerify/app && npm i
cd src && npm start 
```

### 2. Run zkVM Host
```bash
cd host
cargo run --release
```

### 3. Start Frontend
```bash
cd frontend && npm i 
npm run dev
```

## API Endpoints

### Generate Proof (POST `/generate-proof`)
```json
Request:
{
  "sepal_length": 5.1,
  "sepal_width": 3.5,
  "petal_length": 1.4,
  "petal_width": 0.2
}

Response:
{
  "status": "success",
  "message": "Proof generated",
  "flower_type": "setosa"
}
```

### Verify Proof (POST `/verify`)
```json
Response:
{
  "status": "success|pending|error",
  "attestationId": 44653,
  "txHash": "0x...",
  "root": "0x6da9e56952c1e8215f3a7b9c4cfa1c70e52af0d399cc296098df6e4e30cf00ba"
}
```
## Future Vision

### Scalable Foundation
Our current implementation is just the beginning. The underlying technology is designed to be **scalable** and can support more complex models and datasets.

### Industry Applications

#### 🏥 Medical Field
- **Privacy-preserving AI** is essential for diagnostics and patient data analysis
- Ensures sensitive health information remains confidential
- Provides accurate predictive insights while maintaining data security

#### 💳 Banking Sector
- **Secure AI models** can transform:
  - Credit scoring systems
  - Fraud detection mechanisms
  - Risk assessment processes
- Delivers trustworthy predictions without compromising customer data

### Expansion Plans
We plan to expand the marketplace to include a **diverse range of models**, catering to industries that demand:
- High security standards
- Strict privacy requirements
- Verifiable model integrity

## Documentation References
- [RISC Zero zkVM Documentation](https://dev.risczero.com)
- [zkVerifyJS SDK Reference](https://docs.zkverify.io/sdk)

