• **ClusterIP**: For apps talking to each other inside Kubernetes

• **NodePort**: For testing from outside (like your browser)

• **Ingress**: For production access with nice URLs

## Think of Kubernetes Like a Restaurant

### 1. Deployment = Kitchen Staff
```
yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-1-depl
spec:
  replicas: 2  # "I want 2 chefs working"
```
• **What it does**: Tells Kubernetes "I want 2 copies of my app running"

• **Why**: If one crashes, the other keeps working

• **In Practice**: We have 2 copies each of frontend, service-1, and service-2

### 2. Service = Waiter
```
yaml
apiVersion: v1
kind: Service
metadata:
  name: service-1-svc
spec:
  type: ClusterIP
  ports:
    - port: 3000
```
• **What it does**: Acts like a waiter who knows which chef (pod) to send orders to

• **Why**: Even if chefs change, the waiter always knows how to reach them

• **In Practice**: service-1-svc routes requests to any of your 2 service-1 pods

### 3. Ingress = Restaurant Door
yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  rules:
    - host: service-1.example.com
      http:
        paths:
          - path: /
            backend:
              service:
                name: service-1-svc

• **What it does**: Like a hostess at the restaurant door who directs customers
• **Why**: Customers from outside can find the right service
• **In Practice**: When someone visits service-1.example.com, they get directed to service-1-svc

## Kubernetes Complete Setup:

OUTSIDE WORLD
     ↓
[Ingress] ← "I want service-1.example.com"
     ↓
[Service-1-svc] ← "Find me a service-1 pod"
     ↓
[Pod 1 or Pod 2] ← "Here's your response"

## Kubernetes Project Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OUTSIDE WORLD (Browser)                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
        │service-1.       │ │service-2.       │ │fe-client.       │
        │example.com      │ │example.com      │ │example.com      │
        └─────────────────┘ └─────────────────┘ └─────────────────┘
                    │               │               │
┌───────────────────────────────────────────────────────────────────────────────┐
│                          KUBERNETES CLUSTER                                   │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐     │
│   │                        INGRESS LAYER                                │     │
│   │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │     │
│   │  │ingress-service-1│ │ingress-service-2│ │ingress-fe-client│        │     │
│   │  │(Restaurant Door)│ │(Restaurant Door)│ │(Restaurant Door)│        │     │
│   │  └─────────────────┘ └─────────────────┘ └─────────────────┘        │     │
│   └─────────────────────────────────────────────────────────────────────┘     │
│                    │               │               │                          │
│                    ▼               ▼               ▼                          │
│   ┌─────────────────────────────────────────────────────────────────────┐     │
│   │                       SERVICE LAYER                                 │     │
│   │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │     │
│   │  │  service-1-svc  │ │  service-2-svc  │ │ fe-client-svc   │        │     │
│   │  │   (Waiter)      │ │   (Waiter)      │ │   (Waiter)      │        │     │
│   │  │   Port: 3000    │ │   Port: 5001    │ │   Port: 80      │        │     │
│   │  └─────────────────┘ └─────────────────┘ └─────────────────┘        │     │
│   └─────────────────────────────────────────────────────────────────────┘     │
│                    │               │               │                          │
│                    ▼               ▼               ▼                          │
│   ┌─────────────────────────────────────────────────────────────────────┐     │
│   │                        POD LAYER                                    │     │
│   │                                                                     │     │
│   │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │     │
│   │  │   SERVICE-1     │ │   SERVICE-2     │ │   FE-CLIENT     │        │     │
│   │  │   (Kitchen)     │ │   (Kitchen)     │ │   (Kitchen)     │        │     │
│   │  │                 │ │                 │ │                 │        │     │
│   │  │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │        │     │
│   │  │ │    POD 1    │ │ │ │    POD 1    │ │ │ │    POD 1    │ │        │     │
│   │  │ │Node.js:3000 │ │ │ │Node.js:5001 │ │ │ │ Nginx:80    │ │        │     │
│   │  │ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │        │     │
│   │  │                 │ │                 │ │                 │        │     │
│   │  │ ┌─────────────┐ │ │ ┌─────────────┐ │ │ ┌─────────────┐ │        │     │
│   │  │ │    POD 2    │ │ │ │    POD 2    │ │ │ │    POD 2    │ │        │     │
│   │  │ │Node.js:3000 │ │ │ │Node.js:5001 │ │ │ │ Nginx:80    │ │        │     │
│   │  │ └─────────────┘ │ │ └─────────────┘ │ │ └─────────────┘ │        │     │
│   │  └─────────────────┘ └─────────────────┘ └─────────────────┘        │     │
│   └─────────────────────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │         INTERNAL COMMUNICATION      │
                    │                                     │
                    │  FE-Client calls Service-1:        │
                    │  http://service-1.example.com       │
                    │                                     │
                    │  Service-1 calls Service-2:        │
                    │  http://service-2.example.com       │
                    └─────────────────────────────────────┘
```

## Traffic Flow Example:

### 1. User visits `fe-client.example.com`:
```
Browser → Ingress (fe-client) → fe-client-svc → fe-client Pod (nginx:80)
```

### 2. Frontend calls Service-1:
```
fe-client Pod → service-1-svc → service-1 Pod (node.js:3000)
```

### 3. Service-1 calls Service-2:
```
service-1 Pod → service-2-svc → service-2 Pod (node.js:5001)
```

## Key Points:
- **Ingress**: Routes external traffic based on domain names
- **Services**: Load balance between multiple pods of the same app
- **Pods**: The actual applications running in containers
- **Internal Communication**: Apps talk to each other using service names
