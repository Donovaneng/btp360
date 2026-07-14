import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Grid, 
  Loader2,
  AlertCircle,
  X,
  Save,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', icon_name: 'Building' });
  const [saving, setSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openEditor = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', icon_name: cat.icon_name || 'Building' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', icon_name: 'Building' });
    }
    setIsEditorOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'name' && !editingCategory) {
      setFormData(prev => ({ ...prev, slug: value.toLowerCase().trim().replace(/[^A-Za-z0-9-]+/g, '-') }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await api.post(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setIsEditorOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer la catégorie (elle est probablement liée à des partenaires)");
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
              <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Secteurs & Métiers</h1>
              <p className="text-slate-400 font-medium text-sm mt-1">Gérez les domaines d'intervention du réseau.</p>
           </div>
           
           <button 
            onClick={() => openEditor()}
            className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-brand-orange/20 transition-all"
           >
              <Plus size={20} /> Nouvelle Catégorie
           </button>
        </div>

        <div className="relative max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
            type="text" 
            placeholder="Chercher un métier..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 key="cats-loader" className="animate-spin text-brand-orange mb-4" size={48} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Chargement des secteurs...</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((cat) => (
                 <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="relative z-10">
                       <div className="w-14 h-14 bg-slate-50 text-slate-400 group-hover:text-brand-orange group-hover:bg-brand-orange/10 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500">
                          <Grid size={28} />
                       </div>
                       <h3 className="text-xl font-black text-brand-dark mb-2"><span>{cat.name}</span></h3>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-6"><span>{cat.slug}</span></p>
                       
                       <div className="flex items-center gap-2 pt-6 border-t border-slate-50">
                          <button 
                            onClick={() => openEditor(cat)}
                            className="flex-1 py-3 bg-slate-50 hover:bg-brand-orange/10 text-slate-400 hover:text-brand-orange rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                             Modifier
                          </button>
                          <button 
                            onClick={() => setCategoryToDelete(cat)}
                            className="px-4 py-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                    {/* Background number */}
                    <span className="absolute -bottom-4 -right-2 text-8xl font-black text-slate-50/50 -z-0 group-hover:text-brand-orange/5 transition-colors">
                       {cat.id}
                    </span>
                 </div>
              ))}
           </div>
        )}

        {filteredCategories.length === 0 && !loading && (
           <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <AlertCircle className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucune catégorie trouvée</p>
           </div>
        )}
      </div>

      {/* Editor Modal */}
      {isEditorOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-scale-in">
               <button onClick={() => setIsEditorOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
               
               <form onSubmit={handleSubmit} className="p-10 space-y-8">
                  <div>
                     <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">{editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}</h2>
                     <p className="text-slate-400 text-sm font-medium mt-1">Configurez les détails du secteur d'activité.</p>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom du métier</label>
                        <input 
                          required
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold"
                          placeholder="Ex: Électricité"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slug (URL)</label>
                        <input 
                          required
                          type="text" 
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-mono text-xs text-slate-500"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optionnel)</label>
                        <textarea 
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all text-sm"
                        ></textarea>
                     </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button 
                      type="submit" 
                      disabled={saving}
                      className="flex-1 py-4 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-brand-orange/20"
                     >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Enregistrer
                     </button>
                     <button 
                      type="button" 
                      onClick={() => setIsEditorOpen(false)}
                      className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs"
                     >
                        Annuler
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      <ConfirmModal 
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer la Catégorie"
        message={`Voulez-vous vraiment supprimer "${categoryToDelete?.name}" ? Cette action peut échouer si des partenaires y sont liés.`}
        confirmText="Supprimer"
      />
    </AdminLayout>
  );
};

export default ManageCategories;
