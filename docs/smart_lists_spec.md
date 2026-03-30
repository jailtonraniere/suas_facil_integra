# Especificação de Listas Inteligentes (Busca Ativa)

As listas inteligentes são visualizações (Slices) filtradas para otimizar o trabalho das equipes de campo (CRAS/UBS).

## 1. Lista de Prioridade Crítica (Busca Ativa Imediata)

**Filtro:**

```appsheet
AND(
  [ClassificacaoRisco] = "Crítico",
  [DataUltimaVisita] < (TODAY() - 30)
)
```

**Objetivo:** Identificar famílias com score > 8.5 que não recebem visita há mais de um mês.

## 2. Lista intersetorial (Saúde + Social)

**Filtro:**

```appsheet
AND(
  [ScoreSaude] > 5.0,
  [ScoreSocial] > 5.0
)
```

**Objetivo:** Famílias com alta vulnerabilidade em ambas as frentes, exigindo ação conjunta.

## 3. Territórios de Calor (Heatmap)

Visualização agrupada por **Território** ou **Microárea** somando o SPF total da região para identificar bolsões de pobreza e risco epidemiológico.
