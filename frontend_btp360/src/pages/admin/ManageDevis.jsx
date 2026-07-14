import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  FileText, 
  Search, 
  TrendingUp,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const ManageDevis = () => {
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDevis = async () => {
     try {
        const response = await api.get('/admin/devis');
        setDevis(response.data);
     } catch (err) {
        console.error(err);
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
    fetchDevis();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/devis/${id}/status`, { status: newStatus });
      await fetchDevis();
    } catch (err) {
      console.error("Erreur statut:", err);
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-500 bg-green-50 border-green-100';
      case 'rejected': return 'text-red-500 bg-red-50 border-red-100';
      case 'completed': return 'text-blue-500 bg-blue-50 border-blue-100';
      default: return 'text-orange-500 bg-orange-50 border-orange-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'completed': return 'Terminé';
      default: return 'En attente';
    }
  };

  const filteredDevis = devis.filter(d => {
    const clientName = d.client_name || '';
    const partnerName = d.partner_name || d.partner_company || '';
    const service = d.service || '';
    
    const matchesSearch = 
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || d.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = devis.filter(d => d.status === 'pending').length;
  const acceptedCount = devis.filter(d => d.status === 'accepted').length;
  const rejectedCount = devis.filter(d => d.status === 'rejected').length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="animate-slide-in-top">
              <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Gestion des Devis</h1>
              <p className="text-slate-400 font-medium text-sm mt-1">Superviser toutes les demandes de devis du réseau.</p>
           </div>
           <div className="flex gap-4 animate-slide-in-top [animation-delay:100ms]">
              <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                 <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temps réel</span>
              </div>
           </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in [animation-delay:200ms]">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-brand-orange/20 transition-all group shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total</p>
              <div className="flex items-end justify-between">
                 <p className="text-3xl font-black text-brand-dark">{devis.length}</p>
                 <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-all">
                    <TrendingUp size={20} />
                 </div>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-orange-500/20 transition-all group shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">En attente</p>
              <div className="flex items-end justify-between">
                 <p className="text-3xl font-black text-orange-500">{pendingCount}</p>
                 <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
                    <Clock size={20} />
                 </div>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-green-500/20 transition-all group shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Acceptés</p>
              <div className="flex items-end justify-between">
                 <p className="text-3xl font-black text-green-500">{acceptedCount}</p>
                 <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={20} />
                 </div>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-red-500/20 transition-all group shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Refusés</p>
              <div className="flex items-end justify-between">
                 <p className="text-3xl font-black text-red-500">{rejectedCount}</p>
                 <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                    <XCircle size={20} />
                 </div>
              </div>
           </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm animate-fade-in [animation-delay:300ms]">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Chercher par client, partenaire, service..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 outline-none font-medium transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'pending', label: 'En attente' },
                { key: 'accepted', label: 'Acceptés' },
                { key: 'rejected', label: 'Refusés' },
                { key: 'completed', label: 'Terminés' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f.key 
                      ? 'bg-brand-dark text-white shadow-lg' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
           </div>
        </div>

        {/* Devis Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-fade-in [animation-delay:400ms]">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
               <Loader2 className="animate-spin text-brand-orange mb-4" size={40} />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement des devis...</p>
            </div>
          ) : filteredDevis.length === 0 ? (
            <div className="py-24 text-center">
               <FileText className="mx-auto text-slate-100 mb-4" size={56} />
               <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucun devis trouvé</p>
               <p className="text-slate-300 text-xs font-medium mt-2">
                 {searchTerm || filter !== 'all' ? 'Essayez de modifier vos filtres.' : 'Les devis apparaîtront ici.'}
               </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-5">ID</th>
                    <th className="px-8 py-5">Client</th>
                    <th className="px-8 py-5">Partenaire</th>
                    <th className="px-8 py-5">Service</th>
                    <th className="px-8 py-5">Budget</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Statut</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredDevis.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <span className="font-black text-brand-dark text-sm">#{d.id.toString().padStart(4, '0')}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-brand-dark text-sm">{d.client_name}</p>
                          <p className="text-xs text-slate-400">{d.client_email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-brand-dark text-sm">{d.partner_company || d.partner_name || '—'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-medium text-slate-600 text-sm max-w-[200px] truncate">{d.service}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-500 text-sm whitespace-nowrap">{d.budget || '—'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(d.status)}`}>
                          {getStatusLabel(d.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {updatingId === d.id ? (
                          <Loader2 size={18} className="animate-spin text-brand-orange inline" />
                        ) : (
                          <select
                            value={d.status}
                            onChange={(e) => handleStatusUpdate(d.id, e.target.value)}
                            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-brand-orange transition-colors cursor-pointer"
                          >
                            <option value="pending">En attente</option>
                            <option value="accepted">Accepté</option>
                            <option value="rejected">Refusé</option>
                            <option value="completed">Terminé</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageDevis;
