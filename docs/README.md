# 🔲 BlackBox

**Privacy-first ML marketplace with verifiable inference using ZK proofs.**

---

## 🧠 What is this?

Proofly is a decentralized marketplace where:

* 🧑‍💻 **Model providers** can monetize their ML models
* 🔒 Models & training data stay completely private
* ⚡ Users can request predictions via API
* ✅ Every prediction is backed by a **zero-knowledge proof (zkVerify)**

No model leaks. No data exposure. Just **trustless ML inference**.

---

## ⚙️ How it works

1. **Provider uploads model logic (kept private)**
2. **User sends input → requests prediction**
3. **zkVM generates proof of correct execution**
4. **Proof is verified via zkVerify smart contract**
5. **User gets prediction + verifiable proof**

---

## 🧩 Architecture

* 🦀 **RISC Zero zkVM (Rust)** → Proof generation
* 🌐 **Node.js Server** → Proof handling + verification
* ⛓️ **Smart Contracts (zkVerify + Arbitrum)** → On-chain verification
* ⚛️ **Frontend (React)** → User interaction

---

## 📦 Features

* 🔐 Private ML inference (no model exposure)
* 💸 Pay-per-request monetization
* ✅ Verifiable predictions via zk proofs
* ⚡ Plug-and-play API for developers

---

## 🚀 Run Locally

```bash
# Start verification server
cd zkVerify/app && npm i
cd src && npm start

# Run zkVM host
cd host
cargo run --release

# Start frontend
cd frontend && npm i
npm run dev
```

---

## 🔌 API Example

### Generate Proof

```json
POST /generate-proof

{
  "sepal_length": 5.1,
  "sepal_width": 3.5,
  "petal_length": 1.4,
  "petal_width": 0.2
}
```

### Verify Proof

```json
POST /verify
```

Returns:

* proof status
* attestation ID
* transaction hash

---

## 🌍 Why this matters

Traditional ML:

* ❌ Exposes model logic
* ❌ Risks data leakage
* ❌ No verifiable correctness

Proofly:

* ✅ Models stay private
* ✅ Inputs stay private
* ✅ Outputs are cryptographically verifiable

---

## 🧨 Use Cases

* 🏥 Healthcare → Private diagnostics
* 💳 Finance → Secure credit scoring & fraud detection
* 🧑‍💼 Hiring → Bias-free candidate evaluation
* 📈 Marketing → Privacy-safe personalization

---

## 🔮 Vision

Turn ML into a **trustless, monetizable primitive**:

> “Any model. Any data. Fully private. Fully verifiable.”

---
