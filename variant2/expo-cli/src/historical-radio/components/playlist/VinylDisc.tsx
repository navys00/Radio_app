import React from 'react';
import { View } from 'react-native';
import { playlistStyles } from '../../styles/playlist';

type Props = {
  size?: 'normal' | 'small';
  /** Явный размер диска (для адаптивной вёрстки). */
  discSize?: number;
};

export function VinylDisc({ size = 'normal', discSize }: Props) {
  const small = size === 'small';
  const dim = discSize ?? (small ? 40 : 56);
  const labelDim = Math.round(dim * (small ? 0.3 : 0.32));

  return (
    <View
      style={[
        playlistStyles.vinyl,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
        },
      ]}
    >
      <View
        style={[
          playlistStyles.vinylLabel,
          {
            width: labelDim,
            height: labelDim,
            borderRadius: labelDim / 2,
          },
        ]}
      />
    </View>
  );
}
