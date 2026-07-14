import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

const NotFound = () => {
  useSEO('Page non trouvée', 'La page que vous recherchez n\'existe pas sur BTP 360.');
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/20 rounded-full animate-ping duration-[10s]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full animate-ping duration-[15s]"></div>
      </div>

      <div className="max-w-xl w-full text-center relative z-10">
        <div className="mb-12 relative inline-block">
          <h1 className="text-[12rem] font-black text-white leading-none opacity-5 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-32 h-32 bg-brand-orange rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-orange/40 rotate-12 animate-bounce">
                <Search size={64} />
             </div>
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">Oups ! Chantier <span className="text-brand-orange">Introuvable</span></h2>
        <p className="text-slate-400 text-lg mb-12 leading-relaxed">
          Il semblerait que vous ayez quitté les plans. La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="px-8 py-4 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all transform hover:scale-105"
          >
             <Home size={18} /> Retour à l'accueil
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all"
          >
             <ArrowLeft size={18} /> Page précédente
          </button>
        </div>
      </div>

      {/* Industrial footer decoration */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-brand-orange flex overflow-hidden">
         {[...Array(20)].map((_, i) => (
           <div key={i} className="w-20 h-full bg-black/20 -skew-x-[45deg] mx-4"></div>
         ))}
      </div>
    </div>
  );
};

export default NotFound;
