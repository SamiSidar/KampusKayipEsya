# Kampüs Kayıp Eşya Uygulaması — Proje Dokümantasyonu

Yeditepe Üniversitesi kampüsünde kaybedilen/bulunan eşyaları yönetmek için geliştirilmiş full-stack uygulamadır. Öğrenciler kayıp bildirisi oluşturur ve bulunan eşyalara teslim talebi gönderir; adminler eşya kaydı yapar, talepleri inceler ve teslim işlemini gerçekleştirir.

**GitHub:** https://github.com/SamiSidar/KampusKayipEsya

## Teknoloji Stack

Backend: Spring Boot 4.1.0, Java 21, MySQL 8.0 (Docker), Gradle
Frontend: React Native / Expo SDK 57, TypeScript
Auth: JWT (JSON Web Token)

## Çalıştırma

```bash
# Backend (MySQL Docker'da çalışıyor olmalı, port 3307)
cd kampus-kayip-esya-backend/kampus-kayip-esya-backend
./gradlew.bat bootRun

# Frontend
cd kampus-kayip-esya
npx expo start --web
```

---

## BACKEND

Paket yapısı: `com.yeditepe.kampuskayipesya`

### Entity (Veritabanı Tabloları)

| Entity | Tablo | Açıklama |
|--------|-------|----------|
| `User` | users | Kullanıcı bilgileri. Alanlar: id, fullName, email, password (BCrypt hash), studentId, role (STUDENT/ADMIN), createdAt |
| `FoundItem` | found_items | Admin tarafından kaydedilen bulunan eşya. Alanlar: id, title, description, category (enum), location, imageUrl, status (WAITING_OWNER/CLAIM_RECEIVED/DELIVERED), createdBy (User), createdAt |
| `LostReport` | lost_reports | Öğrenci kayıp bildirisi. Alanlar: id, title, description, category, lastSeenLocation, lostDate, imageUrl, status (PENDING/APPROVED/REJECTED/REVISION_REQUESTED/MATCH_FOUND), student (User), adminNote, revisionNote, matchedItemId, createdAt |
| `ClaimRequest` | claim_requests | Öğrencinin bir bulunan eşyaya sahiplenme talebi. Alanlar: id, item (FoundItem), student (User), description, distinguishingFeature, additionalNote, status (PENDING/APPROVED/REJECTED/MORE_INFO_REQUESTED/COMPLETED), reviewNote, createdAt |
| `Delivery` | deliveries | Teslim kaydı. Alanlar: id, item (FoundItem), claimRequest, deliveredToName, deliveredBy (User), deliveredAt, adminNote |
| `Notification` | notifications | Bildirim. Alanlar: id, user, title, message, type (enum), referenceId, isRead, createdAt |
| `FileRecord` | file_records | Yüklenen dosya kaydı. Alanlar: id, originalFileName, storedFileName, contentType, fileSize, uploadedBy (User), createdAt |

### DTO (Data Transfer Object)

Request/response dönüşümü için kullanılır. Entity doğrudan API'ye dönülmez.

| DTO | Kullanım |
|-----|----------|
| `RegisterRequest` | Kayıt isteği: fullName, email, password, studentId |
| `LoginRequest` | Giriş isteği: email, password |
| `AuthResponse` | Giriş cevabı: token, user bilgisi |
| `UserResponse` | Kullanıcı bilgisi (şifresiz) |
| `FoundItemRequest` | Bulunan eşya oluşturma/güncelleme |
| `FoundItemResponse` | Bulunan eşya cevabı (createdBy → UserResponse) |
| `LostReportRequest` | Kayıp bildirisi oluşturma |
| `LostReportResponse` | Kayıp bildirisi cevabı (student → UserResponse) |
| `ReportReviewRequest` | Admin inceleme: status, adminNote, revisionNote, matchedItemId |
| `ClaimRequestCreateDTO` | Teslim talebi oluşturma: itemId, description, distinguishingFeature, additionalNote |
| `ClaimReviewRequest` | Admin talep inceleme: status, reviewNote |
| `ClaimRequestResponse` | Talep cevabı (item + student bilgisi) |
| `DeliveryRequest` | Teslim oluşturma: itemId, claimRequestId, deliveredToName, adminNote |
| `DeliveryResponse` | Teslim cevabı |
| `NotificationResponse` | Bildirim cevabı |
| `DashboardStatsResponse` | Admin dashboard istatistikleri |
| `ApiResponse<T>` | Tüm API cevapları bu wrapper ile sarılır: `{ success, message, data }` |

### Controller (API Endpoint)

Tüm endpoint'ler `/api` prefix'i ile başlar. Auth gerektiren istekler `Authorization: Bearer <token>` header'ı ile gönderilir; backend JWT'den userId çıkarıp `X-User-Id` header'ına yazar (JwtAuthFilter).

#### AuthController (`/api/auth`)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/register` | Yeni kullanıcı kaydı |
| POST | `/login` | Giriş, JWT token döner |
| GET | `/me` | Token'dan mevcut kullanıcı bilgisini döner |

#### FoundItemController (`/api/found-items`)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/` | Tüm eşyaları listele. Query: `?status=`, `?category=`, `?search=` |
| GET | `/{id}` | Tekil eşya detayı |
| POST | `/` | Yeni bulunan eşya kaydet (admin) |
| PUT | `/{id}` | Eşya güncelle (admin) |

#### LostReportController (`/api/lost-reports`)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/` | Tüm bildirileri listele. Query: `?status=` |
| GET | `/my` | Öğrencinin kendi bildirileri |
| GET | `/{id}` | Tekil bildiri detayı |
| POST | `/` | Yeni kayıp bildirisi oluştur (öğrenci) |
| PUT | `/{id}` | Bildiri güncelle (revizyon sonrası) |
| PUT | `/{id}/review` | Admin inceleme: onayla/reddet/revizyon iste/eşleştir |

#### ClaimRequestController (`/api/claim-requests`)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/` | Tüm talepler. Query: `?status=`, `?itemId=` |
| GET | `/my` | Öğrencinin kendi talepleri |
| GET | `/{id}` | Tekil talep detayı |
| POST | `/` | Yeni teslim talebi (öğrenci) |
| PUT | `/{id}/review` | Admin talep inceleme: onayla/reddet/bilgi iste |

#### DeliveryController (`/api/deliveries`)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/` | Tüm teslim kayıtları |
| GET | `/{id}` | Tekil teslim detayı |
| POST | `/` | Yeni teslim kaydı oluştur (admin). Otomatik: eşya durumu DELIVERED, talep COMPLETED, bildirim gönderilir |

#### NotificationController (`/api/notifications`)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/` | Kullanıcının tüm bildirimleri |
| GET | `/unread` | Okunmamış bildirimler |
| GET | `/unread-count` | Okunmamış bildirim sayısı |
| PUT | `/{id}/read` | Tek bildirimi okundu işaretle |
| PUT | `/read-all` | Tümünü okundu işaretle |

#### DashboardController (`/api/dashboard`)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/stats` | Admin panel istatistikleri (bekleyen bildirimler, eşyalar, teslimler vs.) |

#### FileUploadController (`/api/uploads`)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/` | Fotoğraf yükle (multipart/form-data). Döner: `{ url: "/api/uploads/uuid.jpg" }` |
| GET | `/{fileName}` | Yüklenen dosyayı göster (public, auth gerekmez) |

### Service (İş Mantığı)

| Service | Görev |
|---------|-------|
| `AuthService` | Kayıt (şifre hash'leme), giriş (JWT üretme), token doğrulama |
| `JwtService` | JWT token oluşturma ve çözümleme (userId çıkarma) |
| `FoundItemService` | CRUD, filtreleme (status/category/search) |
| `LostReportService` | CRUD, admin review (onay/red/revizyon/eşleştirme), her durum değişikliğinde bildirim gönderimi |
| `ClaimRequestService` | CRUD, admin review (onay/red/bilgi isteme), talep oluşturulunca eşya durumunu CLAIM_RECEIVED yapar |
| `DeliveryService` | Teslim kaydı, otomatik olarak eşya → DELIVERED, talep → COMPLETED, bildirim gönderir |
| `NotificationService` | Bildirim oluşturma, listeleme, okundu işaretleme |
| `DashboardService` | Bekleyen bildirim/eşya/teslim sayılarını hesaplar |
| `FileStorageService` | Dosyayı diske kaydeder, FileRecord oluşturur. İzin verilen formatlar: JPEG, PNG, WebP, GIF |
| `DtoMapper` | Entity ↔ DTO dönüşüm helper'ı |

### Config

| Sınıf | Görev |
|-------|-------|
| `SecurityConfig` | Spring Security yapılandırması. `/api/auth/**` ve `GET /api/uploads/**` public; diğer endpoint'ler JWT gerektirir |
| `JwtAuthFilter` | Her istekte JWT token'ı çözer, userId'yi `X-User-Id` header'ına yazar |
| `WebConfig` | CORS ayarları (localhost:8081, 19006 vb. için izin) |
| `application.properties` | DB bağlantısı (MySQL 3307), JWT secret, dosya yükleme yolu |

### Enum

| Enum | Değerler |
|------|----------|
| `UserRole` | STUDENT, ADMIN |
| `FoundItemStatus` | WAITING_OWNER, CLAIM_RECEIVED, DELIVERED |
| `FoundItemCategory` | ID_CARD, WALLET, PHONE, LAPTOP, KEYS, BAG, CLOTHING, BOOK, OTHER |
| `LostReportStatus` | PENDING, APPROVED, REJECTED, REVISION_REQUESTED, MATCH_FOUND |
| `ClaimRequestStatus` | PENDING, APPROVED, REJECTED, MORE_INFO_REQUESTED, COMPLETED |
| `NotificationType` | REPORT_APPROVED, REPORT_REJECTED, REVISION_REQUESTED, MATCH_FOUND, CLAIM_APPROVED, CLAIM_REJECTED, MORE_INFO_REQUESTED, DELIVERY_COMPLETED |

---

## FRONTEND

Proje yapısı: `src/` altında `api/`, `context/`, `navigation/`, `screens/`, `services/`, `types/`

### API Katmanı (`src/api/`)

#### `apiClient.ts`
Tüm HTTP istekleri bu modül üzerinden yapılır. `API_BASE_URL = http://localhost:8080/api`

Fonksiyonlar: `get<T>`, `post<T>`, `put<T>`, `del<T>`. Her biri:
1. Authorization header'ı ekler (token varsa)
2. Fetch ile isteği yapar
3. `ApiResponse<T>` wrapper'ını açar, sadece `.data` kısmını döner
4. Hata durumunda backend mesajını throw eder

#### `endpoints.ts`
Tüm backend URL'lerini merkezi olarak tanımlar. Dinamik ID'ler fonksiyon olarak: `detail(id)`, `review(id)` vb.

### Context (`src/context/`)

#### `AuthContext.tsx`
React Context ile global auth state yönetimi. `useAuth()` hook'u ile erişilir.

Sağladığı değerler: `user`, `token`, `isLoading`, `login()`, `register()`, `logout()`, `fetchUser()`

Token AsyncStorage'da saklanır. Uygulama açılışında token varsa `fetchUser()` ile kullanıcı bilgisi çekilir.

### Types (`src/types/`)

| Dosya | İçerik |
|-------|--------|
| `user.ts` | User, UserSummary (id, fullName, email) |
| `foundItem.ts` | FoundItem, CreateFoundItemRequest, UpdateFoundItemRequest, status/category enum + Türkçe label helper'ları |
| `lostReport.ts` | LostReport, CreateLostReportRequest, UpdateLostReportRequest, status enum + label helper |
| `claimRequest.ts` | ClaimRequest, CreateClaimRequest, status enum + label helper |
| `delivery.ts` | DeliveryRecord, CreateDeliveryRequest |
| `notification.ts` | AppNotification tipi |

### Services (`src/services/`)

Her service dosyası ilgili entity için CRUD ve özel API çağrılarını barındırır. Hepsi `apiClient` üzerinden çalışır.

#### `foundItemsService.ts`
`getFoundItems`, `getByStatus`, `getByCategory`, `search`, `getFoundItemById`, `createFoundItem`, `updateFoundItem`

#### `lostReportsService.ts`
`getLostReports`, `getMyReports`, `getLostReportById`, `createLostReport`, `updateLostReport`
Admin: `approveLostReport`, `rejectLostReport`, `requestRevision`, `matchFoundItem` — hepsi `/review` endpoint'ini kullanır

#### `claimRequestsService.ts`
`getClaimRequests`, `getClaimRequestsByItem(itemId)`, `getMyClaimRequests`, `getClaimRequestById`, `createClaimRequest`
Admin: `approveClaimRequest`, `rejectClaimRequest`, `requestMoreInfo`

#### `deliveriesService.ts`
`getDeliveries`, `getDeliveryById`, `createDelivery`

#### `notificationsService.ts`
`getNotifications`, `getUnreadNotifications`, `getUnreadCount`, `markAsRead(id)`, `markAllAsRead`

#### `dashboardService.ts`
`getStats` — admin panel istatistiklerini çeker

#### `uploadService.ts`
`uploadImage(imageUri, token)` — FormData ile fotoğraf yükler (apiClient kullanmaz, raw fetch)
`getFullImageUrl(relativeUrl)` — `/api/uploads/xxx.jpg` → tam URL'ye çevirir

### Navigation (`src/navigation/`)

#### `RootNavigator.tsx`
Auth durumuna göre yönlendirme: giriş yapmamış → Login/Register stack; STUDENT → öğrenci tab navigator; ADMIN → admin tab navigator

#### `types.ts`
Tüm stack ve tab navigator'ların parametre tiplerini tanımlar (type-safe navigation).

### Screens (`src/screens/`)

#### Ortak Ekranlar
| Ekran | Görev |
|-------|-------|
| `SplashScreen` | Uygulama açılış ekranı, auth kontrol |
| `LoginScreen` | E-posta + şifre ile giriş |
| `ForgotPasswordScreen` | Şifre sıfırlama (henüz backend bağlantısı yok) |
| `SuccessScreen` | İşlem başarılı bildirimi |

#### Öğrenci Ekranları
| Ekran | Görev |
|-------|-------|
| `StudentHomeScreen` | Ana sayfa, hızlı erişim butonları |
| `ListingsScreen` | Bulunan eşya ilanları listesi (status badge öğrencide gizli) |
| `ItemDetailScreen` | Eşya detayı ve teslim talebi gönderme |
| `ClaimRequestScreen` | Teslim talebi formu: açıklama, ayırt edici özellik, ek not |
| `LostReportScreen` | Kayıp bildirisi oluşturma + fotoğraf çekme/seçme |
| `MyReportsScreen` | Öğrencinin kendi kayıp bildirileri |
| `StudentReportDetailScreen` | Bildiri detayı ve durumu |
| `NotificationsScreen` | Bildirim listesi |
| `StudentProfileScreen` | Profil bilgileri ve çıkış |

#### Admin Ekranları
| Ekran | Görev |
|-------|-------|
| `AdminPanelScreen` | Dashboard: istatistik kartları + hızlı erişim |
| `PendingReportsScreen` | Bekleyen kayıp bildirileri listesi |
| `AdminReviewScreen` | Bildiri inceleme: onayla/reddet/revizyon iste/eşleştir |
| `RevisionRequestScreen` | Bildiriye revizyon notu yazma |
| `ActiveLostReportsScreen` | Onaylanmış aktif kayıp bildirileri |
| `FoundItemCreateScreen` | Yeni bulunan eşya kaydı + fotoğraf |
| `WaitingOwnerItemsScreen` | Sahibi beklenen eşyalar listesi |
| `AdminItemDetailScreen` | Eşya detayı + gelen teslim talepleri listesi |
| `AdminClaimRequestDetailScreen` | Talep detayı: onayla/reddet/bilgi iste |
| `DeliveredItemsScreen` | Teslim edilmiş eşyalar listesi |
| `DeliveryDetailScreen` | Teslim detay bilgisi |
| `AdminProfileScreen` | Admin profil ve çıkış |

---

## Veri Akışı Özeti

1. **Eşya Bulundu:** Admin → `FoundItemCreateScreen` → `POST /found-items` → status: WAITING_OWNER
2. **Öğrenci Talep Etti:** Öğrenci → `ClaimRequestScreen` → `POST /claim-requests` → eşya status: CLAIM_RECEIVED
3. **Admin Talebi Onayladı:** Admin → `AdminClaimRequestDetailScreen` → `PUT /claim-requests/{id}/review` (APPROVED)
4. **Teslim Edildi:** Admin → Teslim kaydı → `POST /deliveries` → eşya: DELIVERED, talep: COMPLETED, bildirim gönderilir
5. **Kayıp Bildirisi:** Öğrenci → `LostReportScreen` → `POST /lost-reports` → status: PENDING → Admin onay/red/revizyon
