# Multi-stage Docker build for Railway deployment
FROM node:18-alpine AS frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY server/ ./
COPY --from=frontend /app/client/dist ./build
ENV PYTHONUNBUFFERED=1
RUN python manage.py collectstatic --noinput 2>/dev/null || true
EXPOSE 8000
CMD sh -c "python manage.py migrate && gunicorn server.wsgi --bind 0.0.0.0:\${PORT:-8000} --workers 3"
