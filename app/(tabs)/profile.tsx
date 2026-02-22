import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/src/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Moon,
  ShieldCheck,
  Trash2,
  User,
  Wallet,
} from "lucide-react-native";
import React, { useState } from "react";
import { Linking, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatMemberSince = (dateStr?: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `Member since ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const Profile = () => {
  const { auth } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const user = auth.session?.user;
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";
  const memberSince = formatMemberSince(user?.created_at);

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  const handleOpenPrivacy = async () => {
    const url = "https://codewizardgenius.github.io/Privacy-Policy---Expense-Tracker-Eng/";
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.warn("WebBrowser açılamadı, Linking ile deneniyor:", error);
      await Linking.openURL(url);
    }
  };

  if (auth.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#161C1C] items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#161C1C" }}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <Text className="text-white text-2xl font-bold text-center mt-4 mb-6">
          Profile
        </Text>

        {/* Profile Card */}
        <View
          className="rounded-3xl items-center py-8 px-4 mb-6"
          style={{ backgroundColor: "#17282A" }}
        >
          {/* Avatar Circle */}
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: "#D1D5DB" }}
          >
            <User size={60} color="#9CA3AF" fill="#9CA3AF" />
          </View>

          <Text className="text-white text-xl font-bold">{userName}</Text>
          <Text className="text-gray-500 text-xs mt-1">{memberSince}</Text>
        </View>

        {/* App Preferences Label */}
        <Text className="text-white text-base font-semibold mb-3 ml-1">
          App Preferences
        </Text>

        {/* Default Currency */}
        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-4 py-4 mb-3"
          style={{ backgroundColor: "#17282A" }}
          activeOpacity={0.7}
        >
          <View className="w-8 items-center">
            <Wallet size={22} color="#9CA3AF" />
          </View>
          <Text className="text-white text-base ml-2 flex-1">
            Default Currency
          </Text>
          <Text style={{ color: "#06E0F9" }} className="text-base mr-2">
            USD ($)
          </Text>
          <ChevronDown size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Theme */}
        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-4 py-4 mb-3"
          style={{ backgroundColor: "#17282A" }}
          activeOpacity={0.7}
        >
          <View className="w-8 items-center">
            <Moon size={22} color="#9CA3AF" />
          </View>
          <Text className="text-white text-base ml-2 flex-1">Theme</Text>
          <Text style={{ color: "#06E0F9" }} className="text-base mr-2">
            Dark
          </Text>
          <ChevronDown size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Notifications */}
        <View
          className="flex-row items-center rounded-2xl px-4 py-3 mb-3"
          style={{ backgroundColor: "#17282A" }}
        >
          <View className="w-8 items-center">
            <Bell size={22} color="#9CA3AF" />
          </View>
          <Text className="text-white text-base ml-2 flex-1">
            Notifications
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#333434", true: "#06E0F9" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Log out */}
        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-4 py-4 mb-3"
          style={{ backgroundColor: "#17282A" }}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <View className="w-8 items-center">
            <LogOut size={22} color="#9CA3AF" />
          </View>
          <Text className="text-white text-base ml-2 flex-1">Log out</Text>
          <View className="bg-[#2A3435] p-1 rounded">
            <LogOut size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-4 py-4 mb-6"
          style={{ backgroundColor: "#17282A" }}
          activeOpacity={0.7}
        >
          <View className="w-8 items-center">
            <Trash2 size={22} color="#9CA3AF" />
          </View>
          <Text className="text-white text-base ml-2 flex-1">
            Delete Account
          </Text>
          <Text className="text-lg">⚠️</Text>
        </TouchableOpacity>

        {/* Privacy & Policy Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center rounded-3xl px-4 py-4 mb-10"
          style={{ backgroundColor: "#17282A" }}
          onPress={handleOpenPrivacy}
        >
          <View
            style={{
              width: 58,
              height: 62,
              backgroundColor: "#153B3E",
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <ShieldCheck size={28} color="black" />
          </View>
          <Text className="text-white text-lg font-semibold flex-1">
            Privacy & Policy
          </Text>
          <ChevronRight size={24} color="#555" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
