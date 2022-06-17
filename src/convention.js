module.exports = class Convention {

    static camelToSnake(string) {
        return string.replace(/([A-Z])/g, "_$1").toLowerCase()
    }

    static toCollectionFieldName(entityField) {
        return this.camelToSnake(entityField)
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
