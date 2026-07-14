import React, { useState, useEffect } from 'react';
import { ArrowRight, Building2, Users, ShieldCheck, HardHat, TrendingUp, Camera, Loader2, BookOpen, Construction, BrickWall, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/p1.jpg.jpeg';
import { useSEO } from '../hooks/useSEO';

import api from '../services/api';

const Home = () => {
  useSEO('Accueil', 'Trouvez les meilleurs experts en bâtiment, architecture et génie civil sur BTP 360.');
  
  const [liveStats, setLiveStats] = useState(null);
  const [latestProjects, setLatestProjects] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [homeCategories, setHomeCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const iconMap = {
    'architecture': <Building2 className="text-brand-orange" size={32} />,
    'genie-civil': <Construction className="text-brand-orange" size={32} />,
    'maconnerie': <BrickWall className="text-brand-orange" size={32} />,
    'electricite': <Zap className="text-brand-orange" size={32} />,
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, projectsRes, articlesRes, categoriesRes] = await Promise.all([
          api.get('/public-stats'),
          api.get('/projects'),
          api.get('/articles'),
          api.get('/categories')
        ]);

        setLiveStats(statsRes.data);
        setLatestProjects(projectsRes.data.slice(0, 3));
        setLatestArticles(articlesRes.data.slice(0, 3));
        setHomeCategories(categoriesRes.data.slice(0, 3));
      } catch (err) {
        console.error('Erreur chargement accueil:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const stats = [
    { label: 'Experts Qualifiés', value: liveStats ? `${liveStats.partners}+` : '...' },
    { label: 'Projets Réalisés', value: liveStats ? `${liveStats.projects}+` : '...' },
    { label: 'Villes Couvertes', value: liveStats ? `${liveStats.cities}+` : '...' },
    { label: 'Ans d\'Expérience', value: '12+' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="BTP Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-slate-900"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>
        
        {/* Animated Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold text-sm mb-6 animate-fade-in">
              LE RÉSEAU N°1 DU BTP AU CAMEROUN
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8">
              Bâtissons votre futur à <span className="text-gradient-brand">360°</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed font-light">
              BTP 360 centralise l'expertise locale pour des solutions de construction innovantes, sécurisées et professionnelles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/services" className="bg-brand-orange hover:bg-brand-orange-dark text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-xl">
                Démarrer mon projet <ArrowRight size={20} />
              </Link>
              <Link to="/register-partner" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center">
                Devenir Partenaire
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 -mt-16 max-w-5xl mx-auto px-4 w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl font-black text-brand-dark mb-1">{stat.value}</div>
              <div className="text-sm font-bold text-brand-orange uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
      {/* Latest Projects Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-sm font-black text-brand-orange uppercase tracking-widest mb-4">Portfolio du réseau</h2>
                <h3 className="text-4xl md:text-5xl font-black text-brand-dark">Dernières Réalisations</h3>
              </div>
              <Link to="/projets" className="group flex items-center gap-3 text-brand-dark font-black uppercase tracking-widest text-sm hover:text-brand-orange transition-colors">
                Voir tous les projets <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all"><ArrowRight size={18} /></div>
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {isLoading ? (
                <div className="col-span-3 py-20 flex flex-col items-center justify-center text-slate-400">
                   <Loader2 className="animate-spin mb-4" size={48} />
                   <p className="font-bold uppercase tracking-widest text-xs">Chargement des inspirations...</p>
                </div>
              ) : latestProjects.length > 0 ? latestProjects.map((project) => (
                <Link 
                  key={project.id} 
                  to={`/projet/${project.id}`}
                  className="group relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                   <div className="aspect-[4/5] relative">
                      {project.image_url ? (
                        <img 
                          src={project.image_url} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                          <Camera size={48} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent p-8 flex flex-col justify-end">
                         <span className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg w-fit">
                            {project.company_name || 'Expert BTP 360'}
                         </span>
                         <h4 className="text-2xl font-black text-white leading-tight mb-2">{project.title}</h4>
                         <div className="h-0 group-hover:h-12 overflow-hidden transition-all duration-500">
                            <div className="text-white/70 text-sm font-bold flex items-center gap-2 hover:text-white">
                               Voir les détails <ArrowRight size={14} />
                            </div>
                         </div>
                      </div>
                   </div>
                </Link>
              )) : (
                <div className="col-span-3 py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-bold italic">Bientôt de nouveaux chefs-d'œuvre à découvrir.</p>
                </div>
              )}
           </div>
        </div>
      </section>

      {/* Academy Preview Section */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
             <div className="text-center md:text-left">
               <h2 className="text-sm font-black text-brand-orange uppercase tracking-widest mb-4">L'Académie BTP 360</h2>
               <h3 className="text-4xl md:text-5xl font-black text-brand-dark">Connaissances & Conseils</h3>
             </div>
             <Link to="/academie" className="bg-brand-dark text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all">
               Explorer l'Académie <ArrowRight size={18} />
             </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestArticles.map((article) => (
                <Link 
                 key={article.id} 
                 to={`/academie/${article.slug}`}
                 className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all p-4 border border-slate-100"
                >
                   <div className="aspect-video bg-slate-100 rounded-2xl mb-6 overflow-hidden relative">
                      {article.image_url ? (
                        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <BookOpen size={40} />
                        </div>
                      )}
                   </div>
                   <div className="px-2 pb-4">
                      <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] mb-2 block">{article.category_name}</span>
                      <h4 className="text-xl font-black text-brand-dark group-hover:text-brand-orange transition-colors line-clamp-2 leading-tight">{article.title}</h4>
                   </div>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-brand-orange uppercase tracking-widest mb-4">Ce que nous faisons</h2>
            <h3 className="text-4xl md:text-5xl font-black text-brand-dark mb-6">Expertise Complète en BTP</h3>
            <p className="text-lg text-slate-500 max-w-3xl mx-auto">
              Nous couvrons tous les aspects de votre projet, de la conception architecturale à la remise des clés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {homeCategories.map((category, idx) => (
              <div key={idx} className="glass-card p-10 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center mb-8">
                  {iconMap[category.slug] || <Building2 className="text-brand-orange" size={32} />}
                </div>
                <h4 className="text-2xl font-bold text-brand-dark mb-4">{category.name}</h4>
                <p className="text-slate-500 leading-relaxed mb-6">
                  {category.description || `Trouvez les meilleurs experts en ${category.name.toLowerCase()} pour vos projets.`}
                </p>
                <Link to={`/partenaires?search=${category.name}`} className="text-brand-orange font-bold flex items-center gap-2 hover:gap-4 transition-all">
                  En savoir plus <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl font-black mb-8 leading-tight">Pourquoi choisir <span className="text-brand-orange">BTP 360</span> ?</h2>
            <div className="space-y-6">
              {[
                { title: 'Transparence Totale', icon: <ShieldCheck className="text-brand-orange" /> },
                { title: 'Qualité Certifiée', icon: <ShieldCheck className="text-brand-orange" /> },
                { title: 'Respect des Délais', icon: <TrendingUp className="text-brand-orange" /> },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="shrink-0">{item.icon}</div>
                  <span className="text-xl font-semibold">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full h-[500px] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative group">
             <img 
               src="/btp_industrial_trust_1776989909658.png" 
               alt="Infrastructure Industrielle BTP 360" 
               className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
