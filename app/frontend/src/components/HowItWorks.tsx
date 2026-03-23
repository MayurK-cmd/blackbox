import React from 'react';
import { Shield, Upload, Check, RefreshCw } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Model',
    description: 'Upload your trained AI model (Decision Trees, Random Forests) to our platform.',
  },
  {
    icon: RefreshCw,
    title: 'Generate zk-Proof',
    description: 'Our system generates a zero-knowledge proof using RISC Zero zkVM.',
  },
  {
    icon: Check,
    title: 'Verify Integrity',
    description: 'The marketplace verifies the proof without exposing your model details.',
  },
  {
    icon: Shield,
    title: 'Secure Publishing',
    description: 'Your model is published with verified accuracy and protected intellectual property.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600">
            Secure your AI models with zero-knowledge proofs in four simple steps
          </p>
        </div>
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <step.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-center text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};