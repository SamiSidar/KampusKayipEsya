/**
 * Backend API endpoint tanımları.
 *
 * Her endpoint backend controller'daki URL ile birebir eşleşir.
 * Dinamik parametreli URL'ler fonksiyon olarak tanımlanır.
 */
export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
  },

  foundItems: {
    // GET /found-items — tüm eşyaları listeler
    // Query params: ?status=WAITING_OWNER&category=WALLET&search=cuzdan
    list: '/found-items',
    detail: (itemId: number) => `/found-items/${itemId}`,
    create: '/found-items',
    update: (itemId: number) => `/found-items/${itemId}`,
  },

  lostReports: {
    list: '/lost-reports',
    myReports: '/lost-reports/my',
    detail: (reportId: number) => `/lost-reports/${reportId}`,
    create: '/lost-reports',
    update: (reportId: number) => `/lost-reports/${reportId}`,
    // PUT /lost-reports/{id}/review — tek endpoint ile onay/red/revizyon
    review: (reportId: number) => `/lost-reports/${reportId}/review`,
  },

  claimRequests: {
    list: '/claim-requests',
    myRequests: '/claim-requests/my',
    detail: (claimId: number) => `/claim-requests/${claimId}`,
    create: '/claim-requests',
    // PUT /claim-requests/{id}/review — tek endpoint ile onay/red
    review: (claimId: number) => `/claim-requests/${claimId}/review`,
  },

  notifications: {
    list: '/notifications',
    unread: '/notifications/unread',
    unreadCount: '/notifications/unread-count',
    markAsRead: (notificationId: number) =>
      `/notifications/${notificationId}/read`,
    markAllAsRead: '/notifications/read-all',
  },

  deliveries: {
    list: '/deliveries',
    detail: (deliveryId: number) => `/deliveries/${deliveryId}`,
    create: '/deliveries',
  },

  dashboard: {
    stats: '/dashboard/stats',
  },

  files: {
    upload: '/files/upload',
    delete: (fileId: number) => `/files/${fileId}`,
  },

  users: {
    profile: '/auth/me',
    updateProfile: '/auth/profile',
    detail: (userId: number) => `/admin/users/${userId}`,
  },
} as const;