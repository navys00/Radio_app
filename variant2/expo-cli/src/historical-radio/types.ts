export type MilitaryBlock = 'СССР' | 'ОСЬ' | 'Союзники';

export type Station = {
  city: string;
  freq: string;
  /** Числовая частота для привязки ручки «Волна» к шкале 150–1400 кГц */
  khz: number;
  /** Годы, в которые станция «в эфире» для текущего сценария */
  years: string[];
  /**
   * Порядок id из `audioCatalog.json`: первый трек, подходящий под выбранный год
   * (речь — только в год выхода, музыка — с года выпуска по 1945), играет в эфире.
   */
  playlist: string[];
  /** Скрытая станция: не в списке карточек, без отметки на шкале; эфир из `secret/`. */
  secret?: boolean;
};

export type StationsByBlock = Record<MilitaryBlock, Station[]>;

