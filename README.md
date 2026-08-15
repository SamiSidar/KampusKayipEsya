# Kampus Kayip Esya Uygulamasi

Yeditepe Universitesi kampusunde kaybedilen/bulunan esyalari yonetmek icin gelistirilmis full-stack uygulama. Ogrenciler kayip bildirisi olusturur ve bulunan esyalara teslim talebi gonderir; adminler esya kaydi yapar, talepleri inceler ve teslim islemini gerceklestirir.

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | Java 17, Spring Boot 4.1.0, Gradle |
| Frontend | React Native 0.86, Expo SDK 57, TypeScript 6.0 |
| Veritabani | MySQL 8.0, HikariCP connection pool |
| Auth | JWT (access 15dk + refresh 7 gun rotation), BCrypt |
| Validation | Jakarta (backend), Zod v4 (frontend) |
| Container | Docker multi-stage build, docker-compose |
| Navigation | React Navigation 7 (native-stack) |

## Hizli Baslangic

### Docker ile (onerilen)

```bash
git clone https://github.com/SamiSidar/KampusKayipEsya.git
cd KampusKayipEsya

# (Opsiyonel) Production icin secret'lari ayarla
cp .env.example .env
# .env dosyasini duzenle

docker-compose up -d --build
```

| Servis | Adres |
|--------|-------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| MySQL | localhost:3306 |

### Manuel

```bash
# 1. MySQL
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=kampus_kayip_esya \
  mysql:8.0

# 2. Backend
cd kampus-kayip-esya-backend
./gradlew bootRun

# 3. Frontend
cd kampus-kayip-esya
npm install
npx expo start --web
```

### Test Hesaplari

| Rol | Email | Sifre |
|-----|-------|-------|
| Student | `test@yeditepe.edu.tr` | `Test1234` |
| Admin | `admin2@yeditepe.edu.tr` | `Admin123!` |

## Proje Yapisi

```
kampus-kayip-esya-backend/
├── docker-compose.yml              # Full-stack orchestration
├── .env.example                    # Environment variable sablonu
├── Dockerfile                      # Multi-stage: Gradle build → JRE runtime
├── build.gradle                    # Spring Boot + JPA + Security + JWT
├── src/main/java/.../
│   ├── config/                     # SecurityConfig, JwtAuthFilter, RateLimitFilter
│   ├── controller/                 # REST endpoints
│   ├── dto/                        # Request/Response DTO'lar
│   ├── entity/                     # JPA entity'ler
│   ├── enums/                      # Status ve role enum'lari
│   ├── exception/                  # GlobalExceptionHandler
│   ├── repository/                 # Spring Data JPA
│   └── service/                    # Business logic
└── src/main/resources/
    └── application.properties      # DB, JWT, HikariCP, Tomcat ayarlari

kampus-kayip-esya/
├── Dockerfile                      # Multi-stage: Expo build → nginx
├── nginx.conf                      # SPA routing + API reverse proxy
├── src/
│   ├── api/                        # apiClient (fetch wrapper), endpoints
│   ├── components/                 # AppHeader, BottomBar, ErrorBoundary
│   ├── context/                    # AuthContext (login/logout/refresh)
│   ├── navigation/                 # RootNavigator, types
│   ├── screens/                    # Tum uygulama ekranlari
│   ├── services/                   # API service fonksiyonlari
│   ├── theme/                      # colors, spacing
│   ├── types/                      # TypeScript type tanimlari
│   └── validation/                 # Zod schemalari
```

## Docker Mimarisi

```
                    ┌─────────────────────────────────────────────┐
                    │              docker-compose                  │
                    │                                             │
  :3000 ───────────►│  frontend (nginx)                           │
                    │    ├── Static files (Expo web export)       │
                    │    └── /api/ ──► proxy ──────┐              │
                    │                              ▼              │
  :8080 ───────────►│  backend (Spring Boot)  ◄────┘              │
                    │    └── JDBC ──────────────┐                 │
                    │                           ▼                 │
  :3306 ───────────►│  mysql (MySQL 8.0)                          │
                    │    └── Volume: mysql_data                   │
                    └─────────────────────────────────────────────┘
```

Frontend nginx'i `/api/` isteklerini backend container'a proxy'ler — tarayicidan CORS sorunu olmaz.

## Environment Variables

| Degisken | Varsayilan | Aciklama |
|----------|-----------|----------|
| `DB_URL` | `jdbc:mysql://localhost:3306/kampus_kayip_esya?...` | MySQL JDBC URL |
| `DB_USERNAME` | `root` | DB kullanici adi |
| `DB_PASSWORD` | `123456` | DB sifresi |
| `JWT_SECRET` | (internal default) | JWT signing key (min 256-bit) |
| `EXPO_PUBLIC_API_BASE_URL` | `http://localhost:8080/api` | Frontend API adresi |

Docker'da `DB_URL` otomatik olarak `mysql:3306` container hostname'ini kullanir.

## API Endpoints

Tum endpoint'ler `/api` prefix'i ile baslar. Auth gerektiren istekler `Authorization: Bearer <token>` header'i tasir.

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Aciklama |
|--------|----------|------|----------|
| POST | `/register` | — | Ogrenci kaydi |
| POST | `/login` | — | Giris (access + refresh token doner) |
| POST | `/refresh` | — | Token rotation |
| POST | `/forgot-password` | — | Sifre sifirlama token'i |
| POST | `/reset-password` | — | Token ile sifre sifirlama |
| GET | `/me` | JWT | Mevcut kullanici bilgisi |
| POST | `/logout` | JWT | Refresh token'lari iptal et |
| PUT | `/profile` | JWT | Profil guncelle |
| PUT | `/change-password` | JWT | Sifre degistir |

### Bulunan Esyalar (`/api/found-items`)

| Method | Endpoint | Auth | Aciklama |
|--------|----------|------|----------|
| GET | `/` | — | Liste. Query: `?status=`, `?category=`, `?search=` |
| GET | `/{id}` | — | Detay |
| POST | `/` | ADMIN | Yeni esya kaydet |
| PUT | `/{id}` | ADMIN | Esya guncelle |

### Kayip Bildirileri (`/api/lost-reports`)

| Method | Endpoint | Auth | Aciklama |
|--------|----------|------|----------|
| GET | `/` | JWT | Tum bildirileri listele. Query: `?status=` |
| GET | `/my` | JWT | Ogrencinin kendi bildirileri |
| GET | `/{id}` | JWT | Detay |
| POST | `/` | JWT | Yeni kayip bildirisi |
| PUT | `/{id}` | JWT | Bildiri guncelle (revizyon sonrasi) |
| PUT | `/{id}/review` | ADMIN | Onayla/reddet/revizyon iste/eslestir |

### Teslim Talepleri (`/api/claim-requests`)

| Method | Endpoint | Auth | Aciklama |
|--------|----------|------|----------|
| GET | `/` | JWT | Tum talepler. Query: `?status=`, `?itemId=` |
| GET | `/my` | JWT | Ogrencinin kendi talepleri |
| GET | `/{id}` | JWT | Detay |
| POST | `/` | JWT | Yeni teslim talebi |
| PUT | `/{id}/review` | ADMIN | Onayla/reddet/bilgi iste |

### Teslim (`/api/deliveries`)

| Method | Endpoint | Auth | Aciklama |
|--------|----------|------|----------|
| GET | `/` | ADMIN | Tum teslim kayitlari |
| GET | `/{id}` | ADMIN | Detay |
| POST | `/` | ADMIN | Teslim kaydi olustur |

### Bildirimler (`/api/notifications`)

| Method | Endpoint | Auth | Aciklama |
|--------|----------|------|----------|
| GET | `/` | JWT | Kullanicinin bildirimleri |
| GET | `/unread` | JWT | Okunmamis bildirimler |
| GET | `/unread-count` | JWT | Okunmamis sayi |
| PUT | `/{id}/read` | JWT | Okundu isaretle |
| PUT | `/read-all` | JWT | Tumunu okundu isaretle |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Auth | Aciklama |
|--------|----------|------|----------|
| GET | `/stats` | ADMIN | Istatistikler |

## Veritabani Semalari

| Entity | Tablo | Aciklama |
|--------|-------|----------|
| `User` | users | id, fullName, email, password (BCrypt), studentId, role (STUDENT/ADMIN) |
| `FoundItem` | found_items | title, description, category, location, imageUrl, status (WAITING_OWNER/CLAIM_RECEIVED/DELIVERED) |
| `LostReport` | lost_reports | title, description, category, lastSeenLocation, lostDate, status (PENDING/APPROVED/REJECTED/REVISION_REQUESTED/MATCH_FOUND) |
| `ClaimRequest` | claim_requests | item, student, description, distinguishingFeature, status (PENDING/APPROVED/REJECTED/MORE_INFO_REQUESTED/COMPLETED) |
| `Delivery` | deliveries | item, claimRequest, deliveredToName, deliveredBy, deliveredAt |
| `Notification` | notifications | user, title, message, type, referenceId, isRead |
| `RefreshToken` | refresh_tokens | token, user, expiresAt, family (replay detection), revoked |

## Guvenlik Katmanlari

Request akisi: `RateLimitFilter → JwtAuthFilter → SecurityFilterChain → Controller`

1. **Rate Limiting**: IP-based, endpoint grubuna gore (login: 5/dk, register: 3/dk, forgot-password: 3/dk). X-Forwarded-For spoofing korunmali.
2. **JWT Validation**: Tek seferde parse, header spoofing engelleme (X-User-Id/X-User-Role strip edilir).
3. **Refresh Token Rotation**: Access token 15dk + refresh token 7 gun. Family-based replay attack detection — bir token tekrar kullanilirsa tum aile revoke edilir.
4. **Rol Bazli Erisim**: STUDENT ve ADMIN rolleri. Admin endpoint'leri `hasRole('ADMIN')` ile korunur.
5. **Durum Gecis Kontrolu**: Her status enum'unda `canTransitionTo()` metodu — gecersiz gecisler engellenir.
6. **GlobalExceptionHandler**: SQL hatalari, stack trace'ler ve class isimleri API response'lara asla sizdirilmaz.
7. **Sifre Guvenligi**: BCrypt encoding, minimum 6 karakter.
8. **Email Kisitlamasi**: Sadece `@std.yeditepe.edu.tr` ve `@yeditepe.edu.tr` uzantili email'ler kabul edilir.

## Frontend Mimari

- **apiClient**: Merkezi fetch wrapper. 401 alinca otomatik token refresh (concurrent guard ile), basarisizsa logout.
- **AuthContext**: Access + refresh token yonetimi. Uygulama acilisinda otomatik refresh.
- **ErrorBoundary**: Yakalanmamis React hatalarini yakalar, retry butonu gosterir.
- **Zod Validation**: Tum form input'lari API'ye gonderilmeden once Zod schema'lari ile dogrulanir.
- **FlatList**: Veri listelerinde ScrollView yerine FlatList kullanilir (performans).
- **useCallback**: FlatList renderItem ve event handler'lari icin.

## Veri Akisi

```
1. Esya Bulundu:
   Admin → FoundItemCreateScreen → POST /found-items → status: WAITING_OWNER

2. Ogrenci Talep Etti:
   Ogrenci → ClaimRequestScreen → POST /claim-requests → esya: CLAIM_RECEIVED

3. Admin Talebi Onayladi:
   Admin → PUT /claim-requests/{id}/review (APPROVED)

4. Teslim Edildi:
   Admin → POST /deliveries → esya: DELIVERED, talep: COMPLETED, bildirim gonderilir

5. Kayip Bildirisi:
   Ogrenci → LostReportScreen → POST /lost-reports → status: PENDING
   Admin → PUT /lost-reports/{id}/review → APPROVED/REJECTED/REVISION_REQUESTED/MATCH_FOUND
```

## API Response Formati

Tum API cevaplari ayni wrapper ile sarilir:

```json
{
  "success": true,
  "message": "Islem basarili",
  "data": { ... },
  "timestamp": "2026-08-16T12:00:00"
}
```

Hata durumunda:
```json
{
  "success": false,
  "message": "Kullanici bulunamadi",
  "data": null
}
```

## Docker Komutlari

```bash
# Tum servisleri baslat
docker-compose up -d --build

# Loglari takip et
docker-compose logs -f backend
docker-compose logs -f frontend

# Servisleri durdur (veri korunur)
docker-compose down

# Servisleri durdur + veritabanini sifirla
docker-compose down -v

# Tek servisi yeniden build et
docker-compose up -d --build backend
```

## Lisans

Bu proje Yeditepe Universitesi Bilgisayar Muhendisligi bolumu icin gelistirilmistir.
