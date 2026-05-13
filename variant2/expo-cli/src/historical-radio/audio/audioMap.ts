import type { Station } from '../types';

/** Ключи бандловых треков (Metro требует статический require на каждый файл). */
const AUDIO_MODULES = {
  // СССР
  molotov_war_declaration_1941_06_22: require('../../../assets/audio/ussr/molotov_war_declaration_1941_06_22.mp3'),
  mark_bernes_temnaya_noch: require('../../../assets/audio/ussr/mark_bernes_temnaya_noch.mp3'),
  stalingrad_levitin_report: require('../../../assets/audio/ussr/stalingrad_levitin_report.mp3'),
  chant_des_partisans_anna_marly_1942: require('../../../assets/audio/ussr/chant_des_partisans_anna_marly_1942.mp3'),
  svyashchennaya_voina: require('../../../assets/audio/ussr/svyashchennaya_voina.mp3'),
  // Ось
  hitler_speech_war_on_ussr: require('../../../assets/audio/axis/hitler_speech_war_on_ussr.mp3'),
  faccetta_nera: require('../../../assets/audio/axis/faccetta_nera.mp3'),
  was_wollen_wir_trinken: require('../../../assets/audio/axis/was_wollen_wir_trinken.mp3'),
  hitler_total_war_speech: require('../../../assets/audio/axis/hitler_total_war_speech.mp3'),
  la_romance_de_paris_1941_axis: require('../../../assets/audio/axis/la_romance_de_paris_1941.mp3'),
  // Союзники
  any_bonds_today: require('../../../assets/audio/allies/any_bonds_today.mp3'),
  this_is_the_army_mr_jones: require('../../../assets/audio/allies/this_is_the_army_mr_jones.mp3'),
  la_romance_de_paris_1941: require('../../../assets/audio/allies/la_romance_de_paris_1941.mp3'),
  chant_des_partisans_mestral: require('../../../assets/audio/allies/chant_des_partisans_mestral.mp3'),
  // Радиошум / служебное
  hiss_continuous: require('../../../assets/audio/radio-noise/hiss_continuous.mp3'),
  receiver_interference: require('../../../assets/audio/radio-noise/receiver_interference.mp3'),
  tuning_search_static: require('../../../assets/audio/radio-noise/tuning_search_static.mp3'),
  silence_wav: require('../../../assets/audio/radio-noise/silence.wav'),
} as const;

export type BundledAudioId = keyof typeof AUDIO_MODULES;

export function getAudioModule(id: string): number | undefined {
  return (AUDIO_MODULES as Record<string, number>)[id];
}

export function isBundledAudioId(id: string): id is BundledAudioId {
  return id in AUDIO_MODULES;
}

/** Id зацикленного шума между станциями (MVP). */
export const NOISE_LOOP_AUDIO_ID: BundledAudioId = 'hiss_continuous';

export function validateStationAudioReferences(stations: Station[]): void {
  for (const s of stations) {
    if (!getAudioModule(s.audioId)) {
      throw new Error(`Unknown audioId "${s.audioId}" for station ${s.city}`);
    }
  }
}
