import { signInWithEmail } from '@/src/features/auth/login';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (!email || !password) {
        alert("Please enter both email and password");
        return;
      }
      await signInWithEmail(email, password);
    } catch (error: any) {
      alert(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // Dev bypass function (kept from original)
  const handleBypass = async () => {
    try {
      await signInWithEmail('tturk753@gmail.com', 'Password123.');
    } catch (error) {
      alert("Bypass failed");
    }
  };

  return (
    <View className="flex-1 bg-[#051a1f]">
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          className="px-6"
        >
          {/* Logo Section */}
          <View className="items-center mb-10">
            <View className="relative">
              {/* Glow effect */}
              <View className="absolute top-0 left-0 w-24 h-24 bg-teal-500/20 rounded-full blur-xl" />
              <View className="w-24 h-24 rounded-full border-2 border-teal-400 items-center justify-center bg-[#051a1f] shadow-lg shadow-teal-500/50">
                <TrendingUp size={40} color="#2dd4bf" strokeWidth={2.5} />
              </View>
            </View>
            <Text className="text-teal-400 text-2xl font-bold mt-4 tracking-widest shadow-teal-500/50">
              MONET
            </Text>
          </View>

          {/* Form Card */}
          <View className="w-full bg-[#101e2b] p-6 rounded-3xl shadow-xl border border-slate-800">
            <Text className="text-white text-xl font-semibold text-center mb-8">
              Welcome Back
            </Text>

            <View className="gap-4">
              <View>
                <TextInput
                  className="w-full h-14 bg-[#1a2939] rounded-xl px-4 text-white border border-slate-700 focus:border-teal-500"
                  placeholder="Email"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <TextInput
                  className="w-full h-14 bg-[#1a2939] rounded-xl px-4 text-white border border-slate-700 focus:border-teal-500"
                  placeholder="Password"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                className="w-full h-14 bg-teal-400 rounded-full items-center justify-center mt-2 shadow-lg shadow-teal-500/30"
              >
                <Text className="text-slate-900 font-bold text-lg">
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>

              <View className="items-center mt-4 gap-2">
                <TouchableOpacity>
                  <Text className="text-teal-500/80 text-sm">Forget Password</Text>
                </TouchableOpacity>

                <View className="flex-row">
                  <Link href="../signup" asChild>
                    <TouchableOpacity>
                      <Text className="text-teal-500 font-medium">Create an account</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </View>
          </View>

          {/* Footer / Dev Options */}
          <View className="mt-12">
            <TouchableOpacity
              onPress={handleBypass}
              className="py-2 px-6 rounded-full border border-slate-700 bg-slate-800/50"
            >
              <Text className="text-slate-400 text-xs">Bypass Login (Dev Only)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;