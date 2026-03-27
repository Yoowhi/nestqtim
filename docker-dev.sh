#!/bin/bash

# Docker Dev Script
# Starts docker-compose and follows logs, stops on Ctrl+C

set -e

echo "🚀 Starting NestQtim Development Environment..."

# Start docker-compose in the background
docker-compose up -d > /dev/null 2>&1

echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Failed to start containers"
    exit 1
fi

echo "✅ Docker containers are running"
echo "📋 To stop and clean up, press Ctrl+C"
echo "📊 Monitoring logs below..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━I'll create a script that starts docker-compose in development mode and streams logs, with automatic cleanup when stopped.

<write_to_file>
<path>dev.sh</path>
<content>#!/bin/bash

# Development script for Nestqtim
# Starts docker-compose and streams logs, cleans up on exit

set -e

echo "🚀 Starting Nestqtim development environment..."
echo "-------------------------------------------"

# Start containers in background
docker-compose up -d

# Wait for containers to be healthy
echo "⏳ Waiting for services to be ready..."
until docker-compose ps api | grep -q "Up"; do
    sleep 1
done

echo "✅ Services are running"
echo "-------------------------------------------"
echo "📝 Following logs (Ctrl+C to stop containers)"
echo "-------------------------------------------"
echo ""

# Stream logs and handle cleanup
trap 'echo ""; echo "🛑 Stopping containers..."; docker-compose down; exit 0' INT TERM

docker-compose logs -f api db redis