const appName = 'client-dashboard-api';

const config = {
  appName,
  webserver: {
    port: process.env.PORT || '8080',
  },
  logging: {
    file: process.env.LOG_PATH || '/var/log/client-dashboard-api/app.log',
    level: process.env.LOG_LEVEL || 'info',
    console: process.env.LOG_ENABLE_CONSOLE || true,
  },
  cache: {
    test: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
    },
    development: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
    production: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  },
  mysql: {
    /*
     Our variable name choices are dictated by Docker and how it exposes
     the IP and PORTs in specific variable names during linkage time.

     They are as follows:
     - IP = MYSQL_PORT_3306_TCP_ADDR
     - PORT = MYSQL_PORT_3306_TCP_PORT
     */
    connection: {
      test: {
        host: process.env.MYSQL_PORT_3306_TCP_ADDR || process.env.DATABASE_HOST,
        port: process.env.MYSQL_PORT_3306_TCP_PORT || process.env.DATABASE_PORT,
        database: 'circle_test',
        user: 'root',
        password: '',
        debug: process.env.DATABASE_DEBUG ? ['ComQueryPacket'] : false,
        charset: 'utf8',
      },
      development: {
        host: process.env.MYSQL_PORT_3306_TCP_ADDR || process.env.DATABASE_HOST,
        port: process.env.MYSQL_PORT_3306_TCP_PORT || process.env.DATABASE_PORT,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        debug: process.env.DATABASE_DEBUG ? ['ComQueryPacket'] : false,
        charset: 'utf8',
      },
      production: {
        host: process.env.MYSQL_PORT_3306_TCP_ADDR || process.env.DATABASE_HOST,
        port: process.env.MYSQL_PORT_3306_TCP_PORT || process.env.DATABASE_PORT,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        debug: process.env.DATABASE_DEBUG ? ['ComQueryPacket'] : false,
        charset: 'utf8',
      },
    },
    pool: {
      min: process.env.DATABASE_POOL_MIN
        ? parseInt(process.env.DATABASE_POOL_MIN, 10)
        : 2,
      max: process.env.DATABASE_POOL_MAX
        ? parseInt(process.env.DATABASE_POOL_MAX, 10)
        : 2,
    },
  },
};

module.exports = config;
