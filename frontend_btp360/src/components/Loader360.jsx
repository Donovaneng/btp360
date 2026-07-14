import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader360 = ({ fullPage = false, size = 48 }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative">
        <Loader2 
          key="loader-360-inner"
          size={size} 
          className="text-brand-orange animate-spin" 
          strokeWidth={3}
        />
        <div className="absolute inset-0 bg-brand-orange/20 blur-xl rounded-full scale-150 animate-pulse"></div>
      </div>
      <p className="text-sm font-black text-brand-dark uppercase tracking-[0.2em] animate-pulse">
        Chargement...
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50/80 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-20 flex justify-center w-full">{content}</div>;
};

export default Loader360;
