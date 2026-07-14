import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  MessageSquare, 
  Search, 
  MapPin, 
  Clock, 
  User, 
  HardHat, 
  ArrowRight,
  TrendingUp,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  Check
} from 'lucide-react';
import api from '../../services/api';
import LeadDetailsModal from '../../components/LeadDetailsModal';

const ManageLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchLeads = async () => {
     try {
        const response = await api.get('/admin/leads');
        setLeads(response.data);
     } catch (err) {
        console.error(err);
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/leads/${id}/status`, { status: newStatus });
      await fetchLeads();
    } catch (err) {
      console.error("Erreur statut:", err);
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-50 border-green-100';
      case 'contacted': return 'text-blue-500 bg-blue-50 border-blue-100';
      case 'cancelled': return 'text-red-500 bg-red-50 border-red-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'contacted': return 'Contacté';
      case 'cancelled': return 'Annulé';
      default: return 'En attente';
    }
  };

  const filteredLeads = leads.filter(l => {
    const clientName = l.client_name || '';
    const partnerName = l.partner_name || '';
    const serviceRequested = l.service_requested || '';
    
    const matchesSearch = 
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceRequested.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || l.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="animate-slide-in-top">
              <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Flux des Demandes</h1>
              <p className="text-slate-400 font-medium text-sm mt-1">Superviser les mises en relation sur le réseau.</p>
           </div>
           <div className="flex gap-4 animate-slide-in-top [animation-delay:100ms]">
              <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                 <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temps réel</span>
              </div>
           </div>
        </div>

        {/* Analytic Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in [animation-delay:200ms]">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-brand-orange/20 transition-all group shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total</p>
              <div className="flex items-end justify-between">
                 <p className="text-3xl font-black text-brand-dark">{leads.length}</p>
                 <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-all">
                    <TrendingUp size={20} />
                 </div>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-blue-500/20 transition-all group shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">En cours</p>
              <div className="flex items-end justify-between">
                 <p className="text-3xl font-black text-blue-500">{leads.filter(l => l.status === 'contacted').length}</p>
                 <div className="w-10 h-10 bg-blue-50 text-blue-400 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Clock size={20} />
                 </div>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-green-500/20 transition-all group shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Succès</p>
              <div className="flex items-end justify-between">
                 <p className="text-3xl font-black text-green-500">{leads.filter(l => l.status === 'completed').length}</p>
                 <div className="w-10 h-10 bg-green-50 text-green-400 rounded-xl flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all">
                    <CheckCircle2 size={20} />
                 </div>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-brand-orange/20 transition-all group shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Taux</p>
              <div className="flex items-end justify-between">
                 <p className="text-3xl font-black text-brand-dark">
                   {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'completed').length / leads.length) * 100) : 0}%
                 </p>
                 <div className="w-10 h-10 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-all">
                    <TrendingUp size={20} />
                 </div>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto w-full md:w-auto">
              {['all', 'pending', 'contacted', 'completed'].map((f) => (
                 <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                       ${filter === f ? 'bg-brand-dark text-white shadow-lg' : 'text-slate-400 hover:text-brand-dark hover:bg-slate-50'}`}
                 >
                    {f === 'all' ? 'Toutes' : getStatusLabel(f)}
                 </button>
              ))}
           </div>

           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                 type="text"
                 placeholder="Chercher une interaction..."
                 className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

         {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
               <Loader2 className="animate-spin mb-4" size={48} />
               <p className="font-black uppercase tracking-widest text-[10px]">Analyse du flux réseau...</p>
            </div>
         ) : filteredLeads.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 animate-fade-in [animation-delay:400ms]">
               {filteredLeads.map((lead, idx) => (
                  <div 
                    key={lead.id} 
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group flex flex-col lg:flex-row items-center gap-10 animate-scale-in"
                    style={{ animationDelay: `${500 + (idx * 50)}ms` }}
                  >
                     <div className="flex items-center gap-10 flex-1 w-full lg:w-auto">
                        {/* Connection Visual */}
                        <div className="flex items-center gap-6 shrink-0 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                           <div className="text-center">
                              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-brand-dark text-lg mb-2 shadow-sm">
                                 <span>{lead.client_name?.charAt(0)}</span>
                              </div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client</p>
                           </div>
                           <div className="flex flex-col items-center gap-2">
                              <div className="w-8 h-1 bg-gradient-to-r from-slate-200 to-brand-orange rounded-full"></div>
                              <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center animate-pulse">
                                 <ArrowRight size={18} />
                              </div>
                              <div className="w-8 h-1 bg-gradient-to-r from-brand-orange to-slate-200 rounded-full"></div>
                           </div>
                           <div className="text-center">
                              <div className="w-14 h-14 bg-brand-dark rounded-2xl flex items-center justify-center font-black text-white text-lg mb-2 shadow-lg shadow-brand-dark/20">
                                 <span>{lead.partner_name?.charAt(0)}</span>
                              </div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expert</p>
                           </div>
                        </div>
 
                        <div className="flex-1 space-y-4">
                           <div className="flex items-center gap-3">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(lead.status)} shadow-sm`}>
                                 {getStatusLabel(lead.status)}
                              </span>
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                 REF #{lead.id}
                              </span>
                           </div>
                           <div>
                              <h3 className="text-xl font-black text-brand-dark leading-tight mb-2 group-hover:text-brand-orange transition-colors">
                                 {lead.service_requested || 'Demande de service BTP'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                 <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                   <User size={14} className="text-brand-orange" /> {lead.client_name}
                                 </span>
                                 <span className="flex items-center gap-2">
                                   <Calendar size={14} /> {new Date(lead.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>
  
                     <div className="w-full lg:w-72 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 overflow-hidden shrink-0 relative group/msg">
                        <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-3 flex items-center gap-2">
                           <MessageSquare size={14} /> Message Client
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed italic font-medium">
                           "{lead.message}"
                        </p>
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-orange rounded-full animate-ping opacity-20"></div>
                     </div>
  
                     <div className="shrink-0 flex lg:flex-col gap-3 w-full lg:w-48">
                        {lead.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(lead.id, 'contacted')}
                            disabled={updatingId === lead.id}
                            className="flex-1 px-6 py-4 bg-brand-dark hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-dark/10"
                          >
                             {updatingId === lead.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Contacté</>}
                          </button>
                        )}
                        {lead.status === 'contacted' && (
                          <button 
                            onClick={() => handleStatusUpdate(lead.id, 'completed')}
                            disabled={updatingId === lead.id}
                            className="flex-1 px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                          >
                             {updatingId === lead.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> Terminer</>}
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedLead(lead); setIsDetailsModalOpen(true); }}
                          className="flex-1 px-6 py-4 bg-white hover:bg-slate-50 text-slate-400 hover:text-brand-dark border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all"
                        >
                           Détails
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-fade-in">
               <AlertCircle className="mx-auto text-slate-100 mb-6" size={64} />
               <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucune interaction détectée sur le réseau</p>
            </div>
         )}
      </div>

      {/* Details Modal */}
      <LeadDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        lead={selectedLead} 
        onStatusUpdate={fetchLeads}
      />
    </AdminLayout>
  );
};

export default ManageLeads;

