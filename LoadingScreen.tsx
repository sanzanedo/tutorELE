import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-300">
      <div className="bg-white p-4 rounded-full shadow-lg mb-6">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
      <h2 className="text-xl font-semibold text-slate-800 text-center max-w-md">
        {message}
      </h2>
      <p className="text-slate-400 mt-2 text-sm">Esto puede tardar unos segundos...</p>
    </div>
  );
};
