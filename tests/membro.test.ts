import { MembroService } from '../src/services/membroService';

describe('MembroService', () => {
  let membroService: MembroService;

  beforeEach(() => {
    // Arrange: inicializa uma nova instância do serviço antes de cada teste
    membroService = new MembroService();
  });

  describe('Cadastrar e Consultar Membro (Cenários Válidos)', () => {
    it('deve cadastrar um membro com dados corretos e consultar por ID e CPF', () => {
      // Arrange
      const dadosMembro = {
        nome: 'Carlos Silva',
        cpf: '123.456.789-01',
        telefone: '11987654321',
        endereco: 'Rua das Flores, 123',
        dataCadastro: '2026-01-15',
        ativo: true,
      };

      // Act
      const membroCriado = membroService.cadastrarMembro(dadosMembro);
      const membroPorId = membroService.consultarPorId(membroCriado.id);
      const membroPorCpfFormatado = membroService.consultarPorCpf('123.456.789-01');
      const membroPorCpfLimpo = membroService.consultarPorCpf('12345678901');

      // Assert
      expect(membroCriado).toBeDefined();
      expect(membroCriado.id).toBeDefined();
      expect(membroCriado.nome).toBe(dadosMembro.nome);
      expect(membroCriado.cpf).toBe(dadosMembro.cpf);
      expect(membroCriado.ativo).toBe(true);

      expect(membroPorId).toEqual(membroCriado);
      expect(membroPorCpfFormatado).toEqual(membroCriado);
      expect(membroPorCpfLimpo).toEqual(membroCriado);
    });

    it('deve listar todos os membros cadastrados', () => {
      // Arrange
      membroService.cadastrarMembro({
        nome: 'Membro Um',
        cpf: '111.111.111-11',
      });
      membroService.cadastrarMembro({
        nome: 'Membro Dois',
        cpf: '222.222.222-22',
      });

      // Act
      const lista = membroService.listarMembros();

      // Assert
      expect(lista).toHaveLength(2);
      expect(lista[0].nome).toBe('Membro Um');
      expect(lista[1].nome).toBe('Membro Dois');
    });

    it('deve retornar undefined ao consultar por ID ou CPF inexistente', () => {
      // Arrange
      const idInexistente = '999';
      const cpfInexistente = '99999999999';

      // Act
      const resultadoId = membroService.consultarPorId(idInexistente);
      const resultadoCpf = membroService.consultarPorCpf(cpfInexistente);
      const resultadoCpfVazio = membroService.consultarPorCpf('');

      // Assert
      expect(resultadoId).toBeUndefined();
      expect(resultadoCpf).toBeUndefined();
      expect(resultadoCpfVazio).toBeUndefined();
    });
  });

  describe('Validações de CPF', () => {
    it('deve bloquear cadastro com CPF com menos de 11 dígitos', () => {
      // Arrange
      const dadosCpfCurto = {
        nome: 'João Santos',
        cpf: '1234567890', // 10 dígitos
      };

      // Act & Assert
      expect(() => {
        membroService.cadastrarMembro(dadosCpfCurto);
      }).toThrow('CPF inválido: deve conter 11 dígitos');
    });

    it('deve bloquear cadastro com CPF com mais de 11 dígitos', () => {
      // Arrange
      const dadosCpfLongo = {
        nome: 'Maria Souza',
        cpf: '123456789012', // 12 dígitos
      };

      // Act & Assert
      expect(() => {
        membroService.cadastrarMembro(dadosCpfLongo);
      }).toThrow('CPF inválido: deve conter 11 dígitos');
    });

    it('deve bloquear cadastro com CPF vazio ou inválido', () => {
      // Arrange
      const dadosSemCpf = {
        nome: 'Pedro Alvares',
        cpf: '',
      };

      // Act & Assert
      expect(() => {
        membroService.cadastrarMembro(dadosSemCpf);
      }).toThrow('CPF inválido: deve conter 11 dígitos');
    });

    it('deve bloquear cadastro de membro com CPF duplicado', () => {
      // Arrange
      const membroOriginal = {
        nome: 'Lucas Lima',
        cpf: '123.456.789-00',
      };
      const membroDuplicado = {
        nome: 'Lucas Silva',
        cpf: '12345678900', // mesmo CPF sem pontuação
      };
      membroService.cadastrarMembro(membroOriginal);

      // Act & Assert
      expect(() => {
        membroService.cadastrarMembro(membroDuplicado);
      }).toThrow('Já existe um membro cadastrado com este CPF');
    });
  });

  describe('Validações de Nome', () => {
    it('deve bloquear cadastro com nome vazio', () => {
      // Arrange
      const dadosNomeVazio = {
        nome: '',
        cpf: '12345678901',
      };

      // Act & Assert
      expect(() => {
        membroService.cadastrarMembro(dadosNomeVazio);
      }).toThrow('Nome do membro inválido');
    });

    it('deve bloquear cadastro com nome com menos de 3 caracteres', () => {
      // Arrange
      const dadosNomeCurto = {
        nome: 'Ab',
        cpf: '12345678901',
      };

      // Act & Assert
      expect(() => {
        membroService.cadastrarMembro(dadosNomeCurto);
      }).toThrow('Nome do membro inválido');
    });

    it('deve bloquear cadastro com nome composto apenas por espaços', () => {
      // Arrange
      const dadosNomeEspacos = {
        nome: '   ',
        cpf: '12345678901',
      };

      // Act & Assert
      expect(() => {
        membroService.cadastrarMembro(dadosNomeEspacos);
      }).toThrow('Nome do membro inválido');
    });
  });

  describe('Alteração de Status do Membro', () => {
    it('deve alterar o status de um membro existente para inativo e ativo novamente', () => {
      // Arrange
      const membro = membroService.cadastrarMembro({
        nome: 'Mariana Costa',
        cpf: '98765432100',
        ativo: true,
      });

      // Act (inativar)
      const membroInativo = membroService.alterarStatusMembro(membro.id, false);

      // Assert
      expect(membroInativo.ativo).toBe(false);
      expect(membroService.consultarPorId(membro.id)?.ativo).toBe(false);

      // Act (reativar)
      const membroAtivo = membroService.alterarStatusMembro(membro.id, true);

      // Assert
      expect(membroAtivo.ativo).toBe(true);
      expect(membroService.consultarPorId(membro.id)?.ativo).toBe(true);
    });

    it('deve lançar erro ao tentar alterar o status de um membro inexistente', () => {
      // Arrange
      const idInexistente = 'id-nao-encontrado';

      // Act & Assert
      expect(() => {
        membroService.alterarStatusMembro(idInexistente, false);
      }).toThrow('Membro não encontrado');
    });
  });
});
