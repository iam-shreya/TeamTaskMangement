FROM python:3.11-slim

WORKDIR /app

# Install Node.js 20
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Install Python dependencies
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Build React frontend
COPY client/ ./client/
WORKDIR /app/client
RUN npm install && npm run build

# Setup Django
WORKDIR /app
COPY server/ ./server/
RUN mkdir -p server/build && \
    cp -r client/dist/* server/build/

WORKDIR /app/server
EXPOSE 8000
CMD ["gunicorn", "server.wsgi:application", "--bind", "0.0.0.0:8000"]