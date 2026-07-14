import { useEffect } from 'react';

/**
 * Hook personnalisé pour gérer le SEO (Title et Meta Description)
 * @param {string} title Titre de la page
 * @param {string} description Description de la page
 */
export const useSEO = (title, description) => {
  useEffect(() => {
    // Mise à jour du titre
    document.title = title ? `${title} | BTP 360` : 'BTP 360 - Excellence Industrielle';

    // Mise à jour de la meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = description;
        document.head.appendChild(metaDescription);
      }
    }
  }, [title, description]);
};

export default useSEO;
