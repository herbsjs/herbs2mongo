const Convention = require('./convention')
const { entity, checker } = require('@herbsjs/herbs')
const dependency = { convention: Convention }

class DataMapper {

  constructor(entity, entityIDs = [], options = {}) {
    const di = Object.assign({}, dependency, options.injection)
    this.convention = di.convention
    this.entity = entity
    const schema = entity.prototype.meta.schema
    this.allFields = DataMapper.buildAllFields(schema, entityIDs, this.convention)
    this._proxy === undefined
  }

  toEntity(payload) {

    if (payload._id) {
      payload.id = payload._id.toString()
      delete payload._id
    }

    if (this._proxy === undefined) this._proxy = this.buildProxy()
    this._proxy.load(payload)
    return this.entity.fromJSON(this._proxy, { allowExtraKeys: true })
  }

  static buildAllFields(schema, entityIDs, convention) {

    function fieldType(type) {
      if (Array.isArray(type)) return fieldType(type[0])
      return type
    }

    const fields = Object.keys(schema)
      .map((field) => {
        if (typeof schema[field] === 'function') return { type: Function }
        const isArray = Array.isArray(schema[field].type)
        const type = fieldType(schema[field].type)
        const isEntity = entity.isEntity(type)
        const nameDb = convention.toCollectionFieldName(field)
        const isID = entityIDs.includes(field)
        return { name: field, type, isEntity, nameDb, isArray, isID }
      })

    const allFields = fields.filter((f) => f.type !== Function)

    return allFields
  }

  toCollectionFieldName(entityFieldName) {
    return this.convention.toCollectionFieldName(entityFieldName)
  }

  collectionIDs() {
    return this.allFields.filter((i) => i.isID).map(i => this.convention.toCollectionFieldName(i.name))
  }

  collectionFields() {
    return this.allFields
      .map((i) => i.nameDb)
  }

  isNotNullOrUndefined(field, instance) {
    if (instance[field.name] === null || instance[field.name] === undefined) return false
    return true
  }

  transformField(field, instance) {
    if (field.isEntity) {
      const entityToFilter = instance[field.name]
      const parsedEntity = Object.keys(entityToFilter).reduce((acc, key) => {
        if (entityToFilter[key] === null || entityToFilter[key] === undefined) return acc

        acc[key] = entityToFilter[key]

        return acc
      }, {})

      return { [field.nameDb]: parsedEntity }
    }
    return { [field.nameDb]: instance[field.name] }
  }

  collectionFieldsWithValue(instance) {

    let collectionFields = this.allFields
      .filter((field) => this.isNotNullOrUndefined(field, instance))
      .map((field) => this.transformField(field, instance))
      .reduce((acc, current) => ({ ...acc, ...current }), {})

    if (instance.id === undefined) {
      delete instance.id
      delete collectionFields.id
    }
    else {
      collectionFields._id = instance.id
      delete collectionFields.id
    }

    return collectionFields
  }

  buildProxy() {

    function getDataParser(type, isArray) {
      function arrayDataParser(value, parser) {
        if (checker.isEmpty(value)) return null
        return value.map((i) => parser(i))
      }

      function dataParser(value, parser) {
        if (value === null) return null
        return parser(value)
      }

      if (isArray) {
        const parser = getDataParser(type, false)
        return (value) => arrayDataParser(value, parser)
      }

      if ((type === Date) || (!convention.isScalarType(type)))
        return (x) => x

      return (value) => dataParser(value, type)
    }

    const convention = this.convention
    const proxy = {}

    Object.defineProperty(proxy, '_payload', {
      enumerable: false,
      wricollection: true,
      writable: true,
      value: null
    })

    Object.defineProperty(proxy, 'load', {
      enumerable: false,
      value: function load(payload) { this._payload = payload },
    })

    for (const field of this.allFields) {
      const parser = getDataParser(field.type, field.isArray)
      const nameDb = field.nameDb
      Object.defineProperty(proxy, field.name, {
        enumerable: true,
        get: function () {
          if (field.isEntity && !field.isArray) {
            const entity = this._payload[field.nameDb]

            if (checker.isEmpty(entity)) return undefined

            const object = field.type.schema.fields.reduce((obj, entityField) => {
              const fieldNameDb = convention.toCollectionFieldName(entityField.name)
              const fieldParser = getDataParser(entityField.type, Array.isArray(entityField.type))

              obj[entityField.name] = fieldParser(this._payload[field.nameDb][fieldNameDb])
              return obj
            }, {})

            return object
          }
          return parser(this._payload[nameDb])
        }
      })
    }
    return proxy
  }
}

module.exports = DataMapper
