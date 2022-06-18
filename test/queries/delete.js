const { entity, field, id } = require("@herbsjs/gotu")
const Repository = require("../../src/repository")
const assert = require("assert")

describe("Delete an Entity", () => {
  const givenAnEntity = () => {
    return entity("An entity", {
      id: id(Number),
      stringTest: field(String),
      booleanTest: field(Boolean),
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
        deleteOne: (p) => { return { result: { ok: 1 } } }
      }
    }
  })


  it("should delete an entity by id", async () => {
    //given
    let spy = {}
    const anEntity = givenAnEntity()
    const ItemRepository = givenAnRepositoryClass()
    const collectionName = "aCollection"
    const itemRepo = new ItemRepository({
      entity: anEntity,
      collection: collectionName,
      ids: ["id"],
      mongodb: mongodb(spy)
    })

    anEntity.id = 1
    anEntity.stringTest = "test"
    anEntity.booleanTest = true

    //when
    const ret = await itemRepo.delete(anEntity)

    //then
    assert.deepStrictEqual(ret, true)
  })
})
