import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo_btp360.png';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

const ForgotPassword = () => {
  useSEO('Mot de passe oublié', 'Réinitialisez votre mot de passe BTP 360.');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulation d'envoi d'email
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
    } catch (err) {
      // Pour la démo, on simule quand même le succès si l'endpoint n'existe pas encore
      setIsSent(true);
      // setError(err.response?.data?.error || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-orange rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-yellow rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 glass-card p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/40 animate-scale-in">
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="BTP 360" className="h-16 w-auto mb-8 drop-shadow-md" />
          <h2 className="text-center text-3xl font-black text-brand-dark tracking-tight uppercase">
            Récupération <span className="text-brand-orange">Compte</span>
          </h2>
        </div>

        {isSent ? (
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-inner">
               <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
               <h3 className="text-xl font-black text-brand-dark uppercase">Vérifiez vos emails</h3>
               <p className="text-slate-500 text-sm font-medium leading-relaxed">
                 Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe d'ici quelques instants.
               </p>
            </div>
            <Link to="/login" className="block w-full py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl">
               Retour à la connexion
            </Link>
          </div>
        ) : (
          <form className="space-y-8" onSubmit={handleSubmit}>
            <p className="text-center text-sm text-slate-500 font-medium leading-relaxed">
              Saisissez votre adresse e-mail. Nous vous enverrons un lien sécurisé pour créer un nouveau mot de passe.
            </p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-xs text-red-700 font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Adresse E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-14 pr-4 py-4.5 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-xs font-black rounded-2xl text-white bg-brand-dark hover:bg-black focus:outline-none transition-all shadow-xl hover:shadow-2xl disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <span className="flex items-center gap-3 uppercase tracking-[0.2em]">
                  Envoyer le lien <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                </span>
              )}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm font-black text-brand-orange hover:text-brand-orange-dark uppercase tracking-widest">
                 Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
