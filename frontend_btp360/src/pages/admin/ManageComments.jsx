import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  MessageSquare, 
  Trash2, 
  Star,
  Search,
  ExternalLink,
  Loader2,
  User,
  Check,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

const ManageComments = () => {
  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting]   = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/reviews/${reviewToDelete.id}`);
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
      setReviewToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Impossible de supprimer cet avis');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/reviews/${id}/status`, { status: newStatus });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Erreur changement statut:', err);
      alert('Impossible de modifier le statut de cet avis');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-brand-yellow fill-brand-yellow' : 'text-slate-200 fill-slate-200'}
      />
    ));
  };

  const filtered = reviews.filter(r => {
    const s = searchTerm.toLowerCase();
    return (
      (r.comment || '').toLowerCase().includes(s) ||
      (r.client_name || '').toLowerCase().includes(s) ||
      (r.partner_name || '').toLowerCase().includes(s) ||
      (r.partner_company || '').toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Modération des Avis</h1>
            <p className="text-slate-400 font-medium text-sm mt-1">
              Gérer les avis clients laissés sur les profils partenaires.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm text-center">
                <p className="text-2xl font-black text-brand-dark">{reviews.length}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avis publiés</p>
              </div>
            )}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un avis..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100">
            <Loader2 className="animate-spin text-brand-orange mb-4" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chargement des avis...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <MessageSquare size={48} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
              {searchTerm ? 'Aucun avis trouvé pour cette recherche.' : 'Aucun avis publié sur la plateforme.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filtered.map((review) => (
              <div
                key={review.id}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all group"
              >
                {/* Review Info */}
                <div className="flex-1 space-y-5">
                  {/* Header: client + partenaire */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-orange font-black shrink-0">
                        {review.client_name?.charAt(0) || <User size={16} />}
                      </div>
                      <div>
                        <p className="font-black text-brand-dark uppercase text-[10px] tracking-widest">{review.client_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[9px] text-slate-400 font-bold">{formatDate(review.created_at)}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            review.status === 'approved' ? 'bg-green-50 text-green-600 border border-green-100' :
                            review.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                            'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {review.status === 'approved' ? 'Approuvé' :
                             review.status === 'rejected' ? 'Rejeté' :
                             'En Attente'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>→</span>
                      <Link
                        to={`/partenaire/${review.partner_id}`}
                        target="_blank"
                        className="text-brand-orange hover:underline flex items-center gap-1"
                      >
                        {review.partner_company || review.partner_name} <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Comment */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 font-medium leading-relaxed">
                    "{review.comment}"
                  </div>
                </div>

                {/* Actions */}
                <div className="md:w-44 flex md:flex-col gap-3 justify-center shrink-0">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => handleStatusChange(review.id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-100 hover:text-green-700 transition-colors border border-green-100"
                    >
                      <Check size={14} /> Approuver
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(review.id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 bg-amber-50 text-amber-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-100 hover:text-amber-700 transition-colors border border-amber-100"
                    >
                      <X size={14} /> Rejeter
                    </button>
                  )}
                  <button
                    onClick={() => setReviewToDelete(review)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 hover:text-red-600 transition-colors border border-red-100"
                  >
                    <Trash2 size={16} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!reviewToDelete}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Supprimer l'Avis"
        message={`Êtes-vous sûr de vouloir supprimer l'avis de ${reviewToDelete?.client_name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
      />
    </AdminLayout>
  );
};

export default ManageComments;
