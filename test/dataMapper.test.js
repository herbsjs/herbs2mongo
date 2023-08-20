const DataMapper = require('../src/dataMapper')
const { entity, field } = require('@herbsjs/gotu')
const assert = require('assert')

describe('Data Mapper', () => {

    describe('Simple Entity', () => {

        const givenAnEntity = () => {
            return entity('A entity', {
                idField: field(Number),
                field1: field(Boolean),
                fieldName: field(Boolean)
            })
        }

        it('should create a data mapper', () => {
            //given
            const Entity = givenAnEntity()

            //when
            const dataMapper = new DataMapper(Entity)

            //then
            assert.deepStrictEqual(dataMapper.entity, Entity)
        })

        it('should convert data from collection to entity', () => {
            //given
            const Entity = givenAnEntity()
            const entityIDs = ['idField']
            const dataMapper = new DataMapper(Entity, entityIDs)

            //when
            const toEntity = dataMapper.toEntity({ id_field: 1, field1: true, field_name: false })

            //then
            assert.deepStrictEqual(toEntity.idField, 1)
            assert.deepStrictEqual(toEntity.field1, true)
            assert.deepStrictEqual(toEntity.fieldName, false)
        })

        it('should convert an entity field to the collection string convetion', () => {
            //given
            const Entity = givenAnEntity()
            const entityIDs = ['idField']
            const dataMapper = new DataMapper(Entity, entityIDs)

            //when
            const toEntity = dataMapper.toCollectionFieldName('fieldName')

            //then
            assert.deepStrictEqual(toEntity, 'field_name')
        })

        it('should retrieve collection ID from entity', () => {
            //given
            const Entity = givenAnEntity()
            const entityIDs = ['idField']
            const dataMapper = new DataMapper(Entity, entityIDs)

            //when
            const toEntity = dataMapper.collectionIDs()

            //then
            assert.deepStrictEqual(toEntity, ['id_field'])
        })

        it('should retrieve collection fields', () => {
            //given
            const Entity = givenAnEntity()
            const entityIDs = ['idField']
            const dataMapper = new DataMapper(Entity, entityIDs)

            //when
            const toEntity = dataMapper.collectionFields()

            //then
            assert.deepStrictEqual(toEntity, ['id_field', 'field1', 'field_name'])
        })

        it('should retrieve collection fields with values', () => {
            //given
            const Entity = givenAnEntity()
            const entityInstance = new Entity()
            entityInstance.idField = 1
            entityInstance.field1 = true
            entityInstance.fieldName = false
            const entityIDs = ['idField']
            const dataMapper = new DataMapper(Entity, entityIDs)

            //when
            const toEntity = dataMapper.collectionFieldsWithValue(entityInstance)

            //then
            assert.deepStrictEqual(toEntity, { id_field: 1, field1: true, field_name: false })
        })
    })

    describe('Simple Nested Entity', () => {
        const GreatGreatGrandChildEntity = entity('Great-Grand Child entity', {
            simpleString: field(String),
            simpleBoolean: field(Boolean)
        })

        const GreatGrandChildEntity = entity('Great-Grand Child entity', {
            simpleString: field(String),
            simpleNumber: field(Number),
            simpleStringArray: field([String]),
            greatGreatGrandChild: field([GreatGreatGrandChildEntity])
        })

        const CousinEntity = entity('Cousin entity', {
            greatGrandChildEntity: field(GreatGrandChildEntity)
        })

        const GrandChildEntity = entity('Grand Child entity', {
            greatGrandChild: field(GreatGrandChildEntity),
            cousin: field(CousinEntity)
        })

        const ChildEntity = entity('Child entity', {
            grandChild: field(GrandChildEntity),
            simpleString: field(String)
        })
        

        const givenAnNestedEntity = () => {

            return entity('A nested entity', {
                idField: field(Number),
                field1: field(Boolean),
                childEntity: field(ChildEntity),
                arrayChildEntity: field([ChildEntity])
            })
        }

        it('should convert data from collection to nested entity', () => {
            //given
            const Entity = givenAnNestedEntity()
            const entityIDs = ['idField']
            const dataMapper = new DataMapper(Entity, entityIDs)
            const childEntity = new ChildEntity()
            childEntity.grandChild = new GrandChildEntity()
            childEntity.simpleString = 'String'
            childEntity.grandChild.greatGrandChild = new GreatGrandChildEntity()
            childEntity.grandChild.greatGrandChild.simpleString = 'String'
            childEntity.grandChild.greatGrandChild.simpleStringArray = ['String']
            childEntity.grandChild.greatGrandChild.simpleNumber = 1
            childEntity.grandChild.greatGrandChild.greatGreatGrandChild = [GreatGreatGrandChildEntity.fromJSON({
                simpleString: 'String'
            })]

            //when
            const toEntity = dataMapper.toEntity({
                id_field: 1,
                field1: true,
                child_entity: {
                    grand_child: {
                        great_grand_child: {
                            simple_string: 'String',
                            simple_string_array: [
                                'String'
                            ],
                            simple_number: 1,
                            great_great_grand_child: [
                                {
                                    simple_string: 'String'
                                }
                            ],
                            cousin: null
                        },
                    },
                    simple_string: 'String'
                },
                array_child_entity: [
                    {
                        grand_child: {
                            great_grand_child: {
                                simple_string: 'String',
                                simple_string_array: [
                                    'String'
                                ],
                                simple_number: 1,
                                great_great_grand_child: [
                                    {
                                        simple_string: 'String'
                                    }
                                ]
                            }
                        },
                        simple_string: 'String'
                    }
                ]
            })

            //then
            assert.deepStrictEqual(toEntity.idField, 1)
            assert.deepStrictEqual(toEntity.field1, true)
            assert.deepStrictEqual(toEntity.childEntity, childEntity)
            assert.deepStrictEqual(toEntity.arrayChildEntity, [childEntity])
        })

        it('should retrieve collection fields an nested entity', () => {
            //given
            const Entity = givenAnNestedEntity()
            const entityInstance = new Entity()
            entityInstance.idField = 1
            entityInstance.field1 = true
            entityInstance.childEntity = {
                field1: 'String'
            }
            const entityIDs = ['idField']
            const dataMapper = new DataMapper(Entity, entityIDs)

            //when
            const toEntity = dataMapper.collectionFields()

            //then
            assert.deepStrictEqual(toEntity, ['id_field', 'field1', 'child_entity', 'array_child_entity'])
        })

        it('should retrieve collection fields with values of an nested entity', () => {
            //given
            const Entity = givenAnNestedEntity()
            const entityInstance = new Entity()
            entityInstance.idField = 1
            entityInstance.field1 = true
            entityInstance.childEntity = {
                grandChild: {
                    greatGrandChild: {
                        simpleString: 'String',
                        greatGreatGrandChild: [
                            {
                                simpleString: 'String'
                            }
                        ],
                        cousin: null
                    }
                },
                simpleString: 'String'
            }
            entityInstance.arrayChildEntity = [
                {
                    grandChild: {
                        greatGrandChild: {
                            simpleString: 'String'
                        }
                    },
                    simpleString: 'String'
                }
            ]
            const entityIDs = ['idField']
            const dataMapper = new DataMapper(Entity, entityIDs)

            //when
            const toEntity = dataMapper.collectionFieldsWithValue(entityInstance)

            //then
            assert.deepStrictEqual(toEntity, {
                id_field: 1,
                field1: true,
                child_entity: {
                    grand_child: {
                        great_grand_child: {
                            simple_string: 'String',
                            great_great_grand_child: {
                                '0': {
                                    simple_string: 'String'
                                }
                            }
                        }
                    },
                    simple_string: 'String'
                },
                array_child_entity: {
                    0: {
                        grand_child: {
                            great_grand_child: {
                                simple_string: 'String'
                            }
                        },
                        simple_string: 'String'
                    }
                }
            })
        })

        it('should retrieve collection fields with values of an nested entity with child entity as empty object', () => {
            //given
            const Entity = givenAnNestedEntity()
            const entityInstance = new Entity()
            entityInstance.idField = 1
            entityInstance.field1 = true
            entityInstance.childEntity = {}
            const entityIDs = ['idField']
            const dataMapper = new DataMapper(Entity, entityIDs)

            //when
            const toEntity = dataMapper.collectionFieldsWithValue(entityInstance)

            //then
            assert.deepStrictEqual(toEntity, { id_field: 1, field1: true, child_entity: {} })
        })
    })

    describe('Complex Entity - Multiple Types', () => {

        const givenAnComplexEntity = () => {
            const ParentEntity = entity('A parent entity', {})

            return entity('A entity', {
                id: field(Number),
                name: field(String, {
                    validation: { presence: true, length: { minimum: 3 } }
                }),
                numberTest: field(Number),
                stringTest: field(String),
                booleanTest: field(Boolean),
                dateTest: field(Date),
                objectTest: field(Object),
                entityTest: field(ParentEntity),
                // TODO
                // arrayTest: field(Array),
                numbersTest: field([Number]),
                stringsTest: field([String]),
                booleansTest: field([Boolean]),
                datesTest: field([Date]),
                objectsTest: field([Object]),
                // arraysTest:field([Array]),
                entitiesTest: field([ParentEntity]),
                functionTest() { return 1 }
            })
        }

        it('should convert data from collection to entity', () => {
            //given
            const Entity = givenAnComplexEntity()
            const samples = [
                ['id', 'id', 1],
                ['name', 'name', "clare"],
                ['number_test', 'numberTest', 1],
                ['string_test', 'stringTest', "s1"],
                ['boolean_test', 'booleanTest', true],
                ['date_test', 'dateTest', new Date()],
                ['object_test', 'objectTest', { x: 1 }],
                // TODO
                // ['array_test', 'arrayTest', [1]]
                ['numbers_test', 'numbersTest', [1, 2]],
                ['strings_test', 'stringsTest', ["s1", "s2"]],
                ['booleans_test', 'booleansTest', [true, false]],
                ['dates_test', 'datesTest', [new Date(), new Date()]],
                ['objects_test', 'objectsTest', [{ x: 1 }, { y: 2 }]],
                // ['arrays_test', 'arraysTest', [[1]]]
            ]

            //when
            const dataMapper = new DataMapper(Entity)
            const data = samples.map(i => { return { [i[0]]: i[2] } }).reduce((obj, i) => Object.assign(obj, i))
            const toEntity = dataMapper.toEntity(data)

            //then
            samples.map(i => {
                assert.deepStrictEqual(toEntity[i[1]], i[2])
            })

        })

        it('should return null from collection to entity', () => {
            //given
            const Entity = givenAnComplexEntity()
            const samples = [
                ['id', 'id', null],
                ['name', 'name', null],
                ['number_test', 'numberTest', null],
                ['string_test', 'stringTest', null],
                ['boolean_test', 'booleanTest', null],
                ['date_test', 'dateTest', null],
                ['object_test', 'objectTest', null],
                // TODO
                // ['array_test', 'arrayTest', [null]]
                ['numbers_test', 'numbersTest', null],
                ['strings_test', 'stringsTest', [null, null]],
                ['booleans_test', 'booleansTest', [null, null]],
                ['dates_test', 'datesTest', [null, null]],
                ['objects_test', 'objectsTest', [null, null]],
                // ['arrays_test', 'arraysTest', [[null]]]
            ]

            //when
            const dataMapper = new DataMapper(Entity)
            const data = samples.map(i => { return { [i[0]]: i[2] } }).reduce((obj, i) => Object.assign(obj, i))
            const toEntity = dataMapper.toEntity(data)

            //then
            samples.map(i => {
                assert.deepStrictEqual(toEntity[i[1]], i[2])
            })

        })
    })
})
