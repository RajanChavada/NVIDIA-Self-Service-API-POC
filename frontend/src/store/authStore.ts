import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    username: string;
    email: string;
    department: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (username: string, _password: string) => {
                // Mock LDAP login - accepts any credentials
                const mockUser: User = {
                    username,
                    email: `${username}@nvidia.com`,
                    department: 'Engineering',
                };
                set({ user: mockUser, isAuthenticated: true });
            },
            logout: () => {
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
