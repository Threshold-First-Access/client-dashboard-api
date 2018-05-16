#!/bin/bash
set -e

# Check if we are in CI world
if [ -z ${CIRCLECI} ]; then
  # Check if there's a mysql docker image running
  MYSQL_IMAGE_ID=`docker ps -q -f "name=mysql"`

  # Reset test database
  if [ ! -z ${MYSQL_IMAGE_ID} ]; then
    $(docker exec mysql /usr/bin/mysql -e 'drop database if exists circle_test; create database circle_test;') || { echo "Could not reset test database."; }
  fi
fi

# Recreate the test database
node_modules/.bin/knex-migrate down --to 0

# Run migrations
npm run migrate

# Add seeds
node_modules/.bin/knex seed:run

# Provision a super administrator.
node bin/superadmin.js
