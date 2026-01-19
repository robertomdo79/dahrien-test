import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'user';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface UserState {
  currentUser: User;
  setRole: (role: UserRole) => void;
}

// Predefined users for demonstration
const users: Record<UserRole, User> = {
  admin: {
    email: 'admin@sgret.com',
    name: 'Admin User',
    role: 'admin',
  },
  user: {
    email: 'robbiemdo79@gmail.com',
    name: 'Robbie Mundo',
    role: 'user',
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: users.admin, // Default to admin
      setRole: (role: UserRole) => set({ currentUser: users[role] }),
    }),
    {
      name: 'user-storage',
    }
  )
);

// Helper to check if user is admin
export const isAdmin = (user: User): boolean => user.role === 'admin';
