import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Users, 
  Briefcase, 
  BookOpen, 
  ArrowRight, 
  MapPin, 
  Loader2,
  Building2,
  Calendar
} from 'lucide-react';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

const SearchPage = () => {
  useSEO('Recherche', 'Recherchez des partenaires, projets et services sur BTP 360.');
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ partners: [], projects: [], articles: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) return;
      setLoading(true);
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newQuery = e.target.search.value;
    if (newQuery) {
      setSearchParams({ q: newQuery });
    }
  };

  const totalResults = results.partners.length + results.projects.length + results.articles.length;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input 
              name="search"
              defaultValue={query}
              placeholder="Rechercher un expert, un projet ou un article..."
              className="w-full pl-16 pr-6 py-6 rounded-[2.5rem] bg-white border-none shadow-2xl shadow-brand-orange/5 outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all text-lg font-medium"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-orange text-white px-8 py-3.5 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
              Rechercher
            </button>
          </form>
          {query && (
            <p className="text-center mt-6 text-slate-400 font-medium">
              {loading ? 'Recherche en cours...' : `${totalResults} résultats pour "${query}"`}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-12 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Tout', icon: <Search size={16} /> },
            { id: 'partners', label: 'Partenaires', icon: <Users size={16} /> },
            { id: 'projects', label: 'Projets', icon: <Briefcase size={16} /> },
            { id: 'articles', label: 'Académie', icon: <BookOpen size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-brand-dark text-white shadow-xl' 
                  : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
                }`}
            >
              {tab.icon} {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[8px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {tab.id === 'all' ? totalResults : results[tab.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 key="search-loader" className="animate-spin text-brand-orange mb-4" size={48} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Exploration du réseau...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Partners Section */}
            {(activeTab === 'all' || activeTab === 'partners') && results.partners.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
                  <Users className="text-brand-orange" /> Experts Partenaires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.partners.map(partner => (
                    <Link 
                      key={partner.id} 
                      to={`/partenaire/${partner.id}`}
                      className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex items-center gap-6"
                    >
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-brand-orange shadow-inner overflow-hidden">
                        {partner.avatar_url ? (
                          <img src={partner.avatar_url} alt={partner.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{partner?.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest"><span>{partner.category_name}</span></span>
                        <h4 className="text-lg font-black text-brand-dark group-hover:text-brand-orange transition-colors"><span>{partner.company_name || partner.name}</span></h4>
                        <p className="text-slate-400 text-xs font-bold flex items-center gap-1 mt-1 uppercase tracking-tighter">
                          <MapPin size={12} /> <span>{partner.city || 'Cameroun'}</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Section */}
            {(activeTab === 'all' || activeTab === 'projects') && results.projects.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
                  <Briefcase className="text-brand-orange" /> Réalisations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {results.projects.map(project => (
                    <div key={project.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row group">
                      <div className="md:w-48 aspect-video md:aspect-square bg-slate-100 overflow-hidden">
                         {project.image_url ? (
                           <img src={project.image_url} alt={project.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300 font-black">PROJET</div>
                         )}
                      </div>
                      <div className="p-8 flex-1">
                        <h4 className="text-xl font-black text-brand-dark mb-2">{project.title}</h4>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 font-medium">{project.description}</p>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Building2 size={12} className="text-brand-orange" /> {project.partner_company}
                           </span>
                           <Link to={`/partenaire/${project.user_id}`} className="text-brand-orange font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                             Détails <ArrowRight size={14} />
                           </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Articles Section */}
            {(activeTab === 'all' || activeTab === 'articles') && results.articles.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-3">
                  <BookOpen className="text-brand-orange" /> Académie & Conseils
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.articles.map(article => (
                    <Link 
                      key={article.id} 
                      to={`/academie/${article.slug}`}
                      className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                      <div className="aspect-video bg-slate-50 rounded-2xl mb-6 overflow-hidden">
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200"><BookOpen size={40} /></div>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-brand-dark group-hover:text-brand-orange transition-colors line-clamp-2">{article.title}</h4>
                      <p className="text-slate-400 text-xs mt-4 line-clamp-2 font-medium">{article.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {totalResults === 0 && !loading && query && (
              <div className="py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                   <Search size={48} />
                </div>
                <h3 className="text-2xl font-black text-brand-dark mb-2 uppercase tracking-tight">Aucun résultat trouvé</h3>
                <p className="text-slate-400 font-medium max-w-md mx-auto">
                  Nous n'avons pas trouvé de correspondances pour "{query}". Essayez d'élargir vos termes de recherche.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
