import { Treino } from '../types/models';
import { MembroService } from './membroService';

export class TreinoService {
  private treinos: Treino[] = [];
  private nextId: number = 1;

  constructor(private membroService: MembroService) {}

  cadastrarTreino(dados: Partial<Treino>): Treino {
    if (dados?.id && this.consultarTreinoPorId(dados.id)) {
      throw new Error("Ja existe um treino cadastrado com este ID");
    }

    // a) Verifica se o idMembro existe no membroService.consultarPorId(idMembro)
    if (!dados?.idMembro) {
      throw new Error("Regra violada: Membro não encontrado para vincular o treino");
    }

    const membro = this.membroService.consultarPorId(dados.idMembro);
    if (!membro) {
      throw new Error("Regra violada: Membro não encontrado para vincular o treino");
    }

    // b) Verifica se o membro está com ativo === true
    if (!membro.ativo) {
      throw new Error("Regra violada: Não é permitido vincular treino a membro inativo");
    }

    // c) Verifica se duracaoMinutos está entre 15 e 180 minutos
    if (
      dados.duracaoMinutos === undefined ||
      dados.duracaoMinutos === null ||
      typeof dados.duracaoMinutos !== 'number' ||
      isNaN(dados.duracaoMinutos) ||
      dados.duracaoMinutos < 15 ||
      dados.duracaoMinutos > 180
    ) {
      throw new Error("Regra violada: Duração do treino deve ser entre 15 e 180 minutos");
    }

    // d) Verifica se tipo e descricao foram preenchidos
    if (!dados.tipo || typeof dados.tipo !== 'string' || !dados.tipo.trim()) {
      throw new Error("Tipo do treino deve ser preenchido");
    }

    if (!dados.descricao || typeof dados.descricao !== 'string' || !dados.descricao.trim()) {
      throw new Error("Descrição do treino deve ser preenchida");
    }

    let idFinal = dados.id;
    if (!idFinal) {
      while (this.consultarTreinoPorId(String(this.nextId))) {
        this.nextId++;
      }
      idFinal = String(this.nextId++);
    }

    const novoTreino: Treino = {
      id: idFinal,
      idMembro: dados.idMembro,
      tipo: dados.tipo.trim(),
      descricao: dados.descricao.trim(),
      duracaoMinutos: dados.duracaoMinutos,
      dataInicio: dados.dataInicio || new Date().toISOString(),
    };

    this.treinos.push(novoTreino);
    return novoTreino;
  }

  consultarTreinoPorId(id: string): Treino | undefined {
    return this.treinos.find(treino => treino.id === id);
  }

  listarTreinosPorMembro(idMembro: string): Treino[] {
    return this.treinos.filter(treino => treino.idMembro === idMembro);
  }

  consultarPorId(id: string): Treino | undefined {
    return this.treinos.find(treino => treino.id === id);
  }

  listarTreinos(): Treino[] {
    return [...this.treinos];
  }
}
