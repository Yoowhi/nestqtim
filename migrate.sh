#!/bin/bash

# migrate.sh - Migration script with container management

SERVICE_NAME="api"                    # Docker Compose service name
CONTAINER_NAME="nestqtim-api"        # Actual container name
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Track if we started the container
CONTAINER_STARTED=false

# Function to start container
start_container() {
    if ! docker-compose -f "$DOCKER_COMPOSE_FILE" ps "$SERVICE_NAME" | grep -q "Up"; then
        echo "Starting container..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d "$SERVICE_NAME"
        CONTAINER_STARTED=true
        sleep 5
    fi
}

# Function to stop container
stop_container() {
    if [ "$CONTAINER_STARTED" = true ]; then
        echo "Stopping all containers..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" down
    fi
}

# Handle cleanup on exit
trap 'stop_container' EXIT

# Parse command
case "$1" in
    --new)
        start_container
        echo "Generating new migration..."
        docker exec "$CONTAINER_NAME" npm run migrate:gen
        ;;
    --apply)
        start_container
        echo "Applying migrations..."
        docker exec "$CONTAINER_NAME" npm run migrate
        ;;
    --down)
        start_container
        echo "Downgrading migrations..."
        docker exec "$CONTAINER_NAME" npm run migrate:down
        ;;
    *)
        echo "Usage: ./migrate.sh {--new|--apply|--down}"
        exit 1
        ;;
esac
