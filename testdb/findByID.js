const { entity, field } = require('@herbsjs/gotu')
const Repository = require('../src/repository')
const db = require('./db')
const { ObjectId } = require('mongodb')
const connection = require('./connection')
const assert = require('assert')
let client = {}


describe('Query Find by ID', () => {

  const collection = 'test_repository'
  const database = 'herbs2mongo_testdb'

    before(async () => {

      client = await db()

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

    const givenAnEntity = () => {
        return entity('A entity', {
            id: field(String),
            numberTest: field(Number),
            stringTest: field(String),
            booleanTest: field(Boolean)
        })
    }

    it('should return entities', async () => {
        //given
        const anEntity = givenAnEntity()
        const ItemRepository = givenAnRepositoryClass({
            entity: anEntity,
            collection,
            database,
            ids: ['id'],
            mongodb: await connection()
        })
        const injection = {}
        const itemRepo = new ItemRepository(injection)

        anEntity.id = '60edc25fc39277307ca9a7ff'
        //when
        const ret = await itemRepo.findByID(anEntity.id)

        //then
        assert.deepStrictEqual(ret.toJSON(), { id: '60edc25fc39277307ca9a7ff', stringTest: "aString",  numberTest: 100, booleanTest: true })
        assert.deepStrictEqual(ret.isValid(),true )
    })
})
