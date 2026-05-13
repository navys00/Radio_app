export type RadioYear = '1941' | '1942' | '1943' | '1944' | '1945';

/** Военно-политический блок эфира (v1: союзники и ось — европейский театр). */
export type BroadcastBloc = 'ussr' | 'allies' | 'axis';

/** Уровень громкости UI / хранилища: 0–100. */
export type VolumeLevel = number;

/** Метаданные трека для фильтрации эфира (эпик V4). */
export type StationTrack = {
  file: string;
  title: string;
  /** Если задано — трек играет только на перечисленных станциях. */
  allowedStationIds?: string[];
  /** Трек не играет на перечисленных станциях. */
  forbiddenStationIds?: string[];
  /** Если задано — трек только при совпадении countryCode станции. */
  allowedCountryCodes?: string[];
};

export type Station = {
  id: string;
  city: string;
  frequency: number;
  bloc: BroadcastBloc;
  /** ISO 3166-1 alpha-2; опционально для фильтрации треков и будущих регионов. */
  countryCode?: string;
  networkId?: string;
  tags?: string[];
  /** При коллизии захвата — меньшее значение важнее (по умолчанию 0). */
  priority?: number;
  years: Record<RadioYear, StationTrack[]>;
};

/** «Пойманная волна» вне списка станций: контент на диапазоне кГц. */
export type OffStationSlot = {
  id: string;
  minKhz: number;
  maxKhz: number;
  /** Если задано — слот активен только в этом блоке эфира. */
  bloc?: BroadcastBloc;
  /** Не показывать в метаданных плеера диапазон кГц (случайная находка). */
  anonymous?: boolean;
  /** Если false — при попадании в диапазон станция всё равно захватывается первой. */
  overridesStationCapture?: boolean;
  years: Partial<Record<RadioYear, StationTrack[]>>;
};

export type StationsConfig = {
  stations: Station[];
  offStationSlots?: OffStationSlot[];
};
