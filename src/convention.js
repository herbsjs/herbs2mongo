const { ObjectId } = require('mongodb')

module.exports = class Convention {

    static camelToSnake(string) {
        return string.replace(/([A-Z])/g, "_$1").toLowerCase()
    }

    static toCollectionFieldName(entityField) {
        return this.camelToSnake(entityField)
    }

    static toObjectIdArray(stringArray){
        const objectArray = stringArray.map(function(x) { 
          x = ObjectId(x.toString())
          return x
        })
    
        return objectArray
      }
    

    static isScalarType(type) {
        const scalarTypes = [Number, String, Boolean, Date, Object, Array]
        return scalarTypes.includes(type)
    }

    static omit(obj, ...props) {
        const result = { ...obj }
        props.forEach(function (prop) {
            delete result[prop]
        })
        return result
    }

}
