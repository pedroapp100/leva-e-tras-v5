import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowDownUp, AlertTriangle, CheckCircle, Plus, Eye, Lock, Pencil, FileWarning } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { MetricCard } from "@/components/shared/MetricCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/formatters";
import type { CaixaEntregador } from "@/data/mockCaixas";
import { useCaixaStore } from "@/contexts/CaixaStore";
import { AbrirCaixaDialog } from "./caixas/AbrirCaixaDialog";
import { FecharCaixaDialog } from "./caixas/FecharCaixaDialog";
import { EditarCaixaDialog } from "./caixas/EditarCaixaDialog";
import { JustificativaDivergenciaDialog } from "./caixas/JustificativaDivergenciaDialog";
import { CaixaDetailsModal } from "./caixas/CaixaDetailsModal";
import { toast } from "sonner";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "todos", label: "Todos os Status" },
  { value: "aberto", label: "Aberto" },
  { value: "fechado", label: "Fechado" },
  { value: "divergente", label: "Divergente" },
];

export default function CaixasEntregadoresPage() {
  const { caixas, abrirCaixa, fecharCaixa, editarCaixa, justificarDivergencia } = useCaixaStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [abrirOpen, setAbrirOpen] = useState(false);
  const [fecharTarget, setFecharTarget] = useState<CaixaEntregador | null>(null);
  const [editarTarget, setEditarTarget] = useState<CaixaEntregador | null>(null);
  const [justificarTarget, setJustificarTarget] = useState<CaixaEntregador | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<CaixaEntregador | null>(null);

  const filtered = useMemo(() => {
    return caixas.filter((c) => {
      const matchSearch = c.entregador_nome.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [caixas, search, statusFilter]);

  const metrics = useMemo(() => {
    const abertos = caixas.filter((c) => c.status === "aberto");
    const divergentes = caixas.filter((c) => c.status === "divergente");
    const totalTroco = abertos.reduce((s, c) => s + c.troco_inicial, 0);
    const totalRecebidoHoje = caixas
      .filter((c) => c.data === new Date().toISOString().split("T")[0])
      .reduce((s, c) => s + c.total_recebido, 0);
    return { abertos: abertos.length, divergentes: divergentes.length, totalTroco, totalRecebidoHoje };
  }, [caixas]);

  const hoje = new Date().toISOString().split("T")[0];
  const openEntregadorIds = caixas.filter((c) => c.status === "aberto" && c.data === hoje).map((c) => c.entregador_id);

  const handleAbrirCaixa = (entregadorId: string, trocoInicial: number) => {
    abrirCaixa(entregadorId, trocoInicial);
    toast.success("Caixa aberto com sucesso!");
  };

  const handleFecharCaixa = (caixaId: string, valorDevolvido: number, observacoes: string) => {
    fecharCaixa(caixaId, valorDevolvido, observacoes);
    toast.success("Caixa fechado com sucesso");
  };

  const handleEditarCaixa = (caixaId: string, trocoInicial: number, observacoes: string) => {
    editarCaixa(caixaId, trocoInicial, observacoes);
    toast.success("Caixa atualizado com sucesso");
  };

  const handleJustificar = (caixaId: string, justificativa: string) => {
    justificarDivergencia(caixaId, justificativa);
    toast.success("Justificativa registrada com sucesso");
  };

  return (
    <PageContainer
      title="Caixas Entregadores"
      subtitle="Controle de troco e recebimentos em dinheiro dos entregadores."
      actions={
        <Button onClick={() => setAbrirOpen(true)} size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Abrir Caixa
        </Button>
      }
    >
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={fadeUp}>
          <MetricCard title="Caixas Abertos" value={metrics.abertos} icon={Wallet} subtitle="Hoje" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <MetricCard title="Troco Distribuído" value={formatCurrency(metrics.totalTroco)} icon={ArrowDownUp} subtitle="Em aberto" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <MetricCard title="Recebido Hoje" value={formatCurrency(metrics.totalRecebidoHoje)} icon={CheckCircle} subtitle="Em dinheiro" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <MetricCard title="Divergências" value={metrics.divergentes} icon={AlertTriangle} subtitle="Necessitam atenção" className={metrics.divergentes > 0 ? "border-l-4 border-l-destructive" : ""} />
        </motion.div>
      </motion.div>

      <Card>
        <CardContent className="pt-4 pb-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar por entregador..." />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={Wallet} title="Nenhum caixa encontrado" subtitle="Abra um novo caixa para um entregador." />
      ) : (
        <Card>
          <div className="rounded-md border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entregador</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Troco</TableHead>
                  <TableHead className="text-center">Entregas</TableHead>
                  <TableHead className="text-right">Recebido</TableHead>
                  <TableHead className="text-right">Esperado</TableHead>
                  <TableHead className="text-right">Devolvido</TableHead>
                  <TableHead className="text-right">Diferença</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.entregador_nome}</TableCell>
                    <TableCell className="tabular-nums">{new Date(c.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(c.troco_inicial)}</TableCell>
                    <TableCell className="text-center tabular-nums">{c.recebimentos.length}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(c.total_recebido)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatCurrency(c.total_esperado)}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.valor_devolvido !== null ? formatCurrency(c.valor_devolvido) : "—"}</TableCell>
                    <TableCell className={`text-right tabular-nums font-medium ${c.diferenca === null ? "" : c.diferenca === 0 ? "text-status-completed" : "text-destructive"}`}>
                      {c.diferenca !== null ? formatCurrency(c.diferenca) : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailsTarget(c)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalhes</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditarTarget(c)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar caixa</TooltipContent>
                        </Tooltip>
                        {c.status === "aberto" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-status-pending hover:text-status-pending/80" onClick={() => setFecharTarget(c)}>
                                <Lock className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Fechar caixa</TooltipContent>
                          </Tooltip>
                        )}
                        {c.status === "divergente" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => setJustificarTarget(c)}>
                                <FileWarning className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Relatar motivo da falta</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <AbrirCaixaDialog open={abrirOpen} onOpenChange={setAbrirOpen} onConfirm={handleAbrirCaixa} existingEntregadorIds={openEntregadorIds} />
      <FecharCaixaDialog open={!!fecharTarget} onOpenChange={(o) => !o && setFecharTarget(null)} caixa={fecharTarget} onConfirm={handleFecharCaixa} />
      <EditarCaixaDialog open={!!editarTarget} onOpenChange={(o) => !o && setEditarTarget(null)} caixa={editarTarget} onConfirm={handleEditarCaixa} />
      <JustificativaDivergenciaDialog open={!!justificarTarget} onOpenChange={(o) => !o && setJustificarTarget(null)} caixa={justificarTarget} onConfirm={handleJustificar} />
      <CaixaDetailsModal open={!!detailsTarget} onOpenChange={(o) => !o && setDetailsTarget(null)} caixa={detailsTarget} />
    </PageContainer>
  );
}
