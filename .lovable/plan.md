## Plano: Lançamento Retroativo de Solicitações

### Objetivo
Permitir criar solicitações com datas passadas para treinar o sistema com dados históricos.

### Estrutura Atual
- `LaunchSolicitacaoDialog` coleta dados em 4 steps (0: tipo coleta, 1: cliente/operação, 2: rotas, 3: revisão)
- `handleLaunch` no `SolicitacoesPage` usa `new Date().toISOString()` como `data_solicitacao`
- A interface `onSubmit` não aceita data customizada

### Alterações Propostas

**1. LaunchSolicitacaoDialog (Step 1)**
- Adicionar um **Switch** "Lançamento Retroativo" abaixo das observações
- Quando ativado, exibe um **date picker** para selecionar a data passada
- Restringir datas futuras (só permite datas até hoje)
- A data selecionada é passada no `onSubmit` como campo opcional `dataRetroativa?: string`

**2. Step 3 (Revisão)**
- Exibir a data retroativa na revisão quando preenchida, com badge "Retroativo" para destaque visual

**3. SolicitacoesPage (handleLaunch)**
- Receber `dataRetroativa` no callback
- Usar `dataRetroativa` em vez de `new Date()` para `data_solicitacao` e `created_at`
- Manter `updated_at` como data atual

**4. Impacto**
- Métricas (pendentes, concluídas hoje, etc.) passam a refletir corretamente dados retroativos
- Filtro por data na tabela funciona normalmente
- Código da solicitação usa a data retroativa no prefixo (ex: `LT-20250115-00001`)

### Arquivos Modificados
- `src/pages/admin/solicitacoes/LaunchSolicitacaoDialog.tsx` — Switch + DatePicker + passagem da data
- `src/pages/admin/SolicitacoesPage.tsx` — Receber e usar a data retroativa no handleLaunch
