
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <div className="text-4xl font-bold text-blue-600">MA</div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
          Mobile Auth
        </h1>
        <p className="text-xl text-blue-100 animate-fade-in-delay">
          Secure Authentication System
        </p>
        <div className="mt-8">
          <div className="w-16 h-1 bg-white rounded mx-auto animate-loading"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
