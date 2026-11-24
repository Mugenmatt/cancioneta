import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { TAB_LABELS } from '@/content/app';
import { useCoreTheme } from '@/design/ThemeProvider';
import { getTabBarStyle, tabBarLabelStyle, TAB_ANIMATION } from '@/design/tabBar';
import { fontSizes } from '@/design/tokens';

function TabIcon({ name, color }: { name: keyof typeof Feather.glyphMap; color: string }) {
  return <Feather name={name} size={fontSizes.lead} color={color} />;
}

export default function TabsLayout() {
  const { colors, mode } = useCoreTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.accentCore,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: getTabBarStyle(colors, mode),
        tabBarLabelStyle,
        animation: TAB_ANIMATION,
        sceneStyle: { backgroundColor: colors.bgBase },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: TAB_LABELS.home, tabBarIcon: ({ color }) => <TabIcon name="home" color={color as string} /> }}
      />
      <Tabs.Screen
        name="rimas"
        options={{ title: TAB_LABELS.rhymes, tabBarIcon: ({ color }) => <TabIcon name="search" color={color as string} /> }}
      />
      <Tabs.Screen name="material" options={{ href: null }} />
      <Tabs.Screen
        name="acordes"
        options={{ title: TAB_LABELS.chords, tabBarIcon: ({ color }) => <TabIcon name="music" color={color as string} /> }}
      />
      <Tabs.Screen
        name="juegos"
        options={{ title: TAB_LABELS.games, tabBarIcon: ({ color }) => <TabIcon name="grid" color={color as string} /> }}
      />
      <Tabs.Screen
        name="escribir"
        options={{ title: TAB_LABELS.write, tabBarIcon: ({ color }) => <TabIcon name="edit-3" color={color as string} /> }}
      />
    </Tabs>
  );
}
