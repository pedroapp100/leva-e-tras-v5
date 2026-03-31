import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowDownUp, AlertTriangle, CheckCircle, Plus, Eye, Pencil, Lock, FileWarning, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageContainer } from "@/components/shared/PageContainer";
import { MetricCard } from "@/components/shared/MetricCard";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { DatePickerWithRange } from "@/components/shared/DatePickerWithRange";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import type { DateRange } from "react-day-picker";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os Status" },
  { value: "aberto", label: "Aberto" },
  { value: "fechado", label: "Fechado" },
  { value: "divergente", label: "Divergente" },
];

const PERIODO_OPTIONS = [
  { value: "hoje", label: "Caixas do Dia" },
  { value: "historico", label: "Histórico" },
];

export default function CaixasEntregadoresPage() {
  const { caixas, abrirCaixa, fecharCaixa, editarCaixa, justificarDivergencia } = useCaixaStore();
  const [abrirOpen, setAbrirOpen] = useState(false);
  const [fecharTarget, setFecharTarget] = useState<CaixaEntregador | null>(null);
  const [editarTarget, setEditarTarget] = useState<CaixaEntregador | null>(null);
  const [justificarTarget, setJustificarTarget] = useState<CaixaEntregador | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<CaixaEntregador | null>(null);

  const [periodoFilter, setPeriodoFilter] = useState("hoje");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [entregadorFilter, setEntregadorFilter] = useState("todos");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const hoje = new Date().toISOString().split("T")[0];

  const metrics = useMemo(() => {
    const abertos = caixas.filter((c) => c.status === "aberto");
    const divergentes = caixas.filter((c) => c.status === "divergente");
    const totalTroco = abertos.reduce((s, c) => s + c.troco_inicial, 0);
    const totalRecebidoHoje = caixas
      .filter((c) => c.data === hoje)
      .reduce((s, c) => s + c.total_recebido, 0);
    return { abertos: abertos.length, divergentes: divergentes.length, totalTroco, totalRecebidoHoje };
  }, [caixas, hoje]);

  const openEntregadorIds = caixas.filter((c) => c.status === "aberto" && c.data === hoje).map((c) => c.entregador_id);

  const baseCaixas = useMemo(() => {
    if (periodoFilter === "hoje") {
      return caixas.filter((c) => c.data === hoje);
    }
    return caixas.filter((c) => c.status !== "aberto" || c.data !== hoje);
  }, [caixas, periodoFilter, hoje]);

  const uniqueEntregadores = useMemo(() => {
    const map = new Map<string, string>();
    baseCaixas.forEach((c) => map.set(c.entregador_id, c.entregador_nome));
    return Array.from(map, ([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [baseCaixas]);

  const filtered = useMemo(() => {
    return baseCaixas.filter((c) => {
      const matchSearch = c.entregador_nome.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "todos" || c.status === statusFilter;
      const matchEntregador = entregadorFilter === "todos" || c.entregador_id === entregadorFilter;

      let matchDate = true;
      if (periodoFilter === "historico" && dateRange?.from) {
        const caixaDate = new Date(c.data);
        matchDate = caixaDate >= dateRange.from;
        if (dateRange.to) {
          matchDate = matchDate && caixaDate <= dateRange.to;
        }
      }

      return matchSearch && matchStatus && matchEntregador && matchDate;
    });
  }, [baseCaixas, search, statusFilter, entregadorFilter, dateRange, periodoFilter]);

  // Group filtered caixas by date for histórico view
  const groupedByDate = useMemo(() => {
    if (periodoFilter !== "historico") return [];
    const map = new Map<string, CaixaEntregador[]>();
    filtered.forEach((c) => {
      const group = map.get(c.data) || [];
      group.push(c);
      map.set(c.data, group);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered, periodoFilter]);

  const handleAbrirCaixa = (entregadorId: string, trocoInicial: number) => {
    const success = abrirCaixa(entregadorId, trocoInicial);
    if (success) {
      toast.success("Caixa aberto com sucesso!");
    } else {
      toast.error("Este entregador já possui um caixa aberto hoje.");
    }
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

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 pb-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar por entregador..." />
            </div>
            <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODO_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entregadorFilter} onValueChange={setEntregadorFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Entregadores</SelectItem>
                {uniqueEntregadores.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {periodoFilter === "historico" && (
              <DatePickerWithRange value={dateRange} onChange={setDateRange} placeholder="Período" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <EmptyState icon={Wallet} title="Nenhum caixa encontrado" subtitle={periodoFilter === "hoje" ? "Nenhum caixa aberto hoje. Abra um novo caixa." : "Ajuste os filtros para encontrar caixas anteriores."} />
      ) : periodoFilter === "hoje" ? (
          <Card>
            <div className="rounded-md border-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entregador</TableHead>
                    <TableHead className="text-right">Troco</TableHead>
                    <TableHead className="text-center">Entregas</TableHead>
                    <TableHead className="text-right">Recebido</TableHead>
                    <TableHead className="text-right">Esperado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.entregador_nome}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(c.troco_inicial)}</TableCell>
                      <TableCell className="text-center tabular-nums">{c.recebimentos.length}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(c.total_recebido)}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{formatCurrency(c.total_esperado)}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailsTarget(c)}><Eye className="h-4 w-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditarTarget(c)}><Pencil className="h-4 w-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar caixa</TooltipContent>
                          </Tooltip>
                          {c.status === "aberto" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-status-pending hover:text-status-pending/80" onClick={() => setFecharTarget(c)}><Lock className="h-4 w-4" /></Button>
                              </TooltipTrigger>
                              <TooltipContent>Fechar caixa</TooltipContent>
                            </Tooltip>
                          )}
                          {c.status === "divergente" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => setJustificarTarget(c)}><FileWarning className="h-4 w-4" /></Button>
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
        ) : (
          <div className="space-y-3">
            {groupedByDate.map(([date, items]) => (
              <Collapsible key={date}>
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardContent className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">
                          {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "2-digit" })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {items.length} {items.length === 1 ? "caixa" : "caixas"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Entregador</TableHead>
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
                          {items.map((c) => (
                            <TableRow key={c.id}>
                              <TableCell className="font-medium">{c.entregador_nome}</TableCell>
                              <TableCell className="text-right tabular-nums">{formatCurrency(c.troco_inicial)}</TableCell>
                              <TableCell className="text-center tabular-nums">{c.recebimentos.length}</TableCell>
                              <TableCell className="text-right tabular-nums">{formatCurrency(c.total_recebido)}</TableCell>
                              <TableCell className="text-right tabular-nums font-medium">{formatCurrency(c.total_esperado)}</TableCell>
                              <TableCell className="text-right tabular-nums">{c.valor_devolvido !== null ? formatCurrency(c.valor_devolvido) : "—"}</TableCell>
                              <TableCell className={`text-right tabular-nums font-medium ${c.diferenca === null ? "" : c.diferenca === 0 ? "text-status-completed" : "text-destructive"}`}>
                                {c.diferenca !== null ? formatCurrency(c.diferenca) : "—"}
                              </TableCell>
                              <TableCell><StatusBadge status={c.status} /></TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailsTarget(c)}><Eye className="h-4 w-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Ver detalhes</TooltipContent>
                                  </Tooltip>
                                  {c.status === "divergente" && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => setJustificarTarget(c)}><FileWarning className="h-4 w-4" /></Button>
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
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}

      <AbrirCaixaDialog open={abrirOpen} onOpenChange={setAbrirOpen} onConfirm={handleAbrirCaixa} existingEntregadorIds={openEntregadorIds} />
      <FecharCaixaDialog open={!!fecharTarget} onOpenChange={(o) => !o && setFecharTarget(null)} caixa={fecharTarget} onConfirm={handleFecharCaixa} />
      <EditarCaixaDialog open={!!editarTarget} onOpenChange={(o) => !o && setEditarTarget(null)} caixa={editarTarget} onConfirm={handleEditarCaixa} />
      <JustificativaDivergenciaDialog open={!!justificarTarget} onOpenChange={(o) => !o && setJustificarTarget(null)} caixa={justificarTarget} onConfirm={handleJustificar} />
      <CaixaDetailsModal open={!!detailsTarget} onOpenChange={(o) => !o && setDetailsTarget(null)} caixa={detailsTarget} />
    </PageContainer>
  );
}
