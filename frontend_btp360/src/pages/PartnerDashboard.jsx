import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Plus, 
  MoreHorizontal,
  LayoutDashboard,
  LogOut,
  Bell,
  Search,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Trash2,
  ChevronRight,
  FileText,
  MessageSquare,
  Send,
  ArrowLeft
} from 'lucide-react';
import AddProjectModal from '../components/AddProjectModal';
import LeadDetailsModal from '../components/LeadDetailsModal';
import ConfirmModal from '../components/ConfirmModal';

const PartnerDashboard = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [activeChatMobileView, setActiveChatMobileView] = useState('list');
  const closeSidebar = () => setIsSidebarOpen(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingDevisCount, setPendingDevisCount] = useState(0);
  const messagesEndRef = useRef(null);
  const [conversations, setConversations] = useState([
    {
      id: 1,
      sender: "BTP 360 Support",
      role: "Assistance Plateforme",
      unread: false,
      messages: [
        { id: 1, sender: "BTP 360 Support", text: "Bonjour ! Nous sommes à votre disposition pour vous aider à optimiser votre visibilité.", time: "09:00", isMe: false }
      ]
    },
    {
      id: 2,
      sender: "Jean Dupont",
      role: "Client BTP 360",
      unread: true,
      messages: [
        { id: 1, sender: "Jean Dupont", text: "Bonjour ! Serait-il possible de convenir d'un rendez-vous sur le chantier à Bonamoussadi ce samedi ?", time: "Hier", isMe: false }
      ]
    }
  ]);
  const [selectedConvId, setSelectedConvId] = useState(1);
  const [activeMessageText, setActiveMessageText] = useState("");

  const selectConversation = async (convId) => {
    setSelectedConvId(convId);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread: false } : c));
    setActiveChatMobileView('chat');

    // Si c'est une vraie conversation en base de données
    if (convId !== 1 && convId !== 2) {
      setLoadingChat(true);
      try {
        const res = await api.get(`/messages/conversation/${convId}`);
        setConversations(prev => prev.map(c => {
          if (c.id === convId) {
            return {
              ...c,
              messages: res.data.map(m => ({
                id: m.id,
                sender: m.sender_id === user.id ? (user.name || "Moi") : c.sender,
                text: m.message,
                time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                isMe: m.sender_id === user.id
              }))
            };
          }
          return c;
        }));
      } catch (err) {
        console.error("Erreur chargement messages:", err);
      } finally {
        setLoadingChat(false);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeMessageText.trim()) return;

    const messageText = activeMessageText;
    setActiveMessageText("");

    if (selectedConvId === 1 || selectedConvId === 2) {
      // Mock messages logic
      const newMessage = {
        id: Date.now(),
        sender: user?.name || "Partenaire",
        text: messageText,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConvId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage]
          };
        }
        return conv;
      }));

      const currentConvId = selectedConvId;
      setIsTyping(true);
      setTimeout(() => {
        let replyText = "Merci pour votre réponse. Je vous recontacte rapidement.";
        if (currentConvId === 1) {
          replyText = "Un administrateur technique a bien reçu votre demande. Nous traitons votre dossier dans les plus brefs délais.";
        } else if (currentConvId === 2) {
          replyText = "Entendu, samedi matin me convient parfaitement. À samedi !";
        }

        const autoReply = {
          id: Date.now() + 1,
          sender: currentConvId === 1 ? "BTP 360 Support" : "Jean Dupont",
          text: replyText,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isMe: false
        };

        setIsTyping(false);
        setConversations(prev => prev.map(conv => {
          if (conv.id === currentConvId) {
            return {
              ...conv,
              messages: [...conv.messages, autoReply]
            };
          }
          return conv;
        }));
      }, 1500);
    } else {
      // Real API message
      try {
        const res = await api.post('/messages', {
          receiver_id: selectedConvId,
          message: messageText
        });

        const newMsg = {
          id: res.data.data.id || Date.now(),
          sender: user?.name || "Partenaire",
          text: messageText,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isMe: true
        };

        setConversations(prev => prev.map(conv => {
          if (conv.id === selectedConvId) {
            return {
              ...conv,
              messages: [...conv.messages, newMsg]
            };
          }
          return conv;
        }));
      } catch (err) {
        console.error("Erreur envoi message:", err);
        alert("Impossible d'envoyer le message.");
      }
    }
  };

  const fetchConversations = async (currentLeads, currentDevis) => {
    try {
      const convsRes = await api.get('/messages/conversations');
      let loadedConvs = convsRes.data.map(c => ({
        id: c.partner_id,
        sender: c.partner_name,
        role: c.role_name === 'client' ? 'Client Particulier' : c.role_name,
        unread: c.unread_count > 0,
        messages: c.last_message ? [{
          id: Date.now(),
          sender: c.partner_name,
          text: c.last_message,
          time: new Date(c.last_message_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isMe: false
        }] : []
      }));

      // Extraire les clients uniques depuis les leads et devis
      const clientsFromLeads = currentLeads
        .filter(l => l.client_id)
        .map(l => ({
          id: l.client_id,
          sender: l.client_name,
          role: 'Client BTP 360'
        }));

      const clientsFromDevis = currentDevis
        .filter(d => d.client_id)
        .map(d => ({
          id: d.client_id,
          sender: d.client_name,
          role: 'Client BTP 360'
        }));

      const allClients = [...clientsFromLeads, ...clientsFromDevis];
      
      const uniqueClients = [];
      const seen = new Set();
      allClients.forEach(c => {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          uniqueClients.push(c);
        }
      });

      const mergedConvs = [...loadedConvs];
      uniqueClients.forEach(cl => {
        if (!mergedConvs.some(c => c.id === cl.id)) {
          mergedConvs.push({
            id: cl.id,
            sender: cl.sender,
            role: cl.role,
            unread: false,
            messages: []
          });
        }
      });

      const defaultConvs = [
        {
          id: 1,
          sender: "BTP 360 Support",
          role: "Assistance Plateforme",
          unread: false,
          messages: [
            { id: 1, sender: "BTP 360 Support", text: "Bonjour ! Nous sommes à votre disposition pour vous aider à optimiser votre visibilité.", time: "09:00", isMe: false }
          ]
        },
        {
          id: 2,
          sender: "Jean Dupont",
          role: "Client BTP 360",
          unread: false,
          messages: [
            { id: 1, sender: "Jean Dupont", text: "Bonjour ! Serait-il possible de convenir d'un rendez-vous sur le chantier à Bonamoussadi ce samedi ?", time: "Hier", isMe: false }
          ]
        }
      ];

      defaultConvs.forEach(mock => {
        if (!mergedConvs.some(c => c.id === mock.id)) {
          mergedConvs.push(mock);
        }
      });

      setConversations(mergedConvs);
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
    }
  };

  const fetchData = async () => {
    try {
      const [leadsRes, projectsRes, devisRes] = await Promise.all([
        api.get('/leads'),
        api.get('/projects/my'),
        api.get('/devis')
      ]);

      setLeads(leadsRes.data);
      setProjects(projectsRes.data);
      const devisData = Array.isArray(devisRes.data) ? devisRes.data : [];
      setDevis(devisData);

      await fetchConversations(leadsRes.data, devisData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeletingProject(true);
    try {
      await api.delete(`/projects/${projectToDelete.id}`);
      fetchData();
      setProjectToDelete(null);
    } catch (err) {
      console.error('Erreur suppression projet:', err);
      alert("Impossible de supprimer le projet");
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleDevisStatus = async (devisId, status) => {
    try {
      await api.put(`/devis/${devisId}/status`, { status });
      fetchData();
    } catch (err) {
      console.error('Erreur mise à jour devis:', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  useEffect(() => {
    fetchData();

    const token = localStorage.getItem('btp360_token');
    if (!token) return;

    const sseUrl = `http://localhost/btp_360/backend_btp360/index.php/notifications/stream?token=${token}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.unread_messages !== undefined) {
          setUnreadCount(data.unread_messages);
        }
        if (data.pending_devis !== undefined) {
          setPendingDevisCount(data.pending_devis);
        }
        fetchData();
      } catch (err) {
        console.error('Erreur décodage SSE:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const pendingLeads = leads.filter(l => l.status === 'pending');
  const completedLeads = leads.filter(l => l.status === 'completed');
  const conversionRate = leads.length > 0 ? Math.round((completedLeads.length / leads.length) * 100) : 0;
  const pendingDevis = devis.filter(d => d.status === 'pending');

  const calculateCompleteness = () => {
    if (!user) return 0;
    let score = 0;
    if (user.name) score += 15;
    if (user.email) score += 15;
    if (user.phone) score += 15;
    if (user.company_name) score += 15;
    if (user.city) score += 15;
    if (user.avatar_url) score += 15;
    if (projects && projects.length > 0) score += 10;
    return Math.min(100, score);
  };
  const profileCompleteness = calculateCompleteness();

  const businessStats = [
    { label: 'Leads Reçus', value: leads.length, icon: <Users className="text-orange-500" />, sub: `${pendingLeads.length} en attente` },
    { label: 'Devis Reçus', value: devis.length, icon: <FileText className="text-blue-500" />, sub: `${pendingDevis.length} en attente` },
    { label: 'Projets Publiés', value: projects.length, icon: <Briefcase className="text-emerald-500" />, sub: 'Portfolio actif' },
    { label: 'Taux de Conversion', value: `${conversionRate}%`, icon: <TrendingUp className="text-green-500" />, sub: `${completedLeads.length} projets conclus` },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) return `il y a ${hours}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const selectedConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConvId, selectedConv?.messages, isTyping]);

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
            <span className="font-black text-xl tracking-tight uppercase">BTP 360 <span className="text-brand-orange">Pro</span></span>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-white p-2">
             <ChevronRight size={24} className="rotate-180" />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('overview'); closeSidebar(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-black transition-all text-sm uppercase tracking-wider ${activeTab === 'overview' ? 'bg-white/10 text-brand-orange' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Vue d'ensemble
          </button>
          <button 
            onClick={() => { setActiveTab('leads'); closeSidebar(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wider ${activeTab === 'leads' ? 'bg-white/10 text-brand-orange' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={20} /> Mes Prospects
            {pendingLeads.length > 0 && (
              <span className="ml-auto bg-brand-orange text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {pendingLeads.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab('devis'); closeSidebar(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wider ${activeTab === 'devis' ? 'bg-white/10 text-brand-orange' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <FileText size={20} /> Devis Reçus
            {(pendingDevisCount || pendingDevis.length) > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {pendingDevisCount || pendingDevis.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab('messages'); closeSidebar(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wider ${activeTab === 'messages' ? 'bg-white/10 text-brand-orange' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <MessageSquare size={20} /> Messages
            {(unreadCount || conversations.filter(c => c.unread).length) > 0 && (
              <span className="ml-auto bg-brand-orange text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount || conversations.filter(c => c.unread).length}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab('projects'); closeSidebar(); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wider ${activeTab === 'projects' ? 'bg-white/10 text-brand-orange' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Briefcase size={20} /> Mes Réalisations
          </button>
          <Link 
            to="/parametres" 
            onClick={closeSidebar}
            className="flex items-center gap-4 px-4 py-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
          >
            <Building2 size={20} /> Fiche Entreprise
          </Link>
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center gap-4 px-4 py-4 w-full text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-all text-sm uppercase tracking-wider"
          >
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white h-20 flex items-center justify-between px-4 lg:px-10 border-b border-slate-200 shrink-0">
           <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden bg-slate-50 p-2.5 rounded-xl text-slate-400"
              >
                <LayoutDashboard size={20} />
              </button>
              <div className="hidden md:flex flex-1 max-w-md">
                 <div className="relative group w-full">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-orange transition-colors" size={18} />
                   <input 
                     type="text" 
                     placeholder="Rechercher..." 
                     className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-transparent outline-none focus:bg-white focus:border-brand-orange transition-all text-sm"
                   />
                 </div>
              </div>
              <h1 className="lg:hidden text-sm font-black text-brand-dark uppercase truncate">Console Pro</h1>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative">
                 <div 
                    className="cursor-pointer p-2 hover:bg-slate-50 rounded-xl transition-colors relative"
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                 >
                    <Bell size={20} className={`${isNotifOpen ? 'text-brand-orange' : 'text-slate-400'} transition-colors`} />
                     {(pendingLeads.length + pendingDevis.length) > 0 && (
                       <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-orange rounded-full border-2 border-white animate-pulse"></span>
                     )}
                 </div>

                 {/* Notifications Dropdown */}
                 {isNotifOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-fade-in">
                       <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                          <h3 className="font-black text-brand-dark uppercase tracking-tight">Notifications</h3>
                           {(pendingLeads.length + pendingDevis.length) > 0 && (
                             <span className="bg-brand-orange text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                                {pendingLeads.length + pendingDevis.length} Nouvelles
                             </span>
                           )}
                       </div>
                       <div className="max-h-[400px] overflow-y-auto">
                          {(pendingLeads.length > 0 || pendingDevis.length > 0) ? (
                            <>
                              {pendingDevis.map((d, idx) => (
                                <div 
                                  key={`devis-${idx}`}
                                  onClick={() => {
                                    setIsNotifOpen(false);
                                    setActiveTab('devis');
                                  }}
                                  className="p-6 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex gap-4 items-start"
                                >
                                  <div className="w-10 h-10 shrink-0 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black shadow-inner">
                                    <FileText size={18} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-brand-dark text-sm">Nouveau devis de {d.client_name}</h4>
                                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">{d.service}</p>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-2">Devis · {formatDate(d.created_at)}</p>
                                  </div>
                                </div>
                              ))}
                              {pendingLeads.slice(0, 5).map((lead, idx) => (
                                <div 
                                  key={`lead-${idx}`}
                                  onClick={() => {
                                    setIsNotifOpen(false);
                                    setSelectedLead(lead);
                                    setIsDetailsModalOpen(true);
                                  }}
                                  className="p-6 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex gap-4 items-start"
                                >
                                  <div className="w-10 h-10 shrink-0 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange font-black shadow-inner">
                                    {lead.client_name?.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-brand-dark text-sm">{lead.client_name}</h4>
                                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">{lead.message}</p>
                                    <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest mt-2">Lead · {formatDate(lead.created_at)}</p>
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : (
                             <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                   <Bell className="text-slate-300" size={24} />
                                </div>
                                <p className="text-slate-400 text-sm font-medium">Vous n'avez aucune notification pour le moment.</p>
                             </div>
                          )}
                       </div>
                       {pendingLeads.length + pendingDevis.length > 0 && (
                          <div className="p-4 bg-white border-t border-slate-50">
                             <button 
                                onClick={() => { setIsNotifOpen(false); setActiveTab('leads'); }}
                                className="w-full py-3 text-xs font-black text-slate-400 hover:text-brand-dark hover:bg-slate-50 rounded-xl uppercase tracking-widest transition-all"
                             >
                                Voir tous les prospects
                             </button>
                          </div>
                       )}
                    </div>
                 )}
              </div>
              <div className="flex items-center gap-3 ml-2">
                 <div className="text-right hidden sm:block">
                    <div className="font-black text-brand-dark text-[10px] leading-none uppercase tracking-widest">{user?.name}</div>
                    <div className="text-[8px] font-bold text-brand-orange uppercase tracking-[0.2em] mt-1">Certifié</div>
                 </div>
                 <div className="w-10 h-10 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center font-black text-slate-400">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm">{user?.name?.charAt(0)}</span>
                    )}
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-12">
        {loading ? (
          <div className="space-y-12 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-white rounded-[2.5rem] border border-slate-100"></div>
               ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="lg:col-span-2 h-[600px] bg-white rounded-[3rem] border border-slate-100"></div>
               <div className="h-[400px] bg-white rounded-[2.5rem] border border-slate-100"></div>
            </div>
          </div>
        ) : (
          <>
            {/* New Leads Alert Banner */}
            {(pendingLeads.length + pendingDevis.length) > 0 && activeTab === 'overview' && (
              <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-3xl p-6 flex items-center gap-6 mb-6 animate-fade-in">
                <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white shrink-0 animate-pulse">
                  <Bell size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-brand-dark uppercase tracking-tight">
                    {pendingLeads.length + pendingDevis.length} nouvelle{(pendingLeads.length + pendingDevis.length) > 1 ? 's' : ''} notification{(pendingLeads.length + pendingDevis.length) > 1 ? 's' : ''}
                  </p>
                  <p className="text-slate-500 text-sm font-medium">
                    {pendingLeads.length > 0 && `${pendingLeads.length} lead${pendingLeads.length > 1 ? 's' : ''}`}
                    {pendingLeads.length > 0 && pendingDevis.length > 0 && ' · '}
                    {pendingDevis.length > 0 && `${pendingDevis.length} devis`}
                    {' '}en attente de réponse.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab(pendingDevis.length > 0 ? 'devis' : 'leads')}
                  className="shrink-0 bg-brand-orange text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all"
                >
                  Voir
                </button>
              </div>
            )}

            {/* Business Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mb-10 md:mb-16">
              {businessStats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4 md:gap-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-black text-brand-dark mb-1">{stat.value}</div>
                    <div className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                    {stat.sub && <div className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1">{stat.sub}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Activity & Projects Grid */}
            <div className={`${activeTab === 'messages' ? 'w-full' : 'grid grid-cols-1 lg:grid-cols-3 gap-10'}`}>
              {/* Content based on active tab */}
              <div className={`${activeTab === 'messages' ? 'w-full' : 'lg:col-span-2'} space-y-10`}>
                {activeTab === 'overview' && (
                  <>
                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-6 md:p-10">
                      <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xl md:text-2xl font-black text-brand-dark tracking-tight uppercase">Derniers Prospects</h2>
                        <button 
                          onClick={() => setActiveTab('leads')}
                          className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <MoreHorizontal size={24} className="text-slate-400" />
                        </button>
                      </div>
                      
                      <div className="space-y-4 md:space-y-6">
                          {leads.length > 0 ? leads.slice(0, 5).map((lead, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => { setSelectedLead(lead); setIsDetailsModalOpen(true); }}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-50 hover:bg-white hover:shadow-xl transition-all cursor-pointer group gap-4"
                            >
                              <div className="flex items-center gap-5">
                                <div className="shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-brand-orange shadow-sm">
                                  <span>{lead.client_name?.charAt(0)}</span>
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-black text-brand-dark truncate">{lead.client_name}</div>
                                    <div className="text-sm text-slate-500 font-medium line-clamp-1">{lead.message}</div>
                                </div>
                              </div>
                              <div className="text-left sm:text-right shrink-0">
                                <div className="text-[9px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{formatDate(lead.created_at)}</div>
                                <span className="text-xs font-bold text-brand-orange whitespace-nowrap">Détails →</span>
                              </div>
                            </div>
                          )) : (
                            <div className="py-12 text-center text-slate-400 font-medium italic">
                               Aucun prospect pour le moment.
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
                      <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black text-brand-dark tracking-tight uppercase">Vos Réalisations</h2>
                        <button 
                          onClick={() => setActiveTab('projects')}
                          className="text-sm font-black text-brand-orange hover:underline uppercase tracking-widest"
                        >
                          Voir tout
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.length > 0 ? projects.slice(0, 4).map((project, idx) => (
                          <div key={idx} className="group relative rounded-[2rem] overflow-hidden bg-slate-900 border border-white/10 shadow-lg">
                            <div className="aspect-video relative overflow-hidden">
                              {project.image_url ? (
                                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" />
                              ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600 font-black">IMAGE PROJET</div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end group">
                                <h4 className="text-white font-black text-lg leading-tight mb-1">{project.title}</h4>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{formatDate(project.completion_date)}</p>
                                
                                <div className="absolute top-4 right-4 flex gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setProjectToDelete(project); }}
                                    className="p-2 bg-red-500/20 backdrop-blur-md rounded-full text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="col-span-2 py-12 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-3xl">
                            Vous n'avez pas encore publié de projets.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'leads' && (
                  <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
                    <h2 className="text-2xl font-black text-brand-dark tracking-tight uppercase mb-10">Gestion des Prospects ({leads.length})</h2>
                    {leads.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <Users className="mx-auto text-slate-100 mb-4" size={56} />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucun prospect pour le moment.</p>
                        <p className="text-slate-300 text-xs font-medium mt-2">Les demandes clients apparaîtront ici.</p>
                      </div>
                    ) : (
                    <div className="space-y-4">
                      {leads.map((lead, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row items-center justify-between p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all gap-6">
                           <div className="flex items-center gap-6 flex-1">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-brand-orange shadow-md text-xl">
                                <span>{lead.client_name?.charAt(0)}</span>
                              </div>
                              <div>
                                 <h4 className="text-lg font-black text-brand-dark">{lead.client_name}</h4>
                                 <p className="text-slate-500 text-sm font-medium italic mb-2 line-clamp-1">"{lead.message}"</p>
                                 <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>{formatDate(lead.created_at)}</span>
                                    <span>•</span>
                                    <span className={`px-3 py-1 rounded-lg ${
                                      lead.status === 'completed'  ? 'bg-green-100 text-green-600' :
                                      lead.status === 'contacted'  ? 'bg-blue-100 text-blue-600'  :
                                      lead.status === 'cancelled'  ? 'bg-red-100 text-red-600'    :
                                      'bg-brand-orange/10 text-brand-orange'
                                    }`}>
                                       {lead.status === 'completed' ? 'Terminé' :
                                        lead.status === 'contacted' ? 'Contacté' :
                                        lead.status === 'cancelled' ? 'Annulé'  : 'En attente'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <button 
                            onClick={() => { setSelectedLead(lead); setIsDetailsModalOpen(true); }}
                            className="bg-brand-dark text-white px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-brand-orange transition-colors"
                           >
                              Gérer le prospect
                           </button>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
                    <div className="flex justify-between items-center mb-10">
                      <h2 className="text-2xl font-black text-brand-dark tracking-tight uppercase">Mon Portfolio ({projects.length})</h2>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-brand-orange text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand-orange/20 hover:scale-105 transition-all"
                      >
                        Ajouter un projet
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {projects.map((project, idx) => (
                        <div key={idx} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden">
                           <div className="aspect-video bg-slate-50 relative overflow-hidden">
                              {project.image_url ? (
                                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200 font-black italic">SANS IMAGE</div>
                              )}
                              <button 
                                onClick={() => setProjectToDelete(project)}
                                className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                              >
                                <Trash2 size={18} />
                              </button>
                           </div>
                           <div className="p-6">
                              <h4 className="text-xl font-black text-brand-dark mb-2">{project.title}</h4>
                              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{formatDate(project.completion_date)}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'devis' && (
                  <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10">
                    <h2 className="text-2xl font-black text-brand-dark tracking-tight uppercase mb-10">Demandes de Devis ({devis.length})</h2>
                    {devis.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <FileText className="mx-auto text-slate-100 mb-4" size={56} />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucune demande de devis.</p>
                        <p className="text-slate-300 text-xs font-medium mt-2">Les demandes de devis apparaîtront ici.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {devis.map((d) => (
                          <div key={d.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all gap-6">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-blue-500 shadow-md text-xl shrink-0">
                                <FileText size={28} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-lg font-black text-brand-dark">{d.client_name || 'Client'}</h4>
                                <p className="text-sm font-bold text-brand-orange">{d.service}</p>
                                <p className="text-slate-500 text-sm font-medium italic mb-2 line-clamp-2 mt-1">"{d.description}"</p>
                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  <span>{formatDate(d.created_at)}</span>
                                  {d.budget && <span>• Budget : {d.budget}</span>}
                                  {d.deadline && <span>• Délai : {d.deadline}</span>}
                                  {d.address && <span>• {d.address}</span>}
                                  <span className={`px-3 py-1 rounded-lg ${
                                    d.status === 'accepted'  ? 'bg-green-100 text-green-600' :
                                    d.status === 'rejected'  ? 'bg-red-100 text-red-600'    :
                                    d.status === 'completed' ? 'bg-blue-100 text-blue-600'  :
                                    'bg-brand-orange/10 text-brand-orange'
                                  }`}>
                                    {d.status === 'accepted' ? 'Accepté' :
                                     d.status === 'rejected' ? 'Refusé'  :
                                     d.status === 'completed' ? 'Terminé' : 'En attente'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {d.status === 'pending' && (
                              <div className="flex gap-3 shrink-0">
                                <button 
                                  onClick={() => handleDevisStatus(d.id, 'accepted')}
                                  className="bg-green-500 text-white px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-colors"
                                >
                                  Accepter
                                </button>
                                <button 
                                  onClick={() => handleDevisStatus(d.id, 'rejected')}
                                  className="bg-slate-100 text-slate-500 px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                  Refuser
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'messages' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] animate-fade-in text-left">
                     {/* Left Panel: Conversations List */}
                     <div className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col ${activeChatMobileView === 'list' ? 'flex' : 'hidden lg:flex'}`}>
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                           <h3 className="font-black uppercase tracking-widest text-xs text-brand-dark">Messagerie</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                           {conversations.map(conv => {
                              const lastMsg = conv.messages[conv.messages.length - 1];
                              const isActive = conv.id === selectedConvId;
                              return (
                                 <button 
                                   key={conv.id} 
                                   type="button"
                                   onClick={() => selectConversation(conv.id)}
                                   className={`w-full p-6 text-left transition-all flex gap-4 items-start relative ${
                                     isActive 
                                       ? 'bg-slate-50 border-r-4 border-brand-orange shadow-inner' 
                                       : 'hover:bg-slate-50/50'
                                   }`}
                                 >
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-brand-orange shrink-0">
                                       {conv.sender.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden flex-1">
                                       <div className="flex justify-between items-baseline mb-1">
                                          <p className="text-xs font-black text-brand-dark uppercase truncate">{conv.sender}</p>
                                          <span className="text-[9px] font-bold text-slate-400">{lastMsg?.time || ''}</span>
                                       </div>
                                       <p className="text-xs text-slate-500 font-medium truncate">{lastMsg?.text || ''}</p>
                                    </div>
                                    {conv.unread && (
                                       <span className="absolute top-6 right-6 w-2.5 h-2.5 bg-brand-orange rounded-full"></span>
                                    )}
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* Right Panel: Active Chat Window */}
                     <div className={`lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden ${activeChatMobileView === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                           <div className="flex items-center gap-4">
                              <button 
                                 onClick={() => setActiveChatMobileView('list')}
                                 className="lg:hidden p-2 hover:bg-slate-100 rounded-full text-slate-400"
                              >
                                 <ArrowLeft size={20} className="text-brand-orange" />
                              </button>
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-brand-orange text-sm">
                                 {selectedConv.sender.charAt(0)}
                              </div>
                              <div>
                                 <h4 className="text-xs font-black text-brand-dark uppercase tracking-wider">{selectedConv.sender}</h4>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedConv.role}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En ligne</span>
                           </div>
                        </div>

                         {loadingChat ? (
                            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30 gap-3">
                               <Loader2 className="animate-spin text-brand-orange" size={32} />
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement de la conversation...</span>
                            </div>
                         ) : (
                            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 space-y-4">
                               {selectedConv.messages.map(msg => (
                                  <div 
                                    key={msg.id} 
                                    className={`flex flex-col max-w-[75%] animate-scale-in ${msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                                  >
                                     <div className={`p-4 text-sm font-medium leading-relaxed shadow-sm transition-all duration-300 ${
                                       msg.isMe 
                                         ? 'bg-brand-dark text-white rounded-2xl rounded-tr-none' 
                                         : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none'
                                     }`}>
                                        {msg.text}
                                     </div>
                                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 px-1">{msg.time}</span>
                                  </div>
                               ))}

                               {isTyping && (
                                  <div className="flex gap-4 items-start animate-fade-in mr-auto max-w-[75%]">
                                     <div className="bg-white text-slate-500 border border-slate-100 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-12">
                                        <span className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                     </div>
                                  </div>
                               )}
                               <div ref={messagesEndRef} />
                            </div>
                         )}

                        {/* Message Input Form */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-3 items-center shrink-0">
                           <input 
                             type="text"
                             value={activeMessageText}
                             onChange={(e) => setActiveMessageText(e.target.value)}
                             placeholder="Rédigez votre message ici..."
                             className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-orange/20 text-brand-dark"
                           />
                           <button 
                             type="submit"
                             className="p-4 bg-brand-orange text-white rounded-xl shadow-lg shadow-brand-orange/20 hover:scale-105 transition-all flex items-center justify-center shrink-0 hover:bg-black"
                           >
                              <Send size={16} />
                           </button>
                        </form>
                     </div>
                  </div>
                )}
              </div>

              {/* Sidebar Area: Small Tools */}
              {activeTab !== 'messages' && (
                <div className="space-y-10">
                  <div className="bg-brand-orange rounded-[2.5rem] p-10 text-white shadow-xl shadow-brand-orange/20 relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                      <h3 className="text-2xl font-black leading-tight">Booster votre visibilité ?</h3>
                      <p className="text-white/80 font-medium">Uploadez vos photos de chantiers pour attirer plus de clients.</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-3 bg-white text-brand-orange px-6 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-lg"
                      >
                          <Plus size={20} /> Nouveau Projet
                      </button>
                    </div>
                    <Briefcase size={120} className="absolute -bottom-10 -right-10 text-white/10" />
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black text-brand-dark mb-6 tracking-tight uppercase">Statut du Compte</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">BTP 360 Certified</span>
                          <CheckCircle2 className="text-green-500" size={20} />
                      </div>
                      <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Documents validés</span>
                          <CheckCircle2 className="text-green-500" size={20} />
                      </div>
                      <div className="pt-4 border-t border-slate-50">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-orange transition-all duration-1000 ease-out" style={{ width: `${profileCompleteness}%` }}></div>
                          </div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 text-center">Profil complété à {profileCompleteness}%</p>
                      </div>
                    </div>
                </div>
              </div>
            )}
            </div>
          </>
        )}
        </div>
      </main>

      {/* Add Project Modal */}
      <AddProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProjectAdded={fetchData} 
      />

      {/* Lead Details Modal */}
      <LeadDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        lead={selectedLead} 
        onStatusUpdate={fetchData}
      />

      {/* Confirm Deletion Modal */}
      <ConfirmModal 
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProject}
        isLoading={isDeletingProject}
        title="Supprimer la Réalisation"
        message={`Êtes-vous sûr de vouloir supprimer "${projectToDelete?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
      />
    </div>
  );
};

export default PartnerDashboard;
