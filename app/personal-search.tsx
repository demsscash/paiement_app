// app/personal-search.tsx - Version corrigée pour Payment App
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import { Heading, Paragraph, SubHeading } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import ErrorModal from '../components/ui/ErrorModal';
import { ROUTES } from '../constants/routes';
import { ApiService } from '../services/api';
import { useActivity } from '../components/layout/ActivityWrapper';

export default function PersonalSearchScreen() {
    const router = useRouter();
    const { triggerActivity } = useActivity();

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [dateNaissance, setDateNaissance] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorTitle, setErrorTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Validation de la date
    const isValidDate = (dateStr: string): boolean => {
        if (!dateStr || dateStr.length !== 10) return false;

        const parts = dateStr.split('/');
        if (parts.length !== 3) return false;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
            return false;
        }

        const date = new Date(year, month - 1, day);
        return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
    };

    // Validation du formulaire
    const isFormValid = (): boolean => {
        return nom.trim().length >= 2 &&
            prenom.trim().length >= 2 &&
            isValidDate(dateNaissance);
    };

    // Formatage de la date avec validation
    const handleDateChange = (text: string) => {
        if (text.length === 0) {
            setDateNaissance('');
            triggerActivity();
            return;
        }

        const numbers = text.replace(/\D/g, '');
        const limitedNumbers = numbers.slice(0, 8);

        let formatted = '';

        if (limitedNumbers.length <= 2) {
            formatted = limitedNumbers;
        } else if (limitedNumbers.length <= 4) {
            formatted = limitedNumbers.slice(0, 2) + '/' + limitedNumbers.slice(2);
        } else {
            formatted = limitedNumbers.slice(0, 2) + '/' +
                limitedNumbers.slice(2, 4) + '/' +
                limitedNumbers.slice(4);
        }

        setDateNaissance(formatted);
        triggerActivity();
    };

    // Recherche du patient pour le paiement
    const handleSearch = async () => {
        if (!isFormValid()) {
            setErrorTitle('Informations incomplètes');
            setErrorMessage('Veuillez remplir tous les champs correctement.\nFormat de date attendu : JJ/MM/AAAA\nVérifiez que la date est valide.');
            setErrorModalVisible(true);
            return;
        }

        setLoading(true);

        try {
            // Convertir la date au format ISO pour l'API
            const [day, month, year] = dateNaissance.split('/');
            const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            const searchData = {
                nom: nom.trim().toUpperCase(),
                prenom: prenom.trim(),
                date_naissance: isoDate
            };

            console.log('Recherche paiement avec les données:', searchData);

            // Rechercher les informations de paiement
            const paymentData = await ApiService.searchPaymentByPersonalInfo(searchData);

            if (paymentData && paymentData.validationCode) {
                console.log('Paiement trouvé avec code de validation:', paymentData.validationCode);

                const validationCode = paymentData.validationCode;

                // Récupérer les informations complètes de paiement pour avoir l'appointmentId
                const paymentInfo = await ApiService.getPaymentByCode(validationCode);

                if (paymentInfo && paymentInfo.appointmentId) {
                    console.log('Informations de paiement complètes récupérées, appointmentId:', paymentInfo.appointmentId);

                    // Naviguer directement vers l'écran de carte vitale (étape suivante après la validation du code)
                    router.push({
                        pathname: ROUTES.CARTE_VITALE,
                        params: {
                            code: validationCode,
                            appointmentId: paymentInfo.appointmentId.toString()
                        }
                    });
                } else {
                    console.error('Erreur lors de la récupération des informations de paiement');
                    setErrorTitle('Erreur de paiement');
                    setErrorMessage('Impossible de récupérer les informations de paiement. Veuillez réessayer ou contacter le secrétariat.');
                    setErrorModalVisible(true);
                }
            } else {
                setErrorTitle('Aucun paiement trouvé');
                setErrorMessage('Aucun paiement en attente n\'a été trouvé avec ces informations. Vérifiez vos données ou contactez le secrétariat.');
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche de paiement:', error);
            setErrorTitle('Erreur de recherche');
            setErrorMessage('Une erreur s\'est produite lors de la recherche. Veuillez réessayer ou contacter le secrétariat.');
            setErrorModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const closeErrorModal = () => {
        setErrorModalVisible(false);
    };

    const handleBack = () => {
        router.push(ROUTES.PAYMENT_METHOD);
    };

    if (loading) {
        return (
            <ScreenLayout>
                <LoadingIndicator text="Recherche du paiement en cours..." />
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout>
            <View className="w-full max-w-md">
                {/* Bouton retour */}
                <View className="w-full mb-8">
                    <Button
                        title="← Retour"
                        onPress={handleBack}
                        variant="secondary"
                        className="self-start px-6"
                    />
                </View>

                {/* Titre */}
                <Heading className="mb-2 text-black text-center">
                    Recherche
                </Heading>
                <Heading className="mb-4  text-center">
                    par informations
                </Heading>

                <Paragraph className="mb-8 text-center px-4">
                    Saisissez vos informations personnelles pour retrouver votre paiement en attente
                </Paragraph>

                {/* Formulaire */}
                <View className="w-full space-y-6">
                    {/* Champ Nom */}
                    <View>
                        <SubHeading className="mb-3 text-left">Nom de famille</SubHeading>
                        <TextInput
                            style={{
                                width: '100%',
                                height: 56,
                                backgroundColor: 'white',
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                fontSize: 18,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                                borderWidth: 1,
                                borderColor: '#e5e7eb'
                            }}
                            placeholder="Votre nom de famille"
                            value={nom}
                            onChangeText={(text) => {
                                setNom(text);
                                triggerActivity();
                            }}
                            autoCapitalize="characters"
                            onFocus={triggerActivity}
                            editable={true}
                        />
                    </View>

                    {/* Champ Prénom */}
                    <View>
                        <SubHeading className="mb-3 text-left">Prénom</SubHeading>
                        <TextInput
                            style={{
                                width: '100%',
                                height: 56,
                                backgroundColor: 'white',
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                fontSize: 18,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                                borderWidth: 1,
                                borderColor: '#e5e7eb'
                            }}
                            placeholder="Votre prénom"
                            value={prenom}
                            onChangeText={(text) => {
                                setPrenom(text);
                                triggerActivity();
                            }}
                            autoCapitalize="words"
                            onFocus={triggerActivity}
                            editable={true}
                        />
                    </View>

                    {/* Champ Date de naissance */}
                    <View>
                        <SubHeading className="mb-3 text-left">Date de naissance</SubHeading>
                        <TextInput
                            style={{
                                width: '100%',
                                height: 56,
                                backgroundColor: 'white',
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                fontSize: 18,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                                borderWidth: 1,
                                borderColor: '#e5e7eb'
                            }}
                            placeholder="JJ/MM/AAAA"
                            value={dateNaissance}
                            onChangeText={handleDateChange}
                            keyboardType="numeric"
                            maxLength={10}
                            onFocus={triggerActivity}
                            editable={true}
                        />
                        <Text className="text-sm text-gray-500 mt-1 ml-2">
                            Format: JJ/MM/AAAA (ex: 15/03/1990)
                        </Text>
                    </View>
                </View>

                {/* Bouton de recherche */}
                <View className="mt-8">
                    <Button
                        title={isFormValid() ? "Rechercher mon paiement" : "Veuillez remplir tous les champs"}
                        onPress={handleSearch}
                        disabled={!isFormValid()}
                        className="w-full justify-center items-center"
                    />
                </View>

                {/* Message d'aide */}
                <View className="mt-8">
                    <Paragraph className="text-center text-gray-500 text-sm">
                        Informations introuvables ? Contactez le secrétariat pour obtenir de l'aide
                    </Paragraph>
                </View>
            </View>

            {/* Modal d'erreur */}
            <ErrorModal
                visible={errorModalVisible}
                title={errorTitle}
                message={errorMessage}
                onClose={closeErrorModal}
            />
        </ScreenLayout>
    );
}