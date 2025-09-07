// components/layout/AuthWrapper.tsx
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import LoadingIndicator from '../ui/LoadingIndicator';
import { KioskAuthService } from '../../services/kioskAuth';
import KioskAuthScreen from '../../app/kiosk-auth';
import { ROUTES } from '../../constants/routes';

type AuthWrapperProps = {
    children: React.ReactNode;
};

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showAuthScreen, setShowAuthScreen] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        try {
            if (pathname === '/kiosk-auth') {
                setIsCheckingAuth(false);
                setIsAuthenticated(true);
                return;
            }

            console.log('Payment App - Vérification authentification...');
            const isAuth = await KioskAuthService.isKioskAuthenticated();

            if (isAuth) {
                setIsAuthenticated(true);
                setShowAuthScreen(false);
                setIsCheckingAuth(false);

                // PAS DE REDIRECTION ICI - c'est géré dans index.tsx
                // L'index.tsx s'occupe de la redirection vers PAYMENT_METHOD
            } else {
                setIsAuthenticated(false);
                setShowAuthScreen(true);
                setIsCheckingAuth(false);
            }
        } catch (error) {
            console.error('Erreur authentification:', error);
            setIsAuthenticated(false);
            setShowAuthScreen(true);
            setIsCheckingAuth(false);
        }
    };

    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
        setShowAuthScreen(false);
        // PAS DE REDIRECTION ICI - c'est géré dans index.tsx après l'authentification
    };

    // PAS DE LOADER ICI - c'est géré dans index.tsx
    if (isCheckingAuth) {
        return (
            <View style={{ flex: 1 }}>
                {/* Pas de loader ici car index.tsx gère déjà ça */}
            </View>
        );
    }

    if (showAuthScreen && !isAuthenticated) {
        return <KioskAuthScreen onAuthSuccess={handleAuthSuccess} />;
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return null;
};

export default AuthWrapper;