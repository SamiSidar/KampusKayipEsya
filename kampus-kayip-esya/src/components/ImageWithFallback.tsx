import React, { useState, useMemo } from 'react';
import { Image, ImageProps, ImageSourcePropType, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { API_BASE_URL } from '../api/apiClient';

type Props = Omit<ImageProps, 'onError'> & {
  fallbackIconSize?: number;
};

/**
 * Backend relative URL'leri (/api/uploads/...) tam URL'e cevirir.
 * Boyle tum ekranlarda ayrica getFullImageUrl() cagirmaya gerek kalmaz.
 */
function resolveSource(source: ImageSourcePropType | undefined): ImageSourcePropType | undefined {
  if (!source) return source;
  if (typeof source === 'number') return source; // require() ile yuklenen local resim
  if (Array.isArray(source)) return source;

  const src = source as { uri?: string };
  if (src.uri && src.uri.startsWith('/api/')) {
    const baseOrigin = API_BASE_URL.replace(/\/api$/, '');
    return { ...src, uri: baseOrigin + src.uri };
  }
  return source;
}

export function ImageWithFallback({ fallbackIconSize = 40, style, source, ...props }: Props) {
  const [hasError, setHasError] = useState(false);
  const resolvedSource = useMemo(() => resolveSource(source), [source]);

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
      source={resolvedSource as ImageSourcePropType}
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
