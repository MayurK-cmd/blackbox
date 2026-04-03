import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useStore } from '../store';
import type { Model } from '../types';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, models, setModels } = useStore();

  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inputFormat: '',
    pricePerPrediction: '',   // user enters human-readable DUST amount
    circuitHash: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // ── Validation ────────────────────────────────────────────────────────────
    if (!wallet.isConnected || !wallet.unshieldedAddress) {
      setErrorMessage('Please connect your Lace wallet first.');
      return;
    }

    const priceNum = Number(formData.pricePerPrediction);
    if (!formData.pricePerPrediction || isNaN(priceNum) || priceNum <= 0) {
      setErrorMessage('Enter a valid price in DUST.');
      return;
    }

    if (!formData.circuitHash.trim()) {
      setErrorMessage('Circuit hash is required.');
      return;
    }

    setIsPending(true);
    try {
      // Convert human-readable DUST to raw bigint units (1 DUST = 1_000_000 raw)
      const priceInDust = BigInt(Math.round(priceNum * 1_000_000));

      const newModel: Model = {
        id: crypto.randomUUID(),
        provider: wallet.unshieldedAddress,   // Bech32m address from Lace wallet
        name: formData.name,
        description: formData.description,
        inputFormat: formData.inputFormat,
        pricePerPrediction: priceInDust,
        circuitHash: formData.circuitHash.trim(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Register model in Zustand store (on-chain registry comes with Compact contract later)
      setModels([...models, newModel]);
      navigate('/dashboard');

    } catch (err) {
      console.error('Model registration failed:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to register model.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Model</h2>
            <p className="mt-1 text-sm text-gray-500">
              Register your AI model on the ZkML Marketplace
            </p>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">

              {/* Provider address – read from Lace wallet */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provider Address
                </label>
                <input
                  type="text"
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm text-gray-500 text-sm"
                  value={wallet.unshieldedAddress ?? 'Connect your Lace wallet to populate this field'}
                />
              </div>

              {/* Model name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Model Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Input format */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Input Format
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.inputFormat}
                  onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                  placeholder="e.g. JSON with fields: sepal_length, sepal_width, petal_length, petal_width"
                />
              </div>

              {/* Price in DUST */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price Per Prediction (DUST)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.000001"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.pricePerPrediction}
                  onChange={(e) => setFormData({ ...formData, pricePerPrediction: e.target.value })}
                  placeholder="e.g. 0.05"
                />
                <p className="mt-1 text-xs text-gray-400">
                  DUST is Midnight's fee resource token. 1 DUST = 1,000,000 raw units.
                </p>
              </div>

              {/* Circuit hash */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Circuit Hash
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.circuitHash}
                  onChange={(e) => setFormData({ ...formData, circuitHash: e.target.value })}
                  placeholder="sha256:... or hex string of compiled Compact circuit artefact"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Hash of the compiled Compact circuit that governs this model's ZK verification.
                </p>
              </div>

              {errorMessage && (
                <div className="text-red-600 text-sm">{errorMessage}</div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !wallet.isConnected}
                  className="min-w-[140px]"
                >
                  {isPending ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Registering...
                    </>
                  ) : (
                    'Upload & Register'
                  )}
                </Button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};