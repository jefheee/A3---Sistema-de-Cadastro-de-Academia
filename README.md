# Sistema de Cadastro de Academia — A3 (UNISUL)

Projeto prático desenvolvido para a Unidade Curricular de **Garantia e Qualidade de Software (GQS)** da UNISUL, sob orientação do **Prof. Jorge Werner**.

O objetivo do projeto é aplicar os conceitos de Garantia da Qualidade de Software na prática, implementando regras de negócio em TypeScript, testes unitários com Jest cobrindo cenários válidos e inválidos com mais de 75% de cobertura, automação com Integração Contínua (CI via GitHub Actions) e boas práticas de gestão de configuração.

---

## 1. Problema Atendido e Contexto

O gerenciamento manual ou desarticulado de academias gera inconsistências de dados cadastrais, liberação indevida de fichas de treino para alunos inativos, inadimplência e perda de histórico físico. 

O **Sistema de Cadastro de Academia** resolve esse problema centralizando a administração do fluxo operacional em memória, garantindo:
- Validação rígida de documentos de identificação (CPF com 11 dígitos);
- Vinculação obrigatória de rotinas de treino apenas a alunos devidamente cadastrados e com matrícula ativa;
- Controle de adimplência financeira e quitação de mensalidades;
- Registro e monitoramento do histórico de atividades físicas executadas pelos membros.

---

## 2. Usuários e Atores do Sistema

- **Recepcionista:** Realiza o cadastro e atualização de dados dos membros, consultas por CPF/ID, controle de status de matrícula e cobrança/confirmação de mensalidades.
- **Instrutor / Personal Trainer:** Cadastra, planeja e vincula treinos específicos aos alunos ativos, além de acompanhar o histórico de atividades e o tempo de exercício realizado.
- **Gestor da Academia:** Acompanha relatórios de membros adimplentes/inadimplentes e monitora a utilização geral do sistema.

---

## 3. Tecnologias Escolhidas

- **Linguagem & Plataforma:** Node.js v20+ e TypeScript para forte tipagem estática e segurança em tempo de desenvolvimento.
- **Framework de Testes & Cobertura:** [Jest](https://jestjs.io/) e `ts-jest` com verificação de limites globais (`coverageThreshold >= 75%`).
- **Integração Contínua (CI):** [GitHub Actions](https://github.com/features/actions) executando compilação TypeScript (`tsc --noEmit`), execução completa das suítes de testes e checagem de cobertura a cada `push` e `pull_request` na branch `main`.
- **Análise Estática & Qualidade (Prevista):** SonarCloud para análise contínua de código, detecção de dívida técnica e Quality Gate.

---

## 4. Requisitos do Sistema

### 4.1 Requisitos Funcionais (RF)
- **RF01 - Cadastro e Gestão de Membros:** Permitir cadastro com validação de dados obrigatórios (nome mínimo de 3 caracteres, CPF único com 11 dígitos numéricos), consulta por ID ou CPF, listagem geral e ativação/desativação de matrícula.
- **RF02 - Gestão de Treinos e Vínculo:** Permitir vinculação de fichas de treino com validação estrita de membro existente e com matrícula ativa, além de validar duração entre 15 e 180 minutos.
- **RF03 - Gestão de Pagamentos e Adimplência:** Registro de pagamentos com valor estritamente positivo (> 0), confirmação de mensalidades pendentes e verificação de adimplência do aluno.
- **RF04 - Histórico de Atividades Físicas:** Registro de treinos/atividades realizados por membros ativos, garantindo duração entre 5 e 240 minutos e cálculo consolidado do tempo total exercitado.

### 4.2 Requisitos de Qualidade Prioritários (RNF)
- **Confiabilidade:** Nenhuma regra de negócio deve ser violada; regras inconsistentes lançam exceções tratáveis e bloqueiam o estado inválido.
- **Manutenibilidade:** Código modularizado em serviços independentes (`src/services/`), injeção de dependência e alta cobertura de testes unitários automatizados.
- **Segurança e Integridade:** Bloqueio de duplicidade de CPF e garantia de integridade referencial entre membros e seus treinos, pagamentos e históricos.
- **Usabilidade:** Métodos com assinaturas semânticas e script de demonstração claro via terminal.

---

## 5. Especificação do Fluxo Principal Executável

O fluxo principal demonstrado no console (`src/index.ts`) executa o ciclo fundamental exigido na **Issue #1**:
1. Cadastro de um membro válido no `MembroService`.
2. Consulta do membro cadastrado por ID e por CPF.
3. Cadastro de uma ficha de treino vinculada ao membro no `TreinoService`.
4. Consulta e exibição de todos os treinos do aluno.

### Critérios de Aceitação (Dado / Quando / Então)

#### Cenário 1: Cadastro e Vínculo de Treino com Sucesso (Cenário Válido)
- **Dado** que o recepcionista informa um membro com nome `"Carlos Silva"` e CPF `"123.456.789-01"` válido e ativo;
- **Quando** o instrutor cadastra um treino do tipo `"Musculação"` com duração de `60` minutos associado a este membro;
- **Então** o treino é salvo com sucesso e listado na consulta do membro.

#### Cenário 2: Tentativa de Vincular Treino a Membro Inexistente (Cenário Inválido)
- **Dado** que um instrutor tenta registrar um treino informando um `idMembro` não cadastrado;
- **Quando** o método `cadastrarTreino` é executado;
- **Então** o sistema rejeita a operação e lança o erro `"Regra violada: Membro não encontrado para vincular o treino"`.

#### Cenário 3: Tentativa de Vincular Treino a Membro Inativo (Cenário Inválido)
- **Dado** que o membro existe no sistema, mas sua matrícula está com status `ativo: false`;
- **Quando** o instrutor tenta cadastrar um treino para este membro;
- **Então** o sistema bloqueia o registro e lança o erro `"Regra violada: Não é permitido vincular treino a membro inativo"`.

#### Cenário 4: Limites de Duração de Treino Inválidos (Cenário Inválido)
- **Dado** um membro ativo cadastrado;
- **Quando** o treino possui duração inferior a 15 minutos (ex: 14 min) ou superior a 180 minutos (ex: 181 min);
- **Então** o sistema bloqueia o treino e lança o erro `"Regra violada: Duração do treino deve ser entre 15 e 180 minutos"`.

---

## 6. Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- `npm` instalado.

### 1. Instalar as dependências
```bash
npm install
```

### 2. Executar o fluxo principal de demonstração
```bash
npm start
```

### 3. Executar os testes unitários
```bash
npm test
```

### 4. Gerar o relatório de cobertura de código
```bash
npm run test:coverage
```

---

## 7. Estrutura do Repositório e Licença

```text
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline GitHub Actions (CI)
├── src/
│   ├── services/
│   │   ├── atividadeService.ts  # Módulo de Histórico de Atividades
│   │   ├── membroService.ts     # Módulo de Cadastro e Consulta de Membros
│   │   ├── pagamentoService.ts  # Módulo de Gestão de Pagamentos
│   │   └── treinoService.ts     # Módulo de Gestão e Vínculo de Treinos
│   ├── types/
│   │   └── models.ts            # Interfaces e modelos de dados
│   └── index.ts                 # Fluxo Principal Executável de Demonstração
├── tests/
│   ├── atividade.test.ts        # Testes unitários de Histórico de Atividades
│   ├── membro.test.ts           # Testes unitários de Membros
│   ├── pagamento.test.ts        # Testes unitários de Pagamentos
│   └── treino.test.ts           # Testes unitários de Treinos
├── jest.config.js               # Configuração do Jest com cobertura >= 75%
├── tsconfig.json                # Configuração do compilador TypeScript
├── package.json                 # Scripts e dependências do projeto
├── LICENSE                      # Licença MIT
└── README.md                    # Documentação do projeto
```

- **Licença:** Este projeto está sob a [Licença MIT](./LICENSE).
- **Convenção de Commits:** Utiliza o padrão *Conventional Commits* (`feat`, `test`, `fix`, `docs`, `ci`, `chore`).

---

## 8. Tabela de Responsabilidades da Equipe (Item 2.9)

A distribuição das tarefas de implementação de código e criação dos testes unitários seguiu o planejamento da disciplina:

| Aluno Integrante | Usuário GitHub | Matrícula / RA | Papel e Funcionalidade Desenvolvida | Link do Arquivo de Teste |
| :--- | :--- | :--- | :--- | :--- |
| **Jefherson Luiz da Silva** | [@jefheee](https://github.com/jefheee) | 10725114819 | **Líder & Dev:** Configuração inicial TS/Jest, Módulo de Membros e Documentação Final | [tests/membro.test.ts](./tests/membro.test.ts) |
| **Gabriel Carlos Seemann Grando** | [@eugabrielgrando](https://github.com/eugabrielgrando) | 10725118226 | **Arquiteto & Dev:** Módulo de Treinos, Regra de Vínculo e Fluxo Principal Executável | [tests/treino.test.ts](./tests/treino.test.ts) |
| **Maicon Lodetti** | [@maiconlr](https://github.com/maiconlr) | 1072511629 | **QA & Dev:** Módulo de Pagamentos, Gestão Financeira e Verificação de Adimplência | [tests/pagamento.test.ts](./tests/pagamento.test.ts) |
| **Mauricio Garcia** | [@eugarcias](https://github.com/eugarcias) | 11725117614 | **DevOps & Dev:** Módulo de Histórico de Atividades Físicas e Pipeline CI (GitHub Actions) | [tests/atividade.test.ts](./tests/atividade.test.ts) |

---

## 9. Plano Inicial de Testes e Cronograma

### 9.1 Estratégia de Testes
- **Testes Unitários:** Implementados com Jest e padrão AAA (Arrange, Act, Assert), cobrindo cada serviço isoladamente em cenários válidos, inválidos e condições de fronteira.
- **Cobertura de Código:** Meta mínima estabelecida em 75% (atualmente atingindo **> 94%** de cobertura global em todas as métricas).
- **Testes de Integração:** Planejados para validar os fluxos cruzados entre serviços com persistência em memória.
- **Integração Contínua (CI):** Execução automatizada em container Ubuntu a cada push/pull request na `main`.
- **Análise Estática de Código:** Integração prevista com SonarCloud para verificação de bugs, vulnerabilidades, code smells e Quality Gate.

### 9.2 Cronograma Geral de Entregas (Outubro a Dezembro de 2026)
- **09/10/2026 a 23/10/2026:** Definição do tema, repositório e planejamento inicial (Concluído).
- **24/10/2026 a 06/11/2026:** Implementação do fluxo principal, módulos dos 4 integrantes, testes unitários, pipeline CI e fechamento da Issue #1 (Concluído).
- **07/11/2026 a 11/11/2026:** Resolução dos aprimoramentos solicitados pelo professor (Issues #2, #3 e #4: integridade de IDs, validação numérica estrita e escopo de cobertura).
- **12/11/2026 a 20/11/2026:** Integração com SonarCloud, análise estática e validação do Quality Gate.
- **21/11/2026 a 02/12/2026:** Elaboração do relatório escrito final (modelo TCC UNISUL), preparação dos slides de apresentação e entrega final no Ulife.
- **04/12/2026:** Apresentação e socialização da A3.
