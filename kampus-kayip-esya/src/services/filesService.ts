import { API_BASE_URL } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import {
  UploadFileRequest,
  UploadFileResponse,
} from '../types/file';
import { ApiErrorResponse } from '../types/common';

export const filesService = {
  async uploadFile(
    payload: UploadFileRequest,
    token?: string | null
  ): Promise<UploadFileResponse> {
    const formData = new FormData();

    formData.append('file', payload.file as Blob);
    formData.append('usage', payload.usage);

    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.files.upload}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    const hasJson = contentType?.includes('application/json');

    const data = hasJson ? await response.json() : null;

    if (!response.ok) {
      const errorData = data as ApiErrorResponse | null;

      throw {
        message:
          errorData?.message ||
          `Dosya yükleme başarısız oldu. HTTP durum kodu: ${response.status}`,
        status: response.status,
        path: ENDPOINTS.files.upload,
      } as ApiErrorResponse;
    }

    return data as UploadFileResponse;
  },

  async deleteFile(fileId: number, token?: string | null) {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.files.delete(fileId)}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!response.ok) {
      throw {
        message: `Dosya silme başarısız oldu. HTTP durum kodu: ${response.status}`,
        status: response.status,
        path: ENDPOINTS.files.delete(fileId),
      } as ApiErrorResponse;
    }
  },
};