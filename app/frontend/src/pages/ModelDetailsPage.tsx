import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Flag, ArrowLeft, Loader, CheckCircle, XCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { useStore } from '../store';
import type { ProofInput, MidnightProofPayload } from '../types';
//import crypto from 'crypto';

// sha256 of the input object as hex string
// function hashInputs(input: ProofInput): string {
//   const str = JSON.stringify(input);
//   return crypto.createHash('sha256').update(str).digest('hex');
// }

async function hashInputs(input: ProofInput): Promise<string> {
  const str = JSON.stringify(input);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
  ?? 'b29b48553959747cb33fb3e9d9104f2621faf6f466299c034e0e2b9d4e228b09';

export const ModelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { models, wallet, submitProof, lastProof } = useStore();

  const model = models.find((m) => m.id === id);

  const proofSectionRef = useRef<HTMLDivElement>(null);
  const verificationSectionRef = useRef<HTMLDivElement>(null);

  const [showProofModal, setShowProofModal] = useState(false);
  const [proofInput, setProofInput] = useState<ProofInput>({
    sepal_length: 0,
    sepal_width: 0,
    petal_length: 0,
    petal_width: 0,
  });
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [rawProofData, setRawProofData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerateProof = async () => {
    setIsGeneratingProof(true);
    setErrorMessage('');
    try {
      // Call the Risc0 proof generation backend
      const response = await fetch('http://localhost:3000/generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proofInput),
      });

      if (!response.ok) throw new Error('Failed to generate proof');

      const data = await response.json();
      setRawProofData(data);
      setShowProofModal(false);
      setTimeout(() => {
        proofSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Proof generation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate proof');
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!rawProofData) return;
    setErrorMessage('');

    try {
      const inputHash = await hashInputs(proofInput);

      const payload: MidnightProofPayload = {
        risc0: {
          proof:      rawProofData.proofData?.proof      ?? rawProofData.proof      ?? '',
          pub_inputs: rawProofData.proofData?.pub_inputs ?? rawProofData.pub_inputs ?? '',
          image_id:   rawProofData.proofData?.image_id   ?? rawProofData.image_id   ?? '',
        },
        inputHash,
        selectiveDisclosure: {
          revealModelProvider: true,
          revealInputData:     false,
          revealOutputResult:  true,
          revealTimestamp:     true,
        },
        contractAddress: CONTRACT_ADDRESS,
        status: 'pending',
      };

      await submitProof(payload);

      setTimeout(() => {
        verificationSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  if (!model) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Model not found</h2>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const proofStatus = lastProof?.status;

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{model.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{model.description}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              model.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {model.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Model Information</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Provider Address</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{model.provider}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Input Format</dt>
                <dd className="mt-1 text-sm text-gray-900">{model.inputFormat}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price Per Prediction</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(Number(model.pricePerPrediction) / 1_000_000).toFixed(6)} DUST
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Circuit Hash</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{model.circuitHash}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Network</dt>
                <dd className="mt-1 text-sm text-gray-900">Midnight Preview</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              <Flag className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
            <Button
              onClick={() => setShowProofModal(true)}
              disabled={!wallet.isConnected}
            >
              {wallet.isConnected ? 'Generate Proof' : 'Connect Wallet First'}
            </Button>
          </div>
        </div>

        {/* Generated proof display */}
        {rawProofData && (
          <div ref={proofSectionRef} className="px-6 py-5 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generated Proof</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm font-mono overflow-auto whitespace-pre-wrap max-h-48">
                {JSON.stringify(rawProofData, null, 2)}
              </pre>
              <div className="mt-4">
                <Button
                  onClick={handleVerifyProof}
                  disabled={['pending', 'proving', 'submitting'].includes(proofStatus ?? '')}
                >
                  {proofStatus === 'pending' || proofStatus === 'proving' || proofStatus === 'submitting' ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      {proofStatus === 'pending' ? 'Submitting...' :
                       proofStatus === 'proving' ? 'Proving...' : 'Submitting to chain...'}
                    </>
                  ) : 'Verify on Midnight'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Verification result */}
        {lastProof && (lastProof.status === 'confirmed' || lastProof.status === 'failed') && (
          <div ref={verificationSectionRef} className="px-6 py-5 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Result</h3>
            <div className={`p-4 rounded-md ${
              lastProof.status === 'confirmed' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center">
                {lastProof.status === 'confirmed'
                  ? <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  : <XCircle className="h-5 w-5 text-red-500 mr-2" />
                }
                <span className={`font-medium ${
                  lastProof.status === 'confirmed' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastProof.status === 'confirmed' ? 'Proof verified on Midnight Network!' : 'Verification failed'}
                </span>
              </div>
              {lastProof.txHash && (
                <p className="mt-2 text-sm text-gray-600 font-mono break-all">
                  Tx: {lastProof.txHash}
                </p>
              )}
              {lastProof.error && (
                <p className="mt-2 text-sm text-red-600">{lastProof.error}</p>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Proof input modal */}
      {showProofModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Proof</h3>
            <div className="space-y-4">
              {(['sepal_length', 'sepal_width', 'petal_length', 'petal_width'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">{field}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={proofInput[field]}
                    onChange={(e) => setProofInput({ ...proofInput, [field]: Number(e.target.value) })}
                  />
                </div>
              ))}
              {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowProofModal(false)}>Cancel</Button>
                <Button onClick={handleGenerateProof} disabled={isGeneratingProof}>
                  {isGeneratingProof ? (
                    <><Loader className="animate-spin h-4 w-4 mr-2" />Generating...</>
                  ) : 'Generate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};