# Guia AppSheet — SUAS Fácil Integra

## 1. Conexão com o Supabase (PostgreSQL)

| Campo | Valor |
|---|---|
| **Tipo** | PostgreSQL via AppSheet Database |
| **Host** | `db.ynulqlhjoelssphlmtxa.supabase.co` |
| **Porta** | `5432` |
| **Database** | `postgres` |
| **URL da API** | `https://ynulqlhjoelssphlmtxa.supabase.co` |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ver Supabase > Settings > API) |

> **Alternativa recomendada**: Use o conector **Supabase** nativo do AppSheet (via REST + Headers `apikey` e `Authorization: Bearer <anon_key>`).

---

## 2. Tabelas a adicionar no AppSheet

Adicione cada tabela/view abaixo como uma fonte de dados distinta:

| Tabela / View | Uso no App |
|---|---|
| `familias` | Cadastro principal de famílias |
| `cidadaos` | Membros da família |
| `indicadores_sociais` | Dados CadÚnico por família |
| `indicadores_saude` | Dados e-SUS por membro |
| `scores_risco` | Score calculado automaticamente |
| `gatilhos_priorizacao` | Alertas inteligentes |
| `buscas_ativas` | Planejamento de busca ativa |
| `registros_acoes` | Histórico de atendimentos |
| `vw_familias_score` | Dashboard principal (view) |
| `vw_busca_ativa_critica` | Lista Inteligente — Crítica |
| `vw_busca_ativa_alta` | Lista Inteligente — Alta |
| `vw_intersetorial` | Lista Intersetorial |
| `usuarios` | RBAC — perfis de acesso |
| `auditoria_logs` | Logs LGPD |

---

## 3. Fórmulas AppSheet

### Score Social (coluna virtual em `familias`)
```
IF([RendaPerCapita] <= 109, 10 * 0.4,
  IF([RendaPerCapita] <= 218, 7 * 0.4,
    IF([RendaPerCapita] <= 1320, 4 * 0.4, 0)
  )
) +
IFS(
  [TemCrianca0a6] = TRUE, 8 * 0.20,
  [TemIdoso60plus] = TRUE, 6 * 0.20,
  [TemMaeSolo] = TRUE, 9 * 0.20,
  [SemSaneamento] = TRUE, 10 * 0.20,
  [MoradiaPrecaria] = TRUE, 8 * 0.20,
  [ResponsavelDesempregado] = TRUE, 7 * 0.20,
  [BaixaEscolaridade] = TRUE, 5 * 0.15,
  TRUE, 0
)
```

> **Nota**: O Supabase já calcula scores automaticamente via trigger. As fórmulas acima são para exibição e validação no AppSheet.

### Score Familiar (coluna virtual em `familias`)
```
([ScoreSocial] * 0.5) +
(MAX(SELECT(IndicadoresSaude[ScoreSaudeIndividual],
  [FamiliaID] = [_THISROW].[ID])) * 0.5)
```

### Classificação de Risco
```
IFS(
  [ScoreFamiliar] >= 8.5, "CRÍTICA",
  [ScoreFamiliar] >= 6.5, "ALTA",
  [ScoreFamiliar] >= 4.0, "MODERADA",
  TRUE, "BAIXA"
)
```

### Ação Recomendada
```
SWITCH([ClassificacaoRisco],
  "CRÍTICA",   "Busca Ativa Imediata – até 48h",
  "ALTA",      "Visita Domiciliar – até 15 dias",
  "MODERADA",  "Acompanhamento Mensal",
  "Monitoramento via Sistema"
)
```

### Cor do Badge (formatação condicional)
```
IFS(
  [ClassificacaoRisco] = "CRÍTICA",  "#DC2626",
  [ClassificacaoRisco] = "ALTA",     "#F97316",
  [ClassificacaoRisco] = "MODERADA", "#FACC15",
  TRUE, "#22C55E"
)
```

---

## 4. Views (Telas do App)

| View | Tipo | Tabela/View | Ordenação | Filtro |
|---|---|---|---|---|
| **Dashboard** | Chart/Card | `vw_familias_score` | `ScoreFamiliar` DESC | — |
| **Mapa Territorial** | Map | `vw_familias_score` | — | Por território do usuário |
| **Listas Inteligentes** | Table | `vw_busca_ativa_critica` | `ScoreFamiliar` DESC | `ClassificacaoRisco` |
| **Busca Ativa** | Form | `buscas_ativas` | — | `Status = "Em Andamento"` |
| **Família Detalhe** | Detail | `familias` | — | — |
| **Relatório Intersetorial** | Table | `vw_intersetorial` | `ScoreFamiliar` DESC | — |
| **Auditoria** | Table | `auditoria_logs` | `criado_em` DESC | Somente Admin/Gestor |

---

## 5. RBAC — Segurança por Perfil

| Perfil | Acesso |
|---|---|
| **Admin** | Total — todos os municípios e territórios |
| **Gestor** | Leitura total do município; relatórios e auditoria |
| **Coordenador** | Vê e edita apenas seu território |
| **Tecnico_CRAS** | Vê famílias e registra ações no seu território |
| **Tecnico_UBS** | Vê indicadores de saúde no seu território |

> **Implementação**: Configure em AppSheet > Security > Per-user filters usando a coluna `territorio_id` e o email do usuário logado `USEREMAIL()`.

---

## 6. Filtros de Segurança (AppSheet per-user filter)

Na tabela `familias`, defina em **Security Filters**:
```
IN([TerritorioID],
  SELECT(Usuarios[TerritorioID],
    [Email] = USEREMAIL()
  )
)
OR IN(
  SELECT(Usuarios[Perfil], [Email] = USEREMAIL()),
  LIST("Gestor","Admin")
)
```
