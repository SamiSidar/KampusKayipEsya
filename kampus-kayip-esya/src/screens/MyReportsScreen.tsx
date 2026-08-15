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
import { StudentBottomBar } from '../components/StudentBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { lostReportsService } from '../services/lostReportsService';
import { claimRequestsService } from '../services/claimRequestsService';
import {
  LostReport,
  LostReportStatus,
  getLostReportStatusLabel,
} from '../types/lostReport';
import {
  ClaimRequest,
  ClaimRequestStatus,
  getClaimRequestStatusLabel,
} from '../types/claimRequest';
import { FoundItemCategory } from '../types/foundItem';

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

function getReportStatusStyle(status: LostReportStatus) {
  if (status === 'MATCH_FOUND') {
    return {
      wrapper: styles.matchedStatus,
      text: styles.matchedStatusText,
      icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
      iconColor: colors.yeditepeBlue,
    };
  }

  if (status === 'APPROVED') {
    return {
      wrapper: styles.approvedStatus,
      text: styles.approvedStatusText,
      icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
      iconColor: colors.success,
    };
  }

  return {
    wrapper: styles.pendingStatus,
    text: styles.pendingStatusText,
    icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: colors.yeditepeBlue,
  };
}

function getClaimStatusStyle(status: ClaimRequestStatus) {
  if (status === 'APPROVED' || status === 'COMPLETED') {
    return {
      wrapper: styles.approvedStatus,
      text: styles.approvedStatusText,
      icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
      iconColor: colors.success,
    };
  }

  if (status === 'REJECTED') {
    return {
      wrapper: styles.rejectedStatus,
      text: styles.rejectedStatusText,
      icon: 'close-circle-outline' as keyof typeof Ionicons.glyphMap,
      iconColor: colors.error,
    };
  }

  return {
    wrapper: styles.pendingStatus,
    text: styles.pendingStatusText,
    icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: colors.yeditepeBlue,
  };
}

export function MyReportsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();

  const [reports, setReports] = useState<LostReport[]>([]);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [reportsData, claimsData] = await Promise.all([
        lostReportsService.getMyReports(token),
        claimRequestsService.getMyClaimRequests(token),
      ]);
      setReports(reportsData);
      setClaims(claimsData);
    } catch (error) {
      console.error('Veriler yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Bildirilerim" showBack={false} showNotification />
        <ActivityIndicator
          size="large"
          color={colors.yeditepeBlue}
          style={{ marginTop: 40 }}
        />
        <StudentBottomBar activeTab="reports" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Bildirilerim" showBack={false} showNotification />

      <FlatList
        data={reports}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: report }) => {
          const statusStyle = getReportStatusStyle(report.status);
          const isMatched = report.status === 'MATCH_FOUND';

          return (
            <Pressable
              style={[
                styles.reportCard,
                isMatched && styles.highlightedCard,
              ]}
              onPress={() =>
                navigation.navigate('StudentReportDetail', {
                  reportId: report.id,
                })
              }
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
                    icon="location-outline"
                    label="Aranan"
                    value={report.lostLocation}
                  />
                  <InfoLine
                    icon="calendar-outline"
                    label="Tarih"
                    value={report.lostDate}
                  />
                </View>

                <View style={[styles.statusBadge, statusStyle.wrapper]}>
                  <Ionicons
                    name={statusStyle.icon}
                    size={14}
                    color={statusStyle.iconColor}
                  />
                  <Text style={[styles.statusText, statusStyle.text]}>
                    {getLostReportStatusLabel(report.status)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kayıp Eşya Bildirilerim</Text>
            <Text style={styles.sectionHint}>{reports.length} bildiri</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz kayıp bildiriniz yok</Text>
        }
        ListFooterComponent={
          <>
            <View style={[styles.sectionHeader, { marginTop: 28 }]}>
              <Text style={styles.sectionTitle}>Teslim Taleplerim</Text>
              <Text style={styles.sectionHint}>{claims.length} talep</Text>
            </View>

            {claims.length === 0 ? (
              <Text style={styles.emptyText}>Henüz teslim talebiniz yok</Text>
            ) : (
              claims.map(claim => {
                const statusStyle = getClaimStatusStyle(claim.status);

                return (
                  <Pressable
                    key={`claim-${claim.id}`}
                    style={[styles.reportCard, { marginBottom: 14 }]}
                    onPress={() =>
                      navigation.navigate('ItemDetail', {
                        itemId: claim.item.id,
                      })
                    }
                  >
                    <View style={styles.iconPanel}>
                      <MaterialCommunityIcons
                        name={getCategoryIcon(claim.item.category)}
                        size={29}
                        color={colors.yeditepeBlue}
                      />
                    </View>

                    <View style={styles.verticalDivider} />

                    <View style={styles.reportContent}>
                      <View style={styles.topRow}>
                        <Text style={styles.reportTitle} numberOfLines={1}>
                          {claim.item.title}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={19}
                          color={colors.textSecondary}
                        />
                      </View>

                      <View style={styles.metaRows}>
                        <InfoLine
                          icon="location-outline"
                          label="Yer"
                          value={claim.item.location}
                        />
                        <InfoLine
                          icon="calendar-outline"
                          label="Talep"
                          value={claim.createdAt}
                        />
                      </View>

                      <View style={[styles.statusBadge, statusStyle.wrapper]}>
                        <Ionicons
                          name={statusStyle.icon}
                          size={14}
                          color={statusStyle.iconColor}
                        />
                        <Text style={[styles.statusText, statusStyle.text]}>
                          {getClaimRequestStatusLabel(claim.status)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </>
        }
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <StudentBottomBar activeTab="reports" />
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
    paddingBottom: 145,
  },

  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 10,
    marginBottom: 10,
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
    height: 86,
    borderRadius: 17,
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
    gap: 6,
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

  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  pendingStatus: {
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
  },

  pendingStatusText: {
    color: colors.yeditepeBlue,
  },

  matchedStatus: {
    backgroundColor: 'rgba(34, 113, 196, 0.12)',
  },

  matchedStatusText: {
    color: colors.yeditepeBlue,
  },

  approvedStatus: {
    backgroundColor: 'rgba(46, 125, 50, 0.10)',
  },

  approvedStatusText: {
    color: colors.success,
  },

  rejectedStatus: {
    backgroundColor: 'rgba(211, 47, 47, 0.10)',
  },

  rejectedStatusText: {
    color: colors.error,
  },
});