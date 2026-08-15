import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

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