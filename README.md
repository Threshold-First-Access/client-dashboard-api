## Client dashboard API

**Prerequisites**

* [Docker](https://docker.com) - A lightweight containerization platform.
* [Docker compose](https://docs.docker.com/compose/) - A tool for defining and running multi-container Docker applications. It is installed as part of Docker.
* [Yarn](https://yarnpkg.com) - Yarn for installing dependencies and running tasks.

## Getting started

**Update .env**

In the root of the project, add the .env file with the data below.

```
NODE_ENV=development
BASE_URL=http://localhost:5000

# Get this from vault (optional)
DATADOG_API_KEY=XXXX

DATABASE_HOST=localhost
DATABASE_NAME=client_dashboard
DATABASE_PORT=3306

DATABASE_USERNAME=fa-app-user
DATABASE_PASSWORD=RandomPassword789

LOG_PATH=out.log
LOG_LEVEL=debug

REDIS_HOST=cache
REDIS_PORT=6379

SECRET_KEY=your-secret-key

SCORING_ENGINE_NAME=<service name>
SCORING_ENGINE_REGION=us-east-1
SCORING_ENGINE_VERSION=$LATEST

DATA_UPDATER_NAME=<updater_name>
DATA_UPDATER_REGION=us-east-1
DATA_UPDATER_VERSION=$LATEST

REPORTING_API=<reporting api endpoint>
```

## Starting the environment

Run `make start` to start everything up at once.


### Separately Running Databases 

You can run the databases from Docker images by issuing the following command separately:

```
docker-compose up
```

## Running tests
Run `make test` to run all tests.

The tests will require a clean database for now, so be sure to drop the test database between each run.
