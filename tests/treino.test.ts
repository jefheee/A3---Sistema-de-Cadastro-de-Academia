import { MembroService } from '../src/services/membroService';
import { TreinoService } from '../src/services/treinoService';

describe('TreinoService', () => {
  let membroService: MembroService;
  let treinoService: TreinoService;

  beforeEach(() => {
    // Arrange: inicializa novas instâncias dos serviços antes de cada teste
    membroService = new MembroService();
    treinoService = new TreinoService(membroService);
  });

  describe('Cenários Válidos', () => {
    it('deve cadastrar treino com sucesso para um membro ativo e consultar a lista de treinos desse membro', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Lucas Silva',
        cpf: '123.456.789-01',
        telefone: '11987654321',
        endereco: 'Rua das Palmeiras, 100',
        ativo: true,
      });

      const dadosTreino = {
        idMembro: membro.id,
        tipo: 'Musculação',
        descricao: 'Treino A - Peito e Tríceps',
        duracaoMinutos: 60,
      };

      // Act
      const treinoCadastrado = treinoService.cadastrarTreino(dadosTreino);
      const listaTreinos = treinoService.listarTreinosPorMembro(membro.id);

      // Assert
      expect(treinoCadastrado).toBeDefined();
      expect(treinoCadastrado.id).toBeDefined();
      expect(treinoCadastrado.idMembro).toBe(membro.id);
      expect(treinoCadastrado.tipo).toBe(dadosTreino.tipo);
      expect(treinoCadastrado.descricao).toBe(dadosTreino.descricao);
      expect(treinoCadastrado.duracaoMinutos).toBe(dadosTreino.duracaoMinutos);
      expect(treinoCadastrado.dataInicio).toBeDefined();

      expect(listaTreinos).toHaveLength(1);
      expect(listaTreinos[0]).toEqual(treinoCadastrado);
    });

    it('deve permitir cadastrar múltiplos treinos para o mesmo membro', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Mariana Costa',
        cpf: '987.654.321-00',
        ativo: true,
      });

      // Act
      const treino1 = treinoService.cadastrarTreino({
        idMembro: membro.id,
        tipo: 'Musculação',
        descricao: 'Treino A - Superiores',
        duracaoMinutos: 45,
      });

      const treino2 = treinoService.cadastrarTreino({
        idMembro: membro.id,
        tipo: 'Cardio',
        descricao: 'Treino B - Esteira e Bicicleta',
        duracaoMinutos: 30,
      });

      const lista = treinoService.listarTreinosPorMembro(membro.id);

      // Assert
      expect(lista).toHaveLength(2);
      expect(lista).toContainEqual(treino1);
      expect(lista).toContainEqual(treino2);
    });

    it('deve gerar ID automatico sem colisao quando ja existir treino com ID manual e listar com integridade', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Lucas Silva',
        cpf: '123.456.789-01',
        ativo: true,
      });

      // Act: cadastra treino com id: "1" e outro sem ID
      const treinoManual = treinoService.cadastrarTreino({
        id: '1',
        idMembro: membro.id,
        tipo: 'Musculação',
        descricao: 'Treino com ID Manual',
        duracaoMinutos: 45,
      });

      const treinoGerado = treinoService.cadastrarTreino({
        idMembro: membro.id,
        tipo: 'Cardio',
        descricao: 'Treino com ID Gerado',
        duracaoMinutos: 30,
      });

      const treinosDoMembro = treinoService.listarTreinosPorMembro(membro.id);

      // Assert
      expect(treinoManual.id).toBe('1');
      expect(treinoGerado.id).toBeDefined();
      expect(treinoManual.id).not.toBe(treinoGerado.id);

      expect(treinosDoMembro).toHaveLength(2);
      expect(treinosDoMembro).toContainEqual(treinoManual);
      expect(treinosDoMembro).toContainEqual(treinoGerado);

      const ids = treinosDoMembro.map(t => t.id);
      expect(new Set(ids).size).toBe(2);
    });
  });

  describe('Cenários Inválidos - Regras de Vínculo com Membro', () => {
    it('deve lançar erro ao tentar cadastrar treino para um idMembro inexistente', () => {
      // Arrange
      const idMembroInexistente = 'id-inexistente-999';
      const dadosTreino = {
        idMembro: idMembroInexistente,
        tipo: 'Musculação',
        descricao: 'Treino Funcional',
        duracaoMinutos: 50,
      };

      // Act & Assert
      expect(() => {
        treinoService.cadastrarTreino(dadosTreino);
      }).toThrow('Regra violada: Membro não encontrado para vincular o treino');
    });

    it('deve lançar erro ao tentar vincular treino a um membro inativo', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'João Santos',
        cpf: '111.222.333-44',
        ativo: true,
      });

      // Inativa o membro
      membroService.alterarStatusMembro(membro.id, false);

      const dadosTreino = {
        idMembro: membro.id,
        tipo: 'Musculação',
        descricao: 'Treino de Pernas',
        duracaoMinutos: 60,
      };

      // Act & Assert
      expect(() => {
        treinoService.cadastrarTreino(dadosTreino);
      }).toThrow('Regra violada: Não é permitido vincular treino a membro inativo');
    });
  });

  describe('Cenários Inválidos - Limites de Fronteira e Validações', () => {
    it('deve lançar erro ao cadastrar treino com ID manual já existente', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Lucas Silva',
        cpf: '123.456.789-01',
        ativo: true,
      });

      const treinoOriginal = {
        id: 'T1',
        idMembro: membro.id,
        tipo: 'Musculação',
        descricao: 'Treino A',
        duracaoMinutos: 60,
      };

      const treinoComMesmoId = {
        id: 'T1',
        idMembro: membro.id,
        tipo: 'Cardio',
        descricao: 'Treino B',
        duracaoMinutos: 45,
      };

      treinoService.cadastrarTreino(treinoOriginal);

      // Act & Assert
      expect(() => {
        treinoService.cadastrarTreino(treinoComMesmoId);
      }).toThrow('Ja existe um treino cadastrado com este ID');
    });

    it('deve lançar erro quando a duração for menor que 15 minutos (ex: 14 min)', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Pedro Alvares',
        cpf: '222.333.444-55',
        ativo: true,
      });

      const dadosTreinoCurto = {
        idMembro: membro.id,
        tipo: 'Musculação',
        descricao: 'Treino Rápido',
        duracaoMinutos: 14,
      };

      // Act & Assert
      expect(() => {
        treinoService.cadastrarTreino(dadosTreinoCurto);
      }).toThrow('Regra violada: Duração do treino deve ser entre 15 e 180 minutos');
    });

    it('deve lançar erro quando a duração for maior que 180 minutos (ex: 181 min)', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Ana Oliveira',
        cpf: '333.444.555-66',
        ativo: true,
      });

      const dadosTreinoLongo = {
        idMembro: membro.id,
        tipo: 'Cardio',
        descricao: 'Maratona Exagerada',
        duracaoMinutos: 181,
      };

      // Act & Assert
      expect(() => {
        treinoService.cadastrarTreino(dadosTreinoLongo);
      }).toThrow('Regra violada: Duração do treino deve ser entre 15 e 180 minutos');
    });

    it('deve permitir cadastro nos limites exatos de 15 minutos e 180 minutos', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Beatriz Ramos',
        cpf: '444.555.666-77',
        ativo: true,
      });

      // Act
      const treinoMinimo = treinoService.cadastrarTreino({
        idMembro: membro.id,
        tipo: 'Alongamento',
        descricao: 'Treino no limite mínimo',
        duracaoMinutos: 15,
      });

      const treinoMaximo = treinoService.cadastrarTreino({
        idMembro: membro.id,
        tipo: 'Resistência',
        descricao: 'Treino no limite máximo',
        duracaoMinutos: 180,
      });

      // Assert
      expect(treinoMinimo.duracaoMinutos).toBe(15);
      expect(treinoMaximo.duracaoMinutos).toBe(180);
    });

    it('deve lançar erro quando a descrição estiver vazia ou contiver apenas espaços', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Rafael Souza',
        cpf: '555.666.777-88',
        ativo: true,
      });

      const dadosDescricaoVazia = {
        idMembro: membro.id,
        tipo: 'Musculação',
        descricao: '',
        duracaoMinutos: 60,
      };

      const dadosDescricaoEspacos = {
        idMembro: membro.id,
        tipo: 'Musculação',
        descricao: '   ',
        duracaoMinutos: 60,
      };

      // Act & Assert
      expect(() => {
        treinoService.cadastrarTreino(dadosDescricaoVazia);
      }).toThrow('Descrição do treino deve ser preenchida');

      expect(() => {
        treinoService.cadastrarTreino(dadosDescricaoEspacos);
      }).toThrow('Descrição do treino deve ser preenchida');
    });
  });
});
