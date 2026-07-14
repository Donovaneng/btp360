import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import logo from '../assets/logo_btp360.png';
import { useSEO } from '../hooks/useSEO';

const Login = () => {
  useSEO('Connexion', 'Connectez-vous à votre espace BTP 360 pour gérer vos projets et demandes.');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setIsLoading(true);
      try {
        const data = await loginWithGoogle(tokenResponse.access_token);
        redirectAfterLogin(data.user.role_id);
      } catch (err) {
        setError(err.message || 'Erreur de connexion Google');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google error:', err);
      setError('Connexion Google annulée ou échouée');
    },
    flow: 'implicit',
    ux_mode: 'popup',
  });

  const redirectAfterLogin = (roleId) => {
    if (roleId === 1) navigate('/admin');
    else if (roleId === 3) navigate('/dashboard-partner');
    else navigate('/dashboard-client');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      redirectAfterLogin(data.user.role_id);
    } catch (err) {
      setError(err.message || 'Identifiants invalides');
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

      <div className="max-w-md w-full relative z-10 glass-card p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/40">
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="BTP 360" className="h-20 w-auto mb-8 drop-shadow-md" />
          <h2 className="text-center text-3xl font-black text-brand-dark tracking-tight">
            Accès <span className="text-brand-orange">Plateforme</span>
          </h2>
          <p className="mt-4 text-center text-sm text-slate-500 font-medium">
            Entrez vos identifiants pour continuer
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-shake">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white border-2 border-slate-200 rounded-2xl font-black text-slate-700 hover:border-brand-orange hover:shadow-lg transition-all duration-300 mb-6 group disabled:opacity-60"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span className="group-hover:tracking-wider transition-all">Continuer avec Google</span>
        </button>

        {/* Separator */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">ou</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Identifiant Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-14 pr-4 py-4.5 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-14 pr-12 py-4.5 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
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
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center">
              <input type="checkbox" className="h-5 w-5 text-brand-orange focus:ring-brand-orange border-slate-300 rounded-lg cursor-pointer" />
              <label className="ml-3 block text-sm text-slate-500 font-semibold cursor-pointer">Rester connecté</label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" title="Récupérer mon mot de passe" className="font-bold text-brand-orange hover:text-brand-orange-dark hover:underline transition-all">Oublié ?</Link>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-brand-dark hover:bg-black focus:outline-none focus:ring-4 focus:ring-brand-dark/20 transition-all shadow-xl hover:shadow-2xl disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <span className="flex items-center gap-3 uppercase tracking-[0.2em]">
                  Se Connecter <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                </span>
              )}
            </button>
          </div>
          
          <div className="text-center pt-6">
            <p className="text-slate-500 text-sm font-medium">
              Nouveau sur la plateforme ?{' '}
              <Link to="/register-client" className="font-black text-brand-orange hover:text-brand-orange-dark decoration-2 underline underline-offset-4">
                Créer un compte
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
