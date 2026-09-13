# Frontend AppFitness

Este frontend é uma aplicação React criada com Vite e consome o backend Spring Boot.

## Requisitos

- Node.js 18+ ou compatível
- Backend rodando em `http://localhost:8080`

## Instalação

1. Abra o terminal em `frontend/`
2. Execute:

```bash
npm install
```

## Execução local

1. Inicie o backend Spring Boot no diretório raiz do projeto:

```bash
cd ..
./mvnw spring-boot:run
```

2. Inicie o frontend:

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

3. Acesse a aplicação em:

```text
http://127.0.0.1:5173/
```

## Fluxo de uso

- A tela inicial é a tela de boas-vindas
- Use os botões para `Entrar` ou `Cadastrar`
- O link `Dashboard` só aparece após login
- Após login ou cadastro, o app redireciona para o `Dashboard`

## Observações

- O frontend usa proxy `/api` para encaminhar requisições para `http://localhost:8080`
- O `usuarioId` é salvo em `localStorage` e usado dinamicamente nas chamadas da API
