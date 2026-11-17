import { HistoricoAtividade } from '../types/models';
import { MembroService } from './membroService';

export class AtividadeService {
  private historicoAtividades: HistoricoAtividade[] = [];
  private nextId: number = 1;

  constructor(private membroService: MembroService) {}

  registrarAtividade(dados: Partial<HistoricoAtividade>): HistoricoAtividade {
    // Regra 1: Verifica se o idMembro existe em membroService.consultarPorId(idMembro) e está ativo.
    // Caso contrário, lança Error("Membro não encontrado ou inativo para registrar atividade").
    const membro = dados?.idMembro ? this.membroService.consultarPorId(dados.idMembro) : undefined;
    if (!membro || !membro.ativo) {
      throw new Error("Membro não encontrado ou inativo para registrar atividade");
    }

    // Regra 2: Verifica se o nome da atividade não está vazio e se tempoExecucaoMinutos é entre 5 e 240 minutos
    if (!dados.atividade || typeof dados.atividade !== 'string' || !dados.atividade.trim()) {
      throw new Error("Nome da atividade não pode ser vazio");
    }

    if (
      dados.tempoExecucaoMinutos === undefined ||
      dados.tempoExecucaoMinutos === null ||
      typeof dados.tempoExecucaoMinutos !== 'number' ||
      isNaN(dados.tempoExecucaoMinutos) ||
      dados.tempoExecucaoMinutos < 5 ||
      dados.tempoExecucaoMinutos > 240
    ) {
      throw new Error("Tempo de execução deve ser entre 5 e 240 minutos");
    }

    let finalId: string;
    if (dados.id) {
      if (this.consultarPorId(dados.id)) {
        throw new Error("ID de atividade ja existente");
      }
      finalId = dados.id;
    } else {
      while (this.consultarPorId(String(this.nextId))) {
        this.nextId++;
      }
      finalId = String(this.nextId++);
    }

    const novaAtividade: HistoricoAtividade = {
      id: finalId,
      idMembro: dados.idMembro!,
      atividade: dados.atividade.trim(),
      data: dados.data || new Date().toISOString(),
      tempoExecucaoMinutos: dados.tempoExecucaoMinutos,
    };

    this.historicoAtividades.push(novaAtividade);
    return novaAtividade;
  }

  consultarPorId(id: string): HistoricoAtividade | undefined {
    return this.historicoAtividades.find(item => item.id === id);
  }

  consultarHistoricoPorMembro(idMembro: string): HistoricoAtividade[] {
    return this.historicoAtividades.filter(item => item.idMembro === idMembro);
  }

  calcularTempoTotalExercitado(idMembro: string): number {
    return this.consultarHistoricoPorMembro(idMembro).reduce(
      (total, item) => total + item.tempoExecucaoMinutos,
      0
    );
  }
}
