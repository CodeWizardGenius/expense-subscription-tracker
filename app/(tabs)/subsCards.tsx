import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, X } from 'lucide-react-native';
import React, { memo, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Constants & Types ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

const CARD_GRADIENTS = [
  ['#0f172a', '#1e293b'], // Slate
  ['#0d1a1a', '#132626'], // Dark Teal
  ['#1e1b4b', '#312e81'], // Indigo
  ['#1c1917', '#292524'], // Stone
];

interface Card {
  id: number;
  card_name: string;
  cutoff_day: number;
  due_day: number;
  created_at: string;
}

// --- Sub-Components ---

const CardChip = () => (
  <View className="w-12 h-9 bg-yellow-600/20 rounded-lg border border-yellow-600/30 items-center justify-center overflow-hidden">
    <View className="absolute inset-0 opacity-20">
      {['top-1/3', 'top-2/3'].map(p => <View key={p} className={`h-[1px] w-full bg-yellow-400 absolute ${p}`} />)}
      {['left-1/3', 'left-2/3'].map(p => <View key={p} className={`w-[1px] h-full bg-yellow-400 absolute ${p}`} />)}
    </View>
    <View className="w-6 h-4 bg-yellow-500/10 rounded-sm border border-yellow-500/20" />
  </View>
);

const CreditCard = memo(({ item, index, email }: { item: Card; index: number; email?: string }) => {
  const colors = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const holderName = email?.split('@')[0] || 'AYHAN YILMAZ';

  return (
    <View style={{ width: CARD_WIDTH }}>
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

        <Text className="text-white text-xl font-medium tracking-[5px] opacity-90 mt-4">••••  ••••  ••••  ••••</Text>

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
    </View>
  );
});

const FormInput = ({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) => (
  <View className={props.className}>
    <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">{label}</Text>
    <TextInput
      className="bg-white/5 border border-white/10 text-white p-5 rounded-2xl font-medium"
      placeholderTextColor="#666"
      {...props}
    />
  </View>
);

// --- Main Screen ---

const SubsCards = () => {
  const { auth } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState({ fetch: true, submit: false });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Form State
  const [form, setForm] = useState({ name: '', cutoff: '', due: '' });

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase.from('credit_cards').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCards(data || []);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(p => ({ ...p, fetch: false }));
    }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleAddCard = async () => {
    const { name, cutoff, due } = form;
    if (!name || !cutoff || !due) return Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');

    const cDay = parseInt(cutoff), dDay = parseInt(due);
    if ([cDay, dDay].some(d => isNaN(d) || d < 1 || d > 31)) return Alert.alert('Hata', 'Geçerli gün girin (1-31).');

    setLoading(p => ({ ...p, submit: true }));
    try {
      const { error } = await supabase.from('credit_cards').insert([{
        card_name: name,
        cutoff_day: cDay,
        due_day: dDay,
        created_at: new Date().toISOString(),
        user_id: auth.session?.user.id,
      }]);
      if (error) throw error;

      setIsModalVisible(false);
      setForm({ name: '', cutoff: '', due: '' });
      fetchCards();
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    } finally {
      setLoading(p => ({ ...p, submit: false }));
    }
  };

  if (auth.isLoading || loading.fetch) {
    return <View className="flex-1 bg-[#0A0E14] items-center justify-center"><ActivityIndicator color="#00FFFF" /></View>;
  }

  return (
    <LinearGradient colors={['#112426', '#121314']} className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="px-6 py-4 items-center"><Text className="text-white text-3xl font-black text-center leading-tight">Subscriptions &{"\n"}Cards</Text></View>

        <View className="mt-4">
          <View className="flex-row justify-between items-center px-8 mb-4">
            <Text className="text-gray-500 font-bold tracking-widest text-xs uppercase">Cards</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(true)} className="p-1"><Plus color="white" size={24} /></TouchableOpacity>
          </View>

          <FlatList
            data={cards}
            horizontal
            pagingEnabled
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            onScroll={e => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width))}
            renderItem={({ item, index }) => <CreditCard item={item} index={index} email={auth.session?.user.email} />}
            contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - 8 }}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={<View style={{ width: CARD_WIDTH }} className="h-52 rounded-3xl border border-dashed border-white/20 items-center justify-center mx-2"><Text className="text-white/40">No cards added yet</Text></View>}
          />

          <View className="flex-row justify-center mt-6 gap-2">
            {(cards.length > 0 ? cards : [null]).map((_, i) => (
              <View key={i} className={`h-2 rounded-full ${i === activeIndex ? 'w-8 bg-[#00FFFF]' : 'w-2 bg-gray-600'}`} />
            ))}
          </View>
        </View>

        <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={() => setIsModalVisible(false)}>
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-[#111B1B] rounded-t-[40px] p-8 pb-12 border-t border-white/10">
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-white text-2xl font-bold">New Card</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} className="bg-white/10 p-2 rounded-full"><X color="white" size={20} /></TouchableOpacity>
              </View>

              <View className="gap-6">
                <FormInput label="Card Name" placeholder="e.g. Mastercard" value={form.name} onChangeText={t => setForm(p => ({ ...p, name: t }))} />
                <View className="flex-row gap-4">
                  <FormInput label="Cutoff Day" className="flex-1" keyboardType="numeric" maxLength={2} placeholder="1-31" value={form.cutoff} onChangeText={t => setForm(p => ({ ...p, cutoff: t }))} />
                  <FormInput label="Due Day" className="flex-1" keyboardType="numeric" maxLength={2} placeholder="1-31" value={form.due} onChangeText={t => setForm(p => ({ ...p, due: t }))} />
                </View>

                <TouchableOpacity onPress={handleAddCard} disabled={loading.submit} className="bg-[#00FFFF] py-5 rounded-3xl mt-4 items-center shadow-lg shadow-[#00FFFF]/30">
                  {loading.submit ? <ActivityIndicator color="#0D1A1A" /> : <Text className="text-[#0D1A1A] font-black text-lg uppercase">Create Card</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SubsCards;

