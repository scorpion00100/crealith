import { AuthResponse, LoginForm, RegisterForm, User } from '@/types';

// Service d'authentification temporaire pour développement
// TODO: Remplacer par les vraies implémentations API + storage
class AuthServiceClass {
  async register(data: RegisterForm): Promise<AuthResponse> {
    // Simulation d'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: `user_${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      avatar: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=8b5cf6&color=fff`,
      isVendor: data.accountType === 'seller'
    };

    const mockResponse: AuthResponse = {
      user: mockUser,
      token: `mock_token_${Date.now()}`
    };

    // Simuler le stockage
    localStorage.setItem('crealith_user', JSON.stringify(mockUser));
    localStorage.setItem('crealith_token', mockResponse.token);

    return mockResponse;
  }

  async login(data: LoginForm): Promise<AuthResponse> {
    // Simulation d'API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simuler validation (accepter tous les logins pour dev)
    const mockUser: User = {
      id: 'user_demo',
      firstName: 'John',
      lastName: 'Doe',
      email: data.email,
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=8b5cf6&color=fff',
      isVendor: true
    };

    const mockResponse: AuthResponse = {
      user: mockUser,
      token: `mock_token_${Date.now()}`
    };

    // Simuler le stockage
    localStorage.setItem('crealith_user', JSON.stringify(mockUser));
    localStorage.setItem('crealith_token', mockResponse.token);

    return mockResponse;
  }

  async getProfile(): Promise<User> {
    // Simulation d'API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
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
}

export const authService = new AuthServiceClass();
