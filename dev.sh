#!/bin/bash

trap 'docker-compose down' EXIT

export NODE_ENV=development

docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker-compose logs -f api db redis