import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Car, Check, Delete, House, Pencil, ShoppingBag, TrendingDown, TrendingUp, Utensils
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Constants & Config ---
const CATEGORIES = [
  { id: 'food', name: 'Food', Icon: Utensils },
  { id: 'transport', name: 'Transport', Icon: Car },
  { id: 'rent', name: 'Rent', Icon: House },
  { id: 'shopping', name: 'Shopping', Icon: ShoppingBag },
] as const;

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'delete']
] as const;

// --- Sub-Components ---

interface TypeButtonProps {
  active: boolean;
  label: string;
  Icon: any;
  onPress: () => void;
}

const TypeButton = ({ active, label, Icon, onPress }: TypeButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl ${active ? 'bg-[#003B3B]' : 'bg-transparent'}`}
  >
    <Icon size={18} color={active ? '#00FFFF' : '#666'} strokeWidth={2.5} />
    <Text className={`ml-2 font-bold ${active ? 'text-[#00FFFF]' : 'text-gray-500'}`}>{label}</Text>
  </TouchableOpacity>
);

interface CategoryButtonProps {
  item: typeof CATEGORIES[number];
  isSelected: boolean;
  onPress: () => void;
}

const CategoryButton = ({ item, isSelected, onPress }: CategoryButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`items-center justify-center w-[22%] aspect-square rounded-2xl border ${isSelected ? 'border-[#00FFFF]/50 bg-[#1A2626]' : 'border-gray-800/40 bg-[#141C1C]'}`}
  >
    <View className={`p-2 rounded-lg ${isSelected ? 'bg-[#00FFFF]/10' : ''}`}>
      <item.Icon size={22} color={isSelected ? '#00FFFF' : '#666'} />
    </View>
    <Text className={`text-[9px] font-bold mt-2 uppercase tracking-tighter ${isSelected ? 'text-[#00FFFF]' : 'text-gray-500'}`}>
      {item.name}
    </Text>
  </TouchableOpacity>
);

// --- Main Component ---

const Transactions = () => {
  const { auth } = useAuth();
  const [amount, setAmount] = useState('0');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Keypad Logic
  const handleNumberPress = (val: string) => {
    setAmount(prev => {
      // 1. Prevent more than one decimal point
      if (val === '.' && prev.includes('.')) return prev;

      // 2. Limit maximum digits (prevent overflow)
      if (prev.replace('.', '').length >= 9) return prev;

      // 3. Limit to 2 decimal places
      if (prev.includes('.')) {
        const [, decimal] = prev.split('.');
        if (decimal?.length >= 2) return prev;
      }

      if (prev === '0' && val !== '.') return val;
      if (prev === '0' && val === '.') return '0.';

      return prev + val;
    });
  };

  const handleBackspace = () => setAmount(prev => prev.length <= 1 ? '0' : prev.slice(0, -1));

  const validate = (numericAmount: number): string | null => {
    if (isNaN(numericAmount) || numericAmount <= 0) return 'Lütfen geçerli bir tutar giriniz.';
    if (numericAmount > 100000000) return 'Tutar çok yüksek. Lütfen kontrol ediniz.';
    if (note.length > 200) return 'Notunuz çok uzun (Maksimum 200 karakter).';
    if (!auth.session?.user.id) return 'Lütfen önce giriş yapın.';
    return null;
  };

  const handleConfirm = async () => {
    const numericAmount = parseFloat(amount);
    const errorMsg = validate(numericAmount);

    if (errorMsg) {
      Alert.alert('Hata', errorMsg);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('transactions').insert([{
        user_id: auth.session!.user.id,
        amount: numericAmount,
        type,
        category: selectedCategory,
        note,
        date: new Date().toISOString(),
      }]);

      if (error) throw error;

      Alert.alert('Başarılı', 'İşlem başarıyla kaydedildi.');
      setAmount('0');
      setNote('');
    } catch (error: any) {
      Alert.alert('Hata', `İşlem kaydedilemedi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#112426', '#121314']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-white text-center text-2xl font-extrabold mt-4 mb-6 tracking-tight">Transactions</Text>

          {/* Amount Display */}
          <View className="items-center mb-6">
            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-[3px] mb-2">TOTAL AMOUNT</Text>
            <View className="flex-row items-center">
              <Text className="text-white text-4xl font-semibold">$</Text>
              <Text className="text-white text-4xl font-semibold ml-1">{amount}</Text>
            </View>
          </View>

          {/* Expense / Income Toggle */}
          <View className="flex-row bg-[#1A2626] p-1.5 rounded-2xl mb-6 border border-gray-800/50">
            <TypeButton
              label="Expense"
              Icon={TrendingDown}
              active={type === 'expense'}
              onPress={() => setType('expense')}
            />
            <TypeButton
              label="Income"
              Icon={TrendingUp}
              active={type === 'income'}
              onPress={() => setType('income')}
            />
          </View>

          {/* Category Selector */}
          <View className="flex-row justify-between mb-6">
            {CATEGORIES.map(cat => (
              <CategoryButton
                key={cat.id}
                item={cat}
                isSelected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(cat.id)}
              />
            ))}
          </View>

          {/* Note Input */}
          <View className="flex-row items-center bg-[#141C1C]/80 px-4 py-2 rounded-xl border border-gray-800/50 mb-6">
            <Pencil size={18} color="#444" />
            <TextInput
              className="flex-1 ml-3 text-white font-medium"
              placeholder="Add a note..."
              placeholderTextColor="#333"
              value={note}
              onChangeText={setNote}
            />
          </View>

          {/* Custom Numeric Keypad */}
          <View>
            {KEYPAD.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row justify-around mb-8">
                {row.map(key => (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.6}
                    onPress={() => key === 'delete' ? handleBackspace() : handleNumberPress(key)}
                    className="w-1/3 items-center justify-center"
                  >
                    {key === 'delete' ? (
                      <Delete size={26} color="white" />
                    ) : (
                      <Text className="text-white text-3xl font-medium">{key}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={isLoading}
            activeOpacity={0.8}
            className="bg-[#00F0F0] flex-row items-center justify-center py-5 rounded-[32px] mb-6 shadow-lg shadow-[#00FFFF]/20"
          >
            {isLoading ? (
              <ActivityIndicator color="#0D1515" />
            ) : (
              <>
                <Text className="text-[#0D1515] font-black text-lg mr-2 uppercase">Confirm Transaction</Text>
                <View className="bg-[#0D1515] rounded-full p-0.5">
                  <Check size={16} color="#00F0F0" strokeWidth={4} />
                </View>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Transactions;