import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Loader2, Search, MapPin,
  ShieldCheck, Star, ChevronRight, ArrowLeft, X,
  Briefcase, Calendar, DollarSign, MessageSquare, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';

const STEPS = [
  { id: 1, label: 'Votre projet',     icon: <FileText size={18} /> },
  { id: 2, label: 'Choisir un expert', icon: <Briefcase size={18} /> },
  { id: 3, label: 'Confirmation',      icon: <CheckCircle2 size={18} /> },
];

const BUDGETS = [
  'Moins de 500 000 FCFA',
  '500 000 – 2 000 000 FCFA',
  '2 000 000 – 10 000 000 FCFA',
  'Plus de 10 000 000 FCFA',
  'Budget non défini',
];

const DELAYS = [
  'Urgent (< 1 semaine)',
  '1 à 4 semaines',
  '1 à 3 mois',
  '3 à 6 mois',
  'Plus de 6 mois',
  'Flexible',
];

export default function Devis() {
  useSEO('Demande de Devis', 'Décrivez votre projet de construction ou rénovation et mettez-vous en relation avec les meilleurs experts BTP 360.');

  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const preselectedPartnerId = location.state?.partnerId || null;
  const preselectedService   = location.state?.service   || '';

  const [step, setStep]                     = useState(1);
  const [partners, setPartners]             = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [categories, setCategories]         = useState([]);
  const [partnerSearch, setPartnerSearch]   = useState('');
  const [partnerCat, setPartnerCat]         = useState('all');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [submitting, setSubmitting]         = useState(false);
  const [submitted, setSubmitted]           = useState(false);
  const [errors, setErrors]                 = useState({});

  const [form, setForm] = useState({
    service:     preselectedService,
    description: '',
    budget:      '',
    delay:       '',
    city:        '',
  });

  // Charger les partenaires et catégories
  useEffect(() => {
    Promise.all([api.get('/partners'), api.get('/categories')])
      .then(([parRes, catRes]) => {
        setPartners(parRes.data);
        setCategories(catRes.data);
        if (preselectedPartnerId) {
          const pre = parRes.data.find(p => p.id === parseInt(preselectedPartnerId));
          if (pre) setSelectedPartner(pre);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPartners(false));
  }, []);

  const updateForm = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filteredPartners = partners.filter(p => {
    const s = partnerSearch.toLowerCase();
    const matchSearch = !s || (p.name||'').toLowerCase().includes(s)
      || (p.company_name||'').toLowerCase().includes(s)
      || (p.category_name||'').toLowerCase().includes(s);
    const matchCat = partnerCat === 'all' || p.category_name === partnerCat;
    return matchSearch && matchCat;
  });

  const validateStep1 = () => {
    const e = {};
    if (!form.service.trim())     e.service = 'Veuillez préciser le type de service.';
    if (!form.description.trim()) e.description = 'Décrivez votre projet (min. 20 caractères).';
    else if (form.description.trim().length < 20) e.description = 'Description trop courte (min. 20 caractères).';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !selectedPartner) {
      setErrors({ partner: 'Veuillez sélectionner un expert.' });
      return;
    }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/devis', message: 'Connectez-vous pour envoyer votre demande.' } });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/devis', {
        partner_id:  selectedPartner.id,
        service:     form.service,
        description: form.description,
        budget:      form.budget || null,
        deadline:    form.delay || null,
        address:     form.city || null,
        phone:       user.phone || null,
      });
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Erreur lors de l\'envoi. Veuillez réessayer.' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── SUCCESS SCREEN ─────────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] shadow-2xl p-16 text-center max-w-lg w-full animate-scale-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="text-green-500" size={48} />
          </div>
          <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tight mb-4">Demande envoyée !</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-4">
            Votre demande a bien été transmise à <span className="font-black text-brand-dark">{selectedPartner?.company_name || selectedPartner?.name}</span>.
            Un email de confirmation lui a été envoyé.
          </p>
          <p className="text-slate-400 text-sm mb-10">Vous pouvez suivre l'avancement de votre demande depuis votre tableau de bord.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard-client" className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all">
              Mon tableau de bord
            </Link>
            <button onClick={() => { setSubmitted(false); setStep(1); setSelectedPartner(null); setForm({ service: '', description: '', budget: '', delay: '', city: '' }); }}
              className="bg-slate-50 text-slate-400 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all border border-slate-100">
              Nouvelle demande
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-black text-[10px] uppercase tracking-widest mb-4">
            Mise en relation
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-brand-dark tracking-tight mb-4">
            Demande de <span className="text-brand-orange">Devis</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
            Décrivez votre projet et connectez-vous avec le meilleur expert BTP 360 pour vos besoins.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-12 select-none">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                step === s.id
                  ? 'bg-brand-dark text-white shadow-lg shadow-brand-dark/20'
                  : step > s.id
                  ? 'bg-brand-orange/10 text-brand-orange'
                  : 'bg-white text-slate-300 border border-slate-100'
              }`}>
                {step > s.id ? <CheckCircle2 size={16} /> : s.icon}
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 mx-1 rounded-full transition-all ${step > s.id ? 'bg-brand-orange' : 'bg-slate-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1 : Votre projet ─────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 md:p-12 animate-fade-in">
            <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-8">Décrivez votre projet</h2>

            {/* Service */}
            <div className="mb-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                Type de service <span className="text-brand-orange">*</span>
              </label>
              <input
                type="text"
                value={form.service}
                onChange={e => updateForm('service', e.target.value)}
                placeholder="Ex : Construction d'une villa, Travaux de plomberie..."
                className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all ${errors.service ? 'border-red-400 bg-red-50/50' : 'border-transparent'}`}
              />
              {errors.service && <p className="text-red-500 text-xs font-bold mt-2">{errors.service}</p>}
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                Description du projet <span className="text-brand-orange">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => updateForm('description', e.target.value)}
                placeholder="Décrivez votre projet en détail : surface, matériaux souhaités, contraintes particulières, niveau de finition attendu..."
                rows={5}
                className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all resize-none ${errors.description ? 'border-red-400 bg-red-50/50' : 'border-transparent'}`}
              />
              <div className="flex justify-between mt-1">
                {errors.description
                  ? <p className="text-red-500 text-xs font-bold">{errors.description}</p>
                  : <span />}
                <span className={`text-xs font-bold ${form.description.length < 20 ? 'text-slate-300' : 'text-green-500'}`}>
                  {form.description.length} car.
                </span>
              </div>
            </div>

            {/* Budget + Délai en grille */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                  <DollarSign size={14} className="text-brand-orange" /> Budget estimé
                </label>
                <select
                  value={form.budget}
                  onChange={e => updateForm('budget', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all"
                >
                  <option value="">Sélectionner...</option>
                  {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                  <Calendar size={14} className="text-brand-orange" /> Délai souhaité
                </label>
                <select
                  value={form.delay}
                  onChange={e => updateForm('delay', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all"
                >
                  <option value="">Sélectionner...</option>
                  {DELAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Ville */}
            <div className="mb-10">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-brand-orange" /> Localisation du chantier
              </label>
              <input
                type="text"
                value={form.city}
                onChange={e => updateForm('city', e.target.value)}
                placeholder="Ex : Yaoundé, Douala, Bafoussam..."
                className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none transition-all"
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full py-5 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-brand-orange/20 hover:scale-105 flex items-center justify-center gap-3"
            >
              Choisir mon expert <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* ── STEP 2 : Choisir un expert ───────────────── */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-brand-orange font-bold transition-all group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Retour
            </button>

            {/* Partenaire sélectionné */}
            {selectedPartner && (
              <div className="bg-brand-orange/5 border-2 border-brand-orange/20 rounded-3xl p-6 flex items-center gap-6 animate-fade-in">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-brand-orange text-xl border border-slate-100 shrink-0 overflow-hidden">
                  {selectedPartner.avatar_url
                    ? <img src={selectedPartner.avatar_url} alt={selectedPartner.name} className="w-full h-full object-cover" />
                    : selectedPartner.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">Expert sélectionné</p>
                  <p className="font-black text-brand-dark truncate">{selectedPartner.company_name || selectedPartner.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{selectedPartner.category_name} · {selectedPartner.city || 'Cameroun'}</p>
                </div>
                <button onClick={() => setSelectedPartner(null)} className="p-2 text-slate-300 hover:text-red-400 transition-colors shrink-0">
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Filtres */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Chercher par nom, métier..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none font-medium transition-all"
                  value={partnerSearch}
                  onChange={e => setPartnerSearch(e.target.value)}
                />
              </div>
              <select
                value={partnerCat}
                onChange={e => setPartnerCat(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-brand-orange/10 focus:border-brand-orange outline-none font-bold text-sm"
              >
                <option value="all">Tous les métiers</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {errors.partner && <p className="text-red-500 text-sm font-bold bg-red-50 px-4 py-3 rounded-2xl">{errors.partner}</p>}

            {/* Grille de partenaires */}
            {loadingPartners ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-brand-orange mb-4" size={40} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement des experts...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-1">
                {filteredPartners.map(partner => (
                  <button
                    key={partner.id}
                    onClick={() => { setSelectedPartner(partner); setErrors({}); }}
                    className={`text-left bg-white rounded-3xl p-6 border-2 transition-all hover:shadow-xl group ${
                      selectedPartner?.id === partner.id
                        ? 'border-brand-orange shadow-lg shadow-brand-orange/10'
                        : 'border-slate-100 hover:border-brand-orange/30'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center font-black text-brand-orange text-lg shrink-0">
                        {partner.avatar_url
                          ? <img src={partner.avatar_url} alt={partner.name} className="w-full h-full object-cover" />
                          : partner.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-brand-dark truncate">{partner.company_name || partner.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{partner.category_name}</p>
                      </div>
                      {selectedPartner?.id === partner.id && (
                        <CheckCircle2 size={20} className="text-brand-orange shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-brand-orange" /> {partner.city || 'Cameroun'}
                      </span>
                      {partner.is_verified && (
                        <span className="flex items-center gap-1 text-green-600">
                          <ShieldCheck size={11} /> Certifié
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Briefcase size={11} /> {partner.projects_count || 0} projets
                      </span>
                    </div>
                  </button>
                ))}
                {filteredPartners.length === 0 && (
                  <div className="col-span-2 py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Aucun expert trouvé.</p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={!selectedPartner}
              className="w-full py-5 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-brand-orange/20 hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Vérifier et envoyer <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* ── STEP 3 : Confirmation ────────────────────── */}
        {step === 3 && (
          <div className="animate-fade-in">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 hover:text-brand-orange font-bold transition-all group mb-6">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Retour
            </button>

            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 md:p-12 space-y-8">
              <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Vérification de votre demande</h2>

              {/* Récapitulatif */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                  <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Expert sélectionné</p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-brand-orange text-xl border border-slate-100 overflow-hidden">
                      {selectedPartner?.avatar_url
                        ? <img src={selectedPartner.avatar_url} alt={selectedPartner.name} className="w-full h-full object-cover" />
                        : selectedPartner?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-brand-dark">{selectedPartner?.company_name || selectedPartner?.name}</p>
                      <p className="text-xs text-slate-500">{selectedPartner?.category_name} · {selectedPartner?.city || 'Cameroun'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 space-y-3">
                  <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Détails du projet</p>
                  <p className="font-bold text-brand-dark">{form.service}</p>
                  {form.budget && <p className="text-sm text-slate-500">Budget : <span className="font-bold text-brand-dark">{form.budget}</span></p>}
                  {form.delay  && <p className="text-sm text-slate-500">Délai : <span className="font-bold text-brand-dark">{form.delay}</span></p>}
                  {form.city   && <p className="text-sm text-slate-500">Lieu : <span className="font-bold text-brand-dark">{form.city}</span></p>}
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6">
                <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-3">Description</p>
                <p className="text-slate-600 font-medium leading-relaxed italic">"{form.description}"</p>
              </div>

              {/* Auth warning */}
              {!user && (
                <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-2xl p-5 flex items-center gap-4">
                  <MessageSquare size={20} className="text-brand-orange shrink-0" />
                  <div>
                    <p className="font-black text-brand-dark text-sm">Connexion requise</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Vous serez redirigé vers la page de connexion pour finaliser votre demande.</p>
                  </div>
                </div>
              )}

              {errors.submit && <p className="text-red-500 text-sm font-bold bg-red-50 px-4 py-3 rounded-2xl">{errors.submit}</p>}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-5 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-brand-orange/20 hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting
                  ? <><Loader2 size={20} className="animate-spin" /> Envoi en cours...</>
                  : <><CheckCircle2 size={20} /> Envoyer ma demande</>}
              </button>

              <p className="text-center text-xs text-slate-400 font-medium">
                En soumettant cette demande, vous acceptez nos{' '}
                <Link to="/cgu" className="text-brand-orange hover:underline font-bold">Conditions Générales d'Utilisation</Link>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
