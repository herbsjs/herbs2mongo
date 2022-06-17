const { entity, field } = require('@herbsjs/gotu')
const Repository = require('../src/repository')
const { ObjectId } = require('mongodb')
const connection = require('./connection')
const assert = require('assert')
let client = {}

describe('Persist Entity', () => {

  const collection = 'test_repository'
  const database = 'herbs2mongo_testdb'

    before(async () => {

      client = await connection()

      await client.dropDatabase()

      await client.createCollection(collection)

      await client.collection(collection).insertOne( { _id: new ObjectId("60edc25fc39277307ca9a7ff"), number_test: 100, boolean_test: true, string_test: 'aString' })
      await client.collection(collection).insertOne( { _id: new ObjectId("70edc25fc39277307ca9a700"), number_test: 200, boolean_test: false })
    })

    after(async () => {

      await client.dropDatabase()

    })

    const givenAnRepositoryClass = (options) => {
        return class ItemRepositoryBase extends Repository {
            constructor() {
                super(options)
            }
        }
    }

    describe('Simple entity', () => {

        const givenAnEntity = () => {
            return entity('A entity', {
                id: field(String),
                numberTest: field(Number),
                stringTest: field(String),
                booleanTest: field(Boolean)
            })
        }

        const givenAnModifiedEntity = () => {
            const anEntity = givenAnEntity()
            const anEntityInstance = new anEntity()
            anEntityInstance.id = '60edc25fc39277307ca9a7ff'
            anEntityInstance.stringTest = "test"
            anEntityInstance.numberTest = 100
            anEntityInstance.booleanTest = true
            return anEntityInstance
        }

        it('should update an existing item', async () => {

            //given
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass({
                entity: anEntity,
                collection,
                ids: ['id'],
                mongodb: await connection
            })
            const aModifiedInstance = givenAnModifiedEntity()

            const injection = {}
            const itemRepo = new ItemRepository(injection)

            //when
            aModifiedInstance.stringTest = "updated"
            const ret = await itemRepo.update(aModifiedInstance)

            //then
             var findStatement = {}
             findStatement.string_test = "updated"
             const collectionConnection = await client.collection(collection)
             const retDB =  await collectionConnection.findOne(findStatement)
             assert.deepStrictEqual(retDB.string_test, "updated")

        })
    })
})
