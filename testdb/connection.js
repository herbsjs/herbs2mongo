const {MongoClient,Logger} = require('mongodb')
const config = require('./config')

let dbInstance = null

module.exports = async () => {
  if (dbInstance) {
      return new Promise((resolve) => resolve(dbInstance))
  }
  const client = new MongoClient(config.connectionString)
  await client.connect()
  dbInstance = client.db(config.databaseName)
  Logger.setLevel("debug")
  return dbInstance

}
