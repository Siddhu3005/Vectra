# VECTRA Deployment Guide

This document provides step-by-step instructions for checking, building, and deploying the **VECTRA Intelligent Drone Fleet Management System** (Backend: Spring Boot 3, Frontend: React + Vite, Database: MySQL).

---

## 1. Pre-Deployment Verification Summary

The project codebase has been audited and fixed for production readiness:

- **Compilation & Build**:
  - Backend compiles cleanly (`mvnw clean test-compile` -> `BUILD SUCCESS`)
  - Frontend builds clean bundle without warnings (`npm run build` -> `dist/` ready)
- **Role Permissions & Security**:
  - Fixed `AssignmentController` `@PreAuthorize` restrictions so `WAREHOUSE_MANAGER` and `OPERATOR` roles can access assignment endpoints.
  - Allowed `ADMIN` role to start and complete assigned missions without requiring an Operator profile lookup.
  - Allowed all authenticated roles (`OPERATOR`, `WAREHOUSE_MANAGER`, `ADMIN`, `MAINTENANCE_ENGINEER`) to inspect Drone History telemetries.
- **Session & Interceptor Handling**:
  - Fixed `api.js` response interceptor: 403 (Forbidden) permission errors no longer force auto-logout / session clearing. Only 401 (Unauthorized) clears tokens.
- **Environment & CORS**:
  - `application.properties` updated to consume environment variables (`PORT`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`).
  - `SecurityConfig` updated to allow configurable origin patterns for cloud deployments (Vercel, Render, Railway, AWS, custom domains).

---

## 2. Deployment Options

### Option A: Local / Server Container Deployment (Docker Compose) - **Recommended**

The root directory contains `docker-compose.yml`, `backend/Dockerfile`, and `frontend/Dockerfile`.

1. **Prerequisites**: Ensure [Docker Desktop](https://www.docker.com/) is installed and running.
2. **Start all services**:
   ```bash
   docker-compose up -d --build
   ```
3. **Verify running containers**:
   ```bash
   docker-compose ps
   ```
4. **Access Applications**:
   - Frontend Web App: `http://localhost:5173` (or `http://localhost`)
   - Backend API: `http://localhost:8080/api`
   - MySQL DB: `localhost:3306`

5. **Stop services**:
   ```bash
   docker-compose down
   ```

---

### Option B: Cloud Deployment (Render / Railway / AWS / DigitalOcean)

#### 1. Backend (Spring Boot API)
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/vectra-0.0.1-SNAPSHOT.jar`
- **Required Environment Variables**:
  - `PORT`: `8080` (or host provided port)
  - `DB_URL`: `jdbc:mysql://<your-db-host>:3306/vectra_db?useSSL=false`
  - `DB_USERNAME`: `<your-db-user>`
  - `DB_PASSWORD`: `<your-db-password>`
  - `JWT_SECRET`: `<secure-random-32-byte-secret-key>`
  - `CORS_ALLOWED_ORIGINS`: `https://<your-frontend-domain.com>`

#### 2. Frontend (React + Vite)
- **Platform**: Vercel / Netlify / Render Static Site
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://<your-backend-domain.com>/api`

---

## 3. Seed / Default Credentials

When setting up a fresh database, user accounts can be registered via the `/api/auth/register` endpoint or using the frontend Registration screen with the following roles:

- `ADMIN` (Administrator - Full access)
- `OPERATOR` (Drone Pilot - Executes assigned missions)
- `WAREHOUSE_MANAGER` (Logistics Manager - Dispatch & Mission Planning)
- `MAINTENANCE_ENGINEER` (Fleet Maintenance - Work Orders & Repair Logs)
