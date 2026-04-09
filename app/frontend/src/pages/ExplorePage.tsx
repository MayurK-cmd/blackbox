import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { ModelCard } from '../components/ModelCard';
import { useStore } from '../store';

export const ExplorePage: React.FC = () => {
  const { models } = useStore();
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredModels = models.filter(model => {
    if (selectedStatus === 'all') return true;
    return selectedStatus === 'verified' ? model.isActive : !model.isActive;
  });

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
            <option value="verified">Active</option>
            <option value="failed">Inactive</option>
          </select>
        </div>

        {filteredModels.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No models found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredModels.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};