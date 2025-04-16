
import React from 'react';
import { ToolbarGroupProps } from '../types';

export const ToolbarGroup: React.FC<ToolbarGroupProps> = ({ children, label }) => {
  return (
    <div className="flex items-center gap-1">
      {children}
      {label && <div className="h-6 border-r border-gray-300 ml-2" />}
    </div>
  );
};
