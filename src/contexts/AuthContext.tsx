import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import type { Role } from "@/types/database";
import { getPermissionsForRole } from "@/lib/permissions";
import { useUserStore } from "@/data/mockUsers";

// ── Mock user type ──
export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  role: Role;
  cargo_id?: string;
  avatarUrl?: string;
  permissions?: string[];
}

// ── Rate limiting ──
interface LoginAttempt {
  count: number;
  firstAttemptAt: number;
}

const MAX_ATTEMPTS = 5;
const BLOCK_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const LOGIN_FEEDBACK_DELAY_MS = 200;

// ── Error mapping PT-BR ──
const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email ou senha incorretos.",
  email_not_confirmed: "Confirme seu email antes de entrar.",
  too_many_attempts: "Muitas tentativas. Tente novamente em 5 minutos.",
  user_inactive: "Conta inativa. Entre em contato com o administrador.",
  unknown: "Erro inesperado. Tente novamente.",
};

// ── Context type ──
interface AuthContextType {
  user: AuthUser | null;
  role: Role | null;
  loading: boolean;
  isBlocked: boolean;
  remainingAttempts: number;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => void;
  changeCargo: (cargoId: string) => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Role-based redirect paths ──
export const ROLE_REDIRECTS: Record<Role, string> = {
  admin: "/admin",
  cliente: "/cliente",
  entregador: "/entregador",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { findByEmail } = useUserStore();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt>({ count: 0, firstAttemptAt: 0 });
  const transitionTimeoutRef = useRef<number | null>(null);

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTransitionTimeout();
    };
  }, [clearTransitionTimeout]);

  const isBlocked = (() => {
    if (loginAttempts.count < MAX_ATTEMPTS) return false;
    const elapsed = Date.now() - loginAttempts.firstAttemptAt;
    return elapsed < BLOCK_WINDOW_MS;
  })();

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - loginAttempts.count);

  const login = useCallback(async (email: string, password: string) => {
    if (isBlocked) {
      return { success: false, error: ERROR_MESSAGES.too_many_attempts };
    }

    clearTransitionTimeout();
    setLoading(true);
    await new Promise((r) => setTimeout(r, LOGIN_FEEDBACK_DELAY_MS));

    const normalizedEmail = email.trim().toLowerCase();
    const account = findByEmail(normalizedEmail);

    if (!account || account.password !== password) {
      setLoginAttempts((prev) => ({
        count: prev.count + 1,
        firstAttemptAt: prev.count === 0 ? Date.now() : prev.firstAttemptAt,
      }));
      setLoading(false);
      return { success: false, error: ERROR_MESSAGES.invalid_credentials };
    }

    if (account.status === "inativo") {
      setLoading(false);
      return { success: false, error: ERROR_MESSAGES.user_inactive };
    }

    // Login success — inject permissions based on role + cargo
    const userWithPerms: AuthUser = {
      id: account.id,
      email: account.email,
      nome: account.nome,
      role: account.role,
      cargo_id: account.cargo_id ?? undefined,
      avatarUrl: account.avatarUrl ?? undefined,
      permissions: getPermissionsForRole(account.role, account.cargo_id ?? undefined),
    };
    setUser(userWithPerms);
    setLoginAttempts({ count: 0, firstAttemptAt: 0 });

    transitionTimeoutRef.current = window.setTimeout(() => {
      setLoading(false);
      transitionTimeoutRef.current = null;
    }, LOGIN_TRANSITION_MS);

    return { success: true, user: userWithPerms };
  }, [clearTransitionTimeout, isBlocked, findByEmail]);

  const logout = useCallback(() => {
    clearTransitionTimeout();
    setLoading(false);
    setUser(null);
  }, [clearTransitionTimeout]);

  const changeCargo = useCallback((cargoId: string) => {
    setUser(prev => {
      if (!prev || prev.role !== "admin") return prev;
      return {
        ...prev,
        cargo_id: cargoId,
        permissions: getPermissionsForRole("admin", cargoId),
      };
    });
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    console.log(`[MOCK] Password reset email sent to: ${email}`);
    return { success: true };
  }, []);

  const resetPassword = useCallback(async (_newPassword: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    console.log("[MOCK] Password updated successfully");
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        loading,
        isBlocked,
        remainingAttempts,
        login,
        logout,
        changeCargo,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
