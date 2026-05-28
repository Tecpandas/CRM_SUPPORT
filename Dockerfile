# Build the frontend first

FROM node:20-alpine AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend .

RUN npm run build

# Backend image

FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app

COPY backend/uploads ./uploads

COPY --from=frontend /app/frontend/dist ./frontend_dist

EXPOSE 5000

ENV DATABASE_URL="sqlite:///./support_crm.db"
ENV FLASK_ENV=production
ENV SECRET_KEY=anyrandomtext123

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-5000}"]
