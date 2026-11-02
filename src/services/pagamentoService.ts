import { Pagamento } from '../types/models';
import { MembroService } from './membroService';

export class PagamentoService {
  private pagamentos: Pagamento[] = [];
  private nextId: number = 1;

  constructor(private membroService: MembroService) {}

  registrarPagamento(dados: Partial<Pagamento>): Pagamento {
    // Regra 1: Verifica se o idMembro existe no membroService.consultarPorId(idMembro).
    // Se não existir, lança Error("Membro não encontrado para registrar pagamento").
    if (!dados?.idMembro || !this.membroService.consultarPorId(dados.idMembro)) {
      throw new Error("Membro não encontrado para registrar pagamento");
    }

    // Regra 2: Verifica se valor é maior que zero (valor > 0).
    // Se for zero ou negativo, lança Error("Valor do pagamento deve ser maior que zero").
    if (
      dados.valor === undefined ||
      dados.valor === null ||
      typeof dados.valor !== 'number' ||
      isNaN(dados.valor) ||
      dados.valor <= 0
    ) {
      throw new Error("Valor do pagamento deve ser maior que zero");
    }

    // Regra 3: Verifica se dataPagamento foi informada. Salva e retorna o pagamento com status 'PAGO' ou 'PENDENTE'.
    const dataInformada = Boolean(
      dados.dataPagamento &&
      typeof dados.dataPagamento === 'string' &&
      dados.dataPagamento.trim().length > 0
    );

    const status: 'PAGO' | 'PENDENTE' = dados.status ?? (dataInformada ? 'PAGO' : 'PENDENTE');

    const novoPagamento: Pagamento = {
      id: dados.id || String(this.nextId++),
      idMembro: dados.idMembro,
      valor: dados.valor,
      dataPagamento: dados.dataPagamento?.trim() || '',
      status,
    };

    this.pagamentos.push(novoPagamento);
    return novoPagamento;
  }

  listarPagamentosPorMembro(idMembro: string): Pagamento[] {
    return this.pagamentos.filter(pagamento => pagamento.idMembro === idMembro);
  }

  confirmarPagamentoPendente(idPagamento: string, dataPagamento?: string): Pagamento {
    const pagamento = this.consultarPorId(idPagamento);
    if (!pagamento) {
      throw new Error("Pagamento não encontrado");
    }

    if (pagamento.status === 'PAGO') {
      throw new Error("Pagamento já está pago");
    }

    pagamento.status = 'PAGO';
    if (dataPagamento) {
      pagamento.dataPagamento = dataPagamento;
    }

    return pagamento;
  }

  verificarAdimplencia(idMembro: string): boolean {
    const pagamentosMembro = this.listarPagamentosPorMembro(idMembro);

    const temPendente = pagamentosMembro.some(pagamento => pagamento.status === 'PENDENTE');
    const temPago = pagamentosMembro.some(pagamento => pagamento.status === 'PAGO');

    return !temPendente && temPago;
  }

  consultarPorId(id: string): Pagamento | undefined {
    return this.pagamentos.find(pagamento => pagamento.id === id);
  }

  listarPagamentos(): Pagamento[] {
    return [...this.pagamentos];
  }
}
