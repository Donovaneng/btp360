import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building, MapPin, Phone, Briefcase, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo_btp360.png';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

const RegisterPartner = () => {
  useSEO('Inscription Partenaire', 'Rejoignez le réseau BTP 360 en tant que professionnel du BTP et développez votre activité.');
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    category_id: '',
    role_id: 3
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_id) {
      setError('Veuillez sélectionner votre catégorie de métier.');
      return;
    }
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

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-brand-orange rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-brand-yellow rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10 glass-card p-8 md:p-16 rounded-[3rem] shadow-2xl border border-white/40">
        <div className="flex flex-col items-center mb-12">
          <img src={logo} alt="BTP 360" className="h-16 w-auto mb-8 drop-shadow-md" />
          <h2 className="text-center text-3xl md:text-4xl font-black text-brand-dark tracking-tight uppercase">
            Devenir Partenaire <span className="text-brand-orange">BTP 360</span>
          </h2>
          <p className="mt-4 text-center text-slate-500 font-medium max-w-lg">
            Rejoignez le réseau leader du BTP au Cameroun et développez votre activité.
          </p>
        </div>

        {error && (
          <div className="mb-10 bg-red-50 border-l-4 border-red-500 p-5 rounded-xl flex items-center gap-4 animate-shake">
            <AlertCircle className="text-red-500" />
            <p className="text-sm text-red-700 font-black">{error}</p>
          </div>
        )}

        {success ? (
          <div className="bg-green-50 border border-green-200 p-12 rounded-[2.5rem] text-center space-y-8 animate-fade-in shadow-inner">
            <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-green-800">Candidature Reçue !</h3>
              <p className="text-green-700 text-lg font-medium">Votre demande est en cours d'examen. Vous recevrez une notification par email.</p>
            </div>
          </div>
        ) : (
          <form className="space-y-12" onSubmit={handleSubmit}>

            {/* Section 1: Informations de Contact */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1.5 bg-brand-orange rounded-full"></div>
                <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest">Informations de Contact</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom du Représentant</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                      <User size={20} />
                    </div>
                    <input
                      type="text" required
                      className="block w-full pl-14 pr-4 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
                      placeholder="Ex: Paul Atangana"
                      value={formData.name} onChange={set('name')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Professionnel</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email" required
                      className="block w-full pl-14 pr-4 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
                      placeholder="contact@entreprise.com"
                      value={formData.email} onChange={set('email')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                      <Phone size={20} />
                    </div>
                    <input
                      type="text" required
                      className="block w-full pl-14 pr-4 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
                      placeholder="+237 6XX XX XX XX"
                      value={formData.phone} onChange={set('phone')}
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
                      type={showPassword ? "text" : "password"} required
                      className="block w-full pl-14 pr-12 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
                      placeholder="••••••••"
                      value={formData.password} onChange={set('password')}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-brand-orange transition-colors">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Détails de l'Entreprise */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1.5 bg-brand-yellow rounded-full"></div>
                <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest">Détails de l'Entreprise</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom de votre Structure</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                      <Building size={20} />
                    </div>
                    <input
                      type="text" required
                      className="block w-full pl-14 pr-4 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
                      placeholder="Ex: Architecture Vision 360"
                      value={formData.company_name} onChange={set('company_name')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ville du Siège</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                      <MapPin size={20} />
                    </div>
                    <input
                      type="text" required
                      className="block w-full pl-14 pr-4 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm"
                      placeholder="Douala, Yaoundé..."
                      value={formData.city} onChange={set('city')}
                    />
                  </div>
                </div>

                {/* Catégorie de métier */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    Catégorie de Métier <span className="text-brand-orange">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-orange transition-colors">
                      <Briefcase size={20} />
                    </div>
                    <select
                      required
                      value={formData.category_id}
                      onChange={set('category_id')}
                      className="block w-full pl-14 pr-4 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-brand-dark font-medium shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">-- Sélectionnez votre spécialité --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">
                    Cette catégorie sera visible dans l'annuaire des partenaires.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center pt-8 space-y-6">
              <button
                type="submit" disabled={isLoading}
                className="w-full md:w-auto md:px-20 py-5 border border-transparent text-sm font-black rounded-2xl text-white bg-brand-dark hover:bg-black transition-all shadow-xl hover:shadow-2xl disabled:opacity-70 group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <span className="flex items-center gap-4 uppercase tracking-[0.2em]">
                    Envoyer ma Candidature <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
                  </span>
                )}
              </button>
              <Link to="/register-client" className="text-xs font-bold text-slate-400 hover:text-brand-orange transition-all uppercase tracking-widest">
                Vous n'êtes pas un pro ? <span className="text-brand-dark">S'inscrire comme client</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPartner;
