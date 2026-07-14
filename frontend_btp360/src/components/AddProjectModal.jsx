import React, { useState } from 'react';
import { X, Plus, Loader2, CheckCircle, Image as ImageIcon, Calendar, FileText } from 'lucide-react';

import api from '../services/api';

const AddProjectModal = ({ isOpen, onClose, onProjectAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completion_date: new Date().toISOString().split('T')[0]
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsLoading(true);
    setError('');

    try {
      let finalImageUrl = '';

      // 1. Upload de l'image si sélectionnée
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('image', selectedFile);

        const uploadRes = await api.post('/upload-project-image', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        finalImageUrl = uploadRes.data.url;
      }

      // 2. Création du projet
      await api.post('/projects', {
        ...formData,
        image_url: finalImageUrl
      });

      setIsSuccess(true);
      if (onProjectAdded) onProjectAdded();

      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          title: '',
          description: '',
          completion_date: new Date().toISOString().split('T')[0]
        });
        setSelectedFile(null);
        setPreviewUrl(null);
      }, 2500);

    } catch (err) {
      setError(err.response?.data?.error || err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-brand-dark z-10"
        >
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="p-16 text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Projet Publié !</h3>
              <p className="text-slate-500 font-medium font-inter">Votre réalisation est maintenant visible par tous les clients de BTP 360.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
            {/* Left Decor */}
            <div className="hidden md:block w-48 bg-gradient-brand p-10 text-white relative">
               <div className="absolute top-10 left-10">
                 <BriefcaseIcon size={40} className="opacity-20 translate-x-4 mb-20" />
                 <TrendingUpIcon size={30} className="opacity-20 -translate-x-2" />
               </div>
               <h2 className="text-xl font-black uppercase tracking-tighter absolute bottom-10 left-10 leading-none">
                 Boostez votre <br /><span className="text-brand-dark">visibilité</span>
               </h2>
            </div>

            <div className="flex-1 p-10 overflow-y-auto">
                <header className="mb-8 mt-2">
                  <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Nouveau Projet</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Partagez vos réussites</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Titre du Projet</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all font-medium text-brand-dark" 
                        placeholder="Ex: Construction Villa Kribi"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Photo de la Réalisation</label>
                      <div className="relative">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          id="file-upload"
                          className="hidden"
                        />
                        <label 
                          htmlFor="file-upload"
                          className="flex items-center gap-3 w-full px-4 py-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 hover:bg-slate-100 cursor-pointer transition-all overflow-hidden"
                        >
                          <ImageIcon className="text-brand-orange shrink-0" size={18} />
                          <span className="text-xs font-bold text-slate-400 truncate">
                            {selectedFile ? selectedFile.name : 'Choisir une image'}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Date de Fin</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="date"
                          name="completion_date" 
                          value={formData.completion_date} 
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all font-medium text-brand-dark" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Area */}
                  {previewUrl && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                       <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                       <button 
                        type="button"
                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors"
                       >
                         <X size={14} />
                       </button>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange}
                      rows="4"
                      className="w-full p-6 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all font-medium text-brand-dark" 
                      placeholder="Décrivez les travaux réalisés..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-dark hover:bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Publier la Réalisation <Plus size={20} /></>}
                  </button>
                </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal icons fixes
const BriefcaseIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const TrendingUpIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default AddProjectModal;
