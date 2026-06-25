import { createContext } from 'react';

export type AppUser = {
  id: string;
  email?: string;
  phone?: string | null;
  user_metadata: {
    display_name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
};

export type AuthContextValue = {
  user: AppUser | null;
  session: unknown | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
