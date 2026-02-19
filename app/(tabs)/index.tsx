import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

const dummySpending = {
  categories: [
    { name: "Food", percentage: 45, color: "#00f5e0" },
    { name: "Bills", percentage: 35, color: "#a855f7" },
    { name: "Other", percentage: 20, color: "#f97316" },
  ],
  currentMonth: "Oct",
};

const dummyGoal = {
  current: 3250,
  target: 5000,
  percentage: 65,
};

const dummyTransactions = [
  {
    id: "1",
    name: "Netflix Subscription",
    date: "Today, 10:45 AM",
    amount: -15.99,
    iconBgColor: "#e50914",
    iconText: "N",
  },
  {
    id: "2",
    name: "Amazon Subscription",
    date: "Today, 10:45 AM",
    amount: -10.99,
    iconBgColor: "#000000",
    iconText: "a",
  },
  {
    id: "3",
    name: "Spotify Subscription",
    date: "Today, 10:45 AM",
    amount: -8.99,
    iconBgColor: "#1db954",
    iconText: "S",
  },
  {
    id: "4",
    name: "Figma Subscription",
    date: "Today, 10:45 AM",
    amount: -6.99,
    iconBgColor: "#a259ff",
    iconText: "F",
  },
];

interface DonutChartProps {
  size: number;
  categories: { name: string; percentage: number; color: string }[];
  centerText: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  size,
  categories,
  centerText,
}) => {
  const center = size / 2;
  const radius = (size - 30) / 2;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${center}, ${center}`}>
          {categories.map((category, index) => {
            const strokeDasharray = (category.percentage / 100) * circumference;
            const strokeDashoffset =
              -(accumulatedPercentage / 100) * circumference;
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
  return (
    "$" +
    Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const Index = () => {
  const { auth } = useAuth();

  const user = auth.session?.user;
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";
  const avatarUrl: string | null = user?.user_metadata?.avatar_url ?? null;
  const totalBalance = 12450.0; // TODO: Supabase'den çekilecek

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  if (auth.isLoading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="flex-row justify-between items-center px-5 pt-16 pb-5">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-gray-600 mr-3 items-center justify-center">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <Text className="text-white text-xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            <View>
              <Text className="text-gray-500 text-xs">Welcome back.</Text>
              <Text className="text-white text-lg font-semibold">
                {userName}
              </Text>
            </View>
          </View>

          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="#6b7280"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="#6b7280"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        <View className="mx-5 mb-5">
          <View className="bg-card rounded-3xl p-6 border border-cyan-500/10">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-accent text-lg font-bold mb-1">
                  Total Balance
                </Text>
                <Text className="text-white text-3xl font-bold">
                  {formatCurrency(totalBalance)}
                </Text>
              </View>

              <TouchableOpacity className="bg-accent px-5 py-3 rounded-full">
                <Text className="text-black font-semibold text-sm">
                  + Add Money
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-row mx-5 mb-5 gap-3">
          <View className="flex-1 bg-card-secondary rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-base font-semibold">
                Spending
              </Text>
              <View className="w-6 h-6 rounded-full bg-accent items-center justify-center">
                <Text className="text-black text-xs font-bold">₿</Text>
              </View>
            </View>

            <View className="items-center mb-3">
              <DonutChart
                size={80}
                categories={dummySpending.categories}
                centerText={dummySpending.currentMonth}
              />
            </View>

            <View className="gap-1">
              {dummySpending.categories.map((cat, index) => (
                <View key={index} className="flex-row items-center">
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: cat.color }}
                  />
                  <Text className="text-gray-500 text-xs">{cat.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="flex-1 bg-card-secondary rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-base font-semibold">Goal</Text>
              <Text className="text-base">🚩</Text>
            </View>

            <Text className="text-white text-3xl font-bold mb-1">
              {formatCurrency(dummyGoal.current)}
            </Text>

            <Text className="text-gray-500 text-xs mb-4">
              of {formatCurrency(dummyGoal.target)} target
            </Text>

            <View className="mb-2">
              <View className="bg-progress-bg h-1.5 rounded-full overflow-hidden">
                <View
                  className="bg-progress-fill h-full rounded-full"
                  style={{ width: `${dummyGoal.percentage}%` }}
                />
              </View>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-accent text-xs font-semibold">
                {dummyGoal.percentage}%
              </Text>
              <Text className="text-gray-500 text-xs">Reached</Text>
            </View>
          </View>
        </View>

        <View className="px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-semibold">
              Recent Transactions
            </Text>
            <TouchableOpacity>
              <Text className="text-accent text-sm font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {dummyTransactions.map((transaction) => (
              <View
                key={transaction.id}
                className="flex-row items-center bg-transaction-bg p-4 rounded-2xl"
              >
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: transaction.iconBgColor }}
                >
                  <Text className="text-white text-lg font-bold">
                    {transaction.iconText}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-white text-sm font-medium mb-0.5">
                    {transaction.name}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {transaction.date}
                  </Text>
                </View>

                <Text className="text-white text-base font-semibold">
                  -{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Index;
