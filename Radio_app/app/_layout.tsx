import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
<<<<<<< HEAD:Radio_app/app/_layout.tsx
import { RadioProvider } from '@/src/context/RadioContext';
=======
import HomeScreen from '@/screens/HomeScreen';

export const unstable_settings = {
  anchor: '(tabs)',
};
>>>>>>> e03c4e50da657f6e00f6f25506205443adbd1e1c:MyFirstApp/app/_layout.tsx

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
<<<<<<< HEAD:Radio_app/app/_layout.tsx
      <RadioProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RadioProvider>
      <StatusBar style="auto" />
=======
      <Stack>
        <Stack.Screen 
          name="index" 
          component={HomeScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
>>>>>>> e03c4e50da657f6e00f6f25506205443adbd1e1c:MyFirstApp/app/_layout.tsx
    </ThemeProvider>
  );
}
