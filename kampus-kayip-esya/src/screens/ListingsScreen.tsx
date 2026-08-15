import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { StudentBottomBar } from '../components/StudentBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { foundItemsService } from '../services/foundItemsService';
import {
  FoundItem,
  getFoundItemCategoryLabel,
  getFoundItemStatusLabel,
} from '../types/foundItem';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const filters = ['Hepsi', 'Kategori', 'Kampüs', 'Tarih', 'Durum'];

export function ListingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();

  const [items, setItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await foundItemsService.getFoundItems(token);
      setItems(data);
    } catch (error) {
      console.error('Eşyalar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleSearch = useCallback(async (text: string) => {
    setSearchText(text);
    if (text.trim().length === 0) {
      loadItems();
      return;
    }
    try {
      setIsLoading(true);
      const data = await foundItemsService.search(text, token);
      setItems(data);
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, loadItems]);

  return (
    <View style={styles.container}>
      <AppHeader title="İlanlar" showBack={false} showNotification />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            style={styles.itemCard}
            onPress={() =>
              navigation.navigate('ItemDetail', {
                itemId: item.id,
              })
            }
          >
            <View style={styles.imagePanel}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.itemImage}
                />
              ) : (
                <View style={[styles.itemImage, styles.imagePlaceholder]}>
                  <Ionicons
                    name="image-outline"
                    size={32}
                    color={colors.textSecondary}
                  />
                </View>
              )}
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.itemInfo}>
              <View style={styles.itemTopRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={colors.textSecondary}
                />
              </View>

              <View style={styles.metaRows}>
                <InfoLine
                  icon="pricetag-outline"
                  label="Kategori"
                  value={getFoundItemCategoryLabel(item.category)}
                />

                <InfoLine
                  icon="location-outline"
                  label="Alan"
                  value={item.location}
                />

                <InfoLine
                  icon="time-outline"
                  label="Tarih"
                  value={item.foundDate}
                />
              </View>
            </View>
          </Pressable>
        )}
        ListHeaderComponent={
          <>
            <View style={styles.searchWrapper}>
              <Ionicons
                name="search-outline"
                size={21}
                color={colors.yeditepeBlue}
                style={styles.searchIcon}
              />

              <TextInput
                placeholder="Arama yapın..."
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
                value={searchText}
                onChangeText={handleSearch}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            >
              {filters.map((filter, index) => {
                const isActive = index === 0;
                const hasArrow =
                  filter === 'Kategori' ||
                  filter === 'Kampüs' ||
                  filter === 'Tarih' ||
                  filter === 'Durum';

                return (
                  <Pressable
                    key={filter}
                    style={[styles.filterChip, isActive && styles.activeFilterChip]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.activeFilterText,
                      ]}
                    >
                      {filter}
                    </Text>

                    {hasArrow ? (
                      <Ionicons
                        name="chevron-down"
                        size={15}
                        color={isActive ? colors.white : colors.textPrimary}
                        style={styles.filterArrow}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sahibi Bekleyen Eşyalar</Text>
              <Text style={styles.sectionHint}>{items.length} eşya</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.yeditepeBlue}
              style={{ marginTop: 20 }}
            />
          ) : (
            <Text style={styles.emptyText}>Eşya bulunamadı</Text>
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <StudentBottomBar activeTab="listings" />
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
    paddingTop: 16,
    paddingBottom: 150,
  },

  searchWrapper: {
    height: 50,
    backgroundColor: colors.card,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 211, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    outlineStyle: 'none' as any,
  },

  filterList: {
    paddingVertical: 14,
    gap: 8,
  },

  filterChip: {
    minHeight: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'rgba(193, 198, 211, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  activeFilterChip: {
    backgroundColor: colors.yeditepeBlue,
    borderColor: colors.yeditepeBlue,
  },

  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  activeFilterText: {
    color: colors.white,
  },

  filterArrow: {
    marginLeft: 4,
  },

  sectionHeader: {
    marginTop: 2,
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

  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  imagePanel: {
    width: 96,
    height: 112,
    borderRadius: 17,
    overflow: 'hidden',
    backgroundColor: '#E7E8F0',
  },

  itemImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 20,
  },

  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(193, 198, 211, 0.45)',
    marginHorizontal: 13,
    borderRadius: 1,
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },

  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  itemTitle: {
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

  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 113, 196, 0.10)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 10,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },
});