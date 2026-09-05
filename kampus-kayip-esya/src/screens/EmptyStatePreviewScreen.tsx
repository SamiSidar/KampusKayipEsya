import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { EmptyState } from '../components/EmptyState';
import { StudentBottomBar } from '../components/StudentBottomBar';

// ============================================================
// EmptyStatePreviewScreen — Geliştirme amaçlı önizleme ekranı.
//
// EmptyState bileşeninin nasıl göründüğünü denemek için yazılmıştır.
// Uygulama akışında bu ekrana giden bir buton YOKTUR; sadece
// RootNavigator'a kayıtlıdır. Üretim sürümünde kaldırılabilir.
// ============================================================

export function EmptyStatePreviewScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="İlanlar" showBack showNotification backTarget="StudentHome" />

      <View style={styles.content}>
        <EmptyState
          icon="search-outline"
          title="Uygun Eşya Bulunamadı"
          description="Aradığınız kriterlere uygun kayıp eşya kaydı bulunamadı."
        />
      </View>

      <StudentBottomBar activeTab="listings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});