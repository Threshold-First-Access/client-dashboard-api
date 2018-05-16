#!/bin/bash
set -e

#Set NODE_ENV
export NODE_ENV=test
export PORT=1234
export SECRET_KEY=testing
export DATABASE_NAME=circle_test

# Reset the database
# docker-compose exec -T db /usr/bin/mysql -e "drop database if exists $DATABASE_NAME; create database $DATABASE_NAME;"

# Run seeds
./bin/seeds.sh

# Provision an authenticated user with a role and permissions to perform tasks
node ./test/fixtures/provision_auth_user.js

jest --forceExit --runInBand $@
