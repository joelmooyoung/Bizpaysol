#!/bin/bash

# Enhanced deployment script for ACH Processing System
# Supports both development and production deployments with proper error handling

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
ENVIRONMENT="${1:-development}"
COMPOSE_FILE=""
ENV_FILE=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to set environment-specific configuration
setup_environment() {
    case "$ENVIRONMENT" in
        "development"|"dev")
            log_info "Setting up development environment..."
            COMPOSE_FILE="docker-compose.yml"
            ENV_FILE=".env.development"
            ;;
        "production"|"prod")
            log_info "Setting up production environment..."
            COMPOSE_FILE="docker-compose.prod.yml"
            ENV_FILE=".env.production"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT. Use 'development' or 'production'"
            exit 1
            ;;
    esac
}

# Function to check environment file
check_env_file() {
    if [[ ! -f "$PROJECT_ROOT/$ENV_FILE" ]]; then
        log_warning "Environment file $ENV_FILE not found. Creating from template..."
        
        if [[ -f "$PROJECT_ROOT/.env.example" ]]; then
            cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/$ENV_FILE"
            log_warning "Please edit $ENV_FILE with your actual configuration values."
        else
            log_error "No .env.example template found. Please create $ENV_FILE manually."
            exit 1
        fi
    fi
}

# Function to build images
build_images() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$ENVIRONMENT" == "production" || "$ENVIRONMENT" == "prod" ]]; then
        # Production build with optimizations
        docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel
    else
        # Development build
        docker-compose -f "$COMPOSE_FILE" build
    fi
    
    log_success "Docker images built successfully"
}

# Function to start services
start_services() {
    log_info "Starting services..."
    
    cd "$PROJECT_ROOT"
    
    # Load environment variables
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    
    if [[ "$ENVIRONMENT" == "production" || "$ENVIRONMENT" == "prod" ]]; then
        # Production deployment with health checks
        docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans
        
        # Wait for services to be healthy
        log_info "Waiting for services to be healthy..."
        sleep 30
        
        # Check health status
        check_health
    else
        # Development deployment
        docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans
    fi
    
    log_success "Services started successfully"
}

# Function to check service health
check_health() {
    log_info "Checking service health..."
    
    # Check backend health
    max_attempts=30
    attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3001/health &> /dev/null; then
            log_success "Backend service is healthy"
            break
        else
            log_info "Waiting for backend service... (attempt $attempt/$max_attempts)"
            sleep 5
            ((attempt++))
        fi
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        log_error "Backend service health check failed"
        show_logs
        exit 1
    fi
}

# Function to show logs
show_logs() {
    log_info "Showing recent logs..."
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
}

# Function to stop services
stop_services() {
    log_info "Stopping services..."
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" down
    log_success "Services stopped"
}

# Function to clean up
cleanup() {
    log_info "Cleaning up..."
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" down -v --remove-orphans
    docker system prune -f
    log_success "Cleanup completed"
}

# Function to show status
show_status() {
    log_info "Service status:"
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Function to show usage
show_usage() {
    echo "Usage: $0 <command> [environment]"
    echo ""
    echo "Commands:"
    echo "  start [dev|prod]     - Start the application"
    echo "  stop                 - Stop the application"
    echo "  restart [dev|prod]   - Restart the application"
    echo "  status               - Show service status"
    echo "  logs                 - Show logs"
    echo "  health               - Check service health"
    echo "  cleanup              - Stop services and clean up"
    echo "  build [dev|prod]     - Build Docker images"
    echo ""
    echo "Environments:"
    echo "  dev, development     - Development environment (default)"
    echo "  prod, production     - Production environment"
}

# Main execution
main() {
    local command="${1:-start}"
    
    case "$command" in
        "start")
            check_prerequisites
            setup_environment
            check_env_file
            build_images
            start_services
            ;;
        "stop")
            setup_environment
            stop_services
            ;;
        "restart")
            setup_environment
            stop_services
            build_images
            start_services
            ;;
        "status")
            setup_environment
            show_status
            ;;
        "logs")
            setup_environment
            show_logs
            ;;
        "health")
            check_health
            ;;
        "cleanup")
            setup_environment
            cleanup
            ;;
        "build")
            check_prerequisites
            setup_environment
            build_images
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Error handling
trap 'log_error "An error occurred. Exiting..."' ERR

# Run main function
main "$@"