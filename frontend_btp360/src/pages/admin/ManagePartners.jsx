import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  Trash2
} from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

const ManagePartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchPartners = async () => {
    try {
      const response = await api.get('/partners');
      setPartners(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleToggleVerify = async (partner) => {
    try {
      setIsActionLoading(true);
      const newStatus = !partner.is_verified;
      await api.post(`/partners/${partner.id}/verify`, { is_verified: newStatus });
      
      // Update local state for immediate UI feedback
      setPartners(prev => prev.map(p => 
        p.id === partner.id ? { ...p, is_verified: newStatus } : p
      ));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du statut");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;
    setIsActionLoading(true);
    try {
      await api.delete(`/admin/partners/${partnerToDelete.id}`);
      setPartners(prev => prev.filter(p => p.id !== partnerToDelete.id));
      setPartnerToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Impossible de supprimer ce partenaire');
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.company_name && p.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Gestion des Partenaires</h1>
              <p className="text-slate-400 font-medium text-sm mt-1">Valider et modérer les professionnels du réseau.</p>
           </div>
           
           <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                  type="text" 
                  placeholder="Rechercher un partenaire..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-orange transition-colors">
                 <Filter size={20} />
              </button>
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50 border-b border-slate-50">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Partenaire</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact & Ville</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       <tr>
                          <td colSpan="4" className="py-20 text-center">
                             <Loader2 className="animate-spin mx-auto text-brand-orange mb-3" size={32} />
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chargement de la base...</p>
                          </td>
                       </tr>
                    ) : filteredPartners.map((p) => (
                       <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black relative overflow-hidden">
                                   {p.avatar_url ? (
                                      <img src={p.avatar_url} className="w-full h-full object-cover" />
                                   ) : p.name.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-black text-brand-dark">{p.name}</p>
                                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{p.category_name}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-sm font-bold text-slate-600 mb-1">{p.email}</p>
                             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span className={p.city ? 'text-slate-500' : 'text-slate-300'}>{p.city || 'Non spécifié'}</span>
                                <span>•</span>
                                <span className="text-slate-300">{p.phone || 'Pas de numéro'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             {p.is_verified ? (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 w-fit">
                                   <ShieldCheck size={14} /> Vérifié
                                </div>
                             ) : (
                                <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 w-fit">
                                   <ShieldAlert size={14} /> En attente
                                </div>
                             )}
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button 
                                 onClick={() => handleToggleVerify(p)}
                                 disabled={isActionLoading}
                                 title={p.is_verified ? "Revoquer la certification" : "Certifier le partenaire"}
                                 className={`p-3 rounded-xl transition-all border-2 ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''} ${p.is_verified ? 'text-green-500 border-green-50 bg-green-50/50 hover:bg-green-50' : 'text-slate-300 border-slate-50 bg-slate-50/50 hover:border-brand-orange hover:text-brand-orange'}`}
                                >
                                   {isActionLoading ? <Loader2 className="animate-spin" size={18} /> : (p.is_verified ? <XCircle size={18} /> : <CheckCircle2 size={18} />)}
                                </button>
                                <button 
                                 onClick={() => setPartnerToDelete(p)}
                                 className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 border-2 border-transparent rounded-xl transition-all"
                                >
                                   <Trash2 size={18} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Info Box */}
        <div className="flex items-center gap-6 p-8 bg-brand-dark rounded-[2.5rem] text-white">
           <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-brand-orange">
              <ShieldCheck size={28} />
           </div>
           <div>
              <h4 className="font-black uppercase tracking-widest text-sm">Certification BTP 360</h4>
              <p className="text-slate-400 text-xs font-medium mt-1">Les partenaires vérifiés apparaissent avec un badge de confiance et remontent en priorité dans l'annuaire.</p>
           </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!partnerToDelete}
        onClose={() => setPartnerToDelete(null)}
        onConfirm={handleDeletePartner}
        isLoading={isActionLoading}
        title="Supprimer le Partenaire"
        message={`Êtes-vous sûr de vouloir supprimer définitivement ${partnerToDelete?.name} ? Les projets liés seront également supprimés.`}
        confirmText="Supprimer"
      />
    </AdminLayout>
  );
};

export default ManagePartners;
