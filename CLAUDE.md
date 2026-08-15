# System Fitness - Development Rules

## Stack
- Java
- Spring Boot
- Spring Data JPA
- REST API
- PostgreSQL

## Architecture
Controller -> Service -> Repository

Controllers must not contain business rules.

## Java
- Follow SOLID principles.
- Prefer constructor injection.
- Use DTOs for API input/output.
- Do not expose JPA entities directly.
- Validate request data.
- Use meaningful method and variable names.

## Git
Use Conventional Commits:

feat:
fix:
refactor:
test:
docs:
chore:

Never push automatically.
Never commit files unrelated to the requested task.

## Quality
Before committing:
1. Compile the project.
2. Run tests.
3. Review git diff.
4. Check for secrets.
5. Only then create the commit.