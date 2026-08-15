# Kampüs Kayıp Eşya Uygulaması — Backend

Yeditepe Üniversitesi kampüsünde kaybedilen/bulunan eşyaların takibini sağlayan Spring Boot backend.

## Tech Stack

- **Runtime**: Java 17, Spring Boot 4.1.0
- **Database**: MySQL 8.0 (Docker), HikariCP connection pool
- **Auth**: JWT (access 15min + refresh 7 day rotation), BCrypt
- **Build**: Gradle (Groovy DSL)
- **Container**: Docker multi-stage build, docker-compose orchestration

## Proje Yapısı

```
src/main/java/com/yeditepe/kampuskayipesya/
├── config/         # SecurityConfig, JwtAuthFilter, RateLimitFilter
├── controller/     # REST endpoints
├── dto/            # Request/Response DTO'lar
├── entity/         # JPA entity'ler
├── enums/          # Status ve role enum'ları
├── exception/      # Custom exception'lar + GlobalExceptionHandler
├── repository/     # Spring Data JPA repository'ler
└── service/        # Business logic
```

## Çalıştırma

### Docker (önerilen)

```bash
cd kampus-kayip-esya-backend
docker-compose up -d --build
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8080
# MySQL:     localhost:3306
```

### Manuel

```bash
# MySQL (Docker)
docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=kampus_kayip_esya mysql:8.0

# Backend
cd kampus-kayip-esya-backend
./gradlew bootRun
```

**Environment Variables** (production):
- `JWT_SECRET` — JWT signing key (min 256-bit)
- `DB_URL` — MySQL JDBC URL
- `DB_USERNAME` — DB user
- `DB_PASSWORD` — DB password

## Güvenlik Katmanları

Request akışı: `RateLimitFilter → JwtAuthFilter → SecurityFilterChain → Controller`

1. Rate limiting: IP-based, per endpoint group (login: 5/dk, register: 3/dk, forgot-password: 3/dk)
2. JWT validation: single-parse, header spoofing prevention (X-User-Id/X-User-Role stripped)
3. Role-based access: STUDENT, ADMIN
4. State transition validation: `canTransitionTo()` on all status enums
5. GlobalExceptionHandler: SQL/stacktrace/class names never leaked

## Test Hesapları

- Student: `test@yeditepe.edu.tr` / `Test1234`
- Admin: `admin2@yeditepe.edu.tr` / `Admin123!`

## API Endpoints

### Public
- `POST /api/auth/register` — Student registration
- `POST /api/auth/login` — Login (returns access + refresh token)
- `POST /api/auth/refresh` — Token rotation
- `POST /api/auth/forgot-password` — Password reset token
- `POST /api/auth/reset-password` — Reset password with token
- `GET /api/found-items/**` — Browse found items

### Authenticated
- `GET /api/auth/me` — Current user info
- `POST /api/auth/logout` — Invalidate refresh tokens
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/change-password` — Change password
- `POST /api/lost-reports` — Create lost report
- `POST /api/claim-requests` — Create claim request
- `GET /api/notifications/**` — User notifications

### Admin Only
- `POST /api/found-items` — Create found item
- `PUT /api/found-items/**` — Update found item
- `PUT /api/lost-reports/*/review` — Review lost report
- `PUT /api/claim-requests/*/review` — Review claim
- `POST /api/deliveries` — Create delivery record
- `GET /api/dashboard/**` — Dashboard stats

## Conventions

- Error responses: `{ success: false, message: "...", data: null }`
- Success responses: `{ success: true, message: "...", data: {...} }`
- Validation: Jakarta `@NotBlank`, `@Email`, `@Size` on DTOs
- Passwords: BCrypt encoded, min 6 chars
- Email: restricted to `@std.yeditepe.edu.tr` and `@yeditepe.edu.tr`
- Turkish character normalization in name-email matching
