import React from 'react';
import { Link } from 'react-router-dom';
import { Model } from '../types';
import { Button } from './Button';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ModelCardProps {
  model: Model;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  const getStatusIcon = () => {
    return model.isActive ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = () => {
    return model.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{model.name}</h3>
        <div className={`flex items-center px-3 py-1 rounded-full ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="ml-2 text-sm capitalize">
            {model.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <p className="text-gray-600 mb-4">{model.description}</p>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-gray-500">Provider</span>
          <p className="font-medium text-gray-900 truncate w-32">{model.provider}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Price</span>
          <p className="font-medium text-gray-900">{model.pricePerPrediction} ETH</p>
        </div>
      </div>
      <div className="mb-4">
        <span className="text-sm text-gray-500">Input Format</span>
        <p className="font-medium text-gray-900">{model.inputFormat}</p>
      </div>
      <Link to={`/model/${model.id}`}>
        <Button variant="primary" className="w-full">
          View Details
        </Button>
      </Link>
    </div>
  );
};