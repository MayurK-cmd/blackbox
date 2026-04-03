const express = require('express');
const cors = require('cors');
const path = require('path');
const { run } = require('./app');
const app = express();

require('dotenv').config({ path: path.join(__dirname, '.env') });

app.use(cors());
app.use(express.json());

app.post('/verify', async (req, res) => {
  const { proof, publicInputs, selectiveDisclosure, contractAddress, inputHash } = req.body;

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!selectiveDisclosure) {
    return res.status(400).json({
      status: 'error',
      message: 'selectiveDisclosure config is required.',
    });
  }
  if (!proof?.proof || !proof?.pub_inputs || !proof?.image_id) {
    return res.status(400).json({
      status: 'error',
      message: 'proof.proof, proof.pub_inputs, and proof.image_id are required.',
    });
  }

  // ── Run Midnight verification (app.js) ─────────────────────────────────────
  try {
    const result = await run(proof, publicInputs, selectiveDisclosure, contractAddress, inputHash);

    // Mock mode – SDK or env vars not configured
    if (result.status === 'mock') {
      console.warn('[server.js] Returning mock response:', result.note);
      return res.json(result);
    }

    // Real mode – return the proved unbalanced tx to the frontend.
    // The user's Lace wallet calls balanceUnsealedTransaction() + submitTransaction().
    return res.json({
      status:       'pending',
      message:      'Transaction proved. Balance and submit via your Midnight wallet.',
      unbalancedTx: result.unbalancedTx,
      isValid:      true,
    });

  } catch (error) {
    console.error('[server.js] Verification error:', error);
    return res.status(500).json({
      status:  'error',
      message: error.message || 'Verification process failed.',
    });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Midnight ZkML API server running on port ${PORT}`);
});