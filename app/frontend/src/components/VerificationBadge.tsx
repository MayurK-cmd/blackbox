import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface VerificationBadgeProps {
  status: 'pending' | 'verified' | 'failed';
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          text: 'Verified',
          className: 'bg-green-100 text-green-800',
        };
      case 'failed':
        return {
          icon: AlertCircle,
          text: 'Failed',
          className: 'bg-red-100 text-red-800',
        };
      default:
        return {
          icon: Clock,
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800',
        };
    }
  };

  const { icon: Icon, text, className: statusClassName } = getStatusConfig();

  return (
    <div className={clsx('inline-flex items-center px-3 py-1 rounded-full', statusClassName, className)}>
      <Icon className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};