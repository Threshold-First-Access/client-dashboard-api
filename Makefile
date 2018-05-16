NODE_ENV			?= development

all: 		start

init: 
	@echo "\033[34m\n* Installing dependencies ... \n\033[0m"
	@yarn install

start: init services
	@echo "\033[34m\n* Starting API ... \n\033[0m"
	@yarn start:dev

services: init
	@echo "\033[34m\n* Starting up services ... \n\033[0m"
	@docker-compose up -d && sleep 2s
	@echo "\033[34m\n* Done! All services started. Run \"docker-compose logs -f\" to tail the logs. \n\033[0m"

test: services migrate seed
	@echo "\033[34m\n* Running tests ... \n\033[0m"
	@node ./test/fixtures/provision_auth_user.js
	@yarn run test

migrate: 
	@echo "\033[37m\n* Migration implemented yet. Run tests manually for now. \n\033[0m" && exit 1;

seed:
	@echo "\033[34m\n* Seeding test database ... \n\033[0m"
	@docker-compose exec -T db /usr/bin/mysql -e 'drop database if exists $(DATABASE_NAME); create database $(DATABASE_NAME);'
	@yarn exec knex seed:run
	@NODE_PATH=. node ./bin/superadmin.js

clean:
	@echo "\033[34m\n* Cleaning up services ... \n\033[0m"
	@docker-compose down --remove-orphans

.PHONEY: test migrate
