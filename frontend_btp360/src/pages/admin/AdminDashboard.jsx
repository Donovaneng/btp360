import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Users, 
  HardHat, 
  TrendingUp, 
  MessageSquare, 
  ArrowUpRight,
  Loader2,
  Calendar,
  Plus,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const fetchAdminStats = async () => {
     try {
        const response = await api.get('/admin/stats');
        const data = response.data;
        const partners = await api.get('/partners');

        setStats({
           totalPartners: data.counters.totalPartners,
           totalProjects: data.counters.totalProjects,
           totalUsers: data.counters.totalClients + data.counters.totalPartners,
           totalLeads: data.counters.totalLeads,
           recentPartners: partners.data.slice(0, 5),
           recentActivity: data.recentActivity,
           leadsHistory: data.leadsHistory
        });
     } catch (err) {
        console.error(err);
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
    fetchAdminStats();
    const interval = setInterval(fetchAdminStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const statCards = stats ? [
    { name: 'Total Partenaires', value: stats.totalPartners, icon: <HardHat size={24} />, color: 'bg-brand-orange', trend: '+12%', label: 'vs mois dernier' },
    { name: 'Utilisateurs Inscrits', value: stats.totalUsers, icon: <Users size={24} />, color: 'bg-brand-dark', trend: '+5%', label: 'nouveaux profils' },
    { name: 'Projets Publiés', value: stats.totalProjects, icon: <TrendingUp size={24} />, color: 'bg-green-500', trend: '+18%', label: 'en croissance' },
    { name: 'Mises en relation', value: stats.totalLeads, icon: <MessageSquare size={24} />, color: 'bg-blue-500', trend: '+24%', label: 'leads générés' },
  ] : [];

  return (
    <AdminLayout>
      {loading ? (
        <div className="space-y-10 animate-pulse">
           <div className="flex justify-between items-end">
              <div className="space-y-2">
                 <div className="h-3 w-32 bg-slate-100 rounded-full"></div>
                 <div className="h-8 w-48 bg-slate-100 rounded-xl"></div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                 <div key={i} className="h-40 bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl"></div>
                    <div className="space-y-2">
                       <div className="h-3 w-20 bg-slate-50 rounded-full"></div>
                       <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="flex justify-between items-end">
             <div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Aujourd'hui, {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Tableau de Bord</h1>
             </div>
             <div className="flex gap-3">
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Système Live</span>
                </div>
                <button className="px-6 py-3 bg-white text-brand-dark font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm border border-slate-200 flex items-center gap-2">
                   <Calendar size={16} className="text-brand-orange" /> Rapport
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {statCards.map((card, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white/20 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                   <div className="relative z-10">
                      <div className={`${card.color} w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6 shadow-lg shadow-${card.color.split('-')[1]}/20`}>
                         {card.icon}
                      </div>
                      <div className="space-y-1">
                         <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">{card.name}</p>
                         <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-2xl md:text-3xl font-black text-brand-dark tracking-tight">{card.value}</span>
                            <span className="text-green-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">{card.trend}</span>
                         </div>
                         <p className="text-[9px] text-slate-400 font-medium italic truncate">{card.label}</p>
                      </div>
                   </div>
                   <ArrowUpRight className="absolute top-6 md:top-8 right-6 md:right-8 text-slate-100 group-hover:text-brand-orange/10 group-hover:scale-150 transition-all" size={60} />
                </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 flex flex-col min-h-[400px] animate-slide-in-bottom [animation-delay:400ms]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                   <div>
                      <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">Croissance Hebdomadaire</h3>
                      <p className="text-slate-400 text-xs font-medium">Evolution des mises en relation</p>
                   </div>
                </div>
                
                <div className="flex-1 w-full flex items-end gap-2 md:gap-4 px-2 md:px-4 pb-4 overflow-hidden">
                   {stats.leadsHistory && stats.leadsHistory.map((item, i) => {
                      const maxCount = Math.max(...stats.leadsHistory.map(h => h.count), 5);
                      const height = (item.count / maxCount) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                           <div className="w-full flex items-end justify-center h-[180px] md:h-[220px]">
                              <div 
                                className="w-full max-w-[40px] bg-brand-dark rounded-xl relative group-hover:bg-brand-orange transition-all duration-500 shadow-lg shadow-slate-200 group-hover:shadow-brand-orange/20 overflow-hidden"
                                style={{ height: `${height}%`, animation: 'grow-up 1s ease-out forwards', animationDelay: `${500 + (i * 100)}ms` }}
                              >
                                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent"></div>
                              </div>
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.day}</span>
                        </div>
                      );
                   })}
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 animate-slide-in-bottom [animation-delay:600ms]">
                <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm mb-8">Flux Système</h3>
                <div className="space-y-6">
                   {stats.recentActivity && stats.recentActivity.slice(0, 5).map((notif, i) => (
                      <div key={i} className="flex gap-4 group cursor-pointer animate-fade-in" style={{ animationDelay: `${800 + (i * 100)}ms` }}>
                         <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${notif.type === 'user' ? 'bg-blue-50 text-blue-500' : 'bg-brand-orange/10 text-brand-orange'} transition-transform group-hover:scale-110`}>
                            {notif.type === 'user' ? <Users size={18} /> : <Briefcase size={18} />}
                         </div>
                         <div className="overflow-hidden pt-1">
                            <p className="text-xs font-bold text-slate-700 leading-tight group-hover:text-brand-dark truncate">{notif.title}</p>
                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest mt-1">{getRelativeTime(notif.created_at)}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-slide-in-bottom [animation-delay:800ms]">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm">Nouveaux Partenaires</h3>
                 <Link to="/admin/partners" className="text-brand-orange font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-70 transition-opacity">Tout voir</Link>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50">
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entreprise</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ville</th>
                          <th className="px-8 py-5"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {stats.recentPartners.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-8 py-5"><p className="font-black text-brand-dark text-xs uppercase tracking-widest group-hover:text-brand-orange transition-colors">{p.name}</p></td>
                             <td className="px-8 py-5 text-sm text-slate-500 font-medium">{p.email}</td>
                             <td className="px-8 py-5 text-sm text-slate-500 font-medium">{p.city || 'Cameroun'}</td>
                             <td className="px-8 py-5 text-right"><button className="p-2 text-slate-300 hover:text-brand-orange hover:bg-white rounded-lg transition-all"><ArrowUpRight size={18} /></button></td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>

            <div className="space-y-8 animate-slide-in-bottom [animation-delay:1000ms]">
              <div className="bg-brand-dark rounded-[2.5rem] p-8 text-white shadow-xl shadow-brand-dark/20 relative overflow-hidden">
                 <div className="relative z-10">
                    <h3 className="font-black uppercase tracking-widest text-sm mb-6">Action Rapide</h3>
                    <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Ajouter manuellement un nouvel article ou une catégorie de service au réseau.</p>
                    <div className="space-y-3">
                       <Link 
                          to="/admin/academy/new"
                          className="w-full py-4 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2"
                       >
                          <Plus size={16} /> Créer un article
                       </Link>
                       <Link 
                          to="/admin/categories"
                          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all flex items-center justify-center"
                       >
                          Gérer les catégories
                       </Link>
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl"></div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200">
                 <h3 className="font-black text-brand-dark uppercase tracking-widest text-sm mb-6">Activités Récentes</h3>
                 <div className="space-y-6">
                    {stats.recentActivity && stats.recentActivity.map((notif, i) => (
                       <div key={i} className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
                          <div className={`shrink-0 w-2 h-2 rounded-full mt-2 ${notif.type === 'user' ? 'bg-blue-500' : 'bg-brand-orange'}`}></div>
                          <div>
                             <p className="text-sm font-bold text-slate-700 leading-tight group-hover:text-brand-dark">
                                {notif.type === 'user' ? `Nouvel utilisateur : ${notif.title}` : `Nouveau projet : ${notif.title}`}
                             </p>
                             <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">
                                {new Date(notif.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                             </p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
