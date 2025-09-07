// app/payment.tsx - Avec bouton retour vers PAYMENT_METHOD
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import { Heading, Paragraph, SubHeading } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import CodeInput from '../components/ui/CodeInput';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import ErrorModal from '../components/ui/ErrorModal';
import { ROUTES } from '../constants/routes';
import { ApiService } from '../services/api';
import { DEFAULT_CODE_LENGTH } from '../constants/mockData';

export default function PaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { error } = params;

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorTitle, setErrorTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const renderCount = useRef(0);
    renderCount.current += 1;

    const getFullCode = () => code.join('');
    const isComplete = getFullCode().length === DEFAULT_CODE_LENGTH;

    const handleCodeChange = (newCode: string[]) => {
        setCode(newCode);
    };

    // Gestion des erreurs passées en paramètres
    useEffect(() => {
        if (error === 'invalidCode') {
            setErrorTitle('Code invalide');
            setErrorMessage('Le code que vous avez saisi ne correspond à aucune facture dans notre système. Veuillez réessayer.');
            setErrorModalVisible(true);
        } else if (error === 'serverError') {
            setErrorTitle('Erreur de serveur');
            setErrorMessage('Une erreur s\'est produite. Veuillez réessayer plus tard ou contacter le secrétariat.');
            setErrorModalVisible(true);
        }
    }, [error]);

    // Bouton retour vers le choix de méthode PAYMENT
    const handleBack = () => {
        router.push(ROUTES.PAYMENT_METHOD);
    };

    const handleValidation = async () => {
        const fullCode = getFullCode();
        if (fullCode.length === DEFAULT_CODE_LENGTH) {
            setLoading(true);

            try {
                // Utiliser la nouvelle fonction getPaymentByCode qui se base sur GET_APPOINTMENT
                console.log("Vérification du code de paiement:", fullCode);
                const paymentInfo = await ApiService.getPaymentByCode(fullCode);

                if (paymentInfo && paymentInfo.appointmentId) {
                    console.log("Informations de paiement trouvées:", paymentInfo);
                    console.log("ID du rendez-vous:", paymentInfo.appointmentId);

                    // Naviguer vers la page de carte vitale avec le code et l'ID du rendez-vous
                    router.push({
                        pathname: ROUTES.CARTE_VITALE,
                        params: {
                            code: fullCode,
                            appointmentId: paymentInfo.appointmentId.toString()
                        }
                    });
                } else {
                    // Aucune information de paiement trouvée - Message cohérent avec celui de verification.tsx
                    console.error("Aucune information de paiement trouvée pour le code:", fullCode);
                    setErrorTitle('Code facture invalide');
                    setErrorMessage('Le code que vous avez saisi ne correspond à aucune facture dans notre système.');
                    setErrorModalVisible(true);
                }
            } catch (error) {
                console.error("Erreur lors de la vérification du code:", error);
                setErrorTitle('Erreur serveur');
                setErrorMessage('Une erreur s\'est produite lors de la vérification. Veuillez réessayer plus tard ou contacter le secrétariat.');
                setErrorModalVisible(true);
            } finally {
                setLoading(false);
            }
        } else {
            Keyboard.dismiss();
            setErrorTitle('Code incomplet');
            setErrorMessage('Veuillez saisir un code facture à 6 chiffres.');
            setErrorModalVisible(true);
        }
    };

    const closeErrorModal = () => {
        setErrorModalVisible(false);
    };

    // Debug info renderer
    const renderDebugInfo = () => {
        return (
            <View className="absolute bottom-2 left-2 bg-white p-2 rounded-lg opacity-70">
                <Text className="text-xs">Complete: {isComplete ? 'Yes' : 'No'}</Text>
                <Text className="text-xs">Code: {code.join('')}</Text>
                <Text className="text-xs">Renders: {renderCount.current}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <ScreenLayout>
                <LoadingIndicator text="Vérification en cours..." />
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout>
            <View className="w-full max-w-2xl mx-auto px-4 flex-1 justify-center">
                {/* Bouton retour */}
                <View className="w-full mb-4">
                    <Button
                        title="← Retour"
                        onPress={handleBack}
                        variant="secondary"
                        className="self-start px-4 py-3"
                    />
                </View>

                {/* Contenu principal centré */}
                <View className="flex-1 justify-center items-center">
                    <Heading className="mb-3 text-center text-black text-xl">
                        Régler votre facture
                    </Heading>

                    <Paragraph className="mb-6 text-center px-4 text-sm">
                        Pour toute autre information adressez vous au secrétariat
                    </Paragraph>

                    <SubHeading className="mb-4 text-base">
                        Veuillez entrer le code facture
                    </SubHeading>

                    <CodeInput
                        codeLength={DEFAULT_CODE_LENGTH}
                        value={code}
                        onChange={handleCodeChange}
                        containerClassName="mb-8"
                    />

                    <Button
                        title="Valider"
                        onPress={handleValidation}
                        variant="primary"
                        disabled={!isComplete}
                        className="w-64 h-14 justify-center items-center"
                    />
                </View>
            </View>

            {/* Modal d'erreur */}
            <ErrorModal
                visible={errorModalVisible}
                title={errorTitle}
                message={errorMessage}
                onClose={closeErrorModal}
            />

            {/* Debug info (only visible in dev mode) */}
            {__DEV__ && renderDebugInfo()}
        </ScreenLayout>
    );
}