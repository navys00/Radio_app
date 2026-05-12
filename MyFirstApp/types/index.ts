/**
 * Types for RadioEfir application
 */

export interface Station {
  id: string;
  frequency: number; // MHz (e.g., 88.5)
  city: string;
  name: string;
  years: string[]; // Available years for this station
  url?: string; // Stream URL (can be optional if loading dynamically)
}

export interface Track {
  url: string;
  title: string;
  artist: string;
  duration?: number;
  artwork?: string;
}

export type PlayerState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'LOADING';

export interface RadioContextState {
  // UI State
  selectedFrequency: number | null;
  selectedYear: string;
  isPlaying: boolean;
  playerState: PlayerState;

  // Current Station Info
  currentStation: Station | null;
  currentTrack: Track | null;

  // Stations List
  stations: Station[];
  availableYears: string[];

  // Actions
  switchFrequency: (frequency: number) => Promise<void>;
  switchYear: (year: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  stop: () => Promise<void>;
  playNoise: () => Promise<void>;
  initPlayer: () => Promise<void>;
  loadStations: () => Promise<void>;
}

export interface PlayerServiceOptions {
  autoplay?: boolean;
  updateNowPlaying?: boolean;
}
