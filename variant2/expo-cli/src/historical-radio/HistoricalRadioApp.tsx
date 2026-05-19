import React, { useState } from 'react';
import { AppModeProvider } from './context/AppModeContext';
import { ResponsiveLayoutProvider } from './context/ResponsiveLayoutContext';
import { HistoricalRadioScreen } from './screens/HistoricalRadioScreen';
import { PlaylistScreen } from './screens/PlaylistScreen';
import type { MilitaryBlock } from './types';

type Screen = 'radio' | 'playlist';

function AppShell() {
  const [screen, setScreen] = useState<Screen>('radio');
  const [selectedBlock, setSelectedBlock] = useState<MilitaryBlock>('СССР');
  const [selectedYear, setSelectedYear] = useState('1943');

  if (screen === 'playlist') {
    return (
      <PlaylistScreen
        selectedBlock={selectedBlock}
        selectedYear={selectedYear}
        onBack={() => setScreen('radio')}
      />
    );
  }

  return (
    <HistoricalRadioScreen
      selectedBlock={selectedBlock}
      selectedYear={selectedYear}
      onSelectBlock={setSelectedBlock}
      onSelectYear={setSelectedYear}
      onOpenPlaylist={() => setScreen('playlist')}
    />
  );
}

export default function HistoricalRadioApp() {
  return (
    <ResponsiveLayoutProvider>
      <AppModeProvider>
        <AppShell />
      </AppModeProvider>
    </ResponsiveLayoutProvider>
  );
}
