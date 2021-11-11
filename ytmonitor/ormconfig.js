const dotenv = require('dotenv');
dotenv.config({path: './local.env'});

module.exports = {
  "type": "postgres",
  "host": process.env.DB_HOST,
  "port": process.env.DB_PORT,
  "username": process.env.DB_USER,
  "password": process.env.DB_USER,
  "database": process.env.DB_DATABASE,
  "synchronize": true,
  "logging": false,
  "entities": [
    "db/entity/**/*.ts"
 ],
 "migrations": [
    "db/migration/**/*.ts"
 ],
 "subscribers": [
    "db/subscriber/**/*.ts"
 ],
 "cli": {
    "entitiesDir": "db/entity",
    "migrationsDir": "db/migration",
    "subscribersDir": "db/subscriber"
 }
};
