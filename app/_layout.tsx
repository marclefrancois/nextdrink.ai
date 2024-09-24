import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from "react";
import { useColorScheme } from '@/hooks/useColorScheme';
import * as SecureStore from "expo-secure-store";
import { Text, View, Button } from 'react-native'; // Ajout de Button

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, setLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const colorScheme = useColorScheme();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        const userName = await SecureStore.getItemAsync("userName");
        console.log("Username from SecureStore:", userName);
        setIsOnboardingComplete(!!userName);
        console.log("isOnboardingComplete set to:", !!userName);
      } catch (e) {
        console.warn(e);
      } 
    }

    prepare();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  console.log("Rendering RootLayout. loaded:", loaded, "isOnboardingComplete:", isOnboardingComplete);

  if (!loaded || isOnboardingComplete === null) {
    return null; // Ou un écran de chargement personnalisé
  }
  
  const resetOnboarding = async () => {
    try {
      await SecureStore.deleteItemAsync("userName");
      setIsOnboardingComplete(false);
      console.log("Onboarding reset");
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  };

  const DebugView = () => (
    <View style={{ position: 'absolute', bottom: 50, left: 10, backgroundColor: 'white', padding: 10, zIndex: 1000 }}>
      <Text>Debug: isOnboardingComplete = {String(isOnboardingComplete)}</Text>
      <Button title="Reset Onboarding" onPress={resetOnboarding} />
    </View>
  );

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {isOnboardingComplete ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen 
            name="onboarding" 
            options={{ headerShown: false }} 
          />
        )}
      </Stack>
      <DebugView />
    </ThemeProvider>
  );
}
