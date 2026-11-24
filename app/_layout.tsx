import { useEffect } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as Font from 'expo-font';
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces/400Regular_Italic';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { Literata_400Regular } from '@expo-google-fonts/literata/400Regular';
import { Literata_400Regular_Italic } from '@expo-google-fonts/literata/400Regular_Italic';
import { Literata_600SemiBold } from '@expo-google-fonts/literata/600SemiBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useCoreTheme } from '@/design/ThemeProvider';
import { useSettingsStore } from '@/stores/settingsStore';
import { OnboardingView } from '@/onboarding/OnboardingView';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

const FONTS = {
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
};

export default function RootLayout() {
  const { colors, mode } = useCoreTheme();
  const hydrated = useSettingsStore((s) => s.hydrated);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    void Font.loadAsync(FONTS).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    void import('@/services/audio/recording')
      .then(({ cleanupTemporaryAudio }) => cleanupTemporaryAudio())
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void hydrate();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        void import('@/services/random/RandomService')
          .then(({ randomService }) => randomService.flush())
          .catch(() => undefined);
      }
    });
    return () => subscription.remove();
  }, [hydrate]);

  const ready = hydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  if (!onboardingDone) {
    return (
      <KeyboardProvider>
        <GestureHandlerRootView style={styles.fill}>
          <View style={[styles.fill, { backgroundColor: colors.bgBase }]}>
            <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
            <OnboardingView review={false} onDone={completeOnboarding} />
          </View>
        </GestureHandlerRootView>
      </KeyboardProvider>
    );
  }

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={styles.fill}>
        <View style={[styles.fill, { backgroundColor: colors.bgBase }]}>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
