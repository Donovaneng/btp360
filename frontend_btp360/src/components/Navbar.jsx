import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo_btp360.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const dashboardLink = user?.role_id == 1 ? '/admin' : (user?.role_id == 2 ? '/dashboard-client' : '/dashboard-partner');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Réalisations', path: '/projets' },
    { name: 'Partenaires', path: '/partenaires' },
    { name: 'Académie', path: '/academie' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' 
          : 'bg-black/10 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="BTP 360 Logo" className="h-12 w-auto" />
            <span className={`text-2xl font-black tracking-tight ${scrolled ? 'text-brand-dark' : 'text-white'}`}>
              BTP <span className="text-brand-orange">360</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition-colors duration-200 hover:text-brand-orange whitespace-nowrap ${
                  location.pathname === link.path 
                    ? 'text-brand-orange' 
                    : (scrolled ? 'text-brand-dark' : 'text-white')
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <Link to="/search" className={`p-2 rounded-full transition-colors shrink-0 ${scrolled ? 'text-brand-dark hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}>
              <Search size={20} />
            </Link>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/profil"
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all hover:scale-105 whitespace-nowrap ${
                  scrolled 
                    ? 'text-brand-dark bg-slate-50 border-slate-100' 
                    : 'text-white bg-white/10 border-white/10 hover:bg-white/20'
                }`}>
                  <User size={14} className="text-brand-orange" /> Profil
                </Link>
                <Link 
                  to={dashboardLink}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all hover:scale-105 whitespace-nowrap ${
                  scrolled 
                    ? 'text-white bg-brand-dark border-brand-dark' 
                    : 'text-brand-dark bg-white border-white'
                }`}>
                  <LayoutDashboard size={14} className="text-brand-orange" /> Espace
                </Link>
                <button
                  onClick={logout}
                  className={`p-2 rounded-full transition-colors shrink-0 ${scrolled ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-brand-orange hover:bg-brand-orange-dark text-white px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 shadow-md whitespace-nowrap text-sm"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`transition-colors ${scrolled ? 'text-brand-dark' : 'text-white'} hover:text-brand-orange`}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden absolute w-full bg-white shadow-xl transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 text-base font-medium text-brand-dark hover:bg-orange-50 hover:text-brand-orange rounded-md transition-colors"
            >
              {link.name}
            </Link>
          ))}
            <Link
              to="/search"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 text-base font-medium text-brand-dark hover:bg-orange-50 hover:text-brand-orange rounded-md transition-colors"
            >
              Rechercher
            </Link>
          <div className="pt-4 px-3 border-t border-slate-100 mt-2">
            {user ? (
              <div className="space-y-4">
                <Link
                  to="/profil"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full bg-slate-50 text-brand-dark px-4 py-4 rounded-xl font-bold border border-slate-100"
                >
                  <User size={18} className="text-brand-orange" /> Mon Profil
                </Link>
                <Link
                  to={dashboardLink}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full bg-brand-dark text-white px-4 py-4 rounded-xl font-bold shadow-md"
                >
                  <LayoutDashboard size={18} className="text-brand-orange" /> Tableau de Bord
                </Link>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="flex items-center gap-3 w-full text-left text-red-500 font-bold py-2 px-1"
                >
                  <LogOut size={18} /> Déconnexion
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-brand-orange text-white px-4 py-3 rounded-md font-bold shadow-md"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
