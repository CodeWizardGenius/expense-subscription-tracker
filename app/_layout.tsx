import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import "react-native-reanimated";
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

  // Ananymous User
  const AuthStack = () => {
    return (
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
    )
  }


  // Logged In User
  const ProtectedStack = () => {
    return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
    )
  }

  const RootStack = () => {
    const { auth } = useAuth();
    if (auth.session) {
      return (
        <ProtectedStack />
      )
    } else {
      return <AuthStack />
    }
  }


  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "light" ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <RootStack />
        </AuthProvider>
        <StatusBar style="dark" />
        {/* <StatusBar style="auto" /> */}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
