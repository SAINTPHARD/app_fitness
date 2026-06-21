# App Fitness API - Sistema de Gerenciamento de Saúde e Alta Performance

API RESTful desenvolvida como projeto para a pós-graduação em Desenvolvimento Full Stack na PUC-Rio. O sistema permite o monitoramento completo de atletas, gerenciando dados antropométricos, planos dietéticos estruturados, rotinas de treinos e divisão de exercícios com persistência relacional robusta.

## 🚀 Tecnologias Utilizadas

* **Java 25** (Ambiente de execução moderno)
* **Spring Boot 3.x** (Core da aplicação)
* **Spring Data JPA / Hibernate** (Abstração e persistência de dados)
* **PostgreSQL** (Banco de dados relacional de produção)
* **Validation (Jakarta)** (Garantia de consistência das regras de negócio)
* **Jackson** (Serialização e desserialização otimizada de JSON)

---

## 🏗️ Arquitetura do Sistema

O projeto adota o padrão de arquitetura em camadas para garantir a separação de responsabilidades, manutenibilidade e testabilidade:



* **Model (Entities):** Classes que mapeiam as tabelas do PostgreSQL e contêm as anotações do JPA.
* **Repository:** Interfaces que estendem `JpaRepository`, fornecendo operações CRUD automáticas.
* **Service:** Camada com as regras de negócio, injeção de dependências via construtor e tratamento de exceções.
* **Controller:** Endpoints REST que expõem as rotas HTTP e consomem os formatos JSON.

---

## 🗄️ Modelo Relacional (Banco de Dados)

O banco de dados foi estruturado com base em relações lógicas fortes:
* **Usuário ➡️ Dieta:** Relação de um para muitos (`@OneToMany` / `@ManyToOne`).
* **Usuário ➡️ Treino:** Relação de um para muitos (`@OneToMany` / `@ManyToOne`).
* **Treino ➡️ Exercício:** Relação de um para muitos (`@OneToMany` / `@ManyToOne`).

---

## 🛣️ Rotas da API (Endpoints)

### 👤 Módulo de Usuários
* `POST /usuarios` - Cadastra um novo atleta.
* `GET /usuarios` - Lista todos os atletas cadastrados.
* `GET /usuarios/{id}` - Busca os detalhes de um atleta específico.
* `PUT /usuarios/{id}` - Atualiza dados antropométricos (peso, altura, objetivo).
* `DELETE /usuarios/{id}` - Remove um atleta do sistema.

### 🥦 Módulo de Dietas
* `POST /dietas` - Cria um plano alimentar associado a um atleta.
* `GET /dietas` - Lista todos os planos cadastrados.
* `GET /dietas/{id}` - Busca uma dieta específica.

### 🏋️‍♂️ Módulo de Treinos
* `POST /treinos` - Vincula uma rotina de treinos a um ID de usuário válido.
* `GET /treinos` - Lista as rotinas com carregamento eagerly populado.
* `GET /treinos/{id}` - Busca uma rotina específica por ID.
* `PUT /treinos/{id}` - Modifica campos de duração, frequência ou intensidade.
* `DELETE /treinos/{id}` - Remove a rotina do banco de dados.

### 👟 Módulo de Exercícios
* `POST /api/exercicios` - Adiciona um exercício vinculado a um treino específico.
* `GET /api/exercicios` - Exibe todos os exercícios da base.

---

## 🧪 Exemplo de Payload (POST /treinos)

```json
{
  "nomeTreino": "Treino A - Peito e Tríceps",
  "tipoTreino": "Musculação",
  "duracao": 60,
  "intensidade": "Alta",
  "frequencia": "ABC",
  "usuario": {
    "id": 1
  }
}