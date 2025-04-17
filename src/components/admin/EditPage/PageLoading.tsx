
import React from 'react';

export const PageLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
    </div>
  );
};
