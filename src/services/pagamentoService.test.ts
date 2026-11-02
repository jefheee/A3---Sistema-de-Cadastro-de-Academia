import { MembroService } from './membroService';
import { PagamentoService } from './pagamentoService';

describe('PagamentoService', () => {
  let membroService: MembroService;
  let pagamentoService: PagamentoService;

  beforeEach(() => {
    // Arrange: inicializa novas instâncias dos serviços antes de cada teste
    membroService = new MembroService();
    pagamentoService = new PagamentoService(membroService);
  });

  describe('1. Registro de Pagamento com Membro Existente', () => {
    it('deve registrar pagamento com sucesso para um membro existente', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Carlos Silva',
        cpf: '123.456.789-01',
        telefone: '11987654321',
        endereco: 'Rua das Flores, 123',
        ativo: true,
      });

      const dadosPagamento = {
        idMembro: membro.id,
        valor: 150.0,
        dataPagamento: '2026-11-02',
      };

      // Act
      const pagamento = pagamentoService.registrarPagamento(dadosPagamento);

      // Assert
      expect(pagamento).toBeDefined();
      expect(pagamento.id).toBeDefined();
      expect(pagamento.idMembro).toBe(membro.id);
      expect(pagamento.valor).toBe(150.0);
      expect(pagamento.dataPagamento).toBe('2026-11-02');
      expect(pagamento.status).toBe('PAGO');
    });
  });

  describe('2. Validação de Membro Inexistente', () => {
    it('deve lançar erro ao tentar registrar pagamento para um idMembro inexistente', () => {
      // Arrange
      const idInexistente = 'membro-inexistente-999';

      // Act & Assert
      expect(() => {
        pagamentoService.registrarPagamento({
          idMembro: idInexistente,
          valor: 100.0,
        });
      }).toThrow('Membro não encontrado para registrar pagamento');
    });

    it('deve lançar erro ao tentar registrar pagamento sem informar idMembro', () => {
      // Act & Assert
      expect(() => {
        pagamentoService.registrarPagamento({
          valor: 100.0,
        });
      }).toThrow('Membro não encontrado para registrar pagamento');
    });
  });

  describe('3. Validação de Valor Zero, Negativo ou Inválido', () => {
    let membroId: string;

    beforeEach(() => {
      const membro = membroService.cadastrarMembro({
        nome: 'Lucas Santos',
        cpf: '222.333.444-55',
      });
      membroId = membro.id;
    });

    it('deve lançar erro ao tentar registrar pagamento com valor zero', () => {
      // Act & Assert
      expect(() => {
        pagamentoService.registrarPagamento({
          idMembro: membroId,
          valor: 0,
        });
      }).toThrow('Valor do pagamento deve ser maior que zero');
    });

    it('deve lançar erro ao tentar registrar pagamento com valor negativo', () => {
      // Act & Assert
      expect(() => {
        pagamentoService.registrarPagamento({
          idMembro: membroId,
          valor: -50.0,
        });
      }).toThrow('Valor do pagamento deve ser maior que zero');
    });

    it('deve lançar erro ao tentar registrar pagamento sem valor ou com valor inválido (NaN)', () => {
      // Act & Assert
      expect(() => {
        pagamentoService.registrarPagamento({
          idMembro: membroId,
          valor: NaN,
        });
      }).toThrow('Valor do pagamento deve ser maior que zero');

      expect(() => {
        pagamentoService.registrarPagamento({
          idMembro: membroId,
        });
      }).toThrow('Valor do pagamento deve ser maior que zero');
    });
  });

  describe('4. Registro com Data de Pagamento e sem Data', () => {
    let membroId: string;

    beforeEach(() => {
      const membro = membroService.cadastrarMembro({
        nome: 'Mariana Costa',
        cpf: '333.444.555-66',
      });
      membroId = membro.id;
    });

    it('deve salvar pagamento com status PAGO quando dataPagamento for informada', () => {
      // Arrange & Act
      const pagamento = pagamentoService.registrarPagamento({
        idMembro: membroId,
        valor: 120.0,
        dataPagamento: '2026-11-02',
      });

      // Assert
      expect(pagamento.status).toBe('PAGO');
      expect(pagamento.dataPagamento).toBe('2026-11-02');
    });

    it('deve salvar pagamento com status PENDENTE quando dataPagamento não for informada', () => {
      // Arrange & Act
      const pagamento = pagamentoService.registrarPagamento({
        idMembro: membroId,
        valor: 120.0,
      });

      // Assert
      expect(pagamento.status).toBe('PENDENTE');
      expect(pagamento.dataPagamento).toBe('');
    });

    it('deve salvar pagamento com status PENDENTE quando dataPagamento for vazia ou contiver apenas espaços', () => {
      // Arrange & Act
      const pagamentoVazio = pagamentoService.registrarPagamento({
        idMembro: membroId,
        valor: 100.0,
        dataPagamento: '   ',
      });

      // Assert
      expect(pagamentoVazio.status).toBe('PENDENTE');
      expect(pagamentoVazio.dataPagamento).toBe('');
    });
  });

  describe('5. Listagem de Pagamentos por Membro', () => {
    it('deve retornar o histórico correto de pagamentos do membro filtrado por idMembro', () => {
      // Arrange
      const membro1 = membroService.cadastrarMembro({
        nome: 'Aluno Um',
        cpf: '444.555.666-77',
      });
      const membro2 = membroService.cadastrarMembro({
        nome: 'Aluno Dois',
        cpf: '555.666.777-88',
      });

      const pag1 = pagamentoService.registrarPagamento({
        idMembro: membro1.id,
        valor: 100.0,
        dataPagamento: '2026-01-10',
      });
      const pag2 = pagamentoService.registrarPagamento({
        idMembro: membro1.id,
        valor: 110.0,
      });
      const pag3 = pagamentoService.registrarPagamento({
        idMembro: membro2.id,
        valor: 150.0,
        dataPagamento: '2026-02-15',
      });

      // Act
      const historicoMembro1 = pagamentoService.listarPagamentosPorMembro(membro1.id);
      const historicoMembro2 = pagamentoService.listarPagamentosPorMembro(membro2.id);

      // Assert
      expect(historicoMembro1).toHaveLength(2);
      expect(historicoMembro1).toContainEqual(pag1);
      expect(historicoMembro1).toContainEqual(pag2);
      expect(historicoMembro1).not.toContainEqual(pag3);

      expect(historicoMembro2).toHaveLength(1);
      expect(historicoMembro2).toContainEqual(pag3);
    });

    it('deve retornar array vazio ao listar pagamentos de membro sem histórico', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Aluno Sem Pagamentos',
        cpf: '666.777.888-99',
      });

      // Act
      const historico = pagamentoService.listarPagamentosPorMembro(membro.id);

      // Assert
      expect(historico).toEqual([]);
    });
  });

  describe('6. Confirmação de Pagamento Pendente', () => {
    it('deve alterar o status de um pagamento de PENDENTE para PAGO com sucesso', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Juliana Paes',
        cpf: '777.888.999-00',
      });

      const pagamentoPendente = pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 130.0,
      });
      expect(pagamentoPendente.status).toBe('PENDENTE');

      // Act
      const pagamentoConfirmado = pagamentoService.confirmarPagamentoPendente(pagamentoPendente.id);

      // Assert
      expect(pagamentoConfirmado.status).toBe('PAGO');
      expect(pagamentoConfirmado.id).toBe(pagamentoPendente.id);

      // Verifica persistência na consulta por id
      const consultado = pagamentoService.consultarPorId(pagamentoPendente.id);
      expect(consultado?.status).toBe('PAGO');
    });

    it('deve permitir atualizar dataPagamento opcional ao confirmar pagamento pendente', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Fernanda Lima',
        cpf: '888.999.000-11',
      });

      const pagamentoPendente = pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 100.0,
      });

      // Act
      const confirmado = pagamentoService.confirmarPagamentoPendente(pagamentoPendente.id, '2026-11-05');

      // Assert
      expect(confirmado.status).toBe('PAGO');
      expect(confirmado.dataPagamento).toBe('2026-11-05');
    });
  });

  describe('7. Validação de Confirmação de Pagamento Inexistente', () => {
    it('deve lançar erro ao tentar confirmar um pagamento com id inexistente', () => {
      // Arrange
      const idInexistente = 'pagamento-inexistente-999';

      // Act & Assert
      expect(() => {
        pagamentoService.confirmarPagamentoPendente(idInexistente);
      }).toThrow('Pagamento não encontrado');
    });
  });

  describe('8. Validação de Confirmação de Pagamento Já Pago', () => {
    it('deve lançar erro ao tentar confirmar pagamento que já foi registrado como PAGO', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Roberto Carlos',
        cpf: '999.000.111-22',
      });

      const pagamentoPago = pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 150.0,
        dataPagamento: '2026-11-01',
      });
      expect(pagamentoPago.status).toBe('PAGO');

      // Act & Assert
      expect(() => {
        pagamentoService.confirmarPagamentoPendente(pagamentoPago.id);
      }).toThrow('Pagamento já está pago');
    });

    it('deve lançar erro ao tentar confirmar um pagamento pendente duas vezes consecutivas', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Aline Barros',
        cpf: '111.333.555-77',
      });

      const pendente = pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 140.0,
      });

      // Primeira confirmação: deve passar
      pagamentoService.confirmarPagamentoPendente(pendente.id);

      // Segunda confirmação: deve falhar
      expect(() => {
        pagamentoService.confirmarPagamentoPendente(pendente.id);
      }).toThrow('Pagamento já está pago');
    });
  });

  describe('9. Verificação de Adimplência com Pagamentos Pagos e Pendentes', () => {
    it('deve retornar false quando o membro possuir pagamento PAGO mas tiver pelo menos um PENDENTE', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Marcos Braz',
        cpf: '222.444.666-88',
      });

      // Pagamento 1: PAGO
      pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 100.0,
        dataPagamento: '2026-10-01',
      });

      // Pagamento 2: PENDENTE
      pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 100.0,
      });

      // Act
      const adimplente = pagamentoService.verificarAdimplencia(membro.id);

      // Assert
      expect(adimplente).toBe(false);
    });

    it('deve retornar false quando o membro possuir apenas pagamentos PENDENTES', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Bruno Henrique',
        cpf: '333.555.777-99',
      });

      pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 100.0,
      });

      // Act
      const adimplente = pagamentoService.verificarAdimplencia(membro.id);

      // Assert
      expect(adimplente).toBe(false);
    });

    it('deve retornar true quando todos os pagamentos do membro forem PAGO (sem pendências)', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Gerson Santos',
        cpf: '444.666.888-00',
      });

      pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 100.0,
        dataPagamento: '2026-09-01',
      });
      pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 100.0,
        dataPagamento: '2026-10-01',
      });

      // Act
      const adimplente = pagamentoService.verificarAdimplencia(membro.id);

      // Assert
      expect(adimplente).toBe(true);
    });

    it('deve se tornar adimplente após confirmar o pagamento pendente', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Everton Ribeiro',
        cpf: '555.777.999-11',
      });

      pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 100.0,
        dataPagamento: '2026-10-01',
      });
      const pendente = pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 100.0,
      });

      expect(pagamentoService.verificarAdimplencia(membro.id)).toBe(false);

      // Act
      pagamentoService.confirmarPagamentoPendente(pendente.id);

      // Assert
      expect(pagamentoService.verificarAdimplencia(membro.id)).toBe(true);
    });
  });

  describe('10. Verificação de Adimplência sem Pagamentos Registrados', () => {
    it('deve retornar false quando o membro não tiver nenhum pagamento cadastrado', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Diego Alves',
        cpf: '666.888.000-22',
      });

      // Act
      const adimplente = pagamentoService.verificarAdimplencia(membro.id);

      // Assert
      expect(adimplente).toBe(false);
    });

    it('deve retornar false para idMembro inexistente', () => {
      // Act
      const adimplente = pagamentoService.verificarAdimplencia('id-inexistente-qualquer');

      // Assert
      expect(adimplente).toBe(false);
    });
  });

  describe('Métodos Auxiliares de Consulta', () => {
    it('deve listar todos os pagamentos cadastrados no sistema', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Filipe Luis',
        cpf: '777.999.111-33',
      });
      pagamentoService.registrarPagamento({
        idMembro: membro.id,
        valor: 50.0,
        dataPagamento: '2026-01-01',
      });

      // Act
      const todos = pagamentoService.listarPagamentos();

      // Assert
      expect(todos.length).toBeGreaterThanOrEqual(1);
    });
  });
});
