// ============================================================
// RootStackParamList — Her ekranın hangi parametreleri aldığını tanımlar.
//
// React Navigation bu tipi kullanarak navigation.navigate() çağrılarını
// denetler. Örneğin ItemDetail'e itemId göndermeyi unutursan TypeScript
// hata verir.
//
// 'undefined' = ekran parametre almaz.
// '{ x?: number } | undefined' = parametre isteğe bağlıdır.
// ============================================================

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  EmailVerification: {
    email: string;
  };
  ForgotPassword: undefined;
  PersonalInfo: undefined;

  StudentHome: undefined;
  Listings: undefined;
  MyReports: undefined;
  StudentProfile: undefined;
  // reportId verilirse mevcut bildiri düzenlenir, verilmezse yeni bildiri
  LostReport: { reportId?: number } | undefined;
  Notifications: undefined;
  Success: { from?: 'register' | 'report' | 'admin' };
  EmptyStatePreview: undefined;

  ItemDetail: {
    itemId: number;
  };

  ClaimRequest: {
    itemId: number;
  };

  StudentReportDetail: {
    reportId: number;
  };

  AdminPanel: undefined;
  PendingReports: undefined;
  WaitingOwnerItems: undefined;
  ActiveLostReports: undefined;
  DeliveredItems: undefined;
  // itemId verilirse ekran "düzenleme" modunda açılır, verilmezse yeni kayıt
  FoundItemCreate: { itemId?: number } | undefined;
  AdminReview: {
    reportId: number;
  };
  RevisionRequest: {
    reportId: number;
  };
  AdminProfile: undefined;

  AdminItemDetail: {
    itemId: number;
  };

  AdminClaimRequestDetail: {
    claimId: number;
  };

  DeliveryCreation: {
    claimId: number;
  };

  DeliveryDetail: {
    deliveryId: number;
  };
};
