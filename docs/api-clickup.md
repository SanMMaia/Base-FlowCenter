# Documentação da API ClickUp para Tarefas

## Estrutura Completa
```typescript
interface ClickUpTask {
  // ... todos os campos documentados
}
```

## Mapeamento para FlowCenter
| Campo ClickUp | Campo FlowCenter | Tipo | Obrigatório |
|--------------|------------------|------|-------------|
| id | id | string | Sim |
| name | name | string | Sim |
| ... | ... | ... | ... |

## Exemplo de Uso
```typescript
// Converter tarefa ClickUp para o formato interno
const atendimentoTask = mapClickUpToAtendimento(clickUpTask);
```
