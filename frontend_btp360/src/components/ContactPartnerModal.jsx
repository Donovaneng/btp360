import React, { useState } from 'react';
import { X, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import api from '../services/api';

const ContactPartnerModal = ({ partner, isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await api.post('/leads', {
        partner_id: partner.id,
        message: message,
        service: partner.category_name
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setMessage('');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-brand-dark z-10"
        >
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="p-12 text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Message Envoyé !</h3>
              <p className="text-slate-500 font-medium">Votre demande a été transmise à <span className="font-bold text-brand-orange">{partner.name}</span>. Il vous recontactera très prochainement.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-brand p-10 text-white">
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Contacter le Partenaire</h3>
                <p className="text-white/80 font-medium">Vous envoyez une demande à <span className="text-white font-bold">{partner.name}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-shake">
                  <AlertCircle size={20} />
                  <span className="text-sm font-bold">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Votre message / Projet</label>
                <textarea 
                  required
                  rows="5"
                  className="w-full p-6 rounded-3xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all font-medium text-brand-dark placeholder:text-slate-300 shadow-inner"
                  placeholder="Décrivez brièvement vos besoins (ex: Rénovation d'une villa de 300m², délai souhaité...)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-dark hover:bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>Envoyer la demande <Send size={20} /></>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Vos coordonnées professionnelles seront partagées avec ce partenaire.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactPartnerModal;
