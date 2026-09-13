# System Fitness

Plataforma full stack para gestão de treinos, nutrição e acompanhamento de evolução física.

O projeto utiliza uma arquitetura desacoplada, com frontend em React e API REST em Spring Boot, autenticação via JWT, persistência em PostgreSQL e deploy em serviços cloud.

## 📸 Demonstração Visual

### Dashboard Principal
Resumo diário com metas de calorias e macronutrientes, próximo treino, refeições programadas e evolução do peso em um único painel.

![Dashboard Principal do System Fitness](./docs/images/dashboard.jpg)

### Gestão Nutricional e Dieta
Registro de refeições com cálculo de macros assistido por IA, controle de hidratação e histórico nutricional detalhado.

![Tela de Gestão Nutricional e Dieta](./docs/images/dieta.jpg)

### Catálogo e Fichas de Treino
Ficha de treino organizada por dia da semana, com catálogo de exercícios filtrável por grupo muscular e nível de dificuldade.

![Tela de Catálogo e Fichas de Treino](./docs/images/treino.jpg)

### Evolução e Acompanhamento Corporal
Acompanhamento de peso, medidas corporais e fotos de progresso para visualizar a evolução física ao longo do tempo.

![Tela de Evolução e Acompanhamento Corporal](./docs/images/evolucao.jpg)

---

## Produção

- **Frontend:** https://app-fitness-murex.vercel.app
- **Backend:** https://app-fitness-mpmk.onrender.com

---

## Tecnologias

### Backend

- Java 21
- Spring Boot 4.x
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- PostgreSQL
- Migrations SQL versionadas
- Maven
- Docker

### Frontend

- React
- Vite
- TypeScript / JavaScript
- Tailwind CSS
- Axios
- Lucide Icons

### Infraestrutura

- **Vercel** — hospedagem e deploy do frontend
- **Render** — execução do backend
- **Neon** — PostgreSQL Serverless

---

## Funcionalidades

- **Autenticação:** cadastro, login e controle de acesso com JWT.
- **Nutrição:** registro de refeições, acompanhamento de calorias, macronutrientes e consumo de água.
- **Treinos:** criação e organização de fichas e exercícios.
- **Evolução:** acompanhamento de peso, medidas e metas corporais.
- **Segurança:** proteção de endpoints e configuração controlada de CORS.

---

## Estrutura do Projeto

```text
app_fitness/
├── backend/
│   └── app_fitness-main/
│       ├── src/main/java/        # API, serviços, entidades e segurança
│       ├── src/main/resources/   # Configurações e migrations SQL
│       ├── Dockerfile
│       └── pom.xml
│
├── frontend/
│   ├── src/                      # Páginas, componentes, contextos e serviços
│   ├── public/
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## Executando localmente

### Pré-requisitos

- Java 21
- Maven 3.9+
- Node.js 20+ e npm
- PostgreSQL 16+ ou Docker Compose

### Variáveis de ambiente

Crie `.env` na raiz a partir de `backend/app_fitness-main/.env.example`. As variáveis essenciais são:

```env
SPRING_PROFILES_ACTIVE=dev
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/appfitness_db
SPRING_DATASOURCE_USERNAME=appfitness_user
SPRING_DATASOURCE_PASSWORD=troque-esta-senha
JWT_SECRET=segredo-aleatorio-com-pelo-menos-64-bytes
CORS_ALLOWED_ORIGINS=http://localhost:5173
PASSWORD_RESET_FRONTEND_URL=http://localhost:5173/redefinir-senha
GEMINI_API_KEY=
```

No frontend, copie `frontend/.env.example` para `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8080
```

Nunca versione `.env`, tokens JWT, senhas ou chaves de APIs.

### Banco PostgreSQL

Para iniciar somente o banco por Docker:

```bash
docker compose up -d postgres
```

Alternativamente, crie manualmente o banco e o usuário definidos na URL JDBC. No perfil `dev`, o Hibernate atualiza o schema; em produção o schema é apenas validado, portanto as migrations existentes devem ser aplicadas antes do deploy.

### Backend

```bash
cd backend/app_fitness-main
mvn spring-boot:run
```

A API fica em `http://localhost:8080`. O endpoint público de uptime é `GET /actuator/health`. `GET /actuator/metrics` exige JWT válido e não expõe valores de configuração ou variáveis de ambiente.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O Vite usa obrigatoriamente `http://localhost:5173`, mantendo o contrato de CORS com o backend.

### Testes e validação

```bash
cd frontend
npm run lint
npm test -- --watchAll=false
npm run build

cd ../backend/app_fitness-main
mvn test
```

Os testes Spring usam o perfil `test` e banco H2 em memória; não dependem nem escrevem no PostgreSQL local.

## Arquitetura e segurança

- O frontend React consome uma API REST Spring Boot por serviços e hooks de domínio. Datas civis usam `AAAA-MM-DD`; timestamps reais usam ISO/UTC.
- Access token e refresh token possuem tipos e expirações distintos. O filtro JWT resolve o usuário pelo e-mail assinado antes de preencher o contexto de segurança.
- Endpoints protegidos nunca confiam em `usuarioId` enviado pelo cliente. O proprietário vem do principal autenticado, e consultas usam combinações como `id + usuarioId`, mitigando IDOR.
- Registros de peso fazem upsert por `usuário + data`, protegidos também por constraint única. Séries e sessões possuem controles de idempotência contra repetição e sincronização offline.
- Tokens de redefinição de senha são armazenados somente como hash, expiram e são invalidados após o uso. A solicitação não revela se o e-mail existe.
- Fotos de evolução são entregues por endpoint autenticado com cache privado; URLs públicas irrestritas não são persistidas.
- O Actuator publica apenas o health check agregado. Métricas exigem autenticação e os demais endpoints Actuator não são expostos.

## Produção

- Na Vercel, `frontend/vercel.json` mantém `index.html` revalidável e assets com hash em cache imutável por um ano.
- Imagens externas de exercícios usam carregamento e decodificação assíncronos; a política de cache do arquivo remoto pertence ao provedor de origem.
- No Render, configure o health check como `/actuator/health` e forneça todas as variáveis de produção pelo painel seguro do serviço.
## Observabilidade e privacidade

- O frontend mede LCP, CLS e INP pelas APIs nativas do navegador, sem coletar conteúdo de formulários.
- Requisições são medidas por método, rota normalizada, status e duração; query strings e identificadores são removidos.
- Falhas de login, onboarding, refeição, treino e exportação geram somente eventos operacionais agregáveis.
- O backend registra métricas Micrometer no Actuator e adiciona `X-Request-ID` às respostas para correlação.
- Tokens, e-mails, payloads nutricionais, medidas corporais e fotos não são incluídos na telemetria.
- Em hospedagens com suspensão por inatividade, o frontend informa após quatro segundos que o servidor pode estar iniciando.
