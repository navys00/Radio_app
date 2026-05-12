import TrackPlayer, { Capability, State, RepeatMode } from 'react-native-track-player';
import { Audio } from 'expo-av';

/**
 * Player Service for managing audio playback
 * This is the core service that handles:
 * - Station playback via TrackPlayer
 * - Noise transitions via expo-av
 * - Background playback setup
 */

class PlayerService {
  private isInitialized = false;
  private currentlyPlayingStationId: string | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Check if player is already setup
      const currentTrack = await TrackPlayer.getCurrentTrack();
      if (currentTrack !== null) {
        this.isInitialized = true;
        return;
      }

      // Setup TrackPlayer for background playback
      await TrackPlayer.setupPlayer({
        maxCacheSize: 1024 * 100, // 100 MB
        backBuffer: 0,
      });

      // Configure capabilities (buttons in notification and lock screen)
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackNotification: {
            title: 'RadioEfir',
            message: 'Playing your favorite radio station',
            imageUri: '', // Add your app icon here
          },
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SeekTo,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
      });

      // Set repeat mode to queue (loop current station)
      await TrackPlayer.setRepeatMode(RepeatMode.Queue);

      // Setup audio session for background playback
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.warn('Audio mode setup error (might be normal on some platforms):', error);
      }

      this.isInitialized = true;
      console.log('PlayerService initialized successfully');
    } catch (error) {
      console.error('PlayerService initialization error:', error);
      throw error;
    }
  }

  /**
   * Play a station by ID and year
   * Constructs track URL from station config and plays it
   */
  async playStation(stationId: string, year: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // In Phase 2, this will fetch the actual stream URL
      // For now, we'll create a placeholder track
      const trackUrl = `https://stream.example.com/${stationId}-${year}.m3u8`;

      const track = {
        url: trackUrl,
        title: `Station ${stationId}`,
        artist: `Year ${year}`,
        duration: 0, // Stream duration
        artwork: 'https://via.placeholder.com/150',
      };

      // Clear queue and add new track
      await TrackPlayer.reset();
      await TrackPlayer.add([track]);
      await TrackPlayer.play();

      this.currentlyPlayingStationId = stationId;
      console.log(`Now playing: ${stationId} (${year})`);
    } catch (error) {
      console.error('Error playing station:', error);
      throw error;
    }
  }

  /**
   * Play a noise/transition sound (700ms frequency sweep sound)
   * Uses expo-av Sound API for quick short audio
   */
  async playNoise(): Promise<void> {
    try {
      // In Phase 2, we'll load a real noise file from assets
      // For now, this is a placeholder
      console.log('Playing transition noise...');

      // We'll implement actual noise playback in Phase 2
      // For now, just simulate the delay
      await new Promise((resolve) => setTimeout(resolve, 700));
    } catch (error) {
      console.error('Error playing noise:', error);
      // Don't throw - noise playback failure shouldn't stop the app
    }
  }

  /**
   * Play current track
   */
  async play(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing:', error);
      throw error;
    }
  }

  /**
   * Pause current playback
   */
  async pause(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      await TrackPlayer.pause();
    } catch (error) {
      console.error('Error pausing:', error);
      throw error;
    }
  }

  /**
   * Stop current playback and reset player
   */
  async stop(): Promise<void> {
    try {
      if (!this.isInitialized) {
        return;
      }
      await TrackPlayer.stop();
      this.currentlyPlayingStationId = null;
    } catch (error) {
      console.error('Error stopping:', error);
      throw error;
    }
  }

  /**
   * Reset player and clear queue
   */
  async reset(): Promise<void> {
    try {
      if (!this.isInitialized) {
        return;
      }
      await TrackPlayer.reset();
      this.currentlyPlayingStationId = null;
    } catch (error) {
      console.error('Error resetting player:', error);
      throw error;
    }
  }

  /**
   * Get current playback state
   */
  async getState(): Promise<State> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      return await TrackPlayer.getState();
    } catch (error) {
      console.error('Error getting state:', error);
      return State.None;
    }
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    try {
      if (this.isInitialized) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Error destroying player:', error);
    }
  }
}

export const playerService = new PlayerService();
