import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────
type Period = 'Week' | 'Month' | 'Year';

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  type: string;
}

interface CategoryStat {
  label: string;
  pct: number;
  amount: number;
  color: string;
}

interface DayStat {
  day: string;
  value: number;
  fullDate: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  food:       '#00f5e0',
  transport:  '#a855f7',
  rent:       '#4ade80',
  shopping:   '#f97316',
  bills:      '#3b82f6',
  health:     '#f43f5e',
  other:      '#facc15',
};

const FALLBACK_COLORS = ['#00f5e0', '#a855f7', '#4ade80', '#f97316', '#3b82f6', '#f43f5e', '#facc15'];

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DONUT_SIZE = 160;
const STROKE_WIDTH = 20;
const RADIUS = (DONUT_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface DonutChartProps {
  categories: CategoryStat[];
  topPct: number;
  topAmount: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ categories, topPct, topAmount }) => {
  let offset = 0;
  return (
    <View style={{ width: DONUT_SIZE, height: DONUT_SIZE, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
        <G rotation="-90" origin={`${DONUT_SIZE / 2},${DONUT_SIZE / 2}`}>
          <Circle
            cx={DONUT_SIZE / 2}
            cy={DONUT_SIZE / 2}
            r={RADIUS}
            stroke="#1a2e2e"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {categories.map((seg, i) => {
            const dash = (seg.pct / 100) * CIRCUMFERENCE;
            const gap = CIRCUMFERENCE - dash;
            const strokeDashoffset = -(offset / 100) * CIRCUMFERENCE;
            offset += seg.pct;
            return (
              <Circle
                key={i}
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={RADIUS}
                stroke={seg.color}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
              />
            );
          })}
        </G>
      </Svg>
      <View className="absolute items-center">
        <Text className="text-white text-xl font-bold">{topPct}%</Text>
        <Text style={{ color: '#4b7070', fontSize: 13 }}>${topAmount.toFixed(0)}</Text>
      </View>
    </View>
  );
};

// ─── Bar Chart ────────────────────────────────────────────────────────────────
const BAR_MAX_H = 110;

interface BarChartProps {
  data: DayStat[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const anims = useRef(data.map(() => new Animated.Value(0))).current;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const activeIndex = data.reduce((maxI, d, i, arr) => d.value > arr[maxI].value ? i : maxI, 0);

  useEffect(() => {
    // reset and re-animate when data changes
    anims.forEach(a => a.setValue(0));
    Animated.stagger(
      55,
      anims.map((a) =>
        Animated.timing(a, {
          toValue: 1,
          duration: 550,
          useNativeDriver: false,
        })
      )
    ).start();
  }, [data]);

  // Y-axis labels based on real max
  const yMax = Math.ceil(maxVal / 100) * 100;
  const yLabels = [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), 0];

  return (
    <View style={{ flexDirection: 'row', marginTop: 8 }}>
      {/* Y Labels */}
      <View style={{ justifyContent: 'space-between', paddingBottom: 20, paddingRight: 8, height: BAR_MAX_H + 20 }}>
        {yLabels.map((l) => (
          <Text key={l} style={{ fontSize: 10, color: '#4b7070' }}>${l}</Text>
        ))}
      </View>

      {/* Bars */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {data.map((d, i) => {
          const isActive = i === activeIndex;
          const barH = anims[i]?.interpolate({
            inputRange: [0, 1],
            outputRange: [0, maxVal > 0 ? (d.value / maxVal) * BAR_MAX_H : 0],
          }) ?? 0;

          return (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              {isActive && (
                <View style={{ backgroundColor: '#00f5e0', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, marginBottom: 5 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#0a0e14' }}>${d.value.toFixed(0)}</Text>
                </View>
              )}
              <View style={{ height: BAR_MAX_H, justifyContent: 'flex-end', width: '70%' }}>
                <Animated.View
                  style={{
                    height: barH,
                    width: '100%',
                    borderRadius: 5,
                    backgroundColor: isActive ? '#00f5e0' : '#1a3d38',
                  }}
                />
              </View>
              <Text style={{ fontSize: 10, marginTop: 4, color: isActive ? '#00f5e0' : '#4b7070', fontWeight: isActive ? '700' : '400' }}>
                {d.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPeriodRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  let from: Date;

  if (period === 'Week') {
    from = new Date(now);
    from.setDate(now.getDate() - 6);
  } else if (period === 'Month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    from = new Date(now.getFullYear(), 0, 1);
  }

  return { from: from.toISOString(), to };
}

function buildBarData(transactions: Transaction[], period: Period): DayStat[] {
  const now = new Date();

  if (period === 'Week') {
    // Last 7 days
    const days: DayStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({ day: DAYS_SHORT[d.getDay()], value: 0, fullDate: d.toDateString() });
    }
    transactions.forEach((t) => {
      const tDate = new Date(t.date).toDateString();
      const found = days.find((d) => d.fullDate === tDate);
      if (found) found.value += t.amount;
    });
    return days;
  }

  if (period === 'Month') {
    // Group by week of month (W1-W4)
    const weeks: DayStat[] = [
      { day: 'W1', value: 0, fullDate: '1' },
      { day: 'W2', value: 0, fullDate: '2' },
      { day: 'W3', value: 0, fullDate: '3' },
      { day: 'W4', value: 0, fullDate: '4' },
    ];
    transactions.forEach((t) => {
      const day = new Date(t.date).getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
      weeks[weekIndex].value += t.amount;
    });
    return weeks;
  }

  // Year: group by month
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthData: DayStat[] = months.map((m, i) => ({ day: m, value: 0, fullDate: String(i) }));
  transactions.forEach((t) => {
    const monthIndex = new Date(t.date).getMonth();
    monthData[monthIndex].value += t.amount;
  });
  return monthData;
}

function buildCategoryStats(transactions: Transaction[]): CategoryStat[] {
  const totals: Record<string, number> = {};
  let grandTotal = 0;

  transactions.forEach((t) => {
    const cat = t.category?.toLowerCase() || 'other';
    totals[cat] = (totals[cat] || 0) + t.amount;
    grandTotal += t.amount;
  });

  if (grandTotal === 0) return [];

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([label, amount], i) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      amount,
      pct: Math.round((amount / grandTotal) * 100),
      color: CATEGORY_COLORS[label] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const Analytics = () => {
  const { auth } = useAuth();
  const [period, setPeriod] = useState<Period>('Month');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async (selectedPeriod: Period) => {
    const userId = auth.session?.user?.id;
    if (!userId) return;

    const { from, to } = getPeriodRange(selectedPeriod);

    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, category, date, note, type')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: true });

    if (!error && data) {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [auth.session?.user?.id]);

  useEffect(() => {
    setLoading(true);
    fetchTransactions(period);
  }, [period, fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(period);
  };

  if (auth.isLoading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator color="#00f5e0" />
      </View>
    );
  }

  // ── Computed stats
  const categoryStats = buildCategoryStats(transactions);
  const barData = buildBarData(transactions, period);
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const topCategory = categoryStats[0];
  const highest = Math.max(...transactions.map((t) => t.amount), 0);
  const average = transactions.length > 0 ? totalAmount / transactions.length : 0;

  return (
    <View className="flex-1 bg-primary">
      {/* Header */}
      <View className="flex-row items-center justify-center px-5 pt-14 pb-3">
        <Text className="text-white text-xl font-bold flex-1 text-center">Analytics</Text>
      </View>

      {/* Period Tabs */}
      <View
        className="mx-5 mb-4 flex-row rounded-full border border-gray-700 p-1"
        style={{ backgroundColor: '#0d1a1a' }}
      >
        {(['Week', 'Month', 'Year'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 99,
              alignItems: 'center',
              backgroundColor: period === p ? '#0d2e2a' : 'transparent',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: period === p ? '#00f5e0' : '#4b7070' }}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00f5e0" />}
      >
        {loading ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <ActivityIndicator color="#00f5e0" size="large" />
            <Text style={{ color: '#4b7070', marginTop: 12, fontSize: 14 }}>Loading analytics...</Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={{ paddingTop: 80, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📊</Text>
            <Text className="text-white text-base font-semibold">No data yet</Text>
            <Text style={{ color: '#4b7070', fontSize: 13, marginTop: 6 }}>
              Add transactions to see your analytics
            </Text>
          </View>
        ) : (
          <>
            {/* ── Spending Breakdown Card ── */}
            <View
              className="rounded-3xl p-5 mb-4 border"
              style={{ backgroundColor: '#0d1a1a', borderColor: '#00f5e010' }}
            >
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-white text-base font-bold">Spending Breakdown</Text>
                <Text style={{ color: '#4b7070', fontSize: 18, letterSpacing: 2 }}>···</Text>
              </View>

              {/* Donut + Legend */}
              <View className="flex-row items-center mb-6">
                <DonutChart
                  categories={categoryStats}
                  topPct={topCategory?.pct ?? 0}
                  topAmount={topCategory?.amount ?? 0}
                />

                <View style={{ flex: 1, paddingLeft: 20, gap: 10 }}>
                  {categoryStats.slice(0, 4).map((cat) => (
                    <View key={cat.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat.color }} />
                      <View>
                        <Text className="text-white text-sm font-semibold">{cat.label}</Text>
                        <Text style={{ color: '#4b7070', fontSize: 12 }}>{cat.pct}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Stats Row */}
              <View className="flex-row rounded-2xl p-4 items-center" style={{ backgroundColor: '#0a0e14' }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, marginBottom: 2 }}>📊</Text>
                  <Text style={{ color: '#4b7070', fontSize: 12, marginBottom: 2 }}>Highest</Text>
                  <Text className="text-white text-lg font-bold">${highest.toFixed(2)}</Text>
                </View>

                <View style={{ width: 1, height: 40, backgroundColor: '#1a2e2e' }} />

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ color: '#4b7070', fontSize: 12, marginBottom: 2 }}>Average</Text>
                  <Text className="text-white text-lg font-bold">${average.toFixed(2)}</Text>
                </View>

                <View style={{ width: 1, height: 40, backgroundColor: '#1a2e2e' }} />

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ color: '#4b7070', fontSize: 12, marginBottom: 2 }}>Total</Text>
                  <Text className="text-white text-lg font-bold">${totalAmount.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            {/* ── Spending Trend Card ── */}
            <View
              className="rounded-3xl p-5 border"
              style={{ backgroundColor: '#0d1a1a', borderColor: '#00f5e010' }}
            >
              <View className="flex-row justify-between items-start mb-5">
                <View>
                  <Text className="text-white text-base font-bold">Spending Trend</Text>
                  <Text style={{ color: '#4b7070', fontSize: 12, marginTop: 2 }}>
                    {period === 'Week' ? 'Last 7 days' : period === 'Month' ? 'This month' : 'This year'}
                  </Text>
                </View>
                <Text style={{ color: '#4b7070', fontSize: 18, letterSpacing: 2 }}>···</Text>
              </View>

              <BarChart data={barData} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Analytics;
