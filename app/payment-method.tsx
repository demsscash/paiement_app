// app/payment-method.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenLayout from '../components/layout/ScreenLayout';
import { Heading, Paragraph } from '../components/ui/Typography';
import { ROUTES } from '../constants/routes';

export default function PaymentMethodScreen() {
    const router = useRouter();
    const [pressedButton, setPressedButton] = useState<'code' | 'search' | null>(null);

    const handleCodeEntry = () => {
        // Rediriger directement vers la page payment qui contient la saisie de code
        router.push(ROUTES.PAYMENT);
    };

    const handlePersonalSearch = () => {
        // Rediriger vers la recherche personnelle pour le paiement
        router.push(ROUTES.PERSONAL_SEARCH);
    };

    return (
        <ScreenLayout centered withPadding={false}>
            {/* Titre */}
            <View className="mb-12">
                <Heading className="text-center text-black mb-4">
                    Comment souhaitez-vous procéder au paiement ?
                </Heading>
                <Paragraph className="text-center px-12 text-base">
                    Choisissez votre méthode d'identification pour le paiement
                </Paragraph>
            </View>

            {/* Boutons de choix - CODE EN PREMIER */}
            <View className="flex-row justify-center items-center px-8">
                {/* Bouton Code - EN PREMIER */}
                <TouchableOpacity
                    onPress={handleCodeEntry}
                    onPressIn={() => setPressedButton('code')}
                    onPressOut={() => setPressedButton(null)}
                    activeOpacity={1}
                    className={`bg-white rounded-2xl flex justify-center items-center w-64 h-56 shadow mx-4 ${pressedButton === 'code' ? '!bg-[#4169E1] scale-95' : ''
                        }`}
                >
                    {/* Icône code */}
                    <View className="mb-6">
                        <View className={`w-14 h-14 rounded-full items-center justify-center ${pressedButton === 'code' ? 'bg-[#4169E1]' : 'bg-white'}`}>
                            <Image
                                source={require('../assets/images/code-icon.png')}
                                style={{
                                    width: 50,
                                    height: 50,
                                    tintColor: pressedButton === 'code' ? 'white' : '#4169E1'
                                }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    <View className="items-center px-3">
                        <Text className={`text-lg font-semibold mb-2 ${pressedButton === 'code' ? 'text-white' : 'text-[#4169E1]'
                            }`}>
                            Avec mon code
                        </Text>
                        <Text className={`text-sm text-center ${pressedButton === 'code' ? 'text-white' : 'text-gray-600'
                            }`}>
                            J'ai reçu un code de paiement
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Bouton Recherche - EN SECOND */}
                <TouchableOpacity
                    onPress={handlePersonalSearch}
                    onPressIn={() => setPressedButton('search')}
                    onPressOut={() => setPressedButton(null)}
                    activeOpacity={1}
                    className={`bg-white rounded-2xl flex justify-center items-center w-64 h-56 shadow mx-4 ${pressedButton === 'search' ? '!bg-[#4169E1] scale-95' : ''
                        }`}
                >
                    {/* Icône recherche */}
                    <View className="mb-6">
                        <View className={`w-14 h-14 rounded-full items-center justify-center ${pressedButton === 'search' ? 'bg-[#4169E1]' : 'bg-white'}`}>
                            <Image
                                source={require('../assets/images/person-icon.png')}
                                style={{
                                    width: 50,
                                    height: 50,
                                    tintColor: pressedButton === 'search' ? 'white' : '#4169E1'
                                }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    <View className="items-center px-3">
                        <Text className={`text-lg font-semibold mb-2 ${pressedButton === 'search' ? 'text-white' : 'text-[#4169E1]'
                            }`}>
                            Recherche par nom
                        </Text>
                        <Text className={`text-sm text-center ${pressedButton === 'search' ? 'text-white' : 'text-gray-600'
                            }`}>
                            Je renseigne mes informations
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Message d'aide */}
            <View className="mt-12">
                <Paragraph className="text-center text-gray-500 text-sm">
                    Pour toute assistance, adressez-vous au secrétariat
                </Paragraph>
            </View>
        </ScreenLayout>
    );
}