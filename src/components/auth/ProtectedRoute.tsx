import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import type { Role } from "@/types/database";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: string;
}

/**
 * Guard de rota parametrizável por roles e/ou permissões.
 * Se não autenticado → redirect para /login
 * Se sem permissão → redirect para rota padrão do role
 */
export function ProtectedRoute({ children, allowedRoles, requiredPermission }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const { hasPermission } = usePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const defaultRoutes: Record<Role, string> = {
      admin: "/",
      cliente: "/cliente",
      entregador: "/entregador",
    };
    return <Navigate to={defaultRoutes[role]} replace />;
  }

  // Check specific permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    const defaultRoutes: Record<Role, string> = {
      admin: "/admin",
      cliente: "/cliente",
      entregador: "/entregador",
    };
    return <Navigate to={defaultRoutes[role!] || "/"} replace />;
  }

  return <>{children}</>;
}
