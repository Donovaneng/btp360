import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, User, ArrowRight, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

const Academy = () => {
  useSEO('Académie BTP', 'Articles, guides et conseils pour vos projets de construction et rénovation au Cameroun.');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get('/articles');
        setArticles(response.data);
      } catch (error) {
        console.error('Erreur chargement académie:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(a => {
    const title = a.title || '';
    const category = a.category_name || '';
    const search = searchTerm.toLowerCase();

    return title.toLowerCase().includes(search) || 
           category.toLowerCase().includes(search);
  });

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-black text-brand-orange uppercase tracking-[0.3em] mb-4">L'Académie BTP 360</h2>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark mb-6 tracking-tight">Apprendre, Construire, Réussir</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Tout le savoir-faire du BTP au Cameroun réuni dans un espace dédié.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          <input 
            type="text" 
            placeholder="Rechercher un guide, un conseil..."
            className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white shadow-xl border-none outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all font-bold text-brand-dark"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 key="academy-loader" className="animate-spin text-brand-orange mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Chargement de la bibliothèque...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredArticles.map((article) => (
              <Link 
                key={article.id} 
                to={`/academie/${article.slug}`}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col"
              >
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {article.image_url ? (
                    <img src={article.image_url} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <BookOpen size={48} className="text-slate-300 group-hover:text-brand-orange transition-colors" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                      <span>{article.category_name}</span>
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-brand-dark mb-4 leading-tight group-hover:text-brand-orange transition-colors line-clamp-2">
                    <span>{article.title}</span>
                  </h3>
                  <p className="text-slate-500 text-sm mb-8 line-clamp-3 font-medium leading-relaxed">
                    {article.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar size={14} className="text-brand-orange" />
                      {new Date(article.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                    <span className="text-brand-orange font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      Lire <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredArticles.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold">Aucun article ne correspond à votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Academy;
