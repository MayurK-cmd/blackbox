import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { run } from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/verify', async (req, res) => {
  const { proof, publicInputs, selectiveDisclosure, contractAddress, inputHash, submitterPublicKey, proverServerUri } = req.body;

  if (!selectiveDisclosure) {
    return res.status(400).json({ status: 'error', message: 'selectiveDisclosure config is required.' });
  }
  if (!proof?.proof || !proof?.pub_inputs || !proof?.image_id) {
    return res.status(400).json({ status: 'error', message: 'proof.proof, proof.pub_inputs, and proof.image_id are required.' });
  }

  try {
    const result = await run(proof, publicInputs, selectiveDisclosure, contractAddress, inputHash, submitterPublicKey, proverServerUri);

    if (result.status === 'verified') {
      console.log('[server.js] Returning verification response:', result.note);
      return res.json(result);
    }

    return res.json({
      status:       'pending',
      message:      'Transaction built. Wallet will prove and submit.',
      unbalancedTx: result.unbalancedTx,
      isValid:      true,
    });

  } catch (error) {
    console.error('[server.js] Verification error stack trace:', error.stack);
    return res.status(500).json({
      status:  'error',
      message: error.stack || error.message || 'Verification process failed.',
    });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Midnight ZkML API server running on port ${PORT}`);
});