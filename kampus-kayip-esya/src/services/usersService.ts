import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import {
  UpdateUserProfileRequest,
  UserProfile,
} from '../types/user';

export const usersService = {
  getProfile(token?: string | null) {
    return apiClient.get<UserProfile>(ENDPOINTS.users.profile, token);
  },

  updateProfile(payload: UpdateUserProfileRequest, token?: string | null) {
    return apiClient.put<UserProfile>(
      ENDPOINTS.users.updateProfile,
      payload,
      token
    );
  },

  getUserById(userId: number, token?: string | null) {
    return apiClient.get<UserProfile>(
      ENDPOINTS.users.detail(userId),
      token
    );
  },
};