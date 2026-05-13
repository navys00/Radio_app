import { StatusBar } from 'expo-status-bar';
import { PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import { useFonts, Oswald_400Regular, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import HistoricalRadioApp from './src/historical-radio/HistoricalRadioApp';

export default function App() {
  const [fontsLoaded] = useFonts({
    Oswald_400Regular,
    Oswald_600SemiBold,
    PlayfairDisplay_700Bold_Italic,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <HistoricalRadioApp />
    </>
  );
}
