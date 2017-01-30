var os = require('os');

// get the environment variable settings
var mariadbHost = process.env.EMANATE_MARIADB_HOST || '10.0.0.156';
var mariadbUser = process.env.EMANATE_MARIADB_USER || 'osmosys';
var mariadbPassword = process.env.EMANATE_MARIADB_PASSWORD || 'Change123';
var mariadbDatabase = process.env.EMANATE_MARIADB_DATABASE || 'shopping_cart_nodejs';

// define the database configuration
var dbConfig = {
  'mariadb': {
    name: 'mariadb',
    maxConn: 40,
    minConn: 20,
    idleTimeout: 30000,
    host: mariadbHost,
    user: mariadbUser,
    password: mariadbPassword,
    database: mariadbDatabase,
    connTimeout: 15,
    multiStatements: true
  },
  'mysqldb': {
    host: mariadbHost,
    user: mariadbUser,
    password: mariadbPassword,
    database: mariadbDatabase,
  }
};

module.exports = dbConfig;
