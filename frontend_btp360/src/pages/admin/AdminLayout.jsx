import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Grid, 
  LogOut, 
  Bell, 
  Menu,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  Briefcase,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import logo from '../../assets/logo_btp360.png';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [hasNewNotifs, setHasNewNotifs] = React.useState(false);

  React.useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/admin/stats');
        const newNotifs = res.data.recentActivity || [];
        
        // Check if there are truly new notifs since last check
        const lastSeen = localStorage.getItem('btp360_admin_last_seen');
        if (newNotifs.length > 0) {
           const latestNotifDate = new Date(newNotifs[0].created_at).getTime();
           if (!lastSeen || latestNotifDate > parseInt(lastSeen)) {
              setHasNewNotifs(true);
           }
        }
        
        setNotifications(newNotifs);
      } catch (err) {
        console.error("Erreur notifications:", err);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = () => {
    if (notifications.length > 0) {
      const latestNotifDate = new Date(notifications[0].created_at).getTime();
      localStorage.setItem('btp360_admin_last_seen', latestNotifDate.toString());
    }
    setHasNewNotifs(false);
  };

  const toggleNotifs = () => {
    if (!isNotifOpen) {
       markAllAsRead();
    }
    setIsNotifOpen(!isNotifOpen);
  };

  const menuItems = [
    { name: 'Tableau de bord', path: '/admin', icon: <BarChart3 size={20} /> },
    { name: 'Partenaires', path: '/admin/partners', icon: <Users size={20} /> },
    { name: 'Clients', path: '/admin/clients', icon: <Users size={20} className="opacity-70" /> },
    { name: 'Mises en relation', path: '/admin/leads', icon: <MessageSquare size={20} /> },
    { name: 'Devis', path: '/admin/devis', icon: <FileText size={20} /> },
    { name: 'Commentaires', path: '/admin/comments', icon: <MessageSquare size={20} className="opacity-50" /> },
    { name: 'Académie (Articles)', path: '/admin/academy', icon: <BookOpen size={20} /> },
    { name: 'Catégories', path: '/admin/categories', icon: <Grid size={20} /> },
  ];

  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm z-[40] lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 lg:relative lg:flex w-80 bg-brand-dark flex flex-col shadow-2xl z-[50] transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 md:p-8 flex items-center justify-between">
           <Link to="/" className="flex items-center gap-2 md:gap-4 shrink-0 overflow-hidden">
             <img src={logo} alt="BTP 360" className="h-8 md:h-10 w-auto shrink-0" />
             <div className="flex flex-col">
                <span className="text-lg md:text-xl font-black text-white whitespace-nowrap tracking-tighter leading-none">BTP <span className="text-brand-orange">360</span></span>
                <span className="text-[9px] font-black text-brand-orange/40 uppercase tracking-[0.3em] mt-1.5">Administration</span>
             </div>
           </Link>
           <button onClick={closeSidebar} className="lg:hidden text-white p-2">
              <ChevronRight className="rotate-180" />
           </button>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-8 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-brand-orange/50 group-hover:text-brand-orange'}`}>
                  {item.icon}
                </div>
                <span className="font-bold text-sm uppercase tracking-widest">{item.name}</span>
                {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5 mt-auto">
          <Link to="/profil" className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
            <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-brand-orange/20 group-hover:scale-110 transition-transform">
               <span>{user?.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white text-xs font-bold truncate uppercase tracking-widest">{user?.name}</p>
              <p className="text-slate-500 text-[10px] truncate font-medium">Administrateur</p>
            </div>
          </Link>
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-slate-400 hover:text-red-400 font-black uppercase text-[10px] tracking-[0.2em] transition-colors w-full px-4"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white h-20 flex items-center justify-between px-4 lg:px-10 border-b border-slate-200 shrink-0 z-[40] animate-slide-in-top">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden bg-slate-50 p-2.5 rounded-xl text-slate-400 hover:text-brand-orange transition-all"
              >
                 <Menu size={20} />
              </button>
              <h2 className="text-sm md:text-xl font-black text-brand-dark uppercase tracking-tight truncate">Administration</h2>
           </div>

           <div className="flex items-center gap-4 md:gap-6">
              <div className="relative">
                 <button 
                  onClick={toggleNotifs}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-all relative group"
                 >
                    <Bell size={22} className={`transition-colors ${isNotifOpen ? 'text-brand-orange' : 'text-slate-400 group-hover:text-brand-orange'}`} />
                    {hasNewNotifs && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                    )}
                 </button>

                 {isNotifOpen && (
                   <>
                    <div 
                      className="fixed inset-0 z-[60]" 
                      onClick={() => setIsNotifOpen(false)}
                    />
                    <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                       <div className="p-8 bg-brand-dark text-white relative overflow-hidden">
                          <div className="relative z-10">
                             <div className="flex justify-between items-center mb-1">
                                <h3 className="font-black uppercase tracking-widest text-xs">Centre d'activité</h3>
                                <button onClick={() => setIsNotifOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity">
                                   <Menu size={16} className="rotate-90" />
                                </button>
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Administration en direct</p>
                          </div>
                          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-orange/20 rounded-full blur-3xl"></div>
                       </div>
                       
                       <div className="max-h-[450px] overflow-y-auto p-2">
                          {notifications.length > 0 ? notifications.map((notif, i) => (
                             <div key={i} className="p-4 hover:bg-slate-50 transition-all rounded-2xl cursor-pointer group flex gap-4 items-start border border-transparent hover:border-slate-100">
                                <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${
                                   notif.type === 'user' ? 'bg-blue-50 text-blue-500' : 
                                   notif.type === 'project' ? 'bg-brand-orange/10 text-brand-orange' : 
                                   'bg-green-50 text-green-500'
                                }`}>
                                   {notif.type === 'user' && <Users size={20} />}
                                   {notif.type === 'project' && <Briefcase size={20} />}
                                   {notif.type === 'lead' && <MessageSquare size={20} />}
                                </div>
                                <div className="flex-1 overflow-hidden pt-1">
                                   <div className="flex justify-between items-start mb-1">
                                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                                        notif.type === 'user' ? 'text-blue-500' : 
                                        notif.type === 'project' ? 'text-brand-orange' : 
                                        'text-green-600'
                                      }`}>
                                         {notif.type === 'user' ? 'Inscription' : notif.type === 'project' ? 'Réalisation' : 'Demande BTP'}
                                      </span>
                                      <span className="text-[9px] font-bold text-slate-300 whitespace-nowrap ml-2">
                                         {getRelativeTime(notif.created_at)}
                                      </span>
                                   </div>
                                   <p className="text-xs font-black text-brand-dark leading-snug group-hover:text-brand-orange transition-colors truncate">
                                      {notif.title}
                                   </p>
                                   <p className="text-[10px] text-slate-400 font-medium mt-1">
                                      {notif.type === 'user' ? 'Nouveau membre du réseau' : 
                                       notif.type === 'project' ? 'Nouvelle référence ajoutée' : 
                                       'Un client recherche un expert'}
                                   </p>
                                </div>
                             </div>
                          )) : (
                             <div className="p-16 text-center">
                                <Bell className="mx-auto text-slate-100 mb-4" size={48} />
                                <p className="text-slate-400 italic text-sm font-medium">Aucune activité récente à signaler.</p>
                             </div>
                          )}
                       </div>
                       
                       <button 
                         onClick={markAllAsRead}
                         className="w-full py-5 bg-slate-50 text-brand-dark text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors border-t border-slate-100"
                       >
                          Tout marquer comme lu
                       </button>
                    </div>
                   </>
                 )}
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm animate-fade-in">
                 <ShieldCheck size={14} /> Sécurisé
              </div>
           </div>
        </header>

        {/* Dynamic Content */}
        <div key={location.pathname} className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-100 animate-fade-in">
           {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
