FROM node:20-slim AS frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY server/ ./
COPY --from=frontend /app/client/dist ./staticfiles/dist

EXPOSE 8000
CMD ["gunicorn", "server.wsgi:application", "--bind", "0.0.0.0:8000"]