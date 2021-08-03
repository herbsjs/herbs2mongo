const { entity, field } = require('@herbsjs/gotu')
const Repository = require('../src/repository')
const db = require('./db')
const connection = require('./connection')
const assert = require('assert')
let client = {}

describe('Persist Array Entities', () => {

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

    describe('Array entities', () => {

        const givenAnEntity = () => {
            return entity('A entity', {
                id: field(String),
                code: field(Number),
                stringTest: field(String),
                booleanTest: field(Boolean)
            })
        }

        const givenAnModifiedEntity = (code = 0, stringTest = '', booleanTest = false) => {
            const anEntity = givenAnEntity()
            const anEntityInstance = new anEntity()
            anEntityInstance.stringTest = stringTest
            anEntityInstance.code = code
            anEntityInstance.booleanTest = booleanTest
            return anEntityInstance
        }

        it('should insert a array items by check first item', async () => {

            //given
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass({
                entity: anEntity,
                collection,
                ids: ['id'],
                mongodb: await connection()
            })

            const aModifiedInstance = [
                givenAnModifiedEntity(10, 'string one test',false),
                givenAnModifiedEntity(11, 'string two test',true)
            ]

            const injection = {}
            const itemRepo = new ItemRepository(injection)

            //when
            const ret = await itemRepo.insertMany(aModifiedInstance)

            //then
            var findStatement = {}
            findStatement.code = 10
            const collectionConnection = await client.collection(collection)
            const retDB =  await collectionConnection.findOne(findStatement)
            assert.deepStrictEqual(retDB.string_test, 'string one test')
        })

        it('should insert a array items by check last item', async () => {

            //given
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass({
                entity: anEntity,
                collection,
                ids: ['id'],
                mongodb: await connection()
            })

            const aModifiedInstance = [
                givenAnModifiedEntity(10, 'string one test',false),
                givenAnModifiedEntity(11, 'string two test',true)
            ]

            const injection = {}
            const itemRepo = new ItemRepository(injection)

            //when
            const ret = await itemRepo.insertMany(aModifiedInstance)

            //then
            var findStatement = {}
            findStatement.code = 11
            const collectionConnection = await client.collection(collection)
            const retDB =  await collectionConnection.findOne(findStatement)
            assert.deepStrictEqual(retDB.string_test, 'string two test')
        })        
    })
})
