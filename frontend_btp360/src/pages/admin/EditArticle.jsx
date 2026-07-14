import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Type, 
  Link as LinkIcon, 
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    image_url: '',
    is_published: 1
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    if (isEdit) {
      api.get(`/articles/${id}`)
        .then(res => {
          setFormData({
            title: res.data.title,
            slug: res.data.slug,
            excerpt: res.data.excerpt || '',
            content: res.data.content,
            category_id: res.data.category_id || '',
            image_url: res.data.image_url || '',
            is_published: res.data.is_published
          });
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("Impossible de charger l'article");
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      setSaving(true);
      const response = await api.post('/upload-article-image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image_url: response.data.url }));
    } catch (err) {
      console.error("Erreur upload:", err);
      setError("Échec de l'upload de l'image");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));

    if (name === 'title' && !isEdit) {
       setFormData(prev => ({
         ...prev,
         slug: value.toLowerCase().trim().replace(/[^A-Za-z0-9-]+/g, '-')
       }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        await api.post(`/articles/${id}`, formData);
      } else {
        await api.post('/articles', formData);
      }
      navigate('/admin/academy');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
     <AdminLayout>
        <div className="h-full flex items-center justify-center">
           <Loader2 className="animate-spin text-brand-orange" size={48} />
        </div>
     </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto pb-20">
        <button 
          onClick={() => navigate('/admin/academy')}
          className="flex items-center gap-2 text-slate-400 hover:text-brand-dark font-bold mb-8 transition-colors uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft size={16} /> Retour à la liste
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
           <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">
             {isEdit ? "Modifier l'article" : "Nouvel Article"}
           </h1>
           <div className="flex gap-4">
              <label className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                 <input 
                  type="checkbox" 
                  name="is_published"
                  checked={formData.is_published === 1}
                  onChange={handleChange}
                  className="w-5 h-5 accent-brand-orange"
                 />
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark">Publier immédiatement</span>
              </label>
           </div>
        </div>

        {error && (
           <div className="mb-8 p-4 bg-red-50 text-red-500 border border-red-100 rounded-2xl text-sm font-bold flex items-center gap-3">
              <AlertCircle size={20} /> {error}
           </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre de l'article</label>
                    <div className="relative">
                       <Type className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                       <input 
                        required
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Ex: Comment rénover sa façade..."
                        className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-brand-dark"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contenu (Texte intégral)</label>
                    <textarea 
                      required
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      rows="15"
                      placeholder="Développez votre article ici..."
                      className="w-full p-8 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-medium text-slate-700 leading-relaxed"
                    ></textarea>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6">
                 <h3 className="font-black text-brand-dark uppercase tracking-widest text-xs border-b border-slate-50 pb-4">Résumé & Métas</h3>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Extrait (Excerpt)</label>
                    <textarea 
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Un bref résumé pour l'aperçu..."
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-medium text-slate-600"
                    ></textarea>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slug d'URL</label>
                    <div className="relative">
                       <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       <input 
                        type="text" 
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-mono text-xs text-slate-500"
                       />
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
                    <select 
                      required
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-brand-dark appearance-none"
                    >
                       <option value="">Sélectionnez...</option>
                       {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                       ))}
                    </select>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image de couverture</label>
                    <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative group">
                        {formData.image_url ? (
                           <img src={formData.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                        ) : (
                           <>
                             <ImageIcon className="text-slate-200 mb-2" size={40} />
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Aperçu indisponible</p>
                           </>
                        )}
                        <label className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                           <ImageIcon size={32} className="mb-2" />
                           <span className="text-[10px] font-black uppercase tracking-widest">
                             {formData.image_url ? "Changer l'image" : "Uploader une image"}
                           </span>
                           <input 
                             type="file" 
                             className="hidden" 
                             accept="image/*"
                             onChange={handleImageUpload}
                           />
                        </label>
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium italic text-center">
                        Formats acceptés : JPG, PNG, WEBP (Max 5Mo)
                    </div>
                 </div>

                 <div className="pt-4 space-y-3">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="w-full py-5 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl shadow-brand-orange/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                       {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
                       {isEdit ? "Enregistrer" : "Publier l'article"}
                    </button>
                    <button 
                      type="button"
                      className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all"
                    >
                       <Eye size={20} /> Prévisualiser
                    </button>
                 </div>
              </div>

              <div className="p-8 bg-brand-orange/5 rounded-[2.5rem] border border-brand-orange/10">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-orange text-white rounded-lg">
                       <CheckCircle2 size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">Conseil d'expert</span>
                 </div>
                 <p className="text-xs text-brand-dark/70 font-medium leading-relaxed">
                   Un bon titre d'article doit être clair et prometteur. Évitez les titres trop vagues. "Comment" ou "Pourquoi" fonctionnent très bien !
                 </p>
              </div>
           </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditArticle;
