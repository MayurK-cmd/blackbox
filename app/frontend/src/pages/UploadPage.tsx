import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { abi } from '../../abi/MLModelMarketplace'; // Adjust import path
import { usePublicClient } from 'wagmi';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { writeContract, isPending, error } = useWriteContract();
  const publicClient = usePublicClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    provider: '',
    name: '',
    description: '',
    inputFormat: '',
    pricePerPrediction: '',
    codeHash: '',
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      // Add validation
      if (!formData.pricePerPrediction || isNaN(Number(formData.pricePerPrediction))) {
        throw new Error('Invalid price value');
      }

      const priceInWei = parseEther(formData.pricePerPrediction);
      
      // // Add code hash validation
      // if (!formData.codeHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      //   throw new Error('Code hash must be 64 hex characters with 0x prefix');
      // }

      const codeHash = formData.codeHash.startsWith('0x') 
        ? formData.codeHash 
        : `0x${formData.codeHash}`;

      const hash = await writeContract({
        address: '0xA81a624F25a114b392A0894703b380aEb7cd7864',
        abi: abi,
        functionName: 'registerModel',
        args: [
          formData.name,
          formData.description,
          formData.inputFormat,
          priceInWei,
          codeHash as `0x${string}`
        ],
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === 'success') {
        navigate('/dashboard');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setErrorMessage(error?.toString() || 'Failed to register model');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Model</h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload your AI model and generate a zero-knowledge proof
            </p>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <form>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provider Address
                </label>
                {address ? (
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={address}
                    disabled
                  />
                ) : (
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    placeholder="0x..."
                  />
                )}
              </div>

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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price Per Prediction (ETH)
                </label>
                <input
                  type="number"
                  required
                  step="0.000000000000000001"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.pricePerPrediction}
                  onChange={(e) => setFormData({ ...formData, pricePerPrediction: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Code Hash
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.codeHash}
                  onChange={(e) => setFormData({ ...formData, codeHash: e.target.value })}
                  placeholder="0x..."
                />
              </div>

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
                  disabled={isPending}
                  className="min-w-[120px]"
                  onClick={handleSubmit}
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
            {errorMessage && (
              <div className="mt-4 text-red-600 text-sm">
                {errorMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};