import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { StudentBottomBar } from '../components/StudentBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { foundItemsService } from '../services/foundItemsService';
import { FoundItem } from '../types/foundItem';

// ============================================================
// StudentHomeScreen — Öğrenci ana sayfa ekranı.
//
// Backend bağlantısı:
// 1. useAuth() ile token alınır
// 2. useEffect içinde foundItemsService.getFoundItems(token) çağrılır
// 3. Backend GET /api/found-items endpoint'ine istek gider
// 4. Dönen veri useState ile saklanır ve ekranda gösterilir
// ============================================================

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function StudentHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();

  // Adım 1: State tanımla — backend'den gelecek veriyi burada tutarız
  const [items, setItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Adım 2: Ekran açıldığında backend'den veri çek
  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      // Adım 3: Servis çağrısı → apiClient → backend
      const data = await foundItemsService.getFoundItems(token);
      setItems(data);
    } catch (error) {
      console.error('Eşyalar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Kampüs Kayıp Eşya"
        showBack={false}
        showNotification
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.blueBackground} />

        <Pressable
          style={styles.reportCard}
          onPress={() => navigation.navigate('LostReport')}
        >
          <View style={styles.reportIconWrap}>
            <MaterialCommunityIcons
              name="archive-search-outline"
              size={74}
              color={colors.yeditepeBlue}
            />
          </View>

          <Text style={styles.reportTitle}>Kayıp Eşya Bildir</Text>
          <Text style={styles.reportDescription}>
            Eşyanı kaybettiysen hemen bildir
          </Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son Eklenen Eşyalar</Text>

          <Pressable onPress={() => navigation.navigate('Listings')}>
            <Text style={styles.seeAllText}>Tümü</Text>
          </Pressable>
        </View>

        {/* Adım 4: Backend'den gelen veriyi göster */}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.yeditepeBlue}
            style={{ marginTop: 20 }}
          />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>Henüz bulunan eşya yok</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
          >
            {items.map(item => (
              <Pressable
                key={item.id}
                style={styles.itemCard}
                onPress={() =>
                  navigation.navigate('ItemDetail', {
                    itemId: item.id,
                  })
                }
              >
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                  />
                ) : (
                  <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                    <MaterialCommunityIcons
                      name="image-off-outline"
                      size={32}
                      color={colors.textSecondary}
                    />
                  </View>
                )}

                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text style={styles.itemLabel}>Bulunduğu Yer:</Text>
                  <Text style={styles.itemValue} numberOfLines={1}>
                    {item.location}
                  </Text>

                  <Text style={styles.itemLabel}>Tarih:</Text>
                  <Text style={styles.itemValue}>{item.foundDate}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      <StudentBottomBar activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 34,
    paddingBottom: 130,
  },

  blueBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 170,
    backgroundColor: colors.yeditepeBlue,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  reportCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },

  reportIconWrap: {
    marginBottom: 14,
  },

  reportTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.yeditepeBlue,
    marginBottom: 8,
  },

  reportDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  sectionHeader: {
    marginTop: 42,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },

  seeAllText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.yeditepeBlue,
  },

  recentList: {
    paddingRight: 16,
    gap: 16,
  },

  itemCard: {
    width: 158,
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  itemImage: {
    width: '100%',
    height: 102,
    backgroundColor: '#E7E8F0',
  },

  itemImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 20,
  },

  itemInfo: {
    padding: 12,
  },

  itemTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 12,
  },

  itemLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.textSecondary,
    marginTop: 3,
  },

  itemValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
});