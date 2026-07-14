import React from 'react';
import { useSEO } from '../../hooks/useSEO';

const PrivacyPolicy = () => {
  useSEO('Politique de Confidentialité', 'Politique de confidentialité de BTP 360 concernant la collecte et l\'utilisation de vos données personnelles.');

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100 prose prose-slate max-w-none">
          <h1 className="text-4xl font-black text-brand-dark mb-8 tracking-tight uppercase">Politique de Confidentialité</h1>
          
          <p className="text-slate-500 font-medium italic mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">1. Collecte des données personnelles</h2>
          <p>Dans le cadre de l'utilisation de BTP 360, nous sommes amenés à collecter certaines de vos données personnelles (nom, email, téléphone, etc.) lorsque vous créez un compte ou remplissez un formulaire de contact.</p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">2. Utilisation des données</h2>
          <p>Ces données sont utilisées uniquement pour :</p>
          <ul>
            <li>Permettre la mise en relation entre clients et professionnels du bâtiment.</li>
            <li>Améliorer votre expérience sur la plateforme.</li>
            <li>Vous envoyer des notifications importantes liées à vos demandes de devis.</li>
          </ul>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">3. Partage des données</h2>
          <p>Vos données de contact ne sont partagées avec les professionnels que lorsque vous initiez une demande de devis explicite. BTP 360 ne vend aucune donnée personnelle à des tiers.</p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">4. Sécurité</h2>
          <p>Nous mettons en œuvre toutes les mesures techniques nécessaires (chiffrement, mots de passe hashés) pour protéger vos informations contre tout accès non autorisé.</p>

          <h2 className="text-2xl font-bold text-brand-dark mt-10 mb-4">5. Vos droits (RGPD)</h2>
          <p>Conformément à la législation en vigueur, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Vous pouvez exercer ce droit à tout moment depuis les paramètres de votre profil ou en nous contactant directement.</p>

          <div className="mt-12 p-6 bg-brand-orange/10 rounded-2xl border border-brand-orange/20">
            <p className="font-bold text-brand-dark mb-0">Pour toute question relative à vos données, contactez-nous à : <a href="mailto:privacy@btp360.com" className="text-brand-orange hover:underline">privacy@btp360.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
