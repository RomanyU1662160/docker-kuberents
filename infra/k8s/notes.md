# Kubernetes Architecture Overview

## Cluster Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                CONTROL PLANE (Master)                   │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │    │
│  │  │ API Server  │ │ Scheduler   │ │ Controller  │        │    │
│  │  │             │ │             │ │ Manager     │        │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘        │    │
│  │                        │                                │    │
│  │                   ┌─────────────┐                       │    │
│  │                   └─────────────┘                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                │                                │
│                                │ (manages)                      │
│                                ▼                                │
│  ┌─────────────────┐                    ┌─────────────────┐   │
│  │   WORKER NODE 1 │                    │   WORKER NODE 2 │     │
│  │                 │                    │                 │     │
│  │ ┌─────────────┐ │                    │ ┌─────────────┐ │     │
│  │ │   kubelet   │ │                    │ │   kubelet   │ │     │
│  │ └─────────────┘ │                    │ └─────────────┘ │     │
│  │ ┌─────────────┐ │                    │ ┌─────────────┐ │     │
│  │ │ kube-proxy  │ │                    │ │ kube-proxy  │ │     │
│  │ └─────────────┘ │                    │ └─────────────┘ │     │
│  │ ┌─────────────┐ │                    │ ┌─────────────┐ │     │
│  │ │ Container   │ │                    │ │ Container   │ │     │
│  │ │ Runtime     │ │                    │ │ Runtime     │ │     │
│  │ └─────────────┘ │                    │ └─────────────┘ │     │
│  │                 │                    │                 │     │
│  │ ┌─────────────┐ │                    │ ┌─────────────┐ │     │
│  │ │    POD A    │ │                    │ │    POD C    │ │     │
│  │ │ ┌─────────┐ │ │                    │ │ ┌─────────┐ │ │     │
│  │ │ │Container│ │ │                    │ │ │Container│ │ │     │
│  │ │ │    1    │ │ │                    │ │ │    1    │ │ │     │
│  │ │ └─────────┘ │ │                    │ │ └─────────┘ │ │     │
│  │ └─────────────┘ │                    │ └─────────────┘ │     │
│  │                 │                    │                 │     │
│  │ ┌─────────────┐ │                    │ ┌─────────────┐ │     │
│  │ │    POD B    │ │                    │ │    POD D    │ │     │
│  │ │ ┌─────────┐ │ │                    │ │ ┌─────────┐ │ │     │
│  │ │ │Container│ │ │                    │ │ │Container│ │ │     │
│  │ │ │    1    │ │ │                    │ │ │    1    │ │ │     │
│  │ │ ├─────────┤ │ │                    │ │ ├─────────┤ │ │     │
│  │ │ │Container│ │ │                    │ │ │Container│ │ │     │
│  │ │ │    2    │ │ │                    │ │ │    2    │ │ │     │
│  │ │ └─────────┘ │ │                    │ │ └─────────┘ │ │     │
│  │ └─────────────┘ │                    │ └─────────────┘ │     │
│  └─────────────────┘                    └─────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## Cluster Components

A **Kubernetes Cluster** consists of:

### Control Plane (Master Node)
- **API Server**: Entry point for all REST commands
- **Controller Manager**: Manages cluster state
- **Scheduler**: Assigns pods to nodes
- **etcd**: Distributed key-value store for cluster data

### Worker Nodes
Each worker node contains:
- **kubelet**: Agent that ensures containers are running as expected
- **container runtime**: Software that runs containers (Docker, containerd, CRI-O)
- **kube-proxy**: Network proxy that maintains network rules
- **Pods**: One or more containers that share storage and network

## Core Concepts

### Pod
A **Pod** is the smallest deployable unit in Kubernetes:
- Contains one or more tightly coupled containers
- Shares storage volumes and network (IP address)
- Containers in a pod can communicate via localhost
- Pods are ephemeral and can be created/destroyed dynamically

### Service
A **Service** provides stable network access to a set of pods:
- Acts as a load balancer for pods
- Provides service discovery within the cluster
- Maintains consistent endpoint even as pods are created/destroyed
- Uses selectors to identify target pods

## Service Types

### 1. ClusterIP (Default)
- **Purpose**: Internal cluster communication only
- **Access**: Only accessible within the cluster
- **Use case**: Backend services, databases
- **URL**: `http://<service-name>:<port>`
**Example ClusterIP Service:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  type: ClusterIP # Default type
  selector:
    app: my-app  # Must match pod labels
  ports:
    - port: 80          # Service port (cluster internal)
      targetPort: 8080  # Container port, must match service port
```

### 2. NodePort
- **Purpose**: External access through node IP addresses
- **Access**: `<NodeIP>:<NodePort>` from outside the cluster
- **Port range**: 30000-32767 (by default)
- **Use case**: Development, testing, or when LoadBalancer isn't available
- **URL**: `http://<NodeIP>:<NodePort>`

**Example NodePort Service:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  type: NodePort
  selector:
    app: my-app  # Must match pod labels
  ports:
    - port: 80          # Service port (cluster internal)
      nodePort: 30007   # External port on each node
      targetPort: 8080  # Container port, must match service port
```

### 3. LoadBalancer
- **Purpose**: External access via cloud provider's load balancer
- **Access**: Through external IP provided by cloud provider
- **Use case**: Production applications requiring high availability
- **Note**: Requires cloud provider support (AWS, GCP, Azure)
- **URL**: `http://<LoadBalancerIP>:<port>`

**Example LoadBalancer Service:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  type: LoadBalancer
  selector:
    app: my-app  # Must match pod labels
  ports:
    - port: 80          # Service port (cluster internal)
      targetPort: 8080  # Container port, must match service port

```

### 4. ExternalName
- **Purpose**: Map service to external DNS name
- **Access**: Returns CNAME record pointing to external service
- **Use case**: Accessing external databases or APIs from within cluster

**Example:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: database.example.com
```

### Example Usage
In a microservices architecture, you might have multiple services communicating with each other. For example, `service-1` needs to call `service-2`. Using Kubernetes Services, `service-1` can access `service-2` via its service name and port.


### What is Ingress service in Kubernetes?
An **Ingress** is a Kubernetes resource that manages external access to services within a cluster, typically HTTP. It provides a way to configure the routing of external HTTP/S traffic to internal services based on hostnames or paths.

#### Key Features of Ingress:
- **Path-based Routing**: Route traffic to different services based on the request URL path.
- **Host-based Routing**: Route traffic based on the requested hostname.
- **TLS Termination**: Handle SSL/TLS termination for secure connections.
- **Load Balancing**: Distribute incoming traffic across multiple backend services.

#### Example Ingress Resource:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
spec:
  rules:
  - host: my-app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app-service
            port:
              number: 80
```

In this example, the Ingress resource routes traffic from `my-app.example.com` to the `my-app-service` service on port 80.