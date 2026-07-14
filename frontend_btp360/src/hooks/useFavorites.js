import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * Hook pour gérer les favoris d'un utilisateur connecté.
 * Charge la liste une seule fois et expose un toggle optimiste.
 */
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]); // liste d'IDs partenaires
  const [loading, setLoading]     = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) { setFavorites([]); return; }
    setLoading(true);
    try {
      const res = await api.get('/favorites');
      const data = Array.isArray(res.data) ? res.data : [];
      setFavorites(data.map(f => f.id));
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = (partnerId) => favorites.includes(parseInt(partnerId));

  const toggle = useCallback(async (partnerId) => {
    if (!user) return false;
    const id = parseInt(partnerId);
    // Mise à jour optimiste
    const wasAlready = favorites.includes(id);
    setFavorites(prev =>
      wasAlready ? prev.filter(f => f !== id) : [...prev, id]
    );
    try {
      const res = await api.post('/favorites/toggle', { partner_id: id });
      // Sync avec la réponse serveur
      if (res.data.is_favorite && !favorites.includes(id)) {
        setFavorites(prev => [...prev.filter(f => f !== id), id]);
      } else if (!res.data.is_favorite) {
        setFavorites(prev => prev.filter(f => f !== id));
      }
      return res.data.is_favorite;
    } catch {
      // Rollback en cas d'erreur
      setFavorites(prev =>
        wasAlready ? [...prev, id] : prev.filter(f => f !== id)
      );
      return wasAlready;
    }
  }, [user, favorites]);

  return { favorites, loading, isFavorite, toggle, refetch: fetchFavorites };
}
