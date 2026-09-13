# API REST — System Fitness

A documentação da API é gerada automaticamente com OpenAPI 3 e disponibilizada por Swagger UI.

## Endpoints de documentação

Com o backend executando localmente em `http://localhost:8080`:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- OpenAPI YAML: `http://localhost:8080/v3/api-docs.yaml`

## Autenticação

A maior parte da API exige access token JWT.

No Swagger UI:

1. Faça login em `POST /auth/login`.
2. Copie o access token retornado.
3. Clique em **Authorize**.
4. Informe somente o token; o Swagger adiciona o prefixo `Bearer` automaticamente.
5. Execute os endpoints protegidos normalmente.

Os endpoints públicos são identificados sem exigência de JWT na especificação OpenAPI.

## Áreas da API

A documentação é gerada a partir dos controllers Spring MVC e inclui os recursos de:

- autenticação e recuperação de senha;
- usuários e perfil;
- dietas, refeições e alimentos;
- hidratação;
- treinos, exercícios, sessões e séries;
- evolução corporal;
- relatórios;
- catálogo de exercícios.

## Convenções

- Formato principal: JSON.
- Autenticação: `Authorization: Bearer <access-token>`.
- Datas civis: `YYYY-MM-DD`.
- Erros utilizam os status HTTP definidos pelos controllers e handlers da aplicação.
- A documentação OpenAPI descreve o contrato HTTP; regras de negócio permanecem nas camadas de serviço.

## Configuração

A integração utiliza `springdoc-openapi-starter-webmvc-ui` compatível com Spring Boot 4. Os endpoints de documentação são liberados explicitamente no Spring Security, enquanto as rotas de negócio continuam protegidas por JWT conforme a política da aplicação.
