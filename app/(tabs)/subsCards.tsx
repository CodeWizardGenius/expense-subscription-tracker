import { CARD_WIDTH, CreditCard } from '@/src/components/CreditCard';
import { FormInput } from '@/src/components/FormInput';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Constants & Types ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Card {
  id: number;
  card_name: string;
  cutoff_day: number;
  due_day: number;
  created_at: string;
}

// --- Main Screen ---

const SubsCards = () => {
  const { auth } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState({ fetch: true, submit: false });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

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

  const openModal = (card?: Card) => {
    if (card) {
      setEditingCard(card);
      setForm({ name: card.card_name, cutoff: card.cutoff_day.toString(), due: card.due_day.toString() });
    } else {
      setEditingCard(null);
      setForm({ name: '', cutoff: '', due: '' });
    }
    setIsModalVisible(true);
  };

  const handleSaveCard = async () => {
    const { name, cutoff, due } = form;
    if (!name || !cutoff || !due) return Alert.alert('Error', 'Please fill in all fields.');

    const cDay = parseInt(cutoff), dDay = parseInt(due);
    if ([cDay, dDay].some(d => isNaN(d) || d < 1 || d > 31)) return Alert.alert('Error', 'Please enter a valid day (1-31).');

    setLoading(p => ({ ...p, submit: true }));
    try {
      const cardData = {
        card_name: name,
        cutoff_day: cDay,
        due_day: dDay,
        user_id: auth.session?.user.id,
      };

      let error;
      if (editingCard) {
        ({ error } = await supabase.from('credit_cards').update(cardData).eq('id', editingCard.id));
      } else {
        ({ error } = await supabase.from('credit_cards').insert([{ ...cardData, created_at: new Date().toISOString() }]));
      }

      if (error) throw error;

      setIsModalVisible(false);
      fetchCards();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(p => ({ ...p, submit: false }));
    }
  };

  const handleDeleteCard = async () => {
    if (!editingCard) return;

    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(p => ({ ...p, submit: true }));
          try {
            const { error } = await supabase.from('credit_cards').delete().eq('id', editingCard.id);
            if (error) throw error;
            setIsModalVisible(false);
            fetchCards();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setLoading(p => ({ ...p, submit: false }));
          }
        }
      }
    ]);
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
            <TouchableOpacity onPress={() => openModal()} className="p-1"><Plus color="white" size={24} /></TouchableOpacity>
          </View>

          <FlatList
            data={cards}
            horizontal
            pagingEnabled
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            onScroll={e => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width))}
            renderItem={({ item, index }) => (
              <CreditCard
                item={item}
                index={index}
                email={auth.session?.user.email}
                onPress={() => openModal(item)}
              />
            )}
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
                <Text className="text-white text-2xl font-bold">{editingCard ? 'Edit Card' : 'New Card'}</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} className="bg-white/10 p-2 rounded-full"><X color="white" size={20} /></TouchableOpacity>
              </View>

              <View className="gap-6">
                <FormInput label="Card Name" placeholder="e.g. Mastercard" value={form.name} onChangeText={t => setForm(p => ({ ...p, name: t }))} />
                <View className="flex-row gap-4">
                  <FormInput label="Cutoff Day" className="flex-1" keyboardType="numeric" maxLength={2} placeholder="1-31" value={form.cutoff} onChangeText={t => setForm(p => ({ ...p, cutoff: t }))} />
                  <FormInput label="Due Day" className="flex-1" keyboardType="numeric" maxLength={2} placeholder="1-31" value={form.due} onChangeText={t => setForm(p => ({ ...p, due: t }))} />
                </View>

                <View className="gap-3 mt-4">
                  <TouchableOpacity
                    onPress={handleSaveCard}
                    disabled={loading.submit}
                    className="bg-[#00FFFF] py-5 rounded-3xl items-center shadow-lg shadow-[#00FFFF]/30"
                  >
                    {loading.submit ? (
                      <ActivityIndicator color="#0D1A1A" />
                    ) : (
                      <Text className="text-[#0D1A1A] font-black text-lg uppercase">
                        {editingCard ? 'Update Card' : 'Create Card'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {editingCard && (
                    <TouchableOpacity
                      onPress={handleDeleteCard}
                      disabled={loading.submit}
                      className="py-4 items-center"
                    >
                      <Text className="text-red-500 font-bold uppercase tracking-widest">Delete Card</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SubsCards;

