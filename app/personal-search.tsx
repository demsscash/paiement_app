// app/personal-search.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/layout/ScreenLayout';
import Button from '../components/ui/Button';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import ErrorModal from '../components/ui/ErrorModal';
import { Heading, SubHeading, Paragraph } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';
import { ApiService } from '../services/api';
import { useActivity } from '../components/layout/ActivityWrapper';

export default function PersonalSearchScreen() {
    const router = useRouter();
    const { triggerActivity } = useActivity();

    // États du formulaire
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [dateNaissance, setDateNaissance] = useState('');
    const [loading, setLoading] = useState(false);

    // États pour le modal d'erreur
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTitle, setErrorTitle] = useState('');

    // Validation du formulaire
    const isFormValid = () => {
        return nom.trim().length >= 2 &&
            prenom.trim().length >= 2 &&
            dateNaissance.length === 10 &&
            /^\d{2}\/\d{2}\/\d{4}$/.test(dateNaissance) &&
            isValidDate(dateNaissance);
    };

    // Fonction pour valider si la date est réelle
    const isValidDate = (dateStr: string) => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;

        const [day, month, year] = dateStr.split('/').map(Number);

        // Vérifications basiques
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > new Date().getFullYear()) return false;

        // Vérifier le nombre de jours dans le mois
        const daysInMonth = new Date(year, month, 0).getDate();
        return day <= daysInMonth;
    };

    // Formatage de la date pendant la saisie
    const handleDateChange = (text: string) => {
        // Si l'utilisateur efface, on garde tel quel
        if (text.length < dateNaissance.length) {
            setDateNaissance(text);
            triggerActivity();
            return;
        }

        // Supprimer tous les caractères non numériques
        const numbers = text.replace(/\D/g, '');

        // Limiter à 8 chiffres maximum (DDMMYYYY)
        const limitedNumbers = numbers.slice(0, 8);

        // Formater en DD/MM/YYYY
        let formatted = '';

        if (limitedNumbers.length <= 2) {
            // Jour seulement: "03"
            formatted = limitedNumbers;
        } else if (limitedNumbers.length <= 4) {
            // Jour + Mois: "03/03"
            formatted = limitedNumbers.slice(0, 2) + '/' + limitedNumbers.slice(2);
        } else {
            // Jour + Mois + Année: "03/03/1990"
            formatted = limitedNumbers.slice(0, 2) + '/' +
                limitedNumbers.slice(2, 4) + '/' +
                limitedNumbers.slice(4);
        }

        setDateNaissance(formatted);
        triggerActivity();
    };

    // Recherche du patient
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

            console.log('Recherche avec les données:', searchData);

            const appointmentData = await ApiService.searchAppointmentByPersonalInfo(searchData);

            if (appointmentData && appointmentData.validationCode) {
                console.log('Rendez-vous trouvé avec code de validation:', appointmentData.validationCode);

                // Récupérer le code de validation et continuer avec le flux normal
                const validationCode = appointmentData.validationCode;

                // Naviguer vers l'écran de carte Vitale avec le code de validation récupéré
                // On utilise le flux normal (comme si on avait saisi le code)
                router.push({
                    pathname: ROUTES.CHECKIN_CARTE_VITALE,
                    params: {
                        code: validationCode
                    }
                });
            } else {
                setErrorTitle('Aucun rendez-vous trouvé');
                setErrorMessage('Aucun rendez-vous n\'a été trouvé avec ces informations. Vérifiez vos données ou contactez le secrétariat.');
                setErrorModalVisible(true);
            }
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
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
        router.back();
    };

    if (loading) {
        return (
            <ScreenLayout>
                <LoadingIndicator text="Recherche en cours..." />
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
                <Heading className="mb-4 text-center">
                    Recherche par informations
                </Heading>

                <Paragraph className="mb-8 text-center px-4">
                    Saisissez vos informations personnelles pour retrouver votre rendez-vous
                </Paragraph>

                {/* Formulaire */}
                <View className="w-full space-y-6">
                    {/* Champ Nom */}
                    <View>
                        <SubHeading className="mb-3 text-left">Nom de famille</SubHeading>
                        <TextInput
                            className="w-full h-14 bg-white rounded-xl px-4 text-lg shadow border border-gray-200"
                            placeholder="Votre nom de famille"
                            value={nom}
                            onChangeText={(text) => {
                                setNom(text);
                                triggerActivity();
                            }}
                            autoCapitalize="characters"
                            onFocus={triggerActivity}
                            style={{ fontSize: 18 }}
                        />
                    </View>

                    {/* Champ Prénom */}
                    <View>
                        <SubHeading className="mb-3 text-left">Prénom</SubHeading>
                        <TextInput
                            className="w-full h-14 bg-white rounded-xl px-4 text-lg shadow border border-gray-200"
                            placeholder="Votre prénom"
                            value={prenom}
                            onChangeText={(text) => {
                                setPrenom(text);
                                triggerActivity();
                            }}
                            autoCapitalize="words"
                            onFocus={triggerActivity}
                            style={{ fontSize: 18 }}
                        />
                    </View>

                    {/* Champ Date de naissance */}
                    <View>
                        <SubHeading className="mb-3 text-left">Date de naissance</SubHeading>
                        <TextInput
                            className="w-full h-14 bg-white rounded-xl px-4 text-lg shadow border border-gray-200"
                            placeholder="JJ/MM/AAAA"
                            value={dateNaissance}
                            onChangeText={handleDateChange}
                            keyboardType="numeric"
                            maxLength={10}
                            onFocus={triggerActivity}
                            style={{ fontSize: 18 }}
                        />
                        <Text className="text-sm text-gray-500 mt-1 ml-2">
                            Format : JJ/MM/AAAA (ex: 15/03/1980)
                        </Text>
                    </View>
                </View>

                {/* Bouton de recherche */}
                <View className="mt-12">
                    <Button
                        title="Rechercher mon rendez-vous"
                        onPress={handleSearch}
                        variant="primary"
                        disabled={!isFormValid()}
                        className="w-full h-14 justify-center items-center"
                    />
                </View>

                {/* Aide */}
                <View className="mt-8">
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="information-circle-outline" size={20} color="#666" />
                        <Text className="text-sm text-gray-600 ml-2 text-center">
                            Les informations doivent correspondre exactement à celles de votre rendez-vous
                        </Text>
                    </View>
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