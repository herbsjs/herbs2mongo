// Load .env files
const dotenv = require('dotenv')
const result = dotenv.config()
if (result.error) { throw result.error }

module.exports = {
  connectionString: process.env.DB_CONNECTIONSTRING,
  databaseName: process.env.DB_DATABASE
}
