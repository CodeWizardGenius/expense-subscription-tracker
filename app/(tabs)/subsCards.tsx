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

interface Subscription {
  id: string;
  user_id: string;
  name: string;
  cost: number;
  renewal_day: number;
  active: boolean;
  created_at: string;
}

const SUB_STYLES: Record<string, { color: string; bg: string }> = {
  netflix:  { color: '#e50914', bg: '#2a0a0a' },
  amazon:   { color: '#ff9900', bg: '#2a1f00' },
  spotify:  { color: '#1db954', bg: '#0a2a12' },
  figma:    { color: '#a259ff', bg: '#1a0a2a' },
  icloud:   { color: '#3b9eff', bg: '#0a1a2a' },
  youtube:  { color: '#ff0000', bg: '#2a0000' },
  apple:    { color: '#a0a0a0', bg: '#1a1a1a' },
  discord:  { color: '#5865f2', bg: '#0a0c2a' },
};

const getSubStyle = (name: string) =>
  SUB_STYLES[name.toLowerCase()] ?? { color: '#00FFFF', bg: '#0a2020' };

const SubscriptionItem = ({ item, onPress }: { item: Subscription; onPress: () => void }) => {
  const style = getSubStyle(item.name);
  return (
  <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111b1b', borderRadius: 16, padding: 14, marginBottom: 10, opacity: item.active ? 1 : 0.45 }}>
    <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: style.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
      <Text style={{ color: style.color, fontSize: 20, fontWeight: '900' }}>{item.name.charAt(0).toUpperCase()}</Text>
    </View>
    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, flex: 1 }}>{item.name}</Text>
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>{item.cost}$ / Ay</Text>
      <Text style={{ color: '#4b5563', fontSize: 11, marginTop: 2 }}>Her ayın {item.renewal_day}. günü</Text>
    </View>
  </TouchableOpacity>
  );
};

const SubsCards = () => {
  const { auth } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState({ fetch: true, submit: false });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [form, setForm] = useState({ name: '', cutoff: '', due: '' });

  // Subscription state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [isSubModalVisible, setIsSubModalVisible] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [subForm, setSubForm] = useState({ name: '', cost: '', renewal_day: '' });
  const [subSubmitting, setSubSubmitting] = useState(false);

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

  useEffect(() => { fetchCards(); fetchSubscriptions(); }, []);


  // --- Subscription Handlers ---

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', auth.session!.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setSubsLoading(false);
    }
  };

  const openSubModal = (sub?: Subscription) => {
    if (sub) {
      setEditingSub(sub);
      setSubForm({ name: sub.name, cost: sub.cost.toString(), renewal_day: sub.renewal_day.toString() });
    } else {
      setEditingSub(null);
      setSubForm({ name: '', cost: '', renewal_day: '' });
    }
    setIsSubModalVisible(true);
  };

  const handleSaveSub = async () => {
    const { name, cost, renewal_day } = subForm;
    if (!name || !cost || !renewal_day) return Alert.alert('Error', 'Lütfen tüm alanları doldurun.');
    const costNum = parseFloat(cost);
    const dayNum = parseInt(renewal_day);
    if (isNaN(costNum) || costNum <= 0) return Alert.alert('Error', 'Geçerli bir tutar girin.');
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) return Alert.alert('Error', 'Geçerli bir gün girin (1-31).');
    setSubSubmitting(true);
    try {
      const subData = { user_id: auth.session!.user.id, name, cost: costNum, renewal_day: dayNum, active: true };
      let error;
      if (editingSub) {
        ({ error } = await supabase.from('subscriptions').update(subData).eq('id', editingSub.id));
      } else {
        ({ error } = await supabase.from('subscriptions').insert([subData]));
      }
      if (error) throw error;
      setIsSubModalVisible(false);
      fetchSubscriptions();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSubSubmitting(false);
    }
  };

  const handleDeleteSub = async () => {
    if (!editingSub) return;
    Alert.alert('Aboneliği Sil', 'Emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive',
        onPress: async () => {
          setSubSubmitting(true);
          try {
            const { error } = await supabase.from('subscriptions').delete().eq('id', editingSub.id);
            if (error) throw error;
            setIsSubModalVisible(false);
            fetchSubscriptions();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setSubSubmitting(false);
          }
        }
      }
    ]);
  };

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

  if (auth.isLoading || loading.fetch || subsLoading) {
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
              <TouchableOpacity onPress={() => openSubModal()} style={{ padding: 4 }}>
                <Plus color="white" size={22} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#00FFFF', fontSize: 13, fontWeight: 'bold', marginBottom: 16 }}>
              Bu ay toplam: {subscriptions.filter(s => s.active).reduce((sum, s) => sum + s.cost, 0).toFixed(2)}$
            </Text>
            {subscriptions.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Henüz abonelik yok</Text>
                <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 4 }}>+ butonuna basarak ekleyebilirsin</Text>
              </View>
            ) : (
              subscriptions.map(item => <SubscriptionItem key={item.id} item={item} onPress={() => openSubModal(item)} />)
            )}
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
        {/* Subscription Modal */}
        <Modal visible={isSubModalVisible} animationType="slide" transparent onRequestClose={() => setIsSubModalVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <View style={{ backgroundColor: '#111B1B', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: 48, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>{editingSub ? 'Aboneliği Düzenle' : 'Yeni Abonelik'}</Text>
                <TouchableOpacity onPress={() => setIsSubModalVisible(false)} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 999 }}>
                  <X color="white" size={20} />
                </TouchableOpacity>
              </View>
              <View style={{ gap: 20 }}>
                <FormInput label="Servis Adı" placeholder="ör. Netflix" value={subForm.name} onChangeText={t => setSubForm(p => ({ ...p, name: t }))} />
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <FormInput label="Aylık Ücret ($)" className="flex-1" keyboardType="decimal-pad" placeholder="0.00" value={subForm.cost} onChangeText={t => setSubForm(p => ({ ...p, cost: t }))} />
                  <FormInput label="Yenileme Günü" className="flex-1" keyboardType="numeric" maxLength={2} placeholder="1-31" value={subForm.renewal_day} onChangeText={t => setSubForm(p => ({ ...p, renewal_day: t }))} />
                </View>
                <View style={{ gap: 12, marginTop: 8 }}>
                  <TouchableOpacity onPress={handleSaveSub} disabled={subSubmitting} style={{ backgroundColor: '#00FFFF', paddingVertical: 18, borderRadius: 32, alignItems: 'center' }}>
                    {subSubmitting ? <ActivityIndicator color="#0D1A1A" /> : <Text style={{ color: '#0D1A1A', fontWeight: '900', fontSize: 16, textTransform: 'uppercase' }}>{editingSub ? 'Güncelle' : 'Ekle'}</Text>}
                  </TouchableOpacity>
                  {editingSub && (
                    <TouchableOpacity onPress={handleDeleteSub} disabled={subSubmitting} style={{ paddingVertical: 16, alignItems: 'center' }}>
                      <Text style={{ color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 3 }}>Aboneliği Sil</Text>
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
