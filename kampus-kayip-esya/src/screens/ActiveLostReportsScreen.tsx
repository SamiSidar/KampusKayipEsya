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
import { LostReport, getLostReportStatusLabel } from '../types/lostReport';
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

export function ActiveLostReportsScreen() {
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
      // Aktif olanlar: APPROVED veya MATCH_FOUND
      const active = allReports.filter(
        r => r.status === 'APPROVED' || r.status === 'MATCH_FOUND'
      );
      setReports(active);
    } catch (error) {
      console.error('Aktif bildiriler yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader
          title="Aktif Kayıp Bildirileri"
          showBack
          showNotification={false}
        />
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
      <AppHeader
        title="Aktif Kayıp Bildirileri"
        showBack
        showNotification={false}
      />

      <FlatList
        data={reports}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: report }) => {
          const isMatched = report.status === 'MATCH_FOUND';

          return (
            <Pressable
              style={[
                styles.reportCard,
                isMatched && styles.highlightedCard,
              ]}
            >
              {isMatched ? <View style={styles.leftAccent} /> : null}

              <View
                style={[
                  styles.iconPanel,
                  isMatched && styles.highlightedIconPanel,
                ]}
              >
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
                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={colors.textSecondary}
                  />
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

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      isMatched
                        ? styles.matchedStatusBadge
                        : styles.approvedStatusBadge,
                    ]}
                  >
                    <Ionicons
                      name={
                        isMatched
                          ? 'information-circle-outline'
                          : 'checkmark-circle-outline'
                      }
                      size={13}
                      color={isMatched ? colors.yeditepeBlue : colors.success}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        isMatched
                          ? styles.matchedStatusText
                          : styles.approvedStatusText,
                      ]}
                    >
                      {getLostReportStatusLabel(report.status)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.matchBadge,
                      isMatched && styles.matchBadgeActive,
                    ]}
                  >
                    <Ionicons
                      name="git-compare-outline"
                      size={13}
                      color={
                        isMatched
                          ? colors.yeditepeBlue
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.matchBadgeText,
                        isMatched && styles.matchBadgeTextActive,
                      ]}
                    >
                      {isMatched ? 'Eşleşme Var' : 'Benzer Eşya Yok'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.primaryAction}
                    onPress={() =>
                      navigation.navigate('WaitingOwnerItems')
                    }
                  >
                    <Ionicons
                      name="search-outline"
                      size={15}
                      color={colors.white}
                    />
                    <Text style={styles.primaryActionText}>
                      Benzer Eşya Kontrol Et
                    </Text>
                  </Pressable>

                  <Pressable style={styles.secondaryAction}>
                    <Ionicons
                      name="notifications-outline"
                      size={15}
                      color={colors.yeditepeBlue}
                    />
                    <Text style={styles.secondaryActionText}>
                      Bildirim Gönder
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktif Bildiriler</Text>
            <Text style={styles.sectionHint}>{reports.length} bildiri</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aktif bildiri yok</Text>
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
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  highlightedCard: {
    borderWidth: 1,
    borderColor: 'rgba(34, 113, 196, 0.20)',
    shadowColor: colors.yeditepeBlue,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: colors.yeditepeBlue,
  },
  iconPanel: {
    width: 72,
    height: 104,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightedIconPanel: {
    backgroundColor: 'rgba(34, 113, 196, 0.14)',
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
  statusRow: {
    marginTop: 10,
    gap: 7,
    alignItems: 'flex-start',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  approvedStatusBadge: {
    backgroundColor: 'rgba(46, 125, 50, 0.10)',
  },
  matchedStatusBadge: {
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  approvedStatusText: {
    color: colors.success,
  },
  matchedStatusText: {
    color: colors.yeditepeBlue,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2F3FB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  matchBadgeActive: {
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
  },
  matchBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  matchBadgeTextActive: {
    color: colors.yeditepeBlue,
  },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  primaryAction: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 10,
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
  primaryActionText: {
    color: colors.white,
    fontSize: 10.8,
    fontWeight: '800',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 19,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryActionText: {
    color: colors.yeditepeBlue,
    fontSize: 10.8,
    fontWeight: '800',
  },
});