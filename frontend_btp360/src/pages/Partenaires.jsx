import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ShieldCheck, Mail, Phone, ExternalLink, Filter, Heart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkeletonCard from '../components/SkeletonCard';
import ContactPartnerModal from '../components/ContactPartnerModal';
import { useSEO } from '../hooks/useSEO';
import { useFavorites } from '../hooks/useFavorites';
import api from '../services/api';

const Partenaires = () => {
  useSEO('Annuaire des Partenaires', 'Découvrez les meilleurs professionnels certifiés du BTP pour réaliser vos projets de construction et rénovation.');
  
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isFavorite, toggle: toggleFav } = useFavorites();
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    // Lire le terme de recherche depuis l'URL (ex: ?search=Maconnerie)
    const params = new URLSearchParams(window.location.search);
    const query = params.get('search');
    if (query) setSearchTerm(query);

    api.get('/partners')
      .then(res => {
        setTimeout(() => {
          setPartners(res.data);
          setLoading(false);
        }, 800);
      })
      .catch(err => {
        console.error('Error fetching partners:', err);
        setLoading(false);
      });
  }, []);

  const categories = ['all', ...new Set(partners.map(p => p.category_name).filter(Boolean))];

  const filteredPartners = partners.filter(p => {
    const name = p.name || '';
    const company = p.company_name || '';
    const category = p.category_name || '';
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.toLowerCase().includes(search) || 
           company.toLowerCase().includes(search) || 
           category.toLowerCase().includes(search);
    
    const matchesCategory = selectedCategory === 'all' || p.category_name === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleContactClick = (partner) => {
    if (!user) {
      navigate('/login', { state: { message: "Veuillez vous connecter pour contacter un partenaire." } });
      return;
    }
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const handleFavClick = async (e, partner) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { message: "Connectez-vous pour sauvegarder des favoris." } });
      return;
    }
    setTogglingId(partner.id);
    await toggleFav(partner.id);
    setTogglingId(null);
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-brand-dark mb-4 tracking-tight uppercase">Annuaire des Partenaires</h1>
          <p className="text-lg text-slate-500 font-medium tracking-tight">Trouvez les meilleurs experts certifiés pour vos travaux.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-lg mb-12 flex flex-col md:flex-row gap-4 border border-slate-100 relative z-20">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Chercher par nom, métier ou entreprise..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50/50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
         </div>

        {/* Category Filter Chips */}
        {!loading && categories.length > 1 && (
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-brand-dark text-white shadow-lg border-brand-dark'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-brand-orange hover:text-brand-orange'
                }`}
              >
                {cat === 'all' ? 'Tous les métiers' : cat}
              </button>
            ))}
          </div>
        )}


        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPartners.map((partner) => (
              <div 
                key={partner.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 group"
              >
                {/* Profile Cover avec badge d'abonnement */}
                <div className="h-24 relative bg-gradient-brand">
                  {partner.subscription_level === 'exclusif' || parseInt(partner.is_exclusive) > 0 ? (
                    <span className="absolute top-3 right-3 px-3 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
                      ⭐ Exclusif
                    </span>
                  ) : partner.subscription_level === 'premium' ? (
                    <span className="absolute top-3 right-3 px-3 py-1 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      Premium
                    </span>
                  ) : null}
                  {/* Bouton Favori */}
                  <button
                    onClick={(e) => handleFavClick(e, partner)}
                    className={`absolute top-3 left-3 p-2 rounded-xl transition-all backdrop-blur-sm ${
                      isFavorite(partner.id)
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white/80 text-slate-400 hover:bg-red-50 hover:text-red-400'
                    }`}
                    title={isFavorite(partner.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Heart size={15} className={isFavorite(partner.id) ? 'fill-white' : ''} />
                  </button>
                </div>
                
                <div className="px-8 pb-8">
                  {/* Avatar */}
                  <div className="relative -mt-12 mb-6">
                    <div className="w-24 h-24 bg-white p-1 rounded-2xl shadow-lg group-hover:scale-105 transition-transform">
                      <div className="w-full h-full bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                        {partner.avatar_url ? (
                          <img src={partner.avatar_url} alt={partner.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-black text-slate-400">{partner.name.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-brand-orange text-white p-1 rounded-lg shadow-md">
                        <ShieldCheck size={18} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mb-6">
                    <span className="inline-block px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-wider mb-2">
                      {partner.category_name}
                    </span>
                    <h3 className="text-2xl font-bold text-brand-dark mb-1">{partner.name}</h3>
                    {partner.company_name && (
                      <p className="text-sm font-semibold text-slate-400 mb-2">{partner.company_name}</p>
                    )}
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin size={14} className="text-brand-orange" />
                      {partner.city || 'Cameroun'}
                    </div>
                  </div>

                  {/* Stats/Badges */}
                  <div className="flex items-center gap-4 py-4 border-t border-slate-50 mb-6">
                    {partner.avg_rating ? (
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                        <Star size={16} className="text-brand-yellow fill-brand-yellow" />
                        {parseFloat(partner.avg_rating).toFixed(1)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-sm font-bold text-slate-300">
                        <Star size={16} />
                        <span className="text-xs">Nouveau</span>
                      </div>
                    )}
                    <div className="text-xs text-slate-400 font-medium">{partner.projects_count || 0} projets réalisés</div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleContactClick(partner)}
                      className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all text-sm"
                    >
                      <Mail size={16} /> Contact
                    </button>
                    <Link 
                      to={`/partenaire/${partner.id}`}
                      className="flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white py-3 rounded-xl font-bold transition-all shadow-md text-sm cursor-pointer"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredPartners.length === 0 && !loading && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucun partenaire trouvé pour cette recherche.</p>
            {selectedCategory !== 'all' && (
              <button onClick={() => setSelectedCategory('all')} className="mt-4 text-brand-orange font-black text-xs uppercase tracking-widest hover:underline">
                Effacer le filtre
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {selectedPartner && (
        <ContactPartnerModal 
          partner={selectedPartner}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Partenaires;
