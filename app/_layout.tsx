import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, LogBox, View, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// Ignore the known SafeAreaView deprecation warning coming from dependencies
LogBox.ignoreLogs([
  "SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead.",
]);

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { auth } = useAuth();

  if (auth.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a1f1f', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#00e5ff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {auth.session ? (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </>
      )}
    </Stack>
  );
}
