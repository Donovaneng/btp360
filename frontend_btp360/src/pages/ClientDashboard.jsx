import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  User, 
  Settings, 
  History, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  LayoutDashboard,
  LogOut,
  ArrowRight,
  Loader2,
  Star,
  Search,
  Bell,
  Heart,
  FileText,
  Shield,
  X,
  MapPin,
  Building2,
  ExternalLink
} from 'lucide-react';

import api from '../services/api';
import { useFavorites } from '../hooks/useFavorites';

const RequestDetailsModal = ({ request, isOpen, onClose, onCancel, isCancelling }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-fade-in">
        <div className="bg-gradient-brand p-8 text-white flex justify-between items-center">
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">Détails de la demande</p>
              <h3 className="text-xl font-black uppercase tracking-tight">#{request.id.toString().padStart(5, '0')}</h3>
           </div>
           <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
              <X size={24} />
           </button>
        </div>
        
        <div className="p-10 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expert Sollicité</h4>
                 <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-orange font-black shadow-sm">
                       {request.partner_company?.charAt(0) || request.partner_name?.charAt(0)}
                    </div>
                    <div>
                       <p className="font-bold text-brand-dark">{request.partner_company || request.partner_name}</p>
                       <Link to={`/partenaire/${request.partner_id}`} className="text-[10px] font-black text-brand-orange uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                          Profil Expert <ArrowRight size={10} />
                       </Link>
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service demandé</h4>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-brand-dark flex items-center gap-3">
                    <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                    {request.service_requested}
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Votre Message</h4>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-slate-600 font-medium leading-relaxed italic">
                 "{request.message}"
              </div>
           </div>

           <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${
                    request.status === 'completed' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                    request.status === 'pending' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 
                    request.status === 'cancelled' ? 'bg-red-500' : 'bg-slate-400'
                 }`}></div>
                 <span className="text-xs font-black text-brand-dark uppercase tracking-widest">
                    Statut : {request.status === 'pending' ? 'En attente' : request.status === 'contacted' ? 'Expert Contacté' : request.status === 'cancelled' ? 'Annulé' : 'Projet Terminé'}
                 </span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Envoyé le {new Date(request.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
           </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-end gap-4">
           <button onClick={onClose} className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-brand-dark transition-colors">Fermer</button>
           
           {request.status === 'pending' && (
             <button 
              onClick={() => onCancel(request.id)}
              disabled={isCancelling}
              className="px-8 py-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-red-100 flex items-center gap-2"
             >
                {isCancelling ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Annuler la demande
             </button>
           )}

           <button className="px-8 py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all flex items-center gap-2">
              <MessageSquare size={14} /> Relancer l'expert
           </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Normalise toute réponse API en tableau de partenaires
 */
const normalizeFavorites = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.favorites)) return data.favorites;
  return [];
};

/**
 * Onglet Favoris — liste les partenaires sauvegardés
 */
const FavoritesTab = () => {
  const { user } = useAuth();
  const { toggle } = useFavorites();
  const [favPartners, setFavPartners] = useState([]);
  const [fetching, setFetching]       = useState(true);
  const [removing, setRemoving]       = useState(null);

  useEffect(() => {
    if (!user) { setFetching(false); return; }
    setFetching(true);
    api.get('/favorites')
      .then(res => {
        const list = normalizeFavorites(res.data);
        setFavPartners(list);
      })
      .catch(() => setFavPartners([]))
      .finally(() => setFetching(false));
  }, [user]);

  const handleRemove = async (partner) => {
    setRemoving(partner.id);
    try {
      await toggle(partner.id);
      setFavPartners(prev => (Array.isArray(prev) ? prev : []).filter(p => p.id !== partner.id));
    } catch {
      // ignore
    } finally {
      setRemoving(null);
    }
  };

  // Sécurité : s'assurer que c'est toujours un tableau avant le rendu
  const safeList = Array.isArray(favPartners) ? favPartners : [];

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100">
        <Loader2 className="animate-spin text-brand-orange mb-4" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement de vos favoris...</p>
      </div>
    );
  }

  if (safeList.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 animate-fade-in">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-200">
          <Heart size={48} />
        </div>
        <h3 className="text-2xl font-black text-brand-dark mb-4 uppercase tracking-tight">Aucun favori</h3>
        <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
          Explorez l'annuaire et ajoutez des experts à vos favoris en cliquant sur le bouton ♥ sur leur profil.
        </p>
        <Link to="/partenaires" className="bg-brand-dark text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all inline-flex items-center gap-2">
          Découvrir le réseau <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">
          Mes Favoris <span className="text-brand-orange">({safeList.length})</span>
        </h2>
        <Link to="/partenaires" className="text-[10px] font-black text-brand-orange uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
          Découvrir plus <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {safeList.map(partner => (
          <div key={partner.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 h-20 relative">
              <button
                onClick={() => handleRemove(partner)}
                disabled={removing === partner.id}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-red-500/80 text-white rounded-xl transition-all"
                title="Retirer des favoris"
              >
                {removing === partner.id
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Heart size={14} className="fill-white" />}
              </button>
            </div>

            <div className="px-6 -mt-8 pb-0">
              <div className="w-16 h-16 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center font-black text-brand-orange text-xl overflow-hidden">
                {partner.avatar_url
                  ? <img src={partner.avatar_url} alt={partner.name} className="w-full h-full object-cover" />
                  : (partner.company_name || partner.name)?.charAt(0)}
              </div>
            </div>

            <div className="p-6 pt-3 space-y-4">
              <div>
                <h3 className="font-black text-brand-dark uppercase tracking-tight text-base group-hover:text-brand-orange transition-colors">
                  {partner.company_name || partner.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{partner.category_name}</p>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-brand-orange" /> {partner.city || 'Cameroun'}
                </span>
                {partner.is_verified && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={11} /> Certifié
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  to={`/partenaire/${partner.id}`}
                  className="flex-1 py-3 bg-brand-dark text-white rounded-xl font-black uppercase tracking-widest text-[9px] text-center hover:bg-black transition-all flex items-center justify-center gap-1"
                >
                  Voir le profil <ExternalLink size={11} />
                </Link>
                <Link
                  to="/devis"
                  state={{ partnerId: partner.id, service: partner.category_name }}
                  className="flex-1 py-3 bg-brand-orange/10 text-brand-orange rounded-xl font-black uppercase tracking-widest text-[9px] text-center hover:bg-brand-orange hover:text-white transition-all flex items-center justify-center gap-1"
                >
                  Devis <FileText size={11} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [devis, setDevis] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [leadsRes, projectsRes, devisRes] = await Promise.all([
        api.get('/leads'),
        api.get('/projects'),
        api.get('/devis')
      ]);
      setLeads(leadsRes.data);
      setProjects(projectsRes.data.slice(0, 3));
      setDevis(Array.isArray(devisRes.data) ? devisRes.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelRequest = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette demande ?")) return;
    
    setIsCancelling(true);
    try {
      await api.put(`/leads/${id}/status`, { status: 'cancelled' });
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erreur annulation:", err);
      alert("Erreur lors de l'annulation");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelDevis = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler ce devis ?")) return;
    try {
      await api.put(`/devis/${id}/status`, { status: 'rejected' });
      await fetchData();
    } catch (err) {
      console.error("Erreur annulation devis:", err);
      alert("Erreur lors de l'annulation");
    }
  };

  const stats = [
    { 
      label: 'Demandes Envoyées', 
      value: leads.length, 
      icon: <History className="text-blue-500" /> 
    },
    { 
      label: 'Devis en Cours', 
      value: devis.length, 
      icon: <FileText className="text-brand-orange" /> 
    },
    { 
      label: 'Projets Finalisés', 
      value: leads.filter(l => l.status === 'completed').length, 
      icon: <CheckCircle className="text-green-500" /> 
    },
  ];

  const pendingDevis = devis.filter(d => d.status === 'pending');
  const pendingLeads = leads.filter(l => l.status === 'pending');
  const totalNotifs = pendingDevis.length + pendingLeads.length;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'contacted': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const mockMessages = [
    { id: 1, sender: "BTP 360 Support", text: "Bienvenue sur votre espace client personnalisé.", time: "Hier", unread: true },
    { id: 2, sender: "SGC Maconnerie", text: "Nous avons bien reçu votre demande de devis.", time: "2j", unread: false }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-[40] lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 lg:relative lg:flex w-72 bg-brand-dark text-white flex flex-col z-[50] transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-brand-orange/20">B</div>
            <span className="font-black text-xl tracking-tight uppercase">Espace Client</span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-white p-2">
             <ArrowRight className="rotate-180" />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('overview'); closeSidebar(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-white/10 text-brand-orange' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('requests'); closeSidebar(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'requests' ? 'bg-white/10 text-brand-orange' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <History size={20} /> Mes Demandes
          </button>
          <button 
            onClick={() => { setActiveTab('devis'); closeSidebar(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'devis' ? 'bg-white/10 text-brand-orange' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <FileText size={20} /> Mes Devis
            {pendingDevis.length > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {pendingDevis.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab('messages'); closeSidebar(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'messages' ? 'bg-white/10 text-brand-orange' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <MessageSquare size={20} /> Messages
          </button>
          <button 
            onClick={() => { setActiveTab('saved'); closeSidebar(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'saved' ? 'bg-white/10 text-brand-orange' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Heart size={20} /> Favoris
          </button>
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Mon Compte</div>
          <Link 
            to="/parametres" 
            onClick={closeSidebar}
            className="flex items-center gap-4 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all"
          >
            <Settings size={20} /> Paramètres
          </Link>
          <Link 
            to="/profil" 
            onClick={closeSidebar}
            className="flex items-center gap-4 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all"
          >
            <User size={20} /> Profil Public
          </Link>
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center gap-4 px-4 py-4 w-full text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-all"
          >
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white h-20 flex items-center justify-between px-4 lg:px-10 border-b border-slate-200 shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden bg-slate-50 p-2.5 rounded-xl text-slate-400"
              >
                <LayoutDashboard size={20} />
              </button>
              <div>
                <h1 className="text-lg md:text-2xl font-black text-brand-dark uppercase tracking-tight truncate">Tableau de Bord</h1>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="relative">
                <button 
                  className="relative text-slate-400 hover:text-brand-orange transition-colors p-2 hover:bg-slate-50 rounded-xl"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                >
                  <Bell size={22} className={isNotifOpen ? 'text-brand-orange' : ''} />
                  {totalNotifs > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-orange rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-fade-in">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-black text-brand-dark uppercase tracking-tight">Notifications</h3>
                      {totalNotifs > 0 && (
                        <span className="bg-brand-orange text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                          {totalNotifs} Nouvelles
                        </span>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {totalNotifs > 0 ? (
                        <>
                          {pendingDevis.map((d, idx) => (
                            <div 
                              key={`devis-${idx}`}
                              onClick={() => { setIsNotifOpen(false); setActiveTab('devis'); }}
                              className="p-5 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex gap-4 items-start"
                            >
                              <div className="w-10 h-10 shrink-0 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <FileText size={18} />
                              </div>
                              <div>
                                <h4 className="font-bold text-brand-dark text-sm">Devis : {d.service}</h4>
                                <p className="text-slate-500 text-xs mt-1 line-clamp-1">Envoyé à {d.partner_company || d.partner_name || 'un expert'}</p>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-2">
                                  {d.status === 'pending' ? 'En attente' : d.status === 'accepted' ? 'Accepté' : d.status}
                                </p>
                              </div>
                            </div>
                          ))}
                          {pendingLeads.map((l, idx) => (
                            <div 
                              key={`lead-${idx}`}
                              onClick={() => { setIsNotifOpen(false); openRequestDetails(l); }}
                              className="p-5 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex gap-4 items-start"
                            >
                              <div className="w-10 h-10 shrink-0 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange font-black">
                                {l.partner_company?.charAt(0) || l.partner_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <h4 className="font-bold text-brand-dark text-sm">{l.service_requested}</h4>
                                <p className="text-slate-500 text-xs mt-1 line-clamp-1">{l.partner_company || l.partner_name}</p>
                                <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest mt-2">En attente</p>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="p-10 text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-slate-300" size={24} />
                          </div>
                          <p className="text-slate-400 text-sm font-medium">Aucune notification pour le moment.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                 <div className="hidden sm:block text-right">
                    <p className="text-xs font-black text-brand-dark uppercase leading-none">{user?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Client Privilège</p>
                 </div>
                 <div className="w-10 h-10 bg-slate-50 rounded-xl border-2 border-slate-100 flex items-center justify-center text-brand-orange overflow-hidden shadow-sm">
                   {user?.avatar_url ? (
                     <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     <User size={20} />
                   )}
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Chargement de votre univers...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4 md:gap-6 group hover:shadow-xl transition-all hover:-translate-y-1">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-orange/5 transition-colors shrink-0">
                        {stat.icon}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-2xl md:text-3xl font-black text-brand-dark mb-1">{stat.value}</div>
                        <div className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest truncate">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                   {/* Left Column - Leads */}
                   <div className="lg:col-span-2 space-y-10">
                      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                           <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">Suivi des Demandes</h2>
                           <button onClick={() => setActiveTab('requests')} className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:opacity-70">Voir l'historique</button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-50">
                              {leads.length > 0 ? leads.slice(0, 4).map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/30 transition-colors group">
                                  <td className="px-8 py-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expert</p>
                                    <div className="font-bold text-brand-dark">{req.partner_company || req.partner_name}</div>
                                  </td>
                                  <td className="px-8 py-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                    <div className="text-slate-500 font-medium text-sm">{formatDate(req.created_at)}</div>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                      req.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                      req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {getStatusLabel(req.status)}
                                    </span>
                                  </td>
                                  <td className="px-8 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button 
                                      onClick={() => openRequestDetails(req)}
                                      className="p-2 hover:bg-brand-orange/10 hover:text-brand-orange rounded-lg transition-all"
                                     >
                                        <ArrowRight size={18} />
                                     </button>
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td className="px-8 py-16 text-center text-slate-400 font-medium italic">
                                    Aucune demande de devis en cours.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                   </div>

                   {/* Right Column - Suggestions */}
                   <div className="space-y-8">
                      <div className="bg-brand-dark rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                         <h3 className="text-sm font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Suggestions pour vous</h3>
                         <div className="space-y-6">
                            {projects.map(p => (
                               <Link key={p.id} to={`/projet/${p.id}`} className="flex items-center gap-4 group">
                                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                                     <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                  </div>
                                  <div className="overflow-hidden">
                                     <h4 className="text-sm font-black uppercase truncate group-hover:text-brand-orange transition-colors">{p.title}</h4>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{p.company_name || 'Expert BTP'}</p>
                                  </div>
                               </Link>
                            ))}
                         </div>
                         <Link to="/projets" className="mt-8 block w-full py-4 bg-white/5 hover:bg-white/10 text-center rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                            Voir plus d'inspirations
                         </Link>
                         <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-brand-orange/10 rounded-full blur-3xl"></div>
                      </div>

                      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                         <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                               <Shield size={20} />
                            </div>
                            <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest">Garantie BTP 360</h3>
                         </div>
                         <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                            Tous vos projets sont protégés. En cas de litige, nos experts interviennent gratuitement.
                         </p>
                         <button className="text-[10px] font-black text-brand-dark uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                            En savoir plus <ArrowRight size={14} className="text-brand-orange" />
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                   <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Historique complet ({leads.length})</h2>
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        placeholder="Filtrer mes demandes..."
                        className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-orange/20"
                      />
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-10 py-6">Expert / Partenaire</th>
                        <th className="px-10 py-6">Service</th>
                        <th className="px-10 py-6">Message</th>
                        <th className="px-10 py-6">Date</th>
                        <th className="px-10 py-6 text-right">Statut</th>
                        <th className="px-10 py-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leads.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-8">
                            <div className="font-bold text-brand-dark uppercase text-sm tracking-tight">{req.partner_company || req.partner_name}</div>
                          </td>
                          <td className="px-10 py-8 text-slate-500 font-medium text-sm">{req.service_requested}</td>
                          <td className="px-10 py-8 text-slate-400 text-xs font-medium max-w-xs truncate italic">"{req.message}"</td>
                          <td className="px-10 py-8 text-slate-400 text-xs font-black uppercase tracking-tighter whitespace-nowrap">{formatDate(req.created_at)}</td>
                          <td className="px-10 py-8 text-right">
                            <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                              req.status === 'completed' ? 'bg-green-100 text-green-700' : 
                              req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {getStatusLabel(req.status)}
                            </span>
                          </td>
                          <td className="px-10 py-8">
                             <button 
                              onClick={() => openRequestDetails(req)}
                              className="text-brand-orange font-black text-[10px] uppercase tracking-widest hover:underline"
                             >
                                Détails
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-[600px] animate-fade-in">
                 <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 font-black uppercase tracking-widest text-xs text-slate-400">Conversations</div>
                    <div className="flex-1 overflow-y-auto">
                       {mockMessages.map(msg => (
                          <button key={msg.id} className={`w-full p-8 text-left hover:bg-slate-50 transition-all border-b border-slate-50 flex gap-4 ${msg.unread ? 'bg-brand-orange/5' : ''}`}>
                             <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-brand-orange shrink-0">
                                {msg.sender.charAt(0)}
                             </div>
                             <div className="overflow-hidden">
                                <div className="flex justify-between items-center mb-1">
                                   <p className="text-sm font-black text-brand-dark uppercase truncate">{msg.sender}</p>
                                   <span className="text-[10px] font-bold text-slate-400">{msg.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium truncate">{msg.text}</p>
                             </div>
                          </button>
                       ))}
                    </div>
                 </div>
                 <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center p-20 text-center relative overflow-hidden">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                       <MessageSquare size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-brand-dark mb-4 uppercase tracking-tight">Messagerie Sécurisée</h3>
                    <p className="text-slate-400 font-medium max-w-sm mb-10 leading-relaxed">
                       Sélectionnez une conversation pour discuter avec vos experts et partenaires.
                    </p>
                    <div className="px-8 py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100">
                       Ouverture Prochaine
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <FavoritesTab />
            )}

            {activeTab === 'devis' && (
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                  <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Mes Devis ({devis.length})</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {devis.length === 0 ? (
                    <div className="py-20 text-center">
                      <FileText className="mx-auto text-slate-100 mb-4" size={56} />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucune demande de devis</p>
                      <p className="text-slate-300 text-xs font-medium mt-2">Explorez nos partenaires pour demander un devis.</p>
                      <Link to="/devis" className="inline-block mt-6 bg-brand-orange text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Demander un devis</Link>
                    </div>
                  ) : (
                    devis.map((d) => (
                      <div key={d.id} className="p-8 hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 font-black text-xl shrink-0">
                              <FileText size={24} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-brand-dark text-lg">{d.service}</h4>
                              <p className="text-slate-500 text-sm font-medium mt-1">Envoyé à <span className="font-bold text-brand-dark">{d.partner_company || d.partner_name || 'Expert'}</span></p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>{formatDate(d.created_at)}</span>
                                {d.budget && <span>• {d.budget}</span>}
                                {d.deadline && <span>• {d.deadline}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                              d.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              d.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              d.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {d.status === 'accepted' ? 'Accepté' :
                               d.status === 'rejected' ? 'Refusé' :
                               d.status === 'completed' ? 'Terminé' : 'En attente'}
                            </span>
                            {d.status === 'pending' && (
                              <button 
                                onClick={() => handleCancelDevis(d.id)}
                                className="text-red-400 hover:text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                              >
                                Annuler
                              </button>
                            )}
                          </div>
                        </div>
                        {d.description && (
                          <p className="mt-4 ml-20 text-slate-400 text-sm font-medium italic line-clamp-2">"{d.description}"</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Floating Help Button */}
        <div className="fixed bottom-10 right-10 z-[60]">
           <button className="w-16 h-16 bg-brand-orange text-white rounded-2xl shadow-2xl shadow-brand-orange/40 flex items-center justify-center hover:scale-110 transition-all group">
              <MessageSquare size={24} className="group-hover:animate-pulse" />
           </button>
        </div>
        </div>

        {/* Request Details Modal */}
        <RequestDetailsModal 
          request={selectedRequest}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCancel={handleCancelRequest}
          isCancelling={isCancelling}
        />
      </main>
    </div>
  );
};

export default ClientDashboard;
