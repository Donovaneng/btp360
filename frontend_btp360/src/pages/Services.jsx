import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building, Construction, BrickWall, Zap, Droplets, Palette, Trees } from 'lucide-react';

import api from '../services/api';
import SkeletonCard from '../components/SkeletonCard';
import { useSEO } from '../hooks/useSEO';

const Services = () => {
  useSEO('Nos Services', 'Découvrez tous les corps de métiers BTP disponibles sur BTP 360 : architecture, génie civil, maçonnerie, électricité et plus encore.');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapping slugs à des icônes Lucide
  const iconMap = {
    'architecture': <Building size={32} />,
    'genie-civil': <Construction size={32} />,
    'maconnerie': <BrickWall size={32} />,
    'electricite': <Zap size={32} />,
    'plomberie': <Droplets size={32} />,
    'peinture': <Palette size={32} />,
    'jardinage': <Trees size={32} />,
  };

  useEffect(() => {
    api.get('/categories')
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-sm font-black text-brand-orange uppercase tracking-widest mb-4">Nos Domaines d'Expertise</h1>
          <h2 className="text-4xl md:text-6xl font-black text-brand-dark mb-6">Des solutions BTP à <span className="text-brand-orange">360°</span></h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Parcourez nos différents corps de métier. Nous sélectionnons les meilleurs experts pour chacun de vos besoins spécifiques.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} type="partner" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="group relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-orange/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {iconMap[category.slug] || <Building size={32} />}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-brand-dark mb-4 group-hover:text-brand-orange transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="text-slate-500 leading-relaxed mb-8">
                    {category.description || `Retrouvez nos meilleurs partenaires spécialisés en ${category.name.toLowerCase()} pour vos projets de construction.`}
                  </p>
                  
                  <Link 
                    to={`/partenaires?search=${category.name}`}
                    className="flex items-center gap-2 text-brand-orange font-bold hover:gap-4 transition-all"
                  >
                    Voir les experts <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-20 bg-brand-dark rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl"></div>
             <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-8">Vous ne trouvez pas un service particulier ?</h2>
                <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                    Contactez-nous directement pour un accompagnement sur mesure ou pour des métiers très spécifiques.
                </p>
                <Link 
                  to="/contact" 
                  className="inline-block bg-brand-orange hover:bg-brand-orange-dark text-white px-10 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-xl"
                >
                    Demander conseil
                </Link>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
