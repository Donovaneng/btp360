import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  ArrowRight,
  CircleDot,
  Loader2
} from 'lucide-react';
import api from '../services/api';

const LeadDetailsModal = ({ isOpen, onClose, lead, onStatusUpdate }) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  if (!isOpen || !lead) return null;

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === lead.status) return;
    
    setIsUpdatingStatus(true);
    try {
      await api.put(`/leads/${lead.id}/status`, { status: newStatus });
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      alert("Erreur lors de la mise à jour du statut");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-scale-in">
        {/* Header/Banner */}
        <div className="bg-brand-orange h-32 relative">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md"
           >
             <X size={20} />
           </button>
           <div className="absolute -bottom-10 left-10">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center font-black text-3xl text-brand-orange border-4 border-slate-50">
                {lead.client_name?.charAt(0)}
              </div>
           </div>
        </div>

        <div className="p-10 pt-16">
          {/* Main Info */}
          <div className="mb-10">
            <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-2">{lead.client_name}</h3>
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
               <Calendar size={12} className="text-brand-orange" /> Reçu le {formatDate(lead.created_at)}
            </div>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 transition-all hover:border-brand-orange/30 group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-orange shadow-sm group-hover:scale-110 transition-transform">
                   <Phone size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone</div>
                  <a href={`tel:${lead.client_phone}`} className="text-sm font-bold text-brand-dark hover:text-brand-orange transition-colors">
                    {lead.client_phone || 'Non renseigné'}
                  </a>
                </div>
             </div>
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 transition-all hover:border-brand-orange/30 group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-orange shadow-sm group-hover:scale-110 transition-transform">
                   <Mail size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</div>
                  <a href={`mailto:${lead.client_email}`} className="text-sm font-bold text-brand-dark hover:text-brand-orange transition-colors truncate">
                    {lead.client_email}
                  </a>
                </div>
             </div>
          </div>

          {/* Message Content */}
          <div className="space-y-4 mb-10">
             <div className="flex items-center gap-2 text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] ml-2">
                <MessageSquare size={14} /> Contenu de la demande
             </div>
             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 italic text-slate-600 font-medium leading-relaxed">
                "{lead.message}"
             </div>
          </div>

          {/* Actions & Status Management */}
          <div className="space-y-6">
             <div className="flex flex-col gap-3">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Gérer le statut</div>
                <div className="grid grid-cols-2 gap-2">
                   {[
                     { id: 'pending', label: 'En attente', color: 'bg-slate-100 text-slate-600' },
                     { id: 'contacted', label: 'Contacté', color: 'bg-blue-100 text-blue-600' },
                     { id: 'completed', label: 'Conclu', color: 'bg-green-100 text-green-600' },
                     { id: 'cancelled', label: 'Annulé', color: 'bg-red-100 text-red-600' }
                   ].map((status) => (
                     <button
                       key={status.id}
                       onClick={() => handleUpdateStatus(status.id)}
                       disabled={isUpdatingStatus}
                       className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 
                        ${lead.status === status.id ? 'border-brand-orange shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'} 
                        ${status.color} flex items-center justify-center gap-2`}
                     >
                       {isUpdatingStatus && lead.status === status.id ? <Loader2 size={12} className="animate-spin" /> : status.label}
                       {lead.status === status.id && <CircleDot size={12} />}
                     </button>
                   ))}
                </div>
             </div>

             <div className="flex gap-4 pt-4 border-t border-slate-50">
                <a 
                  href={`tel:${lead.client_phone}`}
                  className="flex-1 bg-brand-dark text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-brand-dark/10"
                >
                  Appeler <Phone size={16} />
                </a>
                <button 
                  onClick={onClose}
                  className="px-8 bg-slate-50 text-slate-400 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Fermer
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
