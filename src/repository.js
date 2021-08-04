const Convention = require("./convention")
const DataMapper = require("./dataMapper")
const { checker } = require('@herbsjs/suma')

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

  runner() {
    return this.mongodb
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

    let { ops } = await this.runner().collection(this.collectionQualifiedName).insertOne(payload)

    return this.dataMapper.toEntity(ops[0])
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
    const payload = arrayEntityInstance.map((entityInstance) => this.dataMapper.collectionFieldsWithValue(entityInstance))  
    let { ops } = await this.runner().collection(this.collectionQualifiedName).insertMany(payload)
    return ops.map((op) => this.dataMapper.toEntity(op)) 
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
    const ret = await this
      .runner()
      .collection(this.collectionQualifiedName)
      .updateMany(
        options.filter, 
        options.update,
        { upsert: true }
      )
      
    return ret.modifiedCount === 1
  }

  /**
  *
  * Update entity
  *
  * @param {type}   entityInstance Entity instance
  *
  * @return {type}  True when success
  */
   async update(entityInstance) {

    const payload = this.dataMapper.collectionFieldsWithValue(entityInstance)
    delete payload._id

    const ret = await this.runner().collection(this.collectionQualifiedName)
      .updateOne({ _id: String(entityInstance._id)},
                 { $set : payload },
                 { upsert: true })

    return ret.modifiedCount === 1
  }


  /**
  *
  * Find entity by ID
  *
  * @param {type} id Entity _id
  *
  * @return {type} return entity when found
  */

  async findByID(id) {

    let result = await this.runner().collection(this.collectionQualifiedName).findOne({ _id: String(id)})

    return this.dataMapper.toEntity(result)
  }


  /**
  *
  * Find entities
  *
  * @param {type} object.limit Limit items to list
  * @param {type} object.filter Filter items to list
  * @param {type} object.skip Rows that will be skipped from the resultset
  * @param {type} object.search Where query term
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

    let query = this.runner().collection(this.collectionQualifiedName)

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
      query = query.find({ }, queryOptions)
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

    const ret = await this.runner().collection(this.collectionQualifiedName)
      .deleteOne({ _id: String(id)})

    return ret.result.ok === 1
  }

    /**
  *
  * Delete entity by ID
  *
  * @param {type}  object.filter Filter items to list
  *
  * @return {type} True when success
  */
     async deleteMany(options = { filter, project, skip, limit, sort }) {

      options.filter = options.filter || null

      let query = this.runner().collection(this.collectionQualifiedName)

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

      return ret.result.ok === 1
    }
}
