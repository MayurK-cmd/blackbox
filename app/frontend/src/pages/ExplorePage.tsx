import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import { Layout } from '../components/Layout';
import { ModelCard } from '../components/ModelCard';
import { useReadContract } from 'wagmi';
import { abi } from '../../abi/MLModelMarketplace';

export const ExplorePage: React.FC = () => {
  const [modelIds] = useState<number[]>([1, 2, 3, 4, 5]); // Test with first 5 IDs
  const [chainModels, setChainModels] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data, isPending, error } = useReadContract({
    address: '0xA81a624F25a114b392A0894703b380aEb7cd7864',
    abi,
    functionName: 'getModelDetails',
    args: [6], // Initial fetch for testing
  });

  useEffect(() => {
    if (data) {
      const [
        provider,
        name,
        description,
        inputFormat,
        pricePerPrediction,
        codeHash,
        isActive
      ] = data as any[];
      
      setChainModels([{
        id: '1',
        provider,
        name,
        description,
        inputFormat,
        pricePerPrediction: Number(pricePerPrediction) / 1e18,
        codeHash,
        isActive,
        status: isActive ? 'verified' : 'failed'
      }]);
    }
  }, [data]);

  const filteredModels = chainModels.filter(model => {
    if (selectedStatus === 'all') return true;
    return model.status === selectedStatus;
  });

  if (isPending) return (
    <Layout>
      <div className="text-center py-8">
        <Loader className="animate-spin h-8 w-8 mx-auto" />
        <p className="mt-2 text-gray-600">Loading models from blockchain...</p>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="text-center py-8 text-red-600">
        Error loading models: {error.message}
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Explore AI Models</h1>
          <select
            className="mt-4 sm:mt-0 block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={{
              ...model,
              // Map blockchain model to local Model type
              pricePerPrediction: Number(model.pricePerPrediction),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }} />
          ))}
        </div>
      </div>
    </Layout>
  );
};