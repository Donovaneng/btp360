import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative overflow-hidden animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">{title || 'Confirmer'}</h3>
            <p className="text-slate-500 text-sm font-medium">{message || 'Êtes-vous sûr de vouloir effectuer cette action ?'}</p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
             <button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/10"
             >
               {isLoading ? <Loader2 key="modal-loader" className="animate-spin" /> : confirmText || 'Confirmer'}
             </button>
             <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all"
             >
               Annuler
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
