const { entity, field } = require('@herbsjs/gotu')
const Repository = require('../src/repository')
const { ObjectId } = require('mongodb')
const connection = require('./connection')
const assert = require('assert')
let client = {}


describe('Query Find by ID', () => {

  const collection = 'test_repository'
  const database = 'herbs2mongo_testdb'

    before(async () => {

      client = await connection()

      await client.dropDatabase()

      await client.createCollection(collection)

      await client.collection(collection).insertOne({ _id: new ObjectId("60edc25fc39277307ca9a7ff"), number_test: 100, boolean_test: true, string_test: 'aString' })
      await client.collection(collection).insertOne({ _id: new ObjectId("70edc25fc39277307ca9a700"), number_test: 200, boolean_test: false })
      await client.collection(collection).insertOne({ _id: new ObjectId("80edd25fc39272307ca9a712"), number_test: 300, boolean_test: false })
      await client.collection(collection).insertOne({
          _id: new ObjectId("64acbc1ba6a28fbd4501c25c"),
          number_test: 400,
          boolean_test: true,
          string_test: "aString",
          child_entity: {
              number_test: 100, boolean_test: true, string_test: 'aString'
          }
      })
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

    const ChildEntity = entity('Child entity', {
        numberTest: field(Number),
        stringTest: field(String),
        booleanTest: field(Boolean),
        arrayTest: field([String])
    })

    const givenAnEntity = () => {
        return entity('A entity', {
            id: field(String),
            numberTest: field(Number),
            stringTest: field(String),
            booleanTest: field(Boolean),
            childEntity: field(ChildEntity)
        })
    }

    it('should return entity', async () => {
        //given
        const anEntity = givenAnEntity()
        const ItemRepository = givenAnRepositoryClass({
            entity: anEntity,
            collection,
            database,
            ids: ['id'],
            mongodb: await connection
        })
        const injection = {}
        const itemRepo = new ItemRepository(injection)

        anEntity.id = '60edc25fc39277307ca9a7ff'
        //when
        const ret = await itemRepo.findByID(anEntity.id)

        //then
        assert.deepStrictEqual(ret[0].toJSON(), { id: '60edc25fc39277307ca9a7ff', stringTest: "aString", numberTest: 100, booleanTest: true, childEntity: undefined })
        assert.deepStrictEqual(ret[0].isValid(), true)
    })

    it('should return nested entitiy', async () => {
        //given
        const anEntity = givenAnEntity()
        const ItemRepository = givenAnRepositoryClass({
            entity: anEntity,
            collection,
            database,
            ids: ['id'],
            mongodb: await connection
        })
        const injection = {}
        const itemRepo = new ItemRepository(injection)

        anEntity.id = '64acbc1ba6a28fbd4501c25c'
        //when
        const ret = await itemRepo.findByID(anEntity.id)

        //then
        assert.deepStrictEqual(ret[0].toJSON(), {
            id: '64acbc1ba6a28fbd4501c25c',
            numberTest: 400,
            booleanTest: true,
            stringTest: "aString",
            childEntity: {
                numberTest: 100, booleanTest: true, stringTest: 'aString', arrayTest: null,
            }
        })
        assert.deepStrictEqual(ret[0].isValid(), true)
    })

    it('should return multiple entities', async () => {
        //given
        const anEntity = givenAnEntity()
        const ItemRepository = givenAnRepositoryClass({
            entity: anEntity,
            collection,
            database,
            ids: ['id'],
            mongodb: await connection
        })
        const injection = {}
        const itemRepo = new ItemRepository(injection)

        const ids = [
            '60edc25fc39277307ca9a7ff',
            '80edd25fc39272307ca9a712',
        ]

        //when
        const ret = await itemRepo.findByID(ids)

        //then
        assert.deepStrictEqual(ret[0].toJSON(), { id: '60edc25fc39277307ca9a7ff', stringTest: "aString", numberTest: 100, booleanTest: true, childEntity: undefined })
        assert.deepStrictEqual(ret[0].isValid(), true)
    })
})
