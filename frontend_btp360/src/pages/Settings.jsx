import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, MapPin, Phone, Building2, Camera, Save, CheckCircle,
  AlertCircle, Loader2, ArrowLeft, Briefcase, FileText, Lock, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const InputField = ({ icon: Icon, label, name, value, onChange, type = 'text', placeholder = '' }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
      <input
        name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
      />
    </div>
  </div>
);

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', company_name: '', phone: '', city: '', bio: '', category_id: ''
  });
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [categories, setCategories] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const isPartner = user?.role_id === 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, catsRes] = await Promise.all([
          api.get('/profile'),
          isPartner ? api.get('/categories') : Promise.resolve({ data: [] })
        ]);
        const d = profileRes.data;
        setFormData({
          name: d.name || '',
          company_name: d.company_name || '',
          phone: d.phone || '',
          city: d.city || '',
          bio: d.bio || '',
          category_id: d.category_id || ''
        });
        setAvatarPreview(d.avatar_url);
        setCategories(catsRes.data);
      } catch (err) {
        console.error('Erreur profil:', err);
      }
    };
    fetchData();
  }, [isPartner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      await api.post('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshUser();
    } catch (err) {
      setError("Erreur upload avatar: " + (err.response?.data?.error || err.message));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setIsSuccess(false);
    try {
      await api.post('/profile/update', formData);
      await refreshUser();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPass !== passwordData.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (passwordData.newPass.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setIsLoading(true); setError(''); setIsSuccess(false);
    try {
      await api.post('/profile/update-password', {
        current_password: passwordData.current,
        new_password: passwordData.newPass
      });
      setIsSuccess(true);
      setPasswordData({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    ...(isPartner ? [{ id: 'pro', label: 'Infos Pro', icon: Briefcase }] : []),
    { id: 'security', label: 'Sécurité', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Paramètres du Profil</h1>
            <p className="text-slate-500 font-medium mt-1">Gérez vos informations personnelles et professionnelles.</p>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-brand-orange font-bold transition-colors">
            <ArrowLeft size={20} /> Retour
          </button>
        </div>

        {/* Avatar Banner */}
        <div className="bg-gradient-brand rounded-[2.5rem] p-12 flex flex-col items-center mb-8 relative overflow-hidden shadow-xl">
          <div className="relative group">
            <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl p-2 border-4 border-white/20 overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="text-4xl font-black text-brand-orange uppercase">{user?.name?.charAt(0)}</div>
              )}
            </div>
            <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-brand-dark text-white p-3 rounded-2xl shadow-lg cursor-pointer hover:scale-110 hover:bg-brand-orange transition-all border-4 border-white z-10">
              <Camera size={20} />
            </label>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div className="mt-6 text-center text-white">
            <h2 className="text-xl font-black uppercase tracking-widest">{user?.name}</h2>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">
              {user?.role_id === 3 ? 'Professionnel BTP 360' : user?.role_id === 1 ? 'Administrateur' : 'Client Particulier'}
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(''); setIsSuccess(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-brand-dark text-white shadow-lg' : 'text-slate-400 hover:text-brand-dark'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {isSuccess && (
          <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center gap-3 border border-green-100 animate-fade-in mb-6">
            <CheckCircle size={20} />
            <span className="font-bold text-sm">Modifications enregistrées avec succès !</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3 border border-red-100 mb-6">
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-10 lg:p-16">

            {/* TAB: Profil */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField icon={User} label="Nom Complet" name="name" value={formData.name} onChange={handleChange} />
                  <InputField icon={Phone} label="Téléphone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+237 6XX XX XX XX" />
                  <InputField icon={MapPin} label="Ville / Localisation" name="city" value={formData.city} onChange={handleChange} placeholder="Douala, Yaoundé..." />
                </div>
                <div className="pt-8 border-t border-slate-50">
                  <button type="submit" disabled={isLoading} className="w-full bg-brand-dark hover:bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 transition-all">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Enregistrer</>}
                  </button>
                </div>
              </form>
            )}

            {/* TAB: Infos Pro (partenaires uniquement) */}
            {activeTab === 'pro' && isPartner && (
              <form onSubmit={handleProfileSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField icon={Building2} label="Nom de l'Entreprise" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Ex: Architecture Vision 360" />

                  {/* Catégorie */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Catégorie de Métier</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all font-bold text-brand-dark appearance-none cursor-pointer"
                      >
                        <option value="">-- Choisir une spécialité --</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <FileText size={14} /> Présentation / Bio professionnelle
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Décrivez votre expertise, vos années d'expérience, vos spécialités... Cette description apparaîtra sur votre profil public."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all font-medium text-brand-dark resize-none"
                  />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">
                    {formData.bio.length} / 500 caractères recommandés
                  </p>
                </div>

                <div className="pt-8 border-t border-slate-50">
                  <button type="submit" disabled={isLoading} className="w-full bg-brand-dark hover:bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 transition-all">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Enregistrer le profil pro</>}
                  </button>
                </div>
              </form>
            )}

            {/* TAB: Sécurité */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mot de passe actuel</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type={showPwd.current ? 'text' : 'password'}
                      value={passwordData.current}
                      onChange={(e) => setPasswordData(p => ({ ...p, current: e.target.value }))}
                      required
                      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-orange transition-colors">
                      {showPwd.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type={showPwd.new ? 'text' : 'password'}
                      value={passwordData.newPass}
                      onChange={(e) => setPasswordData(p => ({ ...p, newPass: e.target.value }))}
                      required
                      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all font-bold text-brand-dark"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-orange transition-colors">
                      {showPwd.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirmer le nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type={showPwd.confirm ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                      required
                      className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border ${
                        passwordData.confirm && passwordData.newPass !== passwordData.confirm
                          ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                          : 'border-transparent focus:ring-brand-orange/10 focus:border-brand-orange'
                      } focus:bg-white focus:ring-4 outline-none transition-all font-bold text-brand-dark`}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-orange transition-colors">
                      {showPwd.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordData.confirm && passwordData.newPass !== passwordData.confirm && (
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <div className="pt-8 border-t border-slate-50">
                  <button type="submit" disabled={isLoading} className="w-full bg-brand-dark hover:bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 transition-all">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Lock size={20} /> Changer le mot de passe</>}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
