// app/index.tsx
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { AdminAccess, AdminPanel } from '../components/ui/AdminPanel';
import { ROUTES } from '../constants/routes';
import { KioskAuthService } from '../services/kioskAuth';

export default function PaymentHomeScreen() {
  const router = useRouter();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, [router]);

  const checkAuthAndRedirect = async () => {
    try {
      // Vérifier si la borne est déjà authentifiée
      const isAuthenticated = await KioskAuthService.isKioskAuthenticated();

      if (isAuthenticated) {
        // Si déjà authentifiée, rediriger immédiatement vers PAYMENT_METHOD
        console.log('Borne déjà authentifiée, redirection immédiate');
        router.push(ROUTES.PAYMENT_METHOD);
      } else {
        // Si pas authentifiée, afficher le loader puis rediriger vers l'auth
        console.log('Borne non authentifiée, affichage du loader d\'initialisation');
        setTimeout(() => {
          setIsCheckingAuth(false);
          // L'AuthWrapper prendra le relais pour l'authentification
        }, 1000);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      // En cas d'erreur, afficher le loader par sécurité
      setTimeout(() => {
        setIsCheckingAuth(false);
      }, 1000);
    }
  };

  // Si on vérifie encore l'auth ou si on n'est pas authentifié et qu'on affiche le loader
  if (isCheckingAuth) {
    return (
      <ScreenLayout>
        <LoadingIndicator text="Initialisation de la borne Paiement..." />

        <AdminAccess onShowPanel={() => setShowAdminPanel(true)} />
        <AdminPanel visible={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
      </ScreenLayout>
    );
  }

  // Si on arrive ici, c'est que la borne n'est pas authentifiée
  // L'AuthWrapper va prendre le relais pour afficher l'écran d'authentification
  return null;
}