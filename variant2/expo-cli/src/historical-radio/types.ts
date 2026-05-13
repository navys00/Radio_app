export type MilitaryBlock = 'СССР' | 'ОСЬ' | 'Союзники';

export type Station = {
  city: string;
  freq: string;
  /** Числовая частота для привязки ручки «Волна» к шкале 150–1400 кГц */
  khz: number;
  /** Годы, в которые станция «в эфире» для текущего сценария */
  years: string[];
};

export type StationsByBlock = Record<MilitaryBlock, Station[]>;

