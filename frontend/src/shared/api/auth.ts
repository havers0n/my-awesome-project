import api from './index';

export const authAPI = {
  checkEmailUnique: async (email: string) => {
    try {
      const res = await api.get(`/admin/users/check-email?email=${encodeURIComponent(email)}`);
      return res.data?.unique === true;
    } catch {
      return false;
    }
  },
  getProfile: () => {
    return api.get('/auth/me');
  },
  register: (userData: {
    email: string;
    password: string;
    full_name?: string;
    organization_id?: number;
    role?: string;
    phone?: string;
    position?: string;
  }) => {
    return api.post('/admin/users', userData);
  },
  updateProfile: (userData: { fullName?: string; }) => {
    return api.put('/users/profile', userData);
  },
  logout: () => {
    return api.post('/auth/logout');
  },
  resetPassword: (email: string) => {
    return api.post('/auth/reset-password', { email });
  }
};
