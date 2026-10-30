export interface Membro {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  endereco: string;
  dataCadastro: string;
  ativo: boolean;
}

export interface Treino {
  id: string;
  idMembro: string;
  tipo: string;
  descricao: string;
  duracaoMinutos: number;
  dataInicio: string;
}

export interface Pagamento {
  id: string;
  idMembro: string;
  valor: number;
  dataPagamento: string;
  status: 'PAGO' | 'PENDENTE';
}

export interface HistoricoAtividade {
  id: string;
  idMembro: string;
  atividade: string;
  data: string;
  tempoExecucaoMinutos: number;
}
