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

# Collect static files at build time
RUN python manage.py collectstatic --noinput 2>/dev/null || true

# Railway sets PORT dynamically; default to 8000 for local dev
ENV PORT=8000
EXPOSE $PORT
CMD sh -c "python manage.py migrate --noinput && python manage.py seed_data && gunicorn server.wsgi:application --bind 0.0.0.0:\$PORT"