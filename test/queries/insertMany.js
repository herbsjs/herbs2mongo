const { entity, field } = require("@herbsjs/gotu")
const Repository = require("../../src/repository")
const assert = require("assert")
const { ObjectId } = require('mongodb')

describe("Insert an Array of Entities", () => {
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

  const mongodb = (ret, spy = {}) =>
    ({
      collection: (f) => {
        spy.collectionName = f
        spy.payload = []
        return {
          insertMany: (op) => {
            op.map((p, index) => spy.payload[index] = p)
            return ret
          }
        }
      }
    })

  it("should insert an array of entities", async () => {
    //given
    let spy = {}
    let arrEntity = []

    const retFromDeb = {
      acknowledged : true,
      insertedIds: [
            { _id: new ObjectId("60edc25fc39277307ca9a7ff")},
            { _id: new ObjectId("60edc25fc39277307ca9a7ed") },
        ]
    }
    const collectionName = "aCollection"
    const anEntity = givenAnEntity()
    const anotherEntity = givenAnEntity()
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

    arrEntity.push(anEntity)

    anotherEntity.id = "60edc25fc39277307ca9a7ed"
    anotherEntity.numberTest = 10
    anotherEntity.booleanTest = false

    arrEntity.push(anotherEntity)

    //when
    const ret = await itemRepo.insertMany(arrEntity)

    //then
    assert.deepStrictEqual(ret[0]._id,  new ObjectId("60edc25fc39277307ca9a7ff"))
    assert.deepStrictEqual(spy.collectionName, collectionName)
    assert.deepStrictEqual(spy.payload[0], { _id: "60edc25fc39277307ca9a7ff", number_test: 100, boolean_test: true })

    assert.deepStrictEqual(ret[1]._id,  new ObjectId("60edc25fc39277307ca9a7ed"))
    assert.deepStrictEqual(spy.collectionName, collectionName)
    assert.deepStrictEqual(spy.payload[1], { _id: "60edc25fc39277307ca9a7ed", number_test: 10, boolean_test: false })
  })
})
