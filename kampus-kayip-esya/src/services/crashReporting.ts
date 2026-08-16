/**
 * Crash Reporting Service
 * 
 * Sentry entegrasyonu için hazır altyapı.
 * Kurulum:
 *   1. npx expo install @sentry/react-native
 *   2. app.json plugins'e ["@sentry/react-native/expo", { "organization": "...", "project": "..." }] ekle
 *   3. Aşağıdaki SENTRY_DSN değerini gerçek DSN ile değiştir
 *   4. initCrashReporting() fonksiyonundaki yorumları kaldır
 */

// import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = ''; // Sentry projesinden alınacak DSN

let isInitialized = false;

/**
 * Crash reporting servisini başlatır.
 * App.tsx'te uygulama başlarken çağrılmalıdır.
 */
export function initCrashReporting(): void {
  if (isInitialized) return;

  if (!SENTRY_DSN) {
    console.warn('[CrashReporting] SENTRY_DSN tanımlı değil — crash reporting devre dışı.');
    isInitialized = true;
    return;
  }

  // Sentry.init({
  //   dsn: SENTRY_DSN,
  //   debug: __DEV__,
  //   tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  //   enableAutoSessionTracking: true,
  //   sessionTrackingIntervalMillis: 30_000,
  //   attachStacktrace: true,
  //   environment: __DEV__ ? 'development' : 'production',
  // });

  isInitialized = true;
  console.log('[CrashReporting] Sentry başlatıldı.');
}

/**
 * Yakalanan hatayı raporlar.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (__DEV__) {
    console.error('[CrashReporting] Exception:', error, context);
    return;
  }

  // Sentry.captureException(error, {
  //   extra: context,
  // });
}

/**
 * Bilgi mesajı gönderir (hata olmayan önemli olaylar).
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (__DEV__) {
    console.log(`[CrashReporting] ${level}: ${message}`);
    return;
  }

  // Sentry.captureMessage(message, level);
}

/**
 * Kullanıcı bilgisini crash raporlarına ekler.
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  // Sentry.setUser(user);
}

/**
 * Unhandled promise rejection'ları yakalar.
 */
export function setupGlobalHandlers(): void {
  const originalHandler = (globalThis as any).ErrorUtils?.getGlobalHandler?.();

  (globalThis as any).ErrorUtils?.setGlobalHandler?.((error: Error, isFatal: boolean) => {
    captureException(error, { isFatal });
    originalHandler?.(error, isFatal);
  });

  // Unhandled promise rejections
  const rejectionTracking = require('promise/setimmediate/rejection-tracking');
  rejectionTracking.enable({
    allRejections: true,
    onUnhandled: (_id: number, error: unknown) => {
      captureException(error, { type: 'unhandledRejection' });
    },
  });
}
