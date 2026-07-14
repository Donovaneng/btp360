import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader360 from './Loader360';

/**
 * Composant de protection des routes
 * @param {children} - Le contenu à afficher si autorisé
 * @param {allowedRoles} - Liste des IDs de rôles autorisés (ex: [2, 3])
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // On affiche le loader pendant que l'authentification est en cours
  if (loading) {
    return <Loader360 fullPage={true} />;
  }

  // Rediriger vers login si non connecté
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier le rôle si spécifié
  if (allowedRoles.length > 0 && !allowedRoles.includes(Number(user.role_id))) {
    // Rediriger vers l'accueil si le rôle n'est pas autorisé
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
