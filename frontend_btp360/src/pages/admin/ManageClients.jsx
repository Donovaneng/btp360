import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Search, Users, Trash2, Eye, Loader2, Mail, Phone, Calendar, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

const ManageClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const fetchClients = async () => {
    try {
      const response = await api.get('/admin/clients');
      setClients(response.data);
    } catch (err) {
      console.error(err);
      // Fallback to mock data if endpoint doesn't exist
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/clients/${clientToDelete.id}`);
      await fetchClients();
      setClientToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Impossible de supprimer ce client');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const name = c.name || '';
    const email = c.email || '';
    const s = searchTerm.toLowerCase();
    return name.toLowerCase().includes(s) || email.toLowerCase().includes(s);
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="animate-slide-in-top">
            <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Gestion des Clients</h1>
            <p className="text-slate-400 font-medium text-sm mt-1">Superviser les comptes clients de la plateforme.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-2xl font-black text-brand-dark">{clients.length}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clients inscrits</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Clients</p>
            <p className="text-3xl font-black text-brand-dark">{clients.length}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Actifs ce mois</p>
            <p className="text-3xl font-black text-blue-500">
              {clients.filter(c => {
                const d = new Date(c.created_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Avec demandes</p>
            <p className="text-3xl font-black text-brand-orange">—</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscription</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-brand-orange mb-3" size={32} />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chargement de la base clients...</p>
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <Users className="mx-auto text-slate-100 mb-4" size={48} />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucun client trouvé</p>
                    </td>
                  </tr>
                ) : filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg overflow-hidden">
                          {client.avatar_url ? (
                            <img src={client.avatar_url} className="w-full h-full object-cover" alt={client.name} />
                          ) : client.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-brand-dark">{client.name}</p>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Client #{client.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                          <Mail size={12} className="text-brand-orange" /> {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                            <Phone size={12} /> {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                        <Calendar size={14} className="text-brand-orange" />
                        {formatDate(client.created_at)}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="p-3 text-slate-300 hover:text-blue-500 hover:bg-blue-50 border-2 border-transparent rounded-xl transition-all"
                          title="Voir le profil"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => setClientToDelete(client)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 border-2 border-transparent rounded-xl transition-all"
                          title="Supprimer"
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
      </div>

      {/* Client Profile Side Panel (simple modal) */}
      {selectedClient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-brand-orange h-28 relative">
              <button
                onClick={() => setSelectedClient(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition-all"
              >
                ✕
              </button>
              <div className="absolute -bottom-10 left-8">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center font-black text-3xl text-brand-orange border-4 border-white">
                  {selectedClient.avatar_url ? (
                    <img src={selectedClient.avatar_url} className="w-full h-full object-cover rounded-xl" alt={selectedClient.name} />
                  ) : selectedClient.name?.charAt(0)}
                </div>
              </div>
            </div>
            <div className="p-8 pt-14 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-brand-dark uppercase">{selectedClient.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Client BTP 360 — #{selectedClient.id}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <Mail size={16} className="text-brand-orange" />
                  <span className="font-bold text-sm text-brand-dark">{selectedClient.email}</span>
                </div>
                {selectedClient.phone && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                    <Phone size={16} className="text-brand-orange" />
                    <span className="font-bold text-sm text-brand-dark">{selectedClient.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <Calendar size={16} className="text-brand-orange" />
                  <span className="font-bold text-sm text-brand-dark">Inscrit le {formatDate(selectedClient.created_at)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer le Client"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${clientToDelete?.name} ? Toutes ses demandes seront également supprimées.`}
        confirmText="Supprimer"
      />
    </AdminLayout>
  );
};

export default ManageClients;
