// src/app/lib/auth.ts
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  }
};