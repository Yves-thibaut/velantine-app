FROM eclipse-temurin:21-jdk-jammy AS builder

ARG APP_NAME
ARG SPRING_PROFILES_ACTIVE=docker

WORKDIR /app

# Copier Maven wrapper et pom.xml d'abord pour tirer parti du cache Docker
COPY ${APP_NAME}/mvnw .
COPY ${APP_NAME}/.mvn .mvn
COPY ${APP_NAME}/pom.xml .

# Télécharger les dépendances sans builder l'app
RUN ./mvnw dependency:go-offline -B

# Copier le reste du code
COPY ${APP_NAME}/ .

# Build de l'application
RUN ./mvnw clean package -DskipTests

# Debug: Lister les fichiers générés
RUN ls -la target/

# -------------------- Image finale --------------------
FROM eclipse-temurin:21-jre-jammy

ARG APP_NAME
ENV SPRING_PROFILES_ACTIVE=docker

WORKDIR /app

COPY --from=builder /app/target/valentine-0.0.1-SNAPSHOT.jar app-server.jar

# Debug: Vérifier que le fichier existe
RUN ls -la /app/

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app-server.jar"]
