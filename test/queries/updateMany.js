const { entity, field } = require("@herbsjs/gotu")
const Repository = require("../../src/repository")
const assert = require("assert")

describe("Update an multiple Entities", () => {
  const givenAnEntity = () => {
    const ParentEntity = entity('A Parent Entity', {})

    return entity('A entity', {
      id: field(Number),
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

  const mongodb = (spy = {}) => async () =>
    ({
      collection: (f) => {
        spy.collectionName = f
        return {
          updateMany: (op) => {
            spy.payload = op
            { return { modifiedCount:  1 } }
          }
        }
      }
    })

  it("should update an  multiple entities", async () => {
    //given
    let spy = {}
    const anEntity = givenAnEntity()
    const ItemRepository = givenAnRepositoryClass()
    const itemRepo = new ItemRepository({
      entity: anEntity,
      collection: "aCollection",
      ids: ["id"],
      mongodb: mongodb(spy)
    })

    anEntity.id = 1

    let filterDefinition = {  id: anEntity.id }
    let updateDefinition = { $set: { "stringTest" : "everything works very well" } }

    //when
    const ret = await itemRepo.updateMany({ 
        filter: filterDefinition, 
        update: updateDefinition,
    })

    //then
    assert.deepStrictEqual(ret, true)
  })
})