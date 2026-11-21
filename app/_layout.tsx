import { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  Fraunces_400Regular, Fraunces_400Regular_Italic, Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { Literata_400Regular, Literata_400Regular_Italic, Literata_600SemiBold } from '@expo-google-fonts/literata';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCoreTheme } from '@/design/ThemeProvider';
import { useSettingsStore } from '@/stores/settingsStore';
import { dataService } from '@/services/data/DataService';
import { randomService } from '@/services/random/RandomService';
import { gameIds } from '@/games/registry';
import { OnboardingView } from '@/onboarding/OnboardingView';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

dataService.registerGamePool(gameIds());

export default function RootLayout() {
  const { colors, mode } = useCoreTheme();
  const hydrated = useSettingsStore((s) => s.hydrated);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_700Bold,
    Literata_400Regular,
    Literata_400Regular_Italic,
    Literata_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    void hydrate();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') void randomService.flush();
    });
    return () => subscription.remove();
  }, [hydrate]);

  const ready = (fontsLoaded || Boolean(fontError)) && hydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  if (!onboardingDone) {
    return (
      <GestureHandlerRootView style={styles.fill}>
        <View style={[styles.fill, { backgroundColor: colors.bgBase }]}>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          <OnboardingView review={false} onDone={completeOnboarding} />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.fill}>
      <View style={[styles.fill, { backgroundColor: colors.bgBase }]}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
