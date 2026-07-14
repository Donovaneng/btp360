import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Camera, 
  Calendar, 
  MapPin, 
  User, 
  ArrowLeft, 
  Share2, 
  MessageCircle,
  Building2,
  CheckCircle2,
  HardHat
} from 'lucide-react';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

const ProjectDetail = () => {
  useSEO('Détail du Projet', 'Explorez les détails de cette réalisation par un expert certifié BTP 360.');
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data);
      } catch (err) {
        console.error('Erreur projet:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleShare = () => {
    const shareData = {
      title: project.title,
      text: `Découvrez ce projet sur BTP 360 : ${project.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <h2 className="text-4xl font-black text-brand-dark mb-4">PROJET INTROUVABLE</h2>
          <p className="text-slate-500 mb-8">Ce projet n'existe pas ou a été retiré du réseau.</p>
          <Link to="/projets" className="bg-brand-orange text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">
            Retour aux réalisations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <Link to="/projets" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-orange font-bold transition-colors mb-10 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Retour aux réalisations
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
               <div className="aspect-video relative">
                  {project.image_url ? (
                    <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                       <Camera size={80} />
                    </div>
                  )}
                  <div className="absolute top-8 left-8">
                     <span className="px-6 py-2 bg-brand-orange text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl">
                        Réalisation Certifiée
                     </span>
                  </div>
               </div>
               
               <div className="p-10 md:p-16">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                     <span className="flex items-center gap-2 text-brand-orange bg-brand-orange/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-orange/10">
                        <Building2 size={14} /> {project.company_name || 'BTP 360'}
                     </span>
                     <span className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <Calendar size={14} /> {new Date(project.completion_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                     </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-black text-brand-dark uppercase tracking-tight mb-8 leading-tight">
                    {project.title}
                  </h1>
                  
                  <div className="prose prose-slate max-w-none">
                     <p className="text-xl text-slate-500 leading-relaxed font-light mb-10">
                        {project.description}
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-100">
                     <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-orange shadow-sm">
                           <CheckCircle2 size={24} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</p>
                           <p className="text-sm font-bold text-brand-dark uppercase">Projet Terminé</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-orange shadow-sm">
                           <HardHat size={24} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expertise</p>
                           <p className="text-sm font-bold text-brand-dark uppercase">Génie Civil / BTP</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar / Partner Info */}
          <div className="space-y-8">
             <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-sm font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4">L'Expert du Projet</h3>
                   
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-2xl text-brand-orange border border-white/10 shadow-lg">
                         {project.company_name?.charAt(0) || 'E'}
                      </div>
                      <div>
                         <h4 className="text-lg font-black uppercase tracking-tight leading-tight">{project.company_name || 'Partenaire Pro'}</h4>
                         <p className="text-brand-orange text-[10px] font-black uppercase tracking-widest mt-1">Vérifié par BTP 360</p>
                      </div>
                   </div>

                   <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 italic">
                      "Cet expert a été sélectionné pour sa rigueur et la qualité exceptionnelle de ses livrables sur ce projet."
                   </p>

                   <div className="space-y-4">
                      {project.user_id && (
                        <Link 
                          to={`/partenaire/${project.user_id}`}
                          className="w-full py-4 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-orange/20"
                        >
                           <User size={16} /> Voir son profil complet
                        </Link>
                      )}
                      <Link 
                        to={`/contact?project=${encodeURIComponent(project.title)}`}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
                      >
                         <MessageCircle size={16} /> Demander un devis
                      </Link>
                   </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl"></div>
             </div>

             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Partager cette réalisation</h3>
                <div className="flex gap-4">
                   <button 
                    onClick={handleShare}
                    className="flex-1 p-4 bg-slate-50 hover:bg-brand-orange/10 text-brand-dark hover:text-brand-orange rounded-2xl transition-all flex flex-col items-center gap-2 group relative"
                   >
                      <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase">{shared ? 'Lien copié !' : 'Partager'}</span>
                      {shared && <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center rounded-2xl animate-fade-in"><CheckCircle2 className="text-green-500" size={20} /></div>}
                   </button>
                   <button 
                    onClick={() => window.print()}
                    className="flex-1 p-4 bg-slate-50 hover:bg-slate-100 text-brand-dark rounded-2xl transition-all flex flex-col items-center gap-2 group"
                   >
                      <Camera size={20} className="text-brand-orange group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-black uppercase">Capturer</span>
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
