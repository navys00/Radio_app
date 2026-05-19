import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import { useFonts, Oswald_400Regular, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import * as SplashScreen from 'expo-splash-screen';
import HistoricalRadioApp from './src/historical-radio/HistoricalRadioApp';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Oswald_400Regular,
    Oswald_600SemiBold,
    PlayfairDisplay_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <HistoricalRadioApp />
    </View>
  );
}
