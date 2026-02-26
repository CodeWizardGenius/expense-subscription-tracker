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
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Card {
  id: number;
  card_name: string;
  cutoff_day: number;
  due_day: number;
  created_at: string;
}

const SUBSCRIPTIONS = [
  { id: '1', name: 'Netflix', price: 10, color: '#e50914', bg: '#2a0a0a', initial: 'N' },
  { id: '2', name: 'Amazon', price: 8, color: '#ff9900', bg: '#2a1f00', initial: 'a' },
  { id: '3', name: 'Spotify', price: 12, color: '#1db954', bg: '#0a2a12', initial: 'S' },
  { id: '4', name: 'Figma', price: 6, color: '#a259ff', bg: '#1a0a2a', initial: 'F' },
  { id: '5', name: 'iCloud', price: 15, color: '#3b9eff', bg: '#0a1a2a', initial: 'i' },
];

const totalSpending = SUBSCRIPTIONS.reduce((sum, s) => sum + s.price, 0);

const SubscriptionItem = ({ item }: { item: typeof SUBSCRIPTIONS[0] }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111b1b', borderRadius: 16, padding: 14, marginBottom: 10 }}>
    <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
      <Text style={{ color: item.color, fontSize: 20, fontWeight: '900' }}>{item.initial}</Text>
    </View>
    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, flex: 1 }}>{item.name}</Text>
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>{item.price}$ / Ay</Text>
      <Text style={{ color: '#4b5563', fontSize: 11, marginTop: 2 }}>14/10/2025</Text>
    </View>
  </View>
);

const SubsCards = () => {
  const { auth } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState({ fetch: true, submit: false });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
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
      const cardData = { card_name: name, cutoff_day: cDay, due_day: dDay, user_id: auth.session?.user.id };
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
        text: 'Delete', style: 'destructive',
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
    return <View style={{ flex: 1, backgroundColor: '#0A0E14', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#00FFFF" /></View>;
  }

  return (
    <LinearGradient colors={['#112426', '#121314']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '900', textAlign: 'center', lineHeight: 34 }}>{"Subscriptions &\nCards"}</Text>
          </View>

          {/* Cards */}
          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, marginBottom: 16 }}>
              <Text style={{ color: '#6b7280', fontWeight: 'bold', letterSpacing: 3, fontSize: 11, textTransform: 'uppercase' }}>Cards</Text>
              <TouchableOpacity onPress={() => openModal()} style={{ padding: 4 }}><Plus color="white" size={24} /></TouchableOpacity>
            </View>

            <FlatList
              data={cards}
              horizontal
              pagingEnabled={false}
              snapToInterval={CARD_WIDTH + 16}
              snapToAlignment="center"
              decelerationRate="fast"
              onScroll={e => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16)))}
              scrollEventThrottle={16}
              renderItem={({ item, index }) => (
                <CreditCard item={item} index={index} email={auth.session?.user.email} onPress={() => openModal(item)} />
              )}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
              contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 }}
              showsHorizontalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{ width: CARD_WIDTH, height: 200, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.4)' }}>No cards added yet</Text>
                </View>
              }
            />

            {/* Dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 8 }}>
              {(cards.length > 0 ? cards : [null]).map((_, i) => (
                <View key={i} style={{ height: 8, borderRadius: 4, width: i === activeIndex ? 32 : 8, backgroundColor: i === activeIndex ? '#00FFFF' : '#4b5563' }} />
              ))}
            </View>
          </View>

          {/* Subscriptions */}
          <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ color: '#6b7280', fontWeight: 'bold', letterSpacing: 3, fontSize: 11, textTransform: 'uppercase' }}>Subscriptions</Text>
            </View>
            <Text style={{ color: '#00FFFF', fontSize: 13, fontWeight: 'bold', marginBottom: 16 }}>
              Total spending this month: {totalSpending}$
            </Text>
            {SUBSCRIPTIONS.map(item => <SubscriptionItem key={item.id} item={item} />)}
          </View>

        </ScrollView>

        {/* Modal */}
        <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={() => setIsModalVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <View style={{ backgroundColor: '#111B1B', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: 48, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>{editingCard ? 'Edit Card' : 'New Card'}</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 999 }}><X color="white" size={20} /></TouchableOpacity>
              </View>
              <View style={{ gap: 24 }}>
                <FormInput label="Card Name" placeholder="e.g. Mastercard" value={form.name} onChangeText={t => setForm(p => ({ ...p, name: t }))} />
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <FormInput label="Cutoff Day" className="flex-1" keyboardType="numeric" maxLength={2} placeholder="1-31" value={form.cutoff} onChangeText={t => setForm(p => ({ ...p, cutoff: t }))} />
                  <FormInput label="Due Day" className="flex-1" keyboardType="numeric" maxLength={2} placeholder="1-31" value={form.due} onChangeText={t => setForm(p => ({ ...p, due: t }))} />
                </View>
                <View style={{ gap: 12, marginTop: 16 }}>
                  <TouchableOpacity onPress={handleSaveCard} disabled={loading.submit} style={{ backgroundColor: '#00FFFF', paddingVertical: 18, borderRadius: 32, alignItems: 'center' }}>
                    {loading.submit ? <ActivityIndicator color="#0D1A1A" /> : <Text style={{ color: '#0D1A1A', fontWeight: '900', fontSize: 16, textTransform: 'uppercase' }}>{editingCard ? 'Update Card' : 'Create Card'}</Text>}
                  </TouchableOpacity>
                  {editingCard && (
                    <TouchableOpacity onPress={handleDeleteCard} disabled={loading.submit} style={{ paddingVertical: 16, alignItems: 'center' }}>
                      <Text style={{ color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 3 }}>Delete Card</Text>
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
