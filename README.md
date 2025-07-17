# 🚗 Lina Car - Sistema para Lava Jato

Sistema completo para gestão de ordens de serviço, pagamentos, funcionários, clientes e relatórios, com integração especial para Localiza.

---

## Funcionalidades Principais

- **Dashboard Dinâmico:** KPIs do dia (ordens em andamento, faturamento, finalizadas, pagamentos Localiza) e painel Kanban para controle operacional.
- **Gestão de Ordens de Serviço:** Criação, movimentação por status (Aguardando, Lavagem, Pronto), finalização e deleção.
- **Pagamentos:** Registro de pagamentos por diversos métodos (PIX, dinheiro, cartão, Localiza), controle de recebimentos e relatórios detalhados.
- **Funcionários:** Cadastro, edição, exclusão e ranking de produtividade.
- **Clientes e Veículos:** Cadastro automático de clientes e veículos, busca por placa.
- **Relatórios:** Filtros avançados, exportação CSV, estatísticas por método, funcionário e período.
- **Configuração Localiza:** Serviços e porcentagens específicas para ordens da Localiza, com fluxo de pagamento diferenciado.

---

## Modelo de Dados (Prisma)

- **Customer:** Cliente, com nome, telefone e veículos.
- **Vehicle:** Veículo, com placa, marca, modelo, cor e vínculo ao cliente.
- **Service:** Serviço oferecido (ex: lavagem, polimento), com nome, preço e tipo.
- **Employee:** Funcionário, com nome e porcentagem de ganho.
- **WorkOrder:** Ordem de serviço, com status, valor, data, vínculo a veículo, funcionário, serviços e pagamentos.
- **Payment:** Pagamento de uma ordem, com método (pix, cash, debit, credit, localiza), valor, data e vínculo à ordem.
- **ServicesOnWorkOrders:** Tabela de ligação entre ordens e serviços.
- **LocalizaConfig/LocalizaService:** Configurações e serviços específicos para Localiza.

---

## Estrutura do Projeto

```
lina_car/
  backend/
    src/
      controllers/   # Lógica de negócio e rotas da API
      routes/        # Rotas Express
      prisma/        # Modelos e migrações Prisma
    package.json
  frontend/
    src/
      pages/         # Páginas principais (Dashboard, Relatórios, Funcionários, etc)
      components/    # Componentes reutilizáveis (Kanban, Pagamento, OCR, etc)
      services/      # Integração com API
      styles/        # CSS global e de páginas
    package.json
```

---

## Como rodar o projeto

### 1. Instale as dependências

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure o banco de dados

O projeto usa SQLite por padrão. Para iniciar o banco e aplicar o schema:

```bash
cd backend
npx prisma migrate dev
```

### 3. Rode o backend

```bash
cd backend
npm start
```

### 4. Rode o frontend

```bash
cd frontend
npm start
```

Acesse em [http://localhost:3000](http://localhost:3000)

---

## Principais Telas

- **Dashboard:** Visão geral do dia e painel Kanban de ordens.
- **Relatórios:** Filtros, exportação e estatísticas de pagamentos.
- **Funcionários:** Cadastro, edição e ranking.
- **Nova Ordem:** Cadastro rápido de ordens, clientes e veículos.
- **Configurações Localiza:** Serviços e regras específicas para Localiza.

---

## API (Principais Endpoints)

- `GET /api/orders/dashboard` — Ordens em andamento
- `GET /api/orders?finalizadasHoje=1` — Ordens finalizadas hoje
- `GET /api/payments?hoje=1` — Pagamentos do dia
- `POST /api/orders` — Criar nova ordem
- `PATCH /api/orders/:id/status` — Atualizar status/finalizar ordem
- `DELETE /api/orders/:id` — Deletar ordem
- `GET /api/employees` — Listar funcionários
- `GET /api/services` — Listar serviços

---

## Observações

- O sistema diferencia ordens da Localiza, com fluxo de pagamento próprio.
- O dashboard e relatórios são dinâmicos e refletem os dados do dia.
- O Kanban é o centro operacional, mas pode ser customizado conforme a necessidade.

---

## Contribuição

Sinta-se à vontade para sugerir melhorias, abrir issues ou enviar PRs! 