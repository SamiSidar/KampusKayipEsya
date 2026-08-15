// ============================================================
// REFERANS DOSYASI — Backend'e bağlı ekran kodları
// ============================================================
// Bu dosya ÇALIŞTIRILAMAZ. Sadece referans olarak kullanılacak.
// Her ekran için "NEYİ DEĞİŞTİRDİK" ve "YENİ KOD" bölümleri var.
// Sen kendi ekranına bakarak aynı pattern'i uygulayacaksın.
//
// Ortak pattern (StudentHomeScreen'den biliyorsun):
//   1. import { useAuth } from '../context/AuthContext';
//   2. import { ilgiliService } from '../services/ilgiliService';
//   3. import { IlgiliTip } from '../types/ilgiliTip';
//   4. const { token } = useAuth();
//   5. const [data, setData] = useState<Tip[]>([]);
//   6. const [isLoading, setIsLoading] = useState(true);
//   7. useEffect(() => { loadData(); }, []);
//   8. async function loadData() { ... servis çağrısı ... }
//   9. JSX'te isLoading / data.length kontrolü
// ============================================================


// ████████████████████████████████████████████████████████████
// 1. ListingsScreen — Bulunan eşya listesi
// ████████████████████████████████████████████████████████████
//
// NEYİ DEĞİŞTİRDİK:
// - Mock "items" dizisi SİLİNDİ
// - useState + useEffect + foundItemsService.getFoundItems eklendi
// - Arama kutusu çalışır hale getirildi (foundItemsService.search)
// - Kategori label'ları getFoundItemCategoryLabel ile gösteriliyor
// - Durum label'ları getFoundItemStatusLabel ile gösteriliyor
//
// YENİ IMPORT'LAR:
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TextInput, Pressable, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { StudentBottomBar } from '../components/StudentBottomBar';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';                          // ← EKLENDİ
import { foundItemsService } from '../services/foundItemsService';        // ← EKLENDİ
import { FoundItem, getFoundItemCategoryLabel, getFoundItemStatusLabel } from '../types/foundItem'; // ← EKLENDİ

// ─────────────────────────────────────────────────────────────
// YENİ FONKSİYON GÖVDE:
// ─────────────────────────────────────────────────────────────

type NavigationProp_Listings = NativeStackNavigationProp<RootStackParamList>;

export function ListingsScreen_REFERANS() {
  const navigation = useNavigation<NavigationProp_Listings>();
  const { token } = useAuth();  // ← token'ı al

  // State: backend'den gelecek veri
  const [items, setItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Ekran açıldığında veri çek
  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setIsLoading(true);
      const data = await foundItemsService.getFoundItems(token);
      setItems(data);
    } catch (error) {
      console.error('Eşyalar yüklenemedi:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Arama fonksiyonu
  async function handleSearch(text: string) {
    setSearchText(text);
    if (text.trim().length === 0) {
      loadItems(); // Boşsa tüm listeyi getir
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
  }

  // JSX'te değişenler:
  // ─────────────────────────────────────────────────────────
  // 1. TextInput'a onChangeText={handleSearch} value={searchText} ekle
  //
  // 2. items.map içinde:
  //    - item.image    → item.imageUrl
  //    - item.category → getFoundItemCategoryLabel(item.category)
  //    - item.time     → item.foundDate
  //    - item.status   → getFoundItemStatusLabel(item.status)
  //
  // 3. Liste öncesine loading kontrolü ekle:
  //    {isLoading ? <ActivityIndicator ... /> : items.map(...)}
  //
  // 4. Boş liste kontrolü:
  //    items.length === 0 ? <Text>Eşya bulunamadı</Text> : items.map(...)

  return null; // Sadece referans — gerçek JSX'i kendi dosyanda yaz
}


// ████████████████████████████████████████████████████████████
// 2. ItemDetailScreen — Eşya detay sayfası
// ████████████████████████████████████████████████████████████
//
// NEYİ DEĞİŞTİRDİK:
// - Mock "itemDetails" objesi SİLİNDİ
// - Mock "ItemDetailData" tipi SİLİNDİ → FoundItem tipi kullanılıyor
// - route.params.itemId alınıp foundItemsService.getFoundItemById çağrılıyor
// - Kategori/durum label fonksiyonları kullanılıyor
//
// YENİ IMPORT'LAR (mevcut olanlara ek):
// ─────────────────────────────────────────────────────────────
// import { useState, useEffect } from 'react';
// import { ActivityIndicator } from 'react-native';
// import { useAuth } from '../context/AuthContext';
// import { foundItemsService } from '../services/foundItemsService';
// import { FoundItem, getFoundItemCategoryLabel, getFoundItemStatusLabel } from '../types/foundItem';
// ─────────────────────────────────────────────────────────────

export function ItemDetailScreen_REFERANS() {
  // const route = useRoute<ItemDetailRouteProp>();
  // const { token } = useAuth();
  // const { itemId } = route.params;

  // const [item, setItem] = useState<FoundItem | null>(null);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   loadItem();
  // }, [itemId]);

  // async function loadItem() {
  //   try {
  //     const data = await foundItemsService.getFoundItemById(itemId, token);
  //     setItem(data);
  //   } catch (error) {
  //     console.error('Eşya detayı yüklenemedi:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // JSX'te değişenler:
  // ─────────────────────────────────────────────────────────
  // 1. Önce loading kontrolü:
  //    if (isLoading) return <ActivityIndicator />;
  //    if (!item) return <Text>Eşya bulunamadı</Text>;
  //
  // 2. Alanlar:
  //    item.image       → item.imageUrl
  //    item.date        → item.foundDate
  //    item.category    → getFoundItemCategoryLabel(item.category)
  //    item.status      → getFoundItemStatusLabel(item.status)
  //    item.description → item.description (aynı)
  //    ilan numarası    → `#${item.id}`

  return null;
}


// ████████████████████████████████████████████████████████████
// 3. NotificationsScreen — Bildirimler
// ████████████████████████████████████████████████████████████
//
// NEYİ DEĞİŞTİRDİK:
// - Mock "notifications" dizisi SİLİNDİ
// - Mock "NotificationType" tipi SİLİNDİ → AppNotification + NotificationType kullanılıyor
// - notificationsService.getNotifications çağrılıyor
// - Okundu işaretleme: karta tıklayınca markAsRead çağrılıyor
//
// YENİ IMPORT'LAR (mevcut olanlara ek):
// ─────────────────────────────────────────────────────────────
// import { useState, useEffect } from 'react';
// import { ActivityIndicator } from 'react-native';
// import { useAuth } from '../context/AuthContext';
// import { notificationsService } from '../services/notificationsService';
// import { AppNotification, getNotificationTypeLabel } from '../types/notification';
// ─────────────────────────────────────────────────────────────

export function NotificationsScreen_REFERANS() {
  // const { token } = useAuth();
  // const [notifications, setNotifications] = useState<AppNotification[]>([]);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   loadNotifications();
  // }, []);

  // async function loadNotifications() {
  //   try {
  //     const data = await notificationsService.getNotifications(token);
  //     setNotifications(data);
  //   } catch (error) {
  //     console.error('Bildirimler yüklenemedi:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // async function handleNotificationPress(notification: AppNotification) {
  //   // 1. Okunmamışsa okundu işaretle
  //   if (!notification.read) {
  //     try {
  //       await notificationsService.markAsRead(notification.id, token);
  //       // Local state'i güncelle (tekrar API çağırmadan)
  //       setNotifications(prev =>
  //         prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
  //       );
  //     } catch (error) {
  //       console.error('Okundu işaretlenemedi:', error);
  //     }
  //   }
  //   // 2. İlgili sayfaya yönlendir
  //   if (notification.reportId) {
  //     navigation.navigate('StudentReportDetail', { reportId: notification.reportId });
  //   } else if (notification.itemId) {
  //     navigation.navigate('ItemDetail', { itemId: notification.itemId });
  //   }
  // }

  // JSX'te değişenler:
  // ─────────────────────────────────────────────────────────
  // 1. notification.unread    → !notification.read (backend "read" döner, tersi)
  // 2. notification.time      → notification.createdAt
  // 3. notification.type      → notification.type (aynı ama backend enum: 'REPORT_APPROVED' vs)
  // 4. getNotificationVisual  → type parametresini backend enum'a göre güncelle:
  //    'approved' → 'REPORT_APPROVED'
  //    'matched'  → 'MATCH_FOUND'
  //    'delivered'→ 'ITEM_DELIVERED'
  //    'info'     → diğer tüm tipler
  // 5. onPress → handleNotificationPress(notification)

  return null;
}


// ████████████████████████████████████████████████████████████
// 4. MyReportsScreen — Öğrencinin kayıp bildirimleri
// ████████████████████████████████████████████████████████████
//
// NEYİ DEĞİŞTİRDİK:
// - Mock "reports" dizisi SİLİNDİ
// - lostReportsService.getMyReports çağrılıyor (sadece benim bildirilerim)
// - report.statusType yerine report.status (backend enum) kullanılıyor
// - report.icon yerine kategoriye göre ikon seçiliyor
//
// YENİ IMPORT'LAR (mevcut olanlara ek):
// ─────────────────────────────────────────────────────────────
// import { useState, useEffect } from 'react';
// import { ActivityIndicator } from 'react-native';
// import { useAuth } from '../context/AuthContext';
// import { lostReportsService } from '../services/lostReportsService';
// import { LostReport, getLostReportStatusLabel } from '../types/lostReport';
// import { getFoundItemCategoryLabel } from '../types/foundItem';
// ─────────────────────────────────────────────────────────────

export function MyReportsScreen_REFERANS() {
  // const { token } = useAuth();
  // const [reports, setReports] = useState<LostReport[]>([]);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   loadReports();
  // }, []);

  // async function loadReports() {
  //   try {
  //     const data = await lostReportsService.getMyReports(token);
  //     setReports(data);
  //   } catch (error) {
  //     console.error('Bildiriler yüklenemedi:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // JSX'te değişenler:
  // ─────────────────────────────────────────────────────────
  // 1. report.location   → report.lostLocation
  // 2. report.date       → report.lostDate (veya report.createdAt)
  // 3. report.status     → getLostReportStatusLabel(report.status)
  // 4. report.statusType → report.status (direkt enum: 'PENDING_REVIEW', 'MATCH_FOUND', 'APPROVED')
  //    getStatusStyle fonksiyonunu güncelle:
  //    'pending'  → 'PENDING_REVIEW'
  //    'matched'  → 'MATCH_FOUND'
  //    'approved' → 'APPROVED'
  // 5. report.icon → kategoriye göre ikon seç:
  //    function getCategoryIcon(category: FoundItemCategory) {
  //      switch (category) {
  //        case 'WALLET': return 'wallet-outline';
  //        case 'KEY': return 'key-outline';
  //        case 'ELECTRONIC': return 'headphones';
  //        case 'BAG': return 'bag-personal-outline';
  //        default: return 'package-variant-closed';
  //      }
  //    }

  return null;
}


// ████████████████████████████████████████████████████████████
// 5. LostReportScreen — Kayıp eşya bildirimi FORMU
// ████████████████████████████████████████████████████████████
//
// NEYİ DEĞİŞTİRDİK:
// - Form alanları useState ile kontrol ediliyor
// - handleSubmit → lostReportsService.createLostReport çağırıyor
// - Kategori seçimi için state eklendi
// - Hata ve loading durumları eklendi
//
// YENİ IMPORT'LAR (mevcut olanlara ek):
// ─────────────────────────────────────────────────────────────
// import { useState } from 'react';
// import { Alert, ActivityIndicator } from 'react-native';
// import { useAuth } from '../context/AuthContext';
// import { lostReportsService } from '../services/lostReportsService';
// import { FoundItemCategory, getFoundItemCategoryLabel } from '../types/foundItem';
// ─────────────────────────────────────────────────────────────

export function LostReportScreen_REFERANS() {
  // const { token } = useAuth();
  // const navigation = useNavigation();

  // // Form state'leri
  // const [title, setTitle] = useState('');
  // const [category, setCategory] = useState<FoundItemCategory | ''>('');
  // const [lostLocation, setLostLocation] = useState('');
  // const [lostDate, setLostDate] = useState('');
  // const [description, setDescription] = useState('');
  // const [isSubmitting, setIsSubmitting] = useState(false);

  // async function handleSubmit() {
  //   // Doğrulama
  //   if (!title.trim() || !category || !lostLocation.trim() || !description.trim()) {
  //     Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
  //     return;
  //   }
  //
  //   try {
  //     setIsSubmitting(true);
  //     await lostReportsService.createLostReport(
  //       {
  //         title: title.trim(),
  //         category: category as FoundItemCategory,
  //         lostLocation: lostLocation.trim(),
  //         lostDate: lostDate || new Date().toISOString().split('T')[0],
  //         description: description.trim(),
  //       },
  //       token
  //     );
  //     // Başarılı → Success ekranına git
  //     navigation.dispatch(
  //       CommonActions.reset({ index: 0, routes: [{ name: 'Success' }] })
  //     );
  //   } catch (error) {
  //     Alert.alert('Hata', 'Bildiri gönderilemedi. Tekrar deneyin.');
  //     console.error('Bildiri hatası:', error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }

  // JSX'te değişenler:
  // ─────────────────────────────────────────────────────────
  // 1. TextInput'lara value ve onChangeText ekle:
  //    <TextInput value={title} onChangeText={setTitle} ... />
  //
  // 2. Kategori seçimi → basit bir seçim ekle veya Pressable ile modal
  //
  // 3. Gönder butonuna loading durumu ekle:
  //    <Pressable onPress={handleSubmit} disabled={isSubmitting}>
  //      {isSubmitting ? <ActivityIndicator color="white" /> : <Text>Bildirimi Gönder</Text>}
  //    </Pressable>

  return null;
}


// ████████████████████████████████████████████████████████████
// 6. ClaimRequestScreen — Teslim talebi FORMU
// ████████████████████████████████████████████████████████████
//
// NEYİ DEĞİŞTİRDİK:
// - Mock itemTitles/itemLocations SİLİNDİ
// - route.params.itemId ile foundItemsService.getFoundItemById çağrılıp eşya bilgisi çekiliyor
// - handleSubmit → claimRequestsService.createClaimRequest çağırıyor
// - Form alanları useState ile kontrol ediliyor
//
// YENİ IMPORT'LAR (mevcut olanlara ek):
// ─────────────────────────────────────────────────────────────
// import { useState, useEffect } from 'react';
// import { Alert, ActivityIndicator } from 'react-native';
// import { useAuth } from '../context/AuthContext';
// import { foundItemsService } from '../services/foundItemsService';
// import { claimRequestsService } from '../services/claimRequestsService';
// import { FoundItem, getFoundItemStatusLabel } from '../types/foundItem';
// ─────────────────────────────────────────────────────────────

export function ClaimRequestScreen_REFERANS() {
  // const { token } = useAuth();
  // const route = useRoute<ClaimRequestRouteProp>();
  // const { itemId } = route.params;

  // // Eşya bilgisini backend'den çek
  // const [item, setItem] = useState<FoundItem | null>(null);
  // const [isLoadingItem, setIsLoadingItem] = useState(true);

  // // Form state'leri
  // const [description, setDescription] = useState('');
  // const [distinguishingFeature, setDistinguishingFeature] = useState('');
  // const [additionalNote, setAdditionalNote] = useState('');
  // const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect(() => {
  //   loadItem();
  // }, [itemId]);

  // async function loadItem() {
  //   try {
  //     const data = await foundItemsService.getFoundItemById(itemId, token);
  //     setItem(data);
  //   } catch (error) {
  //     console.error('Eşya bilgisi yüklenemedi:', error);
  //   } finally {
  //     setIsLoadingItem(false);
  //   }
  // }

  // async function handleSubmit() {
  //   if (!description.trim() || !distinguishingFeature.trim()) {
  //     Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
  //     return;
  //   }
  //
  //   try {
  //     setIsSubmitting(true);
  //     await claimRequestsService.createClaimRequest(
  //       {
  //         itemId,
  //         description: description.trim(),
  //         distinguishingFeature: distinguishingFeature.trim(),
  //         additionalNote: additionalNote.trim() || undefined,
  //       },
  //       token
  //     );
  //     navigation.dispatch(
  //       CommonActions.reset({ index: 0, routes: [{ name: 'Success' }] })
  //     );
  //   } catch (error) {
  //     Alert.alert('Hata', 'Talep gönderilemedi. Tekrar deneyin.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }

  // JSX'te değişenler:
  // ─────────────────────────────────────────────────────────
  // 1. itemTitle    → item?.title ?? 'Yükleniyor...'
  // 2. itemLocation → item?.location ?? ''
  // 3. "Sahibi Bekleniyor" → item ? getFoundItemStatusLabel(item.status) : ''
  // 4. TextInput'lara value/onChangeText ekle
  // 5. Gönder butonuna isSubmitting kontrolü ekle

  return null;
}


// ████████████████████████████████████████████████████████████
// 7. AdminPanelScreen — Admin dashboard
// ████████████████████████████████████████████████████████████
//
// NEYİ DEĞİŞTİRDİK:
// - Mock count'lar ('12', '25', ...) yerine backend'den dashboard/stats çekiliyor
// - Yeni bir dashboardService oluşturman gerekecek (aşağıda)
//
// ÖNCE BU SERVİSİ OLUŞTUR — src/services/dashboardService.ts:
// ─────────────────────────────────────────────────────────────
// import { apiClient } from '../api/apiClient';
// import { ENDPOINTS } from '../api/endpoints';
//
// export type DashboardStats = {
//   pendingReportsCount: number;
//   waitingOwnerItemsCount: number;
//   activeLostReportsCount: number;
//   deliveredItemsCount: number;
// };
//
// export const dashboardService = {
//   getStats(token?: string | null) {
//     return apiClient.get<DashboardStats>(ENDPOINTS.dashboard.stats, token);
//   },
// };
// ─────────────────────────────────────────────────────────────
//
// YENİ IMPORT'LAR (mevcut olanlara ek):
// ─────────────────────────────────────────────────────────────
// import { useState, useEffect } from 'react';
// import { ActivityIndicator } from 'react-native';
// import { useAuth } from '../context/AuthContext';
// import { dashboardService, DashboardStats } from '../services/dashboardService';
// ─────────────────────────────────────────────────────────────

export function AdminPanelScreen_REFERANS() {
  // const { token } = useAuth();
  // const [stats, setStats] = useState<DashboardStats | null>(null);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   loadStats();
  // }, []);

  // async function loadStats() {
  //   try {
  //     const data = await dashboardService.getStats(token);
  //     setStats(data);
  //   } catch (error) {
  //     console.error('Dashboard yüklenemedi:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // JSX'te değişenler:
  // ─────────────────────────────────────────────────────────
  // adminCards dizisindeki count'ları stats'tan al:
  //   'pending'      → stats?.pendingReportsCount ?? 0
  //   'waitingOwner' → stats?.waitingOwnerItemsCount ?? 0
  //   'activeLost'   → stats?.activeLostReportsCount ?? 0
  //   'delivered'    → stats?.deliveredItemsCount ?? 0
  //
  // Sayıyı gösterirken: String(stats?.pendingReportsCount ?? '-')
  //
  // NOT: Backend'deki DashboardController'ın döndüğü field isimlerini
  // kontrol et ve DashboardStats tipini ona göre ayarla.

  return null;
}


// ████████████████████████████████████████████████████████████
// 8. StudentProfileScreen — Öğrenci profili
// ████████████████████████████████████████████████████████████
//
// NEYİ DEĞİŞTİRDİK:
// - Mock "Mert Yılmaz" ve "Öğrenci" yerine useAuth().user bilgileri kullanılıyor
// - Çıkış → useAuth().logout() çağırılıyor
//
// YENİ IMPORT'LAR:
// ─────────────────────────────────────────────────────────────
// import { useAuth } from '../context/AuthContext';
// import { getUserRoleLabel } from '../types/user';
// ─────────────────────────────────────────────────────────────

export function StudentProfileScreen_REFERANS() {
  // const { user, logout } = useAuth();
  // const navigation = useNavigation();

  // async function handleLogout() {
  //   await logout();  // Token temizle
  //   navigation.dispatch(
  //     CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
  //   );
  // }

  // JSX'te değişenler:
  // ─────────────────────────────────────────────────────────
  // 1. "Mert Yılmaz"  → user?.fullName ?? ''
  // 2. "Öğrenci"      → user ? getUserRoleLabel(user.role) : ''
  // 3. Çıkış onPress  → handleLogout (artık async, logout() çağırıyor)

  return null;
}


// ████████████████████████████████████████████████████████████
// ÖZET: Her ekran için aynı 4 adım
// ████████████████████████████████████████████████████████████
//
// ADIM 1: Import ekle
//   import { useAuth } from '../context/AuthContext';
//   import { ilgiliService } from '../services/ilgiliService';
//   import { Tip } from '../types/ilgiliTip';
//
// ADIM 2: Hook ve state ekle
//   const { token } = useAuth();
//   const [data, setData] = useState<Tip[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//
// ADIM 3: useEffect ile veri çek
//   useEffect(() => { loadData(); }, []);
//   async function loadData() {
//     try {
//       const result = await ilgiliService.metod(token);
//       setData(result);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   }
//
// ADIM 4: JSX'te mock veriyi state ile değiştir
//   - Mock dizileri sil
//   - isLoading ? <ActivityIndicator /> : data.map(...)
//   - Label fonksiyonlarını kullan (getFoundItemCategoryLabel vs.)
//
// Form ekranları (LostReport, ClaimRequest) için ek:
//   - Her input'a value + onChangeText
//   - handleSubmit → service.create(...) + try/catch + loading state
//   - Başarıda Success ekranına yönlendir
//   - Hatada Alert.alert göster
