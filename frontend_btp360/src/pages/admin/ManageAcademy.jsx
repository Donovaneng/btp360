import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  BookOpen, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

const ManageAcademy = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [articleToDelete, setArticleToDelete] = useState(null);

  const fetchArticles = async () => {
    try {
      const response = await api.get('/articles');
      setArticles(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!articleToDelete) return;
    try {
      await api.delete(`/articles/${articleToDelete.id}`);
      setArticleToDelete(null);
      fetchArticles();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de l'article");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Académie & Contenu</h1>
              <p className="text-slate-400 font-medium text-sm mt-1">Partagez l'expertise BTP avec votre communauté.</p>
           </div>
           
           <Link 
            to="/admin/academy/new"
            className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-brand-orange/20 transition-all hover:scale-105 active:scale-95"
           >
              <Plus size={20} /> Nouvel Article
           </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Chercher un article..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <Loader2 key="loader-academy" className="animate-spin text-brand-orange mb-4" size={48} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Indexation des guides...</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 gap-4">
              {filteredArticles.map((article) => (
                 <div key={article.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 hover:border-brand-orange/40 transition-all group flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-48 aspect-video bg-slate-100 rounded-2xl overflow-hidden relative grayscale group-hover:grayscale-0 transition-all">
                       {article.image_url ? (
                          <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <BookOpen size={40} />
                          </div>
                       )}
                    </div>

                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-lg">{article.category_name}</span>
                          <span className="flex items-center gap-1 text-[10px] font-black text-green-500 uppercase tracking-widest">
                             <CheckCircle2 size={12} /> Publié
                          </span>
                       </div>
                       <h3 className="text-xl font-black text-brand-dark leading-tight">{article.title}</h3>
                       <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                          <span>{new Date(article.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Par Admin BTP 360</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                       <Link 
                        to={`/admin/academy/edit/${article.id}`}
                        className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-400 hover:text-brand-orange rounded-xl transition-all border border-transparent hover:border-brand-orange/20"
                       >
                          <Edit3 size={20} />
                       </Link>
                       <button 
                        onClick={() => setArticleToDelete(article)}
                        className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-100"
                       >
                          <Trash2 size={20} />
                       </button>
                    </div>
                 </div>
              ))}
              
              {filteredArticles.length === 0 && (
                 <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun article trouvé</p>
                 </div>
              )}
           </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!articleToDelete}
        onClose={() => setArticleToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer l'Article"
        message="Êtes-vous sûr de vouloir supprimer cet article de l'Académie ?"
        confirmText="Supprimer"
      />
    </AdminLayout>
  );
};

export default ManageAcademy;
