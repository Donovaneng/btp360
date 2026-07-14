import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo_btp360.png';
import { useSEO } from '../hooks/useSEO';

const RegisterClient = () => {
  useSEO('Inscription Client', 'Créez votre compte client BTP 360 et trouvez les meilleurs experts pour vos projets.');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: 2 // Client
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-yellow rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 glass-card p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/40">
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="BTP 360" className="h-16 w-auto mb-6 drop-shadow-md" />
          <h2 className="text-center text-3xl font-black text-brand-dark tracking-tight">
            Créer un <span className="text-brand-orange">Compte Client</span>
          </h2>
          <p className="mt-4 text-center text-sm text-slate-500 font-medium">
            Accédez aux meilleurs experts du BTP au Cameroun.
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 animate-shake">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}

        {success ? (
          <div className="bg-green-50 border border-green-200 p-10 rounded-3xl text-center space-y-6 animate-fade-in shadow-inner">
            <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-green-800">Bienvenue !</h3>
                <p className="text-green-700 font-medium">Votre compte a été créé avec succès.</p>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-14 pr-4 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
                    placeholder="Ex: Jean Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-14 pr-4 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                    className="block w-full pl-14 pr-12 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
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

            <div className="bg-slate-50/50 p-4 rounded-xl text-[10px] text-slate-400 font-medium leading-relaxed border border-slate-100">
              En vous inscrivant, vous acceptez nos <a href="#" className="font-bold text-brand-dark hover:text-brand-orange transition-colors">Conditions d'Utilisation</a> et notre <a href="#" className="font-bold text-brand-dark hover:text-brand-orange transition-colors">Politique de Confidentialité</a>.
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-5 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-brand-orange hover:bg-brand-orange-dark focus:outline-none focus:ring-4 focus:ring-brand-orange/20 transition-all shadow-xl hover:shadow-2xl disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <span className="flex items-center gap-3 uppercase tracking-[0.15em]">
                    Créer mon compte <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                  </span>
                )}
              </button>
            </div>
            
            <div className="text-center pt-2">
              <Link to="/register-partner" className="text-xs font-bold text-slate-400 hover:text-brand-orange transition-all uppercase tracking-wider">
                Vous êtes un professionnel ? <span className="text-brand-dark font-black">Postuler ici</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterClient;
