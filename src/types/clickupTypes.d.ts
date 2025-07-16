export interface Atendimento {
  id: string;
  description?: string;
  assignees?: Array<{
    id: string;
    username?: string;
    email?: string;
  }>;
  due_date?: string | null;
  start_date?: string | null;
}

export interface AtendimentoTask extends Atendimento {
  name: string;
  date_created: string;
  status: {
    status: string;
    color: string;
  };
  custom_fields: Array<{
    id: string;
    name: string; 
    value: {
      titulo?: string;
      descricao?: { cliente: string; motivo: string };
      comentario?: string;
      responsavel?: string;
      empresa?: string;
      datas?: { inicial: string; vencimento: string };
    };
  }>;
}

export interface ClickupConfig {
  api_key: string;
  team_id: string;
  list_id: string;
  default_list_id?: string;
}
