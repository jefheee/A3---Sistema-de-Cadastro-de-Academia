import { MembroService } from '../src/services/membroService';
import { AtividadeService } from '../src/services/atividadeService';
import { Membro } from '../src/types/models';

describe('AtividadeService', () => {
  let membroService: MembroService;
  let atividadeService: AtividadeService;
  let membroAtivo: Membro;

  beforeEach(() => {
    // Arrange: inicializa novas instâncias dos serviços e um membro ativo antes de cada teste
    membroService = new MembroService();
    atividadeService = new AtividadeService(membroService);
    membroAtivo = membroService.cadastrarMembro({
      nome: 'Ana Souza',
      cpf: '123.456.789-01',
      telefone: '11987654321',
      endereco: 'Rua das Acácias, 50',
      ativo: true,
    });
  });

  describe('1. Cenário Válido: registro, histórico e tempo total', () => {
    it('deve registrar duas atividades para um membro ativo, consultar o histórico e somar o tempo total', () => {
      // Arrange
      const atividade1 = {
        idMembro: membroAtivo.id,
        atividade: 'Corrida na esteira',
        data: '2026-11-01',
        tempoExecucaoMinutos: 30,
      };
      const atividade2 = {
        idMembro: membroAtivo.id,
        atividade: 'Musculação',
        data: '2026-11-02',
        tempoExecucaoMinutos: 45,
      };

      // Act
      const registrada1 = atividadeService.registrarAtividade(atividade1);
      const registrada2 = atividadeService.registrarAtividade(atividade2);
      const historico = atividadeService.consultarHistoricoPorMembro(membroAtivo.id);
      const tempoTotal = atividadeService.calcularTempoTotalExercitado(membroAtivo.id);

      // Assert
      expect(registrada1.id).toBeDefined();
      expect(registrada2.id).toBeDefined();
      expect(registrada1.id).not.toBe(registrada2.id);
      expect(historico).toHaveLength(2);
      expect(historico).toEqual([registrada1, registrada2]);
      expect(historico[0].atividade).toBe('Corrida na esteira');
      expect(historico[1].atividade).toBe('Musculação');
      expect(tempoTotal).toBe(75);
    });

    it('deve retornar histórico vazio e tempo total zero para membro sem atividades', () => {
      // Arrange
      const idMembro = membroAtivo.id;

      // Act
      const historico = atividadeService.consultarHistoricoPorMembro(idMembro);
      const tempoTotal = atividadeService.calcularTempoTotalExercitado(idMembro);

      // Assert
      expect(historico).toEqual([]);
      expect(tempoTotal).toBe(0);
    });
  });

  describe('2. Cenário Inválido: membro inexistente ou inativo', () => {
    it('deve bloquear registro de atividade para membro inexistente', () => {
      // Arrange
      const dados = {
        idMembro: '999',
        atividade: 'Bicicleta',
        tempoExecucaoMinutos: 30,
      };

      // Act
      const acao = () => atividadeService.registrarAtividade(dados);

      // Assert
      expect(acao).toThrow('Membro não encontrado ou inativo para registrar atividade');
      expect(atividadeService.consultarHistoricoPorMembro('999')).toHaveLength(0);
    });

    it('deve bloquear registro de atividade para membro inativo', () => {
      // Arrange
      membroService.alterarStatusMembro(membroAtivo.id, false);
      const dados = {
        idMembro: membroAtivo.id,
        atividade: 'Natação',
        tempoExecucaoMinutos: 40,
      };

      // Act
      const acao = () => atividadeService.registrarAtividade(dados);

      // Assert
      expect(acao).toThrow('Membro não encontrado ou inativo para registrar atividade');
      expect(atividadeService.consultarHistoricoPorMembro(membroAtivo.id)).toHaveLength(0);
    });
  });

  describe('3. Cenário Inválido: tempo de execução fora do intervalo ou descrição vazia', () => {
    it.each([0, 4])('deve bloquear atividade com tempo menor que 5 minutos (%i min)', (tempo) => {
      // Arrange
      const dados = {
        idMembro: membroAtivo.id,
        atividade: 'Alongamento',
        tempoExecucaoMinutos: tempo,
      };

      // Act
      const acao = () => atividadeService.registrarAtividade(dados);

      // Assert
      expect(acao).toThrow('Tempo de execução deve ser entre 5 e 240 minutos');
      expect(atividadeService.consultarHistoricoPorMembro(membroAtivo.id)).toHaveLength(0);
    });

    it('deve bloquear atividade com tempo maior que 240 minutos (250 min)', () => {
      // Arrange
      const dados = {
        idMembro: membroAtivo.id,
        atividade: 'Maratona',
        tempoExecucaoMinutos: 250,
      };

      // Act
      const acao = () => atividadeService.registrarAtividade(dados);

      // Assert
      expect(acao).toThrow('Tempo de execução deve ser entre 5 e 240 minutos');
      expect(atividadeService.consultarHistoricoPorMembro(membroAtivo.id)).toHaveLength(0);
    });

    it.each(['', '   '])('deve bloquear atividade com descrição vazia ("%s")', (descricao) => {
      // Arrange
      const dados = {
        idMembro: membroAtivo.id,
        atividade: descricao,
        tempoExecucaoMinutos: 30,
      };

      // Act
      const acao = () => atividadeService.registrarAtividade(dados);

      // Assert
      expect(acao).toThrow('Nome da atividade não pode ser vazio');
      expect(atividadeService.consultarHistoricoPorMembro(membroAtivo.id)).toHaveLength(0);
    });
  });
});
