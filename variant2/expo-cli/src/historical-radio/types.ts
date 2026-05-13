export type MilitaryBlock = 'СССР' | 'ОСЬ' | 'Союзники';

export type Station = {
  city: string;
  freq: string;
};

export type StationsByBlock = Record<MilitaryBlock, Station[]>;

