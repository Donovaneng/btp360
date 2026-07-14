import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';

import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

const Projets = () => {
  useSEO('Réalisations', 'Découvrez les projets réalisés par nos partenaires certifiés sur BTP 360.');
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, catRes] = await Promise.all([
          api.get('/projects'),
          api.get('/categories')
        ]);
        setProjects(projRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category_id == selectedCategory);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 tracking-tight uppercase leading-none">Réalisations <span className="text-brand-orange">Pro</span></h1>
            <p className="text-lg text-slate-500 font-medium tracking-tight">Le savoir-faire de nos membres certifiés en images.</p>
          </div>
          
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-3">
             <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === 'all' ? 'bg-brand-orange text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
             >
                Tout
             </button>
             {categories.map(cat => (
               <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategory == cat.id ? 'bg-brand-orange text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
               >
                  {cat.name}
               </button>
             ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} type="project" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProjects.length > 0 ? filteredProjects.map((project) => (
              <Link 
                key={project.id} 
                to={`/projet/${project.id}`}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group flex flex-col animate-fade-in"
              >
                {/* Image Area */}
                <div className="h-72 bg-slate-100 relative overflow-hidden">
                   {project.image_url ? (
                      <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Camera size={48} />
                      </div>
                   )}
                   <div className="absolute inset-0 bg-brand-dark/5 group-hover:bg-transparent transition-colors"></div>
                   <div className="absolute bottom-6 left-6">
                      <span className="px-4 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-brand-dark text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/50">
                         {project.company_name || 'Expert BTP 360'}
                      </span>
                   </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                   <div className="mb-2">
                      <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">{project.category_name}</span>
                   </div>
                   <h3 className="text-2xl font-black text-brand-dark mb-4 group-hover:text-brand-orange transition-colors tracking-tight leading-tight">
                      {project.title}
                   </h3>
                   <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">
                      {project.description}
                   </p>
                   <div className="flex items-center justify-between py-6 border-t border-slate-50 mt-auto">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                         <Calendar size={14} className="text-brand-orange" />
                         {new Date(project.completion_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-brand-orange font-black text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                         Détails <ArrowRight size={14} />
                      </div>
                   </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-fade-in">
                 <Camera size={48} className="mx-auto text-slate-100 mb-6" />
                 <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucun projet trouvé dans cette catégorie.</p>
                 <button 
                  onClick={() => setSelectedCategory('all')}
                  className="mt-6 text-brand-orange font-black uppercase text-xs tracking-widest hover:underline"
                 >
                   Voir tous les projets
                 </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projets;
