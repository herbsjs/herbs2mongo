const { entity, field } = require('@herbsjs/gotu')
const Repository = require('../../src/repository')
const assert = require('assert')

describe('Query Find by ID', () => {

    const givenAnEntity = () => {
        const ParentEntity = entity('A Parent Entity', {})

        return entity('A entity', {
            id: field(String),
            stringTest: field(String),
            booleanTest: field(Boolean),
            numberTest: field(Number),
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

    const mongodb = (ret, spy = {}) => async () =>
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

    it('should return entities instances', async () => {
        //given
        const spy = {}
        const retFromDeb = [{ _id: "60edc25fc39277307ca9a7ff", number_test: 100, boolean_test: true, string_test: 'aString' }]

        const anEntity = givenAnEntity()
        const ItemRepository = givenAnRepositoryClass()
        const itemRepo = new ItemRepository({
            entity: anEntity,
            collection: 'aCollection',
            ids: ['id'],
            mongodb: mongodb(retFromDeb, spy)
        })
        anEntity.id = '60edc25fc39277307ca9a7ff'

        //when
        const ret = await itemRepo.findByID(anEntity.id)

        //then
        assert.deepStrictEqual(ret[0].toJSON(), { id: '60edc25fc39277307ca9a7ff', stringTest: "aString",  numberTest: 100, booleanTest: true , entityTest: undefined, entitiesTest: undefined })
        assert.deepStrictEqual(ret[0].isValid(),true )

    })

    it('should return null', async () => {
      //given
      const spy = {}
      const retFromDeb = null

      const anEntity = givenAnEntity()
      const ItemRepository = givenAnRepositoryClass()
      const itemRepo = new ItemRepository({
          entity: anEntity,
          collection: 'aCollection',
          ids: ['id'],
          mongodb: mongodb(retFromDeb, spy)
      })
      anEntity.id = '60edc25fc39277307ca9a7ff'

      //when
      const ret = await itemRepo.findByID(anEntity.id)

      //then
      assert.deepStrictEqual(ret, null)

  })
})
