# Troubleshooting Guide

This document contains common issues we encountered while setting up this Kubernetes project and their solutions.

## 1. Vite Environment Variables Not Working in Production

### Problem
Environment variables set in Kubernetes deployment were not being used by the frontend. The app was still using `http://localhost:3000` instead of `http://service-1.example.com`.

### Root Cause
Vite environment variables work at **build time**, not **runtime**. When you run `npm run build`, Vite compiles the environment variables directly into the JavaScript files. Setting environment variables in Kubernetes deployment happens at runtime, which is too late.

### Solution
Set environment variables in the production Dockerfile **before** the build step:

```dockerfile
# Dockerfile.prod
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# IMPORTANT: Set Vite env vars BEFORE build
ENV VITE_SERVICE_1_URL_DEV=http://service-1.example.com
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Key Lesson
- **Vite apps**: Environment variables at build time (Dockerfile)
- **Node.js apps**: Environment variables at runtime (Kubernetes deployment)

---

## 2. WebSocket Connection Errors in Production

### Problem
Browser console showed WebSocket errors when accessing the frontend:
```
WebSocket connection to 'ws://fe-client.example.com/?token=...' failed
[vite] failed to connect to websocket
```

### Root Cause
The frontend was running Vite dev server (port 5173) in production, which includes WebSocket connections for hot module replacement. These development features don't work in a production Kubernetes environment.

### Solution
Create a production build that serves static files through nginx instead of running the dev server:

**Before (Development Dockerfile):**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]  # ❌ Dev server in production
```

**After (Production Dockerfile):**
```dockerfile
# Build static files
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # ✅ Build static files

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80  # ✅ Standard HTTP port
CMD ["nginx", "-g", "daemon off;"]
```

### Key Lesson
Never run development servers in production. Always build static files and serve them with a production web server.

---

## 3. Ingress Cannot Find Services

### Problem
Ingress was configured but couldn't route traffic to services. Getting 503 Service Unavailable errors.

### Root Cause
Ingress was referencing service names that didn't exist. We had `service-1-nodeport-svc` but Ingress was looking for `service-1-svc`.

### Solution
Create **both** ClusterIP and NodePort services:

```yaml
# ClusterIP for internal communication (used by Ingress)
apiVersion: v1
kind: Service
metadata:
  name: service-1-svc  # ✅ Matches Ingress reference
spec:
  type: ClusterIP
  selector:
    app: service-1
  ports:
    - port: 3000
      targetPort: 3000

---
# NodePort for external testing (optional)
apiVersion: v1
kind: Service
metadata:
  name: service-1-nodeport-svc
spec:
  type: NodePort
  selector:
    app: service-1
  ports:
    - port: 3000
      targetPort: 3000
```

### Key Lesson
- **ClusterIP**: For internal communication (Ingress, service-to-service)
- **NodePort**: For external testing and development
- **Ingress**: Always references ClusterIP services, not NodePort

---

## 4. Docker Image Tag Issues

### Problem
Kubernetes pods were failing to pull images with error messages about invalid image references.

### Root Cause
Used `@latest` instead of `:latest` in image tags, and inconsistent naming between Docker Hub repositories.

### Solution
Use consistent naming and proper tag format:

```yaml
# ❌ Wrong
image: romany/fe-client:@latest

# ✅ Correct
image: romanysefen/k8-learn-fe-client:latest
```

### Key Lesson
- Use `:` for tags, not `@`
- Use consistent naming conventions across all services
- Consider prefixing with project name for organization

---

## General Best Practices Learned

1. **Environment Variables**:
   - Frontend (Vite): Set at build time in Dockerfile
   - Backend (Node.js): Set at runtime in Kubernetes deployment

2. **Production vs Development**:
   - Always create separate Dockerfiles for production
   - Use nginx or similar for serving static frontend files
   - Never run dev servers in production

3. **Kubernetes Services**:
   - ClusterIP for internal communication
   - NodePort for external testing
   - Ingress always uses ClusterIP services

4. **Docker Images**:
   - Use proper tag format (`:latest`, not `@latest`)
   - Use consistent naming conventions
   - Organize repositories by project

5. **Debugging**:
   - Check browser console for frontend issues
   - Use `kubectl logs` for backend issues
   - Verify service names match between Ingress and Service definitions
