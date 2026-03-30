# Fórmulas AppSheet - Motor de Regras SUAS Fácil Integra

Este documento contém as expressões técnicas para implementação no Google AppSheet.

## 1. Cálculo de Scores

### SRI (Score de Risco Individual)

Calculado na tabela de **Membros**.

```appsheet
([ScoreSocial] * 0.5) + ([ScoreSaude] * 0.5)
```

### SPF (Score de Priorização Familiar)

Calculado na tabela de **Famílias**. Busca o maior SRI entre os membros e adiciona um bônus/penalidade baseado na média da vulnerabilidade familiar.

```appsheet
MAX(SELECT(Membros[SRI], [FamíliaID] = [_THISROW].[FamíliaID])) + 
(AVERAGE(SELECT(Membros[SRI], [FamíliaID] = [_THISROW].[FamíliaID])) * 0.2)
```

## 2. Classificação de Risco

### Nível de Risco (Texto)

```appsheet
IFS(
  [SPF] >= 8.5, "Crítico",
  [SPF] >= 6.5, "Alto",
  [SPF] >= 4.0, "Moderado",
  TRUE, "Baixo"
)
```

### Formatação Condicional (Cores Hex)

- **Crítico:** `#DC2626` (Vermelho)
- **Alto:** `#F97316` (Laranja)
- **Moderado:** `#FACC15` (Amarelo)
- **Baixo:** `#22C55E` (Verde)

## 3. Indicadores Críticos (Triggers)

Expressões para alertas visuais imediatos:

- **Desnutrição Grave:** `[DesnutricaoInfantil] = "Sim"`
- **Gestante em Risco:** `AND([GestanteFaltosa] = "Sim", [SRI] > 7.0)`
