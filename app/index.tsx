import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { AdminAccess, AdminPanel } from '../components/ui/AdminPanel';
import { ROUTES } from '../constants/routes';

export default function PaymentHomeScreen() {
  const router = useRouter();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Redirection automatique vers payment après 1 seconde
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(ROUTES.PAYMENT);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ScreenLayout>
      <LoadingIndicator text="Initialisation de la borne Paiement..." />
      
      <AdminAccess onShowPanel={() => setShowAdminPanel(true)} />
      <AdminPanel visible={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
    </ScreenLayout>
  );
}
