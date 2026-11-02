import { MembroService } from './services/membroService';
import { TreinoService } from './services/treinoService';

function main() {
  console.log('==================================================');
  console.log('  SISTEMA DE CADASTRO DE ACADEMIA - DEMONSTRAÇÃO  ');
  console.log('==================================================\n');

  // Inicialização dos serviços com injeção de dependência
  const membroService = new MembroService();
  const treinoService = new TreinoService(membroService);

  // Passo 1: Cadastra um membro válido no MembroService
  console.log('--- Passo 1: Cadastrando membro válido ---');
  const membro = membroService.cadastrarMembro({
    nome: 'Carlos Silva',
    cpf: '123.456.789-01',
    telefone: '11987654321',
    endereco: 'Rua das Flores, 123',
    ativo: true,
  });
  console.log('Membro cadastrado com sucesso:');
  console.log(membro);
  console.log();

  // Passo 2: Consulta o membro cadastrado pelo CPF/ID
  console.log('--- Passo 2: Consultando membro cadastrado por ID e CPF ---');
  const membroPorId = membroService.consultarPorId(membro.id);
  console.log(`Consulta por ID (${membro.id}):`, membroPorId?.nome, `(Ativo: ${membroPorId?.ativo})`);

  const membroPorCpf = membroService.consultarPorCpf('123.456.789-01');
  console.log(`Consulta por CPF (123.456.789-01):`, membroPorCpf?.nome);
  console.log();

  // Passo 3: Cadastra um treino vinculado a esse membro no TreinoService e exibe os treinos do aluno no console
  console.log('--- Passo 3: Cadastrando treino vinculado ao membro e exibindo treinos ---');
  const treino = treinoService.cadastrarTreino({
    idMembro: membro.id,
    tipo: 'Musculação',
    descricao: 'Treino A - Peito, Tríceps e Abdômen',
    duracaoMinutos: 60,
  });
  console.log('Treino cadastrado com sucesso:');
  console.log(treino);
  console.log();

  const treinosDoAluno = treinoService.listarTreinosPorMembro(membro.id);
  console.log(`Treinos encontrados para o aluno (${membro.nome}):`);
  console.log(treinosDoAluno);
  console.log('\n==================================================');
  console.log('  Fluxo Principal concluído com sucesso!');
  console.log('==================================================');
}

main();
