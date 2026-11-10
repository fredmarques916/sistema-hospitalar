# Sistema de Informação Hospitalar

> **Trabalho Prático - Programação Modular**  
> Pontifícia Universidade Católica de Minas Gerais (PUC Minas)  
> Bacharelado em Engenharia de Software — **Sprint 2: Implementação da API e Modelo**

Este projeto é uma solução full-stack para gestão de atendimentos, internações, leitos hospitalares e corpo clínico, desenvolvida com arquitetura em camadas no backend (**Spring Boot 4**, **Java 25**, **SQLite**) e interface moderna e responsiva no frontend (**React 19**, **Vite**).

---

## 📋 Sumário
- [Arquitetura e Tecnologias](#-arquitetura-e-tecnologias)
- [Regras de Negócio da Sprint 2](#-regras-de-negócio-da-sprint-2)
- [Endpoints da API REST](#-endpoints-da-api-rest)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar o Backend](#-como-executar-o-backend)
- [Como Executar o Frontend](#-como-executar-o-frontend)
- [Executando os Testes Automatizados](#-executando-os-testes-automatizados)
- [Diagrama de Classes](#-diagrama-de-classes)

---

## 🛠 Arquitetura e Tecnologias

### Backend (`/api`)
- **Java 25 LTS**
- **Spring Boot 4.1.2**
  - Spring Web MVC
  - Spring Data JPA
  - Jakarta Validation
  - Problem Details (RFC 9457) para tratamento semântico de erros
- **SQLite 3** (`hospital.db`) via `sqlite-jdbc` e `hibernate-community-dialects`
- **JUnit 5 / MockMvc** para testes unitários e de integração

### Frontend (`/interface`)
- **React 19**
- **Vite 8**
- **React Router 7**
- Design System hospitalar com foco em usabilidade, micro-interações táteis e feedback contextual em tempo real.

---

## 🩺 Regras de Negócio da Sprint 2

### 1. Categorias de Profissionais da Saúde
- **Médico Clínico Geral**: Realiza consultas de rotina, avaliações iniciais e pode encaminhar pacientes para atendimento especializado.
- **Médico Especialista**: Atua em área médica específica (ex: *Cardiologia, Neurologia, Ortopedia*). O sistema valida a presença da especialidade e permite filtragem por área.
- **Cirurgião**: Habilitado para procedimentos cirúrgicos, exigindo registro de atuação cirúrgica no cadastro.

### 2. Modalidades de Atendimento
- **Consulta de Rotina**: Avaliação geral com médico responsável e anotações pós-atendimento.
- **Consulta Especializada**: Requer validação estrita — **o médico alocado deve possuir especialidade compatível com a solicitada**, caso contrário a API rejeita a requisição.
- **Atendimento de Emergência**: Classificação de prioridade (*Baixa, Moderada, Alta e Crítica*) e rastreamento de status (*Aguardando Avaliação, Em Andamento e Concluído*).
- **Procedimento Cirúrgico**: Exige obrigatoriamente um profissional cirurgião habilitado, datas prevista e efetiva, observações pré e pós-operatórias.
  - **Regra de Ouro**: *Não é permitido registrar um procedimento cirúrgico como concluído se ele não tiver sido iniciado.*

### 3. Ciclo de Vida e Situação das Consultas
As consultas possuem transições de estado estritas:
`AGENDADA` ➔ `CONFIRMADA` ➔ `EM_ATENDIMENTO` ➔ `CONCLUIDA`
- Consultas também podem assumir `CANCELADA` ou `NAO_COMPARECEU`.
- **Incompatibilidades bloqueadas**:
  - Uma consulta `CONCLUIDA` nunca pode voltar para `AGENDADA`.
  - Uma consulta `CANCELADA` não pode ser marcada como `CONCLUIDA` sem um novo agendamento.

### 4. Quartos e Controle de Leitos
- Tipos de quarto: `INDIVIDUAL`, `ENFERMARIA` e `UTI`.
- Quarto individual possui capacidade máxima de 1 paciente.
- O sistema bloqueia internações se a capacidade máxima for atingida ou se o quarto estiver em `MANUTENCAO`.
- Ao registrar **alta hospitalar**, a vaga no quarto é automaticamente liberada.

---

## 🚀 Endpoints da API REST

A API roda por padrão na porta `8080` com CORS liberado para o frontend (`http://localhost:5173`).

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Autentica usuário com e-mail e senha no SQLite |
| `POST` | `/auth/cadastro` | Cadastra novo operador/médico com senha hasheada |
| `GET` | `/pacientes` | Lista todos os pacientes |
| `POST` | `/pacientes` | Cadastra novo paciente |
| `GET` | `/profissionais` | Lista profissionais (suporta `?categoria=` e `?especialidade=`) |
| `POST` | `/profissionais` | Cadastra novo profissional |
| `GET` | `/consultas` | Lista consultas (suporta `?situacao=`, `?modalidade=`, `?pacienteId=`) |
| `POST` | `/consultas` | Agenda consulta/atendimento em qualquer modalidade |
| `PATCH` | `/consultas/{id}/situacao` | Atualiza situação (`CONFIRMADA`, `EM_ATENDIMENTO`, `CONCLUIDA`, `CANCELADA`) |
| `GET` | `/quartos` | Lista quartos e status de ocupação |
| `POST` | `/quartos` | Cria novo quarto hospitalar |
| `PATCH` | `/quartos/{id}/situacao` | Altera status (ex: colocar em manutenção) |
| `GET` | `/internacoes` | Lista internações (suporta `?apenasAtivas=true`) |
| `POST` | `/internacoes` | Realiza internação e ocupa leito no quarto |
| `PATCH` | `/internacoes/{id}/alta` | Registra alta do paciente e libera leito |

---

## 📁 Estrutura do Projeto

```text
sistema-hospitalar/
├── api/                               # Backend Spring Boot
│   ├── src/main/java/com/api/
│   │   ├── config/                    # CORS e Carga Inicial de Dados (DataInitializer)
│   │   ├── controller/                # Controllers REST e GlobalExceptionHandler (RFC 9457)
│   │   ├── domain/
│   │   │   ├── exception/             # Exceções de negócio e recursos não encontrados
│   │   │   ├── model/                 # Entidades JPA (Paciente, ProfissionalSaude, Consulta, etc.)
│   │   │   ├── repository/            # Repositórios Spring Data JPA
│   │   │   └── service/               # Serviços com todas as regras de negócio
│   │   └── dto/                       # Records de Request e Response com Bean Validation
│   ├── src/test/                      # Testes unitários de regras e testes de integração
│   ├── pom.xml                        # Dependências Maven
│   └── mvnw.cmd / mvnw                # Maven Wrapper
├── docs/                              # Documentações e Diagramas
│   └── Diagrama de Classes/           # Diagrama em Draw.io (XML e PDF)
├── interface/                         # Frontend React + Vite
│   ├── src/
│   │   ├── components/                # Componentes (Sidebar, Header, Card)
│   │   ├── pages/                     # Telas (Dashboard, Consultas, Internações, etc.)
│   │   ├── services/api.js            # Integração com a API REST
│   │   └── styles/                    # Design System CSS
│   └── package.json
└── README.md
```

---

## ☕ Como Executar o Backend

1. Certifique-se de ter o **Java 25** instalado:
   ```bash
   java -version
   ```

2. Acesse a pasta `/api` e inicie a aplicação com o Maven Wrapper:
   * **No Windows (PowerShell/CMD):**
     ```powershell
     cd api
     .\mvnw.cmd spring-boot:run
     ```
   * **No Linux/macOS:**
     ```bash
     cd api
     ./mvnw spring-boot:run
     ```

3. A API será iniciada em `http://localhost:8080`.  
   *O banco SQLite `hospital.db` será criado e populado automaticamente com registros de exemplo no primeiro início.*

---

## 💻 Como Executar o Frontend

1. Certifique-se de ter o **Node.js (v18+)** instalado:
   ```bash
   node -v
   ```

2. Acesse a pasta `/interface` e instale as dependências (se necessário):
   ```bash
   cd interface
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse no navegador:
   `http://localhost:5173`

---

## 🧪 Executando os Testes Automatizados

Para rodar todos os testes unitários de regras de negócio e de integração da API:

```powershell
cd api
.\mvnw.cmd test
```

O comando executará:
- Validação de especialidade para consultas especializadas.
- Exigência de cirurgião para procedimentos cirúrgicos.
- Bloqueio de conclusão de cirurgia não iniciada.
- Bloqueio de regressão de estados em consultas concluídas/canceladas.
- Controle de capacidade máxima e liberação de leitos em internações.
- Testes de integração de todos os endpoints HTTP via `MockMvc`.

---

## 📐 Diagrama de Classes

O diagrama de classes completo da Sprint 2 pode ser visualizado e editado diretamente no [Draw.io / diagrams.net](https://app.diagrams.net/):
- Arquivo: [`docs/Diagrama de Classes/Diagrama de Classes - Sistema Hospitalar.xml`](./docs/Diagrama%20de%20Classes/Diagrama%20de%20Classes%20-%20Sistema%20Hospitalar.xml)
