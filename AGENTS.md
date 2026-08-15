# AI Agent Instructions

## Code Style

- **Language**: Java 21 — use var where type is obvious, records for DTOs where applicable
- **Comments**: Turkish allowed in business logic comments, English for technical/API docs
- **Naming**: camelCase for methods/variables, PascalCase for classes
- **Error handling**: Never expose SQL errors, stack traces, or class names to API responses. All errors go through GlobalExceptionHandler
- **Security**: All secrets via environment variables (${ENV_VAR:default}). Never hardcode production credentials

## Architecture Rules

1. **Controller → Service → Repository** — no business logic in controllers
2. **DTOs** for request/response — never expose entities directly
3. **Status transitions** must use `canTransitionTo()` / `isEditable()` on enums
4. **Rate limiting** required for all public auth endpoints
5. **JWT claims** are the single source of truth for user identity — never trust request headers

## Testing Checklist

Before marking a change complete:
- [ ] Backend compiles: `./gradlew build`
- [ ] SecurityConfig permits/restricts endpoints correctly
- [ ] GlobalExceptionHandler covers new exception types
- [ ] New endpoints have proper role annotations
- [ ] DTOs have Jakarta validation annotations

## Database

- MySQL 8.0 via Docker
- Hibernate ddl-auto=update (dev only — use Flyway/Liquibase for production)
- Always add `@Index` on foreign key columns and frequently queried fields
- Connection pool: HikariCP with 10 max connections

## Frontend Coordination

The React Native frontend (kampus-kayip-esya) expects:
- API base: `http://localhost:8080/api`
- Response wrapper: `{ success, message, data, timestamp }`
- Auth header: `Authorization: Bearer <token>`
- Refresh flow: POST /api/auth/refresh with `{ refreshToken }`
