import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import {
  ClaimRequest,
  ClaimRequestStatus,
  CreateClaimRequestRequest,
} from '../types/claimRequest';

/**
 * claimRequestsService — Teslim talebi API çağrıları.
 *
 * Backend'de admin işlemleri (onay/red/bilgi isteme) tek bir
 * PUT /claim-requests/{id}/review endpoint'inden yapılır.
 * "status" alanına enum değeri gönderilir:
 *   APPROVED, REJECTED, INFO_REQUESTED
 */
export const claimRequestsService = {
  // Tüm talepleri listele (admin)
  getClaimRequests(token?: string | null) {
    return apiClient.get<ClaimRequest[]>(
      ENDPOINTS.claimRequests.list,
      token
    );
  },

  // Belirli bir eşyaya ait talepleri listele (admin)
  getClaimRequestsByItem(itemId: number, token?: string | null) {
    return apiClient.get<ClaimRequest[]>(
      `${ENDPOINTS.claimRequests.list}?itemId=${itemId}`,
      token
    );
  },

  // Benim taleplerim (öğrenci)
  getMyClaimRequests(token?: string | null) {
    return apiClient.get<ClaimRequest[]>(
      ENDPOINTS.claimRequests.myRequests,
      token
    );
  },

  // Tek talep detayı
  getClaimRequestById(claimId: number, token?: string | null) {
    return apiClient.get<ClaimRequest>(
      ENDPOINTS.claimRequests.detail(claimId),
      token
    );
  },

  // Yeni talep oluştur (öğrenci)
  createClaimRequest(
    payload: CreateClaimRequestRequest,
    token?: string | null
  ) {
    return apiClient.post<ClaimRequest>(
      ENDPOINTS.claimRequests.create,
      payload,
      token
    );
  },

  // === Admin işlemleri ===

  approveClaimRequest(claimId: number, adminNote?: string, token?: string | null) {
    return apiClient.put<ClaimRequest>(
      ENDPOINTS.claimRequests.review(claimId),
      { status: 'APPROVED' as ClaimRequestStatus, adminNote },
      token
    );
  },

  rejectClaimRequest(claimId: number, adminNote?: string, token?: string | null) {
    return apiClient.put<ClaimRequest>(
      ENDPOINTS.claimRequests.review(claimId),
      { status: 'REJECTED' as ClaimRequestStatus, adminNote },
      token
    );
  },

  requestMoreInfo(claimId: number, adminNote: string, token?: string | null) {
    return apiClient.put<ClaimRequest>(
      ENDPOINTS.claimRequests.review(claimId),
      { status: 'INFO_REQUESTED' as ClaimRequestStatus, adminNote },
      token
    );
  },
};
