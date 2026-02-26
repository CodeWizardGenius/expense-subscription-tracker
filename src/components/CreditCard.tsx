import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CARD_WIDTH = SCREEN_WIDTH * 0.85;

const CARD_GRADIENTS = [
    ['#0f172a', '#1e293b'], // Slate
    ['#0d1a1a', '#132626'], // Dark Teal
    ['#1e1b4b', '#312e81'], // Indigo
    ['#1c1917', '#292524'], // Stone
];

const CardChip = () => (
    <View className="w-12 h-9 bg-yellow-600/20 rounded-lg border border-yellow-600/30 items-center justify-center overflow-hidden">
        <View className="absolute inset-0 opacity-20">
            {['top-1/3', 'top-2/3'].map(p => <View key={p} className={`h-[1px] w-full bg-yellow-400 absolute ${p}`} />)}
            {['left-1/3', 'left-2/3'].map(p => <View key={p} className={`w-[1px] h-full bg-yellow-400 absolute ${p}`} />)}
        </View>
        <View className="w-6 h-4 bg-yellow-500/10 rounded-sm border border-yellow-500/20" />
    </View>
);

interface CreditCardProps {
    item: {
        card_name: string;
        cutoff_day: number;
        due_day: number;
    };
    index: number;
    email?: string;
    onPress?: () => void;
}

export const CreditCard = memo(({ item, index, email, onPress }: CreditCardProps) => {
    const colors = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
    const holderName = email?.split('@')[0] || 'AYHAN YILMAZ';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={{ width: CARD_WIDTH }}
        >
            <LinearGradient
                colors={colors as [string, string, ...string[]]}
                className="h-60 rounded-[32px] p-8 mx-2 border border-white/10 justify-between shadow-2xl overflow-hidden"
            >
                <View className="flex-row justify-between items-start z-10">
                    <View>
                        <Text className="text-white/50 text-[10px] uppercase font-bold tracking-[2px] mb-1">Card Name</Text>
                        <Text className="text-white text-2xl font-black tracking-tight">{item.card_name}</Text>
                    </View>
                    <CardChip />
                </View>

                <Text className="text-white text-xl font-medium tracking-[5px] opacity-90 mt-4">•••• •••• •••• ••••</Text>

                <View className="flex-row justify-between items-end z-10">
                    <View>
                        <Text className="text-white/40 text-[9px] uppercase font-black tracking-[1px] mb-1">Card Holder</Text>
                        <Text className="text-white text-sm font-bold tracking-[2px] uppercase">{holderName}</Text>
                    </View>
                    <View className="flex-row gap-4">
                        {['Cutoff', 'Due'].map(label => (
                            <View key={label} className="items-center">
                                <Text className="text-white/30 text-[8px] uppercase font-bold mb-0.5">{label}</Text>
                                <Text className="text-[#00FFFF] text-xs font-black">
                                    {label === 'Cutoff' ? item.cutoff_day : item.due_day}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
});
