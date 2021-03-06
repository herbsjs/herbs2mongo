const { entity, field, id } = require("@herbsjs/gotu")
const Repository = require("../../src/repository")
const assert = require("assert")

describe("Update an Entity", () => {
  const givenAnEntity = () => {
    const ParentEntity = entity('A Parent Entity', {})

    return entity('A entity', {
      id: id(String),
      stringTest: field(String),
      booleanTest: field(Boolean),
      entityTest: field(ParentEntity),
      entitiesTest: field([ParentEntity]),
    })
  }

  const givenAnRepositoryClass = () => {
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
          findOneAndUpdate: (p) => {
            spy.payload = p
            { return  { ok: '1', value: { _id: "70edc25fc39277307ca9a700", string_test: "test", boolean_test: true } }}
          }
        }
      }
    })

  it("should update an entity", async () => {
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

    anEntity.id = "70edc25fc39277307ca9a700"
    anEntity.stringTest = "test"
    anEntity.booleanTest = true

    //when
    const ret = await itemRepo.update(anEntity)

    //then
    assert.deepStrictEqual(ret.stringTest, "test")
  })

})
