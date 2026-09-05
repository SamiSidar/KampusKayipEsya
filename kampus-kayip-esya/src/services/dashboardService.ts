import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

// ============================================================
// dashboardService — Admin panelindeki özet sayıları getirir.
//
// Tek endpoint: GET /dashboard/stats
// ============================================================

export type DashboardStats = {
  pendingReportsCount: number;
  waitingOwnerItemsCount: number;
  activeLostReportsCount: number;
  deliveredItemsCount: number;
};

export const dashboardService = {
  getStats(token?: string | null) {
    return apiClient.get<DashboardStats>(ENDPOINTS.dashboard.stats, token);
  },
};