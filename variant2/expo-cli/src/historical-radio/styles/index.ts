import { controlStyles } from './controls';
import { layoutZoneStyles } from './layoutZones';
import { panelStyles } from './panels';
import { radioBodyStyles } from './radioBody';
import { scaleStyles } from './scale';
import { screenStyles } from './screen';
import { stationStyles } from './stations';

export const styles = {
  ...screenStyles,
  ...layoutZoneStyles,
  ...radioBodyStyles,
  ...scaleStyles,
  ...panelStyles,
  ...stationStyles,
  ...controlStyles,
};
