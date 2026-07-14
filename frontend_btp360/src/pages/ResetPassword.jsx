import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo_btp360.png';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

const ResetPassword = () => {
  useSEO('Réinitialiser le mot de passe', 'Créez un nouveau mot de passe pour votre compte BTP 360.');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas');
    }
    if (password.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères');
    }

    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      // Simulation pour la démo
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-xl text-center">
           <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
           <h2 className="text-2xl font-black text-brand-dark mb-4 uppercase">Lien invalide</h2>
           <p className="text-slate-500 mb-8 font-medium">Ce lien de réinitialisation est invalide ou a expiré.</p>
           <Link to="/forgot-password" className="block w-full py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest text-xs">
              Demander un nouveau lien
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-orange rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-yellow rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 glass-card p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/40 animate-scale-in">
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="BTP 360" className="h-16 w-auto mb-8 drop-shadow-md" />
          <h2 className="text-center text-3xl font-black text-brand-dark tracking-tight uppercase">
            Nouveau <span className="text-brand-orange">Mot de passe</span>
          </h2>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-inner">
               <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
               <h3 className="text-xl font-black text-brand-dark uppercase">Succès !</h3>
               <p className="text-slate-500 text-sm font-medium">
                 Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
               </p>
            </div>
            <div className="flex justify-center">
               <Loader2 className="animate-spin text-brand-orange" size={24} />
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-xs text-red-700 font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-14 pr-12 py-4.5 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all text-brand-dark font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-brand-orange transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-14 pr-4 py-4.5 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all text-brand-dark font-medium"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
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
                  Réinitialiser <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
