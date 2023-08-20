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
        if (typeof schema[field] === 'function') return null

        const isArray = Array.isArray(schema[field].type)
        const type = fieldType(schema[field].type)
        const isEntity = entity.isEntity(type)
        const nameDb = convention.toCollectionFieldName(field)

        const isID = entityIDs.includes(field)

        const object = { name: field, type, isEntity, nameDb, isArray, isID }

        if(isEntity) {
          const entitySchema = isArray
            ? schema[field].type[0].prototype.meta.schema
            : schema[field].type.prototype.meta.schema
          object.children = this.buildAllFields(entitySchema, [], convention)
        }
        
        return object
      })
      .filter(Boolean)

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
      return { [field.nameDb]: this.parseEntity(field, instance[field.name]) }
    }

    return { [field.nameDb]: instance[field.name] }
  }

  parseEntity(field, value) {
    if (field.isArray && checker.isArray(value)) {
      const parsedArray = value.map(item => this.parseEntity(field, item))
      return parsedArray.reduce((acc, curr, index) => {
        acc[index] = curr
        return acc
      }, {})
    }    

    if(field.isEntity) {
      const parsedEntity = Object.keys(value).reduce((acc, key) => {
        if (value[key] === null || value[key] === undefined) return acc
    
          const childField = field.children.find((i) => i.name === key)
  
          if(childField?.isEntity) {
            acc[childField.nameDb] = this.parseEntity(childField, value[key])

            return acc
          }
  
        acc[childField.nameDb] = value[key]
  
        return acc
      }, {})

      return parsedEntity
    }
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

    function getDataParser(type, isArray, isArrayOfEntities, field) {
      function arrayDataParser(value, parser) {
        if (checker.isEmpty(value)) return null
        return value.map((i) => parser(i))
      }

      function dataParser(value, parser) {
        if (value === null) return null
        return parser(value)
      }

      if (isArray && !isArrayOfEntities) {
        const parser = getDataParser(type, false)
        return (value) => arrayDataParser(value, parser)
      }

      if(isArrayOfEntities) {
        return (value) => {
          if (checker.isEmpty(value)) return null
          return value?.map((item) => {
            const object = Object.keys(item).reduce((obj, key) => {
              const childField = field?.children.find((i) => i.nameDb === key)

              if(childField.isEntity) {
                obj[childField.name] = processEntity(childField, item)

                return obj
              }

              const parser = getDataParser(field.type, false)
              obj[childField.name] = parser(item[childField.nameDb])

              return obj
            }, {})
            return object
          })
        }
      }

      if ((type === Date) || (!convention.isScalarType(type)))
        return (x) => x

      return (value) => dataParser(value, type)
    }

    const convention = this.convention
    const proxy = {}

    function processEntity (field, payload) {
      const entityValue = payload[field.nameDb]

      if (checker.isEmpty(entityValue)) return undefined

      const object = field.type.schema.fields.reduce((obj, entityField) => {
        const fieldNameDb = convention.toCollectionFieldName(entityField.name)

        const isEntity = entity.isEntity(entityField.type)

        if(isEntity) {
          const childField = field?.children.find((i) => i.name === entityField.name)

          if(childField.isArray) {
            const arrayOfEntityParser = getDataParser(childField.type, childField.isArray, childField.isEntity, childField)
            obj[entityField.name] = arrayOfEntityParser(payload[field.nameDb][fieldNameDb])

            return obj
          }

          obj[entityField.name] = processEntity(childField, payload[field.nameDb])

          return obj
        }

        const fieldParser = getDataParser(entityField.type, Array.isArray(entityField.type))

        obj[entityField.name] = fieldParser(payload[field.nameDb][fieldNameDb])
        return obj
      }, {})

      return object
    }

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
            return processEntity(field, this._payload)
          }

          if(field.isEntity && field.isArray) {
            const arrayOfEntityParser = getDataParser(field.type, field.isArray, field.isEntity, field)
            return arrayOfEntityParser(this._payload[nameDb])
          }

          return parser(this._payload[nameDb])
        }
      })
    }
    return proxy
  }
}

module.exports = DataMapper
