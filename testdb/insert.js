const { entity, field } = require('@herbsjs/gotu')
const Repository = require('../src/repository')
const db = require('./db')
const connection = require('./connection')
const assert = require('assert')
let client = {}

describe('Persist Entity', () => {

    const collection = 'test_repository'
    const database = 'herbs2mongo_testdb'

    before(async () => {
        client = await db()

        await client.dropDatabase(database)

        await client.createCollection(collection)
    })

    after(async () => {

       await client.dropDatabase(database)

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
                code: field(Number),
                stringTest: field(String),
                booleanTest: field(Boolean)
            })
        }

        const givenAnModifiedEntity = () => {
            const anEntity = givenAnEntity()
            const anEntityInstance = new anEntity()
            anEntityInstance.stringTest = "test"
            anEntityInstance.code = 10
            anEntityInstance.booleanTest = true
            return anEntityInstance
        }

        it('should insert a new item', async () => {

            //given
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass({
                entity: anEntity,
                collection,
                ids: ['id'],
                mongodb: await connection()
            })
            const aModifiedInstance = givenAnModifiedEntity()

            const injection = {}
            const itemRepo = new ItemRepository(injection)

            //when
            const ret = await itemRepo.insert(aModifiedInstance)

            //then
            var findStatement = {}
            findStatement.code = 10
            const collectionConnection = await client.collection(collection)
            const retDB =  await collectionConnection.findOne(findStatement)
            assert.deepStrictEqual(retDB.string_test, "test")
        })
    })
})
