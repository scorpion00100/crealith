import { apiService } from './api';
import { AuthResponse, LoginForm, RegisterForm, User } from '@/types';

/**
 * Service d'authentification front:
 * - login/register + stockage tokens
 * - refresh, getProfile, updateProfile, changePassword
 * - helpers isAuthenticated/getToken/getCurrentUser
 */
class AuthServiceClass {
  /** Inscription utilisateur (BUYER/SELLER). */
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

  /** Connexion utilisateur. */
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

  /** Rafraîchit le token d'accès à partir du refresh token. */
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

  /** Récupère le profil courant. */
  async getProfile(): Promise<User> {
    const resp = await apiService.get<any>('/auth/profile');
    if (resp?.data?.user) return resp.data.user as User;
    if (resp?.user) return resp.user as User;
    return resp as User;
  }

  /** Met à jour le profil utilisateur. */
  async updateProfile(data: { firstName?: string; lastName?: string; avatar?: string | null; bio?: string | null }): Promise<User> {
    const resp = await apiService.put<any>('/auth/profile', data);
    const user = resp?.data?.data?.user || resp?.data?.user || resp?.user || resp;
    if (user) this.updateUser(user);
    return user as User;
  }

  /** Change le mot de passe. */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    const resp = await apiService.post<any>('/auth/change-password', data);
    return resp;
  }

  /** Déconnecte l'utilisateur et nettoie le stockage. */
  logout(): void {
    localStorage.removeItem('crealith_user');
    localStorage.removeItem('crealith_token');
  }

  /** Indique si un utilisateur est connecté (token valide + user). */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /** Renvoie l'utilisateur courant depuis localStorage. */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('crealith_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /** Renvoie le token s'il est valide, sinon nettoie et renvoie null. */
  getToken(): string | null {
    const token = localStorage.getItem('crealith_token');
    if (!token) return null;
    
    // Vérifier si le token est expiré
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        this.logout();
        return null;
      }
      const payload = JSON.parse(atob(parts[1] || ''));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        this.logout();
        return null;
      }
      return token;
    } catch {
      this.logout();
      return null;
    }
  }

  /** Met à jour partiellement l'utilisateur stocké. */
  updateUser(userData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('crealith_user', JSON.stringify(updatedUser));
    }
  }
}

export const authService = new AuthServiceClass();
