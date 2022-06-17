const { entity, field } = require("@herbsjs/gotu")
const Repository = require("../../src/repository")
const assert = require("assert")
const ObjectID = require('mongodb').ObjectID


describe("Insert an Entity", () => {
  const givenAnEntity = () => {
    const ParentEntity = entity('A Parent Entity', {})

    return entity('A entity', {
      id: field(String),
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

  const mongodb = (ret, spy = {}) => async () =>
    ({
      collection: (f) => {
        spy.collectionName = f
        return {
          insertOne: (p) => {
            spy.payload = p
            return ret
          }
        }
      }
    })


  it("should insert an entity", async () => {
    //given
    let spy = {}
    const retFromDeb = { 
      insertedId: ObjectID("60edc25fc39277307ca9a7ff"),
      acknowledged : true
    }
    const collectionName = "aCollection"
    const anEntity = givenAnEntity()
    const ItemRepository = givenAnRepositoryClass()
    const itemRepo = new ItemRepository({
      entity: anEntity,
      collection: collectionName,
      ids: ["id"],
      mongodb: mongodb(retFromDeb, spy)
    })

    anEntity.id = "60edc25fc39277307ca9a7ff"
    anEntity.numberTest = 100
    anEntity.booleanTest = true

    //when
    const ret = await itemRepo.insert(anEntity)

    //then
    assert.deepStrictEqual(ret.id,  "60edc25fc39277307ca9a7ff")
    assert.deepStrictEqual(spy.collectionName, collectionName)
    assert.deepStrictEqual(spy.payload, { id: "60edc25fc39277307ca9a7ff", number_test: 100, boolean_test: true })
  })
})
