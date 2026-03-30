import { useState } from "react";
import { DataTable, SearchInput, StatusBadge } from "@/components/shared";
import type { Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Pencil, X, MessageSquare, Eye, Info, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { create } from "zustand";

/* ── Types ── */
type NotificacaoStatus = "ativo" | "inativo";
type CanalEnvio = "whatsapp";

interface NotificacaoTemplate {
  id: string;
  evento: string;
  evento_label: string;
  categoria: string;
  titulo: string;
  mensagem: string;
  canal: CanalEnvio;
  status: NotificacaoStatus;
  variaveis: string[];
  updated_at: string;
}

/* ── Variáveis disponíveis por categoria ── */
const VARIAVEIS_POR_CATEGORIA: Record<string, { var: string; desc: string }[]> = {
  "Solicitação": [
    { var: "{{cliente_nome}}", desc: "Nome do cliente" },
    { var: "{{solicitacao_id}}", desc: "ID da solicitação" },
    { var: "{{data_solicitacao}}", desc: "Data da solicitação" },
    { var: "{{endereco_coleta}}", desc: "Endereço de coleta" },
    { var: "{{endereco_entrega}}", desc: "Endereço de entrega" },
    { var: "{{valor_total}}", desc: "Valor total" },
    { var: "{{tipo_operacao}}", desc: "Tipo de operação" },
  ],
  "Entrega": [
    { var: "{{cliente_nome}}", desc: "Nome do cliente" },
    { var: "{{entregador_nome}}", desc: "Nome do entregador" },
    { var: "{{solicitacao_id}}", desc: "ID da solicitação" },
    { var: "{{endereco_coleta}}", desc: "Endereço de coleta" },
    { var: "{{endereco_entrega}}", desc: "Endereço de entrega" },
    { var: "{{previsao_entrega}}", desc: "Previsão de entrega" },
    { var: "{{status_entrega}}", desc: "Status da entrega" },
  ],
  "Financeiro": [
    { var: "{{cliente_nome}}", desc: "Nome do cliente" },
    { var: "{{fatura_id}}", desc: "ID da fatura" },
    { var: "{{valor_fatura}}", desc: "Valor da fatura" },
    { var: "{{data_vencimento}}", desc: "Data de vencimento" },
    { var: "{{valor_pago}}", desc: "Valor pago" },
    { var: "{{saldo_atual}}", desc: "Saldo atual" },
  ],
  "Cadastro": [
    { var: "{{cliente_nome}}", desc: "Nome do cliente" },
    { var: "{{entregador_nome}}", desc: "Nome do entregador" },
  ],
};

/* ── Templates padrão ── */
const defaultTemplates: NotificacaoTemplate[] = [
  // Solicitação
  {
    id: "ntf-1", evento: "solicitacao.criada", evento_label: "Solicitação criada", categoria: "Solicitação",
    titulo: "Nova solicitação", canal: "whatsapp", status: "ativo",
    mensagem: "Olá {{cliente_nome}}! 👋\n\nSua solicitação *#{{solicitacao_id}}* foi criada com sucesso.\n\n📍 Coleta: {{endereco_coleta}}\n📍 Entrega: {{endereco_entrega}}\n💰 Valor: {{valor_total}}\n\nAcompanhe o status em tempo real!",
    variaveis: ["cliente_nome", "solicitacao_id", "endereco_coleta", "endereco_entrega", "valor_total"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  {
    id: "ntf-2", evento: "solicitacao.aceita", evento_label: "Solicitação aceita", categoria: "Solicitação",
    titulo: "Solicitação aceita", canal: "whatsapp", status: "ativo",
    mensagem: "✅ {{cliente_nome}}, sua solicitação *#{{solicitacao_id}}* foi aceita!\n\nEm breve um entregador será atribuído.",
    variaveis: ["cliente_nome", "solicitacao_id"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  {
    id: "ntf-3", evento: "solicitacao.em_andamento", evento_label: "Solicitação em andamento", categoria: "Solicitação",
    titulo: "Solicitação em andamento", canal: "whatsapp", status: "ativo",
    mensagem: "🚀 {{cliente_nome}}, sua solicitação *#{{solicitacao_id}}* está em andamento!\n\nO entregador já está a caminho.",
    variaveis: ["cliente_nome", "solicitacao_id"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  {
    id: "ntf-4", evento: "solicitacao.concluida", evento_label: "Solicitação concluída", categoria: "Solicitação",
    titulo: "Solicitação concluída", canal: "whatsapp", status: "ativo",
    mensagem: "🎉 {{cliente_nome}}, sua solicitação *#{{solicitacao_id}}* foi concluída com sucesso!\n\nObrigado por usar nossos serviços! ⭐",
    variaveis: ["cliente_nome", "solicitacao_id"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  {
    id: "ntf-5", evento: "solicitacao.cancelada", evento_label: "Solicitação cancelada", categoria: "Solicitação",
    titulo: "Solicitação cancelada", canal: "whatsapp", status: "ativo",
    mensagem: "❌ {{cliente_nome}}, sua solicitação *#{{solicitacao_id}}* foi cancelada.\n\nEm caso de dúvidas, entre em contato conosco.",
    variaveis: ["cliente_nome", "solicitacao_id"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  // Entrega
  {
    id: "ntf-6", evento: "entrega.entregador_atribuido", evento_label: "Entregador atribuído", categoria: "Entrega",
    titulo: "Entregador a caminho", canal: "whatsapp", status: "ativo",
    mensagem: "🏍️ {{cliente_nome}}, o entregador *{{entregador_nome}}* foi atribuído à sua solicitação *#{{solicitacao_id}}*!\n\n📍 Coleta: {{endereco_coleta}}",
    variaveis: ["cliente_nome", "entregador_nome", "solicitacao_id", "endereco_coleta"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  {
    id: "ntf-7", evento: "entrega.coletada", evento_label: "Entrega coletada", categoria: "Entrega",
    titulo: "Entrega coletada", canal: "whatsapp", status: "ativo",
    mensagem: "📦 {{cliente_nome}}, sua encomenda foi coletada!\n\nEntregador: *{{entregador_nome}}*\n📍 Destino: {{endereco_entrega}}",
    variaveis: ["cliente_nome", "entregador_nome", "endereco_entrega"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  {
    id: "ntf-8", evento: "entrega.em_transito", evento_label: "Entrega em trânsito", categoria: "Entrega",
    titulo: "Em trânsito", canal: "whatsapp", status: "ativo",
    mensagem: "🚚 {{cliente_nome}}, sua entrega está a caminho!\n\n📍 Destino: {{endereco_entrega}}\n⏰ Previsão: {{previsao_entrega}}",
    variaveis: ["cliente_nome", "endereco_entrega", "previsao_entrega"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  {
    id: "ntf-9", evento: "entrega.concluida", evento_label: "Entrega concluída", categoria: "Entrega",
    titulo: "Entrega concluída", canal: "whatsapp", status: "ativo",
    mensagem: "✅ {{cliente_nome}}, sua entrega foi realizada com sucesso!\n\nObrigado pela confiança! 🙏",
    variaveis: ["cliente_nome"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  {
    id: "ntf-10", evento: "entrega.tentativa_falha", evento_label: "Tentativa de entrega falhou", categoria: "Entrega",
    titulo: "Tentativa falhou", canal: "whatsapp", status: "ativo",
    mensagem: "⚠️ {{cliente_nome}}, não foi possível entregar no endereço {{endereco_entrega}}.\n\nEntraremos em contato para reagendar.",
    variaveis: ["cliente_nome", "endereco_entrega"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  // Financeiro
  {
    id: "ntf-11", evento: "fatura.gerada", evento_label: "Fatura gerada", categoria: "Financeiro",
    titulo: "Nova fatura", canal: "whatsapp", status: "inativo",
    mensagem: "📄 {{cliente_nome}}, sua fatura *#{{fatura_id}}* foi gerada.\n\n💰 Valor: {{valor_fatura}}\n📅 Vencimento: {{data_vencimento}}",
    variaveis: ["cliente_nome", "fatura_id", "valor_fatura", "data_vencimento"],
    updated_at: "2025-03-20T10:00:00Z",
  },
  {
    id: "ntf-12", evento: "fatura.vencida", evento_label: "Fatura vencida", categoria: "Financeiro",
    titulo: "Fatura vencida", canal: "whatsapp", status: "inativo",
    mensagem: "🔴 {{cliente_nome}}, sua fatura *#{{fatura_id}}* no valor de {{valor_fatura}} está vencida.\n\nRegularize para evitar suspensão do serviço.",
    variaveis: ["cliente_nome", "fatura_id", "valor_fatura"],
    updated_at: "2025-03-20T10:00:00Z",
  },
];

/* ── Store ── */
interface NotificacaoStore {
  templates: NotificacaoTemplate[];
  updateTemplate: (id: string, data: Partial<Omit<NotificacaoTemplate, "id">>) => void;
  addTemplate: (data: Omit<NotificacaoTemplate, "id" | "updated_at">) => void;
  removeTemplate: (id: string) => void;
}

const useNotificacaoStore = create<NotificacaoStore>((set) => ({
  templates: defaultTemplates,
  updateTemplate: (id, data) =>
    set((s) => ({
      templates: s.templates.map((t) =>
        t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t
      ),
    })),
  addTemplate: (data) =>
    set((s) => ({
      templates: [
        ...s.templates,
        { ...data, id: `ntf-${Date.now()}`, updated_at: new Date().toISOString() },
      ],
    })),
  removeTemplate: (id) =>
    set((s) => ({
      templates: s.templates.filter((t) => t.id !== id),
    })),
}));

/* ── Preview Component ── */
function MensagemPreview({ mensagem }: { mensagem: string }) {
  const formatted = mensagem
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");

  return (
    <div className="bg-[#dcf8c6] dark:bg-[#025c4c] text-foreground rounded-lg rounded-tr-none p-3 max-w-[320px] text-sm shadow-sm">
      <div dangerouslySetInnerHTML={{ __html: formatted }} />
      <div className="text-[10px] text-muted-foreground text-right mt-1">12:00 ✓✓</div>
    </div>
  );
}

/* ── Main Component ── */
export function NotificacoesTab() {
  const { templates, updateTemplate, addTemplate, removeTemplate } = useNotificacaoStore();

  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificacaoTemplate | null>(null);
  const [formMensagem, setFormMensagem] = useState("");
  const [formTitulo, setFormTitulo] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<NotificacaoTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newEvento, setNewEvento] = useState("");
  const [newCategoria, setNewCategoria] = useState("Solicitação");
  const [newTitulo, setNewTitulo] = useState("");
  const [newMensagem, setNewMensagem] = useState("");

  const categorias = [...new Set(templates.map((t) => t.categoria))];

  const filtered = templates.filter((t) => {
    const matchSearch =
      t.titulo.toLowerCase().includes(search.toLowerCase()) ||
      t.evento_label.toLowerCase().includes(search.toLowerCase()) ||
      t.mensagem.toLowerCase().includes(search.toLowerCase());
    const matchCategoria = categoriaFilter === "todos" || t.categoria === categoriaFilter;
    const matchStatus = statusFilter === "todos" || t.status === statusFilter;
    return matchSearch && matchCategoria && matchStatus;
  });

  function openEdit(t: NotificacaoTemplate) {
    setEditingTemplate(t);
    setFormTitulo(t.titulo);
    setFormMensagem(t.mensagem);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!editingTemplate) return;
    if (!formTitulo.trim() || !formMensagem.trim()) {
      toast.error("Preencha o título e a mensagem.");
      return;
    }
    updateTemplate(editingTemplate.id, {
      titulo: formTitulo.trim(),
      mensagem: formMensagem.trim(),
    });
    toast.success("Mensagem atualizada com sucesso.");
    setDialogOpen(false);
  }

  function handleToggleStatus(t: NotificacaoTemplate) {
    const newStatus = t.status === "ativo" ? "inativo" : "ativo";
    updateTemplate(t.id, { status: newStatus });
    toast.success(`Notificação ${newStatus === "ativo" ? "ativada" : "desativada"}.`);
  }

  function insertVariable(varName: string) {
    setFormMensagem((m) => m + varName);
  }

  function handleCreate() {
    if (!newEvento.trim() || !newTitulo.trim() || !newMensagem.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const eventoSlug = newEvento.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    addTemplate({
      evento: `${newCategoria.toLowerCase().replace(/ç/g, "c").replace(/ã/g, "a")}.${eventoSlug}`,
      evento_label: newEvento.trim(),
      categoria: newCategoria,
      titulo: newTitulo.trim(),
      mensagem: newMensagem.trim(),
      canal: "whatsapp",
      status: "ativo",
      variaveis: [],
    });
    toast.success("Novo evento de notificação criado com sucesso!");
    setCreateOpen(false);
    setNewEvento("");
    setNewTitulo("");
    setNewMensagem("");
    setNewCategoria("Solicitação");
  }

  function handleDelete(t: NotificacaoTemplate) {
    removeTemplate(t.id);
    toast.success("Evento removido com sucesso.");
  }

  function insertNewVariable(varName: string) {
    setNewMensagem((m) => m + varName);
  }

  const columns: Column<NotificacaoTemplate>[] = [
    {
      key: "evento_label",
      header: "Evento",
      sortable: true,
      cell: (r) => (
        <div>
          <span className="font-medium">{r.evento_label}</span>
          <p className="text-xs text-muted-foreground">{r.titulo}</p>
        </div>
      ),
    },
    {
      key: "categoria",
      header: "Categoria",
      cell: (r) => (
        <Badge variant="secondary" className="text-xs">{r.categoria}</Badge>
      ),
    },
    {
      key: "canal",
      header: "Canal",
      cell: () => (
        <Badge variant="outline" className="text-xs gap-1">
          <MessageSquare className="h-3 w-3" /> WhatsApp
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={r.status === "ativo"}
            onCheckedChange={() => handleToggleStatus(r)}
            className="data-[state=checked]:bg-primary"
          />
          <span className="text-xs text-muted-foreground">{r.status === "ativo" ? "Ativo" : "Inativo"}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      className: "w-28 text-right",
      cell: (r) => (
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={(e) => { e.stopPropagation(); setPreviewTemplate(r); setPreviewOpen(true); }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pré-visualizar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-primary hover:bg-primary/10 transition-colors"
                  onClick={(e) => { e.stopPropagation(); openEdit(r); }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar mensagem</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={(e) => { e.stopPropagation(); handleDelete(r); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remover</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  const activeVars = editingTemplate
    ? VARIAVEIS_POR_CATEGORIA[editingTemplate.categoria] || []
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notificações WhatsApp</h3>
          <p className="text-sm text-muted-foreground">Personalize as mensagens enviadas aos clientes para cada evento do sistema.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por evento ou mensagem..."
              className="flex-1 min-w-[200px]"
            />
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas categorias</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
            {(search || categoriaFilter !== "todos" || statusFilter !== "todos") && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearch(""); setCategoriaFilter("todos"); setStatusFilter("todos"); }}
              >
                <X className="h-3.5 w-3.5" /> Limpar filtros
              </Button>
            )}
          </div>

          <DataTable
            data={filtered}
            columns={columns}
            emptyTitle="Nenhuma notificação encontrada"
            emptySubtitle="Ajuste os filtros para visualizar as notificações."
            renderMobileCard={(r) => (
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.evento_label}</p>
                    <p className="text-xs text-muted-foreground">{r.titulo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={r.status === "ativo"}
                      onCheckedChange={() => handleToggleStatus(r)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">{r.categoria}</Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <MessageSquare className="h-3 w-3" /> WhatsApp
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-1 border-t border-border pt-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground" onClick={() => { setPreviewTemplate(r); setPreviewOpen(true); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleDelete(r)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Editar Notificação — {editingTemplate?.evento_label}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            {/* Form side */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título da notificação</Label>
                <Input
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: Entrega concluída"
                />
              </div>
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea
                  value={formMensagem}
                  onChange={(e) => setFormMensagem(e.target.value)}
                  placeholder="Digite a mensagem..."
                  className="min-h-[180px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Use *texto* para negrito. Emojis são suportados.</p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  Variáveis disponíveis
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {activeVars.map((v) => (
                    <Tooltip key={v.var}>
                      <TooltipProvider delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 font-mono"
                            onClick={() => insertVariable(v.var)}
                          >
                            {v.var}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{v.desc}</TooltipContent>
                      </TooltipProvider>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
            {/* Preview side */}
            <div className="space-y-3">
              <Label>Pré-visualização</Label>
              <div className="bg-[#ece5dd] dark:bg-[#0b141a] rounded-lg p-4 min-h-[250px] flex items-end justify-end">
                <MensagemPreview mensagem={formMensagem} />
              </div>
              <p className="text-xs text-muted-foreground text-center">As variáveis serão substituídas pelos dados reais no envio.</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Pré-visualização — {previewTemplate?.evento_label}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-[#ece5dd] dark:bg-[#0b141a] rounded-lg p-4 flex items-end justify-end">
            {previewTemplate && <MensagemPreview mensagem={previewTemplate.mensagem} />}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
            <Button onClick={() => { setPreviewOpen(false); if (previewTemplate) openEdit(previewTemplate); }}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Novo Evento de Notificação
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={newCategoria} onValueChange={setNewCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(VARIAVEIS_POR_CATEGORIA).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome do evento *</Label>
                <Input
                  value={newEvento}
                  onChange={(e) => setNewEvento(e.target.value)}
                  placeholder="Ex: Solicitação reagendada"
                />
              </div>
              <div className="space-y-2">
                <Label>Título da notificação *</Label>
                <Input
                  value={newTitulo}
                  onChange={(e) => setNewTitulo(e.target.value)}
                  placeholder="Ex: Reagendamento confirmado"
                />
              </div>
              <div className="space-y-2">
                <Label>Mensagem *</Label>
                <Textarea
                  value={newMensagem}
                  onChange={(e) => setNewMensagem(e.target.value)}
                  placeholder="Digite a mensagem..."
                  className="min-h-[140px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Use *texto* para negrito. Emojis são suportados.</p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  Variáveis disponíveis
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {(VARIAVEIS_POR_CATEGORIA[newCategoria] || []).map((v) => (
                    <TooltipProvider key={v.var} delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 font-mono"
                            onClick={() => insertNewVariable(v.var)}
                          >
                            {v.var}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{v.desc}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Pré-visualização</Label>
              <div className="bg-[#ece5dd] dark:bg-[#0b141a] rounded-lg p-4 min-h-[250px] flex items-end justify-end">
                <MensagemPreview mensagem={newMensagem || "Sua mensagem aparecerá aqui..."} />
              </div>
              <p className="text-xs text-muted-foreground text-center">As variáveis serão substituídas pelos dados reais no envio.</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> Criar Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
