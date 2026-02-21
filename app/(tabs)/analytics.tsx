import { useAuth } from '@/src/contexts/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Food',      pct: 40, color: '#00f5e0' },
  { label: 'Transport', pct: 15, color: '#a855f7' },
  { label: 'Rent',      pct: 30, color: '#4ade80' },
  { label: 'Shopping',  pct: 15, color: '#f97316' },
];

const BAR_DATA = [
  { day: 'Mon', value: 160 },
  { day: 'Tue', value: 200 },
  { day: 'Wed', value: 210 },
  { day: 'Thu', value: 240 },
  { day: 'Fri', value: 320 },
  { day: 'Sat', value: 270 },
  { day: 'Sun', value: 230 },
];

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DONUT_SIZE = 160;
const STROKE_WIDTH = 20;
const RADIUS = (DONUT_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DonutChart: React.FC = () => {
  let offset = 0;
  return (
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
        {CATEGORIES.map((seg, i) => {
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
  );
};

// ─── Bar Chart ────────────────────────────────────────────────────────────────
const MAX_VAL = Math.max(...BAR_DATA.map((d) => d.value));
const BAR_MAX_H = 110;
const ACTIVE_DAY = 'Fri';

const BarChart: React.FC = () => {
  const anims = useRef(BAR_DATA.map(() => new Animated.Value(0))).current;

  useEffect(() => {
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
  }, []);

  return (
    <View style={{ flexDirection: 'row', marginTop: 8 }}>
      <View
        style={{
          justifyContent: 'space-between',
          paddingBottom: 20,
          paddingRight: 8,
          height: BAR_MAX_H + 20,
        }}
      >
        {['$400', '$300', '$200', '$0'].map((l) => (
          <Text key={l} style={{ fontSize: 10, color: '#4b7070' }}>
            {l}
          </Text>
        ))}
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        {BAR_DATA.map((d, i) => {
          const isActive = d.day === ACTIVE_DAY;
          const barH = anims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, (d.value / MAX_VAL) * BAR_MAX_H],
          });

          return (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              {isActive && (
                <View
                  style={{
                    backgroundColor: '#00f5e0',
                    borderRadius: 8,
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    marginBottom: 5,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#0a0e14' }}>
                    ${d.value}
                  </Text>
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

              <Text
                style={{
                  fontSize: 10,
                  marginTop: 4,
                  color: isActive ? '#00f5e0' : '#4b7070',
                  fontWeight: isActive ? '700' : '400',
                }}
              >
                {d.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
type Period = 'Week' | 'Month' | 'Year';

const Analytics = () => {
  const { auth } = useAuth();
  const [period, setPeriod] = useState<Period>('Month');

  if (auth.isLoading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      {/* Header */}
      <View className="flex-row items-center justify-center px-5 pt-14 pb-3">
        <Text className="text-white text-xl font-bold flex-1 text-center">
          Analytics
        </Text>
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
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: period === p ? '#00f5e0' : '#4b7070',
              }}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        {/* Spending Breakdown Card */}
        <View
          className="rounded-3xl p-5 mb-4 border"
          style={{ backgroundColor: '#0d1a1a', borderColor: '#00f5e010' }}
        >
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-white text-base font-bold">
              Spending Breakdown
            </Text>
            <Text style={{ color: '#4b7070', fontSize: 18, letterSpacing: 2 }}>···</Text>
          </View>

          {/* Donut + Legend */}
          <View className="flex-row items-center mb-6">
            <View
              style={{
                width: DONUT_SIZE,
                height: DONUT_SIZE,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DonutChart />
              <View className="absolute items-center">
                <Text className="text-white text-xl font-bold">40%</Text>
                <Text style={{ color: '#4b7070', fontSize: 13 }}>$760</Text>
              </View>
            </View>

            <View style={{ flex: 1, paddingLeft: 20, gap: 10 }}>
              {CATEGORIES.map((cat) => (
                <View
                  key={cat.label}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: cat.color,
                    }}
                  />
                  <View>
                    <Text className="text-white text-sm font-semibold">
                      {cat.label}
                    </Text>
                    <Text style={{ color: '#4b7070', fontSize: 12 }}>
                      {cat.pct}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Stats Row */}
          <View
            className="flex-row rounded-2xl p-4 items-center"
            style={{ backgroundColor: '#0a0e14' }}
          >
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginBottom: 2 }}>📊</Text>
              <Text style={{ color: '#4b7070', fontSize: 12, marginBottom: 2 }}>
                Highest
              </Text>
              <Text className="text-white text-lg font-bold">$320</Text>
            </View>

            <View style={{ width: 1, height: 40, backgroundColor: '#1a2e2e' }} />

            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: '#4b7070', fontSize: 12, marginBottom: 2 }}>
                Average
              </Text>
              <Text className="text-white text-lg font-bold">$85</Text>
            </View>
          </View>
        </View>

        {/* Spending Trend Card */}
        <View
          className="rounded-3xl p-5 border"
          style={{ backgroundColor: '#0d1a1a', borderColor: '#00f5e010' }}
        >
          <View className="flex-row justify-between items-start mb-5">
            <View>
              <Text className="text-white text-base font-bold">Spending Trend</Text>
              <Text style={{ color: '#4b7070', fontSize: 12, marginTop: 2 }}>
                Last 7 days
              </Text>
            </View>
            <Text style={{ color: '#4b7070', fontSize: 18, letterSpacing: 2 }}>···</Text>
          </View>

          <BarChart />
        </View>
      </ScrollView>
    </View>
  );
};

export default Analytics;
