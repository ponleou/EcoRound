FROM openjdk:21-jdk-slim
WORKDIR /app
COPY otp-2.6.0-shaded.jar .
COPY graph.obj .
COPY streetGraph.obj .
COPY otp-config.json .
CMD ["java", "-Xmx2G", "-jar", "otp-2.6.0-shaded.jar", "--bindAddress", "0.0.0.0", "--port", "8080", "--load", "."]
