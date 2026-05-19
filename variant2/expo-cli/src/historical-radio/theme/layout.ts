import { Dimensions } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

export const CARD_W = Math.min(SCREEN_W - 32, 390);
