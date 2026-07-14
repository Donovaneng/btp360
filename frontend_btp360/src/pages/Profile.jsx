import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  MapPin, 
  Phone, 
  Building2, 
  Calendar, 
  Edit3,
  Shield,
  ArrowRight,
  Star,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        setProfileData(response.data);
      } catch (err) {
        console.error('Erreur profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  const userData = profileData || user;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Header / Hero Section */}
        <div className="relative mb-12">
           <div className="h-64 bg-brand-dark rounded-[3rem] relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-transparent"></div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl"></div>
              <div className="absolute top-10 right-10">
                 <Link 
                   to="/parametres" 
                   className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] backdrop-blur-md border border-white/10 transition-all"
                 >
                    <Edit3 size={16} /> Modifier le profil
                 </Link>
              </div>
           </div>

           <div className="px-4 md:px-10 -mt-8 md:-mt-12 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl p-2 border-4 md:border-8 border-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                 {userData?.avatar_url ? (
                   <img src={userData.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-2xl md:rounded-3xl" />
                 ) : (
                   <div className="text-4xl md:text-5xl font-black text-brand-orange uppercase">
                      {userData?.name?.charAt(0)}
                   </div>
                 )}
              </div>
              <div className="flex-1 pb-2 md:pb-4">
                 <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-3">
                    <h1 className="text-3xl md:text-4xl font-black text-brand-dark md:text-brand-dark uppercase tracking-tight drop-shadow-sm">
                      {userData?.name}
                    </h1>
                    <CheckCircle2 size={24} className="text-blue-500 fill-blue-50 shrink-0" />
                 </div>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <span className="px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-orange/20">
                       {userData?.role_id === 1 ? 'Administrateur' : userData?.role_id === 3 ? 'Professionnel BTP' : 'Client VIP'}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                       <MapPin size={14} className="text-brand-orange" /> {userData?.city || 'Non spécifié'}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Info Sidebar */}
           <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                 <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest mb-6 pb-4 border-b border-slate-50">Coordonnées</h3>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-all">
                          <Phone size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone</p>
                          <p className="text-sm font-bold text-brand-dark">{userData?.phone || 'Non renseigné'}</p>
                       </div>
                    </div>
                    {userData?.company_name && (
                      <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-all">
                            <Building2 size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entreprise</p>
                            <p className="text-sm font-bold text-brand-dark">{userData.company_name}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 group">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-all">
                          <Calendar size={18} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Membre depuis</p>
                          <p className="text-sm font-bold text-brand-dark">{new Date(userData?.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-brand-dark p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                       <Star size={18} className="text-brand-orange" />
                       <span className="font-black uppercase tracking-widest text-xs">Statut Vérifié</span>
                    </div>
                    <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">Votre compte est entièrement vérifié et sécurisé par les services BTP 360.</p>
                    <div className="flex items-center gap-2 text-green-400">
                       <Shield size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Protection Active</span>
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>
              </div>
           </div>

           {/* Main Content Areas */}
           <div className="lg:col-span-2 space-y-10">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">Résumé de l'activité</h3>
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                       <ArrowRight size={20} />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-brand-orange/20 transition-all">
                       <p className="text-3xl font-black text-brand-dark mb-1 group-hover:text-brand-orange transition-colors">{profileData?.projects_count ?? 0}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projets publiés</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-brand-orange/20 transition-all">
                       <p className="text-3xl font-black text-brand-dark mb-1 group-hover:text-brand-orange transition-colors">{profileData?.leads_count ?? 0}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mises en relation</p>
                    </div>
                 </div>

                 <div className="mt-10 p-8 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500">
                       <Shield size={32} />
                    </div>
                    <div className="flex-1">
                       <p className="text-sm font-black text-blue-900 uppercase tracking-tight mb-1">Badge de confiance</p>
                       <p className="text-xs text-blue-700/70 font-medium">Vous bénéficiez du badge de membre exclusif du réseau BTP 360.</p>
                    </div>
                 </div>
              </div>

              {userData?.role_id === 3 && (
                 <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden relative">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">Réalisations récentes</h3>
                       <Link to="/dashboard-partner" className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:opacity-70 transition-opacity">Gérer mes projets</Link>
                    </div>
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                          <Building2 size={40} />
                       </div>
                       <p className="text-slate-400 text-sm italic">Vous n'avez pas encore publié de réalisations.</p>
                       <Link 
                         to="/dashboard-partner" 
                         className="mt-6 px-8 py-3 bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                       >
                         Ajouter mon premier projet
                       </Link>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
