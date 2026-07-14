import React from 'react';
import { useSEO } from '../../hooks/useSEO';

const LegalNotice = () => {
  useSEO('Mentions Légales', 'Mentions légales et informations éditoriales de BTP 360.');

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100 prose prose-slate max-w-none">
          <h1 className="text-4xl font-black text-brand-dark mb-8 tracking-tight uppercase">Mentions Légales</h1>
          
          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">Éditeur du Site</h2>
          <p>
            <strong>Nom de l'entreprise :</strong> BTP 360 SARL<br />
            <strong>Siège social :</strong> 123 Avenue de la Construction, Douala, Cameroun<br />
            <strong>Numéro de téléphone :</strong> +237 600 00 00 00<br />
            <strong>Adresse E-mail :</strong> contact@btp360.com<br />
            <strong>Capital social :</strong> 1 000 000 FCFA<br />
            <strong>Numéro d'immatriculation (RCCM) :</strong> RC/DLA/2026/B/1234
          </p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">Directeur de la publication</h2>
          <p>Monsieur Jean Dupont, en qualité de Directeur Général de BTP 360.</p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">Hébergement</h2>
          <p>
            Ce site est hébergé par :<br />
            <strong>Hostinger International Ltd.</strong><br />
            61 Lordou Vironos Street, 6023 Larnaca, Chypre<br />
            Site web : https://www.hostinger.fr
          </p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">Propriété Intellectuelle</h2>
          <p>L'ensemble des éléments figurant sur ce site (textes, images, logos, architecture web) sont protégés par les dispositions du Code de la Propriété Intellectuelle. Toute reproduction, totale ou partielle, est strictement interdite sans autorisation expresse de BTP 360.</p>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;
