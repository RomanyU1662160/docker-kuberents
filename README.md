# Kubernetes Architecture Overview

## How to Run This Application

### Development Mode (Docker Compose)
For local development with hot reload and debugging:

```bash
# Run all services locally
docker-compose up -d

# This will:
# - Build local Docker images for all 3 services
# - Start fe-client on http://localhost:5173
# - Start service-1 on http://localhost:3000  
# - Start service-2 on http://localhost:5001
```

### Production Mode (Kubernetes)
For production deployment with load balancing and scaling:

```bash
# Navigate to Kubernetes configuration directory
cd _infra_/k8s

# Deploy all services to Kubernetes cluster
kubectl apply -f .

# This will:
# - Deploy production images from Docker Hub
# - Create 2 replicas of each service for high availability
# - Set up ingress routing with custom domains
# - Use nginx for serving static frontend files
```

**Access URLs in Production:**
- Frontend: `http://fe-client.example.com`
- Service-1: `http://service-1.example.com`
- Service-2: `http://service-2.example.com`

---

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
│  │                   │   ETCD      │                       │    │
│  │                   └─────────────┘                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                             │                                   │
│                             │ (manages worker nodes)            │
│                             ▼                                   │
│  ┌─────────────────┐                    ┌─────────────────┐     │
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


### What is ETCD in Kubernetes?
**etcd** is a distributed, reliable key-value store that is used as the backing store for all cluster data in Kubernetes. It is a critical component of the Kubernetes control plane, responsible for storing configuration data, state information, and metadata about the cluster. it ensures that the data is consistent and available across the cluster, even in the event of node failures.

### Role of etcd in Kubernetes:
- **Configuration Storage**: Stores all configuration data for the cluster, including information about nodes, pods, services, and other resources.
- **State Management**: Maintains the desired state of the cluster, allowing the control plane to make decisions based on the current state.
- **Leader Election**: Facilitates leader election among control plane components to ensure high availability.
- **Watch Mechanism**: Allows components to watch for changes in the data and react accordingly.
### Key Features of etcd:
- **Strong Consistency**: Ensures that all reads and writes are consistent across the cluster
- **High Availability**: Supports clustering and replication to ensure data availability
- **Simplicity**: Provides a simple key-value store interface for storing and retrieving data
- **Performance**: Designed for high performance and low latency operations


### What is Ingress Controller in Kubernetes?

An **Ingress Controller** is a specialized load balancer that manages and implements the rules defined in Ingress resources within a Kubernetes cluster. It acts as a bridge between external traffic and the services running inside the cluster, handling incoming requests and routing them based on the Ingress rules.
### Key Functions of an Ingress Controller:
- **Traffic Routing**: Routes incoming HTTP/S traffic to the appropriate backend services based on the rules defined in Ingress resources.
- **Load Balancing**: Distributes incoming traffic across multiple instances of a service to ensure high availability and reliability.
- **TLS Termination**: Manages SSL/TLS certificates and handles secure connections for HTTPS traffic.
- **Path and Host-based Routing**: Supports routing based on URL paths and hostnames, allowing for flexible traffic management.
### Popular Ingress Controllers:
- **NGINX Ingress Controller**: A widely used open-source Ingress controller based on the NGINX web server.
- **Traefik**: A modern, dynamic Ingress controller that supports multiple backends and automatic service discovery.
- **HAProxy Ingress Controller**: An Ingress controller based on the HAProxy load balancer, known for its performance and reliability.
- **Istio Ingress Gateway**: Part of the Istio service mesh, providing advanced traffic management and security features.
### Example of Deploying an Ingress Controller:
To deploy the NGINX Ingress Controller, you can use the following command:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.13.2/deploy/static/provider/cloud/deploy.yaml  
```

## Why We need the Ingress Controller?
An Ingress Controller is essential in Kubernetes for several reasons:
1. **Centralized Traffic Management**: It provides a single point of entry for managing external traffic to multiple services within the cluster, simplifying the routing and access control.
2. **Load Balancing**: It distributes incoming traffic across multiple instances of a service, ensuring high availability and reliability.  
3. **Path and Host-based Routing**: It allows for flexible routing based on URL paths and hostnames, enabling more complex traffic management scenarios.
4. **TLS Termination**: It handles SSL/TLS termination, allowing secure connections to be managed centrally, reducing the complexity of managing certificates for individual services.
5. **Scalability**: It can scale to handle large volumes of traffic, making it suitable for production environments with high traffic demands.
6. **Integration with Cloud Providers**: Many Ingress Controllers can integrate with cloud provider load balancers, providing additional features and capabilities.
7. **Customizable**: It allows for customization and configuration to meet specific application requirements, such as rate limiting, authentication, and more.


### What is Ingress in Kubernetes?
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

### What is the difference between Ingress and Ingress Controller in Kubernetes?
The difference between **Ingress** and **Ingress Controller** in Kubernetes lies in their roles and functionalities:
1. **Ingress**:
   - **Definition**: Ingress is a Kubernetes resource that defines rules for routing external HTTP/S traffic to services within the cluster.
   - **Purpose**: It specifies how requests should be directed based on hostnames and paths, but it does not handle the actual traffic routing itself.
   - **Configuration**: Ingress resources (Services) are created and managed by users to define the desired routing behavior.
2. **Ingress Controller**:
   - **Definition**: An Ingress Controller is a specialized load balancer that implements the rules defined in Ingress Services.
   - **Purpose**: It actively manages and routes incoming traffic based on the Ingress rules, handling tasks such as load balancing, SSL termination, and path-based routing.
   - **Implementation**: Ingress Controllers are deployed as pods within the Kubernetes cluster and continuously monitor Ingress resources (Services) to apply the defined routing rules.

### Summary Diagram of Ingress and Ingress Controller

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CLOUD PROVIDER (AWS, GCP, Azure)                │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    LOAD BALANCER                            │    │
│  │              (External IP: 203.0.113.10)                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                │                                    │
└────────────────────────────────┼────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                               │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                INGRESS CONTROLLER                           │    │
│  │              (NGINX/Traefik Pod)                            │    │
│  │                                                             │    │
│  │  Routes based on:                                           │    │
│  │  • Host: api.example.com → API Service                      │    │
│  │  • Path: /web → Web Service                                 │    │
│  │  • Path: /db → Database Service                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                          │        │        │                        │
│                          ▼        ▼        ▼                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   POD A     │  │   POD B     │  │   POD C     │                  │
│  │             │  │             │  │             │                  │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │                  │
│  │ │   API   │ │  │ │   WEB   │ │  │ │Database │ │                  │
│  │ │ Service │ │  │ │ Service │ │  │ │ Service │ │                  │
│  │ │:8080    │ │  │ │:3000    │ │  │ │:5432    │ │                  │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

USER TRAFFIC FLOW:
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Browser   │───▶│ Cloud Provider  │───▶│    Ingress      │
│             │    │ Load Balancer   │    │   Controller    │
│ GET /web    │    │ 203.0.113.10    │    │  Routes to      │
│             │    │                 │    │   POD B         │
└─────────────┘    └─────────────────┘    └─────────────────┘

ROUTING EXAMPLES:
• https://api.example.com/users    → POD A (API Service)
• https://example.com/web         → POD B (Web Service)  
• https://example.com/db/health   → POD C (Database Service)
```

