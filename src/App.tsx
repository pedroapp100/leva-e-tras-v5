import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, ROLE_REDIRECTS } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { GlobalStoreProvider } from "@/contexts/GlobalStore";
import { CaixaStoreProvider } from "@/contexts/CaixaStore";
import { LogStoreProvider } from "@/contexts/LogStore";
import { UserStoreProvider } from "@/data/mockUsers";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { OnboardingProvider, OnboardingOverlay, OnboardingTooltip, WelcomeModal } from "@/onboarding";

// Layouts
import { AdminLayout } from "./components/layouts/AdminLayout";
import { ClientLayout } from "./components/layouts/ClientLayout";
import { DriverLayout } from "./components/layouts/DriverLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import SolicitacoesPage from "./pages/admin/SolicitacoesPage";
import ClientesPage from "./pages/admin/ClientesPage";
import EntregadoresPage from "./pages/admin/EntregadoresPage";
import FaturasPage from "./pages/admin/FaturasPage";
import FinanceiroPage from "./pages/admin/FinanceiroPage";
import RelatoriosPage from "./pages/admin/RelatoriosPage";
import LogsPage from "./pages/admin/LogsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import EntregasPage from "./pages/admin/EntregasPage";
import CaixasEntregadoresPage from "./pages/admin/CaixasEntregadoresPage";

// Cliente pages
import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import MinhasSolicitacoesPage from "./pages/cliente/MinhasSolicitacoesPage";
import ClienteFinanceiroPage from "./pages/cliente/ClienteFinanceiroPage";
import ClientePerfilPage from "./pages/cliente/ClientePerfilPage";
import SimuladorClientePage from "./pages/cliente/SimuladorClientePage";

// Entregador pages
import EntregadorDashboard from "./pages/entregador/EntregadorDashboard";
import EntregadorSolicitacoesPage from "./pages/entregador/EntregadorSolicitacoesPage";
import EntregadorHistoricoPage from "./pages/entregador/EntregadorHistoricoPage";
import EntregadorFinanceiroPage from "./pages/entregador/EntregadorFinanceiroPage";
import EntregadorPerfilPage from "./pages/entregador/EntregadorPerfilPage";
import EntregadorCaixaPage from "./pages/entregador/EntregadorCaixaPage";

// Not found
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RootRedirect() {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/admin" replace />;
  return <Navigate to={ROLE_REDIRECTS[role!] || "/admin"} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserStoreProvider>
          <AuthProvider>
            <LogStoreProvider>
            <GlobalStoreProvider>
            <CaixaStoreProvider>
            <OnboardingProvider>
              <WelcomeModal />
              <OnboardingOverlay />
              <OnboardingTooltip />
              <ErrorBoundary>
                <>
                  <Routes>
                  {/* Public */}
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/entregas-moto" element={<PlaceholderPage title="Entregas Moto" />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/login/reset" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  {/* Admin */}
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="solicitacoes" element={<SolicitacoesPage />} />
                    <Route path="clientes" element={<ClientesPage />} />
                    <Route path="entregadores" element={<EntregadoresPage />} />
                    <Route path="entregas" element={<EntregasPage />} />
                    <Route path="caixas-entregadores" element={<CaixasEntregadoresPage />} />
                    <Route path="faturas" element={<FaturasPage />} />
                    <Route path="financeiro" element={<FinanceiroPage />} />
                    <Route path="relatorios" element={<RelatoriosPage />} />
                    <Route path="logs" element={<LogsPage />} />
                    <Route path="configuracoes" element={<SettingsPage />} />
                  </Route>

                  {/* Cliente */}
                  <Route path="/cliente" element={<ProtectedRoute allowedRoles={["cliente"]}><ClientLayout /></ProtectedRoute>}>
                    <Route index element={<ClienteDashboard />} />
                    <Route path="solicitacoes" element={<MinhasSolicitacoesPage />} />
                    <Route path="financeiro" element={<ClienteFinanceiroPage />} />
                    <Route path="simulador" element={<SimuladorClientePage />} />
                    <Route path="perfil" element={<ClientePerfilPage />} />
                  </Route>

                  {/* Entregador */}
                  <Route path="/entregador" element={<ProtectedRoute allowedRoles={["entregador"]}><DriverLayout /></ProtectedRoute>}>
                    <Route index element={<EntregadorDashboard />} />
                    <Route path="solicitacoes" element={<EntregadorSolicitacoesPage />} />
                    <Route path="historico" element={<EntregadorHistoricoPage />} />
                    <Route path="financeiro" element={<EntregadorFinanceiroPage />} />
                    <Route path="caixa" element={<EntregadorCaixaPage />} />
                    <Route path="perfil" element={<EntregadorPerfilPage />} />
                  </Route>

                    {/* Redirects for convenience */}
                    <Route path="/clientes" element={<Navigate to="/admin/clientes" replace />} />
                    <Route path="/entregadores" element={<Navigate to="/admin/entregadores" replace />} />
                    <Route path="/solicitacoes" element={<Navigate to="/admin/solicitacoes" replace />} />
                    <Route path="/faturas" element={<Navigate to="/admin/faturas" replace />} />
                    <Route path="/financeiro" element={<Navigate to="/admin/financeiro" replace />} />
                    <Route path="/relatorios" element={<Navigate to="/admin/relatorios" replace />} />
                    <Route path="/configuracoes" element={<Navigate to="/admin/configuracoes" replace />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </>
              </ErrorBoundary>
            </OnboardingProvider>
            </CaixaStoreProvider>
            </GlobalStoreProvider>
            </LogStoreProvider>
          </AuthProvider>
          </UserStoreProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
