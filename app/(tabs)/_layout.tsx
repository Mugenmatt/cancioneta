import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useCoreTheme } from '@/design/ThemeProvider';
import { fonts } from '@/design/tokens';

function TabIcon({ name, color }: { name: keyof typeof Feather.glyphMap; color: string }) {
  return <Feather name={name} size={21} color={color} />;
}

export default function TabsLayout() {
  const { colors } = useCoreTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.accentCore,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bgRaised,
          borderTopColor: colors.lineSubtle,
          borderTopWidth: Platform.select({ ios: 0.5, default: 1 }),
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 10, letterSpacing: 0.2 },
        sceneStyle: { backgroundColor: colors.bgBase },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: ({ color }) => <TabIcon name="home" color={color as string} /> }}
      />
      <Tabs.Screen
        name="rimas"
        options={{ title: 'Rimas', tabBarIcon: ({ color }) => <TabIcon name="search" color={color as string} /> }}
      />
      <Tabs.Screen name="material" options={{ href: null }} />
      <Tabs.Screen
        name="acordes"
        options={{ title: 'Acordes', tabBarIcon: ({ color }) => <TabIcon name="music" color={color as string} /> }}
      />
      <Tabs.Screen
        name="juegos"
        options={{ title: 'Juegos', tabBarIcon: ({ color }) => <TabIcon name="grid" color={color as string} /> }}
      />
      <Tabs.Screen
        name="escribir"
        options={{ title: 'Escribir', tabBarIcon: ({ color }) => <TabIcon name="edit-3" color={color as string} /> }}
      />
    </Tabs>
  );
}
