import type { Station } from '../types';
import catalogJson from '../data/audioCatalog.json';

type CatalogFile = { tracks: { id: string }[] };

/** Ключи бандловых треков (Metro: статический require на каждый файл). */
const AUDIO_MODULES = {
  // СССР — речи
  molotov_war_declaration_1941: require('../../../assets/audio/ussr/speech/molotov_war_declaration_1941.mp3'),
  stalingrad_levitin_report_1943: require('../../../assets/audio/ussr/speech/stalingrad_levitin_report_1943.mp3'),
  levitan_9_maya_1945: require('../../../assets/audio/ussr/speech/levitan_9_maya_1945.mp3'),
  // СССР — музыка
  svyashchennaya_voina_1941: require('../../../assets/audio/ussr/svyashchennaya_voina_1941.mp3'),
  chant_des_partisans_anna_marly_1942: require('../../../assets/audio/ussr/chant_des_partisans_anna_marly_1942.mp3'),
  mark_bernes_temnaya_noch_1943: require('../../../assets/audio/ussr/mark_bernes_temnaya_noch_1943.mp3'),
  pesni_voennykh_let_v_lesu_prifrontovom_1942: require('../../../assets/audio/ussr/Pesni_voennykh_let_-_V_Lesu_Prifrontovom_1942.mp3'),
  pesni_voennykh_let_v_zemlyanke_1942: require('../../../assets/audio/ussr/Pesni_voennykh_let_-_V_zemlyanke_1942.mp3'),
  marsh_artilleristov_1943: require('../../../assets/audio/ussr/Ansambl_pesni_i_plyaski_Rossijjskojj_Armii_imeni_A_V_Aleksandrova_-_Marsh_artilleristov_1943.mp3'),
  ussr_secret_signal: require('../../../assets/audio/ussr/secret/battle_for_moscow_1941.mp3'),
  // Ось — речи
  hitler_speech_war_on_ussr_1941: require('../../../assets/audio/axis/speech/hitler_speech_war_on_ussr_1941.mp3'),
  hitler_total_war_speech_1943: require('../../../assets/audio/axis/speech/hitler_total_war_speech_1943.mp3'),
  // Ось — музыка
  faccetta_nera_1938: require('../../../assets/audio/axis/faccetta_nera_1938.mp3'),
  was_wollen_wir_trinken_1941: require('../../../assets/audio/axis/was_wollen_wir_trinken_1941.mp3'),
  la_romance_de_paris_1941_axis: require('../../../assets/audio/axis/la_romance_de_paris_1941.mp3'),
  wagner_valkyrie_ride_1941: require('../../../assets/audio/axis/Vilgelm_Rikhard_Vagner_-_Polet_Valkirijj_1941.mp3'),
  beethoven_moonlight_sonata_1941: require('../../../assets/audio/axis/Lyudvig_van_Betkhoven_-_Lunnaya_sonata_1941.mp3'),
  lili_marleen_1941: require('../../../assets/audio/axis/Marlene_Dietrich_-_Lili_Marleen_1941.mp3'),
  axis_secret_signal: require('../../../assets/audio/axis/secret/was_wollen_wor_trinken_GDR_1941.mp3'),
  // Союзники — речи
  roosevelt_day_of_infamy_speech_1941: require('../../../assets/audio/allies/speech/roosevelt_day_of_infamy_speech_1941.mp3'),
  // Союзники — музыка
  any_bonds_today_1942: require('../../../assets/audio/allies/any_bonds_today_1942.mp3'),
  this_is_the_army_mr_jones_1943: require('../../../assets/audio/allies/this_is_the_army_mr_jones_1943.mp3'),
  la_romance_de_paris_1941: require('../../../assets/audio/allies/la_romance_de_paris_1941.mp3'),
  chant_des_partisans_mestral_1943: require('../../../assets/audio/allies/chant_des_partisans_mestral_1943.mp3'),
  allies_secret_signal: require('../../../assets/audio/allies/secret/sacred_war_1941.mp3'),
  // Радиошум
  hiss_continuous: require('../../../assets/audio/radio-noise/hiss_continuous.mp3'),
  receiver_interference: require('../../../assets/audio/radio-noise/receiver_interference.mp3'),
  tuning_search_static: require('../../../assets/audio/radio-noise/tuning_search_static.mp3'),
} as const;

export type BundledAudioId = keyof typeof AUDIO_MODULES;

export function getAudioModule(id: string): number | undefined {
  return (AUDIO_MODULES as Record<string, number>)[id];
}

export function isBundledAudioId(id: string): id is BundledAudioId {
  return id in AUDIO_MODULES;
}

export const NOISE_LOOP_AUDIO_ID: BundledAudioId = 'receiver_interference';

export function validateStationAudioReferences(stations: Station[]): void {
  const catalogIds = new Set(
    (catalogJson as CatalogFile).tracks.map((t) => t.id)
  );
  for (const s of stations) {
    if (!Array.isArray(s.playlist) || s.playlist.length === 0) {
      throw new Error(`Station ${s.city}: playlist must be a non-empty array`);
    }
    for (const trackId of s.playlist) {
      if (!catalogIds.has(trackId)) {
        throw new Error(`Unknown catalog id "${trackId}" for station ${s.city}`);
      }
      if (!getAudioModule(trackId)) {
        throw new Error(
          `Unknown audio module "${trackId}" for station ${s.city} — add require in audioMap.ts`
        );
      }
    }
  }
}
