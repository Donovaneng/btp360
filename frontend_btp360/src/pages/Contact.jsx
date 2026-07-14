import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

const Contact = () => {
  useSEO('Contact', 'Contactez l\'équipe BTP 360 pour vos questions ou besoin d\'accompagnement personnalisé.');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', formData);
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfos = [
    { 
      icon: <Mail size={24} />, 
      label: 'Email', 
      value: 'contact@btp360.com',
      desc: 'Réponse sous 24h',
      color: 'bg-blue-50 text-blue-500'
    },
    { 
      icon: <Phone size={24} />, 
      label: 'Téléphone', 
      value: '+237 6XX XX XX XX',
      desc: 'Lun-Ven, 8h-18h',
      color: 'bg-green-50 text-green-500'
    },
    { 
      icon: <MapPin size={24} />, 
      label: 'Bureau', 
      value: 'Douala, Cameroun',
      desc: 'Quartier Akwa',
      color: 'bg-brand-orange/10 text-brand-orange'
    }
  ];

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center mb-20 animate-slide-in-top">
          <h1 className="text-5xl font-black text-brand-dark uppercase tracking-tight mb-6">
            Parlons de vos <span className="text-brand-orange">Projets</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">
            Une question sur nos services ou besoin d'un accompagnement personnalisé ? Notre équipe d'experts est à votre écoute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Contact Info Cards */}
          <div className="space-y-6">
            {contactInfos.map((info, idx) => (
              <div 
                key={idx} 
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`w-14 h-14 ${info.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {info.icon}
                </div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{info.label}</h3>
                <p className="text-xl font-black text-brand-dark mb-1">{info.value}</p>
                <p className="text-sm font-medium text-slate-400">{info.desc}</p>
              </div>
            ))}

            <div className="bg-brand-dark p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="relative z-10">
                <h3 className="text-lg font-black uppercase tracking-widest mb-4">Urgence Chantier ?</h3>
                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                  Pour toute assistance technique immédiate sur le terrain, contactez notre ligne d'urgence 24/7.
                </p>
                <a href="tel:+237696700662" className="inline-flex items-center gap-3 text-brand-orange font-black uppercase tracking-widest text-xs hover:gap-5 transition-all">
                  Ligne Directe <ArrowRight size={16} />
                </a>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 animate-scale-in">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-dark">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Envoyez-nous un message</h2>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Nous vous recontacterons sous peu</p>
                </div>
              </div>

              {sent ? (
                <div className="py-20 text-center animate-fade-in">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 shadow-inner">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-brand-dark mb-4 uppercase">Message Envoyé !</h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                    Merci pour votre message. Un membre de notre équipe reviendra vers vous très prochainement.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Votre Nom</label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: Jean Dupont"
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Adresse Email</label>
                      <input 
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="votre@email.com"
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sujet de la demande</label>
                    <input 
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Ex: Demande de partenariat / Question technique"
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Message</label>
                    <textarea 
                      required
                      rows="6"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Comment pouvons-nous vous aider ?"
                      className="w-full px-8 py-6 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-bold text-sm resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-brand-dark hover:bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl shadow-brand-dark/20 flex items-center justify-center gap-4 group disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : (
                      <>
                        Envoyer le message <Send size={20} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>{/* /grid */}
      </div>{/* /container */}
    </div>
  );
};

export default Contact;
