import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { Button } from '../components/Button';
import { useStore } from '../store';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);

  const handleLogin = () => {
    // Simulate Open Campus ID authentication
    setUser({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Brain className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Button
            onClick={handleLogin}
            className="w-full justify-center"
            size="lg"
          >
            Continue with Open Campus ID
          </Button>
        </div>
      </div>
    </div>
  );
};