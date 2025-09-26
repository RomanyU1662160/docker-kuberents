# Variables
SERVICE ?= service-1
TAG ?= latest
REGISTRY ?= romanysefen

# Build Docker image, FE build from Dockerfile.prod for production, others from default Dockerfile
build:
ifeq ($(SERVICE),fe-client)
	docker build -f ./$(SERVICE)/Dockerfile.prod -t $(REGISTRY)/k8-learn-$(SERVICE):$(TAG) ./$(SERVICE)
else
	docker build -t $(REGISTRY)/k8-learn-$(SERVICE):$(TAG) ./$(SERVICE)
endif

# Push image to registry
push: build
	docker push $(REGISTRY)/k8-learn-$(SERVICE):$(TAG)

# Deploy to Kubernetes
deploy: push
	kubectl rollout restart deployment/$(SERVICE)-depl -n default

# Deploy all services
deploy-all:
	$(MAKE) deploy SERVICE=fe-client
	$(MAKE) deploy SERVICE=service-1
	$(MAKE) deploy SERVICE=service-2

# Development mode with docker-compose
dev:
	docker-compose up -d

# Stop development environment
dev-stop:
	docker-compose down --remove-orphans

# Clean up Docker images
clean:
	docker image prune -a

# Show help
help:
	@echo "Available commands:"
	@echo "  make build SERVICE=<name> TAG=<tag>  - Build Docker image"
	@echo "  make push SERVICE=<name> TAG=<tag>   - Build and push image"
	@echo "  make deploy SERVICE=<name> TAG=<tag> - Build, push, and deploy"
	@echo "  make deploy-all                      - Deploy all services"
	@echo "  make dev                             - Start development environment"
	@echo "  make dev-stop                        - Stop development environment"
	@echo "  make clean                           - Clean up Docker images"
	@echo ""
	@echo "Examples:"
	@echo "  make deploy                          - Deploy service-1:latest"
	@echo "  make deploy SERVICE=service-2        - Deploy service-2:latest"
	@echo "  make deploy SERVICE=fe-client TAG=v1.0 - Deploy fe-client:v1.0"

.PHONY: build push deploy deploy-all dev dev-stop clean help
