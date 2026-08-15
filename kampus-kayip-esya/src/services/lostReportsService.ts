import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import {
  CreateLostReportRequest,
  LostReport,
  LostReportStatus,
  UpdateLostReportRequest,
} from '../types/lostReport';

/**
 * lostReportsService — Kayıp eşya bildirisi API çağrıları.
 *
 * Backend'de admin işlemleri (onay/red/revizyon/eşleştirme) tek bir
 * PUT /lost-reports/{id}/review endpoint'inden yapılır.
 * "status" alanına enum değeri gönderilir:
 *   APPROVED, REJECTED, REVISION_REQUESTED, MATCH_FOUND
 */

// Backend'in review endpoint'ine gönderilen istek yapısı
type ReviewRequest = {
  status: LostReportStatus;
  adminNote?: string;
  revisionNote?: string;
  matchedItemId?: number;
};

export const lostReportsService = {
  // Tüm kayıp bildirilerini listele
  getLostReports(token?: string | null) {
    return apiClient.get<LostReport[]>(ENDPOINTS.lostReports.list, token);
  },

  // Sadece benim bildirimlerim (öğrenci)
  getMyReports(token?: string | null) {
    return apiClient.get<LostReport[]>(
      ENDPOINTS.lostReports.myReports,
      token
    );
  },

  // Tek bildiri detayı
  getLostReportById(reportId: number, token?: string | null) {
    return apiClient.get<LostReport>(
      ENDPOINTS.lostReports.detail(reportId),
      token
    );
  },

  // Yeni bildiri oluştur (öğrenci)
  createLostReport(payload: CreateLostReportRequest, token?: string | null) {
    return apiClient.post<LostReport>(
      ENDPOINTS.lostReports.create,
      payload,
      token
    );
  },

  // Bildiri güncelle (öğrenci — revizyon sonrası düzeltme)
  updateLostReport(
    reportId: number,
    payload: UpdateLostReportRequest,
    token?: string | null
  ) {
    return apiClient.put<LostReport>(
      ENDPOINTS.lostReports.update(reportId),
      payload,
      token
    );
  },

  // === Admin işlemleri (hepsi /review endpoint'ini kullanır) ===

  approveLostReport(reportId: number, adminNote?: string, token?: string | null) {
    const body: ReviewRequest = { status: 'APPROVED', adminNote };
    return apiClient.put<LostReport>(
      ENDPOINTS.lostReports.review(reportId),
      body,
      token
    );
  },

  rejectLostReport(reportId: number, adminNote?: string, token?: string | null) {
    const body: ReviewRequest = { status: 'REJECTED', adminNote };
    return apiClient.put<LostReport>(
      ENDPOINTS.lostReports.review(reportId),
      body,
      token
    );
  },

  requestRevision(reportId: number, revisionNote: string, token?: string | null) {
    const body: ReviewRequest = { status: 'REVISION_REQUESTED', revisionNote };
    return apiClient.put<LostReport>(
      ENDPOINTS.lostReports.review(reportId),
      body,
      token
    );
  },

  matchFoundItem(reportId: number, matchedItemId: number, token?: string | null) {
    const body: ReviewRequest = { status: 'MATCH_FOUND', matchedItemId };
    return apiClient.put<LostReport>(
      ENDPOINTS.lostReports.review(reportId),
      body,
      token
    );
  },
};
