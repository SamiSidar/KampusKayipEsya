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
  LostReport: undefined;
  Notifications: undefined;
  Success: undefined;
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
  FoundItemCreate: undefined;
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

  DeliveryDetail: {
    deliveryId: number;
  };
};
