# ============================================================================
# Dockerfile para o backend Spring Boot (Atualizado para Java 25)
# ============================================================================
# Esta imagem empacota a aplicação Java Spring Boot e expõe a API na porta 8080.

# Stage 1: build com Maven (Java 25 LTS estável)
FROM maven:3.9.6-eclipse-temurin-25-alpine AS build
WORKDIR /app

# Copia os arquivos de build
COPY pom.xml ./

# Copia o código-fonte e empacota a aplicação pulando testes para acelerar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: runtime Java (Java 25 JRE leve)
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Copia o jar gerado pelo build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]