import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowDownUp, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { MetricCard } from "@/components/shared/MetricCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/formatters";
import type { CaixaEntregador } from "@/data/mockCaixas";
import { useCaixaStore } from "@/contexts/CaixaStore";
import { AbrirCaixaDialog } from "./caixas/AbrirCaixaDialog";
import { FecharCaixaDialog } from "./caixas/FecharCaixaDialog";
import { EditarCaixaDialog } from "./caixas/EditarCaixaDialog";
import { JustificativaDivergenciaDialog } from "./caixas/JustificativaDivergenciaDialog";
import { CaixaDetailsModal } from "./caixas/CaixaDetailsModal";
import { CaixasDoDiaTab } from "./caixas/CaixasDoDiaTab";
import { HistoricoCaixasTab } from "./caixas/HistoricoCaixasTab";
import { toast } from "sonner";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function CaixasEntregadoresPage() {
  const { caixas, abrirCaixa, fecharCaixa, editarCaixa, justificarDivergencia } = useCaixaStore();
  const [abrirOpen, setAbrirOpen] = useState(false);
  const [fecharTarget, setFecharTarget] = useState<CaixaEntregador | null>(null);
  const [editarTarget, setEditarTarget] = useState<CaixaEntregador | null>(null);
  const [justificarTarget, setJustificarTarget] = useState<CaixaEntregador | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<CaixaEntregador | null>(null);

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

      <Tabs defaultValue="hoje" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hoje">Caixas do Dia</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="hoje">
          <CaixasDoDiaTab
            caixas={caixas}
            onView={setDetailsTarget}
            onEdit={setEditarTarget}
            onClose={setFecharTarget}
            onJustify={setJustificarTarget}
          />
        </TabsContent>

        <TabsContent value="historico">
          <HistoricoCaixasTab
            caixas={caixas}
            onView={setDetailsTarget}
            onEdit={setEditarTarget}
            onJustify={setJustificarTarget}
          />
        </TabsContent>
      </Tabs>

      <AbrirCaixaDialog open={abrirOpen} onOpenChange={setAbrirOpen} onConfirm={handleAbrirCaixa} existingEntregadorIds={openEntregadorIds} />
      <FecharCaixaDialog open={!!fecharTarget} onOpenChange={(o) => !o && setFecharTarget(null)} caixa={fecharTarget} onConfirm={handleFecharCaixa} />
      <EditarCaixaDialog open={!!editarTarget} onOpenChange={(o) => !o && setEditarTarget(null)} caixa={editarTarget} onConfirm={handleEditarCaixa} />
      <JustificativaDivergenciaDialog open={!!justificarTarget} onOpenChange={(o) => !o && setJustificarTarget(null)} caixa={justificarTarget} onConfirm={handleJustificar} />
      <CaixaDetailsModal open={!!detailsTarget} onOpenChange={(o) => !o && setDetailsTarget(null)} caixa={detailsTarget} />
    </PageContainer>
  );
}
