import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo_btp360.png';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="BTP 360 Logo" className="h-10 w-auto" />
              <span className="text-xl font-black text-white">BTP <span className="text-brand-orange">360</span></span>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Votre réseau de solutions à 360° au Cameroun. Coordination, expertise et professionnalisme pour tous vos chantiers.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/btp360" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-brand-orange transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://twitter.com/btp360" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-brand-orange transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="https://instagram.com/btp360" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-brand-orange transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://linkedin.com/company/btp360" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-brand-orange transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-l-4 border-brand-orange pl-4">Liens Rapides</h3>
            <ul className="space-y-4 text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Nos Services</Link></li>
              <li><Link to="/projets" className="hover:text-white transition-colors">Nos Réalisations</Link></li>
              <li><Link to="/academie" className="hover:text-white transition-colors">Académie BTP 360</Link></li>
              <li><Link to="/partenaires" className="hover:text-white transition-colors">Devenir Partenaire</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-l-4 border-brand-orange pl-4">Nous Contacter</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-slate-400">
                <Mail className="text-brand-orange shrink-0" size={20} />
                <span>contact@btp360.com</span>
              </li>
              <li className="flex items-start space-x-3 text-slate-400">
                <Phone className="text-brand-orange shrink-0" size={20} />
                <span>+237 696 70 06 62</span>
              </li>
              <li className="flex items-start space-x-3 text-slate-400">
                <MapPin className="text-brand-orange shrink-0" size={20} />
                <span>Douala, Cameroun</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-l-4 border-brand-orange pl-4">Newsletter</h3>
            <p className="text-slate-400 mb-4">Restez informé de nos projets et opportunités.</p>
            {subscribed ? (
              <div className="bg-brand-orange/20 text-brand-orange p-4 rounded-md font-bold text-sm animate-fade-in">
                Merci pour votre inscription !
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email" 
                  className="w-full px-4 py-3 bg-slate-800 rounded-md focus:ring-2 focus:ring-brand-orange outline-none border-none text-white text-sm"
                />
                <button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange-dark py-3 rounded-md font-bold transition-colors">
                  S'abonner
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} BTP 360. Tous droits réservés.</p>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
            <Link to="/mentions-legales" className="hover:text-brand-orange transition-colors">Mentions Légales</Link>
            <Link to="/cgu" className="hover:text-brand-orange transition-colors">CGU</Link>
            <Link to="/politique-confidentialite" className="hover:text-brand-orange transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
