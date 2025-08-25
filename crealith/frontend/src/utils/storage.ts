import { User } from '@/types';

const TOKEN_KEY = 'crealith_token';
const USER_KEY = 'crealith_user';

export const tokenStorage = {
  get: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  remove: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  exists: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

export const userStorage = {
  get: (): User | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  set: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  remove: (): void => {
    localStorage.removeItem(USER_KEY);
  },
  
  exists: (): boolean => {
    return !!localStorage.getItem(USER_KEY);
  }
};

export const clearAllStorage = (): void => {
  tokenStorage.remove();
  userStorage.remove();
};