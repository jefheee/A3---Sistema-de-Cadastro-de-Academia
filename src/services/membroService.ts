import { Membro } from '../types/models';

export class MembroService {
  private membros: Membro[] = [];
  private nextId: number = 1;

  cadastrarMembro(dados: Partial<Membro>): Membro {
    const nome = dados?.nome;
    if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
      throw new Error("Nome do membro inválido");
    }

    const cpf = dados?.cpf;
    const cpfLimpo = cpf ? String(cpf).replace(/\D/g, '') : '';
    const semPontuacao = cpf ? String(cpf).replace(/[.\-_/ ]/g, '') : '';

    if (!cpf || cpfLimpo.length !== 11 || semPontuacao !== cpfLimpo) {
      throw new Error("CPF inválido: deve conter 11 dígitos");
    }

    if (this.consultarPorCpf(cpf)) {
      throw new Error("Já existe um membro cadastrado com este CPF");
    }

    const novoMembro: Membro = {
      id: dados.id || String(this.nextId++),
      nome,
      cpf,
      telefone: dados.telefone || '',
      endereco: dados.endereco || '',
      dataCadastro: dados.dataCadastro || new Date().toISOString(),
      ativo: dados.ativo !== undefined ? dados.ativo : true,
    };

    this.membros.push(novoMembro);
    return novoMembro;
  }

  consultarPorId(id: string): Membro | undefined {
    return this.membros.find(membro => membro.id === id);
  }

  consultarPorCpf(cpf: string): Membro | undefined {
    if (!cpf) return undefined;
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!cpfLimpo) return undefined;
    return this.membros.find(membro => membro.cpf.replace(/\D/g, '') === cpfLimpo);
  }

  listarMembros(): Membro[] {
    return [...this.membros];
  }

  alterarStatusMembro(id: string, ativo: boolean): Membro {
    const membro = this.consultarPorId(id);
    if (!membro) {
      throw new Error("Membro não encontrado");
    }
    membro.ativo = ativo;
    return membro;
  }
}
