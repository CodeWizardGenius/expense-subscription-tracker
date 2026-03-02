import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Car, CreditCard, Delete, House, ShoppingBag, Utensils } from 'lucide-react-native';
import React, { useCallback, useState } from "react";
import { Image, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

const CATEGORY_COLORS: Record<string, string> = {
  food: "#00f5e0",
  transport: "#a855f7",
  rent: "#f97316",
  shopping: "#eab308",
  other: "#6b7280"
};

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'delete']
] as const;

export const SUBS_DATA = [
  { id: '1', name: 'Netflix', price: 10, color: '#e50914', bg: '#2a0a0a', initial: 'N' },
  { id: '2', name: 'Amazon', price: 8, color: '#ff9900', bg: '#2a1f00', initial: 'a' },
  { id: '3', name: 'Spotify', price: 12, color: '#1db954', bg: '#0a2a12', initial: 'S' },
  { id: '4', name: 'Figma', price: 6, color: '#a259ff', bg: '#1a0a2a', initial: 'F' },
  { id: '5', name: 'iCloud', price: 15, color: '#3b9eff', bg: '#0a1a2a', initial: 'i' },
];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface DonutChartProps {
  size: number;
  categories: { name: string; percentage: number; color: string }[];
  centerText: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ size, categories, centerText }) => {
  const center = size / 2;
  const radius = (size - 30) / 2;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${center}, ${center}`}>
          {categories.map((category, index) => {
            const strokeDasharray = (category.percentage / 100) * circumference;
            const strokeDashoffset = -(accumulatedPercentage / 100) * circumference;
            accumulatedPercentage += category.percentage;

            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={category.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${strokeDasharray} ${circumference - strokeDasharray}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </G>
      </Svg>
      <View className="absolute items-center justify-center">
        <Text className="text-white text-sm font-semibold">{centerText}</Text>
      </View>
    </View>
  );
};

const formatCurrency = (amount: number): string => {
  return "$" + Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Index = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const user = auth.session?.user;

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const avatarUrl: string | null = user?.user_metadata?.avatar_url ?? null;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [spendingCategories, setSpendingCategories] = useState<{name: string, percentage: number, color: string}[]>([]);
  const [currentExpense, setCurrentExpense] = useState(0);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Goal State
  const [targetGoal, setTargetGoal] = useState<number>(5000);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalAmountStr, setGoalAmountStr] = useState('0');

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const txs = data || [];
      setTransactions(txs);

      let balance = 0;
      let monthExpense = 0;
      const catTotals: Record<string, number> = {};

      const currentMonthIndex = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      txs.forEach(tx => {
        if (tx.type === 'income') {
          balance += tx.amount;
        } else {
          balance -= tx.amount;
          const txDate = new Date(tx.date);
          if (txDate.getMonth() === currentMonthIndex && txDate.getFullYear() === currentYear) {
            monthExpense += tx.amount;
            const cat = tx.category || 'other';
            catTotals[cat] = (catTotals[cat] || 0) + tx.amount;
          }
        }
      });

      setTotalBalance(balance);
      setCurrentExpense(monthExpense);

      const chartCategories = Object.keys(catTotals).map(cat => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        percentage: monthExpense > 0 ? (catTotals[cat] / monthExpense) * 100 : 0,
        color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.other,
      }));

      setSpendingCategories(chartCategories.length > 0 ? chartCategories : [{ name: "No Data", percentage: 100, color: "#222" }]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadGoal = async () => {
    try {
      const savedGoal = await SecureStore.getItemAsync('user_goal');
      if (savedGoal) {
        setTargetGoal(parseFloat(savedGoal));
      }
    } catch (error) {
      console.error('Error loading goal:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
      loadGoal();
    }, [user])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  // Keypad Logic
  const handleNumberPress = (val: string) => {
    setGoalAmountStr(prev => {
      if (val === '.' && prev.includes('.')) return prev;
      if (prev.replace('.', '').length >= 9) return prev;
      if (prev === '0' && val !== '.') return val;
      if (prev === '0' && val === '.') return '0.';
      return prev + val;
    });
  };

  const handleBackspace = () => setGoalAmountStr(prev => prev.length <= 1 ? '0' : prev.slice(0, -1));

  const saveGoal = async () => {
    const numericAmount = parseFloat(goalAmountStr);
    if (numericAmount > 0) {
      setTargetGoal(numericAmount);
      await SecureStore.setItemAsync('user_goal', numericAmount.toString());
    }
    setGoalModalVisible(false);
  };

  const openGoalModal = () => {
    setGoalAmountStr(targetGoal.toString());
    setGoalModalVisible(true);
  };

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  if (auth.isLoading || (isLoading && !isRefreshing)) {
    return (
      <LinearGradient colors={['#112426', '#121314']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text className="text-white">Loading Dashboard...</Text>
      </LinearGradient>
    );
  }

  const currentMonthStr = monthNames[new Date().getMonth()];
  const goalPercentage = targetGoal > 0 ? Math.min((currentExpense / targetGoal) * 100, 100) : 0;

  return (
    <LinearGradient colors={['#112426', '#121314']} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#00f5e0" />}
      >
        <View className="flex-row justify-between items-center px-5 pt-16 pb-5">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-gray-600 mr-3 items-center justify-center">
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} className="w-12 h-12 rounded-full" />
              ) : (
                <Text className="text-white text-xl font-bold">{userName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View>
              <Text className="text-gray-500 text-xs">Welcome back.</Text>
              <Text className="text-white text-lg font-semibold">{userName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} className="w-10 h-10 rounded-full items-center justify-center">
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#6b7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M16 17l5-5-5-5" stroke="#6b7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M21 12H9" stroke="#6b7280" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        <View className="mx-5 mb-5">
          <View className="bg-card rounded-3xl p-6 border border-cyan-500/10">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-accent text-lg font-bold mb-1">Total Balance</Text>
                <Text className="text-white text-3xl font-bold">{formatCurrency(totalBalance)}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')} className="bg-accent px-5 py-3 rounded-full">
                <Text className="text-black font-semibold text-sm">+ Add Money</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-row mx-5 mb-5 gap-3">
          {/* Spending Card */}
          <View className="flex-1 bg-card-secondary rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-base font-semibold">Spending</Text>
              <View className="w-6 h-6 rounded-full bg-accent items-center justify-center">
                <Text className="text-black text-xs font-bold">₿</Text>
              </View>
            </View>
            <View className="items-center mb-3">
              <DonutChart size={80} categories={spendingCategories} centerText={currentMonthStr} />
            </View>
            <View className="gap-1">
              {spendingCategories.map((cat, index) => (
                <View key={index} className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                  <Text className="text-gray-500 text-xs">{cat.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Goal Card */}
          <TouchableOpacity activeOpacity={0.7} onPress={openGoalModal} className="flex-1 bg-card-secondary rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-base font-semibold">Goal</Text>
              <Text className="text-base">🚩</Text>
            </View>
            <Text className="text-white text-2xl font-bold mb-1" numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(currentExpense)}
            </Text>
            <Text className="text-gray-500 text-[10px] mb-4">
              of {formatCurrency(targetGoal)} target
            </Text>
            <View className="mb-2">
              <View className="bg-progress-bg h-1.5 rounded-full overflow-hidden">
                <View className="bg-progress-fill h-full rounded-full" style={{ width: `${goalPercentage}%` }} />
              </View>
            </View>
            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-accent text-[11px] font-semibold">{goalPercentage.toFixed(1)}%</Text>
              <Text className="text-gray-500 text-[10px]">Reached</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View className="px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-semibold">Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text className="text-accent text-sm font-medium">Add New</Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {transactions.filter(t => t.type === 'expense').slice(0, 4).map((tx) => {
              const catColor = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.other;
              const txDate = new Date(tx.date);
              const isToday = txDate.toDateString() === new Date().toDateString();
              const dateStr = isToday ? `Today, ${txDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              
              let IconComp = CreditCard;
              if (tx.category === 'food') IconComp = Utensils;
              if (tx.category === 'transport') IconComp = Car;
              if (tx.category === 'rent') IconComp = House;
              if (tx.category === 'shopping') IconComp = ShoppingBag;

              return (
                <View key={tx.id || Math.random().toString()} className="flex-row items-center bg-transaction-bg p-4 rounded-2xl">
                  <View className="w-11 h-11 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${catColor}20` }}>
                    <IconComp size={22} color={catColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-medium mb-0.5" numberOfLines={1}>
                      {tx.note || (tx.category ? tx.category.charAt(0).toUpperCase() + tx.category.slice(1) : 'Expense')}
                    </Text>
                    <Text className="text-gray-500 text-xs">{dateStr}</Text>
                  </View>
                  <Text className="text-white text-base font-semibold">
                    -{formatCurrency(tx.amount)}
                  </Text>
                </View>
              );
            })}

            {transactions.filter(t => t.type === 'expense').length === 0 && (
              <View className="bg-transaction-bg p-6 rounded-2xl items-center justify-center">
                 <Text className="text-gray-500 text-sm">No recent transactions found.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Goal Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={goalModalVisible}
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/80">
          <View className="bg-[#111b1b] rounded-t-[32px] p-6 pb-12 border-t border-cyan-500/20">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">Set Monthly Goal</Text>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)} className="bg-white/10 px-3 py-1.5 rounded-full">
                <Text className="text-gray-300 text-xs font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="items-center mb-8 bg-[#0d1a1a] p-6 rounded-3xl border border-white/5">
              <Text className="text-gray-400 text-[10px] tracking-[2px] uppercase mb-2 font-bold">TARGET AMOUNT</Text>
              <View className="flex-row items-center">
                <Text className="text-[#00f5e0] text-3xl font-semibold">$</Text>
                <Text className="text-white text-5xl font-bold ml-2">{goalAmountStr}</Text>
              </View>
            </View>

            <View className="px-4">
              {KEYPAD.map((row, rowIndex) => (
                <View key={rowIndex} className="flex-row justify-between mb-6">
                  {row.map(key => (
                    <TouchableOpacity
                      key={key}
                      activeOpacity={0.6}
                      onPress={() => key === 'delete' ? handleBackspace() : handleNumberPress(key)}
                      className="w-[30%] items-center justify-center p-3"
                    >
                      {key === 'delete' ? (
                        <Delete size={28} color="#f87171" />
                      ) : (
                        <Text className="text-white text-3xl font-medium">{key}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={saveGoal}
              className="mt-6 bg-[#00f5e0] flex-row items-center justify-center py-4 rounded-3xl shadow-lg shadow-[#00f5e0]/20"
            >
              <Text className="text-[#0a0e14] font-black text-base uppercase tracking-wider">Save Target</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default Index;
