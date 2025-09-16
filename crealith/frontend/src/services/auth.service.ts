import { apiService } from './api';
import { AuthResponse, LoginForm, RegisterForm, User } from '@/types';

class AuthServiceClass {
  async register(data: RegisterForm): Promise<AuthResponse> {
    try {
      const response = await apiService.post<{ success: boolean; data: AuthResponse; message: string }>('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.accountType === 'seller' ? 'SELLER' : 'BUYER',
      }, false);

      if (response.success) {
        localStorage.setItem('crealith_user', JSON.stringify(response.data.user));
        localStorage.setItem('crealith_token', response.data.token);
      }

      return response.data;
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
    const response = await apiService.post<{ success: boolean; data: AuthResponse; message: string }>('/auth/login', {
      email: data.email,
      password: data.password,
    }, false);

    if (response.success) {
      localStorage.setItem('crealith_user', JSON.stringify(response.data.user));
      localStorage.setItem('crealith_token', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('crealith_refresh', response.data.refreshToken);
      }
    }

    return response.data;
    if (response.success) {
      localStorage.setItem('crealith_user', JSON.stringify(response.data.user));
      localStorage.setItem('crealith_token', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('crealith_refresh', response.data.refreshToken);
      }
    }

    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<{ success: boolean; data: User }>('/auth/profile');
    return response.data;
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
