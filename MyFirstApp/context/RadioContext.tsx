import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Station, RadioContextState } from '../types';
import stationsConfig from '../config/stations.json';
import { storage } from '../storage/storage';
import { playerService } from '../services/playerService';

// Convert JSON to typed stations
const typedStations: Station[] = stationsConfig.stations.map((station: any) => ({
  id: station.id,
  frequency: station.frequency,
  city: station.city,
  name: station.name,
  years: station.years,
  url: station.url,
}));

// Get all unique years from stations, sorted in descending order
const getAllYears = (): string[] => {
  const yearsSet = new Set<string>();
  typedStations.forEach((station) => {
    station.years.forEach((year) => yearsSet.add(year));
  });
  return Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));
};

export const useRadioStore = create<RadioContextState>()(
  devtools(
    (set, get) => ({
      // Initial State
      selectedFrequency: null,
      selectedYear: '',
      isPlaying: false,
      playerState: 'IDLE',
      currentStation: null,
      currentTrack: null,
      stations: typedStations,
      availableYears: getAllYears(),

      // Load stations from config
      loadStations: async () => {
        set({ stations: typedStations, availableYears: getAllYears() });
      },

      // Initialize player and restore state
      initPlayer: async () => {
        try {
          // Initialize player service
          await playerService.initialize();

          // Restore last state
          const savedState = await storage.getState();
          const allYears = getAllYears();
          const defaultYear = allYears[0] || new Date().getFullYear().toString();

          let frequency = savedState.frequency;
          let year = savedState.year || defaultYear;
          let station = null;

          // If no saved frequency, pick the first station
          if (!frequency && typedStations.length > 0) {
            station = typedStations[0];
            frequency = station.frequency;
          } else if (frequency) {
            // Find station by frequency
            station = typedStations.find((s) => s.frequency === frequency) || null;
          }

          set({
            selectedFrequency: frequency || null,
            selectedYear: year,
            currentStation: station,
            playerState: 'IDLE',
          });
        } catch (error) {
          console.error('Error initializing player:', error);
        }
      },

      // Switch to new frequency
      switchFrequency: async (frequency: number) => {
        try {
          const state = get();
          const station = typedStations.find((s) => s.frequency === frequency);

          if (!station) {
            console.warn(`No station found at frequency ${frequency}`);
            return;
          }

          // Check if year is available for this station
          let year = state.selectedYear;
          if (!station.years.includes(year)) {
            year = station.years[0];
          }

          // Stop current and play noise transition
          await playerService.stop();
          await playerService.playNoise();

          // Play new station
          await playerService.playStation(station.id, year);

          // Save state
          await storage.saveState(frequency, year, station.id);

          set({
            selectedFrequency: frequency,
            selectedYear: year,
            currentStation: station,
            isPlaying: true,
            playerState: 'PLAYING',
          });
        } catch (error) {
          console.error('Error switching frequency:', error);
          set({ playerState: 'IDLE', isPlaying: false });
        }
      },

      // Switch year for current station
      switchYear: async (year: string) => {
        try {
          const state = get();
          const currentStation = state.currentStation;

          if (!currentStation) {
            console.warn('No current station selected');
            return;
          }

          if (!currentStation.years.includes(year)) {
            console.warn(`Year ${year} not available for station ${currentStation.id}`);
            return;
          }

          // Stop and play noise
          await playerService.stop();
          await playerService.playNoise();

          // Play station with new year
          await playerService.playStation(currentStation.id, year);

          // Save state
          await storage.saveState(currentStation.frequency, year, currentStation.id);

          set({
            selectedYear: year,
            isPlaying: true,
            playerState: 'PLAYING',
          });
        } catch (error) {
          console.error('Error switching year:', error);
          set({ playerState: 'IDLE', isPlaying: false });
        }
      },

      // Toggle play/pause
      togglePlayPause: async () => {
        try {
          const state = get();

          if (state.isPlaying) {
            await playerService.pause();
            set({ isPlaying: false, playerState: 'PAUSED' });
          } else {
            if (!state.currentStation) {
              // If nothing is selected, play first station
              await get().switchFrequency(typedStations[0].frequency);
            } else {
              await playerService.play();
              set({ isPlaying: true, playerState: 'PLAYING' });
            }
          }
        } catch (error) {
          console.error('Error toggling play/pause:', error);
        }
      },

      // Stop playback
      stop: async () => {
        try {
          await playerService.stop();
          set({ isPlaying: false, playerState: 'IDLE' });
        } catch (error) {
          console.error('Error stopping playback:', error);
        }
      },

      // Play noise (frequency transition sound)
      playNoise: async () => {
        try {
          await playerService.playNoise();
        } catch (error) {
          console.error('Error playing noise:', error);
        }
      },
    }),
    { name: 'RadioStore' },
  ),
);

export default useRadioStore;
