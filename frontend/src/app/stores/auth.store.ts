import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Datos del usuario de la sesion actual. */
export interface SessionUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CASHIER';
  branchId: number | null;
}

interface AuthState {
  accessToken: string | null;
  user: SessionUser | null;
  setSession: (accessToken: string, user: SessionUser) => void;
  clearSession: () => void;
  isAdmin: () => boolean;
}

/**
 * Estado de la sesion.
 *
 * Se persiste en localStorage para que recargar la pagina no cierre la sesion.
 * El token vive aqui, no en el estado del servidor: es lo unico que necesita
 * sobrevivir a una recarga.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      setSession: (accessToken, user) => set({ accessToken, user }),
      clearSession: () => set({ accessToken: null, user: null }),
      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'storecore-auth',
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    },
  ),
);
