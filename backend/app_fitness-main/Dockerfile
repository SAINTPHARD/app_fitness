# ============================================================================
# Dockerfile para o backend Spring Boot (Java 21 LTS)
# ============================================================================
# Esta imagem empacota a aplicação Java Spring Boot e expõe a API na porta 8080.

# Stage 1: build com Maven (Java 21 LTS)
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copia os arquivos de build
COPY pom.xml ./

# Copia o código-fonte e empacota a aplicação pulando testes para acelerar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: runtime Java (Java 21 JRE leve)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copia o jar gerado pelo build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]