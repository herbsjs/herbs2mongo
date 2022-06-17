const { entity, field } = require('@herbsjs/gotu')
const Repository = require('../../src/repository')
const assert = require('assert')

describe('Query Find', () => {

    context('Find all data', () => {

        const givenAnEntity = () => {
            const ParentEntity = entity('A Parent Entity', {})

            return entity('A entity', {
                id: field(String),
                numberTest: field(Number),
                stringTest: field(String),
                booleanTest: field(Boolean),
                entityTest: field(ParentEntity),
                entitiesTest: field([ParentEntity]),
            })
        }

        const givenAnRepositoryClass = (options) => {
            return class ItemRepositoryBase extends Repository {
                constructor(options) {
                    super(options)
                }
            }
        }

        const mongoNoFilter = (ret, spy = {}) => async () =>
        ({
          collection: (f) => {
            spy.collectionName = f
            return {
              find: (p,o) => {
                spy.payload = p
                return {
                  toArray: () => {
                   return ret
                },
                count: () => {
                  return 2
                }
               }
              }
            }
          }
        })


        it('should return entities using table field', async () => {
            //given
            let spy = {}
            const retFromDeb = [
                { _id: "60edc25fc39277307ca9a7ff", number_test: 100, boolean_test: true, string_test: 'aString' },
                { _id: "70edc25fc39277307ca9a700", number_test: 200, boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                collection: 'aCollection',
                ids: ['id'],
                mongodb: mongoNoFilter(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.find({})

            //then
            assert.strictEqual(ret.length, 2)
        })
    })

    context('Find with conditions', () => {
        const givenAnEntity = () => {
            const ParentEntity = entity('A Parent Entity', {})

            return entity('A entity', {
                id: field(String),
                stringTest: field(String),
                numberTest: field(Number),
                booleanTest: field(Boolean),
                entityTest: field(ParentEntity),
                entitiesTest: field([ParentEntity]),
            })
        }

        const givenAnRepositoryClass = (options) => {
            return class ItemRepositoryBase extends Repository {
                constructor(options) {
                    super(options)
                }
            }
        }

        const mongo = (ret, spy = {}) => async () =>
        ({
          collection: (f) => {
            spy.collectionName = f
            return {
              find: (p,o) => {
                spy.payload = p
                return {
                  toArray: () => {
                   return ret
                },
                count: () => {
                  return 2
                }
               }
              }
            }
          }
        })

        it('should return entities using table field', async () => {
            //given
            let spy = {}
            const retFromDeb = [
              { _id: "60edc25fc39277307ca9a7ff", number_test: 100, boolean_test: true, string_test: 'aString' },
              { _id: "70edc25fc39277307ca9a700", number_test: 200, boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
                entity: anEntity,
                collection: 'aCollection',
                ids: ['id'],
                mongodb: mongo(retFromDeb, spy)
            })

            //when
            const ret = await itemRepo.find({ filter: { stringTest: ["aString"] } })

            //then
            assert.deepStrictEqual(ret[0].toJSON(), { id: '60edc25fc39277307ca9a7ff', stringTest: "aString",  numberTest: 100, booleanTest: true , entityTest: undefined, entitiesTest: undefined })
            assert.deepStrictEqual(ret[0].isValid(),true )

        })

       it('should return error because a wrong search', async () => {
            //given
            let spy = {}
            const retFromDeb = [
              { _id: "60edc25fc39277307ca9a7ff", number_test: 100, boolean_test: true, string_test: 'aString' },
              { _id: "70edc25fc39277307ca9a700", number_test: 200, boolean_test: false }
            ]
            const anEntity = givenAnEntity()
            const ItemRepository = givenAnRepositoryClass()
            const itemRepo = new ItemRepository({
              entity: anEntity,
              collection: 'aCollection',
              ids: ['id'],
              mongodb: mongo(retFromDeb, spy)
            })

            try {
                //when
                const ret = await itemRepo.find({ filter: "wrong" })
            } catch (error) {
                //then
                assert.deepStrictEqual(error, "condition term is invalid")
            }
        })

    })

})
