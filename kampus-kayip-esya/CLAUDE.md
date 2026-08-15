@AGENTS.md

# Kampüs Kayıp Eşya Uygulaması — Frontend

React Native / Expo SDK 57 ile yazılmış cross-platform (iOS, Android, Web) kayıp eşya uygulaması.

## Tech Stack

- **Framework**: React Native 0.86, Expo SDK 57
- **Language**: TypeScript 6.0
- **Navigation**: React Navigation 7 (native-stack)
- **Auth**: JWT with refresh token rotation
- **Storage**: expo-secure-store (mobile), localStorage (web)
- **Validation**: Zod schemas

## Proje Yapısı

```
src/
├── api/            # apiClient (fetch wrapper), endpoints
├── components/     # Shared components (AppHeader, BottomBar, ErrorBoundary)
├── context/        # AuthContext (login/logout/refresh)
├── navigation/     # RootNavigator, types
├── screens/        # All app screens
├── services/       # API service functions
├── theme/          # colors, spacing
├── types/          # TypeScript type definitions
└── validation/     # Zod schemas
```

## Çalıştırma

```bash
npm install
npx expo start --web    # Web
npx expo start          # Mobile
```

## Architecture

- **apiClient**: Centralized fetch wrapper with auto token refresh on 401
- **AuthContext**: Manages access + refresh tokens, auto-refresh on app load
- **ErrorBoundary**: Catches unhandled React errors
- **Zod validation**: All form inputs validated before API calls

## Conventions

- Lists: Use `FlatList` (not ScrollView) for data-driven lists
- Forms: ScrollView is fine for forms/detail pages
- Callbacks: Wrap with `useCallback` for FlatList render items and event handlers
- Error handling: Always show user-friendly error messages, log details to console
- Token storage: expo-secure-store on mobile, localStorage on web (acceptable for dev)
