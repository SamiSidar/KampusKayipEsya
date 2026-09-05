import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// ============================================================
// InlineError — Form ve ekran içi hata mesajı.
//
// message boşsa hiçbir şey çizmez, doluysa kırmızı bir uyarı satırı
// gösterir. Böylece çağıran tarafta ayrıca koşul yazmaya gerek kalmaz.
// ============================================================

type Props = {
  message: string;
};

export function InlineError({ message }: Props) {
  if (!message) return null;

  return (
    <View style={styles.box}>
      <Ionicons name="alert-circle" size={18} color={colors.error} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
  },
});
