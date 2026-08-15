import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { AdminBottomBar } from '../components/AdminBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { lostReportsService } from '../services/lostReportsService';
import { LostReport } from '../types/lostReport';
import { FoundItemCategory, getFoundItemCategoryLabel } from '../types/foundItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getCategoryIcon(
  category: FoundItemCategory
): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (category) {
    case 'WALLET':
      return 'wallet-outline';
    case 'KEY':
      return 'key-outline';
    case 'ELECTRONIC':
      return 'headphones';
    case 'BAG':
      return 'bag-personal-outline';
    case 'CARD':
      return 'card-account-details-outline';
    case 'ACCESSORY':
      return 'glasses';
    default:
      return 'package-variant-closed';
  }
}

export function PendingReportsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();

  const [reports, setReports] = useState<LostReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const allReports = await lostReportsService.getLostReports(token);
      // Sadece PENDING_REVIEW olanları göster
      const pending = allReports.filter(r => r.status === 'PENDING_REVIEW');
      setReports(pending);
    } catch (error) {
      console.error('Bekleyen bildiriler yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function goToReview(reportId: number) {
    navigation.navigate('AdminReview', { reportId });
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Bekleyen Bildiriler" showBack showNotification={false} />
        <ActivityIndicator
          size="large"
          color={colors.yeditepeBlue}
          style={{ marginTop: 40 }}
        />
        <AdminBottomBar activeTab="panel" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Bekleyen Bildiriler" showBack showNotification={false} />

      <FlatList
        data={reports}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: report }) => (
          <Pressable
            style={styles.reportCard}
            onPress={() => goToReview(report.id)}
          >
            <View style={styles.iconPanel}>
              <MaterialCommunityIcons
                name={getCategoryIcon(report.category)}
                size={29}
                color={colors.yeditepeBlue}
              />
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.reportContent}>
              <View style={styles.topRow}>
                <Text style={styles.reportTitle} numberOfLines={1}>
                  {report.title}
                </Text>

                <View style={styles.statusBadge}>
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={colors.yeditepeBlue}
                  />
                  <Text style={styles.statusText}>Onay Bekliyor</Text>
                </View>
              </View>

              <View style={styles.metaRows}>
                <InfoLine
                  icon="person-outline"
                  label="Öğrenci"
                  value={report.student?.fullName || 'Bilinmiyor'}
                />
                <InfoLine
                  icon="pricetag-outline"
                  label="Kategori"
                  value={getFoundItemCategoryLabel(report.category)}
                />
                <InfoLine
                  icon="location-outline"
                  label="Alan"
                  value={report.lostLocation}
                />
                <InfoLine
                  icon="calendar-outline"
                  label="Tarih"
                  value={report.lostDate}
                />
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.reviewButton}
                  onPress={() => goToReview(report.id)}
                >
                  <Ionicons
                    name="eye-outline"
                    size={15}
                    color={colors.white}
                  />
                  <Text style={styles.reviewButtonText}>İncele</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        )}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bekleyen Bildiriler</Text>
            <Text style={styles.sectionHint}>{reports.length} bildiri</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Bekleyen bildiri yok</Text>
        }
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <AdminBottomBar activeTab="panel" />
    </View>
  );
}

type InfoLineProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoLine({ icon, label, value }: InfoLineProps) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 185,
  },
  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 30,
  },
  reportCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  iconPanel: {
    width: 72,
    height: 90,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(193, 198, 211, 0.45)',
    marginHorizontal: 13,
    borderRadius: 1,
  },
  reportContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportTitle: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.textPrimary,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },
  metaRows: {
    gap: 5,
    marginTop: 8,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  infoValue: {
    marginLeft: 4,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionRow: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  reviewButton: {
    minHeight: 38,
    paddingHorizontal: 18,
    borderRadius: 19,
    backgroundColor: colors.yeditepeBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  reviewButtonText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '800',
  },
});