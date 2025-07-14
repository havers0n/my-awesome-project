// Types and interfaces for authentication
export interface SignInFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateSignInForm = (formData: SignInFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.email) {
    errors.push('Email обязателен');
  } else if (!validateEmail(formData.email)) {
    errors.push('Некорректный email');
  }
  
  if (!formData.password) {
    errors.push('Пароль обязателен');
  } else if (!validatePassword(formData.password)) {
    errors.push('Пароль должен содержать минимум 6 символов');
  }
  
  return errors;
};
