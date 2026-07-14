import React from 'react';
import { useSEO } from '../../hooks/useSEO';

const TermsOfService = () => {
  useSEO('Conditions Générales d\'Utilisation', 'CGU de la plateforme BTP 360.');

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100 prose prose-slate max-w-none">
          <h1 className="text-4xl font-black text-brand-dark mb-8 tracking-tight uppercase">Conditions Générales d'Utilisation (CGU)</h1>
          
          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">1. Objet du service</h2>
          <p>La plateforme BTP 360 a pour objet de mettre en relation des professionnels du bâtiment (ci-après "Partenaires") avec des particuliers ou entreprises (ci-après "Clients") ayant des besoins en construction, rénovation ou architecture.</p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">2. Obligations des Partenaires</h2>
          <p>Les professionnels s'engagent à fournir des informations exactes sur leur entreprise (numéro d'immatriculation, qualifications, assurances) et à respecter les engagements pris envers les clients via la plateforme.</p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">3. Obligations des Clients</h2>
          <p>Les clients s'engagent à utiliser le système de demande de devis de bonne foi, en fournissant des informations réelles sur leurs projets pour permettre aux partenaires d'y répondre de manière adéquate.</p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">4. Responsabilité</h2>
          <p>BTP 360 agit exclusivement en tant qu'intermédiaire technique. BTP 360 ne peut être tenu responsable de la qualité des travaux réalisés, des retards de chantier, ou de tout litige survenant entre un client et un partenaire.</p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">5. Modération et Avis</h2>
          <p>BTP 360 se réserve le droit de supprimer tout compte ne respectant pas les présentes CGU, ainsi que de modérer les avis clients jugés injurieux, diffamatoires ou non fondés sur une prestation réelle.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
