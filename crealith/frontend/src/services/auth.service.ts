import { apiService } from './api';
import { AuthResponse, LoginForm, RegisterForm, User } from '@/types';

class AuthServiceClass {
  async register(data: RegisterForm): Promise<AuthResponse> {
    try {
      const resp = await apiService.post<any>('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.accountType === 'seller' ? 'SELLER' : 'BUYER',
      }, false);

      const payload = resp?.data ? resp.data : resp;
      if (payload?.user) localStorage.setItem('crealith_user', JSON.stringify(payload.user));
      if (payload?.accessToken) localStorage.setItem('crealith_token', payload.accessToken);
      if (payload?.refreshToken) localStorage.setItem('crealith_refresh', payload.refreshToken);

      return payload as AuthResponse;
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message;
      if (status === 409) {
        throw new Error("Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.");
      }
      throw new Error(backendMessage || 'Erreur lors de la création du compte');
    }
  }

  async login(data: LoginForm): Promise<AuthResponse> {
    const resp = await apiService.post<any>('/auth/login', {
      email: data.email,
      password: data.password,
    }, false);

    const payload = resp?.data ? resp.data : resp;
    if (payload?.user) localStorage.setItem('crealith_user', JSON.stringify(payload.user));
    if (payload?.accessToken) localStorage.setItem('crealith_token', payload.accessToken);
    if (payload?.refreshToken) localStorage.setItem('crealith_refresh', payload.refreshToken);

    return payload as AuthResponse;
  }

  async refresh(): Promise<void> {
    // Utilisé par les interceptors si besoin côté appel direct
    const csrf = document.cookie.split('; ').find(c => c.startsWith('csrfToken='))?.split('=')[1];
    const refresh = localStorage.getItem('crealith_refresh');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (csrf) headers['X-CSRF-Token'] = csrf;

    const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: refresh ? JSON.stringify({ refreshToken: refresh }) : undefined
    });
    if (!resp.ok) throw new Error('Refresh failed');
    const data = await resp.json();
    const accessToken = data.accessToken || data?.data?.accessToken;
    const newRefreshToken = data.refreshToken || data?.data?.refreshToken;
    if (accessToken) localStorage.setItem('crealith_token', accessToken);
    if (newRefreshToken) localStorage.setItem('crealith_refresh', newRefreshToken);
  }

  async getProfile(): Promise<User> {
    const resp = await apiService.get<any>('/auth/profile');
    if (resp?.data?.user) return resp.data.user as User;
    if (resp?.user) return resp.user as User;
    return resp as User;
  }

  logout(): void {
    localStorage.removeItem('crealith_user');
    localStorage.removeItem('crealith_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('crealith_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('crealith_token');
  }

  updateUser(userData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('crealith_user', JSON.stringify(updatedUser));
    }
  }
}

export const authService = new AuthServiceClass();
