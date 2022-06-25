const { ObjectId } = require('mongodb')
const Convention = require("./convention")
const DataMapper = require("./dataMapper")
const { checker } = require('@herbsjs/herbs')

const dependency = { convention: Convention }

module.exports = class Repository {
  constructor(options) {
    const di = Object.assign({}, dependency, options.injection)
    this.convention = di.convention
    this.collectionName = options.collection
    this.collectionQualifiedName = `${this.collectionName}`
    this.entity = options.entity
    this.entityIDs = options.ids
    this.mongodb = options.mongodb
    this.dataMapper = new DataMapper(this.entity, this.entityIDs)
  }

  async runner() {
    const instance = await this.mongodb()
    return instance
  }

  /**
  *
  * Create a new entity
  *
  * @param {type}   entityInstance Entity instance
  *
  * @return {type} Current entity
  */
  async insert(entityInstance) {
    const payload = this.dataMapper.collectionFieldsWithValue(entityInstance)

    const instance = await this.runner()
    const ret = await instance.collection(this.collectionQualifiedName)
      .insertOne(payload)

    payload._id = ret.insertedId
    return this.dataMapper.toEntity(payload)
  }

  /**
  *
  * Create multiple entities
  *
  * @param {type}  arrayEntityInstance Array of Entity instance
  *
  * @return {type} Current entities
  */
   async insertMany(arrayEntityInstance) {
    const instance = await this.runner()
    const payload = arrayEntityInstance.map((entityInstance) => this.dataMapper.collectionFieldsWithValue(entityInstance))
    let result = await instance.collection(this.collectionQualifiedName).insertMany(payload)
    if(!result) return null
    return result.insertedIds
  }

  /**
  *
  * Update Many entities
  *
  * @param {type}   options object with some properties as filter definition and update definition
  *
  * @return {type}  True when success
  */
   async updateMany(options = { filter, update }) {
    const instance = await this.runner()
    const ret = await instance.collection(this.collectionQualifiedName)
      .updateMany(
        options.filter,
        options.update,
        { upsert: true }
      )

    return ret.modifiedCount === 1 || ret.upsertedCount === 1
  }

  /**
  *
  * Update entity
  *
  * @param {type} entity Entity instance
  *
  * @return {type}  True when success
  */
   async update(entity) {

    const payload = this.dataMapper.collectionFieldsWithValue(entity)
    delete payload._id
    const collectionIDs = this.dataMapper.collectionIDs()

    const instance = await this.runner()
    const ret = await instance.collection(this.collectionQualifiedName)
      .findOneAndUpdate({ _id:  new ObjectId(entity[collectionIDs[0]])},
                 { $set : payload },
                 { upsert: true, returnDocument: 'after'})

    if(ret.ok === 0) return null
    return this.dataMapper.toEntity(ret.value)
  }


  /**
  *
  * Find entity by ID
  *
  * @param {type} id Entity _id
  *
  * @return {type} return entity when found
  */

/** 
  *
  * Finds entities matching the ID condition.
  * 
  * @param {type} ids The id or the array of _id's to search
  * @return {type} List of entities
  */
     async findByID(ids) {
      const instance = await this.runner()

      const parsedValue = Array.isArray(ids) ? this.convention.toObjectIdArray(ids) : [ObjectId(ids)]

      const result = await instance.collection(this.collectionQualifiedName).find({ _id: { $in : parsedValue }})
      if(!result) return null

      const cursor = result
      const entities = []

      if ((await cursor.count()) === 0) {
        return entities
      }

      const ret = await cursor.toArray()
      if(!ret) return null
      for (const row of ret) {
        if (row === undefined) continue
        entities.push(this.dataMapper.toEntity(row))
      }
  
      return entities
    }


  /**
  *
  * Find entities
  *
  * @param {type} object.limit Limit items to list
  * @param {type} object.filter Filter items to list
  * @param {type} object.skip Rows that will be skipped from the resultset
  * @param {type} object.orderBy Order by query
  *
  * @return {type} List of entities
  */
  async find(options = { filter, project, skip, limit, sort }) {

    options.sort = options.sort || null
    options.limit = options.limit || 0
    options.skip = options.skip || 0
    options.project = options.project || null
    options.filter = options.filter || null
    const innerOption = this.convention.omit(options, 'sort', 'limit', 'skip', 'project', 'filter')
    const instance = await this.runner()

    let query = instance.collection(this.collectionQualifiedName)

    if (options.limit > 0) query = query.limit(options.limit)
    if (options.skip > 0) query = query.skip(options.skip)

    const queryOptions = {}

    if (options.sort) {
      if (!options.sort || typeof options.sort === "object" && !Array.isArray(options.sort) && checker.isEmpty(options.sort)) throw "sort is invalid"
      queryOptions.sort({ [options.sort]: 1 })
    }


    if (options.filter) {
      const conditionTermCollectionField = this.dataMapper.toCollectionFieldName(Object.keys(options.filter)[0])
      const conditionTerm = Object.keys(options.filter)[0]
      if (!conditionTerm || conditionTerm === "0") throw "condition term is invalid"

      const conditionValue = Array.isArray(options.filter[conditionTerm])
        ? options.filter[conditionTerm]
        : [options.filter[conditionTerm]]

      if (!options.filter[conditionTerm] ||
        (typeof options.filter[conditionTerm] === "object" && !Array.isArray(options.filter[conditionTerm])) ||
        (Array.isArray(options.filter[conditionTerm]) && !options.filter[conditionTerm].length))
        throw "condition value is invalid"

      query = query.find({ [conditionTermCollectionField] : conditionValue[0] }, queryOptions)
    }
    else
    {
      query = query.find(innerOption, queryOptions)
    }

    const cursor = query

    const entities = []

    if ((await cursor.count()) === 0) {
      return null
    }

    const ret = await cursor.toArray()

    for (const row of ret) {
      if (row === undefined) continue
      entities.push(this.dataMapper.toEntity(row))
    }

    return entities
  }

  /**
  *
  * Delete entity by ID
  *
  * @param {type}   id Entity _id
  *
  * @return {type} True when success
  */
   async deleteByID(id) {
 
    const instance = await this.runner()
    const ret = await instance.collection(this.collectionQualifiedName)
      .deleteOne({ _id:  new ObjectId(id)})

    return ret.deletedCount > 0 || ret.result.ok === 1
  }

  /**
  *
  * Delete entity by seeking the Id
  *
  * @param {type} entity Entity
  *
  * @return {type} True when success
  */
   async delete(entity) {
 
    const collectionIDs = this.dataMapper.collectionIDs()
    const instance = await this.runner()
    const ret = await instance.collection(this.collectionQualifiedName)
      .deleteOne({ _id:  new ObjectId(entity[collectionIDs[0]])})

    return ret.deletedCount > 0 || ret.result.ok === 1
  }

    /**
  *
  * Delete many by filters
  *
  * @param {type}  object.filter Filter items to list
  *
  * @return {type} True when success
  */
     async deleteMany(options = { filter}) {

      const instance = await this.runner()
      options.filter = options.filter || null

      let query = instance.collection(this.collectionQualifiedName)

      if (options.filter) {
        const conditionTermCollectionField = this.dataMapper.toCollectionFieldName(Object.keys(options.filter)[0]).toString()
        const conditionTerm = Object.keys(options.filter)[0]
        if (!conditionTerm || conditionTerm === "0") throw "condition term is invalid"

        const conditionValue = Array.isArray(options.filter[conditionTerm])
          ? options.filter[conditionTerm]
          : [options.filter[conditionTerm]]

        if (!options.filter[conditionTerm] ||
          (typeof options.filter[conditionTerm] === "object" && !Array.isArray(options.filter[conditionTerm])) ||
          (Array.isArray(options.filter[conditionTerm]) && !options.filter[conditionTerm].length))
          throw "condition value is invalid"

        query = query.deleteMany({ [conditionTermCollectionField] : conditionValue[0] })
      }
      else
      {
        query =  query.deleteMany({})
      }

      let ret = await query

      return ret.deletedCount > 0 || ret.result.ok === 1
    }
}
