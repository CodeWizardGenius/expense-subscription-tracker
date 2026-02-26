import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CARD_WIDTH = SCREEN_WIDTH * 0.85;

const CARD_GRADIENTS = [
    ['#0f172a', '#1e293b'],
    ['#0d1a1a', '#132626'],
    ['#1e1b4b', '#312e81'],
    ['#1c1917', '#292524'],
];

const CardChip = () => (
    <View style={{ width: 48, height: 36, backgroundColor: 'rgba(161,98,7,0.2)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(161,98,7,0.3)', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 24, height: 16, backgroundColor: 'rgba(234,179,8,0.1)', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(234,179,8,0.2)' }} />
    </View>
);

interface CreditCardProps {
    item: { card_name: string; cutoff_day: number; due_day: number; };
    index: number;
    email?: string;
    onPress?: () => void;
}

export const CreditCard = memo(({ item, index, email, onPress }: CreditCardProps) => {
    const colors = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
    const holderName = email?.split('@')[0]?.toUpperCase() || 'CARD HOLDER';

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ width: CARD_WIDTH }}>
            <LinearGradient
                colors={colors as [string, string, ...string[]]}
                style={{ height: 220, borderRadius: 32, padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'space-between', overflow: 'hidden' }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Card Name</Text>
                        <Text style={{ color: 'white', fontSize: 22, fontWeight: '900' }}>{item.card_name}</Text>
                    </View>
                    <CardChip />
                </View>

                <Text style={{ color: 'white', fontSize: 18, letterSpacing: 4, opacity: 0.8 }}>•••• •••• •••• ••••</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View>
                        <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Card Holder</Text>
                        <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' }}>{holderName}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        {[{ label: 'Cutoff', value: item.cutoff_day }, { label: 'Due', value: item.due_day }].map(({ label, value }) => (
                            <View key={label} style={{ alignItems: 'center' }}>
                                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 }}>{label}</Text>
                                <Text style={{ color: '#00FFFF', fontSize: 12, fontWeight: '900' }}>{value}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
});
