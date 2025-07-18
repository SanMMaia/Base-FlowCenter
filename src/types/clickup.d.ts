export interface ClickUpTaskPayload {
  name: string;
  description: string;
  content: string;
  assignees: number[];
  status: string;
  due_date: number | null;
  start_date: number | null;
  custom_fields: Array<{
    id: string;
    value: string | number | boolean | null;
  }>;
}

export interface ClickUpTaskInput {
  // Campos alternativos para compatibilidade
  name?: string;
  titulo: string;
  description?: string;
  descricao?: string;
  motivo?: string;
  comentario: string;
  responsavel: number;
  dataInicial: string;
  dataVencimento: string;
  inicioTime: string;
  vencimentoTime: string;
  status: string;
  empresa: string;
  custom_fields?: Record<string, string | number | boolean | null>;
}

export interface ClickUpCustomField {
  id: string;
  name: string;
  type: string;
  type_config: Record<string, unknown>;
}
