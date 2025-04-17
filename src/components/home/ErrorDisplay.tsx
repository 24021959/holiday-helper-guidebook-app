
import React from 'react';

type ErrorDisplayProps = {
  error: string;
  onRetry: () => void;
};

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-red-50 text-red-800 p-4 rounded-lg max-w-md">
        <h2 className="font-bold mb-2">Errore:</h2>
        <p>{error}</p>
        <button 
          onClick={onRetry}
          className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded"
        >
          Riprova
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
