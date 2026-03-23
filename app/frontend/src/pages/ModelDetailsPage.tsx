import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Flag, ArrowLeft, Loader } from "lucide-react";
import { Layout } from "../components/Layout";
import { Button } from "../components/Button";
import { ProofInput, ProofData, VerificationData } from "../types";
import { useWriteContract, usePublicClient, useReadContract } from "wagmi";
import { abi } from "../../abi/MLModelMarketplace";


export const ModelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const modelId = Number(6);

  const { data, isPending, error } = useReadContract({
    address: "0xA81a624F25a114b392A0894703b380aEb7cd7864",
    abi,
    functionName: "getModelDetails",
    args: [modelId],
  });

  const [
    provider,
    name,
    description,
    inputFormat,
    pricePerPrediction,
    codeHash,
    isActive,
  ] = (data as [string, string, string, string, bigint, string, boolean]) || [ "","","", "",BigInt(0), "",false, ];

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
  const [proofData, setProofData] = useState<ProofData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] =
    useState<VerificationData | null>(null);

  const { writeContract, isPending: isWritePending } = useWriteContract();
  const publicClient = usePublicClient();



  const handleGenerateProof = async () => {
    setIsGeneratingProof(true);

    const inputs = [
      proofInput.sepal_length,
      proofInput.sepal_width,
      proofInput.petal_length,
      proofInput.petal_width,
    ].map(Number);

    try {
      // Check if pricePerPrediction is defined
      if (typeof pricePerPrediction === 'undefined') {
        throw new Error('Price per prediction is not available');
      }

      // Make the contract call
      const hash = await writeContract({
        address: "0xA81a624F25a114b392A0894703b380aEb7cd7864",
        abi,
        functionName: "requestPrediction",
        args: [modelId, inputs],
        value: pricePerPrediction,
      });

      setTimeout(() => async () => {
        const response = await fetch("http://localhost:3000/generate-proof", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(proofInput),
        });
  
        if (!response.ok) {
          throw new Error("Failed to generate proof");
        }
  
        const responseData = await response.json();
        setProofData(responseData);
      }, 5000);

      // Make API call for proof generation
    

    } catch (error) {
      console.error("Error:", error);
      setProofData(null);
    } finally {
      setIsGeneratingProof(false);
      setShowProofModal(false);
      setTimeout(() => {
        proofSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };


  const handleVerifyProof = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch('http://localhost:3001/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to generate proof');
      }
      const responseData = await response.json();
      setVerificationData(responseData);
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationData(null);
    } finally {
      setTimeout(() => {
        setIsVerifying(false);
      }, 8000);
      setTimeout(() => {
        verificationSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 2000);
    }
  };

  if (isPending) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Loader className="animate-spin h-8 w-8 mx-auto" />
          <h2 className="text-xl font-medium mt-4">Loading model details...</h2>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600">
            Error loading model details
          </h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Model not found</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Model Information
            </h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Provider Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {provider}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Input Format
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{inputFormat}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Price Per Prediction
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {pricePerPrediction
                    ? `${Number(pricePerPrediction) / 1e18} ETH`
                    : "Loading..."}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Technical Details
            </h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Code Hash</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {codeHash}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {isActive ? "Active" : "Inactive"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
            <Button onClick={() => setShowProofModal(true)}>
              Generate Proof
            </Button>
          </div>
        </div>

        {proofData && (
          <div
            ref={proofSectionRef}
            className="px-6 py-5 border-t border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Generated Proof
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm font-mono overflow-auto whitespace-pre-wrap">
                {JSON.stringify(proofData, null, 2)}
              </pre>
              <div className="mt-4">
                <Button onClick={handleVerifyProof} disabled={isVerifying}>
                  {isVerifying ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Verifying Proof
                    </>
                  ) : (
                    "Verify Proof"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {verificationData && (
          <div
            ref={verificationSectionRef}
            className="px-6 py-5 border-t border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Verification Results
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm font-mono overflow-auto whitespace-pre-wrap">
                {JSON.stringify(verificationData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {showProofModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Generate Proof
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  sepal_length
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={proofInput.sepal_length}
                  onChange={(e) =>
                    setProofInput({
                      ...proofInput,
                      sepal_length: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  sepal_width
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={proofInput.sepal_width}
                  onChange={(e) =>
                    setProofInput({
                      ...proofInput,
                      sepal_width: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  petal_length
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={proofInput.petal_length}
                  onChange={(e) =>
                    setProofInput({
                      ...proofInput,
                      petal_length: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  petal_width
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={proofInput.petal_width}
                  onChange={(e) =>
                    setProofInput({
                      ...proofInput,
                      petal_width: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowProofModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateProof}
                  disabled={isGeneratingProof || isWritePending}
                >
                  {isGeneratingProof || isWritePending ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      {isWritePending
                        ? "Processing Payment"
                        : "Generating Proof"}
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
