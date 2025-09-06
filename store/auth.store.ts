import { getCurrentUser } from '@/lib/appwrite';
import { User } from '@/type';
import { create } from 'zustand';

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value: boolean) => {
        set({ isAuthenticated: value });
    },

    setUser: (user: User | null) => {
        set({ user });
    },

    setLoading: (value: boolean) => {
        set({ isLoading: value });
    },

    fetchAuthenticatedUser: async () => {
        try {
            set({ isLoading: true });

            const user = await getCurrentUser();

            if (user && typeof user === 'object') {
                set({ 
                    isAuthenticated: true, 
                    user: user as unknown as User,
                    isLoading: false 
                });
            } else {
                set({ 
                    isAuthenticated: false, 
                    user: null,
                    isLoading: false 
                });
            }

        } catch (e) {
            console.log('fetchAuthenticatedUser error', e);
            set({ 
                isAuthenticated: false, 
                user: null,
                isLoading: false 
            });
        }
    },
}));

export default useAuthStore;