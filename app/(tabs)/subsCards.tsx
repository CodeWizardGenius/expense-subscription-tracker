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
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

interface Card {
  id: number;
  card_name: string;
  cutoff_day: number;
  due_day: number;
  created_at: string;
}

const SubsCards = () => {
  const { auth } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // New Card Form State
  const [cardName, setCardName] = useState('');
  const [cutoffDay, setCutoffDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error: any) {
      console.error('Error fetching cards:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!cardName || !cutoffDay || !dueDay) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    const cutoff = parseInt(cutoffDay);
    const due = parseInt(dueDay);

    if (isNaN(cutoff) || cutoff < 1 || cutoff > 31 || isNaN(due) || due < 1 || due > 31) {
      Alert.alert('Hata', 'Lütfen geçerli bir gün girin (1-31).');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .insert([
          {
            card_name: cardName,
            cutoff_day: cutoff,
            due_day: due,
            created_at: new Date().toISOString(),
            user_id: auth.session?.user.id,
          },
        ])
        .select();

      if (error) throw error;

      Alert.alert('Başarılı', 'Kart başarıyla eklendi.');
      setIsModalVisible(false);
      setCardName('');
      setCutoffDay('');
      setDueDay('');
      fetchCards();
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCard = ({ item, index }: { item: Card; index: number }) => {
    // Farklı kartlar için çeşitli gradyanlar
    const gradients = [
      ['#0f172a', '#1e293b'], // Slate
      ['#0d1a1a', '#132626'], // Dark Teal
      ['#1e1b4b', '#312e81'], // Indigo
      ['#1c1917', '#292524'], // Stone
    ];
    const currentGradient = gradients[index % gradients.length];

    return (
      <View style={{ width: CARD_WIDTH }}>
        <LinearGradient
          colors={currentGradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-60 rounded-[32px] p-8 mx-2 border border-white/10 relative overflow-hidden shadow-2xl"
        >


          {/* Üst Kısım: Kart İsmi ve Çip */}
          <View className="flex-row justify-between items-start z-10">
            <View>
              <Text className="text-white/50 text-[10px] uppercase font-bold tracking-[2px] mb-1">Card Name</Text>
              <Text className="text-white text-2xl font-black tracking-tight">{item.card_name}</Text>
            </View>

            {/* Simüle edilmiş altın çip */}
            <View className="w-12 h-9 bg-yellow-600/20 rounded-lg border border-yellow-600/30 items-center justify-center overflow-hidden">
              <View className="absolute inset-0 opacity-20">
                <View className="h-[1px] w-full bg-yellow-400 absolute top-1/3" />
                <View className="h-[1px] w-full bg-yellow-400 absolute top-2/3" />
                <View className="w-[1px] h-full bg-yellow-400 absolute left-1/3" />
                <View className="w-[1px] h-full bg-yellow-400 absolute left-2/3" />
              </View>
              <View className="w-6 h-4 bg-yellow-500/10 rounded-sm border border-yellow-500/20" />
            </View>
          </View>

          {/* Orta Kısım: Simüle edilmiş Kart Numarası */}
          <View className="mt-10 z-10">
            <Text className="text-white text-xl font-medium tracking-[5px] opacity-90">
              ••••  ••••  ••••  ••••
            </Text>
          </View>

          {/* Alt Kısım: Kart Sahibi ve Tarihler */}
          <View className="flex-row justify-between items-end mt-auto z-10">
            <View>
              <Text className="text-white/40 text-[9px] uppercase font-black tracking-[1px] mb-1">Card Holder</Text>
              <Text className="text-white text-sm font-bold tracking-[2px] uppercase">
                {auth.session?.user.email?.split('@')[0] || 'AYHAN YILMAZ'}
              </Text>
            </View>

            <View className="items-end">
              <View className="flex-row gap-4 ">
                <View className="items-center">
                  <Text className="text-white/30 text-[8px] uppercase font-bold mb-0.5">Cutoff</Text>
                  <Text className="text-[#00FFFF] text-xs font-black">{item.cutoff_day}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white/30 text-[8px] uppercase font-bold mb-0.5">Due</Text>
                  <Text className="text-[#00FFFF] text-xs font-black">{item.due_day}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  if (auth.isLoading) {
    return (
      <View className="flex-1 bg-[#0A0E14] items-center justify-center">
        <ActivityIndicator color="#00FFFF" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#112426', '#121314']} className="flex-1">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 items-center justify-center">
          <Text className="text-white text-3xl font-black text-center leading-tight">
            Subscriptions &{"\n"}Cards
          </Text>
        </View>

        {/* Cards Section */}
        <View className="mt-4">
          <View className="flex-row justify-between items-center px-8 mb-4">
            <Text className="text-gray-500 font-bold tracking-widest text-xs uppercase">Cards</Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              className="p-1"
            >
              <Plus color="white" size={24} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - 8 }}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            onScroll={onScroll}
            scrollEventThrottle={16}
            ListEmptyComponent={
              <View style={{ width: CARD_WIDTH }} className="h-52 rounded-3xl border border-dashed border-white/20 items-center justify-center mx-2">
                <Text className="text-white/40">No cards added yet</Text>
              </View>
            }
          />

          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-6 gap-2">
            {cards.length > 0 ? (
              cards.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${index === activeIndex ? 'w-8 bg-[#00FFFF]' : 'w-2 bg-gray-600'}`}
                />
              ))
            ) : (
              <View className="h-2 w-8 rounded-full bg-[#00FFFF]" />
            )}
          </View>
        </View>

        {/* Add Card Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-[#111B1B] rounded-t-[40px] p-8 pb-12 border-t border-white/10">
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-white text-2xl font-bold">New Card</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <View className="bg-white/10 p-2 rounded-full">
                    <X color="white" size={20} />
                  </View>
                </TouchableOpacity>
              </View>

              <View className="gap-6">
                <View>
                  <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Card Name</Text>
                  <TextInput
                    className="bg-white/5 border border-white/10 text-white p-4 rounded-2xl font-medium"
                    placeholder="e.g. Mastercard"
                    placeholderTextColor="#666"
                    value={cardName}
                    onChangeText={setCardName}
                  />
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Cutoff Day</Text>
                    <TextInput
                      className="bg-white/5 border border-white/10 text-white p-6 rounded-2xl font-bold"
                      placeholder="1-31"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={cutoffDay}
                      onChangeText={setCutoffDay}
                      maxLength={2}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Due Day</Text>
                    <TextInput
                      className="bg-white/5 border border-white/10 text-white p-6 rounded-2xl font-bold"
                      placeholder="1-31"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={dueDay}
                      onChangeText={setDueDay}
                      maxLength={2}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleAddCard}
                  disabled={isSubmitting}
                  className="bg-[#00FFFF] py-5 rounded-3xl mt-4 items-center justify-center shadow-lg shadow-[#00FFFF]/30"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#0D1A1A" />
                  ) : (
                    <Text className="text-[#0D1A1A] font-black text-lg uppercase">Create Card</Text>
                  )}
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
