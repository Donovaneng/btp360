import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  LayoutGrid, 
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  Loader2,
  Star,
  Heart,
  FileText
} from 'lucide-react';
import ContactPartnerModal from '../components/ContactPartnerModal';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import { useFavorites } from '../hooks/useFavorites';
import api from '../services/api';

const ReviewsList = ({ partnerId, refreshKey }) => {
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/reviews/${partnerId}`)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [partnerId, refreshKey]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-orange" size={32} /></div>;

  return (
    <div className="space-y-6">
      {data.count > 0 && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-2xl">
          <span className="text-4xl font-black text-brand-dark">{data.average}</span>
          <div>
            <div className="flex gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(data.average) ? "text-brand-orange fill-brand-orange" : "text-slate-200"} />
              ))}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.count} avis client{data.count > 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {data.reviews.length === 0 ? (
        <p className="text-slate-400 font-medium italic py-8 text-center">Aucun avis pour le moment. Soyez le premier !</p>
      ) : data.reviews.map(review => (
        <div key={review.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange font-black text-sm">
                {review.client_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-brand-dark uppercase text-xs tracking-widest">{review.client_name}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">Client Vérifié</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={i < review.rating ? "text-brand-orange fill-brand-orange" : "text-slate-200"} />
              ))}
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium leading-relaxed italic">"{review.comment}"</p>
          <div className="mt-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">
            {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      ))}
    </div>
  );
};

const ReviewForm = ({ partnerId, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="text-center p-4">
        <p className="text-slate-400 text-sm font-medium mb-4">Connectez-vous pour laisser un avis.</p>
        <a href="/login" className="text-brand-orange font-black uppercase text-xs tracking-widest hover:underline">Se connecter</a>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/reviews', { partner_id: parseInt(partnerId), rating, comment });
      setSuccess(true);
      setComment('');
      setRating(5);
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la publication');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 space-y-4 animate-fade-in">
        <CheckCircle2 size={48} className="text-green-500 mx-auto" />
        <p className="font-black text-brand-dark uppercase tracking-widest text-sm">Avis publié !</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Votre Note</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-125"
            >
              <Star size={28} className={(hoveredRating || rating) >= star ? "text-brand-orange fill-brand-orange" : "text-slate-200"} />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Votre Témoignage</label>
        <textarea required value={comment} onChange={(e) => setComment(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all text-sm font-medium"
          rows="3" placeholder="Comment s'est passée votre expérience ?"
        ></textarea>
      </div>
      <button type="submit" disabled={isLoading}
        className="w-full py-4 bg-brand-dark text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Publier mon avis'}
      </button>
    </form>
  );
};

const PartnerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const { isFavorite, toggle: toggleFav } = useFavorites();
  const [favLoading, setFavLoading] = useState(false);

  useSEO(
    partner ? `${partner.company_name || partner.name} - ${partner.category_name || 'Expert'}` : 'Profil Partenaire',
    partner ? `Découvrez le profil, les réalisations et les avis clients de ${partner.company_name || partner.name} sur BTP 360.` : ''
  );

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      try {
        const response = await api.get(`/partners/${id}`);
        setPartner(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-brand-orange" size={48} />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
        <h2 className="text-3xl font-black text-brand-dark mb-4">Profil Introuvable</h2>
        <p className="text-slate-500 mb-8 max-w-md">Nous sommes désolés, mais ce professionnel n'existe plus ou l'URL est incorrecte.</p>
        <Link to="/partenaires" className="bg-brand-dark text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2">
          <ArrowLeft size={20} /> Retour à l'annuaire
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/partenaires" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-orange font-bold transition-all mb-10 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Retour à l'annuaire
        </Link>

        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden mb-12">
          <div className="h-64 bg-gradient-brand relative">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          <div className="px-10 pb-10 relative">
             <div className="absolute -top-20 left-10">
                <div className="w-40 h-40 bg-white rounded-[2rem] shadow-2xl p-4 border border-slate-100 flex items-center justify-center font-black text-4xl text-brand-orange">
                  {partner.avatar_url ? (
                    <img src={partner.avatar_url} alt={partner.company_name} className="w-full h-full object-contain" />
                  ) : (
                    <span>{partner.company_name?.charAt(0) || partner.name?.charAt(0)}</span>
                  )}
                </div>
             </div>

             <div className="pt-24 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-black text-brand-dark tracking-tight uppercase">
                        <span>{partner.company_name || partner.name}</span>
                      </h1>
                      <div className="bg-green-100 text-green-700 p-1 rounded-full px-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                         <ShieldCheck size={14} /> Certifié BTP 360
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-6 text-slate-500 font-bold uppercase tracking-widest text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-brand-orange" /> {partner.city || 'Cameroun'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-brand-orange" /> {partner.category_name}
                      </div>
                   </div>
                </div>

                 <div className="flex gap-4 w-full lg:w-auto flex-wrap">
                    <button 
                     onClick={() => setIsContactModalOpen(true)}
                     className="flex-1 lg:flex-none bg-brand-orange text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
                    >
                      Contacter <MessageSquare size={18} />
                    </button>
                    <button
                     onClick={() => navigate('/devis', { state: { partnerId: partner.id, service: partner.category_name } })}
                     className="flex-1 lg:flex-none bg-brand-dark text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-dark/20 hover:scale-105 transition-all flex items-center justify-center gap-3"
                    >
                      Devis <FileText size={18} />
                    </button>
                    <button
                     onClick={async () => { setFavLoading(true); await toggleFav(id); setFavLoading(false); }}
                     disabled={favLoading}
                     title={isFavorite(id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                     className={`p-5 rounded-2xl border-2 font-black transition-all hover:scale-105 ${isFavorite(id) ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-100 text-slate-300 hover:border-red-200 hover:text-red-400'}`}
                    >
                      {favLoading
                        ? <Loader2 size={20} className="animate-spin" />
                        : <Heart size={20} className={isFavorite(id) ? 'fill-red-500' : ''} />}
                    </button>
                 </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-16">

             {/* Bio Section */}
             {partner.bio && (
               <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                 <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">À propos</h2>
                 <p className="text-slate-600 font-medium leading-relaxed text-lg border-l-4 border-brand-orange pl-6">
                   {partner.bio}
                 </p>
               </div>
             )}

             <div className="space-y-8">
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-4">
                  <LayoutGrid className="text-brand-orange" /> Portfolio de Réalisations
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {partner.projects && partner.projects.length > 0 ? partner.projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                       <div className="aspect-video bg-slate-100 relative overflow-hidden">
                          {project.image_url ? (
                            <img src={project.image_url} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-black">IMAGE PROJET</div>
                          )}
                          <div className="absolute top-4 left-4">
                             <span className="px-3 py-1 bg-brand-dark/80 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                                PROJET TERMINÉ
                             </span>
                          </div>
                       </div>
                       <div className="p-6">
                          <h4 className="text-lg font-black text-brand-dark mb-2 group-hover:text-brand-orange transition-colors">{project.title}</h4>
                          <p className="text-slate-500 text-sm line-clamp-2 mb-4 font-medium">{project.description}</p>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                             <Calendar size={14} className="text-brand-orange" />
                             {new Date(project.completion_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                          </div>
                       </div>
                    </div>
                  )) : (
                    <div className="col-span-2 py-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-3xl">
                       <div className="text-slate-200 mb-4 flex justify-center"><Briefcase size={64} /></div>
                       <p className="text-slate-400 font-bold">Ce professionnel n'a pas encore publié de projets.</p>
                    </div>
                  )}
                </div>
             </div>

             <div className="space-y-8 pt-12 border-t border-slate-200">
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight flex items-center gap-4">
                  <Star className="text-brand-orange fill-brand-orange" /> Avis & Témoignages
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <ReviewsList partnerId={id} refreshKey={reviewRefreshKey} />
                   <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-24 h-fit">
                      <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight mb-6">Laisser un avis</h3>
                      <ReviewForm partnerId={id} onReviewAdded={() => setReviewRefreshKey(k => k + 1)} />
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-10">
             <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">Coordonnées</h3>
                <div className="space-y-6">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-orange shadow-sm border border-slate-50">
                        <Phone size={20} />
                      </div>
                      <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Téléphone</div>
                         <div className="font-bold text-brand-dark">{partner.phone || 'Non renseigné'}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-orange shadow-sm border border-slate-50">
                        <Mail size={20} />
                      </div>
                      <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">E-mail</div>
                         <div className="font-bold text-brand-dark">{partner.email}</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-orange shadow-sm border border-slate-50">
                        <MapPin size={20} />
                      </div>
                      <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localisation</div>
                         <div className="font-bold text-brand-dark">{partner.city || 'Cameroun'}</div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white space-y-6 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                   <h3 className="text-xl font-black uppercase tracking-tight mb-4">Pourquoi ce partenaire ?</h3>
                   <ul className="space-y-4">
                      {['Vérification des assurances', 'Certifications validées par BTP 360', 'Respect des délais contractuels', 'Expertise technique confirmée'].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm font-medium text-white/80">
                           <CheckCircle2 size={18} className="text-brand-orange mt-0.5" />
                           {item}
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="absolute -bottom-10 -right-10 opacity-10">
                   <Building2 size={160} />
                </div>
             </div>
          </div>
        </div>
      </div>

      <ContactPartnerModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        partner={partner} 
      />
    </div>
  );
};

export default PartnerProfile;
