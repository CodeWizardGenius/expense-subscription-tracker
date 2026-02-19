import { signInWithEmail } from '@/src/features/auth/login';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Login = () => {
  const [email, setEmail] = useState<string>('tturk753@gmail.com');
  const [password, setPassword] = useState<string>('Password123.');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>📈</Text>
          </View>
          <Text style={styles.appName}>MONET</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>

          {/* Email */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#6b9a9a"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6b9a9a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#0d2a2a" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Forget Password */}
          <TouchableOpacity style={styles.forgotContainer} activeOpacity={0.7}>
            <Text style={styles.forgotText}>Forget Password</Text>
          </TouchableOpacity>

          {/* Create Account */}
          <Link href="../signup" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.createAccountText}>Create an account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f1f',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#00e5ff',
    backgroundColor: '#0d2e2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#00e5ff',
    letterSpacing: 4,
  },
  card: {
    width: '100%',
    backgroundColor: '#0f2e2e',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#1a4040',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#0d2525',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1a4040',
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#00e5ff',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#0d2a2a',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1,
  },
  forgotContainer: {
    marginTop: 16,
  },
  forgotText: {
    color: '#7ecfcf',
    fontSize: 14,
  },
  createAccountText: {
    color: '#00e5ff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
});

export default Login;