import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import useRadioStore from '../context/RadioContext';

export default function HomeScreen() {
  const store = useRadioStore();

  useEffect(() => {
    // Initialize store on mount
    store.initPlayer();
    store.loadStations();
  }, []);

  const handleFrequencyChange = async (frequency: number) => {
    await store.switchFrequency(frequency);
  };

  const handleYearChange = async (year: string) => {
    await store.switchYear(year);
  };

  const handlePlayPause = async () => {
    await store.togglePlayPause();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>RadioEfir</Text>
          <Text style={styles.subtitle}>Time Machine Radio</Text>
        </View>

        {/* Current Station Info */}
        <View style={styles.stationInfo}>
          {store.currentStation ? (
            <>
              <Text style={styles.stationName}>{store.currentStation.name}</Text>
              <Text style={styles.stationCity}>{store.currentStation.city}</Text>
              <Text style={styles.frequency}>
                {store.selectedFrequency?.toFixed(1)} MHz
              </Text>
            </>
          ) : (
            <Text style={styles.noStation}>No station selected</Text>
          )}
        </View>

        {/* Playback Control */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[styles.playButton, store.isPlaying && styles.playButtonActive]}
            onPress={handlePlayPause}
          >
            <Text style={styles.playButtonText}>
              {store.isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => store.stop()}
          >
            <Text style={styles.stopButtonText}>⏹ STOP</Text>
          </TouchableOpacity>
        </View>

        {/* Frequency Slider (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequency</Text>
          <View style={styles.sliderPlaceholder}>
            <Text style={styles.placeholderText}>
              FrequencySlider component will be here (Etap 3)
            </Text>
          </View>
        </View>

        {/* Year Selector (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Year</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.yearScroll}
          >
            {store.availableYears.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  store.selectedYear === year && styles.yearButtonActive,
                ]}
                onPress={() => handleYearChange(year)}
              >
                <Text
                  style={[
                    styles.yearButtonText,
                    store.selectedYear === year && styles.yearButtonTextActive,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stations List (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Stations</Text>
          {store.stations.slice(0, 5).map((station) => (
            <TouchableOpacity
              key={station.id}
              style={[
                styles.stationListItem,
                store.currentStation?.id === station.id && styles.stationListItemActive,
              ]}
              onPress={() => handleFrequencyChange(station.frequency)}
            >
              <Text style={styles.stationListName}>{station.name}</Text>
              <Text style={styles.stationListFrequency}>
                {station.frequency.toFixed(1)} MHz
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.moreStations}>
            ... and {store.stations.length - 5} more stations
          </Text>
        </View>

        {/* Debug Info */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>Frequency: {store.selectedFrequency}</Text>
          <Text style={styles.debugText}>Year: {store.selectedYear}</Text>
          <Text style={styles.debugText}>Player State: {store.playerState}</Text>
          <Text style={styles.debugText}>Is Playing: {store.isPlaying ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Total Stations: {store.stations.length}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff6600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    fontStyle: 'italic',
  },
  stationInfo: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#ff6600',
    alignItems: 'center',
  },
  stationName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6600',
    marginBottom: 4,
  },
  stationCity: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 12,
  },
  frequency: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  noStation: {
    fontSize: 16,
    color: '#aaa',
  },
  controlsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  playButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff6600',
  },
  playButtonActive: {
    backgroundColor: '#ff6600',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff6600',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6600',
    marginBottom: 12,
  },
  sliderPlaceholder: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#555',
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
  },
  yearScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  yearButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#555',
  },
  yearButtonActive: {
    backgroundColor: '#ff6600',
    borderColor: '#ff6600',
  },
  yearButtonText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  yearButtonTextActive: {
    color: '#fff',
  },
  stationListItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#444',
  },
  stationListItemActive: {
    backgroundColor: '#ff6600',
    borderColor: '#ff6600',
  },
  stationListName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  stationListFrequency: {
    color: '#aaa',
    fontSize: 14,
  },
  moreStations: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  debugSection: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6600',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
