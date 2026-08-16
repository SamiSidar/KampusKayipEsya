import React, { useState } from 'react';
import { Image, ImageProps, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = Omit<ImageProps, 'onError'> & {
  fallbackIconSize?: number;
};

export function ImageWithFallback({ fallbackIconSize = 40, style, ...props }: Props) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View style={[style, styles.fallback]}>
        <Ionicons name="image-outline" size={fallbackIconSize} color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <Image
      {...props}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderLight12,
  },
});
