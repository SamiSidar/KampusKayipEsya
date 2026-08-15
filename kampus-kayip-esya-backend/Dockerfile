# ═══════════════════════════════════════════════════
# Backend — Multi-stage Dockerfile
# Stage 1: Gradle build
# Stage 2: Minimal JRE runtime
# ═══════════════════════════════════════════════════

# --- BUILD ---
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

# Gradle wrapper ve build dosyalarını kopyala (cache layer)
COPY gradlew gradlew.bat settings.gradle build.gradle ./
COPY gradle/ gradle/

# Bağımlılıkları indir (cache'lenir, kaynak değişse bile tekrar inmez)
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

# Kaynak kodu kopyala ve build et
COPY src/ src/

RUN ./gradlew bootJar --no-daemon -x test

# --- RUNTIME ---
FROM eclipse-temurin:17-jre

WORKDIR /app

# Spring Boot fat JAR'ı kopyala
COPY --from=build /app/build/libs/*.jar app.jar

# Upload dizini
RUN mkdir -p /app/uploads

EXPOSE 8080

# JVM memory ayarları — container-aware
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
