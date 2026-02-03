FROM eclipse-temurin:21-jdk-jammy AS builder

ARG SPRING_PROFILES_ACTIVE=docker

WORKDIR /app

# Copier Maven wrapper et pom.xml d'abord pour tirer parti du cache Docker
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Télécharger les dépendances sans builder l'app
RUN ./mvnw dependency:go-offline -B

# Copier le reste du code
COPY . .

# Build de l'application
RUN ./mvnw clean package -DskipTests

# -------------------- Image finale --------------------
FROM eclipse-temurin:21-jre-jammy

ENV SPRING_PROFILES_ACTIVE=docker

WORKDIR /app

COPY --from=builder /app/target/valentine-0.0.1-SNAPSHOT.jar app-server.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app-server.jar"]
