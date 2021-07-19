[![CI build](https://github.com/herbsjs/herbs2mongo/actions/workflows/on_push.yml/badge.svg?branch=master)](https://github.com/herbsjs/herbs2mongo/actions/workflows/on_push.yml)
[![codecov](https://codecov.io/gh/herbsjs/herbs2mongo/branch/master/graph/badge.svg)](https://codecov.io/gh/herbsjs/herbs2mongo)

# herbs2mongo

herbs2mongo creates repositories to retrieve and store [Entities](https://github.com/herbsjs/gotu) using [MongoDB](https://docs.mongodb.com/drivers/node/current/).

### Installing
```
    $ npm install @herbsjs/herbs2mongo
```

### Using

`connection.js` - MongoDB initialization:
```javascript
const {MongoClient,Logger} = require('mongodb')
const config = require('./config')

let dbInstance = null

module.exports = async () => {
  if (dbInstance) {
      return new Promise((resolve) => resolve(dbInstance))
  }
  const client = await new MongoClient(config.connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  }).connect()
  dbInstance = client.db(config.databaseName)
  Logger.setLevel("debug") // set this if you want to debug all queries
  return dbInstance
}

```

`itemRepository.js`:
```javascript
const { Repository } = require('@herbsjs/herbs2mongo')
const connection = require('connection')
const { Item } = require('../domain/entities/item')

class ItemRepository extends Repository {
    constructor() {
        super({
            entity: Item,
            collection: 'aCollection',
            ids: ['id'],
            mongodb: await connection()
        })
    }

    excludedItemFromLastWeek() {
        ...
    }
}
```

`someUsecase.js`:
```javascript
const repo = new ItemRepository()
const ret = await repo.findByID('60edc25fc39277307ca9a7ff') // note that the id is equivalent to ObjectId _id field
```

### What is a Repository?

A repository, by [definition](https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks), is part of the layer to retrieve and store entities abstracting the underlying implementation. By using repositories, details of these implementation such as relational database, document-oriented databases, etc, should not leak to the domain code. In other words, no raw SQL queries on your use case or entity files.

### herbs2Mongo Repository

In order to boost productivity herbs2Mongo provides way to dynamically generate a repository class based on your Entities and other metadata.

These metadata are necessary to close the gap between OOP concepts and paradigms and those of relational databases. For example, it is necessary to specify primary keys and foreign keys as these information do not exist in the description of your domain.

Following Herbs architecture principals it is not the intention of this lib to create yet another ORM or query builder but to create a bridge between your domain and an existing one (from Mongo).

### Why Mongo oficial Driver?

herbs2Mongo is just one of many bridges possible between Herbs and other packages.

### Repository setup

```javascript
const { Repository } = require('@herbsjs/herbs2mongo')
const connection = require('connection')  // Mongo initialize instance
const { ProductItem } = require('../domain/entities/productItem')

class YourRepository extends Repository {
    constructor() {
        super({
            entity: ProductItem,
            collection: 'product_items',
            ids: ['id'],
            mongodb: await connection()
        })
    }
}
```

- `entity` - The [Entity](https://github.com/herbsjs/gotu) to be used as reference

    ```javascript
    entity: ProductItem
    ```

- `collection` - The name of the collection in database

    ```javascript
    collection: 'product_items'
    ```

- `ids` - Primary keys

    Format: `['fieldName', 'fieldName', ...]`

    There must be corresponding fields in the entity.

    ```javascript
    ids: ['id']  // productItem.id
    ```

    or for composite primary key:

    ```javascript
    ids: [`customerId`, `productId`]  // productItem.customerId , productItem.productId
    ```

- `mongoDB` - mongoDB driver initialize instance

    Check mongoDB [documentation](https://docs.mongodb.com/drivers/node/v3.6/)

